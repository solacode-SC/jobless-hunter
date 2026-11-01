import React from 'react';

export function StarDoodle({ className = 'w-8 h-8 text-[#FFEB00]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      stroke="#111111"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M50 8 L62 38 L95 40 L69 62 L78 94 L50 74 L22 94 L31 62 L5 40 L38 38 Z" />
    </svg>
  );
}

export function ArrowDoodle({ className = 'w-16 h-12 text-[#111111]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 25 C 45 10, 85 20, 105 55" />
      <path d="M85 55 L 105 55 L 105 35" />
    </svg>
  );
}

export function SquiggleUnderline({ className = 'w-full h-4 text-[#FFEB00]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M 5 12 Q 35 2, 65 12 T 125 12 T 185 12" />
    </svg>
  );
}

export function WavyDivider({ className = 'w-full h-8 text-[#111111]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0,20 Q150,0 300,20 T600,20 T900,20 T1200,20" />
    </svg>
  );
}

export function SparkleDoodle({ className = 'w-6 h-6 text-[#111111]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 50 50"
      fill="currentColor"
      stroke="#111111"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M25 0 Q25 25 50 25 Q25 25 25 50 Q25 25 0 25 Q25 25 25 0 Z" />
    </svg>
  );
}

export function CircleScribble({ className = 'w-10 h-10 text-[#FFEB00]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="50" cy="50" rx="42" ry="38" transform="rotate(-5 50 50)" />
      <path d="M 15 50 A 35 35 0 0 1 85 52" stroke="#111111" strokeWidth="2" />
    </svg>
  );
}

