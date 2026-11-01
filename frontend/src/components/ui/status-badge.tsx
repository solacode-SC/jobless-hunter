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
    return (
      <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-dashed border-[#111111]/40 text-[#6B6B66]">
        Unscored
      </span>
    );
  }

  let colorClasses = 'bg-[#FECDD3] text-[#111111]';
  if (score >= 85) {
    colorClasses = 'bg-[#FFEB00] text-[#111111]';
  } else if (score >= 70) {
    colorClasses = 'bg-[#BBF7D0] text-[#111111]';
  } else if (score >= 55) {
    colorClasses = 'bg-[#FEF08A] text-[#111111]';
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111] -rotate-1 ${colorClasses}`}
    >
      <span>{score}%</span>
      <span className="text-[10px] opacity-80 uppercase">fit</span>
    </div>
  );
}
