import React from 'react';
import { cn } from '@/lib/utils';

interface ProductGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ProductGrid({ children, className, ...props }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
