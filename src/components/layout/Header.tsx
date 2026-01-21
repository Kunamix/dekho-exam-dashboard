import { Bell, ChevronDown, Menu, LogOut, User } from "lucide-react";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/useAdminLogin";

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; path?: string }[];
}

export const Header = ({ title, breadcrumbs = [] }: HeaderProps) => {
  const { mutate: logout } = useLogout();
  const { isOpen, toggle } = useSidebarContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // ✅ Get user from localStorage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_info") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userName = user?.data?.name || "User";
  const userRole = user?.data?.role || "Admin";

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user_info");
    // optional
    logout();
    navigate("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 bg-card border-b border-border h-16 transition-all duration-300",
        isOpen ? "left-64" : "left-20",
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="page-title">{title}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {initials}
                </span>
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>

              <ChevronDown className="w-4 h-4 hidden md:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-medium border border-border animate-scale-in">
                <div className="p-2">
                  <Link
                    to="/settings"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </Link>

                  <hr className="my-2 border-border" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
