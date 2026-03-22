import apiClient from '../lib/axios';
import type { OllamaModel } from '../types/api';

export const listModels = async (): Promise<OllamaModel[]> => {
  const { data } = await apiClient.get<OllamaModel[]>('/models');
  return data;
};

export const pullModel = async (name: string): Promise<string> => {
  const { data } = await apiClient.post<{ progress_url: string }>('/models/pull', { name });
  return data.progress_url || `/api/models/pull/${name}/progress`;
};
