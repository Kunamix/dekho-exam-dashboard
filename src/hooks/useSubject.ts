import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

export interface Subject {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive: boolean;
  categories?: { id: string; name: string }[];
  totalQuestions?: number;
  totalTopics?: number;
}

export interface SubjectFilters {
  page?: number;
  limit?: number;
  isActive?: string;
  search?: string;
  categoryId?: string;
}

// Fixed: Returns the full response data (which contains subjects array)
export const useSubjects = (filters?: SubjectFilters) => {
  return useQuery({
    queryKey: ["subjects", filters],
    queryFn: async () => {
      const { data } = await api.get("/subjects", { params: filters });
      return data;
    },
  });
};

export const useSubjectById = (id?: string) => {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: async () => {
      const { data } = await api.get(`/subjects/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useSubjectStats = (id?: string) => {
  return useQuery({
    queryKey: ["subject-stats", id],
    queryFn: async () => {
      const { data } = await api.get(`/subjects/${id}/stats`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Subject>) => {
      const { data } = await api.post("/subjects", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to create subject");
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: updateData,
    }: {
      id: string;
      data: Partial<Subject>;
    }) => {
      const { data } = await api.put(`/subjects/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update subject");
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/subjects/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete subject");
    },
  });
};

export const useToggleSubjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/subjects/${id}/toggle-status`);
      return data;
    },
    onSuccess: () => {
      toast.success("Subject status updated");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
};

export const useReorderSubjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subjects: { id: string; displayOrder: number }[]) => {
      const { data } = await api.post("/subjects/reorder", { subjects });
      return data;
    },
    onSuccess: () => {
      toast.success("Subjects reordered successfully");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to reorder subjects");
    },
  });
};