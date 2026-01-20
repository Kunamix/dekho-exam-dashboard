import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Users, FolderOpen, HelpCircle, CreditCard, RefreshCw, Loader2 
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
  useTestAnalytics, 
  useRevenueAnalytics 
} from '@/hooks/useAdminData';

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 1. Fetch Data using Hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: userAnalytics, isLoading: usersLoading } = useUserAnalytics();
  const { data: testAnalytics, isLoading: testsLoading } = useTestAnalytics();
  const { data: revenueAnalytics, isLoading: revenueLoading } = useRevenueAnalytics();

  // Combine loading states
  const isLoading = statsLoading || usersLoading || testsLoading || revenueLoading;

  // 2. Refresh Handler
  const handleRefresh = async () => {
    // Invalidate all dashboard related queries to trigger a refetch
    await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    await queryClient.invalidateQueries({ queryKey: ['analytics-users'] });
    await queryClient.invalidateQueries({ queryKey: ['analytics-tests'] });
    await queryClient.invalidateQueries({ queryKey: ['analytics-revenue'] });
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

  // 4. Table Configuration
  const recentUsersColumns = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'phone', label: 'Phone Number' },
    { key: 'registeredOn', label: 'Registered On', sortable: true },
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

  const COLORS = ['hsl(239, 84%, 67%)', 'hsl(160, 84%, 39%)'];

  // 5. Safe Data Access (Defaults)
  // These ensure the app doesn't crash if API returns null
  const safeStats = stats || { 
    totalUsers: 0, userGrowth: 0, totalCategories: 0, 
    totalQuestions: 0, activeSubscriptions: 0, 
    revenueGrowth: 0, totalRevenue: 0 
  };
  
  const registrationData = userAnalytics?.registrationData || [];
  const recentUsersList = userAnalytics?.recentUsers || [];
  const attemptsData = testAnalytics?.testAttemptsByCategory || [];
  // Assuming revenue analytics API returns a 'distribution' field
  const subscriptionData = revenueAnalytics?.distribution || []; 

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
      {/* Last Updated Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
        <button 
          onClick={handleRefresh}
          className="btn-ghost flex items-center gap-2 text-sm hover:bg-muted p-2 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
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
          title="Active Subscriptions"
          value={formatNumber(safeStats.activeSubscriptions)}
          icon={CreditCard}
          change={safeStats.revenueGrowth}
          variant="primary"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Registrations Chart */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">User Registrations (Last 15 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Test Attempts by Category */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">Test Attempts by Category</h3>
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
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscription Distribution */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">Subscription Distribution</h3>
          {subscriptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subscriptionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
             <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No subscription data available
             </div>
          )}
        </div>

        {/* Quick Stats / Revenue Overview */}
        <div className="dashboard-card p-6 lg:col-span-2">
          <h3 className="section-title mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(safeStats.totalRevenue)}
              </p>
            </div>
            <div className="bg-success/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-success mt-1">
                {formatCurrency(revenueAnalytics?.currentMonthRevenue || 0)}
              </p>
            </div>
            <div className="bg-warning/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Avg. per User</p>
              <p className="text-2xl font-bold text-warning mt-1">
                {formatCurrency(
                  safeStats.totalUsers > 0 
                  ? Math.round(safeStats.totalRevenue / safeStats.totalUsers) 
                  : 0
                )}
              </p>
            </div>
            <div className="bg-info/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-info mt-1">28.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div>
        <h3 className="section-title mb-4">Recent User Registrations</h3>
        <DataTable
          columns={recentUsersColumns}
          data={recentUsersList}
          searchPlaceholder="Search users..."
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;