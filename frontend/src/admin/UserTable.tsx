import { useState } from 'react';
import { ChevronUp, ChevronDown, Star, Users } from 'lucide-react';

export interface UserSummary {
  username: string;
  total_sessions: number;
  total_time_seconds: number;
  learning_paths_created: number;
  average_rating: number | null;
}

interface UserTableProps {
  users: UserSummary[];
  loading: boolean;
}

type SortKey = 'username' | 'total_sessions' | 'total_time_seconds' | 'learning_paths_created' | 'average_rating';
type SortDir = 'asc' | 'desc';

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
    </div>
  );
}

export function UserTable({ users, loading }: UserTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('total_sessions');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...users].sort((a, b) => {
    const aVal = a[sortKey] ?? -1;
    const bVal = b[sortKey] ?? -1;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3.5 h-3.5 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-[#F40009]" />
      : <ChevronDown className="w-3.5 h-3.5 text-[#F40009]" />;
  };

  const ColHeader = ({ label, col }: { label: string; col: SortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none"
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon col={col} />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#F40009]" />
          <h3 className="font-semibold text-gray-900">User Activity</h3>
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {users.length} users
        </span>
      </div>

      {users.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No user data yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <ColHeader label="User" col="username" />
                <ColHeader label="Sessions" col="total_sessions" />
                <ColHeader label="Time Spent" col="total_time_seconds" />
                <ColHeader label="Learning Paths" col="learning_paths_created" />
                <ColHeader label="Avg. Rating" col="average_rating" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((user) => (
                <tr
                  key={user.username}
                  className="hover:bg-red-50/30 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F40009] to-[#DC0012] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                        {user.username.replace('@cchellenic.com', '')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {user.total_sessions}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatTime(user.total_time_seconds)}
                  </td>
                  <td className="px-4 py-3">
                    {user.learning_paths_created > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {user.learning_paths_created}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StarRating value={user.average_rating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
