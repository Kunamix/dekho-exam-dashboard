import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  Shield,
  CheckCircle,
  Users,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [shake, setShake] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check for saved email in localStorage
    const savedEmail = localStorage.getItem('dekhoexam_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    // Trigger page load animation
    setTimeout(() => setIsPageLoaded(true), 100);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

    setIsLoading(true);
    setErrors({});

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock authentication
    if (email === 'admin@dekhoexam.com' && password === 'Admin@123') {
      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('dekhoexam_remember_email', email);
      } else {
        localStorage.removeItem('dekhoexam_remember_email');
      }
      
      toast.success('Login successful! Redirecting...', {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setIsLoading(false);
      setErrors({ general: 'Invalid email or password. Please try again.' });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset link would be sent to your email');
  };

  const isFormValid = email && password && validateEmail(email) && password.length >= 6;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Login Form */}
      <div className={cn(
        "w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 transition-all duration-700",
        isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className={cn(
          "w-full max-w-[400px] space-y-6",
          shake && "animate-shake"
        )}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-xl">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Dekho_Exam</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Login</h1>
            <p className="text-muted-foreground text-sm">
              Welcome back! Please login to your account
            </p>
          </div>

          {/* Error Banner */}
          {errors.general && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={cn(
                    "h-5 w-5 transition-colors",
                    errors.email ? "text-destructive" : "text-muted-foreground"
                  )} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="admin@dekhoexam.com"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "transition-all duration-200",
                    errors.email 
                      ? "border-destructive focus:ring-destructive/20 focus:border-destructive" 
                      : "border-input hover:border-primary/50"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={cn(
                    "h-5 w-5 transition-colors",
                    errors.password ? "text-destructive" : "text-muted-foreground"
                  )} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  className={cn(
                    "w-full pl-10 pr-12 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "transition-all duration-200",
                    errors.password 
                      ? "border-destructive focus:ring-destructive/20 focus:border-destructive" 
                      : "border-input hover:border-primary/50"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-5 h-5 rounded border-2 transition-all duration-200",
                    "peer-checked:bg-primary peer-checked:border-primary",
                    "border-input group-hover:border-primary/50"
                  )}>
                    {rememberMe && (
                      <CheckCircle className="h-4 w-4 text-primary-foreground absolute top-0.5 left-0.5" />
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-semibold text-primary-foreground",
                "bg-primary hover:bg-primary/90 active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-all duration-200",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-primary",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className={cn(
              "w-full py-3 px-4 rounded-lg font-medium",
              "bg-background border border-input hover:bg-accent",
              "text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "transition-all duration-200",
              "flex items-center justify-center gap-3"
            )}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Login with Google</span>
          </button>

          {/* Demo Credentials */}
          <div className="text-center p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Demo credentials:</span> admin@dekhoexam.com / Admin@123
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure Login with SSL Encryption</span>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            © 2024 Dekho_Exam. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className={cn(
        "hidden lg:flex w-1/2 relative overflow-hidden",
        "bg-gradient-to-br from-primary via-primary to-violet-600"
      )}>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          {/* Circles */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
          
          {/* Floating Elements */}
          <div className="absolute top-32 right-32 w-16 h-16 border-2 border-white/20 rounded-xl rotate-12 animate-float" />
          <div className="absolute bottom-40 left-24 w-12 h-12 border-2 border-white/20 rounded-full animate-float-delayed" />
          <div className="absolute top-1/2 right-16 w-8 h-8 bg-white/10 rounded-lg rotate-45" />
        </div>

        {/* Content */}
        <div className={cn(
          "relative z-10 flex flex-col items-center justify-center w-full p-12 text-center text-white transition-all duration-1000 delay-300",
          isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Main Illustration Area */}
          <div className="mb-8 p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
            <GraduationCap className="h-24 w-24 text-white" />
          </div>

          {/* Tagline */}
          <h2 className="text-3xl font-bold mb-4">
            India's #1 Exam Preparation Platform
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Empowering students to achieve their dreams with comprehensive exam preparation resources
          </p>

          {/* Stats */}
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
            <div className="w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-2">
                <HelpCircle className="h-7 w-7" />
              </div>
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-sm text-white/70">Questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Login;
