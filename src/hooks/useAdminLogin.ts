import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api"; // Your axios instance

// Types based on your backend controller
interface LoginCredentials {
  email?: string;
  password?: string;
  phoneNumber?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
}

interface LoginResponse {
  statusCode: number;
  data: {
    // Present if Email Login
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken?: string;
    refreshToken?: string;

    // Present if Phone Login
    otpId?: string;
    expiresAt?: string;
    token?: string;
    phoneNumber?: string; // The verification token
  };
  message: string;
  success: boolean;
}

interface UpdateProfilePayload {
  name?: string;
  email?: string | null;
  phoneNumber?: string;
}

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}


export const useAdminLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Add device info if not present (optional, based on your controller)
      const payload = {
        ...credentials,
        deviceName: navigator.userAgent,
        deviceType: "web",
      };

      const response = await api.post<LoginResponse>(
        "/admin-auth/admin-login",
        payload,
      );
      return response.data;
    },
    onSuccess: (responseBody) => {
      const { data, message } = responseBody;

      // Scenario A: Email Login (Direct Success)
      if (data.user && data.accessToken) {
        toast.success("Welcome back!", { description: message });

        // Update global auth state (Cache/LocalStorage)
        localStorage.setItem("user_info", JSON.stringify(data.user));

        // Invalidate queries to fetch fresh user data if you have a useUser hook
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });

        navigate("/dashboard");
      }
      // Scenario B: Phone Login (Requires OTP)
      else if (data.otpId && data.token) {
        toast.success("OTP Sent!", { description: message });
        sessionStorage.setItem("otp_phone_number", data?.phoneNumber);

        // Navigate to OTP page passing necessary data
        navigate("/otp-verification", {
          state: {
            otpId: data.otpId,
            verificationToken: data.token, // Pass the token needed for verification header
            expiresAt: data.expiresAt,
          },
        });
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error("Authentication Error", { description: message });
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/admin-auth/admin-logout", {});
      return response.data;
    },

    onSuccess: (responseBody) => {
      const { message } = responseBody;

      // 🔐 Clear client-side auth data
      localStorage.removeItem("user_info");
    
      sessionStorage.clear();

      // 🧹 Clear React Query cache
      queryClient.clear();

      toast.success("Logged out", {
        description: message || "Logout successful",
      });

      // 🚀 Redirect to login
      navigate("/", { replace: true });
    },

    onError: (error: any) => {
      // Even if backend fails, force logout on client
      localStorage.removeItem("user_info");
      localStorage.removeItem("accessToken");
      sessionStorage.clear();
      queryClient.clear();

      const message =
        error.response?.data?.message || "Session expired. Please login again.";

      toast.error("Logged out", { description: message });

      navigate("/", { replace: true });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await api.put(
        "/user/update-profile",
        payload
      );
      return response.data;
    },

    onSuccess: (responseBody) => {
      const { data, message } = responseBody;

      // ✅ Update localStorage
      localStorage.setItem("user_info", JSON.stringify(data));

      // ♻️ Refresh auth/user cache if any
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });

      toast.success("Profile updated", {
        description: message || "Your profile has been updated",
      });
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Profile update failed"
      );
    },
  });
};

export const useUpdateProfilePic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.put(
        "/admin/profile/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },

    onSuccess: (responseBody) => {
      const { data, message } = responseBody;

      // ✅ Sync updated user
      localStorage.setItem("user_info", JSON.stringify(data));

      queryClient.invalidateQueries({ queryKey: ["auth-user"] });

      toast.success("Profile picture updated", {
        description: message || "Avatar updated successfully",
      });
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Profile picture upload failed"
      );
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (payload: UpdatePasswordPayload) => {
      const response = await api.put(
        "/user/update-password",
        payload
      );
      return response.data;
    },

    onSuccess: (responseBody) => {
      toast.success("Password updated", {
        description:
          responseBody?.message || "Password changed successfully",
      });
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Password update failed"
      );
    },
  });
};

