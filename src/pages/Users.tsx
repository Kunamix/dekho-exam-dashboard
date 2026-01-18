import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Badge } from '@/components/common/Badge';
import { Download, Eye, Shield, User as UserIcon, CreditCard, ClipboardList, Ban, CheckCircle } from 'lucide-react';
import { users as initialUsers, payments } from '@/data/mockData';
import { toast } from 'sonner';

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
  const [users, setUsers] = useState<User[]>(initialUsers as User[]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscriptions' | 'attempts'>('profile');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredUsers = users.filter((user) => {
    if (roleFilter && user.role !== roleFilter) return false;
    if (statusFilter && user.status !== statusFilter) return false;
    return true;
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setActiveTab('profile');
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map((u) =>
      u.id === userId
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
    ));
    toast.success('User status updated');
  };

  const handleExport = () => {
    toast.success('Exporting users to CSV...');
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
            onClick={() => handleViewUser(item)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleToggleStatus(item.id)}
            className={`p-2 rounded-lg transition-colors ${
              item.status === 'Active' 
                ? 'hover:bg-destructive/10 text-destructive' 
                : 'hover:bg-success/10 text-success'
            }`}
            title={item.status === 'Active' ? 'Block User' : 'Unblock User'}
          >
            {item.status === 'Active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
        </div>
      )
    },
  ];

  const userSubscriptions = [
    { plan: 'SSC Complete', type: 'Category', startDate: '2024-01-01', endDate: '2024-06-30', status: 'Active', daysLeft: 163 },
    { plan: 'Railway Master', type: 'Category', startDate: '2023-07-01', endDate: '2024-07-01', status: 'Active', daysLeft: 165 },
  ];

  const userAttempts = [
    { test: 'SSC Constable Mock Test 1', category: 'SSC Constable', attemptedOn: '2024-01-17', score: '78/100', percentage: '78%' },
    { test: 'Railway NTPC Mock Test 1', category: 'Railway NTPC', attemptedOn: '2024-01-15', score: '85/100', percentage: '85%' },
    { test: 'Banking PO Prelims Mock', category: 'Banking PO', attemptedOn: '2024-01-12', score: '72/100', percentage: '72%' },
  ];

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
      <DataTable
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Search by name or phone..."
        emptyMessage="No users found"
      />

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="User Details"
        size="xl"
      >
        {selectedUser && (
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
                      {selectedUser.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={selectedUser.role === 'Admin' ? 'primary' : 'info'}>
                        {selectedUser.role}
                      </Badge>
                      <Badge variant={selectedUser.status === 'Active' ? 'success' : 'danger'}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Registered On</p>
                    <p className="font-medium">{selectedUser.registeredOn}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">{selectedUser.lastLogin}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Free Tests Used</p>
                    <p className="font-medium">{selectedUser.freeTestsUsed}/2</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Tests Attempted</p>
                    <p className="font-medium">24</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-4">
                {userSubscriptions.map((sub, index) => (
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
                ))}
              </div>
            )}

            {activeTab === 'attempts' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="px-4 py-3">Test Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Attempted On</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAttempts.map((attempt, index) => (
                      <tr key={index} className="table-row">
                        <td className="table-cell font-medium">{attempt.test}</td>
                        <td className="table-cell">{attempt.category}</td>
                        <td className="table-cell">{attempt.attemptedOn}</td>
                        <td className="table-cell">{attempt.score}</td>
                        <td className="table-cell">
                          <Badge variant="success">{attempt.percentage}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Users;
