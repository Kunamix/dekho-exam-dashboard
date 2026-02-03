import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

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
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken?: string;
    refreshToken?: string;
    otpId?: string;
    expiresAt?: string;
    token?: string;
    phoneNumber?: string;
  };
  message: string;
  success: boolean;
}

interface VerifyOtpPayload {
  otpCode: string; 
  verificationToken?: string; 
}

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const userInfo = localStorage.getItem('user_info');
      
      if (!userInfo) {
        return null;
      }

      try {
        const {data} = await api.get('/auth/me');
        return data;
      } catch (error) {
        localStorage.removeItem('user_info');
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const payload = {
        ...credentials,
        deviceName: navigator.userAgent,
        deviceType: "web",
      };

      const {data} = await api.post(
        "/auth/login",
        payload,
      );
      return data;
    },
    onSuccess: (responseBody) => {
      const { data, message } = responseBody;

      if (data.user && data.accessToken) {
console.log("otp-not")
        toast.success("Welcome back!", { description: message });

        localStorage.setItem("user_info", JSON.stringify(data.user));

        queryClient.invalidateQueries({ queryKey: ["auth-user"] });

        navigate("/dashboard");
      }
      else if (data.otpId && data.token) {
        console.log("otp-verification")

        toast.success("OTP Sent!", { description: message });

        sessionStorage.setItem("otp_phone_number", data?.phoneNumber);

        navigate("/otp-verification");
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error("Authentication Error", { description: message });
    },
  });
};

export const useVerifyOTP = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const verifyMutation = useMutation({
    mutationFn: async ({ otpCode, verificationToken }: VerifyOtpPayload) => {
      
      const payload = {
        otpCode,
      };

      const config = verificationToken 
        ? { headers: { Authorization: `Bearer ${verificationToken}` } } 
        : {};

      const {data} = await api.post("/auth/verify-otp", payload, config);
      return data;
    },
    onSuccess: (responseBody) => {
      const { data, message } = responseBody;
      
      toast.success(message || "Login successful!");

      if (data.user) {
        localStorage.setItem("user_info", JSON.stringify(data.user));
      }

      queryClient.invalidateQueries({ queryKey: ["auth-user"] });

      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("OTP Error:", error);
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const {data} = await api.post("/auth/login", { phoneNumber });
      return data;
    },
    onSuccess: (data) => {
      toast.success("New OTP sent successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const msg = error.response?.data?.message || "Failed to resend OTP";
      toast.error(msg);
    },
  });

  return {
    verifyOtp: verifyMutation.mutate,
    isVerifying: verifyMutation.isPending,
    verifyError: verifyMutation.error,
    resendOtp: resendMutation.mutate,
    isResending: resendMutation.isPending,
  };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const {data} = await api.post("/auth/logout");
      return data;
    },
    onSuccess: (responseBody) => {
      const {data, message} = responseBody;
      if(message) {
        toast.success("Logout successfully");
        navigate("/");
      }
      localStorage.removeItem("user_info");
      queryClient.clear();
    },
    onError:(error:AxiosError<{message:string}>) => {
      const message = error.response?.data?.message || "Logout failed. Please try again";
      toast.error("Logout failed",{
        description:message
      })
    }

  })
};