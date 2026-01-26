# 🎨 Frontend Setup Guide - Lottery Management System

## 📋 Mục lục
1. [Setup Template](#setup-template)
2. [Project Structure](#project-structure)
3. [Customize Navigation](#customize-navigation)
4. [API Integration](#api-integration)
5. [Pages Implementation](#pages-implementation)
6. [Components Development](#components-development)

---

## 🚀 Setup Template

### Bước 1: Clone và cài đặt template
```bash
# Clone template
git clone https://github.com/satnaing/shadcn-admin.git lottery-frontend
cd lottery-frontend

# Cài đặt dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Chạy development server
npm run dev
```

### Bước 2: Cấu hình environment
Tạo file `.env.local`:
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Lottery Management System
VITE_APP_DESCRIPTION=Hệ thống quản lý số đề

# Optional: Enable features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
```

### Bước 3: Cài đặt thêm dependencies
```bash
# API client
npm install axios

# Date handling
npm install date-fns

# Form validation
npm install zod react-hook-form @hookform/resolvers

# State management (optional)
npm install zustand

# Toast notifications
npm install sonner

# Data tables
npm install @tanstack/react-table
```

---

## 📁 Project Structure

Cấu trúc thư mục sau khi customize:

```
lottery-frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx          # Customize sidebar
│   │   │   ├── header.tsx           # Customize header
│   │   │   └── main-layout.tsx      # Main layout wrapper
│   │   │
│   │   ├── lottery/                 # Lottery-specific components
│   │   │   ├── customer-form.tsx
│   │   │   ├── transaction-form.tsx
│   │   │   ├── calculation-panel.tsx
│   │   │   ├── customer-table.tsx
│   │   │   └── report-table.tsx
│   │   │
│   │   ├── common/                  # Reusable components
│   │   │   ├── data-table.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   └── error-boundary.tsx
│   │   │
│   │   └── ui/                      # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── ...
│   │
│   ├── pages/
│   │   ├── dashboard.tsx            # Trang dashboard chính
│   │   ├── customers/
│   │   │   ├── index.tsx           # Danh sách khách hàng
│   │   │   ├── create.tsx          # Tạo khách hàng
│   │   │   └── [id].tsx            # Chi tiết/Edit khách hàng
│   │   │
│   │   ├── transactions/
│   │   │   ├── index.tsx           # Danh sách giao dịch
│   │   │   ├── calculate.tsx       # Tính tiền
│   │   │   └── history.tsx         # Lịch sử giao dịch
│   │   │
│   │   ├── reports/
│   │   │   ├── daily.tsx           # Báo cáo ngày
│   │   │   └── weekly.tsx          # Báo cáo tuần
│   │   │
│   │   ├── settings/
│   │   │   ├── profile.tsx         # Thông tin tài khoản
│   │   │   ├── configuration.tsx   # Cấu hình thay thế
│   │   │   └── change-password.tsx # Đổi mật khẩu
│   │   │
│   │   └── auth/
│   │       ├── login.tsx
│   │       └── register.tsx
│   │
│   ├── lib/
│   │   ├── api/                     # API client
│   │   │   ├── client.ts           # Axios instance
│   │   │   ├── auth.ts             # Auth API calls
│   │   │   ├── customers.ts        # Customer API calls
│   │   │   ├── transactions.ts     # Transaction API calls
│   │   │   └── reports.ts          # Report API calls
│   │   │
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-customers.ts
│   │   │   └── use-transactions.ts
│   │   │
│   │   ├── store/                   # State management
│   │   │   └── auth-store.ts
│   │   │
│   │   └── utils/
│   │       ├── format.ts           # Formatting utilities
│   │       └── validation.ts       # Validation schemas
│   │
│   ├── types/
│   │   ├── customer.ts
│   │   ├── transaction.ts
│   │   ├── report.ts
│   │   └── api.ts
│   │
│   └── App.tsx
│
├── public/
├── package.json
└── vite.config.ts
```

---

## 🧭 Customize Navigation

### 1. Cập nhật Sidebar Navigation

Tạo file `src/config/navigation.tsx`:

```typescript
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
```

### 2. Cập nhật Sidebar Component

File `src/components/layout/sidebar.tsx`:

```typescript
import { navigationItems } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Lottery Management</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {navigationItems.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <UserProfile />
      </div>
    </div>
  );
}
```

---

## 🔌 API Integration

### 1. Setup Axios Client

Tạo file `src/lib/api/client.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

### 2. Authentication API

Tạo file `src/lib/api/auth.ts`:

```typescript
import { apiClient } from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  fullName?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
```

### 3. Customer API

Tạo file `src/lib/api/customers.ts`:

```typescript
import { apiClient } from './client';
import type { Customer, CreateCustomerData } from '@/types/customer';

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get('/customers');
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerData): Promise<Customer> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
```

### 4. Transaction API

Tạo file `src/lib/api/transactions.ts`:

```typescript
import { apiClient } from './client';
import type { 
  Transaction, 
  CalculateTransactionData,
  SaveTransactionData 
} from '@/types/transaction';

export const transactionApi = {
  calculate: async (data: CalculateTransactionData) => {
    const response = await apiClient.post('/transactions/calculate', data);
    return response.data;
  },

  save: async (data: SaveTransactionData) => {
    const response = await apiClient.post('/transactions/save', data);
    return response.data;
  },

  getAll: async (params?: {
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> => {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },
};
```

### 5. Report API

Tạo file `src/lib/api/reports.ts`:

```typescript
import { apiClient } from './client';
import type { DailyReport, WeeklyReport } from '@/types/report';

export const reportApi = {
  getDaily: async (date: string): Promise<DailyReport> => {
    const response = await apiClient.get('/reports/daily', {
      params: { date },
    });
    return response.data;
  },

  getWeekly: async (startDate: string, endDate: string): Promise<WeeklyReport> => {
    const response = await apiClient.get('/reports/weekly', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getAvailableDates: async (): Promise<string[]> => {
    const response = await apiClient.get('/reports/available-dates');
    return response.data;
  },

  getCustomerStats: async (customerId: string, params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`/reports/customer-stats/${customerId}`, {
      params,
    });
    return response.data;
  },
};
```

---

## 📝 TypeScript Types

### Tạo file `src/types/customer.ts`:

```typescript
export interface Customer {
  _id: string;
  userId: string;
  customerId: string;
  name: string;
  prices: {
    de: number;
    lo: number;
    x2: number;
    x3: number;
    x4: number;
    xiuNhay: number;
    baCang: number;
  };
  rewards: {
    thuongDe: number;
    thuongLo: number;
    thuongX2: number;
    thuongX3: number;
    thuongX4: number;
    thuongBaCang: number;
  };
  discountPercent: number;
  type: 'customer' | 'agent';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  customerId: string;
  name: string;
  prices?: Partial<Customer['prices']>;
  rewards?: Partial<Customer['rewards']>;
  discountPercent?: number;
  type?: 'customer' | 'agent';
  status?: 'active' | 'inactive';
}
```

### Tạo file `src/types/transaction.ts`:

```typescript
export interface Transaction {
  _id: string;
  userId: string;
  customerId: {
    _id: string;
    name: string;
    customerId: string;
  };
  date: string;
  type: 'receive' | 'send';
  rawData: string;
  processedData: ProcessedData;
  totals: {
    totalAmount: number;
    discount: number;
    netAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProcessedData {
  de: LotteryItem[];
  lo: LotteryItem[];
  x2: LotteryItem[];
  x3: LotteryItem[];
  x4: LotteryItem[];
  xiuNhay: LotteryItem[];
  baCang: LotteryItem[];
}

export interface LotteryItem {
  number: string;
  amount: number;
}

export interface CalculateTransactionData {
  customerId: string;
  date: string;
  rawData: string;
  type: 'receive' | 'send';
}

export interface SaveTransactionData extends CalculateTransactionData {
  processedData: ProcessedData;
  totals: Transaction['totals'];
}
```

---

## 🎨 Custom Hooks

### Tạo file `src/lib/hooks/use-auth.ts`:

```typescript
import { create } from 'zustand';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  fullName?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ username, password });
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      set({ token, user, isAuthenticated: true });
      
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    toast.info('Đã đăng xuất');
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true });
    try {
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

---

## 🚀 Next Steps

1. **Install dependencies** theo hướng dẫn ở Bước 3
2. **Tạo các file types** cho Customer, Transaction, Report
3. **Implement API clients** cho từng module
4. **Customize Navigation** theo config đã tạo
5. **Build Pages** cho từng chức năng (sẽ hướng dẫn chi tiết ở file tiếp theo)

Trong file tiếp theo, tôi sẽ hướng dẫn chi tiết:
- Implement các pages chính (Dashboard, Customers, Calculate, Reports)
- Xây dựng forms với validation
- Tạo data tables với pagination
- Implement calculation UI
- Xây dựng report views

Có câu hỏi gì về phần setup này không?
