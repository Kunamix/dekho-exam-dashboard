import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  Users,
  BookOpen,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    phone?: string;
    general?: string;
  }>({});
  const [shake, setShake] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsPageLoaded(true), 100);
  }, []);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  // 1. Define the login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials:any) => {
      const response = await api.post("/auth/admin-login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (loginMethod === "phone") {
        toast.success("OTP sent to your phone!");
        navigate("/otp-verification", { state: { phoneNumber } });
      } else {
        toast.success("Login successful!");
        localStorage.setItem("user_info", "true");
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setErrors({ general: message });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(message);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (loginMethod === "email") {
      if (!email) newErrors.email = "Email is required";
      else if (!validateEmail(email))
        newErrors.email = "Enter a valid email address";

      if (!password) newErrors.password = "Password is required";
      else if (password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
    } else {
      if (!phoneNumber) newErrors.phone = "Phone number is required";
      else if (!validatePhone(phoneNumber))
        newErrors.phone = "Enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const payload = { email, password, phoneNumber };

    loginMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Login Form */}
      <div
        className={cn(
          "w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 transition-all duration-700",
          isPageLoaded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4",
        )}
      >
        <div
          className={cn(
            "w-full max-w-[400px] space-y-6",
            shake && "animate-shake",
          )}
        >
          {/* Logo */}
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
              Admin Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back! Access your dashboard
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => {
                setLoginMethod("email");
                setErrors({});
              }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                loginMethod === "email"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Email
            </button>
            <button
              onClick={() => {
                setLoginMethod("phone");
                setErrors({});
              }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                loginMethod === "phone"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Phone
            </button>
          </div>

          {errors.general && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMethod === "email" ? (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className={cn(
                        "absolute left-3 top-3.5 h-5 w-5",
                        errors.email
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@dekhoexam.com"
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        errors.email ? "border-destructive" : "border-input",
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={cn(
                        "absolute left-3 top-3.5 h-5 w-5",
                        errors.password
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={cn(
                        "w-full pl-10 pr-12 py-3 rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        errors.password ? "border-destructive" : "border-input",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-foreground"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className={cn(
                      "absolute left-3 top-3.5 h-5 w-5",
                      errors.phone
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  />
                  <input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 10-digit number"
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      errors.phone ? "border-destructive" : "border-input",
                    )}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{loginMethod === "email" ? "Login" : "Send OTP"}</span>
              )}
            </button>
          </form>

          {/* Security & Footer */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure Login with SSL Encryption</span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              © 2024 Dekho_Exam. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding (Unchanged) */}
      <div
        className={cn(
          "hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-violet-600",
        )}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className={cn(
            "relative z-10 flex flex-col items-center justify-center w-full p-12 text-center text-white transition-all duration-1000 delay-300",
            isPageLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8",
          )}
        >
          <div className="mb-8 p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
            <GraduationCap className="h-24 w-24 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            India's #1 Exam Preparation Platform
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Empowering students with comprehensive resources
          </p>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-2">
                <Users className="h-7 w-7" />
              </div>
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-sm text-white/70">Students</p>
            </div>
            <div className="w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-2">
                <BookOpen className="h-7 w-7" />
              </div>
              <p className="text-2xl font-bold">100+</p>
              <p className="text-sm text-white/70">Exams</p>
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
      `}</style>
    </div>
  );
};

export default Login;
