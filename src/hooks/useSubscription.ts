import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

/* ----------------------------------
 Types
---------------------------------- */

export type PlanType = "CATEGORY_SPECIFIC" | "ALL_CATEGORIES";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  durationDays: number;
  type: PlanType;
  categoryId?: string | null;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
  _count?: {
    userSubscriptions: number;
  };
}

export interface PlanFilters {
  page?: number;
  limit?: number;
  isActive?: string;
  type?: PlanType;
  categoryId?: string;
}

/* ----------------------------------
 Queries
---------------------------------- */

// Get all plans (with filters)
export const useSubscriptionPlans = (filters?: PlanFilters) => {
  return useQuery({
    queryKey: ["subscription-plans", filters],
    queryFn: async () => {
      const { data } = await api.get("/subscriptions/plans", {
        params: filters,
      });
      return data;
    }
  });
};

// Get plan by ID
export const useSubscriptionPlanById = (id?: string) => {
  return useQuery({
    queryKey: ["subscription-plan", id],
    queryFn: async () => {
      const { data } = await api.get(`/subscriptions/plans/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Subscription stats (admin)
export const useSubscriptionStats = () => {
  return useQuery({
    queryKey: ["subscription-stats"],
    queryFn: async () => {
      const { data } = await api.get("/subscriptions/plans/stats");
      return data;
    },
  });
};

/* ----------------------------------
 Mutations
---------------------------------- */

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<SubscriptionPlan>) => {
      const { data } = await api.post("/subscriptions/plans", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Subscription plan created successfully");
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to create plan");
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<SubscriptionPlan>;
    }) => {
      const { data } = await api.put(`/subscriptions/plans/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Subscription plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update plan");
    },
  });
};

export const useToggleSubscriptionPlanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(
        `/subscriptions/plans/${id}/toggle-status`
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Subscription plan status updated");
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to toggle status");
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/subscriptions/plans/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Subscription plan removed");
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete plan");
    },
  });
};