import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { 
  Download, Eye, User as UserIcon, CreditCard, ClipboardList, 
  Ban, CheckCircle, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import { useUsers } from '@/hooks/useAdminData';
import { useUpdateUserStatus ,useUserDetails } from '@/hooks/useAdminMutations';

// Types
interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  role: 'Student' | 'Admin';
  freeTestsUsed: number;
  activeSubscriptions: number;
  registeredOn: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

export const Users = () => {
  // 1. Fetch Users List
  const { data: usersData, isLoading: isUsersLoading } = useUsers();
  
  // 2. Mutations
  const statusMutation = useUpdateUserStatus();

  // 3. Local State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscriptions' | 'attempts'>('profile');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 4. Fetch User Details (Only when modal is open and ID is selected)
  const { data: userDetails, isLoading: isDetailsLoading } = useUserDetails(selectedUserId);

  // 5. Derived Data & Filtering
  const users = (usersData as User[]) || [];

  const filteredUsers = users.filter((user) => {
    if (roleFilter && user.role !== roleFilter) return false;
    if (statusFilter && user.status !== statusFilter) return false;
    return true;
  });

  // Handlers
  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('profile'); // Reset tab to profile when opening
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUserId(null); // Clear selection to reset hook and cache logic if needed
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    // Optimistic update or wait for server response handled by React Query
    statusMutation.mutate({ id: user.id, status: newStatus });
  };

  const handleExport = () => {
    toast.success('Exporting users to CSV...');
    // In a real app: window.location.href = '/api/admin/users/export';
  };

  const columns = [
    { key: 'id', label: 'User ID' },
    { key: 'phone', label: 'Phone / Email', render: (item: User) => (
      <div>
        <p className="font-medium">{item.phone}</p>
        <p className="text-xs text-muted-foreground">{item.email}</p>
      </div>
    )},
    { key: 'name', label: 'Name', sortable: true },
    { 
      key: 'role', 
      label: 'Role',
      render: (item: User) => (
        <Badge variant={item.role === 'Admin' ? 'primary' : 'info'}>
          {item.role}
        </Badge>
      )
    },
    { 
      key: 'freeTestsUsed', 
      label: 'Free Tests',
      render: (item: User) => `${item.freeTestsUsed}/2`
    },
    { 
      key: 'activeSubscriptions', 
      label: 'Subscriptions',
      render: (item: User) => (
        <Badge variant={item.activeSubscriptions > 0 ? 'success' : 'default'}>
          {item.activeSubscriptions}
        </Badge>
      )
    },
    { key: 'registeredOn', label: 'Registered On', sortable: true },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: User) => (
        <Badge variant={item.status === 'Active' ? 'success' : 'danger'}>
          {item.status}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (item: User) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleViewUser(item.id)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleToggleStatus(item)}
            disabled={statusMutation.isPending}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              item.status === 'Active' 
                ? 'hover:bg-destructive/10 text-destructive' 
                : 'hover:bg-success/10 text-success'
            }`}
            title={item.status === 'Active' ? 'Block User' : 'Unblock User'}
          >
            {statusMutation.isPending ? (
               <Loader2 className="w-4 h-4 animate-spin" />
            ) : item.status === 'Active' ? (
               <Ban className="w-4 h-4" />
            ) : (
               <CheckCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      )
    },
  ];

  // Helper variables for Detail View
  // If `userDetails` (full data) is loading, fallback to the `selectedUser` from the list for basic info
  const displayUser = userDetails?.profile || users.find(u => u.id === selectedUserId);
  const userSubscriptions = userDetails?.subscriptions || [];
  const userAttempts = userDetails?.attempts || [];

  return (
    <DashboardLayout 
      title="Users" 
      breadcrumbs={[{ label: 'Users' }]}
    >
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field w-36"
          >
            <option value="">All Roles</option>
            <option value="Student">Student</option>
            <option value="Admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-36"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button onClick={handleExport} className="btn-outline flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Users Table */}
      {isUsersLoading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
         </div>
      ) : (
        <DataTable
            columns={columns}
            data={filteredUsers}
            searchPlaceholder="Search by name or phone..."
            emptyMessage="No users found"
        />
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        title="User Details"
        size="xl"
      >
        {isDetailsLoading && !displayUser ? (
           <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : displayUser ? (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'subscriptions'
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab('attempts')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'attempts'
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Test Attempts
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {displayUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{displayUser.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={displayUser.role === 'Admin' ? 'primary' : 'info'}>
                        {displayUser.role}
                      </Badge>
                      <Badge variant={displayUser.status === 'Active' ? 'success' : 'danger'}>
                        {displayUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{displayUser.phone}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{displayUser.email}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Registered On</p>
                    <p className="font-medium">{displayUser.registeredOn}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">{displayUser.lastLogin}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Free Tests Used</p>
                    <p className="font-medium">{displayUser.freeTestsUsed}/2</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Tests Attempted</p>
                    <p className="font-medium">{userAttempts.length || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-4">
                {userSubscriptions.length > 0 ? (
                    userSubscriptions.map((sub: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-medium">{sub.plan}</h4>
                            <Badge variant="info" >{sub.type}</Badge>
                        </div>
                        <Badge variant={sub.status === 'Active' ? 'success' : 'danger'}>
                            {sub.status}
                        </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">{sub.startDate}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">{sub.endDate}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Days Left</p>
                            <p className="font-medium text-success">{sub.daysLeft} days</p>
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                        No active subscriptions found.
                    </div>
                )}
              </div>
            )}

            {activeTab === 'attempts' && (
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium">Test Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Attempted On</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAttempts.length > 0 ? (
                        userAttempts.map((attempt: any, index: number) => (
                        <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-medium text-sm">{attempt.test}</td>
                            <td className="px-4 py-3 text-sm">{attempt.category}</td>
                            <td className="px-4 py-3 text-sm">{attempt.attemptedOn}</td>
                            <td className="px-4 py-3 text-sm">{attempt.score}</td>
                            <td className="px-4 py-3">
                            <Badge variant="success">{attempt.percentage}</Badge>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                No tests attempted yet.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
            <div className="text-center py-10 text-destructive">
                Failed to load user details. Please try again.
            </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Users;