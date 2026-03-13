import { useEffect, useState, type ReactNode } from 'react';
import { Activity, Clock, Users } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { KPIStatCard } from '../components/KPIStatCard';

const PIE_COLORS = ['#F40009', '#0066cc', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6b7280'];
const SCREEN_LABELS: Record<string, string> = {
  'login': 'Login', 'master': 'Home', 'learning-dashboard': 'L. Dashboard',
  'learning-chat': 'L. Chat', 'learning-generating': 'Generating', 'learning-results': 'L. Results',
  'ai-welcome': 'AI Welcome', 'ai-selection': 'AI Selection', 'ai-comparison': 'AI Compare',
  'ai-execution': 'AI Execution', 'ai-promo-game': 'Promo Game', 'ai-supply-chain-game': 'Supply Chain',
  'ai-finance-game': 'Finance Game', 'admin-dashboard': 'Admin',
};

interface Props { apiBase: string; filterFunction: string; filterLevel: string; }

interface EngagementData {
  kpis: { wau: number; mau: number; avg_weekly_time_minutes: number };
  time_per_screen: { screen: string; minutes: number }[];
  active_by_function: { function: string; count: number }[];
  active_by_level: { level: string; count: number }[];
  avg_time_by_function: { function: string; avg_minutes: number }[];
  avg_time_by_level: { level: string; avg_minutes: number }[];
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-5">{title}</h3>
      {children}
    </div>
  );
}

export function UserEngagementPage({ apiBase, filterFunction, filterLevel }: Props) {
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterFunction) params.set('function', filterFunction);
    if (filterLevel) params.set('level', filterLevel);
    fetch(`${apiBase}/analytics/admin/engagement?${params}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [apiBase, filterFunction, filterLevel]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, time_per_screen, active_by_function, active_by_level, avg_time_by_function, avg_time_by_level } = data;

  const screenData = time_per_screen.map(d => ({
    name: SCREEN_LABELS[d.screen] ?? d.screen,
    minutes: d.minutes,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPIStatCard title="Weekly Active Users" value={kpis.wau} subtitle="active in last 7 days"
          icon={<Activity className="w-5 h-5 text-[#F40009]" />} iconBg="bg-red-50" />
        <KPIStatCard title="Monthly Active Users" value={kpis.mau} subtitle="active in last 30 days"
          icon={<Users className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" accentColor="#0066cc" />
        <KPIStatCard title="Avg Weekly Time" value={`${kpis.avg_weekly_time_minutes}m`} subtitle="per active user this week"
          icon={<Clock className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" accentColor="#10b981" />
      </div>

      <ChartCard title="Average Time per Screen (minutes)">
        {screenData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={screenData} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="minutes" name="Minutes" fill="#F40009" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Active Users by Function">
          {active_by_function.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
              <PieChart width={240} height={200}>
                <Pie
                  data={active_by_function}
                  dataKey="count"
                  nameKey="function"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  strokeWidth={0}
                >
                  {active_by_function.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
                />
              </PieChart>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
                {active_by_function.map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {item.function} ({item.count})
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Active Users by Level">
          {active_by_level.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
              <PieChart width={240} height={200}>
                <Pie
                  data={active_by_level}
                  dataKey="count"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  strokeWidth={0}
                >
                  {active_by_level.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
                />
              </PieChart>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
                {active_by_level.map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {item.level} ({item.count})
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Average Time by Function (min/week)">
          {avg_time_by_function.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={avg_time_by_function} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="function" type="category" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="avg_minutes" name="Avg Min" fill="#0066cc" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Average Time by Level (min/week)">
          {avg_time_by_level.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={avg_time_by_level} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="level" type="category" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="avg_minutes" name="Avg Min" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
