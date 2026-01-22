import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Award,
  Target,
  TrendingUp,
  Users,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Percent,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

// Components
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";

// Hooks
import {
  useDashboardStats,
  useReportsAnalytics,
} from "@/hooks/useAdminData";

export const Reports = () => {
  const [timeRange, setTimeRange] = useState("month");

  // Fetch Data
  const { data: dashboardStats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: reportsData, isLoading: isReportsLoading } = useReportsAnalytics();

  // Extract stats
  const stats = useMemo(() => dashboardStats?.data || {}, [dashboardStats]);

  // Process Daily Registrations
  const dailyRegistrations = useMemo(() => {
    if (!reportsData?.dailyRegistrations) return [];
    return reportsData.dailyRegistrations.map((item: any) => ({
      date: format(new Date(item.date), 'EEE'),
      users: item.users
    }));
  }, [reportsData]);

  // Process Difficulty Distribution
  const difficultyDistribution = useMemo(() => {
    if (!reportsData?.difficultyDistribution) return [];
    
    const colorMap: Record<string, string> = {
      'EASY': 'hsl(142, 76%, 36%)',
      'MEDIUM': 'hsl(48, 96%, 53%)',
      'HARD': 'hsl(0, 84%, 60%)'
    };

    return reportsData.difficultyDistribution.map((item: any) => ({
      name: item.name,
      value: item.value,
      fill: colorMap[item.name] || 'hsl(var(--primary))'
    }));
  }, [reportsData]);

  // Process Conversion Funnel
  const conversionFunnel = useMemo(() => {
    if (!reportsData?.conversionFunnel) return [];
    
    const colors = [
      'hsl(221, 83%, 53%)',
      'hsl(142, 76%, 36%)',
      'hsl(280, 65%, 60%)'
    ];

    return reportsData.conversionFunnel.map((item: any, index: number) => ({
      ...item,
      fill: colors[index] || 'hsl(var(--primary))'
    }));
  }, [reportsData]);

  // Process Category Attempts
  const categoryAttempts = useMemo(() => {
    return reportsData?.testAttemptsByCategory || [];
  }, [reportsData]);

  // Process Top Performers
  const topPerformers = useMemo(() => {
    if (!reportsData?.topPerformers) return [];
    
    return reportsData.topPerformers.map((user: any, index: number) => ({
      rank: index + 1,
      id: user.userId,
      name: user.name || 'Unknown User',
      email: user.email,
      testsAttempted: user.testsAttempted,
      avgScore: `${Number(user.avgScore).toFixed(1)}%`,
      status: 'Active'
    }));
  }, [reportsData]);

  const isLoading = isStatsLoading || isReportsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Reports & Analytics">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const topPerformersColumns = [
    {
      key: "rank",
      label: "Rank",
      render: (item: any) => (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            item.rank === 1 ? "bg-yellow-100 text-yellow-700" : 
            item.rank === 2 ? "bg-gray-100 text-gray-700" : 
            item.rank === 3 ? "bg-orange-100 text-orange-700" :
            "bg-blue-100 text-blue-700"
        }`}>
          {item.rank}
        </div>
      ),
    },
    { key: "name", label: "User Name" },
    { key: "testsAttempted", label: "Tests Attempted" },
    {
      key: "avgScore",
      label: "Avg Score",
      render: (item: any) => (
        <Badge variant={parseFloat(item.avgScore) > 80 ? "success" : parseFloat(item.avgScore) > 60 ? "warning" : "destructive"}>
          {item.avgScore}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Reports & Analytics"
      breadcrumbs={[{ label: "Reports" }]}
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Most Popular Category"
          value={reportsData?.mostPopularCategory || 'N/A'}
          icon={Award}
          variant="primary"
          subtitle={`${reportsData?.mostPopularAttempts || 0} attempts`}
        />
        <StatsCard
          title="Total Test Attempts"
          value={(reportsData?.totalTestAttempts || 0).toLocaleString()}
          icon={Target}
          variant="success"
          subtitle="Last 30 days"
        />
        <StatsCard
          title="Average Test Score"
          value={`${reportsData?.averageTestScore || 0}%`}
          icon={Percent}
          variant="warning"
          subtitle="Last 30 days"
        />
        <StatsCard
          title="Active Subscribers"
          value={stats.activeSubscriptions || 0}
          icon={Users}
          variant="info"
          subtitle={`${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth || 0}% growth`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category-wise Test Attempts */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Category-wise Test Attempts
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryAttempts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                dataKey="category" 
                type="category" 
                tick={{ fontSize: 11 }} 
                width={100} 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="attempts" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily User Registrations */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            User Registrations (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRegistrations}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Question Difficulty Distribution */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Question Difficulty Distribution
          </h3>
          <div className="h-[280px] w-full">
            {difficultyDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {difficultyDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No questions available to analyze
              </div>
            )}
          </div>
        </div>

        {/* Subscription Conversion Funnel */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            User Conversion Funnel
          </h3>
          <div className="space-y-4">
            {conversionFunnel.map((stage) => {
              const maxValue = conversionFunnel[0]?.value || 1;
              const width = Math.max((stage.value / maxValue) * 100, 5);
              
              return (
                <div key={stage.name} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{stage.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.value.toLocaleString()} ({Math.round(width)}%)
                    </span>
                  </div>
                  <div className="h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: stage.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;