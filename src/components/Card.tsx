'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const Card = ({ children, className, delay = 0 }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "glass rounded-xl p-6 cozy-border",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
