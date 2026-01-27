import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest.url || "";

    

    const isRefreshEndpoint = url.includes("/auth/refresh-token");
    const isLogoutEndpoint = url.includes("/auth/logout");

    // ✅ Don't intercept refresh or logout endpoints
    if (isRefreshEndpoint || isLogoutEndpoint) {
      return Promise.reject(error);
    }

    // ✅ Handle 401 errors (expired access token)
    if (status === 401 && !originalRequest._retry) {
      // Check if user has user_info (was previously logged in)
      const userInfo = localStorage.getItem('user_info');
      
      if (!userInfo) {
        // User was never logged in or intentionally logged out
        // Don't try to refresh
        return Promise.reject(error);
      }

      // ✅ User was logged in - try to refresh
      if (isRefreshing) {
        // Already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ Try to refresh the token
        await api.post('/auth/refresh-token', {});
        
        isRefreshing = false;
        processQueue(null, 'token');
        
        // ✅ Retry the original request with new access token
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // ✅ Refresh failed - both tokens expired (after 30 days)
        // Clear localStorage and redirect to login
        localStorage.removeItem('user_info');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/' && 
            !window.location.pathname.includes('/login')) {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;