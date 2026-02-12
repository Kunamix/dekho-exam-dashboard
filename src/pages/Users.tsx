import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/common/DataTable";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import {
  Download,
  Eye,
  User as UserIcon,
  CreditCard,
  ClipboardList,
  Ban,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useUsers,
  useUserById,
  useToggleUserBan,
  type User as ApiUser,
} from "@/hooks/useUser";

const transformUserForDisplay = (user: ApiUser) => ({
  id: user.id,
  phone: user.phoneNumber,
  email: user.email,
  name: user.name,
  role: user.role === "ADMIN" ? "Admin" : "Student",
  freeTestsUsed: user.freeTestsUsed,
  activeSubscriptions: user._count?.subscriptions || 0,
  testAttempts: user._count?.testAttempts || 0,
  payments: user._count?.payments || 0,
  lastLoginAt: new Date(user.lastLoginAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
  registeredOn: new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
  status: user.isActive ? "Active" : "Inactive",
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
  rawUser: user,
});

type TransformedUser = ReturnType<typeof transformUserForDisplay>;

export const Users = () => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter state
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useUsers({
    page,
    limit,
    ...(roleFilter && { role: roleFilter.toUpperCase() }),
    ...(statusFilter && { isActive: statusFilter === "Active" }),
  });

  const { mutate: toggleUserStatus, isPending: isTogglingStatus } =
    useToggleUserBan();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "subscriptions" | "attempts"
  >("profile");

  const { data: userDetails, isLoading: isDetailsLoading } = useUserById(
    selectedUserId || undefined,
  );

  // Extract users and pagination data from API response
  const apiUsers = (usersData?.data?.users as ApiUser[]) || [];
  const paginationInfo = usersData?.data?.pagination;
  const transformedUsers = apiUsers.map(transformUserForDisplay);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab("profile");
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedUserId(null), 200);
  };

  const handleToggleStatus = async (user: TransformedUser) => {
    toggleUserStatus(user.id);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  // Filter handlers
  const handleRoleFilterChange = (newRole: string) => {
    setRoleFilter(newRole);
    setPage(1); // Reset to first page when filter changes
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to first page when filter changes
  };

  const columns = [
    {
      key: "id",
      label: "User ID",
      width: "180px",
      render: (item: TransformedUser) => (
        <span className="font-mono text-xs text-muted-foreground">
          {item.id.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: "phone",
      label: "Contact",
      sortable: true,
      width: "200px",
      render: (item: TransformedUser) => (
        <div>
          <p className="font-medium text-sm">{item.phone}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
            {item.email}
          </p>
          <div className="flex gap-1 mt-1">
            {item.isPhoneVerified && (
              <Badge variant="success" className="text-[10px] px-1 py-0">
                Phone ✓
              </Badge>
            )}
            {item.isEmailVerified && (
              <Badge variant="success" className="text-[10px] px-1 py-0">
                Email ✓
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      width: "150px",
    },
    {
      key: "role",
      label: "Role",
      width: "100px",
      render: (item: TransformedUser) => (
        <Badge variant={item.role === "Admin" ? "primary" : "info"}>
          {item.role}
        </Badge>
      ),
    },
    {
      key: "freeTestsUsed",
      label: "Free Tests",
      width: "100px",
      render: (item: TransformedUser) => (
        <span
          className={
            item.freeTestsUsed >= 2 ? "text-destructive font-medium" : ""
          }
        >
          {item.freeTestsUsed}/2
        </span>
      ),
    },
    {
      key: "activeSubscriptions",
      label: "Subscriptions",
      width: "120px",
      render: (item: TransformedUser) => (
        <div className="text-center">
          <Badge variant={item.activeSubscriptions > 0 ? "success" : "default"}>
            {item.activeSubscriptions}
          </Badge>
        </div>
      ),
    },
    {
      key: "testAttempts",
      label: "Tests",
      width: "80px",
      render: (item: TransformedUser) => (
        <div className="text-center">
          <span className="font-medium">{item.testAttempts}</span>
        </div>
      ),
    },
    {
      key: "registeredOn",
      label: "Registered",
      sortable: true,
      width: "130px",
      render: (item: TransformedUser) => (
        <div className="text-sm">
          <p>{item.registeredOn}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "100px",
      render: (item: TransformedUser) => (
        <Badge variant={item.status === "Active" ? "success" : "danger"}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      render: (item: TransformedUser) => (
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
            disabled={isTogglingStatus}
            className={`p-2 rounded-lg transition-colors ${
              item.status === "Active"
                ? "hover:bg-destructive/10 text-destructive"
                : "hover:bg-success/10 text-success"
            }`}
            title={item.status === "Active" ? "Ban User" : "Unban User"}
          >
            {isTogglingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : item.status === "Active" ? (
              <Ban className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="User Management" breadcrumbs={[{ label: "Users" }]}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            className="input-field w-32"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Student">Student</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="input-field w-32"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {isUsersLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : isUsersError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load users</h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was a problem loading the users. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline"
          >
            Refresh Page
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={transformedUsers}
          searchPlaceholder="Search by name, email or phone..."
          emptyMessage="No users found"
          pagination={paginationInfo}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          searchable={false} // Disable search since we'll handle it server-side later
        />
      )}

      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        title="User Details"
        size="xl"
      >
        {isDetailsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : userDetails?.data ? (
          <div>
            <div className="flex border-b border-border mb-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === "profile"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserIcon className="w-4 h-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("subscriptions")}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === "subscriptions"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab("attempts")}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === "attempts"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-2" />
                Test Attempts
              </button>
            </div>

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-lg">
                      {userDetails.data.name}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge
                      variant={
                        userDetails.data.role === "ADMIN" ? "primary" : "info"
                      }
                    >
                      {userDetails.data.role}
                    </Badge>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {userDetails.data.phoneNumber}
                    </p>
                    {userDetails.data.isPhoneVerified && (
                      <Badge variant="success" className="mt-1 text-[10px]">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-sm break-all">
                      {userDetails.data.email}
                    </p>
                    {userDetails.data.isEmailVerified && (
                      <Badge variant="success" className="mt-1 text-[10px]">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Registered On
                    </p>
                    <p className="font-medium">
                      {new Date(userDetails.data.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">
                      {new Date(
                        userDetails.data.lastLoginAt,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Free Tests Used
                    </p>
                    <p className="font-medium">
                      {userDetails.data.freeTestsUsed}/2
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total Tests Attempted
                    </p>
                    <p className="font-medium">
                      {userDetails.data._count?.testAttempts || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Active Subscriptions
                    </p>
                    <p className="font-medium">
                      {userDetails.data._count?.subscriptions || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total Payments
                    </p>
                    <p className="font-medium">
                      {userDetails.data._count?.payments || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "subscriptions" && (
              <div className="space-y-4">
                {userDetails.data.subscriptions &&
                userDetails.data.subscriptions.length > 0 ? (
                  userDetails.data.subscriptions.map((sub: any) => {
                    const startDate = new Date(sub.startDate);
                    const endDate = new Date(sub.endDate);
                    const daysLeft = Math.ceil(
                      (endDate.getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    return (
                      <div
                        key={sub.id}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-lg">
                              {sub.plan?.name || "Unknown Plan"}
                            </h4>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="info">{sub.type}</Badge>
                              <Badge
                                variant={sub.autoRenew ? "success" : "default"}
                              >
                                {sub.autoRenew ? "Auto-Renew" : "No Auto-Renew"}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant={sub.isActive ? "success" : "danger"}>
                            {sub.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Plan Price</p>
                            <p className="font-medium">
                              ₹{sub.plan?.price || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">
                              {startDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">
                              {endDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Days Left</p>
                            <p
                              className={`font-medium ${daysLeft < 7 ? "text-destructive" : "text-success"}`}
                            >
                              {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                    No subscriptions found.
                  </div>
                )}
              </div>
            )}

            {activeTab === "attempts" && (
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Test Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Attempt #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Marks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetails.data.testAttempts &&
                    userDetails.data.testAttempts.length > 0 ? (
                      userDetails.data.testAttempts.map((attempt: any) => {
                        const percentage = parseFloat(attempt.percentage);
                        const marks = parseFloat(attempt.totalMarks);

                        return (
                          <tr
                            key={attempt.id}
                            className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-sm">
                              {attempt.test?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="info">
                                {attempt.test?.category?.name || "N/A"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              #{attempt.attemptNumber}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(attempt.submittedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  attempt.status === "SUBMITTED"
                                    ? "success"
                                    : "default"
                                }
                              >
                                {attempt.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="text-xs text-muted-foreground">
                                {attempt.correctCount}/{attempt.totalQuestions}
                              </div>
                              <div className="font-medium">
                                {attempt.attemptedCount} attempted
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div
                                className={`font-semibold ${marks >= 0 ? "text-success" : "text-destructive"}`}
                              >
                                {marks >= 0 ? "+" : ""}
                                {marks}
                              </div>
                              <div
                                className={`text-xs ${percentage >= 0 ? "text-success" : "text-destructive"}`}
                              >
                                {percentage >= 0 ? "+" : ""}
                                {percentage}%
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
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
