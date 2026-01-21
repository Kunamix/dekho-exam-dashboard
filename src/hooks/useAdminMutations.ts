import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner"; // Assuming you use sonner or similar for toasts

// --- 1. CATEGORIES ---export 
interface Category {
  id: string;
  name: string;
  description: string;
  image: string | null;
  subjectsCount: number;
  testsCount: number;
  isActive: boolean;
  displayOrder: number;
}

// The data required to Create or Update (omits ID and counts)
export interface CategoryInput {
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  image?: string | null;
}



export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  // <ResponseData, ErrorType, VariablesType>
  return useMutation({
    // Explicitly type the argument here:
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryInput> }) => {
      const res = await api.patch(`/category/update-category/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category updated successfully");
    }
  });
};

// Fix Create Hook
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Explicitly type the argument here:
    mutationFn: async (data: CategoryInput) => {
      const res = await api.post('/category/create', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category created successfully");
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id:string) => {
      const res = await api.delete(`/category/delete-category/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category deleted");
    }
  });
};

// --- 2. SUBJECTS ---

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data:any) => {
      const res = await api.post('/subject/create', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success("Subject added");
    }
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/subject/update-subject/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success("Subject updated");
    }
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id:string) => {
      const res = await api.delete(`/subject/delete-subject/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success("Subject deleted");
    }
  });
};

// --- 3. TOPICS ---

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data:any) => {
      const res = await api.post('/topic/create', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success("Topic created");
    }
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/topics/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success("Topic updated");
    }
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id:string) => {
      const res = await api.delete(`/topics/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success("Topic deleted");
    }
  });
};

// --- 4. QUESTIONS (Bank) ---

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/question/create', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question-stats'] });
      toast.success("Question created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create question");
    }
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/question/questions/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success("Question updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update question");
    }
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/question/questions/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question-stats'] });
      toast.success("Question deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete question");
    }
  });
};

export const useBulkUploadQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Note: Don't set Content-Type manually, let the browser/axios set it for FormData
      const res = await api.post('/question/questions/bulk-upload', formData); 
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success(data.message || "Bulk upload successful");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Bulk upload failed");
    }
  });
};

// --- 5. TESTS (Mock Tests) ---

export const useCreateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/tests', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast.success("Test created successfully");
    }
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/tests/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast.success("Test updated");
    }
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id:string) => {
      const res = await api.delete(`/tests/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast.success("Test deleted");
    }
  });
};

// --- 6. SUBSCRIPTION PLANS ---

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data:any) => {
      const res = await api.post('/subscription/create', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success("Subscription plan created");
    }
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/plans/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success("Plan updated");
    }
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id:string) => {
      const res = await api.delete(`/plans/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success("Plan deleted");
    }
  });
};

// --- 7. USER MANAGEMENT (Admin Actions) ---

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: any }) => {
      // e.g. status: 'Active' | 'Inactive' | 'Banned'
      const res = await api.patch(`/admin/users/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User status updated");
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User removed");
    }
  });
};

// Add this to your hooks/useAdminData.ts file
export const useUserDetails = (userId: string | null) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      // Adjust endpoint based on your actual API structure
      const { data } = await api.get(`/admin/users/${userId}`);
      return data;
    },
    enabled: !!userId, // Query only runs when userId is not null
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};