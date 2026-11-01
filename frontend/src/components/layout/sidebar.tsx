'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Kanban,
  FileText,
  Mail,
  Bot,
  BarChart3,
  Settings,
  User,
  Home,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Showcase Home', href: '/', icon: Home },
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Job Discovery', href: '/jobs', icon: Compass },
  { name: 'Pipeline', href: '/applications', icon: Kanban },
  { name: 'CV Manager', href: '/cv-manager', icon: FileText },
  { name: 'Cover Letters', href: '/cover-letters', icon: Mail },
  { name: 'Recruiter Inbox', href: '/recruiter-inbox', icon: Mail },
  { name: 'Automation', href: '/automation', icon: Bot },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Candidate Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r-[2.5px] border-[#111111] bg-[#FAFAF5] flex flex-col shrink-0 min-h-screen z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b-2 border-dashed border-[#111111]/30">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-[#FFEB00] border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center font-marker text-xs">
            ⚡
          </div>
          <div>
            <span className="font-marker text-base text-[#111111] tracking-tight block">
              Jobless Hunter
            </span>
            <span className="font-mono text-[9px] text-[#6B6B66] font-bold tracking-wide uppercase">
              24/7 Agent Pad
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[150px_10px_120px_8px/10px_120px_8px_150px] text-sm font-hand transition-all group',
                isActive
                  ? 'bg-[#FFEB00] text-[#111111] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] font-bold -rotate-1'
                  : 'text-[#6B6B66] hover:text-[#111111] hover:bg-white hover:border hover:border-[#111111] hover:rotate-1'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border border-[#111111] shadow-[1px_1px_0_#111111]',
                  isActive ? 'bg-white' : 'bg-[#FAFAF5]'
                )}
              >
                <Icon className="h-3.5 w-3.5 text-[#111111]" />
              </div>
              <span className="text-base tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Candidate Footer Badge */}
      <div className="p-4 border-t-2 border-dashed border-[#111111]/30">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2.5 rounded-[120px_10px_100px_8px/10px_100px_8px_120px] bg-[#FFFFFF] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] hover:-translate-y-0.5 transition-transform"
        >
          <div className="h-8 w-8 rounded-full bg-[#FFEB00] text-[#111111] border border-[#111111] flex items-center justify-center font-marker text-xs">
            SE
          </div>
          <div className="overflow-hidden">
            <p className="font-hand text-sm font-bold text-[#111111] truncate">
              Solayman El Mouden
            </p>
            <p className="font-mono text-[10px] text-[#6B6B66] truncate">
              1337 • RiLyMed DevOps
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
