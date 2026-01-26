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