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