'use client';

import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'white' | 'paper';
  className?: string;
}

export function Tag({ children, variant = 'white', className = '' }: TagProps) {
  const bgClasses = {
    yellow: 'bg-[#FFEB00] text-[#111111]',
    white: 'bg-[#FFFFFF] text-[#111111]',
    paper: 'bg-[#FAFAF5] text-[#111111]',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-bold text-[11px] uppercase tracking-wider px-2.5 py-0.5 border border-[#111111] rounded-full shadow-[1.5px_1.5px_0_#111111] select-none ${bgClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface DoodleIconProps {
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'yellow' | 'white' | 'paper';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DoodleIcon({
  icon: Icon,
  variant = 'yellow',
  size = 'md',
  className = '',
}: DoodleIconProps) {
  const bgClasses = {
    yellow: 'bg-[#FFEB00] text-[#111111]',
    white: 'bg-[#FFFFFF] text-[#111111]',
    paper: 'bg-[#FAFAF5] text-[#111111]',
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-lg',
    lg: 'w-14 h-14 text-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] shrink-0 transition-transform duration-200 hover:rotate-6 ${bgClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}

