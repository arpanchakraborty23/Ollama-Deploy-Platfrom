import apiClient from '../lib/axios';
import type { ApiKey, CreateKeyPayload, CreateKeyResponse } from '../types/api';

export const listKeys = async (): Promise<ApiKey[]> => {
  const { data } = await apiClient.get<ApiKey[]>('/keys');
  return data;
};

export const createKey = async (payload: CreateKeyPayload): Promise<CreateKeyResponse> => {
  const { data } = await apiClient.post<CreateKeyResponse>('/keys', payload);
  return data;
};

export const revokeKey = async (id: string): Promise<void> => {
  await apiClient.delete(`/keys/${id}`);
};

export const updateKeyLabel = async (id: string, label: string): Promise<ApiKey> => {
  const { data } = await apiClient.patch<ApiKey>(`/keys/${id}`, { label });
  return data;
};
