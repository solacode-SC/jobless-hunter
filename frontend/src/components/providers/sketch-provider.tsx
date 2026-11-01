'use client';

import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';

interface SketchProviderProps {
  children: React.ReactNode;
}

export function SketchProvider({ children }: SketchProviderProps) {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isPointerFine, setIsPointerFine] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Smooth anchor link click handling with navbar offset (80px)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement as HTMLElement, { offset: -90 });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Desktop subtle pencil dot cursor
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    setIsPointerFine(hasFinePointer);

    const handleMouseMove = (e: MouseEvent) => {
      if (hasFinePointer) {
        setCursorPos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {children}
      {/* Optional pencil dot custom cursor for desktop */}
      {isPointerFine && cursorPos && (
        <div
          aria-hidden="true"
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#111111] bg-[#FFEB00] transition-transform duration-75 ease-out shadow-[1px_1px_0_#111111]"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            width: '10px',
            height: '10px',
          }}
        />
      )}
    </>
  );
}

