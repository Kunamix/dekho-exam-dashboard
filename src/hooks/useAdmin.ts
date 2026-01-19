import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const useAdmin = () => {
  return useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const {data} = await api.get('/auth/admin-me');

      if(data) {
        localStorage.setItem('user_info', JSON.stringify(data));
      }
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 15 
  })
}