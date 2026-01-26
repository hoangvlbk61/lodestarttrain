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