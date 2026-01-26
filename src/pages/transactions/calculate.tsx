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