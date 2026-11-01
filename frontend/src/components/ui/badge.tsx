import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border-2 border-[#111111] px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider shadow-[2px_2px_0_#111111] transition-all select-none',
  {
    variants: {
      variant: {
        default: 'bg-[#FFEB00] text-[#111111]',
        secondary: 'bg-[#FAFAF5] text-[#111111]',
        destructive: 'bg-[#FECDD3] text-[#111111]',
        outline: 'bg-transparent text-[#111111]',
        success: 'bg-[#BBF7D0] text-[#111111]',
        warning: 'bg-[#FEF08A] text-[#111111]',
        info: 'bg-[#BAE6FD] text-[#111111]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
