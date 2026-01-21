import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";

const PublicRoute = () => {
  const { data: user, isLoading } = useAdmin();

  // 1. Show a loading spinner instead of null (white screen)
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. If user exists, they shouldn't be here -> Send to Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. If no user, allow access to Login/OTP pages
  return <Outlet />;
};

export default PublicRoute;