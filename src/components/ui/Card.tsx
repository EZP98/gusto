import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outlined';
  hover?: boolean;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-300';

    const variantStyles = {
      default: 'bg-white dark:bg-gray-900 shadow-sm',
      glass: 'glass-card border border-gray-200/50 dark:border-gray-700/50',
      outlined: 'border border-gray-200 dark:border-gray-700 bg-transparent',
    };

    const hoverStyles = hover
      ? 'hover:shadow-lg hover:shadow-chef-500/10 hover:-translate-y-1 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
