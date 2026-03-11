import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Monitor, Gamepad2, BookOpen, Star } from 'lucide-react';

interface ScreenVisit {
  screen: string;
  visits: number;
}
interface ScreenTime {
  screen: string;
  seconds: number;
}
interface GamePlay {
  game: string;
  count: number;
}
interface LearningAnalytics {
  total_created: number;
  total_completed: number;
  completion_rate: number;
}
interface RatingsAnalytics {
  average_rating: number;
  total_ratings: number;
}

interface AnalyticsChartsProps {
  mostVisited: ScreenVisit[];
  timePerScreen: ScreenTime[];
  gamePlays: GamePlay[];
  learningAnalytics: LearningAnalytics | null;
  ratingsAnalytics: RatingsAnalytics | null;
  loading: boolean;
}

const SCREEN_LABELS: Record<string, string> = {
  'login': 'Login',
  'master': 'Home',
  'learning-dashboard': 'L. Dashboard',
  'learning-chat': 'L. Chat',
  'learning-generating': 'Generating',
  'learning-results': 'L. Results',
  'ai-welcome': 'AI Welcome',
  'ai-selection': 'AI Selection',
  'ai-comparison': 'AI Compare',
  'ai-execution': 'AI Execution',
  'ai-promo-game': 'Promo Game',
  'ai-supply-chain-game': 'Supply Chain',
  'ai-finance-game': 'Finance Game',
  'admin-dashboard': 'Admin',
};

const GAME_COLORS: Record<string, string> = {
  'supply-chain': '#F40009',
  'finance': '#0066cc',
  'promo': '#f59e0b',
};

const GAME_LABELS: Record<string, string> = {
  'supply-chain': 'Supply Chain',
  'finance': 'Finance',
  'promo': 'Promo Game',
};

const PIE_COLORS = ['#F40009', '#e5e7eb'];

const RED = '#F40009';
const RED_LIGHT = '#fca5a5';

function ChartCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="h-4 bg-gray-200 rounded w-40" />
      </div>
      <div className="h-48 bg-gray-100 rounded-xl" />
    </div>
  );
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2">
        <p className="text-xs font-medium text-gray-700 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-[#F40009]">
          {payload[0].value.toLocaleString()} {payload[0].name}
        </p>
      </div>
    );
  }
  return null;
};

export function AnalyticsCharts({
  mostVisited,
  timePerScreen,
  gamePlays,
  learningAnalytics,
  ratingsAnalytics,
  loading,
}: AnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonChart key={i} />)}
      </div>
    );
  }

  // Prepare screen data with friendly labels
  const visitData = mostVisited.map((d) => ({
    name: SCREEN_LABELS[d.screen] ?? d.screen,
    visits: d.visits,
  }));

  const timeData = timePerScreen.map((d) => ({
    name: SCREEN_LABELS[d.screen] ?? d.screen,
    minutes: Math.round(d.seconds / 60),
  }));

  const gameData = gamePlays.map((d) => ({
    name: GAME_LABELS[d.game] ?? d.game,
    count: d.count,
    fill: GAME_COLORS[d.game] ?? '#6b7280',
  }));

  const pathData = learningAnalytics
    ? [
        { name: 'Completed', value: learningAnalytics.total_completed },
        {
          name: 'In Progress / Draft',
          value: Math.max(0, learningAnalytics.total_created - learningAnalytics.total_completed),
        },
      ]
    : [];

  // Star rating display
  const starCount = ratingsAnalytics?.average_rating ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Visited Screens */}
      <ChartCard
        title="Most Visited Screens"
        icon={<Monitor className="w-4 h-4 text-[#F40009]" />}
      >
        {visitData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No screen activity recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={visitData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#fef2f2' }} />
              <Bar dataKey="visits" name="visits" fill={RED} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Time Spent Per Screen */}
      <ChartCard
        title="Time Spent Per Screen"
        icon={<Monitor className="w-4 h-4 text-[#F40009]" />}
      >
        {timeData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No screen time recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#fef2f2' }} />
              <Bar dataKey="minutes" name="mins" fill={RED_LIGHT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* AI Game Usage */}
      <ChartCard
        title="AI Game Usage"
        icon={<Gamepad2 className="w-4 h-4 text-[#F40009]" />}
      >
        {gameData.every((d) => d.count === 0) ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No game sessions recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gameData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#374151' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#fef2f2' }} />
              <Bar dataKey="count" name="plays" radius={[4, 4, 0, 0]}>
                {gameData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Learning Analytics */}
      <div className="grid grid-rows-2 gap-6">
        {/* Learning Path Completion */}
        <ChartCard
          title="Learning Path Completion"
          icon={<BookOpen className="w-4 h-4 text-[#F40009]" />}
        >
          <div className="flex items-center gap-4">
            {/* Pie */}
            <div className="flex-shrink-0">
              {learningAnalytics && learningAnalytics.total_created > 0 ? (
                <PieChart width={100} height={100}>
                  <Pie
                    data={pathData}
                    cx={45}
                    cy={45}
                    innerRadius={28}
                    outerRadius={45}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {pathData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Created</span>
                <span className="font-semibold text-gray-900">
                  {learningAnalytics?.total_created ?? '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-emerald-600">
                  {learningAnalytics?.total_completed ?? '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-bold text-[#F40009]">
                  {learningAnalytics ? `${learningAnalytics.completion_rate}%` : '—'}
                </span>
              </div>
              {learningAnalytics && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-[#F40009] to-[#DC0012] rounded-full transition-all duration-700"
                    style={{ width: `${learningAnalytics.completion_rate}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </ChartCard>

        {/* Ratings Analytics */}
        <ChartCard
          title="Platform Ratings"
          icon={<Star className="w-4 h-4 text-[#F40009]" />}
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-gray-900">
                {ratingsAnalytics?.average_rating.toFixed(1) ?? '—'}
              </span>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(starCount)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 mt-1">
                avg. rating
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                Based on{' '}
                <span className="font-semibold text-gray-800">
                  {ratingsAnalytics?.total_ratings ?? 0}
                </span>{' '}
                user rating{(ratingsAnalytics?.total_ratings ?? 0) !== 1 ? 's' : ''}
              </p>
              {ratingsAnalytics && ratingsAnalytics.total_ratings === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  No ratings submitted yet
                </p>
              )}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
