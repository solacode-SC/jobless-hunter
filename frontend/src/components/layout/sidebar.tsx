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
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
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
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-100 text-base tracking-tight block">Jobless Hunter</span>
          <span className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase">24/7 Autonomous</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-indigo-400' : 'text-slate-500')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Candidate Footer Badge */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            SE
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">Solayman El Mouden</p>
            <p className="text-[10px] text-slate-400 truncate">Software Engineer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

