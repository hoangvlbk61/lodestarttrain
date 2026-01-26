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