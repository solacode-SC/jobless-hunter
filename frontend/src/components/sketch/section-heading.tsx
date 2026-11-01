'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  isH1?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
  isH1 = false,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`max-w-3xl mb-12 ${alignClass} ${className}`}
    >
      {eyebrow && (
        <span className="inline-block font-hand text-lg md:text-xl text-[#111111] bg-[#FFEB00]/40 px-3 py-0.5 rounded-[120px_10px_100px_8px/10px_100px_8px_120px] border border-[#111111] shadow-[2px_2px_0_#111111] -rotate-1 mb-3">
          ✏️ {eyebrow}
        </span>
      )}

      {isH1 ? (
        <h1 className="font-marker text-4xl sm:text-5xl md:text-6xl text-[#111111] leading-[1.08] tracking-tight mb-4">
          {title}
        </h1>
      ) : (
        <h2 className="font-marker text-3xl sm:text-4xl md:text-5xl text-[#111111] leading-[1.1] tracking-tight mb-4">
          {title}
        </h2>
      )}

      {description && (
        <p className="font-body text-base md:text-lg text-[#6B6B66] leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  );
}

