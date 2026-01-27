import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Users, FolderOpen, HelpCircle, CreditCard, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Components
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/common/Badge';

// Hooks
import { 
  useDashboardStats, 
  useUserAnalytics, 
  useRevenueAnalytics,
  useTestAnalytics
} from '@/hooks/useDashboard';

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 1. Fetch Data using the new Hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: userAnalytics, isLoading: usersLoading } = useUserAnalytics();
  const { data: revenueAnalytics, isLoading: revenueLoading } = useRevenueAnalytics();
  const { data: testAnalytics, isLoading: testsLoading } = useTestAnalytics();

  const isLoading = statsLoading || usersLoading || revenueLoading || testsLoading;

  // 2. Refresh Handler
  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard','charts'] }),
      queryClient.invalidateQueries({ queryKey: ['recent-users-widget'] })
    ]);
    setLastUpdated(new Date());
  };

  // 3. Formatters
  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number = 0) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  // 4. Safe Data Defaults (Matches your Backend Response Structure)
  const safeStats = stats?.data || { 
    totalUsers: 0, 
    userGrowth: 0, 
    totalCategories: 0, 
    totalQuestions: 0, 
    activeSubscriptions: 0, 
    totalRevenue: 0,
    revenueGrowth: 0
  };


  const registrationData = userAnalytics?.registrationData || [];
  const recentUsersList = userAnalytics?.recentUsers || [];

  console.log("user analytics ", userAnalytics)
  console.log("user revenue ", revenueAnalytics)
  console.log("user test ", testAnalytics)
  const monthlyRevenueData = revenueAnalytics?.monthlyRevenue || [];
  const subscriptionDistribution = revenueAnalytics?.distribution || [];

  const attemptsData = testAnalytics?.testAttemptsByCategory || [];

  // 5. Table Columns
  const recentUsersColumns = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'phone', label: 'Phone Number' },
    { 
      key: 'registeredOn', 
      label: 'Registered On', 
      render: (item: any) => new Date(item.registeredOn).toLocaleDateString('en-IN')
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => (
        <Badge variant={item.status === 'Active' ? 'success' : 'warning'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex h-[80vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <button 
          onClick={handleRefresh}
          className="btn-ghost flex items-center gap-2 text-sm hover:bg-muted p-2 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={formatNumber(safeStats.totalUsers)}
          icon={Users}
          change={safeStats.userGrowth}
          variant="primary"
        />
        <StatsCard
          title="Total Categories"
          value={safeStats.totalCategories}
          icon={FolderOpen}
          variant="success"
        />
        <StatsCard
          title="Total Questions"
          value={formatNumber(safeStats.totalQuestions)}
          icon={HelpCircle}
          variant="warning"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(safeStats.totalRevenue)}
          icon={CreditCard}
          change={safeStats.revenueGrowth}
          variant="primary"
        />
      </div>

      {/* Charts Row 1: Growth & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Registrations Chart */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">User Registrations (Last 15 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  stroke="hsl(var(--muted-foreground))"
                />
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
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Test Attempts Bar Chart */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">Top Categories by Attempts</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
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
                <Bar 
                  dataKey="attempts" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]} 
                  name="Test Attempts"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Finance & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Trend (Bar) */}
        <div className="dashboard-card p-6 lg:col-span-2">
          <h3 className="section-title mb-4">Monthly Revenue Trend</h3>
          <div className="h-[300px] w-full">
            {monthlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }} 
                    stroke="hsl(var(--muted-foreground))" 
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => `₹${val/1000}k`}
                    stroke="hsl(var(--muted-foreground))" 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '8px' 
                    }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Subscription Pie Chart */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">Subscription Types</h3>
          <div className="h-[300px] w-full">
            {subscriptionDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No active subscriptions
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div>
        <h3 className="section-title mb-4">Recent Registrations</h3>
        <DataTable
          columns={recentUsersColumns}
          data={recentUsersList}
          searchable={false}
          emptyMessage="No recent users found"
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;