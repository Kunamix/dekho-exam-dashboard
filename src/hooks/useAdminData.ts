import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// --- Admin Profile Hook ---

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/category/categories');
      return data;
    },
    staleTime: 1000 * 60 * 5 
  });
};

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await api.get('/subject/get-all-subjects');
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
};

export const useTopics = (subjectId?: string) => {
  return useQuery({
    queryKey: ['topics', subjectId],
    queryFn: async () => {
      // Fetch all if no ID, or filter by subjectId
      const url = subjectId ? `/topic/get-all-topics?subjectId=${subjectId}` : '/topic/get-all-topics';
      const { data } = await api.get(url);
      return data;
    },
    enabled: true 
  });
};


// ... existing hooks ...

// Updated Question Hook to match your new Controller
export const useQuestions = (filters?: { 
  subjectId?: string; 
  topicId?: string; 
  difficultyLevel?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.subjectId) params.append('subjectId', filters.subjectId);
      if (filters?.topicId) params.append('topicId', filters.topicId);
      if (filters?.difficultyLevel) params.append('difficultyLevel', filters.difficultyLevel);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const { data } = await api.get(`/question/get-all-question?${params.toString()}`);
      return data.data; // Expecting { questions: [], pagination: {} }
    },
  });
};

export const useQuestionStats = () => {
  return useQuery({
    queryKey: ['question-stats'],
    queryFn: async () => {
      const { data } = await api.get('/question/questions/stats');
      return data.data;
    },
  });
};

export const useTests = () => {
  return useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const { data } = await api.get('/tests');
      return data;
    }
  });
};

// --- Business & User Hooks ---

export const useSubscriptionPlans = (filters?: { 
  isActive?: boolean; 
  type?: string; 
  categoryId?: string; 
  page?: number; 
  limit?: number; 
}) => {
  return useQuery({
    queryKey: ['plans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters?.type) params.append('type', filters.type);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      // Endpoint: /subscription/get-all-subscriptions
      const { data } = await api.get(`/subscription/get-all-subscriptions?${params.toString()}`);
      return data.data; // Expecting { plans: [], pagination: {} }
    },
  });
};

export const useSubscriptionStats = () => {
  return useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      // Endpoint: /subscription/stats
      const { data } = await api.get('/subscription/stats');
      return data.data;
    },
  });
};

export const useSubscriptionPlanById = (id: string | null) => {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      if (!id) return null;
      // Endpoint: /subscription/get-subscription-by-id/:id
      const { data } = await api.get(`/subscription/get-subscription-by-id/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useUserSubscriptions = (filters?: {
  userId?: string;
  planId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['user-subscriptions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.planId) params.append('planId', filters.planId);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      // Endpoint: /subscription/user-subscriptions
      const { data } = await api.get(`/subscription/user-subscriptions?${params.toString()}`);
      return data.data;
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/user/get-all-users');
      return data;
    }
  });
};

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await api.get('/admin/payments');
      return data;
    }
  });
};

// --- Analytics & Dashboard Hooks ---

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/get-dashboard-stats');
      return data;
    }
  });
};

export const useRevenueAnalytics = () => {
  return useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats/revenue');
      // Returns structure like { monthlyRevenue: [...] }
      return data;
    }
  });
};

export const useUserAnalytics = () => {
  return useQuery({
    queryKey: ['analytics-users'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/get-all-users-data'); 
      // Returns structure like { registrationData: [...], recentUsers: [...] }
      return data;
    }
  });
};

export const useTestAnalytics = () => {
  return useQuery({
    queryKey: ['analytics-tests'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/get-tests-list');
      // Returns structure like { testAttemptsByCategory: [...] }
      return data;
    }
  });
};

