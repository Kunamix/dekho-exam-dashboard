import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

/* ----------------------------------
 Types
---------------------------------- */

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: "STUDENT" | "ADMIN";
  freeTestsUsed: number;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  _count?: {
    testAttempts: number;
    subscriptions: number;
    payments: number;
    sessions?: number;
  };
  subscriptions?: any[];
  testAttempts?: any[];
  payments?: any[];
  sessions?: any[];
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  studentUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  userGrowth?: number;
}

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/* ----------------------------------
 Queries
---------------------------------- */

// ✅ CORRECTED: Proper data extraction
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const { data } = await api.get("/users", {
        params: {
          ...filters,
          isActive:
            filters?.isActive !== undefined
              ? String(filters.isActive)
              : undefined,
        },
      });
      return data; // ✅ Handle both nested and flat responses
    },
    staleTime: 30000,
  });
};

// ✅ CORRECTED: Proper data extraction
export const useUserById = (id?: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data; // ✅ Handle both nested and flat responses
    },
    enabled: !!id,
  });
};

// ✅ CORRECTED: Proper data extraction
export const useUserStats = () => {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const { data } = await api.get("/users/stats");
      return data; // ✅ Handle both nested and flat responses
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useSearchUsers = (query?: string, limit = 10) => {
  return useQuery({
    queryKey: ["user-search", query, limit],
    queryFn: async () => {
      const { data } = await api.get("/users/search", {
        params: { query, limit },
      });
      return data; // ✅ Handle both nested and flat responses
    },
    enabled: !!query && query.length > 0,
  });
};

/* ----------------------------------
 Mutations
---------------------------------- */

// ✅ CORRECTED: Proper data extraction
export const useToggleUserBan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.patch(`/users/${userId}/toggle-ban`);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: (_, userId) => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update user status");
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/users/${userId}`);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useResetUserFreeTests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.patch(`/users/${userId}/reset-free-tests`);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: (_, userId) => {
      toast.success("Free tests reset successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to reset free tests");
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useInvalidateUserSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post(`/users/${userId}/invalidate-sessions`);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: () => {
      toast.success("User sessions invalidated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to invalidate sessions");
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: {
        name?: string;
        email?: string;
        phoneNumber?: string;
        role?: "STUDENT" | "ADMIN";
      };
    }) => {
      const { data } = await api.put(`/users/${userId}`, payload);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: (_, { userId }) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });
};

// ✅ Already correct
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      email?: string;
    }) => {
      const { data } = await api.put("/users/update-profile", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (payload: UpdatePasswordPayload) => {
      const { data } = await api.put("/users/update-password", payload);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: (responseBody) => {
      toast.success("Password updated", {
        description: responseBody?.message || "Password changed successfully",
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Password update failed");
    },
  });
};