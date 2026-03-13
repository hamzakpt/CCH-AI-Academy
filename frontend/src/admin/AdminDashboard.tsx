import { useState, useEffect } from 'react';
import { LogOut, RefreshCw, ShieldCheck, ChevronDown } from 'lucide-react';
import hellenLogo from '@learning-path/assets/hellen-logo-transparent-background.png';
import { UserGrowthPage } from './analytics/UserGrowthPage';
import { UserEngagementPage } from './analytics/UserEngagementPage';
import { PerUserAnalyticsPage } from './analytics/PerUserAnalyticsPage';
import { UserFeedbackPage } from './analytics/UserFeedbackPage';

interface AdminDashboardProps {
  onLogout: () => void;
  apiBase: string;
}

type Tab = 'growth' | 'engagement' | 'per-user' | 'feedback';

const TABS: { key: Tab; label: string }[] = [
  { key: 'growth', label: 'User Base Growth' },
  { key: 'engagement', label: 'User Engagement' },
  { key: 'per-user', label: 'Per User Analytics' },
  { key: 'feedback', label: 'User Feedback' },
];

export function AdminDashboard({ onLogout, apiBase }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('growth');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Filters
  const [filterFunction, setFilterFunction] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [functions, setFunctions] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/analytics/admin/filter-options`)
      .then(r => r.json())
      .then(d => { setFunctions(d.functions); setLevels(d.levels); })
      .catch(() => {});
  }, [apiBase]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(k => k + 1);
    setLastRefreshed(new Date());
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const selectClass = "text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 appearance-none pr-8 cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* ── Header ───────────────────────────────── */}
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
                <p className="text-xs text-gray-500 mt-0.5">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium hidden sm:block">Refresh</span>
              </button>
              <button onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#F40009] hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</span>

          {/* Function filter */}
          <div className="relative">
            <select value={filterFunction} onChange={e => setFilterFunction(e.target.value)} className={selectClass}>
              <option value="">All Functions</option>
              {functions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Level filter */}
          <div className="relative">
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className={selectClass}>
              <option value="">All Levels</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(filterFunction || filterLevel) && (
            <button onClick={() => { setFilterFunction(''); setFilterLevel(''); }}
              className="text-xs text-[#F40009] hover:underline font-medium">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-[#F40009] text-[#F40009]'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page Content ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'growth' && (
          <UserGrowthPage key={`growth-${refreshKey}`} apiBase={apiBase} filterFunction={filterFunction} filterLevel={filterLevel} />
        )}
        {activeTab === 'engagement' && (
          <UserEngagementPage key={`engagement-${refreshKey}`} apiBase={apiBase} filterFunction={filterFunction} filterLevel={filterLevel} />
        )}
        {activeTab === 'per-user' && (
          <PerUserAnalyticsPage key={`peruser-${refreshKey}`} apiBase={apiBase} filterFunction={filterFunction} filterLevel={filterLevel} />
        )}
        {activeTab === 'feedback' && (
          <UserFeedbackPage key={`feedback-${refreshKey}`} apiBase={apiBase} filterFunction={filterFunction} filterLevel={filterLevel} />
        )}

        <footer className="pt-8 pb-4 text-center">
          <p className="text-xs text-gray-400">CCH AI Academy · Admin Analytics · Powered by Hellen+</p>
        </footer>
      </div>
    </div>
  );
}
