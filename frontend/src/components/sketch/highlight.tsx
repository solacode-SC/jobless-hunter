'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HighlightProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function Highlight({ children, className = '', color = '#FFEB00' }: HighlightProps) {
  return (
    <span className={`relative inline-block px-1 z-10 ${className}`}>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
        style={{
          backgroundColor: color,
          transformOrigin: 'left center',
        }}
        className="absolute inset-x-0 bottom-1 top-2 -z-10 -rotate-1 rounded-sm shadow-[1px_1px_0_#111111]"
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

