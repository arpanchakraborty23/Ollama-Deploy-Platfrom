// API Types

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UsageSummary {
  total_tokens: number;
  total_requests: number;
  tokens_today: number;
  requests_today: number;
  top_model: string;
}

export interface DailyUsage {
  date: string;
  tokens: number;
  requests: number;
}

export interface ModelUsage {
  model_name: string;
  tokens: number;
  requests: number;
}

export interface OllamaModel {
  name: string;
  is_pulled: boolean;
  size_bytes: number | null;
  pulled_at: string | null;
  last_used: string | null;
}

export interface PullProgress {
  status: string;
  completed: number;
  total: number;
  percent: number;
}

export interface ApiKey {
  id: string;
  key_prefix: string;
  model_name: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
  last_used: string | null;
}

export interface CreateKeyPayload {
  model_name: string;
  label?: string;
}

export interface CreateKeyResponse {
  api_key: ApiKey;
  plain_key: string;
}
