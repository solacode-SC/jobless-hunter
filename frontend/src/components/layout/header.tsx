'use client';

import React from 'react';
import { RefreshCw, ExternalLink, Bot } from 'lucide-react';
import { SketchButton } from '@/components/sketch/button';

interface HeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ title, description, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="h-18 border-b-[2.5px] border-[#111111] bg-[#FAFAF5] px-6 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_0_#111111]">
      <div>
        <h1 className="font-marker text-xl md:text-2xl text-[#111111] leading-tight">
          {title}
        </h1>
        {description && (
          <p className="font-hand text-sm md:text-base text-[#6B6B66] -mt-0.5">
            ✏️ {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <SketchButton
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            icon={
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#111111] ${isRefreshing ? 'animate-spin' : ''}`}
              />
            }
          >
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </SketchButton>
        )}

        {/* 24/7 Agent Live Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] text-xs font-mono font-bold text-[#111111] -rotate-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>24/7 Agent Live</span>
        </div>

        {/* n8n Workflows button */}
        <a
          href="https://automation.solaymanbuilds.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-[120px_8px_100px_6px/8px_100px_6px_120px] bg-[#FFEB00] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0_#111111] hover:-translate-y-0.5 transition-transform"
        >
          <span>n8n Hub</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </header>
  );
}
