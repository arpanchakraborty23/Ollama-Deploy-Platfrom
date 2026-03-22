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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans selection:bg-indigo-100 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>

      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-10 relative z-10 transition-all duration-500 hover:shadow-indigo-600/5">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-6 shadow-lg shadow-indigo-600/20">
            <span className="text-2xl font-black text-white italic">OG</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tighter italic">OllamaGate</h1>
          <p className="text-[10px] text-slate-400 mt-2 font-black tracking-widest uppercase">Personal AI Gateway</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-bold text-sm"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="text-rose-600 text-[10px] font-black uppercase tracking-wider mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-bold text-sm"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="text-rose-600 text-[10px] font-black uppercase tracking-wider mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          {authError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">{authError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center bg-indigo-600 text-white py-4 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:pointer-events-none group"
          >
            {mutation.isPending ? (
              <Spinner size="sm" className="border-white border-t-transparent" />
            ) : (
              <span className="flex items-center gap-2">
                Launch Console 
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
            Secure Enterprise Boundary
          </p>
        </div>
      </div>
    </div>
  );
}
