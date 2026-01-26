# 🎨 Pages Implementation Guide

Hướng dẫn chi tiết implement các pages chính cho Lottery Management System.

---

## 📊 1. Dashboard Page

### File: `src/pages/dashboard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calculator, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { reportApi } from '@/lib/api/reports';
import { customerApi } from '@/lib/api/customers';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    todayTransactions: 0,
    monthlyGrowth: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load today's report
      const today = format(new Date(), 'yyyy-MM-dd');
      const dailyReport = await reportApi.getDaily(today);
      
      // Load customers
      const customers = await customerApi.getAll();
      
      setStats({
        totalRevenue: dailyReport.data.grandTotal,
        totalCustomers: customers.data.length,
        todayTransactions: dailyReport.data.transactionCount,
        monthlyGrowth: 20.1, // Calculate from data
      });
      
      // Set recent sales
      setRecentSales(dailyReport.data.customers.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống quản lý số đề
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng doanh thu hôm nay"
          value={`${stats.totalRevenue.toLocaleString()}đ`}
          icon={DollarSign}
          trend="+20.1%"
          trendLabel="so với hôm qua"
        />
        <StatsCard
          title="Khách hàng"
          value={stats.totalCustomers}
          icon={Users}
          trend="+5"
          trendLabel="khách hàng mới"
        />
        <StatsCard
          title="Giao dịch hôm nay"
          value={stats.todayTransactions}
          icon={Calculator}
          trend="+12"
          trendLabel="so với hôm qua"
        />
        <StatsCard
          title="Tăng trưởng tháng"
          value="+19%"
          icon={TrendingUp}
          trend="+4.1%"
          trendLabel="so với tháng trước"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Overview Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add chart here - ChartJS or Recharts */}
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart sẽ được thêm vào đây
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <p className="text-sm text-muted-foreground">
              Bạn có {stats.todayTransactions} giao dịch hôm nay
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale: any) => (
                <div key={sale.customerId} className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium">
                      {sale.customerName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium">{sale.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.customerCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      +{sale.total.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, trend, trendLabel }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-600">{trend}</span> {trendLabel}
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## 👥 2. Customers Page

### File: `src/pages/customers/index.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomerTable } from '@/components/lottery/customer-table';
import { customerApi } from '@/lib/api/customers';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Customer } from '@/types/customer';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customerApi.getAll();
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error: any) {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

    try {
      await customerApi.delete(id);
      toast.success('Xóa khách hàng thành công');
      loadCustomers();
    } catch (error: any) {
      toast.error('Không thể xóa khách hàng');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/customers/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
          <p className="text-muted-foreground">
            Danh sách và quản lý thông tin khách hàng
          </p>
        </div>
        <Button onClick={() => navigate('/customers/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <CustomerTable
        customers={filteredCustomers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

### File: `src/components/lottery/customer-table.tsx`

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import type { Customer } from '@/types/customer';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CustomerTable({
  customers,
  isLoading,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có khách hàng nào
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã KH</TableHead>
            <TableHead>Tên khách hàng</TableHead>
            <TableHead>Đề</TableHead>
            <TableHead>Lô</TableHead>
            <TableHead>Xiên nhảy</TableHead>
            <TableHead>Ba càng</TableHead>
            <TableHead>Chiết khấu</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer._id}>
              <TableCell className="font-medium">
                {customer.customerId}
              </TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.prices.de}</TableCell>
              <TableCell>{customer.prices.lo}</TableCell>
              <TableCell>{customer.prices.xiuNhay}</TableCell>
              <TableCell>{customer.prices.baCang}</TableCell>
              <TableCell>{customer.discountPercent}%</TableCell>
              <TableCell>
                <Badge variant={customer.type === 'agent' ? 'default' : 'secondary'}>
                  {customer.type === 'agent' ? 'Đại lý' : 'Khách hàng'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={customer.status === 'active' ? 'success' : 'destructive'}
                >
                  {customer.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(customer._id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(customer._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### File: `src/pages/customers/create.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerApi } from '@/lib/api/customers';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const customerSchema = z.object({
  customerId: z.string().min(1, 'Mã khách hàng là bắt buộc'),
  name: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  prices: z.object({
    de: z.number().min(0),
    lo: z.number().min(0),
    x2: z.number().min(0),
    x3: z.number().min(0),
    x4: z.number().min(0),
    xiuNhay: z.number().min(0),
    baCang: z.number().min(0),
  }),
  rewards: z.object({
    thuongDe: z.number().min(0),
    thuongLo: z.number().min(0),
    thuongX2: z.number().min(0),
    thuongX3: z.number().min(0),
    thuongX4: z.number().min(0),
    thuongBaCang: z.number().min(0),
  }),
  discountPercent: z.number().min(0).max(100),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      prices: {
        de: 0.72,
        lo: 21.7,
        x2: 0.56,
        x3: 0.56,
        x4: 0.56,
        xiuNhay: 1.1,
        baCang: 0.72,
      },
      rewards: {
        thuongDe: 70,
        thuongLo: 80,
        thuongX2: 10,
        thuongX3: 40,
        thuongX4: 100,
        thuongBaCang: 400,
      },
      discountPercent: 100,
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      await customerApi.create(data);
      toast.success('Tạo khách hàng thành công');
      navigate('/customers');
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo khách hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thêm khách hàng mới</h1>
          <p className="text-muted-foreground">
            Nhập thông tin khách hàng và cấu hình giá
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Mã khách hàng *</Label>
                <Input
                  id="customerId"
                  {...register('customerId')}
                  placeholder="17296"
                />
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Tên khách hàng *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Nguyễn Văn A"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Giá đánh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="de">Phí đề</Label>
                <Input
                  id="de"
                  type="number"
                  step="0.01"
                  {...register('prices.de', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lo">Phí lô</Label>
                <Input
                  id="lo"
                  type="number"
                  step="0.01"
                  {...register('prices.lo', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xiuNhay">Phí xiên nhảy</Label>
                <Input
                  id="xiuNhay"
                  type="number"
                  step="0.01"
                  {...register('prices.xiuNhay', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baCang">Phí ba càng</Label>
                <Input
                  id="baCang"
                  type="number"
                  step="0.01"
                  {...register('prices.baCang', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Thưởng trúng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thuongDe">Thưởng đề</Label>
                <Input
                  id="thuongDe"
                  type="number"
                  {...register('rewards.thuongDe', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thuongLo">Thưởng lô</Label>
                <Input
                  id="thuongLo"
                  type="number"
                  {...register('rewards.thuongLo', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thuongBaCang">Thưởng ba càng</Label>
                <Input
                  id="thuongBaCang"
                  type="number"
                  {...register('rewards.thuongBaCang', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discount */}
        <Card>
          <CardHeader>
            <CardTitle>Phần trăm chiết khấu (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min="0"
              max="100"
              {...register('discountPercent', { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/customers')}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Tạo khách hàng'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

Tiếp tục với Calculate page và Reports trong file tiếp theo. Bạn có muốn tôi tiếp tục với:
1. Calculate/Transaction page (tính tiền)
2. Report pages (báo cáo ngày/tuần)
3. Settings page (cấu hình, đổi mật khẩu)

hay bạn muốn xem thêm chi tiết về phần nào trước?
