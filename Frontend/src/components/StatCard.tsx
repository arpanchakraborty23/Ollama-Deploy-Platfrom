import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconColorClass = 'text-gray-700',
  iconBgClass = 'bg-gradient-to-br from-purple-500 to-indigo-500',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 group">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl shadow-sm transition-transform group-hover:scale-110 ${iconBgClass} text-white`}>
          <Icon className={`w-5 h-5 ${iconColorClass}`} />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border ${
              trend.startsWith('+') || trend.startsWith('Up')
                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                : trend.startsWith('-') || trend.startsWith('Down')
                ? 'text-rose-700 bg-rose-50 border-rose-100'
                : 'text-slate-600 bg-slate-50 border-slate-100'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-5">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none">{label}</p>
      </div>
    </div>
  );
}

export default React.memo(StatCard);
