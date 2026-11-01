import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = status.toLowerCase();

  if (norm === 'qualified' || norm === 'offer' || norm === 'active') {
    return (
      <Badge variant="success" className={cn('capitalize', className)}>
        {status.replace('_', ' ')}
      </Badge>
    );
  }
  if (norm === 'interview' || norm === 'applied' || norm === 'documents_ready') {
    return (
      <Badge variant="info" className={cn('capitalize', className)}>
        {status.replace('_', ' ')}
      </Badge>
    );
  }
  if (norm === 'awaiting_approval' || norm === 'evaluating') {
    return (
      <Badge variant="warning" className={cn('capitalize', className)}>
        {status.replace('_', ' ')}
      </Badge>
    );
  }
  if (norm === 'rejected' || norm === 'disqualified' || norm === 'expired') {
    return (
      <Badge variant="destructive" className={cn('capitalize', className)}>
        {status.replace('_', ' ')}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={cn('capitalize', className)}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

export function MatchScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-slate-500">Unscored</span>;
  }

  let colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  if (score >= 85) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (score >= 70) {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (score >= 55) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span>{score}%</span>
      <span className="text-[10px] opacity-75">fit</span>
    </div>
  );
}

