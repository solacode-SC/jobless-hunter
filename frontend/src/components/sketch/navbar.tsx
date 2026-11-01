'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bot, Compass, Kanban, FileText, LayoutDashboard, Sparkles } from 'lucide-react';
import { SketchButton } from './button';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Pipeline', href: '/applications' },
  { name: 'CV & Cover', href: '/cv-manager' },
  { name: 'Profile', href: '/profile' },
  { name: 'Workflows', href: '/automation' },
];

export function SketchNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-3 inset-x-0 z-50 px-4 md:px-8 max-w-6xl mx-auto transition-all duration-200">
      <div
        className={`bg-[#FAFAF5] border-2 md:border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-4 md:px-6 flex items-center justify-between transition-all duration-200 ${
          isScrolled ? 'py-2 md:py-2.5 scale-[0.98]' : 'py-3 md:py-3.5'
        }`}
      >
        {/* Brand Logo with small yellow circle icon */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-8 h-8 rounded-full bg-[#FFEB00] border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center font-marker text-xs group-hover:rotate-12 transition-transform">
            ⚡
          </div>
          <div>
            <span className="font-marker text-base md:text-lg text-[#111111] tracking-tight block leading-tight">
              Jobless Hunter
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#6B6B66] block">
              24/7 Agent
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-hand text-base px-3 py-1 rounded-[120px_8px_100px_6px/8px_100px_6px_120px] transition-all duration-150 ${
                  isActive
                    ? 'bg-[#FFEB00] border border-[#111111] shadow-[2px_2px_0_#111111] font-bold -rotate-1 text-[#111111]'
                    : 'text-[#111111] hover:bg-black/5 hover:rotate-1'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <SketchButton
            href="/dashboard"
            size="sm"
            variant="primary"
            icon={<Bot className="w-3.5 h-3.5" />}
          >
            Live Agent
          </SketchButton>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <SketchButton
            href="/dashboard"
            size="sm"
            variant="primary"
            className="text-[10px] px-2.5 py-1"
          >
            App
          </SketchButton>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-[#111111] bg-[#FFFFFF] shadow-[2px_2px_0_#111111] active:translate-y-0.5"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5 text-[#111111]" /> : <Menu className="w-5 h-5 text-[#111111]" />}
          </button>
        </div>
      </div>

      {/* Doodle-style Mobile Slide-Down Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-[#FAFAF5] border-2 border-[#111111] shadow-[5px_5px_0_#111111] rounded-[15px_225px_15px_255px/255px_15px_225px_15px] p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-hand text-lg py-1.5 px-3 rounded-lg border border-transparent hover:border-[#111111] hover:bg-[#FFEB00] transition-colors"
              >
                ✏️ {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-dashed border-[#111111]/40 flex flex-col gap-2">
            <SketchButton
              href="/dashboard"
              variant="primary"
              size="md"
              className="w-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Open Dashboard 🚀
            </SketchButton>
          </div>
        </div>
      )}
    </header>
  );
}

