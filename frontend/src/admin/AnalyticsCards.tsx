import { Users, Activity, Clock, TrendingUp } from 'lucide-react';

interface PlatformMetrics {
  total_users: number;
  total_sessions: number;
  avg_session_duration_seconds: number;
  total_time_seconds: number;
}

interface AnalyticsCardsProps {
  metrics: PlatformMetrics | null;
  loading: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

function MetricCard({ title, value, subtitle, icon, gradient, iconBg }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden`}>
      {/* Subtle gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-5 rounded-full -translate-y-8 translate-x-8`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export function AnalyticsCards({ metrics, loading }: AnalyticsCardsProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
            <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-1" />
            <div className="h-2 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: metrics.total_users.toLocaleString(),
      subtitle: 'Registered on the platform',
      icon: <Users className="w-6 h-6 text-[#F40009]" />,
      gradient: 'bg-[#F40009]',
      iconBg: 'bg-red-50',
    },
    {
      title: 'Total Sessions',
      value: metrics.total_sessions.toLocaleString(),
      subtitle: 'Login sessions recorded',
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      gradient: 'bg-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Avg. Session Duration',
      value: formatDuration(metrics.avg_session_duration_seconds),
      subtitle: 'Per active session',
      icon: <Clock className="w-6 h-6 text-emerald-600" />,
      gradient: 'bg-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Total Platform Time',
      value: formatDuration(metrics.total_time_seconds),
      subtitle: 'Cumulative time spent',
      icon: <TrendingUp className="w-6 h-6 text-violet-600" />,
      gradient: 'bg-violet-600',
      iconBg: 'bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
