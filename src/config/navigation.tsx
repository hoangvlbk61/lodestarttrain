import {
  LayoutDashboard,
  Users,
  Calculator,
  FileText,
  Settings,
  Receipt,
} from 'lucide-react';

export const navigationItems = [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Khách hàng',
        href: '/customers',
        icon: Users,
        badge: 'new', // optional
      },
      {
        title: 'Tính tiền',
        href: '/calculate',
        icon: Calculator,
      },
      {
        title: 'Giao dịch',
        href: '/transactions',
        icon: Receipt,
      },
    ],
  },
  {
    title: 'Báo cáo',
    items: [
      {
        title: 'Báo cáo ngày',
        href: '/reports/daily',
        icon: FileText,
      },
      {
        title: 'Báo cáo tuần',
        href: '/reports/weekly',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Khác',
    items: [
      {
        title: 'Cấu hình',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];