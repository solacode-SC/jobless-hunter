'use client';

import React from 'react';
import Link from 'next/link';

interface SketchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: React.ReactNode;
}

export function SketchButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon,
  className = '',
  disabled,
  onClick,
  ...props
}: SketchButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-bold font-body tracking-wider uppercase border-2 border-[#111111] transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-[#FFEB00] text-[#111111] shadow-[3px_3px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    secondary:
      'bg-[#FFFFFF] text-[#111111] shadow-[3px_3px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    outline:
      'bg-transparent text-[#111111] border-dashed border-[#111111] hover:bg-[#FFEB00]/30 active:translate-y-0.5',
    pill:
      'bg-[#FFFFFF] text-[#111111] rounded-full text-xs shadow-[2px_2px_0_#111111] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#111111]',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-[120px_6px_100px_6px/6px_100px_6px_120px]',
    md: 'text-xs md:text-sm px-5 py-2.5 gap-2 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]',
    lg: 'text-sm md:text-base px-7 py-3.5 gap-2.5 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

