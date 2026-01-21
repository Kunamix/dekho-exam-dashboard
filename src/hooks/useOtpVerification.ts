import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

interface VerifyOtpPayload {
  otpCode: string; // Key matches 'const { otp } = req.body'
  verificationToken?: string; // Needed for Authorization header
}

export const useOtpVerification = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Verify OTP Mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ otpCode, verificationToken }: VerifyOtpPayload) => {
      
      const payload = {
        otpCode, // sending 'otp' as expected by backen
      };

      // Set Authorization header if token is present
      const config = verificationToken 
        ? { headers: { Authorization: `Bearer ${verificationToken}` } } 
        : {};

      // Adjust URL to match your route file (assuming /admin-auth/verify-otp)
      const response = await api.post("/admin-auth/admin-verify-otp", payload, config);
      return response.data;
    },
    onSuccess: (responseBody) => {
      const { data, message } = responseBody;
      
      toast.success(message || "Login successful!");
      
      // Save User Info (Access token is handled by browser cookies usually, 
      // but we store user details for UI)
      if (data.user) {
        localStorage.setItem("user_info", JSON.stringify(data.user));
      }
      
      // Update global query cache
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      
      // Redirect to Dashboard
      navigate("/dashboard");
    },
    onError: (error) => {
      // Error handling is delegated to component for UI shake effect
      console.error("OTP Error:", error);
    },
  });

  // 2. Resend OTP Mutation (Calls Admin Login again)
  const resendMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      // Calling login again triggers a new OTP generation in your backend
      const response = await api.post("/admin-auth/admin-login", { phoneNumber });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("New OTP sent successfully");
      // Optional: If the resend generates a NEW verification token, 
      // you might need to update it in the component state, 
      // but usually the old token works if it's just based on user ID/Phone.
    },
    onError: (error: any) => {
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