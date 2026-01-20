import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// --- Admin Profile Hook ---

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
    staleTime: 1000 * 60 * 5 
  });
};

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await api.get('/subjects');
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
      const url = subjectId ? `/topics?subjectId=${subjectId}` : '/topics';
      const { data } = await api.get(url);
      return data;
    },
    enabled: true 
  });
};

export const useQuestions = (filters?: { topicId?: string; subjectId?: string }) => {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters as any).toString();
      const { data } = await api.get(`/questions?${params}`);
      return data;
    }
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

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await api.get('/plans');
      return data;
    },
    staleTime: 1000 * 60 * 60 // 1 hour (plans change rarely)
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
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
      const { data } = await api.get('/admin/stats/overview');
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
      const { data } = await api.get('/admin/stats/users'); 
      // Returns structure like { registrationData: [...], recentUsers: [...] }
      return data;
    }
  });
};

export const useTestAnalytics = () => {
  return useQuery({
    queryKey: ['analytics-tests'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats/tests');
      // Returns structure like { testAttemptsByCategory: [...] }
      return data;
    }
  });
};