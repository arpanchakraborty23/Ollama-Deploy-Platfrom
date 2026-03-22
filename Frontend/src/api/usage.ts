import apiClient from '../lib/axios';
import type { UsageSummary, DailyUsage, ModelUsage } from '../types/api';

export const getSummary = async (): Promise<UsageSummary> => {
  const { data } = await apiClient.get<UsageSummary>('/usage/summary');
  return data;
};

export const getDailyUsage = async (days: number): Promise<DailyUsage[]> => {
  const { data } = await apiClient.get<DailyUsage[]>('/usage/by-day', { params: { days } });
  return data;
};

export const getModelUsage = async (): Promise<ModelUsage[]> => {
  const { data } = await apiClient.get<ModelUsage[]>('/usage/by-model');
  return data;
};
