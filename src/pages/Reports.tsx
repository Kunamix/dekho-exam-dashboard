import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/common/Badge';
import { Award, Target, TrendingUp, Users, BarChart2, PieChart as PieChartIcon, Activity, Percent } from 'lucide-react';
import { testAttemptsByCategory } from '@/data/mockData';
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
  Funnel,
  FunnelChart,
  LabelList
} from 'recharts';

export const Reports = () => {
  const dailyActiveUsers = [
    { date: 'Mon', users: 1250 },
    { date: 'Tue', users: 1480 },
    { date: 'Wed', users: 1320 },
    { date: 'Thu', users: 1590 },
    { date: 'Fri', users: 1780 },
    { date: 'Sat', users: 2100 },
    { date: 'Sun', users: 1950 },
  ];

  const difficultyDistribution = [
    { name: 'Easy', value: 35, fill: 'hsl(var(--success))' },
    { name: 'Medium', value: 45, fill: 'hsl(var(--warning))' },
    { name: 'Hard', value: 20, fill: 'hsl(var(--destructive))' },
  ];

  const conversionFunnel = [
    { name: 'Visitors', value: 15000, fill: 'hsl(var(--chart-1))' },
    { name: 'Registered', value: 8500, fill: 'hsl(var(--chart-2))' },
    { name: 'Free Test Taken', value: 5200, fill: 'hsl(var(--chart-3))' },
    { name: 'Subscribed', value: 2800, fill: 'hsl(var(--chart-4))' },
  ];

  const topPerformers = [
    { rank: 1, name: 'Kavya Reddy', category: 'SSC Constable', testsAttempted: 45, avgScore: '92%' },
    { rank: 2, name: 'Rahul Sharma', category: 'Railway NTPC', testsAttempted: 38, avgScore: '89%' },
    { rank: 3, name: 'Priya Singh', category: 'Banking PO', testsAttempted: 42, avgScore: '87%' },
    { rank: 4, name: 'Amit Kumar', category: 'NEET', testsAttempted: 35, avgScore: '85%' },
    { rank: 5, name: 'Sneha Patel', category: 'JEE Main', testsAttempted: 40, avgScore: '84%' },
  ];

  const topPerformersColumns = [
    { 
      key: 'rank', 
      label: 'Rank',
      render: (item: typeof topPerformers[0]) => (
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
      render: (item: typeof topPerformers[0]) => (
        <Badge variant="success">{item.avgScore}</Badge>
      )
    },
  ];

  return (
    <DashboardLayout 
      title="Reports & Analytics" 
      breadcrumbs={[{ label: 'Reports' }]}
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Most Popular Category"
          value="SSC Constable"
          icon={Award}
          variant="primary"
        />
        <StatsCard
          title="Most Attempted Test"
          value="SSC Mock Test 1"
          icon={Target}
          variant="success"
        />
        <StatsCard
          title="Average Test Score"
          value="72.5%"
          icon={Percent}
          change={4.2}
          variant="warning"
        />
        <StatsCard
          title="User Retention Rate"
          value="68.3%"
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

        {/* Daily Active Users */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Daily Active Users (This Week)
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
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={difficultyDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {difficultyDistribution.map((entry, index) => (
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
        </div>

        {/* Subscription Conversion Funnel */}
        <div className="dashboard-card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Subscription Conversion Funnel
          </h3>
          <div className="space-y-3">
            {conversionFunnel.map((stage, index) => {
              const width = (stage.value / conversionFunnel[0].value) * 100;
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
          <select className="input-field w-48">
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>
        <DataTable
          columns={topPerformersColumns}
          data={topPerformers}
          searchable={false}
        />
      </div>
    </DashboardLayout>
  );
};

export default Reports;
