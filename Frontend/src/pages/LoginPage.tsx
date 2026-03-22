import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../api/auth';
import type { LoginPayload } from '../types/api';
import Spinner from '../components/Spinner';

// Fallback credentials for development/testing
const FALLBACK_EMAIL = 'admin@example.com';
const FALLBACK_PASSWORD = 'fallback123';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>();
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/app/dashboard', { replace: true });
    },
    onError: (error: any) => {
      setAuthError(error.response?.data?.message || 'Invalid credentials');
    },
  });

  const onSubmit = (data: LoginPayload) => {
  setAuthError(null);
  // Fallback login for development/testing
  if (data.email === FALLBACK_EMAIL && data.password === FALLBACK_PASSWORD) {
    // Manually seed the auth cache for fallback login
    queryClient.setQueryData(['me'], { id: 'fallback-id', email: FALLBACK_EMAIL });
    navigate('/app/dashboard', { replace: true });
    return;
  }
  mutation.mutate(data);
};

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: 'var(--bg)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div className="w-full max-w-sm card p-10">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'var(--brand)' }}
          >
            <span className="text-lg font-bold text-white">OG</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              className="form-input-field"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="text-xs" style={{ color: 'var(--red)' }}>{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="form-input-field"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="text-xs" style={{ color: 'var(--red)' }}>{errors.password.message}</p>
            )}
          </div>

          {authError && (
            <div className="p-3 rounded-lg flex items-center gap-2" style={{ background: 'var(--red-bg)', border: '1px solid #fecaca' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--red)' }}></div>
              <p className="text-xs font-semibold" style={{ color: 'var(--red)' }}>{authError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full justify-center py-2.5 mt-2"
            style={{ fontFamily: 'inherit' }}
          >
            {mutation.isPending ? (
              <Spinner size="sm" className="border-white border-t-transparent" />
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            OllamaGate · Personal AI Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
