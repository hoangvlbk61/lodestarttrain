import {
  ChevronRight,
  Scissors,
  SearchCode,
  Calculator,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  X,
} from 'lucide-react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  calculateApi,
  type ParsedBet,
  type ParseResponse,
  type FinalizeResponse,
  type FinalizedBet,
  type SummaryGroup,
} from '@/lib/api/calculate'
import FinalizeResults from '@/components/FinalizeResults';
// ─── Constants ───────────────────────────────────────────────────────────────
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Calendar } from '@/components/ui/calendar';
import { customerApi } from '@/lib/api/customers';
import type { Customer } from '@/types/customer';

import { format, isAfter, startOfToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { CustomerFormData, defaultForm as defaultCustomerConfig } from '../customers'


const CATEGORY_ORDER = ['de', 'lo', 'xien2', 'xien3', 'xien4'] as const
const CATEGORY_LABELS: Record<string, string> = {
  de: 'Đề',
  lo: 'Lô',
  xien2: 'Xiên 2',
  xien3: 'Xiên 3',
  xien4: 'Xiên 4',
  unknown: 'Không rõ',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBet(item: ParsedBet): string {
  if (item.numbers) {
    return `[${item.numbers.join(', ')}] x${item.amount}${item.subType === 'xq' ? ' (XQ)' : ''}`
  }
  return `${item.number} x${item.amount}`
}

function getCategory(bet: ParsedBet): string {
  if (bet.type === 'de' || bet.type === 'lo') return bet.type
  if (bet.type === 'xien' && bet.numbers) return `xien${bet.numbers.length}`
  if (bet.type.startsWith('xien')) return bet.type
  return 'unknown'
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CalculatePage() {
  // ==================== NEW STATE ====================
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  // ==================== OLD STATES ====================
  const [inputText, setInputText] = useState('');
  const [splitLines, setSplitLines] = useState<string[] | null>(null);
  const [splitErrors, setSplitErrors] = useState<Set<number>>(new Set());
  const [parseData, setParseData] = useState<ParseResponse | null>(null);
  const [finalizeData, setFinalizeData] = useState<FinalizeResponse | null>(null);

  const [loadingSplit, setLoadingSplit] = useState(false);
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingFinalize, setLoadingFinalize] = useState(false);
  const [loadingFetchXS, setLoadingFetchXS] = useState(false);
  const [completedStep, setCompletedStep] = useState(0);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  const [config, setCalConfig] = useState<CustomerFormData>(defaultCustomerConfig)

  const updateConfig = (key: string, val: string) => {
    const newCfg = {
      ...config,
      [key]: val
    }
    setCalConfig(newCfg)
  }
  // Load danh sách khách hàng
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await customerApi.getAll();
        setCustomers(data);
      } catch (err) {
        toast.error('Không tải được danh sách khách hàng');
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    let newConfig = {...config};
    if (selectedCustomer) {
      const prices = selectedCustomer.prices
      const rewards = selectedCustomer.rewards
      if (prices) {
        const { de, lo, x2, x3, x4, baCang, xiuNhay } = prices;
        newConfig = {
          ...newConfig,
          phe_de: de,
          phe_lo: lo,
          phe_x2: x2,
          phe_x3: x3,
          phe_x4: x4,
          phe_xn: baCang,
          phe_bc: xiuNhay,
        }
      }
      if (rewards) {
        const { thuongDe, thuongLo, thuongX2, thuongX3, thuongX4 } = rewards;
        newConfig = {
          ...newConfig,
          thuong_de: thuongDe,
          thuong_lo: thuongLo,
          thuong_x2: thuongX2,
          thuong_x3: thuongX3,
          thuong_x4: thuongX4,
        }
      }
    }
    setCalConfig(newConfig)
  }, [selectedCustomer])

  // ── Step 1: Tách tin ──
  const handleSplit = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error('Vui lòng nhập nội dung tin nhắn');
      return;
    }
    setLoadingSplit(true);
    setParseData(null);
    setFinalizeData(null);
    setSplitErrors(new Set());
    try {
      const res = await calculateApi.split(inputText);
      const { lines } = res.data;
      setSplitLines(lines);
      setCompletedStep(1);
      toast.success(`Tách tin thành công: ${lines.length} dòng`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tách tin');
    } finally {
      setLoadingSplit(false);
    }
  }, [inputText]);

  // ── Step 2: Phân tích ── (giữ nguyên)
  const handleParse = useCallback(async () => {
    if (!splitLines || splitLines.length === 0) {
      toast.error('Chạy Bước 1 trước');
      return;
    }
    setLoadingParse(true);
    setFinalizeData(null);
    try {
      const res = await calculateApi.parse(splitLines);
      const data = res.data;
      
      const grouped = data.grouped; 
      const groupKeys = Object.keys(grouped);
      const newGrouped = {}; 
      for(let i = 0; i < groupKeys.length; i ++) {
        const k = groupKeys[i]; 
        if(CATEGORY_ORDER.includes(k)) 
          newGrouped[k] = grouped[k]
        else if(CATEGORY_ORDER.includes(k.slice(0, 2))) 
          newGrouped[k.slice(0, 2)] = grouped[k]
      }
      data.grouped = newGrouped;
      setParseData(data);

      const errorIndices = new Set<number>();
      data.parsed.forEach((bet) => {
        if (!bet.isValid && bet.originalLine) {
          const idx = splitLines.findIndex((l) => l === bet.originalLine);
          if (idx >= 0) errorIndices.add(idx);
        }
      });
      setSplitErrors(errorIndices);
      setCompletedStep(2);
      

      const msg = `${data.validBets} hợp lệ / ${data.totalBets} tổng`;
      if (data.invalidBets > 0) {
        toast.warning(`Phân tích xong: ${msg} (${data.invalidBets} lỗi)`);
      } else {
        toast.success(`Phân tích thành công: ${msg}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi phân tích');
    } finally {
      setLoadingParse(false);
    }
  }, [splitLines]);

  // ── Step 3: Tính tiền ── (giữ nguyên)
  const handleFinalize = useCallback(async () => {
    if (!parseData?.parsed || parseData.parsed.length === 0) {
      toast.error('Chạy Bước 2 trước');
      return;
    }
    const dateStr = format(date, 'dd-MM-yyyy');

    setLoadingFinalize(true);
    try {
      const res = await calculateApi.finalize(parseData.parsed, dateStr);
      setFinalizeData(res.data);
      setCompletedStep(3);
      setShowResultDialog(true);
      toast.success(`Tính tiền xong — Trúng ${res.data.totalWin}/${res.data.totalBets}`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tính tiền');
    } finally {
      setLoadingFinalize(false);
    }
  }, [parseData, date]);

  const handleFetchXS = useCallback(async () => {
    setLoadingFetchXS(true);
    try {
      const res = await calculateApi.fetchResults();
      toast.success(`Cập nhật KQXS thành công`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật KQXS');
    } finally {
      setLoadingFetchXS(false);
    }
  }, []);

  const handleReset = () => {
    setSplitLines(null);
    setSplitErrors(new Set());
    setParseData(null);
    setFinalizeData(null);
    setCompletedStep(0);
  };

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Tính tiền</h1>
        </div>

        <div className='space-y-4'>
          {/* === CẤU HÌNH === */}
          <Card>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
                {/* Chọn Khách hàng - ĐÃ SỬA */}
                <div className='space-y-2'>
                  <Label>Khách hàng:</Label>
                  <select
                    className="w-full border rounded-md p-2.5 focus-visible:ring-indigo-500"
                    value={selectedCustomer?._id || ''}
                    onChange={(e) => {
                      const customer = customers.find(c => c._id === e.target.value);
                      setSelectedCustomer(customer || null);
                    }}
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.customerId} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker - ĐÃ SỬA */}
                <div className='space-y-2'>
                  <Label>Ngày:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        disabled={(date) => isAfter(date, startOfToday())}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='flex items-center space-x-4 pb-2'>
                  <RadioGroup defaultValue='nhan' className='flex space-x-2'>
                    <div className='flex items-center space-x-1'>
                      <RadioGroupItem value='nhan' id='r1' />
                      <Label htmlFor='r1'>Nhận về</Label>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <RadioGroupItem value='chuyen' id='r2' />
                      <Label htmlFor='r2'>Chuyển đi</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className='space-y-2'>
                  <Label>Phần trăm(%):</Label>
                  <Input defaultValue='100' />
                </div>
              </div>

              <Separator className='my-4' />

              <div className='grid grid-cols-2 md:grid-cols-7 gap-3 mb-3'>
                <div><Label>Phế Đề</Label><Input value={config.phe_de || '0.72'} onChange={e => updateConfig("phe_de", e.target.value)} /></div>
                <div><Label>Phế Lô</Label><Input value={config.phe_lo || '21.7'} onChange={e => updateConfig("phe_lo", e.target.value)} /></div>
                <div><Label>Phế X2</Label><Input value={config.phe_x2 || '0.56'} onChange={e => updateConfig("phe_x2", e.target.value)} /></div>
                <div><Label>Phế X3</Label><Input value={config.phe_x3 || '0.56'} onChange={e => updateConfig("phe_x3", e.target.value)} /></div>
                <div><Label>Phế X4</Label><Input value={config.phe_x4 || '0.56'} onChange={e => updateConfig("phe_x4", e.target.value)} /></div>
                <div><Label>Phế BC</Label><Input value={ '0.72'} onChange={e => updateConfig("phe_bc", e.target.value)} /></div>
                <div><Label>Phế XN</Label><Input value={ '1.1'} onChange={e => updateConfig("phe_xn", e.target.value)} /></div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-7 gap-3'>
                <div><Label className='text-xs'>Thưởng Đề:</Label><Input value={config.thuong_de || '70'} onChange={e => updateConfig("thuong_de", e.target.value)} /></div>
                <div><Label className='text-xs'>Thưởng Lô:</Label><Input value={config.thuong_lo || '80'} onChange={e => updateConfig("thuong_lo", e.target.value)} /></div>
                <div><Label className='text-xs'>Thưởng X2:</Label><Input value={config.thuong_x2 || '10'} onChange={e => updateConfig("thuong_x2", e.target.value)} /></div>
                <div><Label className='text-xs'>Thưởng X3:</Label><Input value={config.thuong_x3 || '40'} onChange={e => updateConfig("thuong_x3", e.target.value)} /></div>
                <div><Label className='text-xs'>Thưởng X4:</Label><Input value={config.thuong_x4 || '100'} onChange={e => updateConfig("thuong_x4", e.target.value)} /></div>
                <div><Label className='text-xs'>BC:</Label><Input value='400' /></div>
              </div>
            </CardContent>
          </Card>

          {/* ═══ THANH NÚT CHỨC NĂNG — luôn hiển thị ═══ */}
          <div className='flex flex-wrap items-center gap-2'>
            {/* Bước 1 */}
            <Button
              size='sm'
              className='bg-indigo-600 hover:bg-indigo-700 shadow-sm'
              onClick={handleSplit}
              disabled={loadingSplit}
            >
              {loadingSplit ? (
                <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
              ) : (
                <Scissors className='mr-1.5 h-4 w-4' />
              )}
              Bước 1: Tách tin
              {completedStep >= 1 && (
                <CheckCircle2 className='ml-1.5 h-4 w-4 text-green-300' />
              )}
            </Button>

            <ChevronRight className='h-4 w-4 text-muted-foreground shrink-0' />

            {/* Bước 2 */}
            <Button
              size='sm'
              className='bg-indigo-600 hover:bg-indigo-700 shadow-sm'
              onClick={handleParse}
              disabled={loadingParse || completedStep < 1}
            >
              {loadingParse ? (
                <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
              ) : (
                <SearchCode className='mr-1.5 h-4 w-4' />
              )}
              Bước 2: Phân tích
              {completedStep >= 2 && (
                <CheckCircle2 className='ml-1.5 h-4 w-4 text-green-300' />
              )}
            </Button>

            <ChevronRight className='h-4 w-4 text-muted-foreground shrink-0' />

            {/* Bước 3 */}
            <Button
              size='sm'
              variant='outline'
              className='border-indigo-600 text-indigo-600 hover:bg-indigo-50'
              onClick={handleFinalize}
              disabled={loadingFinalize || completedStep < 2}
            >
              {loadingFinalize ? (
                <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
              ) : (
                <Calculator className='mr-1.5 h-4 w-4' />
              )}
              Bước 3: Tính toán
              {completedStep >= 3 && (
                <CheckCircle2 className='ml-1.5 h-4 w-4 text-green-600' />
              )}
            </Button>

            <ChevronRight className='h-4 w-4 text-muted-foreground shrink-0' />

            {/* Bước 4 */}
            <Button
              size='sm'
              variant='outline'
              className='border-green-600 text-green-600 hover:bg-green-50'
              disabled={completedStep < 3}
            >
              <Save className='mr-1.5 h-4 w-4' />
              Bước 4: Lưu dữ liệu
            </Button>

            {/* Spacer */}
            <div className='flex-1' />

            {/* Xem kết quả (nếu đã có) */}
            {finalizeData && (
              <Button
                size='sm'
                variant='ghost'
                onClick={() => setShowResultDialog(true)}
                className='text-indigo-600'
              >
                <Trophy className='mr-1.5 h-4 w-4' />
                Xem kết quả
              </Button>
            )}

            {/* Cập nhật KQXS */}
            <Button
              size='sm'
              className='bg-blue-600 hover:bg-blue-700'
              onClick={handleFetchXS}
              disabled={loadingFetchXS}
            >
              {loadingFetchXS ? (
                <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-1.5 h-4 w-4' />
              )}
              Cập nhật kết quả XS
            </Button>
          </div>

          {/* ═══ 2 cột: Nhập liệu + Kết quả phân tích ═══ */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4' style={{ height: 'calc(100vh - 420px)', minHeight: '300px' }}>

            {/* ── CỘT TRÁI ── */}
            <div className='flex flex-col h-full min-h-0'>
              {!splitLines ? (
                <Textarea
                  placeholder='Nhập nội dung tin nhắn vào đây...'
                  className='flex-1 border-gray-300 resize-none focus-visible:ring-indigo-500 font-mono text-sm'
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              ) : (
                <div className='flex flex-col h-full min-h-0'>
                  <div className='flex items-center justify-between px-3 py-1.5 border border-b-0 rounded-t-md bg-muted/30 shrink-0'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Tách tin: {splitLines.length} dòng
                      {splitErrors.size > 0 && (
                        <span className='text-red-500 ml-2'>({splitErrors.size} lỗi)</span>
                      )}
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 text-xs px-2'
                      onClick={handleReset}
                    >
                      <X className='h-3 w-3 mr-1' /> Sửa lại
                    </Button>
                  </div>
                  <ScrollArea
                    ref={leftPanelRef}
                    className='flex-1 border rounded-b-md bg-background min-h-0'
                  >
                    <div className='p-3 space-y-1 font-mono text-sm'>
                      {splitLines.map((line, i) => {
                        const hasError = splitErrors.has(i)
                        return (
                          <div
                            key={i}
                            className={`flex items-start gap-2 px-2 py-1 rounded ${hasError
                              ? 'bg-red-50 dark:bg-red-950/30'
                              : 'hover:bg-muted/40'
                              }`}
                          >
                            <span className='text-muted-foreground text-xs w-5 shrink-0 pt-0.5 text-right'>
                              {i + 1}
                            </span>
                            <span
                              className={
                                hasError
                                  ? 'text-red-600 dark:text-red-400 font-medium'
                                  : ''
                              }
                            >
                              {line}
                            </span>
                            {hasError && (
                              <XCircle className='h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5' />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* ── CỘT PHẢI ── */}
            <div className='flex flex-col h-full min-h-0'>
              {!parseData ? (
                <div className='flex-1 border rounded-md bg-muted/10 flex items-center justify-center'>
                  <span className='text-muted-foreground text-sm'>
                    {completedStep < 1
                      ? 'Nhập tin nhắn rồi ấn Bước 1 → Bước 2...'
                      : 'Ấn Bước 2: Phân tích để xem kết quả'}
                  </span>
                </div>
              ) : (
                <div className='flex flex-col h-full min-h-0'>
                  <div className='flex items-center justify-between px-3 py-1.5 border border-b-0 rounded-t-md bg-muted/30 shrink-0'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Phân tích: {parseData.validBets} hợp lệ / {parseData.totalBets} tổng
                      {parseData.invalidBets > 0 && (
                        <span className='text-red-500 ml-1'>({parseData.invalidBets} lỗi)</span>
                      )}
                    </span>
                  </div>
                  <ScrollArea
                    ref={rightPanelRef}
                    className='flex-1 border rounded-b-md bg-background min-h-0'
                  >
                    <div className='p-3 space-y-4 font-mono text-sm'>
                      {CATEGORY_ORDER.map((cat) => {
                        const items = parseData.grouped[cat]
                        if (!items || items.length === 0) return null
                        return (
                          <div key={cat}>
                            <div className='flex items-center gap-2 mb-1.5'>
                              <Badge variant='outline' className='text-xs font-semibold'>
                                {CATEGORY_LABELS[cat]}
                              </Badge>
                              <span className='text-xs text-muted-foreground'>
                                {items.length} con
                              </span>
                            </div>
                            <div className='space-y-0.5 ml-2'>
                              {items.map((item, j) => (
                                <div
                                  key={j}
                                  className={`flex items-center gap-2 px-2 py-0.5 rounded ${!item.isValid
                                    ? 'bg-red-50 dark:bg-red-950/30'
                                    : 'hover:bg-muted/30'
                                    }`}
                                >
                                  {item.isValid ? (
                                    <CheckCircle2 className='h-3 w-3 text-green-500 shrink-0' />
                                  ) : (
                                    <XCircle className='h-3 w-3 text-red-500 shrink-0' />
                                  )}
                                  <span className={!item.isValid ? 'text-red-600 dark:text-red-400' : ''}>
                                    {formatBet(item)}
                                  </span>
                                  {item.error && (
                                    <span className='text-xs text-red-400 ml-auto'>
                                      {item.error}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}

                      {parseData.grouped['unknown'] &&
                        parseData.grouped['unknown'].length > 0 && (
                          <div>
                            <Badge variant='destructive' className='text-xs mb-1.5'>
                              Không nhận dạng
                            </Badge>
                            <div className='space-y-0.5 ml-2'>
                              {parseData.grouped['unknown'].map((item, j) => (
                                <div
                                  key={j}
                                  className='flex items-center gap-2 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/30'
                                >
                                  <XCircle className='h-3 w-3 text-red-500 shrink-0' />
                                  <span className='text-red-600 dark:text-red-400'>
                                    {item.originalLine || item.number}
                                  </span>
                                  <span className='text-xs text-red-400 ml-auto'>
                                    {item.error}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </div>
      </Main>

      {/* ═══ DIALOG KẾT QUẢ TÍNH TIỀN ═══ */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className='max-w-2xl max-h-[85vh] flex flex-col overflow-hidden'>
          <DialogHeader className='shrink-0'>
            <DialogTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-amber-500' />
              Kết quả tính tiền
              {finalizeData && (
                <Badge variant='outline' className='ml-2 text-xs'>
                  KQXS ngày {finalizeData.kqxs.date}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {finalizeData && (
            <div className='flex-1 min-h-0 overflow-auto -mx-6 px-6'>
              <div className='space-y-5 pb-4'>

                {/* KQXS tóm tắt */}
                <div className='rounded-lg bg-muted/40 p-3 text-sm'>
                  <div className='flex flex-wrap gap-x-6 gap-y-1'>
                    <span>
                      <span className='text-muted-foreground'>Đề (ĐB):</span>{' '}
                      <span className='font-bold text-lg text-red-600'>
                        {finalizeData.kqxs.deLast2}
                      </span>
                    </span>
                    <span>
                      <span className='text-muted-foreground'>Lô (2 số cuối):</span>{' '}
                      <span className='font-mono text-xs'>
                        {finalizeData.kqxs.allLast2.join(', ')}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Danh sách chi tiết các bets */}
                {Object.entries(finalizeData.summary).map(([cat, group]) => {
                  const bets = finalizeData.finalized.filter(
                    (b) => {
                      if (b.isDan) {
                        const danKey = `${b.danType}${b.danValue !== undefined ? ' ' + b.danValue : ''}`;
                        return `${b.type}_${danKey}` === cat;
                      }
                      return b.type === cat;
                    }
                  );

                  const displayLabel = group.isDan
                    ? `${group.label} (${group.danType}${group.danValue ? ' ' + group.danValue : ''})`
                    : group.label;

                  return (
                    <div key={cat}>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge
                          variant={group.totalWin > 0 ? 'default' : 'secondary'}
                          className={group.totalWin > 0 ? 'bg-red-600' : ''}
                        >
                          {displayLabel}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          {group.totalWin > 0 ? (
                            <span className='text-red-600 font-medium'>
                              {group.totalWin}
                            </span>
                          ) : (
                            <span>0</span>
                          )}
                          /{group.totalBet}
                        </span>
                      </div>
                      <div className='ml-2 space-y-0.5'>
                        {bets.map((bet, j) => (
                          <ResultRow key={j} bet={bet} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* TỔNG KẾT - CHỈ 5 Ô CƠ BẢN */}
                <Separator />
                <div className='rounded-lg border-2 border-dashed p-4'>
                  <h4 className='font-semibold mb-3 text-sm'>Tổng kết</h4>
                

    {/* ==================== TỔNG KẾT TOÀN BỘ ==================== */}
    {(() => {
      let grandWin = 0;   // tổng tiền thắng sau khi nhân rate
      let grandBet = 0;   // tổng tiền cược sau khi nhân rate

      Object.entries(finalizeData.summary).forEach(([cat, group]) => {
        let baseType = null;
        if (cat.startsWith('de_') || cat === 'de') baseType = 'de';
        else if (cat.startsWith('lo_') || cat === 'lo') baseType = 'lo';
        else if (cat === 'xien2') baseType = 'xien2';
        else if (cat === 'xien3') baseType = 'xien3';
        else if (cat === 'xien4') baseType = 'xien4';

        if (baseType) {
          const bet = group.totalBet || 0;
          const win = group.totalWin || 0;

          let wrate = 1;
          let lrate = 1;

          switch (baseType) {
            case 'de':
              wrate = parseFloat(config.thuong_de || '1');
              lrate = parseFloat(config.phe_de || '1');
              break;
            case 'lo':
              wrate = parseFloat(config.thuong_lo || '1');
              lrate = parseFloat(config.phe_lo || '1');
              break;
            case 'xien2':
              wrate = parseFloat(config.thuong_x2 || '1');
              lrate = parseFloat(config.phe_x2 || '1');
              break;
            case 'xien3':
              wrate = parseFloat(config.thuong_x3 || '1');
              lrate = parseFloat(config.phe_x3 || '1');
              break;
            case 'xien4':
              wrate = parseFloat(config.thuong_x4 || '1');
              lrate = parseFloat(config.phe_x4 || '1');
              break;
          }

          grandWin += win * wrate;
          grandBet += bet * lrate;
        }
      });

      const isWin = grandWin > grandBet;

      return (
        <div className={`px-4 mb-4 py-1.5 rounded-full text-sm font-bold border ${isWin
          ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:border-red-800'
          : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:border-green-800'
        }`}>
          Tổng: {Math.round(grandWin)} / {Math.round(grandBet)}
        </div>
      );
    })()}
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                    
                    {(() => {
                      // Group by base type
                      const baseTypes = {
                        de: { label: 'Đề', totalBet: 0, totalWin: 0 },
                        lo: { label: 'Lô', totalBet: 0, totalWin: 0 },
                        xien2: { label: 'Xiên 2', totalBet: 0, totalWin: 0 },
                        xien3: { label: 'Xiên 3', totalBet: 0, totalWin: 0 },
                        xien4: { label: 'Xiên 4', totalBet: 0, totalWin: 0 },
                      };

                      // Aggregate all categories into base types
                      Object.entries(finalizeData.summary).forEach(([cat, group]) => {
                        // Determine base type
                        let baseType = null;
                        if (cat.startsWith('de_') || cat === 'de') {
                          baseType = 'de';
                        } else if (cat.startsWith('lo_') || cat === 'lo') {
                          baseType = 'lo';
                        } else if (cat === 'xien2') {
                          baseType = 'xien2';
                        } else if (cat === 'xien3') {
                          baseType = 'xien3';
                        } else if (cat === 'xien4') {
                          baseType = 'xien4';
                        }

                        if (baseType && baseTypes[baseType]) {
                          baseTypes[baseType].totalBet += group.totalBet;
                          baseTypes[baseType].totalWin += group.totalWin;
                        }
                        switch(baseType) {
                          case "de": {
                            baseTypes[baseType].wrate = parseFloat(config.thuong_de);
                            baseTypes[baseType].lrate = parseFloat(config.phe_de);
                            break;
                          }
                          case "lo": {
                            baseTypes[baseType].wrate = parseFloat(config.thuong_lo);
                            baseTypes[baseType].lrate = parseFloat(config.phe_lo);
                            break;
                          }
                          case "xien2": {
                            baseTypes[baseType].wrate = parseFloat(config.thuong_x2);
                            baseTypes[baseType].lrate = parseFloat(config.phe_x2);
                            break;
                          }
                          case "xien3": {
                            baseTypes[baseType].wrate = parseFloat(config.thuong_x3);
                            baseTypes[baseType].lrate = parseFloat(config.phe_x3);
                            break;
                          }
                          case "xien4": {
                            baseTypes[baseType].wrate = parseFloat(config.thuong_x4);
                            baseTypes[baseType].lrate = parseFloat(config.phe_x4);
                            break;
                          }
                        } 
                      });
                      // Render only types that have bets
                      return Object.entries(baseTypes)
                        .filter(([_, type]) => type.totalBet > 0)
                        .map(([key, type]) => {
                          console.log("baseTypes ~ kid type:", type)
                          const hasWin = type.totalWin > 0;
                          return (
                            <div
                              key={key}
                              className={`rounded-md px-3 py-2 text-center text-sm ${hasWin
                                ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                                : 'bg-muted/40 border'
                                }`}
                            >
                              <div className='text-xs text-muted-foreground mb-0.5'>
                                {type.label}
                              </div>
                              <div className={`text-lg font-bold ${hasWin ? 'text-red-600' : ''}`}>
                                {(type.totalWin * type.wrate).toFixed(0)}/{(type.totalBet * type.lrate) .toFixed(0)}
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Sub-component: 1 dòng kết quả trong dialog ─────────────────────────────

function ResultRow({ bet }: { bet: FinalizedBet }) {
  const isWin = bet.win

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded text-sm font-mono ${isWin ? 'bg-red-50 dark:bg-red-950/30' : 'hover:bg-muted/30'
        }`}
    >
      {isWin ? (
        <CheckCircle2 className='h-3.5 w-3.5 text-red-500 shrink-0' />
      ) : (
        <span className='h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/30' />
      )}

      <span className={isWin ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
        {formatBet(bet)}
      </span>

      {isWin && bet.winCount && bet.winCount > 1 && (
        <Badge variant='destructive' className='text-[10px] h-4 px-1 ml-1'>
          x{bet.winCount} nháy
        </Badge>
      )}

      {bet.detail && (
        <div className='ml-auto flex items-center gap-1'>
          {bet.detail.map((d, i) => (
            <span
              key={i}
              className={`text-xs px-1 rounded ${d.found
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 font-semibold'
                : 'bg-muted text-muted-foreground'
                }`}
            >
              {d.number}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}