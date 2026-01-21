import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  Users,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOtpVerification } from "@/hooks/useOtpVerification";

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Data passed from Login.tsx
  const phoneNumber = sessionStorage.getItem("otp_phone_number");

  // Custom Hook
  const { 
    verifyOtp, 
    isVerifying, 
    verifyError, 
    resendOtp, 
    isResending 
  } = useOtpVerification();

  // UI State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [shake, setShake] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Mount Animation & Validation
  useEffect(() => {
    if (!phoneNumber) {
      toast.error("Session expired. Please login again.");
      navigate("/");
      return;
    }
    setTimeout(() => setIsPageLoaded(true), 100);
    // Auto-focus first input
    inputRefs.current[0]?.focus();
  }, [phoneNumber, navigate]);

  // 2. Timer Logic
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // 3. Error Handling (Shake effect)
  useEffect(() => {
    if (verifyError) {
      setShake(true);
      setOtp(["", "", "", "", "", ""]); // Clear inputs
      inputRefs.current[0]?.focus(); // Focus first
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [verifyError]);

  // --- Handlers ---

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Call Hook
    verifyOtp({ 
      otpCode: otpValue, // Matches the updated Hook interface 
    });
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    resendOtp(phoneNumber);
    setCanResend(false);
    setResendTimer(30);
  };

  if (!phoneNumber) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side: Form */}
      <div
        className={cn(
          "w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 transition-all duration-700",
          isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div
          className={cn(
            "w-full max-w-[400px] space-y-6",
            shake && "animate-shake"
          )}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to login</span>
          </button>

          {/* Headings */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-xl">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                Dekho_Exam
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              OTP Verification
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter the 6-digit code sent to
            </p>
            <p className="text-foreground font-medium">
              +91 {phoneNumber.slice(0, 2)}****{phoneNumber.slice(-2)}
            </p>
          </div>

          {/* API Error Message */}
          {verifyError && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">
                {(verifyError as any)?.response?.data?.message || "Invalid OTP Code"}
              </p>
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground text-center">
                Enter OTP
              </label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={isVerifying}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-bold rounded-lg border bg-background text-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      "transition-all duration-200",
                      verifyError
                        ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                        : "border-input hover:border-primary/50"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Resend */}
            <div className="text-center">
              {isResending ? (
                <span className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Sending...
                </span>
              ) : canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in{" "}
                  <span className="font-medium text-foreground">
                    {resendTimer}s
                  </span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isVerifying || otp.join("").length !== 6}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-semibold text-primary-foreground",
                "bg-primary hover:bg-primary/90 active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-all duration-200",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-primary",
                "flex items-center justify-center gap-2"
              )}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify OTP</span>
              )}
            </button>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Demo OTP:</span> 123456
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure OTP Verification</span>
          </div>
        </div>
      </div>

      {/* Right Side: Branding (Unchanged) */}
      <div
        className={cn(
          "hidden lg:flex w-1/2 relative overflow-hidden",
          "bg-gradient-to-br from-primary via-primary to-violet-600"
        )}
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div
          className={cn(
            "relative z-10 flex flex-col items-center justify-center w-full p-12 text-center text-white transition-all duration-1000 delay-300",
            isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="mb-8 p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
            <GraduationCap className="h-24 w-24 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">India's #1 Exam Preparation Platform</h2>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Empowering students to achieve their dreams with comprehensive exam preparation resources
          </p>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-2">
                <Users className="h-7 w-7" />
              </div>
              <p className="text-2xl font-bold">10K+</p>
            </div>
            <div className="w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-2">
                <BookOpen className="h-7 w-7" />
              </div>
              <p className="text-2xl font-bold">100+</p>
            </div>
            <div className="w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-2">
                <HelpCircle className="h-7 w-7" />
              </div>
              <p className="text-2xl font-bold">50K+</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OTPVerification;