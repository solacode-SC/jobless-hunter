'use client';

import React from 'react';
import { Bell, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ title, description, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 gap-2 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </Button>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Agent Live (24/7)</span>
        </div>

        <a
          href="https://automation.solaymanbuilds.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-900 transition-colors"
        >
          <span>n8n Workflows</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </header>
  );
}

