import { useState, useEffect } from 'react';
import { LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import hellenLogo from '@learning-path/assets/hellen-logo-transparent-background.png';
import { AnalyticsCards } from './AnalyticsCards';
import { AnalyticsCharts } from './AnalyticsCharts';
import { UserTable } from './UserTable';
import type { UserSummary } from './UserTable';

interface AdminDashboardProps {
  onLogout: () => void;
  apiBase: string;
}

interface AdminAnalytics {
  platform_metrics: {
    total_users: number;
    total_sessions: number;
    avg_session_duration_seconds: number;
    total_time_seconds: number;
  };
  screen_analytics: {
    most_visited: { screen: string; visits: number }[];
    time_per_screen: { screen: string; seconds: number }[];
  };
  ai_game_analytics: {
    plays: { game: string; count: number }[];
  };
  learning_analytics: {
    total_created: number;
    total_completed: number;
    completion_rate: number;
  };
  ratings_analytics: {
    average_rating: number;
    total_ratings: number;
  };
  users: UserSummary[];
}

export function AdminDashboard({ onLogout, apiBase }: AdminDashboardProps) {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/analytics/admin`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json: AdminAnalytics = await res.json();
      setData(json);
      setLastRefreshed(new Date());
    } catch (err) {
      setError('Failed to load analytics. Make sure the backend server is running.');
      console.error('[AdminDashboard] fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={hellenLogo} alt="Hellen+" className="h-12" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F40009]/10 text-[#F40009] rounded-full text-xs font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Refresh button */}
              <button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium hidden sm:block">Refresh</span>
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#F40009] hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#F40009] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">!</div>
            <div>
              <p className="text-sm font-semibold text-red-800">Analytics Unavailable</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
              <button
                onClick={() => fetchData()}
                className="mt-2 text-sm font-medium text-[#F40009] hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Section: Platform Metrics */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Platform Metrics</h2>
            <p className="text-sm text-gray-500">Platform-wide usage at a glance</p>
          </div>
          <AnalyticsCards
            metrics={data?.platform_metrics ?? null}
            loading={loading}
          />
        </section>

        {/* Section: Analytics Charts */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Usage Analytics</h2>
            <p className="text-sm text-gray-500">Screen activity, game play counts, and learning outcomes</p>
          </div>
          <AnalyticsCharts
            mostVisited={data?.screen_analytics.most_visited ?? []}
            timePerScreen={data?.screen_analytics.time_per_screen ?? []}
            gamePlays={data?.ai_game_analytics.plays ?? []}
            learningAnalytics={data?.learning_analytics ?? null}
            ratingsAnalytics={data?.ratings_analytics ?? null}
            loading={loading}
          />
        </section>

        {/* Section: User Table */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">User Activity</h2>
            <p className="text-sm text-gray-500">Per-user breakdown — click column headers to sort</p>
          </div>
          <UserTable
            users={data?.users ?? []}
            loading={loading}
          />
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-8 text-center">
          <p className="text-xs text-gray-400">CCH AI Academy · Admin Analytics · Powered by Hellen+</p>
        </footer>
      </div>
    </div>
  );
}
