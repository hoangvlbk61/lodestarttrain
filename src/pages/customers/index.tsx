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
