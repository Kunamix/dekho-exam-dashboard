import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  default: 'badge-primary',
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
};

export const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  return (
    <span className={cn(variantStyles[variant])}>
      {children}
    </span>
  );
};
