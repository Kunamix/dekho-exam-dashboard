// src/components/admin/PaymentDetailsModal.tsx
import { X, Calendar, CreditCard, User, DollarSign, Receipt, Info } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
}

export const PaymentDetailsModal = ({ isOpen, onClose, payment }: PaymentDetailsModalProps) => {
  if (!isOpen || !payment) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const statusVariant: Record<string, 'success' | 'danger' | 'warning'> = {
    SUCCESS: 'success',
    COMPLETED: 'success',
    FAILED: 'danger',
    PENDING: 'warning',
  };

  const metadata = payment.metadata || {};

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Payment Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Transaction ID: {payment.transactionId || payment.orderId || 'N/A'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status & Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Amount</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge variant={statusVariant[payment.status] || 'warning'} className="text-base">
                  {payment.status}
                </Badge>
              </div>
            </div>

            {/* User Information */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">User Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{payment.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{payment.phone}</p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">Transaction Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm">{payment.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">{payment.orderId || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Gateway</p>
                    <p className="font-medium capitalize">{payment.gateway?.toLowerCase() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="font-medium">INR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Information (if available in metadata) */}
            {metadata.planName && (
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold">Subscription Plan</h3>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Plan Name</p>
                      <p className="font-medium">{metadata.planName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{metadata.durationDays} days</p>
                    </div>
                  </div>
                  {metadata.planType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Plan Type</p>
                      <p className="font-medium capitalize">
                        {metadata.planType.replace('_', ' ').toLowerCase()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">Timestamp</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium text-sm">{formatDate(payment.date)}</p>
                </div>
              </div>
            </div>

            {/* Additional Metadata (if any) */}
            {metadata && Object.keys(metadata).length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Additional Information</h3>
                <div className="bg-muted/30 rounded p-3">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
            >
              Close
            </button>
            {payment.status === 'SUCCESS' && (
              <button
                onClick={() => {
                  // TODO: Implement refund functionality
                  // console.log('Initiate refund for:', payment.id);
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Initiate Refund
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};