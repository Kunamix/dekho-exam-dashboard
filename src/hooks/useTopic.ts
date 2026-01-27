import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

/* ----------------------------------
 Types
---------------------------------- */

export interface Topic {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  isActive: boolean;
  displayOrder?: number;
  hasStudyMaterial?: boolean;
  hasVideo?: boolean;
  questionsCount?: number;
  studyContent?: string;
  videoUrl?: string;
}

export interface TopicFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  subjectId?: string;
}

/* ----------------------------------
 Queries
---------------------------------- */

// Get all topics - FIXED
export const useTopics = (filters?: TopicFilters | string) => {
  // Handle both object filters and string subjectId
  const queryFilters = typeof filters === 'string' 
    ? { subjectId: filters } 
    : filters;

  return useQuery({
    queryKey: ["topics", queryFilters],
    queryFn: async () => {
      const { data } = await api.get("/topics", {
        params: {
          ...queryFilters,
          isActive:
            queryFilters?.isActive !== undefined
              ? String(queryFilters.isActive)
              : undefined,
        },
      });
      // Handle both nested and flat responses
      return data;
    },
  });
};

// Get topic by ID - FIXED
export const useTopicById = (id?: string) => {
  return useQuery({
    queryKey: ["topic", id],
    queryFn: async () => {
      const { data } = await api.get(`/topics/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

/* ----------------------------------
 Mutations
---------------------------------- */

export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Topic>) => {
      const { data } = await api.post("/topics", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Topic created successfully");
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to create topic");
    },
  });
};

// FIXED: Changed payload to data to match component usage
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: updateData,
    }: {
      id: string;
      data: Partial<Topic>;
    }) => {
      const { data } = await api.put(`/topics/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      toast.success("Topic updated successfully");
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update topic");
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/topics/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Topic deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete topic");
    },
  });
};