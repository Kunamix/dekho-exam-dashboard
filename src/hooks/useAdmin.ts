import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const useAdmin = () => {
  return useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const {data} = await api.get('/admin-auth/me');

      if(data) {
        localStorage.setItem('user_info', JSON.stringify(data));
      }
      return data;
    },
    initialData: () => {
      const isLoggedIn = localStorage.getItem("user_info");
      return isLoggedIn ? ({}) : undefined;
    },
    retry: false,
    staleTime: 1000 * 60 * 15 
  })
}