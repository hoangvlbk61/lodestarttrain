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