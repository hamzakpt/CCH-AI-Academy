import { useEffect, useState, type ReactNode } from 'react';
import { Users, TrendingUp, UserPlus, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { KPIStatCard } from '../components/KPIStatCard';

const PIE_COLORS = ['#F40009', '#0066cc', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6b7280'];

interface Props { apiBase: string; filterFunction: string; filterLevel: string; }

interface GrowthData {
  kpis: { current_week_users: number; prev_week_users: number; new_users_this_week: number; wow_growth_pct: number; total_users: number };
  weekly_trend: { week: string; new_users: number; cumulative: number }[];
  by_function: { function: string; count: number }[];
  by_level: { level: string; count: number }[];
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-5">{title}</h3>
      {children}
    </div>
  );
}

export function UserGrowthPage({ apiBase, filterFunction, filterLevel }: Props) {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterFunction) params.set('function', filterFunction);
    if (filterLevel) params.set('level', filterLevel);
    fetch(`${apiBase}/analytics/admin/growth?${params}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [apiBase, filterFunction, filterLevel]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, weekly_trend, by_function, by_level } = data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard
          title="Current Week Users"
          value={kpis.current_week_users}
          subtitle="joined this week"
          icon={<Users className="w-5 h-5 text-[#F40009]" />}
          iconBg="bg-red-50"
        />
        <KPIStatCard
          title="Previous Week Users"
          value={kpis.prev_week_users}
          subtitle="joined last week"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          accentColor="#0066cc"
        />
        <KPIStatCard
          title="New Users This Week"
          value={kpis.new_users_this_week}
          subtitle="registrations"
          icon={<UserPlus className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          accentColor="#10b981"
        />
        <KPIStatCard
          title="Week-over-Week Growth"
          value={`${kpis.wow_growth_pct}%`}
          trend={{ value: kpis.wow_growth_pct, label: 'vs last week' }}
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50"
          accentColor="#8b5cf6"
        />
      </div>

      {/* Charts row */}
      <ChartCard title="User Growth Trend — Last 8 Weeks">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weekly_trend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="cumulative" name="Cumulative Users" stroke="#F40009" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="new_users" name="New Users" stroke="#0066cc" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Breakdown by Function">
          {by_function.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={by_function} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="function" type="category" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="count" name="Users" fill="#F40009" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Breakdown by Level">
          {by_level.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <div className="flex items-center justify-center">
              <PieChart width={360} height={240}>
                <Pie
                  data={by_level}
                  dataKey="count"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  strokeWidth={0}
                  label={false}
                >
                  {by_level.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} users`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: 12
                  }}
                />
                <Legend />
              </PieChart>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
