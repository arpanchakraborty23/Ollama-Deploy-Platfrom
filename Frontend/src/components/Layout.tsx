import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Terminal, LayoutDashboard, Cpu, Key, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/auth';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/models', label: 'Models', icon: Cpu },
    { to: '/app/keys', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/60 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 text-slate-900 flex flex-col transition-all duration-300",
        "w-56", // default width
        "lg:w-56 lg:translate-x-0", // full width on large screens
        "md:w-16 md:translate-x-0 overflow-x-hidden", // icon only on med screens
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0" // hidden on mobile unless open
      )}>
        <div className="flex items-center gap-3 px-4 md:px-5 lg:px-6 h-16 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Terminal className="w-5 h-5 shrink-0" />
          </div>
          <span className="font-extrabold text-lg tracking-tight md:hidden lg:inline bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent italic">OllamaGate</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )
              }
              title={item.label}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="md:hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 md:p-2 lg:p-4 border-t border-gray-800 shrink-0">
          <div className="px-3 md:px-0 lg:px-3 mb-4 truncate md:hidden lg:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">
              Account
            </p>
            <p className="text-sm font-bold text-slate-700 truncate" title={user?.email}>
              {user?.email || 'admin@example.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center w-full gap-3 px-3 py-2 text-sm font-bold text-slate-500 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-colors md:justify-center lg:justify-start"
            title="Log out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="md:hidden lg:inline flex-1 text-left">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-16 lg:ml-56 transition-all duration-300 bg-slate-50/50">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-4 sm:px-8 shrink-0 relative z-30">
          <button 
            className="md:hidden p-2 mr-3 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">{title}</h1>
        </header>

        <div className="flex-1 p-0 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
