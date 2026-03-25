import { apiClient } from './client';
import type { Configuraton } from '@/types/configuration';

export const configurationApi = {
  getAllConfigurations: async (): Promise<Configuraton[]> => {
    const response = await apiClient.get('/configurations', {
    });
    return response.data.data;
  },

  updateConfigurations: async (body: any): Promise<Configuraton[]> => {
    const response = await apiClient.put('/configurations', body);
    return response.data;
  },
};