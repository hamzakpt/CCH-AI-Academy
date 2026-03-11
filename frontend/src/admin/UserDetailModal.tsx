import { useEffect, useState } from 'react';
import { X, Clock, Monitor, LogIn, LogOut, ChevronDown, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface ScreenVisit {
  screen: string;
  enter_time: string;
  exit_time: string;
  duration_seconds: number;
}

interface SessionDetail {
  session_id: number;
  login_time: string;
  logout_time: string | null;
  screens: ScreenVisit[];
}

interface UserDetail {
  username: string;
  sessions: SessionDetail[];
}

interface UserDetailModalProps {
  username: string;
  apiBase: string;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeOnly(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function sessionDuration(session: SessionDetail): string {
  if (!session.logout_time) return 'Active';
  const ms = new Date(session.logout_time).getTime() - new Date(session.login_time).getTime();
  return formatTime(Math.round(ms / 1000));
}

function SessionCard({ session, index }: { session: SessionDetail; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const duration = sessionDuration(session);
  const isActive = !session.logout_time;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Session Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {expanded
            ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Session #{session.session_id}
              {isActive && (
                <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDateTime(session.login_time)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {duration}
          </span>
          <span className="flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5" />
            {session.screens.length} screens
          </span>
        </div>
      </button>

      {/* Session Body */}
      {expanded && (
        <div className="px-4 pb-3 pt-2">
          {/* Login / Logout info */}
          <div className="flex gap-6 mb-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <LogIn className="w-3.5 h-3.5 text-green-500" />
              Login: {formatTimeOnly(session.login_time)}
            </span>
            <span className="flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              Logout: {session.logout_time ? formatTimeOnly(session.logout_time) : 'Still active'}
            </span>
          </div>

          {session.screens.length === 0 ? (
            <p className="text-xs text-gray-400 py-2 text-center">No screen activity recorded for this session.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2 text-left font-semibold">Screen</th>
                    <th className="px-3 py-2 text-left font-semibold">Enter</th>
                    <th className="px-3 py-2 text-left font-semibold">Exit</th>
                    <th className="px-3 py-2 text-right font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {session.screens.map((screen, i) => (
                    <tr key={i} className="hover:bg-red-50/20 transition-colors">
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#F40009]/30 flex-shrink-0" />
                          <span className="font-medium text-gray-800 truncate max-w-[160px]">
                            {screen.screen}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                        {formatTimeOnly(screen.enter_time)}
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                        {formatTimeOnly(screen.exit_time)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {formatTime(screen.duration_seconds)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function UserDetailModal({ username, apiBase, onClose }: UserDetailModalProps) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${apiBase}/analytics/user/${encodeURIComponent(username)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((json: UserDetail) => setData(json))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Failed to load user details.');
          console.error('[UserDetailModal]', err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [username, apiBase]);

  // Trap key: close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const displayName = username.replace('@cchellenic.com', '');
  const totalScreens = data?.sessions.reduce((sum, s) => sum + s.screens.length, 0) ?? 0;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal Panel */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: 'fadeSlideIn 0.2s ease-out' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F40009] to-[#DC0012] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{displayName}</h2>
              <p className="text-xs text-gray-500">Screen Activity · All Sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        {data && !loading && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-6 text-xs text-gray-600 flex-shrink-0">
            <span>
              <span className="font-semibold text-gray-900">{data.sessions.length}</span> sessions
            </span>
            <span>
              <span className="font-semibold text-gray-900">{totalScreens}</span> total screen visits
            </span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#F40009]" />
              <p className="text-sm">Loading activity for {displayName}…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && data?.sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <Monitor className="w-10 h-10 text-gray-300" />
              <p className="text-sm">No sessions recorded for this user yet.</p>
            </div>
          )}

          {!loading && !error && data?.sessions.map((session, i) => (
            <SessionCard key={session.session_id} session={session} index={i} />
          ))}
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
