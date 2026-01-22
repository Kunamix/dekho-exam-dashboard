// hooks/useAdmin.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useAdmin = () => {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      // ✅ Check localStorage to see if user was logged in
      const userInfo = localStorage.getItem('user_info');
      
      if (!userInfo) {
        // User never logged in or intentionally logged out
        return null;
      }

      // ✅ User was logged in - try to fetch current user
      // If access token expired, interceptor will refresh automatically
      try {
        const response = await api.get('/admin-auth/me');
        return response.data;
      } catch (error) {
        // If refresh also failed (both tokens expired), clear localStorage
        localStorage.removeItem('user_info');
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};