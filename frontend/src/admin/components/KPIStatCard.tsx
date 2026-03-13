import type { ReactNode } from 'react';

interface KPIStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon: ReactNode;
  iconBg: string;
  accentColor?: string;
}

export function KPIStatCard({ title, value, subtitle, trend, icon, iconBg, accentColor = '#F40009' }: KPIStatCardProps) {
  const trendPositive = trend && trend.value >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-5 -translate-y-8 translate-x-8"
        style={{ backgroundColor: accentColor }} />
      <div className="relative">
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-semibold ${trendPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {trendPositive ? '▲' : '▼'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-gray-400">{trend.label}</span>
          </div>
        )}
        {subtitle && !trend && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
