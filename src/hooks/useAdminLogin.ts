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
