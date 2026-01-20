import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Download, Eye, RotateCcw, DollarSign, TrendingUp, CheckCircle, XCircle, Calendar, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

// Components
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { StatsCard } from '@/components/common/StatsCard';
import { Badge } from '@/components/common/Badge';

// Hooks
import { usePayments, useRevenueAnalytics } from '@/hooks/useAdminData';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  planName: string;
  amount: number;
  gateway: string;
  status: 'Success' | 'Failed' | 'Pending';
  date: string;
}

export const Payments = () => {
  // 1. Fetch Data
  const { data: paymentsData, isLoading: isPaymentsLoading } = usePayments();
  const { data: revenueData, isLoading: isRevenueLoading } = useRevenueAnalytics();

  // 2. Local State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 3. Derived Data (Safe Defaults)
  const payments = (paymentsData as Payment[]) || [];
  const monthlyRevenue = revenueData?.monthlyRevenue || [];

  const handleExport = () => {
    toast.success('Exporting payment report...');
  };

  // Calculate stats dynamically from the fetched data
  const totalRevenue = payments
    .filter((p) => p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulTransactions = payments.filter((p) => p.status === 'Success').length;
  const failedTransactions = payments.filter((p) => p.status === 'Failed').length;

  const statusVariant = {
    Success: 'success' as const,
    Failed: 'danger' as const,
    Pending: 'warning' as const,
  };

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { 
      key: 'user', 
      label: 'User',
      render: (item: Payment) => (
        <div>
          <p className="font-medium">{item.userName}</p>
          <p className="text-xs text-muted-foreground">{item.phone}</p>
        </div>
      )
    },
    { key: 'planName', label: 'Plan', sortable: true },
    { 
      key: 'amount', 
      label: 'Amount',
      sortable: true,
      render: (item: Payment) => (
        <span className="font-medium">₹{item.amount.toLocaleString()}</span>
      )
    },
    { key: 'gateway', label: 'Gateway' },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: Payment) => (
        <Badge variant={statusVariant[item.status]}>
          {item.status}
        </Badge>
      )
    },
    { key: 'date', label: 'Date & Time', sortable: true },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (item: Payment) => (
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="View Receipt"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Success' && (
            <button 
              className="p-2 rounded-lg hover:bg-warning/10 text-warning transition-colors"
              title="Refund"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isLoading = isPaymentsLoading || isRevenueLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Payments & Revenue">
        <div className="flex h-[80vh] w-full items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Payments & Revenue" 
      breadcrumbs={[{ label: 'Payments' }]}
    >
      {/* Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field w-40"
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field w-40"
          />
        </div>
        <button onClick={handleExport} className="btn-outline flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          variant="primary"
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(revenueData?.currentMonthRevenue || 0)}
          icon={TrendingUp}
          change={18.3} // You could calculate this dynamically if previous month data exists
          variant="success"
        />
        <StatsCard
          title="Successful Transactions"
          value={successfulTransactions}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Failed Transactions"
          value={failedTransactions}
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Revenue Chart */}
      <div className="dashboard-card p-6 mb-8">
        <h3 className="section-title mb-4">Monthly Revenue (Last 12 Months)</h3>
        <div className="w-full h-[300px]">
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000)}k`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
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

      {/* Payments Table */}
      <div>
        <h3 className="section-title mb-4">Recent Transactions</h3>
        <DataTable
          columns={columns}
          data={payments}
          searchPlaceholder="Search by transaction ID or user..."
          emptyMessage="No transactions found"
        />
      </div>
    </DashboardLayout>
  );
};

export default Payments;