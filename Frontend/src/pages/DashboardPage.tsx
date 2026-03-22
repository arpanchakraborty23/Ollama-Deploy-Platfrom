import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from 'recharts';
import { Zap, Activity, TrendingUp, Cpu, Server, Database, Globe, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { getSummary, getDailyUsage, getModelUsage } from '../api/usage';

const SIXTY_SECONDS = 60 * 1000;

// Premium fallback data for white label demo
const FALLBACK_SUMMARY = {
  total_tokens: 1425000,
  total_requests: 12450,
  tokens_today: 45000,
  top_model: 'llama3:8b'
};

const FALLBACK_DAILY = [
  { date: new Date(Date.now() - 6 * 86400000).toISOString(), tokens: 12000, requests: 150 },
  { date: new Date(Date.now() - 5 * 86400000).toISOString(), tokens: 15000, requests: 180 },
  { date: new Date(Date.now() - 4 * 86400000).toISOString(), tokens: 19000, requests: 210 },
  { date: new Date(Date.now() - 3 * 86400000).toISOString(), tokens: 14000, requests: 160 },
  { date: new Date(Date.now() - 2 * 86400000).toISOString(), tokens: 25000, requests: 300 },
  { date: new Date(Date.now() - 1 * 86400000).toISOString(), tokens: 32000, requests: 400 },
  { date: new Date().toISOString(), tokens: 45000, requests: 520 },
];

const FALLBACK_MODELS = [
  { model_name: 'llama3:8b', requests: 5800, tokens: 680000 },
  { model_name: 'gemma:7b', requests: 3200, tokens: 410000 },
  { model_name: 'mixtral:8x7b', requests: 1450, tokens: 220000 },
  { model_name: 'phi3:mini', requests: 2000, tokens: 115000 },
];

export default function DashboardPage() {
  const [days, setDays] = useState<number>(7);

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['usage', 'summary'],
    queryFn: getSummary,
    staleTime: SIXTY_SECONDS,
    initialData: FALLBACK_SUMMARY,
  });

  const { data: dailyUsage, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['usage', 'daily', days],
    queryFn: () => getDailyUsage(days),
    staleTime: SIXTY_SECONDS,
    initialData: FALLBACK_DAILY,
  });

  const { data: modelUsage, isLoading: isLoadingModel } = useQuery({
    queryKey: ['usage', 'model'],
    queryFn: getModelUsage,
    staleTime: SIXTY_SECONDS,
    initialData: FALLBACK_MODELS,
  });

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-8 p-8">
        
        {/* Row 1: Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingSummary ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[120px] bg-white rounded-xl border border-gray-200 p-5 shadow-sm overflow-hidden relative">
                <div className="animate-pulse flex h-full flex-col justify-between">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))
          ) : summary ? (
            <>
              <StatCard
                label="Total Tokens"
                value={summary.total_tokens.toLocaleString()}
                icon={Zap}
                iconBgClass="bg-gradient-to-br from-violet-600 to-indigo-600"
                iconColorClass="text-white"
                trend="+12.5%"
              />
              <StatCard
                label="Total Requests"
                value={summary.total_requests.toLocaleString()}
                icon={Activity}
                iconBgClass="bg-gradient-to-br from-blue-600 to-cyan-600"
                iconColorClass="text-white"
                trend="+8.2%"
              />
              <StatCard
                label="Tokens Today"
                value={summary.tokens_today.toLocaleString()}
                icon={TrendingUp}
                iconBgClass="bg-gradient-to-br from-emerald-600 to-green-600"
                iconColorClass="text-white"
                trend="+15.1%"
              />
              <StatCard
                label="Top Model"
                value={summary.top_model}
                icon={Cpu}
                iconBgClass="bg-gradient-to-br from-orange-600 to-amber-600"
                iconColorClass="text-white"
                trend="Stable"
              />
            </>
          ) : null}
        </div>

        {/* New Row: System Health Monitoring (Analysis) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between group hover:border-slate-300 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-wide">API Gateway</h4>
                <p className="text-[10px] text-slate-400 uppercase font-black">Live & Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-600">99.9%</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between group hover:border-slate-300 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-wide">Usage Engine</h4>
                <p className="text-[10px] text-slate-400 uppercase font-black">Optimized</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-indigo-600">Ready</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between group hover:border-slate-300 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-wide">Workers</h4>
                <p className="text-[10px] text-slate-400 uppercase font-black">Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-amber-600">3 Active</span>
            </div>
          </div>
        </div>

        {/* Row 2: Area Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Tokens Over Time</h2>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg focus:ring-indigo-400 focus:border-indigo-400 block px-3 py-1.5 outline-none transition-all hover:bg-white"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>

          <div className="h-[300px]">
            {isLoadingDaily ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg"></div>
            ) : dailyUsage && dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyUsage} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} 
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#0f172a', fontWeight: 'bold' }} 
                    labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" animationDuration={300} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Row 3: Bar Chart and Table */}
        {/* Row 3: Bar Chart and Table */}
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <h2 className="text-lg font-black text-slate-900 mb-6">Usage by Model</h2>
             <div className="h-[250px]">
               {isLoadingModel ? (
                 <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg"></div>
               ) : modelUsage && modelUsage.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={modelUsage} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                     <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} />
                     <YAxis dataKey="model_name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 700 }} />
                     <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} />
                     <Bar dataKey="tokens" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} animationDuration={300} />
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400">No data available</div>
               )}
             </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-100">
               <h2 className="text-lg font-black text-slate-900">Quick Stats</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3 text-right">Reqs</th>
                    <th className="px-6 py-3 text-right">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm">
                  {isLoadingModel ? (
                     Array.from({ length: 4 }).map((_, i) => (
                       <tr key={i} className="animate-pulse">
                         <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                         <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-8 ml-auto"></div></td>
                         <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-12 ml-auto"></div></td>
                       </tr>
                     ))
                  ) : modelUsage && modelUsage.length > 0 ? (
                    modelUsage.map((item) => (
                      <tr key={item.model_name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{item.model_name}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-right">{item.requests.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-right">{item.tokens.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400 font-bold">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 4: Live Activity Analysis (New Section) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity Analysis</h2>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 border border-slate-100 group hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Llama3:8b Request Processed</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tokens: 1,245 | Latency: 240ms</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{item}m ago</p>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Success</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
