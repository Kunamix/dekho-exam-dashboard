import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Download, Eye, Calendar, Loader2, DollarSign, TrendingUp, 
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { StatsCard } from '@/components/common/StatsCard';
import { Badge } from '@/components/common/Badge';
import { PaymentDetailsModal } from '@/components/PaymentDetailsModal';

import { 
  usePayments, 
  usePaymentStats, 
  useExportPayments,
  type Payment 
} from '@/hooks/usePayment';

export const Payments = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { 
    data: paymentsData, 
    isLoading: isPaymentsLoading,
    isError: isPaymentsError 
  } = usePayments({ startDate, endDate });
  
  const { 
    data: statsData, 
    isLoading: isStatsLoading,
    isError: isStatsError 
  } = usePaymentStats();

  const { mutate: exportPayments, isPending: isExporting } = useExportPayments();

  const isLoading = isPaymentsLoading || isStatsLoading;
  const hasError = isPaymentsError || isStatsError;
  
  const payments = paymentsData?.data?.payments || [];
  const stats = statsData?.data || {
    totalRevenue: 0,
    currentMonthRevenue: 0,
    revenueChange: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    monthlyRevenue: []
  };

  const handleExport = () => {
    exportPayments({ startDate, endDate });
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPayment(null), 200);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusVariant: Record<string, 'success' | 'danger' | 'warning'> = {
    SUCCESS: 'success',
    COMPLETED: 'success',
    FAILED: 'danger',
    PENDING: 'warning',
    REFUNDED: 'warning',
  };

  const columns = [
    { 
      key: 'transactionId', 
      label: 'Transaction ID',
      render: (item: Payment) => (
        <span className="font-mono text-xs text-muted-foreground">
          {item.transactionId || item.orderId || 'N/A'}
        </span>
      )
    },
    { 
      key: 'user', 
      label: 'User',
      render: (item: Payment) => (
        <div>
          <p className="font-medium text-sm">{item.userName || item.user?.name || 'N/A'}</p>
          <p className="text-xs text-muted-foreground">{item.phone || item.user?.phone || 'N/A'}</p>
        </div>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount',
      sortable: true,
      render: (item: Payment) => (
        <span className="font-medium">{formatCurrency(item.amount)}</span>
      )
    },
    { 
      key: 'gateway', 
      label: 'Gateway',
      render: (item: Payment) => (
        <span className="text-sm capitalize">{item.gateway?.toLowerCase() || 'N/A'}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: Payment) => (
        <Badge variant={statusVariant[item.status] || 'warning'}>
          {item.status}
        </Badge>
      )
    },
    { 
      key: 'date', 
      label: 'Date',
      sortable: true,
      render: (item: Payment) => (
        <span className="text-sm">
          {new Date(item.date || item.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (item: Payment) => (
        <button 
          className="p-2 rounded-lg hover:bg-muted transition-colors group"
          title="View Details"
          onClick={() => handleViewPayment(item)}
        >
          <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      )
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Payments & Revenue">
        <div className="flex h-[80vh] w-full items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (hasError) {
    return (
      <DashboardLayout title="Payments & Revenue">
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load payment data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was a problem loading the payment data. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline"
          >
            Refresh Page
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Payments & Revenue" 
      breadcrumbs={[{ label: 'Payments' }]}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Start Date"
            />
          </div>
          <span className="text-muted-foreground text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="End Date"
          />
        </div>
        <button 
          onClick={handleExport} 
          disabled={isExporting}
          className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          variant="primary"
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(stats.currentMonthRevenue)}
          icon={TrendingUp}
          change={stats.revenueChange}
          variant="success"
        />
        <StatsCard
          title="Successful"
          value={stats.successfulTransactions}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Failed"
          value={stats.failedTransactions}
          icon={XCircle}
          variant="danger"
        />
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Monthly Revenue (Last 12 Months)</h3>
        <div className="w-full h-[300px]">
          {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000)}k`}
                  className="text-muted-foreground"
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
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No revenue data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <DataTable
          columns={columns}
          data={payments}
          searchPlaceholder="Search by transaction ID or user..."
          emptyMessage="No transactions found"
        />
      </div>

      <PaymentDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payment={selectedPayment}
      />
    </DashboardLayout>
  );
};

export default Payments;