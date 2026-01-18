import { Bell, Search, ChevronDown, Menu, LogOut, User, Settings } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; path?: string }[];
}

export const Header = ({ title, breadcrumbs = [] }: HeaderProps) => {
  const { isOpen, toggle } = useSidebarContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'New user registration: Aditya Verma', time: '5 min ago' },
    { id: 2, text: 'Payment received: ₹1,499', time: '15 min ago' },
    { id: 3, text: 'Test completed by 24 students', time: '1 hour ago' },
  ];

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 bg-card border-b border-border h-16 transition-all duration-300",
      isOpen ? "left-64" : "left-20"
    )}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="page-title">{title}</h1>
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                <span>Home</span>
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center gap-2">
                    <span>/</span>
                    <span className={index === breadcrumbs.length - 1 ? 'text-foreground' : ''}>
                      {crumb.label}
                    </span>
                  </span>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-64">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-medium border border-border animate-scale-in">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                      <p className="text-sm">{notif.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <button className="text-sm text-primary hover:underline w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">VR</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">Vikram Roy</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 hidden md:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-medium border border-border animate-scale-in">
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <hr className="my-2 border-border" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left">
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
