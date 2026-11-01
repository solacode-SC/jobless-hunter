import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[255px_15px_225px_15px/15px_225px_15px_255px] font-bold font-body uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEB00] disabled:pointer-events-none disabled:opacity-50 cursor-pointer border-2 border-[#111111] select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[#FFEB00] text-[#111111] shadow-[3px_3px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
        secondary:
          'bg-[#FFFFFF] text-[#111111] shadow-[3px_3px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
        destructive:
          'bg-[#FECDD3] text-[#111111] shadow-[3px_3px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
        outline:
          'bg-transparent text-[#111111] border-dashed hover:bg-[#FFEB00]/30 active:translate-y-0.5',
        ghost:
          'border-transparent shadow-none hover:bg-black/5 hover:border-[#111111] text-[#111111]',
        link:
          'border-none shadow-none text-[#111111] underline-offset-4 hover:underline p-0 h-auto',
        glow:
          'bg-[#FFEB00] text-[#111111] shadow-[4px_4px_0_#111111] hover:-translate-y-1 hover:shadow-[6px_6px_0_#111111]',
      },
      size: {
        default: 'h-10 px-5 py-2 text-xs md:text-sm',
        sm: 'h-8 rounded-[120px_6px_100px_6px/6px_100px_6px_120px] px-3 text-xs',
        lg: 'h-12 px-7 text-sm md:text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
