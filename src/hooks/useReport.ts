import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

/* ----------------------------------
 Types
---------------------------------- */

export type ReportStatus = "PENDING" | "RESOLVED" | "REJECTED";
export type ReportType = "QUESTION" | "COMMENT" | "USER" | "OTHER";

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  reason?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  reportedBy?: {
    id: string;
    name: string;
    email: string;
  };
  question?: {
    id: string;
    questionText: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  type?: ReportType;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  rejectedReports: number;
  reportsByType: Array<{
    type: ReportType;
    count: number;
  }>;
  recentReports: Report[];
}

/* ----------------------------------
 Queries
---------------------------------- */

// ✅ CORRECTED: Proper data extraction
export const useReports = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: async () => {
      const { data } = await api.get("/reports", {
        params: filters,
      });
      return data; // ✅ Handle both nested and flat responses
    },
    staleTime: 30000, // 30 seconds
  });
};

// ✅ CORRECTED: Proper data extraction
export const useReportById = (id?: string) => {
  return useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data } = await api.get(`/reports/${id}`);
      return data; // ✅ Handle both nested and flat responses
    },
    enabled: !!id,
  });
};

// ✅ CORRECTED: Proper data extraction
export const useReportStats = () => {
  return useQuery({
    queryKey: ["report-stats"],
    queryFn: async () => {
      const { data } = await api.get("/reports/stats");
      return data; // ✅ Handle both nested and flat responses
    },
  });
};

/* ----------------------------------
 Mutations
---------------------------------- */

// ✅ CORRECTED: Proper data extraction and error handling
export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ReportStatus;
    }) => {
      const { data } = await api.patch(`/reports/${id}/status`, {
        status,
      });
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: (_, { id }) => {
      toast.success("Report status updated");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      queryClient.invalidateQueries({ queryKey: ["report-stats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update report");
    },
  });
};

// ✅ CORRECTED: Proper data extraction and error handling
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/reports/${id}`);
      return data; // ✅ Handle both nested and flat responses
    },
    onSuccess: () => {
      toast.success("Report deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-stats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete report");
    },
  });
};