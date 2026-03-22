import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, Key, LogOut, Menu, X,
  Settings, HelpCircle, Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/auth';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const NAV_LINKS = [
  { to: '/app/dashboard', label: 'Dashboard',  icon: LayoutDashboard, badge: null },
  { to: '/app/models',    label: 'Models',      icon: Cpu,             badge: null },
  { to: '/app/keys',      label: 'API Keys',    icon: Key,             badge: '3'  },
];

const BOTTOM_LINKS = [
  { label: 'Settings',     icon: Settings    },
  { label: 'Help & Support', icon: HelpCircle },
];

export default function Layout({ children, title }: LayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = `${title} — OllamaGate`;
  }, [title]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300',
          'md:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-5 shrink-0"
          style={{ height: 'var(--header-height)', borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--brand)' }}
          >
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>OllamaGate</span>
          <button
            className="ml-auto md:hidden"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Main Menu
          </p>
          <div className="space-y-0.5">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive ? 'nav-active' : 'nav-inactive'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: isActive ? 'var(--brand)' : 'var(--text-secondary)' }}
                    />
                    <span style={{ color: isActive ? 'var(--brand)' : 'var(--text-secondary)' }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className="ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
                        style={{
                          background: isActive ? 'var(--brand)' : '#e8eaed',
                          color: isActive ? '#fff' : 'var(--text-secondary)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-3 shrink-0">
          {/* Bottom nav links */}
          <div className="space-y-0.5 mb-4">
            {BOTTOM_LINKS.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium nav-inactive transition-all duration-150"
                style={{ color: 'var(--text-secondary)' }}
              >
                <item.icon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Upgrade CTA — matching the reference card */}
          <div className="upgrade-card mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <p className="text-white font-bold text-sm mb-0.5">Upgrade to Premium!</p>
            <p className="text-blue-100 text-xs mb-3">Upgrade your account and unlock all of the benefits.</p>
            <button
              className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'; }}
            >
              Upgrade premium
            </button>
          </div>

          {/* User row + logout */}
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ border: '1px solid var(--border)', background: '#fafbfc' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'var(--brand)' }}
            >
              {(user?.email?.[0] ?? 'A').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.email || 'admin@example.com'}
              </p>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              title="Log out"
              className="shrink-0 p-1 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#dc2626'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col min-w-0"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        {/* Top Header */}
        <header
          className="shrink-0 flex items-center px-6 sm:px-8 gap-4"
          style={{
            height: 'var(--header-height)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile burger */}
          <button
            className="md:hidden"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            {/* Date range pill */}
            <button className="btn-secondary text-[12px]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Jan 1, 2025 - Feb, 1 2025
            </button>

            {/* Last N days */}
            <button className="btn-secondary text-[12px]">
              Last 30 days
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Add widget */}
            <button className="btn-secondary text-[12px]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add widget
            </button>

            {/* Export */}
            <button className="btn-primary text-[12px]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
