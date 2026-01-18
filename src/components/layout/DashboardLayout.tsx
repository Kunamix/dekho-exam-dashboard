import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; path?: string }[];
}

export const DashboardLayout = ({ children, title, breadcrumbs }: DashboardLayoutProps) => {
  const { isOpen } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header title={title} breadcrumbs={breadcrumbs} />
      <main 
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          isOpen ? "pl-64" : "pl-20"
        )}
      >
        <div className="p-6 animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
};
