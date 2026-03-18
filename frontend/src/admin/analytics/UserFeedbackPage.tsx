import { useEffect, useState, type ReactNode } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Gamepad2, GraduationCap, User, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props { apiBase: string; filterFunction: string; filterLevel: string; }

// Learning Path feedback types
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

// Scenario ratings types
interface ScenarioRating {
  id: number;
  scenarioId: string;
  username: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface ScenarioRatingSummary {
  scenarioId: string;
  averageRating: number;
  totalRatings: number;
  ratings: ScenarioRating[];
}

interface AllScenarioRatings {
  ratings: Record<string, ScenarioRatingSummary>;
}

type FeedbackTab = 'learning' | 'scenarios';

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

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Learning Path Feedback Content
function LearningFeedbackContent({ data }: { data: FeedbackData }) {
  return (
    <div className="space-y-6">
      {/* Stat summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-2xl font-bold text-gray-900">
            {data.total_ratings > 0 ? data.overall_avg_rating.toFixed(1) : '—'}
          </span>
          <span className="text-sm text-gray-500">avg rating</span>
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

// Scenario Feedback Content
function ScenarioFeedbackContent({ data }: { data: AllScenarioRatings }) {
  const scenarios = Object.values(data.ratings);

  // Calculate overall stats
  const totalRatings = scenarios.reduce((sum, s) => sum + s.totalRatings, 0);
  const overallAvg = totalRatings > 0
    ? scenarios.reduce((sum, s) => sum + s.averageRating * s.totalRatings, 0) / totalRatings
    : 0;

  // Sort scenarios by rating
  const sortedByRating = [...scenarios].sort((a, b) => b.averageRating - a.averageRating);
  const highestRated = sortedByRating.slice(0, 5).map(s => ({
    name: s.scenarioId,
    avg_rating: s.averageRating,
    count: s.totalRatings,
  }));
  const lowestRated = sortedByRating.slice().reverse().slice(0, 5).map(s => ({
    name: s.scenarioId,
    avg_rating: s.averageRating,
    count: s.totalRatings,
  }));

  // Get all ratings with comments
  const allRatings = scenarios
    .flatMap(s => s.ratings)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const ratingsWithComments = allRatings.filter(r => r.comment);

  // Ratings distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} Star${rating !== 1 ? 's' : ''}`,
    count: allRatings.filter(r => r.rating === rating).length,
  }));

  // Chart data for scenario ratings
  const scenarioChartData = sortedByRating.slice(0, 10).map(s => ({
    scenario: s.scenarioId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    avg_rating: s.averageRating,
    count: s.totalRatings,
  }));

  if (scenarios.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No scenario ratings yet</p>
        <p className="text-sm text-gray-400 mt-1">Ratings will appear here once users rate AI Adventure scenarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-2xl font-bold text-gray-900">
            {totalRatings > 0 ? overallAvg.toFixed(1) : '—'}
          </span>
          <span className="text-sm text-gray-500">avg rating</span>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{totalRatings}</span> ratings
          </span>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{scenarios.length}</span> scenarios rated
          </span>
        </div>
      </div>

      {/* Highest / Lowest Rated Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Highest Rated Scenarios">
          <RatedList items={highestRated} icon={<ThumbsUp className="w-4 h-4 text-emerald-500" />} emptyMsg="No ratings yet" />
        </ChartCard>
        <ChartCard title="Lowest Rated Scenarios">
          <RatedList items={lowestRated} icon={<ThumbsDown className="w-4 h-4 text-red-400" />} emptyMsg="No ratings yet" />
        </ChartCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Ratings by Scenario">
          {scenarioChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, scenarioChartData.length * 35)}>
              <BarChart data={scenarioChartData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="scenario" type="category" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(value: number) => [value.toFixed(1), 'Avg Rating']}
                />
                <Bar dataKey="avg_rating" name="Avg Rating" fill="#F40009" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Rating Distribution">
          {ratingDistribution.every(d => d.count === 0) ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDistribution} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="rating" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="count" name="Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Recent Ratings with Comments */}
      {ratingsWithComments.length > 0 && (
        <ChartCard title="Recent Comments">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {ratingsWithComments.slice(0, 20).map((rating) => (
              <div key={rating.id} className="py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F40009] to-[#DC0012] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {rating.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{rating.username.replace('@cchellenic.com', '')}</p>
                      <p className="text-xs text-gray-400">{rating.scenarioId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StarBar rating={rating.rating} />
                    <span className="text-xs text-gray-400">{formatDate(rating.createdAt)}</span>
                  </div>
                </div>
                {rating.comment && (
                  <p className="text-sm text-gray-600 ml-10">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* All Recent Ratings */}
      <ChartCard title="All Recent Ratings">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-2 text-left font-semibold">User</th>
                <th className="px-3 py-2 text-left font-semibold">Scenario</th>
                <th className="px-3 py-2 text-left font-semibold">Rating</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allRatings.slice(0, 50).map((rating) => (
                <tr key={rating.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-800">{rating.username.replace('@cchellenic.com', '')}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-gray-600">{rating.scenarioId}</span>
                  </td>
                  <td className="px-3 py-2">
                    <StarBar rating={rating.rating} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(rating.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allRatings.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-sm">No ratings yet</div>
          )}
        </div>
      </ChartCard>
    </div>
  );
}

export function UserFeedbackPage({ apiBase, filterFunction, filterLevel }: Props) {
  const [activeTab, setActiveTab] = useState<FeedbackTab>('learning');

  // Learning path data
  const [learningData, setLearningData] = useState<FeedbackData | null>(null);
  const [learningLoading, setLearningLoading] = useState(true);

  // Scenario ratings data
  const [scenarioData, setScenarioData] = useState<AllScenarioRatings | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(true);

  // Fetch learning path feedback
  useEffect(() => {
    setLearningLoading(true);
    const params = new URLSearchParams();
    if (filterFunction) params.set('function', filterFunction);
    if (filterLevel) params.set('level', filterLevel);
    fetch(`${apiBase}/analytics/admin/feedback?${params}`)
      .then(r => r.json())
      .then(setLearningData)
      .catch(console.error)
      .finally(() => setLearningLoading(false));
  }, [apiBase, filterFunction, filterLevel]);

  // Fetch scenario ratings
  useEffect(() => {
    setScenarioLoading(true);
    fetch(`${apiBase}/scenarios/ratings`)
      .then(r => r.json())
      .then(setScenarioData)
      .catch(console.error)
      .finally(() => setScenarioLoading(false));
  }, [apiBase]);

  const loading = activeTab === 'learning' ? learningLoading : scenarioLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Tab selector skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 p-2 animate-pulse h-14" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'learning'
                ? 'bg-[#F40009] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Learning Path Feedback
            {learningData && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'learning' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {learningData.total_ratings}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'scenarios'
                ? 'bg-[#F40009] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            AI Adventure Feedback
            {scenarioData && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'scenarios' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {Object.values(scenarioData.ratings).reduce((sum, s) => sum + s.totalRatings, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'learning' && learningData && (
        <LearningFeedbackContent data={learningData} />
      )}
      {activeTab === 'scenarios' && scenarioData && (
        <ScenarioFeedbackContent data={scenarioData} />
      )}
    </div>
  );
}
