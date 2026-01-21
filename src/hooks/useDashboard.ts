import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// ==========================================
// 1. CONTENT MANAGEMENT
// ==========================================

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Backend: getCategoriesList
      // Unwrapping: response.data (ApiResponse) -> response.data.data (Payload)
      const { data } = await api.get('/dashboard/get-categories-list');
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      // Backend: getSubjectsList
      const { data } = await api.get('/dashboard/get-subjects-list');
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuestions = (filters?: { subjectId?: string; topicId?: string }) => {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: async () => {
      // Backend: getQuestionsList
      // We convert the filters object into a query string (e.g., ?subjectId=123)
      const params = new URLSearchParams(filters as any).toString();
      const { data } = await api.get(`/dashboard/get-questions-list?${params}`);
      return data.data;
    },
  });
};

export const useTests = () => {
  return useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      // Backend: getTestsList
      const { data } = await api.get('/dashboard/get-tests-list');
      return data.data;
    },
  });
};

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Backend: getAllUsersData
      const { data } = await api.get('/dashboard/get-all-users-data');
      // The controller returns { users, total, page }. We return the users array for the table.
      return data.data.users; 
    },
  });
};

// Helper to get specific user details (User Details Modal)
// Since there isn't a specific single-user endpoint in the router yet, 
// we filter from the main list (cached) or fetch all.
export const useUserDetails = (userId: string | null) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await api.get('/dashboard/get-all-users-data');
      const user = data.data.users.find((u: any) => u.id === userId);
      return user || null;
    },
    enabled: !!userId,
  });
};

// ==========================================
// 3. FINANCE & SUBSCRIPTIONS
// ==========================================

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      // Backend: getPaymentHistory
      const { data } = await api.get('/get-payment-history');
      return data.data;
    },
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      // Backend: getSubscriptionPlansList
      const { data } = await api.get('/get-subscription-plan-list');
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// ==========================================
// 4. DASHBOARD & ANALYTICS
// ==========================================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Backend: getDashboardStats
      const { data } = await api.get('/dashboard/get-dashboard-stats');
      return data.data;
    },
  });
};

// This hook fetches all charts (Revenue, User Growth, Test Attempts, etc.)
export const useDashboardCharts = () => {
  return useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: async () => {
      // Backend: getDashboardCharts
      const { data } = await api.get('/dashboard/get-dashboard-charts');
      return data.data;
    },
  });
};

export const useRecentUsersWidget = () => {
  return useQuery({
    queryKey: ['recent-users-widget'],
    queryFn: async () => {
      // Backend: getRecentUsersWidget
      const { data } = await api.get('/dashboard/get-recent-user-widget');
      return data.data;
    },
  });
};

// --- Compatibility Mappers (Optional) ---
// If your components expect specific hooks like useRevenueAnalytics, 
// you can wrap the main chart hook to return specific data slices.

export const useRevenueAnalytics = () => {
  const { data, ...rest } = useDashboardCharts();
  return {
    ...rest,
    data: {
      // Map the backend fields to what the UI component expects
      monthlyRevenue: data?.monthlyRevenue || [], 
      distribution: data?.subscriptionDistribution || []
    } 
  };
};

export const useUserAnalytics = () => {
  const { data: chartsData, ...restCharts } = useDashboardCharts();
  const { data: recentUsers } = useRecentUsersWidget();
  
  return {
    ...restCharts,
    data: {
      registrationData: chartsData?.userRegistrationData || [],
      recentUsers: recentUsers || [],
    }
  };
};

export const useTestAnalytics = () => {
  const { data, ...rest } = useDashboardCharts();
  return {
    ...rest,
    data: {
      testAttemptsByCategory: data?.testAttemptsByCategory || [],
    }
  };
};