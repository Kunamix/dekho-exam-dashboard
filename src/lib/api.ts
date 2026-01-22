import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type':'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest.url || "";

     // Check if this is a refresh token request to prevent infinite loop
    const isRefreshEndpoint = url.includes("/admin-auth/admin-refresh-token");
    const isLogoutEndpoint = url.includes("/admin-auth/admin-logout");

     // Don't retry if:
    // 1. This is already a refresh token request
    // 2. This is a logout request
    // 3. We already tried to refresh (prevents infinite loop)
    if (isRefreshEndpoint || isLogoutEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    if(status === 401){
      originalRequest._retry = true;

      try {
        await await api.post('/admin-auth/admin-refresh-token', {});

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('user_info');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;