import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// ✅ CORRECTED: Removed unnecessary try/catch, proper data extraction
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      return data; // ✅ Handle both nested and flat responses
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

// ✅ CORRECTED: Consistent data extraction
export const useDashboardCharts = () => {
  return useQuery({
    queryKey: ["dashboard", "charts"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/charts");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

// ✅ Already correct
export const useRecentUsersWidget = () => {
  return useQuery({
    queryKey: ["recent-users-widget"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/recent-users");
      return data;
    },
  });
};

// ✅ Already correct
export const useRevenueAnalytics = () => {
  const { data, ...rest } = useDashboardCharts();
  return {
    ...rest,
    data: {
      monthlyRevenue: data?.data?.monthlyRevenue || [],
      distribution: data?.data?.subscriptionDistribution || [],
    },
  };
};

// ✅ Already correct
export const useUserAnalytics = () => {
  const { data: chartsData, ...restCharts } = useDashboardCharts();
  const { data: recentUsers } = useRecentUsersWidget();
  return {
    ...restCharts,
    data: {
      registrationData: chartsData?.data?.userRegistrationData || [],
      recentUsers: recentUsers?.data || [],
    },
  };
};

// ✅ Already correct
export const useTestAnalytics = () => {
  const { data, ...rest } = useDashboardCharts();
  return {
    ...rest,
    data: {
      testAttemptsByCategory: data?.data?.testAttemptsByCategory || [],
    },
  };
};

// ✅ CORRECTED: Consistent data extraction
export const useReportsAnalytics = () => {
  return useQuery({
    queryKey: ["reports-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/analytics");
      return data;
    },
  });
};

// ✅ CORRECTED: Consistent data extraction
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ["dashboard", "analytics"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/analytics");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

// ✅ CORRECTED: Consistent data extraction
export const useRecentUsers = () => {
  return useQuery({
    queryKey: ["dashboard", "recent-users"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/recent-users");
      return data;
    },
    retry: false,
  });
};

// ✅ CORRECTED: Consistent data extraction
export const useRecentPayments = () => {
  return useQuery({
    queryKey: ["dashboard", "recent-payments"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/recent-payments");
      return data;
    },
    retry: false,
  });
};

// ✅ CORRECTED: Consistent data extraction
export const useRecentTests = () => {
  return useQuery({
    queryKey: ["dashboard", "recent-tests"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/recent-tests");
      return data;
    },
    retry: false,
  });
};