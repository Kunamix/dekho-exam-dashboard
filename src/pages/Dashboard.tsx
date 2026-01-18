import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/common/Badge';
import { Users, FolderOpen, HelpCircle, CreditCard, RefreshCw } from 'lucide-react';
import { 
  dashboardStats, 
  userRegistrationData, 
  testAttemptsByCategory, 
  subscriptionDistribution,
  recentUsers 
} from '@/data/mockData';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useState } from 'react';

export const Dashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const recentUsersColumns = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'phone', label: 'Phone Number' },
    { key: 'registeredOn', label: 'Registered On', sortable: true },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: typeof recentUsers[0]) => (
        <Badge variant={item.status === 'Active' ? 'success' : 'warning'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const COLORS = ['hsl(239, 84%, 67%)', 'hsl(160, 84%, 39%)'];

  return (
    <DashboardLayout title="Dashboard">
      {/* Last Updated */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
        <button 
          onClick={handleRefresh}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={formatNumber(dashboardStats.totalUsers)}
          icon={Users}
          change={dashboardStats.userGrowth}
          variant="primary"
        />
        <StatsCard
          title="Total Categories"
          value={dashboardStats.totalCategories}
          icon={FolderOpen}
          variant="success"
        />
        <StatsCard
          title="Total Questions"
          value={formatNumber(dashboardStats.totalQuestions)}
          icon={HelpCircle}
          variant="warning"
        />
        <StatsCard
          title="Active Subscriptions"
          value={formatNumber(dashboardStats.activeSubscriptions)}
          icon={CreditCard}
          change={dashboardStats.revenueGrowth}
          variant="primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Registrations Chart */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">User Registrations (Last 15 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userRegistrationData}>
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
            <BarChart data={testAttemptsByCategory} layout="vertical">
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

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscription Distribution */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4">Subscription Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
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
                {subscriptionDistribution.map((entry, index) => (
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
        </div>

        {/* Quick Stats */}
        <div className="dashboard-card p-6 lg:col-span-2">
          <h3 className="section-title mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(dashboardStats.totalRevenue)}
              </p>
            </div>
            <div className="bg-success/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-success mt-1">
                {formatCurrency(534000)}
              </p>
            </div>
            <div className="bg-warning/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Avg. per User</p>
              <p className="text-2xl font-bold text-warning mt-1">
                {formatCurrency(Math.round(dashboardStats.totalRevenue / dashboardStats.totalUsers))}
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
          data={recentUsers}
          searchPlaceholder="Search users..."
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
