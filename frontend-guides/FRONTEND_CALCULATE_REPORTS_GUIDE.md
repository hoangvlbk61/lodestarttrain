# 🧮 Calculate & Reports Implementation

## 💰 3. Calculate/Transaction Page

### File: `src/pages/transactions/calculate.tsx`

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { customerApi } from '@/lib/api/customers';
import { transactionApi } from '@/lib/api/transactions';
import { toast } from 'sonner';
import { CalendarIcon, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CalculatePage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [date, setDate] = useState(new Date());
  const [rawData, setRawData] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách khách hàng');
    }
  };

  const handleCalculate = async () => {
    if (!selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng');
      return;
    }
    if (!rawData.trim()) {
      toast.error('Vui lòng nhập dữ liệu');
      return;
    }

    try {
      setIsCalculating(true);
      const response = await transactionApi.calculate({
        customerId: selectedCustomer._id,
        date: format(date, 'yyyy-MM-dd'),
        rawData,
        type: 'receive',
      });

      setCalculationResult(response.data);
      toast.success('Tính toán thành công');
    } catch (error: any) {
      toast.error(error.message || 'Không thể tính toán');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!calculationResult) {
      toast.error('Chưa có kết quả tính toán');
      return;
    }

    try {
      setIsSaving(true);
      await transactionApi.save({
        customerId: selectedCustomer._id,
        date: format(date, 'yyyy-MM-dd'),
        rawData,
        processedData: calculationResult.processedData,
        totals: calculationResult.totals,
        type: 'receive',
      });

      toast.success('Lưu giao dịch thành công');
      
      // Reset form
      setRawData('');
      setCalculationResult(null);
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu giao dịch');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tính tiền</h1>
        <p className="text-muted-foreground">
          Nhập dữ liệu và tính toán kết quả
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao dịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Khách hàng</Label>
                <Select
                  value={selectedCustomer?._id}
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c._id === value);
                    setSelectedCustomer(customer);
                  }}
                >
                  <option value="">Chọn khách hàng</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.customerId} - {customer.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, 'PPP', { locale: vi })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {selectedCustomer && (
                <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đề:</span>
                    <span className="font-medium">{selectedCustomer.prices.de}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lô:</span>
                    <span className="font-medium">{selectedCustomer.prices.lo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chiết khấu:</span>
                    <span className="font-medium">
                      {selectedCustomer.discountPercent}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Input */}
          <Card>
            <CardHeader>
              <CardTitle>Nhập dữ liệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rawData">
                  Paste dữ liệu vào đây (mỗi dòng: số tiền)
                </Label>
                <Textarea
                  id="rawData"
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder="12 100&#10;34 50&#10;56 30"
                  rows={15}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating || !selectedCustomer}
                  className="flex-1"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {isCalculating ? 'Đang tính...' : 'Bước 1: Tách tin'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Result */}
        <div className="space-y-6">
          {calculationResult ? (
            <>
              {/* Formatted Output */}
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả phân tích</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm font-mono whitespace-pre-wrap rounded-lg bg-muted p-4 max-h-96 overflow-y-auto">
                    {calculationResult.formattedOutput}
                  </pre>
                </CardContent>
              </Card>

              {/* Totals */}
              <Card>
                <CardHeader>
                  <CardTitle>Tổng kết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">Tổng tiền:</span>
                    <span className="font-semibold">
                      {calculationResult.totals.totalAmount.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">Chiết khấu:</span>
                    <span className="font-semibold text-orange-600">
                      -{calculationResult.totals.discount.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl">
                      <span className="font-semibold">Thực nhận:</span>
                      <span className="font-bold text-green-600">
                        {calculationResult.totals.netAmount.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                className="w-full"
              >
                {isSaving ? 'Đang lưu...' : 'Bước 2: Phân tích'}
              </Button>

              <div className="text-sm text-muted-foreground text-center">
                <a
                  href="#"
                  className="text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    // Copy to clipboard logic
                    navigator.clipboard.writeText(calculationResult.formattedOutput);
                    toast.success('Đã copy kết quả');
                  }}
                >
                  Cập nhật kết quả xổ số
                </a>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Chưa có kết quả tính toán
                </p>
                <p className="text-sm text-muted-foreground">
                  Chọn khách hàng, nhập dữ liệu và nhấn "Tách tin" để bắt đầu
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 4. Reports Pages

### File: `src/pages/reports/daily.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { reportApi } from '@/lib/api/reports';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadReport();
    }
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    try {
      const dates = await reportApi.getAvailableDates();
      setAvailableDates(dates.data);
    } catch (error) {
      console.error('Error loading dates:', error);
    }
  };

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await reportApi.getDaily(dateStr);
      setReport(response.data);
    } catch (error: any) {
      toast.error('Không thể tải báo cáo');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;

    // Create CSV content
    const headers = ['Mã KH', 'Tên khách hàng', 'Tổng tiền'];
    const rows = report.customers.map((c) => [
      c.customerCode,
      c.customerName,
      c.total,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      `Tổng cộng:,${report.grandTotal}`,
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-ngay-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo ngày</h1>
          <p className="text-muted-foreground">
            Tổng hợp giao dịch theo ngày
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP', { locale: vi })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={vi}
                disabled={(date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  return !availableDates.includes(dateStr);
                }}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={loadReport}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button onClick={handleExport} disabled={!report}>
            <Download className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.grandTotal.toLocaleString()}đ
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Số khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.customers.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Số giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết theo khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : report ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Mã KH</TableHead>
                  <TableHead>Tên khách hàng</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.customers.map((customer, index) => (
                  <TableRow key={customer.customerId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {customer.customerCode}
                    </TableCell>
                    <TableCell>{customer.customerName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {customer.total.toLocaleString()}đ
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted font-bold">
                  <TableCell colSpan={3}>Tổng cộng</TableCell>
                  <TableCell className="text-right">
                    {report.grandTotal.toLocaleString()}đ
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có dữ liệu cho ngày này
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### File: `src/pages/reports/weekly.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportApi } from '@/lib/api/reports';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function WeeklyReportPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  useEffect(() => {
    loadReport();
  }, [currentWeek]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');
      const response = await reportApi.getWeekly(startDate, endDate);
      setReport(response.data);
    } catch (error: any) {
      toast.error('Không thể tải báo cáo');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  const handleExport = () => {
    if (!report) return;

    const headers = [
      'STT',
      'Tên KH',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
      'Chủ nhật',
      'Tổng tuần',
    ];

    const rows = report.customers.map((c, i) => [
      i + 1,
      c.customerName,
      c.dailyTotals['thu-2'],
      c.dailyTotals['thu-3'],
      c.dailyTotals['thu-4'],
      c.dailyTotals['thu-5'],
      c.dailyTotals['thu-6'],
      c.dailyTotals['thu-7'],
      c.dailyTotals['chu-nhat'],
      c.total,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      `Tổng cộng:,,,,,,,${report.grandTotal}`,
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-tuan-${format(weekStart, 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const daysOfWeek = [
    { key: 'thu-2', label: 'Thứ 2' },
    { key: 'thu-3', label: 'Thứ 3' },
    { key: 'thu-4', label: 'Thứ 4' },
    { key: 'thu-5', label: 'Thứ 5' },
    { key: 'thu-6', label: 'Thứ 6' },
    { key: 'thu-7', label: 'Thứ 7' },
    { key: 'chu-nhat', label: 'CN' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo tuần</h1>
          <p className="text-muted-foreground">
            {format(weekStart, 'dd/MM/yyyy')} - {format(weekEnd, 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentWeek(new Date())}
          >
            Tuần này
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={handleExport} disabled={!report}>
            <Download className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Summary */}
      {report && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng tuần
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.grandTotal.toLocaleString()}đ
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trung bình/ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(report.grandTotal / 7).toLocaleString()}đ
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Số khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.customers.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Số giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết theo khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : report ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Tên khách hàng</TableHead>
                  {daysOfWeek.map((day) => (
                    <TableHead key={day.key} className="text-right">
                      {day.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold">
                    Tổng tuần
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.customers.map((customer, index) => (
                  <TableRow key={customer.customerId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {customer.customerName}
                    </TableCell>
                    {daysOfWeek.map((day) => (
                      <TableCell key={day.key} className="text-right">
                        {customer.dailyTotals[day.key]
                          ? customer.dailyTotals[day.key].toLocaleString()
                          : '-'}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">
                      {customer.total.toLocaleString()}đ
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow className="bg-muted font-bold">
                  <TableCell colSpan={2}>Tổng ngày</TableCell>
                  {daysOfWeek.map((day) => (
                    <TableCell key={day.key} className="text-right">
                      {report.dailyTotals[day.key]?.toLocaleString() || '0'}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    {report.grandTotal.toLocaleString()}đ
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có dữ liệu cho tuần này
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ⚙️ 5. Settings Pages

### File: `src/pages/settings/configuration.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { configurationApi } from '@/lib/api/configurations';
import { toast } from 'sonner';

interface ReplaceRule {
  id: number;
  oldChar: string;
  newChar: string;
}

export default function ConfigurationPage() {
  const [rules, setRules] = useState<ReplaceRule[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await configurationApi.get();
      setRules(response.data.replaceRules || []);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleAddRule = () => {
    const newId = rules.length > 0 ? Math.max(...rules.map((r) => r.id)) + 1 : 1;
    setRules([...rules, { id: newId, oldChar: '', newChar: '' }]);
  };

  const handleRemoveRule = (id: number) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleUpdateRule = (
    id: number,
    field: 'oldChar' | 'newChar',
    value: string
  ) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configurationApi.update({ replaceRules: rules });
      toast.success('Lưu cấu hình thành công');
    } catch (error: any) {
      toast.error('Không thể lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cấu hình</h1>
        <p className="text-muted-foreground">
          Quản lý quy tắc thay thế ký tự
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quy tắc thay thế ký tự</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule, index) => (
            <div key={rule.id} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-8">
                {index + 1}
              </span>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`old-${rule.id}`}>Chuỗi bị thay thế</Label>
                  <Input
                    id={`old-${rule.id}`}
                    value={rule.oldChar}
                    onChange={(e) =>
                      handleUpdateRule(rule.id, 'oldChar', e.target.value)
                    }
                    placeholder="á"
                  />
                </div>
                <div>
                  <Label htmlFor={`new-${rule.id}`}>Chuỗi mới</Label>
                  <Input
                    id={`new-${rule.id}`}
                    value={rule.newChar}
                    onChange={(e) =>
                      handleUpdateRule(rule.id, 'newChar', e.target.value)
                    }
                    placeholder="A"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddRule}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm quy tắc
          </Button>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

Như vậy là đã hoàn thành hướng dẫn implement các pages chính! Tiếp theo bạn cần:

1. **Setup routing** với React Router
2. **Implement authentication flow** (login/logout)
3. **Add loading states và error handling**
4. **Styling và responsive design**

Bạn có muốn tôi tiếp tục với:
- Router configuration?
- Authentication flow chi tiết?
- Common components (DataTable, DatePicker, etc.)?
- Deploy guide?
