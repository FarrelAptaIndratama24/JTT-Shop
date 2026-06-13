import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CategoryPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
}

export function CategoryPill({ active, label, className, ...props }: CategoryPillProps) {
  return (
    <button
      className={cn(
        'relative px-5 py-2 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active ? 'text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        className
      )}
      {...props}
    >
      {active && (
        <motion.div
          layoutId="active-category"
          className="absolute inset-0 bg-primary rounded-full -z-10 shadow-[0_0_10px_rgba(147,51,234,0.4)]"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}
