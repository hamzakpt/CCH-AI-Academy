import { useEffect, useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { UserDetailModal } from '../UserDetailModal';

interface Props { apiBase: string; filterFunction: string; filterLevel: string; }

interface UserRow {
  username: string; function: string; level: string;
  total_time_minutes: number; weekly_avg_minutes: number;
  total_logins: number; weekly_logins: number;
  planned_hours_per_week: number; created_at: string;
}
interface PerUserData {
  users: UserRow[];
  avg_by_function: { function: string; avg_total_time: number; avg_weekly_time: number; avg_logins: number }[];
  avg_by_level: { level: string; avg_total_time: number; avg_weekly_time: number; avg_logins: number }[];
  planned_vs_actual: { username: string; planned_minutes: number; actual_minutes: number }[];
}

type SubTab = 'overview' | 'time' | 'logins';
type SortKey = 'username' | 'total_time_minutes' | 'weekly_avg_minutes' | 'total_logins' | 'weekly_logins';
type SortDir = 'asc' | 'desc';

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-5">{title}</h3>
      {children}
    </div>
  );
}

export function PerUserAnalyticsPage({ apiBase, filterFunction, filterLevel }: Props) {
  const [data, setData] = useState<PerUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [sortKey, setSortKey] = useState<SortKey>('total_time_minutes');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterFunction) params.set('function', filterFunction);
    if (filterLevel) params.set('level', filterLevel);
    fetch(`${apiBase}/analytics/admin/per-user?${params}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [apiBase, filterFunction, filterLevel]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-56" />
          ))}
        </div>
      </div>
    );
  }

  const sorted = [...data.users].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#F40009]" /> : <ChevronDown className="w-3 h-3 text-[#F40009]" />;
  };

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'time', label: 'Time Analysis' },
    { key: 'logins', label: 'Login Patterns' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab nav */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === t.key ? 'bg-white text-[#F40009] shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">User Activity Table</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{data.users.length} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {([
                  { label: 'User', col: 'username' as SortKey },
                  { label: 'Total Time (min)', col: 'total_time_minutes' as SortKey },
                  { label: 'Weekly Avg (min)', col: 'weekly_avg_minutes' as SortKey },
                  { label: 'Total Logins', col: 'total_logins' as SortKey },
                  { label: 'Weekly Logins', col: 'weekly_logins' as SortKey },
                ] as { label: string; col: SortKey }[]).map(({ label, col }) => (
                  <th key={col} onClick={() => handleSort(col)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none">
                    <div className="flex items-center gap-1">{label}<SortIcon col={col} /></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(user => (
                <tr key={user.username} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedUser(user.username)}
                      className="flex items-center gap-2 group text-left">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F40009] to-[#DC0012] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[#F40009] underline underline-offset-2 decoration-transparent group-hover:decoration-[#F40009] transition-all">
                        {user.username.replace('@cchellenic.com', '')}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.total_time_minutes}</td>
                  <td className="px-4 py-3 text-gray-700">{user.weekly_avg_minutes}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {user.total_logins}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      {user.weekly_logins}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-tab content */}
      {subTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Avg Metrics by Function">
            {data.avg_by_function.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.avg_by_function} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="function" type="category" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="avg_total_time" name="Total Time (min)" fill="#F40009" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="avg_weekly_time" name="Weekly Time (min)" fill="#fca5a5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Avg Metrics by Level">
            {data.avg_by_level.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.avg_by_level} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="level" type="category" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="avg_total_time" name="Total Time (min)" fill="#0066cc" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="avg_weekly_time" name="Weekly Time (min)" fill="#93c5fd" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}

      {subTab === 'time' && (
        <ChartCard title="Planned vs Actual Weekly Time (minutes)">
          {data.planned_vs_actual.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No planned time data — users haven't set a time commitment.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.planned_vs_actual} margin={{ top: 0, right: 0, left: -8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="username" tick={{ fontSize: 10, fill: '#6b7280', angle: -30, textAnchor: 'end' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="planned_minutes" name="Planned (min)" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_minutes" name="Actual (min)" fill="#F40009" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      {subTab === 'logins' && (
        <ChartCard title="Login Frequency per User">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sorted.slice(0, 20)} margin={{ top: 0, right: 0, left: -8, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="username"
                tickFormatter={(v: string) => v.replace('@cchellenic.com', '')}
                tick={{ fontSize: 10, fill: '#6b7280', angle: -30, textAnchor: 'end' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: unknown, name: string) => [val, name]}
                labelFormatter={(label: string) => label.replace('@cchellenic.com', '')}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="total_logins" name="Total Logins" fill="#0066cc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="weekly_logins" name="This Week" fill="#F40009" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {selectedUser && (
        <UserDetailModal username={selectedUser} apiBase={apiBase} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
