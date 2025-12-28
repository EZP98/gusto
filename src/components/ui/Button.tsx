import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    ...props
  }, ref) => {

    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-chef-500/50 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const variantStyles = {
      primary: 'bg-chef-500 text-white hover:bg-chef-600 shadow-lg shadow-chef-500/25 hover:shadow-chef-500/40',
      secondary: 'bg-chef-100 dark:bg-chef-500/15 text-chef-700 dark:text-chef-300 hover:bg-chef-200 dark:hover:bg-chef-500/25',
      outline: 'border-2 border-chef-500 text-chef-600 dark:text-chef-400 hover:bg-chef-50 dark:hover:bg-chef-500/10',
      ghost: 'text-chef-600 dark:text-chef-400 hover:bg-chef-50 dark:hover:bg-chef-500/10',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
