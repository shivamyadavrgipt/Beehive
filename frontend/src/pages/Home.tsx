import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  MicrophoneIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { apiUrl } from '../utils/api';
import { getToken } from '../utils/auth';

interface UserStats {
  total_uploads: number;
  voice_notes: number;
  sentiments: { positive: number; negative: number; neutral: number };
  daily_trend: { date: string; count: number }[];
  last_upload_at: string | null;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10B981',
  neutral:  '#FBBF24',
  negative: '#EF4444',
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  sub?: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg shrink-0">
      <Icon className="h-6 w-6 text-yellow-500" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/user/stats'), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setStats(await res.json());
    } catch {
      // stats are non-critical — silently skip
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Derive leading sentiment label
  const leadingSentiment = stats
    ? (Object.entries(stats.sentiments) as [string, number][])
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)[0]?.[0] ?? null
    : null;

  // Format last upload date
  const lastUploadLabel = stats?.last_upload_at
    ? new Date(stats.last_upload_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  // Pie data (only non-zero slices)
  const pieData = stats
    ? Object.entries(stats.sentiments)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  // Bar chart: shorten date labels to "Mar 17"
  const trendData = (stats?.daily_trend ?? []).map(({ date, count }) => ({
    date: new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', timeZone: 'UTC',
    }),
    count,
  }));

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Welcome */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here's a snapshot of your activity on Beehive.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/upload"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all group flex flex-col items-center"
          >
            <CloudArrowUpIcon className="h-10 w-10 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold">Upload Media</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              Share images and voice notes with descriptions
            </p>
          </Link>

          <Link
            to="/gallery"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all group flex flex-col items-center"
          >
            <PhotoIcon className="h-10 w-10 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold">View Gallery</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              Browse and manage your uploaded content
            </p>
          </Link>
        </div>

        {/* Stats section */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-24" />
            ))}
          </div>
        ) : stats && stats.total_uploads > 0 ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Total uploads"
                value={stats.total_uploads}
                icon={PhotoIcon}
                sub={lastUploadLabel ? `Last: ${lastUploadLabel}` : undefined}
              />
              <StatCard
                label="Voice notes"
                value={stats.voice_notes}
                icon={MicrophoneIcon}
              />
              <StatCard
                label="Leading sentiment"
                value={leadingSentiment ? leadingSentiment.charAt(0).toUpperCase() + leadingSentiment.slice(1) : '—'}
                icon={FaceSmileIcon}
                sub={leadingSentiment ? `${stats.sentiments[leadingSentiment as keyof typeof stats.sentiments]} entries` : undefined}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 7-day upload trend */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Uploads — last 7 days
                </h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={trendData} barSize={20}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={24}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      cursor={{ fill: 'rgba(251,191,36,0.1)' }}
                    />
                    <Bar dataKey="count" name="Uploads" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sentiment breakdown */}
              {pieData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Sentiment breakdown
                  </h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        innerRadius={35}
                      >
                        {pieData.map(entry => (
                          <Cell
                            key={entry.name}
                            fill={SENTIMENT_COLORS[entry.name] ?? '#6B7280'}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        ) : !statsLoading && stats?.total_uploads === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            No uploads yet — your insights will appear here after your first upload.
          </p>
        ) : null}

        {/* Admin shortcuts */}
        {user?.role === 'admin' && (
          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-3">Admin Quick Access</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors">
                Dashboard
              </Link>
              <Link to="/admin/users" className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg transition-colors">
                Manage Users
              </Link>
              <Link to="/admin/analytics" className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg transition-colors">
                View Analytics
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
