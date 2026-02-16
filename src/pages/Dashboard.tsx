import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, FolderOpen, HelpCircle, CreditCard,
  RefreshCw, Loader2, Trophy, Crown, Medal
} from 'lucide-react';

// Components
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';

// Hooks
import {
  useDashboardStats,
  useUserAnalytics,
  useRevenueAnalytics,
  useTestAnalytics
} from '@/hooks/useDashboard';
import { useGlobalRankings } from '@/hooks/useTest';

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Core Data
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: userAnalytics, isLoading: usersLoading } = useUserAnalytics();
  const { data: revenueAnalytics, isLoading: revenueLoading } = useRevenueAnalytics();
  const { data: testAnalytics, isLoading: testsLoading } = useTestAnalytics();

  // Global Rankings
  const { data: globalRankings, isLoading: rankingLoading } = useGlobalRankings();

  console.log("globalRankings:", globalRankings); // Debugging line
  

  const isLoading = statsLoading || usersLoading || revenueLoading || testsLoading;

  /* ================= Refresh ================= */
  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "charts"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "global-rankings"] })
    ]);
    setLastUpdated(new Date());
  };

  /* ================= Safe Data ================= */
  const safeStats = stats?.data || {
    totalUsers: 0,
    userGrowth: 0,
    totalCategories: 0,
    totalQuestions: 0,
    totalRevenue: 0,
    revenueGrowth: 0
  };

  const registrationData = userAnalytics?.registrationData || [];
  const monthlyRevenueData = revenueAnalytics?.monthlyRevenue || [];
  const subscriptionDistribution = revenueAnalytics?.distribution || [];
  const attemptsData = testAnalytics?.testAttemptsByCategory || [];

  // Rankings
  const rankingList = globalRankings?.data?.topRankers?.slice(0, 20) || [];
  const podium = rankingList.slice(0, 3);
  const others = rankingList.slice(3);

  const formatCurrency = (value: number = 0) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number = 0) =>
    new Intl.NumberFormat('en-IN').format(value);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">

      {/* Header */}
      <div className="flex justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
        <button onClick={handleRefresh} className="btn-ghost flex gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={formatNumber(safeStats.totalUsers)}
          icon={Users}
          change={safeStats.userGrowth}
        />
        <StatsCard
          title="Categories"
          value={safeStats.totalCategories}
          icon={FolderOpen}
        />
        <StatsCard
          title="Questions"
          value={formatNumber(safeStats.totalQuestions)}
          icon={HelpCircle}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(safeStats.totalRevenue)}
          icon={CreditCard}
          change={safeStats.revenueGrowth}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">

        {/* User Growth */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">User Registrations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Test Attempts */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">Top Categories by Attempts</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attemptsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="attempts" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue + Subscription */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        <div className="dashboard-card p-6 lg:col-span-2">
          <h3 className="section-title mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">Subscriptions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={subscriptionDistribution} dataKey="value" outerRadius={80}>
                {subscriptionDistribution.map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= Global Leaderboard ================= */}
      <div className="dashboard-card p-6">
        <h3 className="section-title mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Global Top 20 Leaderboard
        </h3>

        {rankingLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : rankingList.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No ranking data available
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="grid md:grid-cols-3 gap-4 mb-8 text-center">

              {/* 2nd */}
              {podium[1] && (
                <div className="bg-muted rounded-lg p-4">
                  <Medal className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <div className="font-semibold">{podium[1].userName}</div>
                  <div className="text-sm">{podium[1].averageScore}</div>
                  <div className="font-bold">#2</div>
                </div>
              )}

              {/* 1st */}
              {podium[0] && (
                <div className="bg-primary/10 border border-primary rounded-lg p-6 scale-105">
                  <Crown className="w-10 h-10 mx-auto text-yellow-500 mb-2" />
                  <div className="font-bold text-lg">{podium[0].userName}</div>
                  <div className="text-sm">{podium[0].averageScore}</div>
                  <div className="font-bold text-primary">#1</div>
                </div>
              )}

              {/* 3rd */}
              {podium[2] && (
                <div className="bg-muted rounded-lg p-4">
                  <Medal className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                  <div className="font-semibold">{podium[2].userName}</div>
                  <div className="text-sm">{podium[2].averageScore}</div>
                  <div className="font-bold">#3</div>
                </div>
              )}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {others.map((user: any) => (
                <div
                  key={user.rank}
                  className="flex justify-between items-center border rounded-lg p-3"
                >
                  <div className="flex gap-3">
                    <div className="font-bold text-primary w-10">
                      #{user.rank}
                    </div>
                    <div>
                      <div className="font-medium">{user.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.bestScore} Best
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    {user.totalMarks} marks
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </DashboardLayout>
  );
};

export default Dashboard;
