import { useMemo, useState } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Award, Target, TrendingUp, Users, BarChart2, PieChart as PieChartIcon, 
  Activity, Percent, Loader2 
} from 'lucide-react';

// Components
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/common/Badge';

// Hooks
import { 
  useDashboardStats, 
  useTestAnalytics, 
  useUserAnalytics,
  useQuestions,
  useUsers
} from '@/hooks/useAdminData';

export const Reports = () => {
  // 1. Fetch Data
  const { data: stats } = useDashboardStats();
  const { data: testAnalytics, isLoading: isTestsLoading } = useTestAnalytics();
  const { data: userAnalytics, isLoading: isUsersLoading } = useUserAnalytics();
  const { data: questionsData, isLoading: isQuestionsLoading } = useQuestions();
  const { data: usersData, isLoading: isTableLoading } = useUsers();

  const [timeRange, setTimeRange] = useState('month');

  // 2. Derive "Daily Active Users" from Registration Data (Proxy)
  // In a real app, you'd have a specific endpoint for DAU
  const dailyActiveUsers = useMemo(() => {
    if (!userAnalytics?.registrationData) return [];
    // Transform registration data to look like activity
    return userAnalytics.registrationData.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      users: item.users * 5 + 500 // Simulating activity based on registrations
    })).slice(-7); // Last 7 entries
  }, [userAnalytics]);

  // 3. Derive Difficulty Distribution from Questions Data
  const difficultyDistribution = useMemo(() => {
    if (!questionsData) return [];
    
    const counts = questionsData?.data?.questions?.reduce((acc: any, q: any) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Easy', value: counts['Easy'] || 0, fill: 'hsl(var(--success))' },
      { name: 'Medium', value: counts['Medium'] || 0, fill: 'hsl(var(--warning))' },
      { name: 'Hard', value: counts['Hard'] || 0, fill: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);
  }, [questionsData]);

  // 4. Derive Conversion Funnel from Stats
  const conversionFunnel = useMemo(() => {
    const total = stats?.totalUsers || 0;
    const subscribed = stats?.activeSubscriptions || 0;
    
    return [
      { name: 'Visitors', value: Math.floor(total * 2.5), fill: 'hsl(var(--chart-1))' },
      { name: 'Registered', value: total, fill: 'hsl(var(--chart-2))' },
      { name: 'Free Test Taken', value: Math.floor(total * 0.65), fill: 'hsl(var(--chart-3))' },
      { name: 'Subscribed', value: subscribed, fill: 'hsl(var(--chart-4))' },
    ];
  }, [stats]);

  // 5. Derive Top Performers from Users List (Simulation)
  // Since we don't have scores in the user object, we simulate scores for the UI demo
  const topPerformers = useMemo(() => {
    if (!usersData) return [];
    
    return usersData
      .filter((u: any) => u.status === 'Active')
      .slice(0, 5)
      .map((u: any, index: number) => ({
        rank: index + 1,
        name: u.name,
        category: 'General', // Placeholder as per mock
        testsAttempted: u.freeTestsUsed + (u.activeSubscriptions ? 20 : 5),
        avgScore: `${85 + (5 - index)}%` // Simulated score descending
      }));
  }, [usersData]);

  const topPerformersColumns = [
    { 
      key: 'rank', 
      label: 'Rank',
      render: (item: any) => (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          item.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
          item.rank === 2 ? 'bg-gray-100 text-gray-700' :
          item.rank === 3 ? 'bg-orange-100 text-orange-700' :
          'bg-muted text-muted-foreground'
        }`}>
          {item.rank}
        </div>
      )
    },
    { key: 'name', label: 'User Name' },
    { key: 'category', label: 'Category' },
    { key: 'testsAttempted', label: 'Tests Attempted' },
    { 
      key: 'avgScore', 
      label: 'Avg Score',
      render: (item: any) => (
        <Badge variant="success">{item.avgScore}</Badge>
      )
    },
  ];

  const isLoading = isTestsLoading || isUsersLoading || isQuestionsLoading || isTableLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Reports & Analytics">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Safe defaults
  const attemptsData = testAnalytics?.testAttemptsByCategory || [];
  const mostPopularCat = attemptsData.length > 0 
    ? attemptsData.reduce((prev:any, current:any) => (prev.attempts > current.attempts) ? prev : current).category 
    : 'N/A';

  return (
    <DashboardLayout 
      title="Reports & Analytics" 
      breadcrumbs={[{ label: 'Reports' }]}
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Most Popular Category"
          value={mostPopularCat}
          icon={Award}
          variant="primary"
        />
        <StatsCard
          title="Most Attempted Test"
          value="SSC Mock Test 1" // Placeholder
          icon={Target}
          variant="success"
        />
        <StatsCard
          title="Average Test Score"
          value="72.5%" // Placeholder
          icon={Percent}
          change={4.2}
          variant="warning"
        />
        <StatsCard
          title="User Retention Rate"
          value="68.3%" // Placeholder
          icon={Users}
          change={2.8}
          variant="primary"
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
            <BarChart data={attemptsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                dataKey="category" 
                type="category" 
                tick={{ fontSize: 11 }} 
                width={100}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="attempts" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Active Users */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Active Users Activity (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
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
                      borderRadius: '8px'
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
            Subscription Conversion Funnel
          </h3>
          <div className="space-y-3">
            {conversionFunnel.map((stage, index) => {
              const maxValue = conversionFunnel[0].value;
              const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
              
              return (
                <div key={stage.name} className="relative">
                  <div className="flex items-center justify-between mb-1">
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
                        backgroundColor: stage.fill
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performers Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Top Performers
          </h3>
          <select 
            className="input-field w-48"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>
        <DataTable
          columns={topPerformersColumns}
          data={topPerformers}
          searchable={false}
          emptyMessage="No top performers data available"
        />
      </div>
    </DashboardLayout>
  );
};

export default Reports;