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
import { useState, useCallback, useRef } from 'react'
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

// ─── Constants ───────────────────────────────────────────────────────────────

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
  const [inputText, setInputText] = useState('')
  const [date, setDate] = useState(() => {
    const d = new Date()
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  })

  const [splitLines, setSplitLines] = useState<string[] | null>(null)
  const [splitErrors, setSplitErrors] = useState<Set<number>>(new Set())
  const [parseData, setParseData] = useState<ParseResponse | null>(null)
  const [finalizeData, setFinalizeData] = useState<FinalizeResponse | null>(null)

  const [loadingSplit, setLoadingSplit] = useState(false)
  const [loadingParse, setLoadingParse] = useState(false)
  const [loadingFinalize, setLoadingFinalize] = useState(false)
  const [loadingFetchXS, setLoadingFetchXS] = useState(false)
  const [completedStep, setCompletedStep] = useState(0)
  const [showResultDialog, setShowResultDialog] = useState(false)

  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  // ── Step 1: Tách tin ──
  const handleSplit = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error('Vui lòng nhập nội dung tin nhắn')
      return
    }
    setLoadingSplit(true)
    setParseData(null)
    setFinalizeData(null)
    setSplitErrors(new Set())
    try {
      const res = await calculateApi.split(inputText)
      const { lines } = res.data
      setSplitLines(lines)
      setCompletedStep(1)
      toast.success(`Tách tin thành công: ${lines.length} dòng`)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tách tin')
    } finally {
      setLoadingSplit(false)
    }
  }, [inputText])

  // ── Step 2: Phân tích ──
  const handleParse = useCallback(async () => {
    if (!splitLines || splitLines.length === 0) {
      toast.error('Chạy Bước 1 trước')
      return
    }
    setLoadingParse(true)
    setFinalizeData(null)
    try {
      const res = await calculateApi.parse(splitLines)
      const data = res.data
      setParseData(data)

      const errorIndices = new Set<number>()
      data.parsed.forEach((bet) => {
        if (!bet.isValid && bet.originalLine) {
          const idx = splitLines.findIndex((l) => l === bet.originalLine)
          if (idx >= 0) errorIndices.add(idx)
        }
      })
      setSplitErrors(errorIndices)
      setCompletedStep(2)

      const msg = `${data.validBets} hợp lệ / ${data.totalBets} tổng`
      if (data.invalidBets > 0) {
        toast.warning(`Phân tích xong: ${msg} (${data.invalidBets} lỗi)`)
      } else {
        toast.success(`Phân tích thành công: ${msg}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi phân tích')
    } finally {
      setLoadingParse(false)
    }
  }, [splitLines])

  // ── Step 3: Tính tiền → Dialog ──
  const handleFinalize = useCallback(async () => {
    if (!parseData?.parsed || parseData.parsed.length === 0) {
      toast.error('Chạy Bước 2 trước')
      return
    }
    const dateParts = date.split('/')
    const dateForApi =
      dateParts.length === 3
        ? `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
        : date

    setLoadingFinalize(true)
    try {
      const res = await calculateApi.finalize(parseData.parsed, dateForApi)
      setFinalizeData(res.data)
      setCompletedStep(3)
      setShowResultDialog(true)
      toast.success(`Tính tiền xong — Trúng ${res.data.totalWin}/${res.data.totalBets}`)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tính tiền')
    } finally {
      setLoadingFinalize(false)
    }
  }, [parseData, date])

  // ── Cập nhật KQXS ──
  const handleFetchXS = useCallback(async () => {
    setLoadingFetchXS(true)
    try {
      const res = await calculateApi.fetchResults()
      toast.success(`Cập nhật KQXS thành công — ngày ${res.data?.date || res.data?.time || ''}`)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật KQXS')
    } finally {
      setLoadingFetchXS(false)
    }
  }, [])

  // ── Reset về đầu ──
  const handleReset = () => {
    setSplitLines(null)
    setSplitErrors(new Set())
    setParseData(null)
    setFinalizeData(null)
    setCompletedStep(0)
  }

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
          {/* ═══ Configuration Card ═══ */}
          <Card>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
                <div className='space-y-2'>
                  <Label>Khách hàng mới:</Label>
                  <Input placeholder='Chọn Khách Hàng' />
                </div>
                <div className='space-y-2'>
                  <Label>Ngày:</Label>
                  <Input
                    type='text'
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
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
                <div><Label className='text-xs'>Phế Đề:</Label><Input defaultValue='0.72' /></div>
                <div><Label className='text-xs'>Lô:</Label><Input defaultValue='21.7' /></div>
                <div><Label className='text-xs'>X2:</Label><Input defaultValue='0.6' /></div>
                <div><Label className='text-xs'>X3:</Label><Input defaultValue='0.6' /></div>
                <div><Label className='text-xs'>X4:</Label><Input defaultValue='0.6' /></div>
                <div><Label className='text-xs'>BC:</Label><Input defaultValue='0.72' /></div>
                <div><Label className='text-xs'>XN:</Label><Input defaultValue='1' /></div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-7 gap-3'>
                <div><Label className='text-xs'>Thưởng Đề:</Label><Input defaultValue='70' /></div>
                <div><Label className='text-xs'>Lô:</Label><Input defaultValue='80' /></div>
                <div><Label className='text-xs'>X2:</Label><Input defaultValue='10' /></div>
                <div><Label className='text-xs'>X3:</Label><Input defaultValue='40' /></div>
                <div><Label className='text-xs'>X4:</Label><Input defaultValue='100' /></div>
                <div><Label className='text-xs'>BC:</Label><Input defaultValue='400' /></div>
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
                            className={`flex items-start gap-2 px-2 py-1 rounded ${
                              hasError
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
                                  className={`flex items-center gap-2 px-2 py-0.5 rounded ${
                                    !item.isValid
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

                {/* Danh sách theo loại */}
                {CATEGORY_ORDER.map((cat) => {
                  const group: SummaryGroup | undefined = finalizeData.summary[cat]
                  if (!group) return null

                  const bets = finalizeData.finalized.filter(
                    (b) => getCategory(b) === cat
                  )

                  return (
                    <div key={cat}>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge
                          variant={group.winPoints > 0 ? 'default' : 'secondary'}
                          className={group.winPoints > 0 ? 'bg-red-600' : ''}
                        >
                          {CATEGORY_LABELS[cat]}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          {group.winPoints > 0 ? (
                            <span className='text-red-600 font-medium'>
                              {group.winPoints}
                            </span>
                          ) : (
                            <span>0</span>
                          )}
                          /{group.totalPoints}
                        </span>
                      </div>
                      <div className='ml-2 space-y-0.5'>
                        {bets.map((bet, j) => (
                          <ResultRow key={j} bet={bet} />
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* TỔNG KẾT */}
                <Separator />
                <div className='rounded-lg border-2 border-dashed p-4'>
                  <h4 className='font-semibold mb-3 text-sm'>Tổng kết</h4>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                    {CATEGORY_ORDER.map((cat) => {
                      const group = finalizeData.summary[cat]
                      if (!group) return null
                      const hasWin = group.winPoints > 0
                      return (
                        <div
                          key={cat}
                          className={`rounded-md px-3 py-2 text-center text-sm ${
                            hasWin
                              ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                              : 'bg-muted/40 border'
                          }`}
                        >
                          <div className='text-xs text-muted-foreground mb-0.5'>
                            {CATEGORY_LABELS[cat]}
                          </div>
                          <div className={`text-lg font-bold ${hasWin ? 'text-red-600' : ''}`}>
                            {group.winPoints}/{group.totalPoints}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className='mt-3 text-center'>
                    {(() => {
                      let totalWin = 0
                      let totalAll = 0
                      CATEGORY_ORDER.forEach(cat => {
                        const g = finalizeData.summary[cat]
                        if (!g) return
                        totalWin += g.winPoints
                        totalAll += g.totalPoints
                      })
                      return (
                        <>
                          <span className='text-sm text-muted-foreground'>Tổng cộng: </span>
                          <span className={`text-xl font-bold ${totalWin > 0 ? 'text-red-600' : ''}`}>
                            {totalWin}/{totalAll}
                          </span>
                        </>
                      )
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
      className={`flex items-center gap-2 px-2 py-1 rounded text-sm font-mono ${
        isWin ? 'bg-red-50 dark:bg-red-950/30' : 'hover:bg-muted/30'
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
              className={`text-xs px-1 rounded ${
                d.found
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