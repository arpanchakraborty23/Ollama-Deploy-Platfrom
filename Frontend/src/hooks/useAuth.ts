import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/auth';
import type { User } from '../types/api';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = !!user && !isLoading && !error;

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
