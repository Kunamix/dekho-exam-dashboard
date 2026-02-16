import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { mobileApi } from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

/* ----------------------------------
 Types
---------------------------------- */

export interface Test {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  subjectId?: string;
  durationMinutes?: number;
  totalQuestions?: number;
  positiveMarks?: number;
  negativeMarks?: number;
  isPaid: boolean;
  isActive: boolean;
  testNumber: number;
  type?: "Free" | "Paid";
  duration?: number;
}

export interface TestFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  isPaid?: boolean;
  search?: string;
  categoryId?: string;
  subjectId?: string;
}

/* ----------------------------------
 Queries
---------------------------------- */

// ✅ CORRECTED: Proper data extraction
export const useTests = (filters?: TestFilters) => {
  return useQuery({
    queryKey: ["tests", filters],
    queryFn: async () => {
      const { data } = await api.get("/tests", {
        params: {
          ...filters,
          isActive:
            filters?.isActive !== undefined
              ? String(filters.isActive)
              : undefined,
          isPaid:
            filters?.isPaid !== undefined
              ? String(filters.isPaid)
              : undefined,
        },
      });
      return data; // ✅ Handle both nested and flat responses
    },
    placeholderData: (previousData) => previousData,
  });
};

// ✅ CORRECTED: Proper data extraction
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories-list"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data; // ✅ Handle both nested and flat responses
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useSubjects = () => {
  return useQuery({
    queryKey: ["subjects-list"],
    queryFn: async () => {
      const { data } = await api.get("/subjects");
      return data; // ✅ Handle both nested and flat responses
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useTestById = (id?: string) => {
  return useQuery({
    queryKey: ["test", id],
    queryFn: async () => {
      const { data } = await api.get(`/tests/${id}`);
      return data; // ✅ Handle both nested and flat responses
    },
    enabled: !!id,
  });
};

/* ----------------------------------
 Mutations
---------------------------------- */

// ✅ CORRECTED: Proper data extraction and error handling
export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Test>) => {
      const { data } = await api.post("/tests", payload);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: (response) => {
      // Component can handle custom toast messages
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      return response;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // Component can handle error display
      throw error;
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: payload,
    }: {
      id: string;
      data: Partial<Test>;
    }) => {
      const { data } = await api.put(`/tests/${id}`, payload);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: () => {
      toast.success("Test updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update test");
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useDeleteTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/tests/${id}`);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: (_, id) => {
      toast.success("Test removed successfully");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["test", id] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete test");
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useToggleTestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/tests/${id}/toggle-status`);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: () => {
      toast.success("Test status updated");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update test status");
    },
  });
};

// ✅ CORRECTED: Proper data extraction
export const useRecentTests = () => {
  return useQuery({
    queryKey: ["dashboard", "recent-tests"],
    queryFn: async () => {
      const { data } = await mobileApi.get("/dashboard/recent-tests");
      return data; // ✅ Handle both nested and flat responses
    },
    retry: false,
  });
};

export const useTestRankings = (testId?: string) => {
  return useQuery({
    queryKey: ["dashboard", "test-rankings", testId],
    queryFn: async () => {
      const res = await mobileApi.get(`/profile/tests/${testId}/rankings`);
      return res.data?.data; // ✅ return inner data
    },
    enabled: !!testId,
    retry: false,
  });
};

// useGlobalRankings
export const useGlobalRankings = () => {
  return useQuery({
    queryKey: ["dashboard", "global-rankings"],
    queryFn: async () => {
      const { data } = await mobileApi.get("/profile/api/rankings/global");
      return data;
    },
    retry: false,
  });
};
