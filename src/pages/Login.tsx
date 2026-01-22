import React, { useState, useEffect } from "react";
import {
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
import { cn } from "@/lib/utils";
import { useAdminLogin } from "@/hooks/useAdminLogin"; // Import the new hook
import logo from "/images/logo.png"
const Login = () => {
  // Use the custom hook
  const { mutate: login, isPending, error: apiError } = useAdminLogin();
  
  // UI State
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    phone?: string;
  }>({});
  const [shake, setShake] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Animation on mount
  useEffect(() => {
    setTimeout(() => setIsPageLoaded(true), 100);
  }, []);

  // Validation Helpers
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  // Trigger shake animation on error
  useEffect(() => {
    if (apiError) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const validateForm = (): boolean => {
    const newErrors: typeof validationErrors = {};

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

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Call the hook
    if (loginMethod === "email") {
      login({ email, password });
    } else {
      login({ phoneNumber });
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* --- Left Side: Login Form --- */}
      <div
        className={cn(
          "w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 transition-all duration-700",
          isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div
          className={cn(
            "w-full max-w-[400px] space-y-8",
            shake && "animate-shake"
          )}
        >
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <img 
                src={logo}
                alt="Dekho Exam Logo" 
                className="h-12 w-auto object-contain" 
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back! Access your dashboard
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex p-1 bg-muted/50 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("email");
                setValidationErrors({});
              }}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                loginMethod === "email"
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("phone");
                setValidationErrors({});
              }}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                loginMethod === "phone"
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Phone Login
            </button>
          </div>

          {/* General Error Alert (From API) */}
          {apiError && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">
                {(apiError as any)?.response?.data?.message || "Something went wrong"}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMethod === "email" ? (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                        validationErrors.email ? "text-destructive" : "text-muted-foreground"
                      )}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@dekhoexam.com"
                      disabled={isPending}
                      className={cn(
                        "flex h-12 w-full rounded-lg border bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                        validationErrors.email ? "border-destructive focus-visible:ring-destructive" : "border-input"
                      )}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                        validationErrors.password ? "text-destructive" : "text-muted-foreground"
                      )}
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isPending}
                      className={cn(
                        "flex h-12 w-full rounded-lg border bg-background px-10 pr-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all",
                        validationErrors.password ? "border-destructive focus-visible:ring-destructive" : "border-input"
                      )}
                    />
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium leading-none"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                      validationErrors.phone ? "text-destructive" : "text-muted-foreground"
                    )}
                  />
                  <input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    disabled={isPending}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 10-digit number"
                    className={cn(
                      "flex h-12 w-full rounded-lg border bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all",
                      validationErrors.phone ? "border-destructive focus-visible:ring-destructive" : "border-input"
                    )}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{loginMethod === "email" ? "Login Dashboard" : "Send Verification Code"}</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 py-2 rounded-full">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Secure Login with SSL Encryption</span>
            </div>
            <p className="text-center text-xs text-muted-foreground/60">
              © 2026 Dekho_Exam. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* --- Right Side: Branding --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-violet-600 to-indigo-700">
        {/* Background Patterns */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Floating Circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

        <div
          className={cn(
            "relative z-10 flex flex-col items-center justify-center w-full p-12 text-center text-white transition-all duration-1000 delay-300",
            isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Right Logo Container */}
          <div className="mb-10 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
            <img 
              src={logo} 
              alt="Dekho Exam Logo" 
              className="h-16 w-auto object-contain drop-shadow-md"
            />
          </div>

          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            India's #1 Exam <br/> Preparation Platform
          </h2>
          <p className="text-lg text-white/80 mb-12 max-w-md leading-relaxed">
            Empowering students with comprehensive resources, real-time analytics, and expert guidance.
          </p>

          <div className="flex items-center gap-12">
            <div className="text-center group">
              <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-3 border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-sm text-white/70 font-medium tracking-wide">STUDENTS</p>
            </div>
            
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            
            <div className="text-center group">
              <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-3 border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold">100+</p>
              <p className="text-sm text-white/70 font-medium tracking-wide">EXAMS</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
};

export default Login;