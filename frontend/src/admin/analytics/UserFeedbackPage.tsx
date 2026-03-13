import { useEffect, useState, type ReactNode } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props { apiBase: string; filterFunction: string; filterLevel: string; }

interface RatedItem { name: string; avg_rating: number; count: number; }
interface FeedbackData {
  highest_rated: RatedItem[];
  lowest_rated: RatedItem[];
  feedback_by_function: { function: string; avg_rating: number; count: number }[];
  feedback_by_level: { level: string; avg_rating: number; count: number }[];
  game_mentions: { game: string; mentions: number }[];
  total_ratings: number;
  overall_avg_rating: number;
  comments: string[];
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-5">{title}</h3>
      {children}
    </div>
  );
}

function StarBar({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

function RatedList({ items, icon, emptyMsg }: { items: RatedItem[]; icon: ReactNode; emptyMsg: string }) {
  if (items.length === 0) return <p className="text-sm text-gray-400 py-4 text-center">{emptyMsg}</p>;
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-400 text-xs font-bold w-5 flex-shrink-0">#{i + 1}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-400">{item.count} rating{item.count !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {icon}
            <StarBar rating={item.avg_rating} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserFeedbackPage({ apiBase, filterFunction, filterLevel }: Props) {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterFunction) params.set('function', filterFunction);
    if (filterLevel) params.set('level', filterLevel);
    fetch(`${apiBase}/analytics/admin/feedback?${params}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [apiBase, filterFunction, filterLevel]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-2xl font-bold text-gray-900">
            {data.total_ratings > 0 ? data.overall_avg_rating.toFixed(1) : '—'}
          </span>
          <span className="text-sm text-gray-500">avg platform rating</span>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600"><span className="font-semibold text-gray-900">{data.total_ratings}</span> ratings submitted</span>
        </div>
      </div>

      {/* Highest / Lowest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Highest Rated Paths">
          <RatedList items={data.highest_rated} icon={<ThumbsUp className="w-4 h-4 text-emerald-500" />} emptyMsg="No ratings yet" />
        </ChartCard>
        <ChartCard title="Lowest Rated Paths">
          <RatedList items={data.lowest_rated} icon={<ThumbsDown className="w-4 h-4 text-red-400" />} emptyMsg="No ratings yet" />
        </ChartCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Feedback by Function">
          {data.feedback_by_function.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.feedback_by_function} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="function" type="category" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="avg_rating" name="Avg Rating" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Feedback by Level">
          {data.feedback_by_level.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.feedback_by_level} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="level" type="category" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="avg_rating" name="Avg Rating" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {data.game_mentions.length > 0 && (
        <ChartCard title="Game Mentions in Comments">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.game_mentions} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="game" tick={{ fontSize: 12, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="mentions" name="Mentions" fill="#F40009" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {data.comments.length > 0 && (
        <ChartCard title="Recent User Comments">
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {data.comments.slice().reverse().map((comment, i) => (
              <div key={i} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                <MessageSquare className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{comment}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
