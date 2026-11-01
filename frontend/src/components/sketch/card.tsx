'use client';

import React from 'react';

interface SketchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  rotation?: number | 'left' | 'right' | 'none';
  variant?: 'paper' | 'white' | 'yellow';
  borderSize?: 'normal' | 'thick' | 'dashed';
  interactive?: boolean;
}

export function SketchCard({
  children,
  rotation = 'none',
  variant = 'white',
  borderSize = 'normal',
  interactive = true,
  className = '',
  style,
  ...props
}: SketchCardProps) {
  let rotDeg = 0;
  if (rotation === 'left') rotDeg = -1.8;
  else if (rotation === 'right') rotDeg = 1.8;
  else if (typeof rotation === 'number') rotDeg = rotation;

  const bgClasses = {
    white: 'bg-[#FFFFFF]',
    paper: 'bg-[#FAFAF5]',
    yellow: 'bg-[#FFEB00]/20',
  };

  const borderClasses = {
    normal: 'border-[2.5px] border-[#111111] rounded-[255px_15px_225px_15px/15px_225px_15px_255px]',
    thick: 'border-[3px] border-[#111111] rounded-[220px_12px_200px_12px/12px_200px_12px_220px]',
    dashed: 'border-[2px] border-dashed border-[#111111] rounded-[15px_225px_15px_255px/255px_15px_225px_15px]',
  };

  const hoverClasses = interactive
    ? 'transition-all duration-200 ease-out hover:rotate-0 hover:-translate-y-1 hover:shadow-[7px_7px_0_#111111]'
    : '';

  return (
    <div
      className={`relative p-6 text-[#111111] shadow-[4px_4px_0_#111111] ${bgClasses[variant]} ${borderClasses[borderSize]} ${hoverClasses} ${className}`}
      style={{
        transform: rotDeg !== 0 ? `rotate(${rotDeg}deg)` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

