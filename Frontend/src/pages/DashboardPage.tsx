import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell,
} from 'recharts';
import { Eye, Users, MousePointerClick, ShoppingCart, MoreHorizontal, Star } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { getSummary, getDailyUsage, getModelUsage } from '../api/usage';

const SIXTY_SECONDS = 60 * 1000;

/* ── Fallback data ──────────────────────────────────────────── */
const FALLBACK_SUMMARY = {
  total_tokens: 1_425_000,
  total_requests: 12_450,
  tokens_today: 45_000,
  top_model: 'llama3:8b',
};

const FALLBACK_DAILY = [
  { date: new Date(Date.now() - 6 * 86400000).toISOString(), tokens: 12000, prev: 10000 },
  { date: new Date(Date.now() - 5 * 86400000).toISOString(), tokens: 15000, prev: 13000 },
  { date: new Date(Date.now() - 4 * 86400000).toISOString(), tokens: 13000, prev: 16000 },
  { date: new Date(Date.now() - 3 * 86400000).toISOString(), tokens: 20000, prev: 14000 },
  { date: new Date(Date.now() - 2 * 86400000).toISOString(), tokens: 25000, prev: 18000 },
  { date: new Date(Date.now() - 1 * 86400000).toISOString(), tokens: 35000, prev: 22000 },
  { date: new Date().toISOString(),                            tokens: 45000, prev: 30000 },
];

const FALLBACK_MODELS = [
  { model_name: 'llama3:8b',    requests: 5800, tokens: 680000 },
  { model_name: 'gemma:7b',     requests: 3200, tokens: 410000 },
  { model_name: 'mixtral:8x7b', requests: 1450, tokens: 220000 },
  { model_name: 'phi3:mini',    requests: 2000, tokens: 115000 },
];

const WEEKLY_ACTIVITY = [
  { day: 'Sun', value: 320 },
  { day: 'Mon', value: 450 },
  { day: 'Tue', value: 820 },
  { day: 'Wed', value: 390 },
  { day: 'Thu', value: 610 },
  { day: 'Fri', value: 280 },
  { day: 'Sat', value: 190 },
];

const TOP_KEYS = [
  { id: '#K-0012', label: 'Production API',    model: 'llama3:8b',    requests: 2310, revenue: '$124.83', rating: 5.0 },
  { id: '#K-0008', label: 'Dev Workspace',      model: 'gemma:7b',     requests: 1230, revenue: '$92.66',  rating: 4.8 },
  { id: '#K-0004', label: 'Analytics Pipeline', model: 'mixtral:8x7b', requests:  812, revenue: '$74.04',  rating: 4.7 },
  { id: '#K-0019', label: 'Mobile App',          model: 'phi3:mini',    requests:  640, revenue: '$41.20',  rating: 4.5 },
];

const CUSTOMER_SEGMENTS = [
  { label: 'Production Keys', count: '2,884', color: '#2563eb' },
  { label: 'Dev Keys',        count: '1,432', color: '#16a34a' },
  { label: 'Trial Keys',      count: '562',   color: '#d97706' },
];

/* ── Custom tooltip shared style ──────────────────────────────── */
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
  label?: string;
}

const LightTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '10px 14px', fontSize: 12 }}>
      {label && (
        <p style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 11 }}>
          {label ? new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : label}
        </p>
      )}
      {payload.map((p) => (
        <p key={p.name} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          <span style={{ color: p.color ?? 'var(--brand)' }}>
            {Number(p.value).toLocaleString()}
          </span>{' '}
          {p.name}
        </p>
      ))}
    </div>
  );
};

const BarTooltipLight = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '8px 12px', fontSize: 12 }}>
      {payload.map((p) => (
        <p key={p.name} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {Number(p.value).toLocaleString()} reqs
        </p>
      ))}
    </div>
  );
};

/* ── Gauge (repeat rate ring) ─────────────────────────────────── */
function GaugeChart({ value }: { value: number }) {
  const r = 60;
  const circ = Math.PI * r;               // half circle
  const fill = circ * (value / 100);
  const gray = circ - fill;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 90" style={{ width: '100%', maxWidth: 180 }}>
        {/* Gray track */}
        <path
          d={`M10,80 A${r},${r} 0 0,1 150,80`}
          fill="none"
          stroke="#e8eaed"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Colored fill — gradient from blue to green */}
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
        <path
          d={`M10,80 A${r},${r} 0 0,1 150,80`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${gray}`}
        />
        {/* Center label */}
        <text x="80" y="78" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1a1d23">
          {value}%
        </text>
        <text x="80" y="92" textAnchor="middle" fontSize="9" fill="#9ba3af">
          On track for 80% target
        </text>
      </svg>
    </div>
  );
}

/* ── Star Rating ─────────────────────────────────────────────── */
function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star className="w-3 h-3" style={{ fill: '#f59e0b', color: '#f59e0b' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        ({value.toFixed(1)})
      </span>
    </span>
  );
}

/* ── Dashboard ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [days, setDays] = useState<number>(30);

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
      <div className="p-6 sm:p-8 space-y-6">

        {/* ── Row 1: KPI cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {isLoadingSummary ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="flex justify-between"><div className="skeleton h-4 w-24" /><div className="skeleton h-8 w-8 rounded-lg" /></div>
                <div className="skeleton h-8 w-28" />
                <div className="skeleton h-3 w-36" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                label="Total Tokens"
                value={summary ? (summary.total_tokens / 1000).toFixed(1) + 'K' : '—'}
                icon={Eye}
                iconColor="#2563eb"
                trend="+15.5%"
                vsLabel={`vs. ${((summary?.total_tokens ?? 0) * 0.87 / 1000).toFixed(1)}K last period`}
              />
              <StatCard
                label="Total Requests"
                value={summary?.total_requests.toLocaleString() ?? '—'}
                icon={Users}
                iconColor="#16a34a"
                trend="+8.4%"
                vsLabel={`vs. ${((summary?.total_requests ?? 0) * 0.92).toLocaleString()} last period`}
              />
              <StatCard
                label="Tokens Today"
                value={summary?.tokens_today.toLocaleString() ?? '—'}
                icon={MousePointerClick}
                iconColor="#dc2626"
                trend="-10.5%"
                vsLabel={`vs. ${((summary?.tokens_today ?? 0) * 1.12).toLocaleString()} last period`}
              />
              <StatCard
                label="Top Model"
                value={summary?.top_model ?? '—'}
                icon={ShoppingCart}
                iconColor="#d97706"
                trend="+4.4%"
                vsLabel="vs. gemma:7b last period"
              />
            </>
          )}
        </div>

        {/* ── Row 2: Area chart + sidebar panels ────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Total Profit-style area chart — spanning 2/3 */}
          <div className="xl:col-span-2 card p-6">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Total Token Usage
                </h2>
                {/* Big number + trend, matching reference "Total Profit" block */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {summary ? (summary.total_tokens / 1000).toFixed(1) + 'K' : '—'}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full trend-up">
                    +24.4%
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs. last period</span>
                </div>
              </div>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="btn-secondary text-[12px] cursor-pointer"
                style={{ fontFamily: 'inherit' }}
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
            </div>

            <div style={{ height: 200 }}>
              {isLoadingDaily ? (
                <div className="skeleton w-full h-full rounded-xl" />
              ) : dailyUsage && dailyUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyUsage} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tokenFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="prevFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#94a3b8" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      tick={{ fill: '#9ba3af', fontSize: 10, fontWeight: 500 }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ba3af', fontSize: 10, fontWeight: 500 }}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                      width={32}
                    />
                    <RechartsTooltip content={<LightTooltip />} />
                    {/* Previous period — dashed */}
                    <Area
                      type="monotone"
                      dataKey="prev"
                      stroke="#cbd5e1"
                      strokeWidth={1.5}
                      strokeDasharray="5 3"
                      fill="url(#prevFill)"
                      dot={false}
                      animationDuration={400}
                    />
                    {/* Current period — solid blue */}
                    <Area
                      type="monotone"
                      dataKey="tokens"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#tokenFill)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={400}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No data available
                </div>
              )}
            </div>

            {/* Customer-style segment bars — matching reference bottom "Customers" strip */}
            <div
              className="mt-5 pt-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>API Keys</p>
                <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                {CUSTOMER_SEGMENTS.map((seg) => (
                  <div key={seg.label}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: seg.color }} />
                      <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{seg.count}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{seg.label}</p>
                    <div className="progress-bar mt-2">
                      <div
                        className="progress-fill"
                        style={{
                          background: seg.color,
                          width: `${Math.min(100, parseInt(seg.count.replace(',', '')) / 30)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: "Most Day Active" bar + "Repeat Customer Rate" gauge */}
          <div className="flex flex-col gap-4">

            {/* Most Day Active → Most Active Day (requests by day of week) */}
            <div className="card p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Most Active Day</h3>
                <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal className="w-4 h-4" /></button>
              </div>

              {/* Peak value callout */}
              <p className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {Math.max(...WEEKLY_ACTIVITY.map((d) => d.value)).toLocaleString()}
              </p>

              <div style={{ height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_ACTIVITY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ba3af', fontSize: 9, fontWeight: 600 }}
                    />
                    <RechartsTooltip content={<BarTooltipLight />} cursor={{ fill: '#f5f6fa' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={18} animationDuration={400}>
                      {WEEKLY_ACTIVITY.map((entry, index) => {
                        const isTue = entry.day === 'Tue';
                        return <Cell key={`cell-${index}`} fill={isTue ? '#2563eb' : '#e2e8f0'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Repeat Customer Rate → Model Success Rate gauge */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Success Rate</h3>
                <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <GaugeChart value={68} />
              <button
                className="mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: '#f5f6fa', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Show details
              </button>
            </div>
          </div>
        </div>

        {/* ── Row 3: Best Selling → Top API Keys table + AI Assistant-style panel ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Full-width table (like "Best Selling Products") */}
          <div className="xl:col-span-2 card overflow-hidden">
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Top API Keys
              </h3>
              <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal className="w-4 h-4" /></button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Label</th>
                  <th style={{ textAlign: 'right' }}>Requests</th>
                  <th style={{ textAlign: 'right' }}>Est. Cost</th>
                  <th style={{ textAlign: 'right' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingModel ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j}><div className="skeleton h-4 rounded" style={{ width: j === 1 ? 120 : 60 }} /></td>
                      ))}
                    </tr>
                  ))
                ) : (
                  TOP_KEYS.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{row.id}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: 'var(--brand)' }}
                          >
                            {row.label[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{row.label}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{row.model}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {row.requests.toLocaleString()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="text-xs font-semibold trend-up px-1.5 py-0.5 rounded-full inline-block">
                          {row.revenue}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <StarRating value={row.rating} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Model usage quick panel (right column) */}
          <div className="card overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Model Usage</h3>
              <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {(isLoadingModel ? FALLBACK_MODELS : (modelUsage ?? FALLBACK_MODELS)).map((item, i) => {
                const max = Math.max(...(modelUsage ?? FALLBACK_MODELS).map((m) => m.tokens));
                const pct = Math.round((item.tokens / max) * 100);
                const colors = ['#2563eb', '#16a34a', '#d97706', '#7c3aed'];
                return (
                  <div key={item.model_name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {item.model_name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(item.tokens / 1000).toFixed(0)}K tokens
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ background: colors[i % colors.length], width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.requests.toLocaleString()} requests
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
