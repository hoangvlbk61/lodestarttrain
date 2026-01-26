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