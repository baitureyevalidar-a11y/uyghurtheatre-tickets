import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-semibold font-body transition-colors select-none',
  {
    variants: {
      variant: {
        default:  'bg-burgundy text-cream',
        outline:  'border border-burgundy text-burgundy bg-transparent',
        gold:     'bg-gold text-darkBrown',
        cream:    'bg-cream text-brown border border-brown/20',
        success:  'bg-green-100 text-green-800 border border-green-200',
        warning:  'bg-amber-100 text-amber-800 border border-amber-200',
        danger:   'bg-red-100 text-red-700 border border-red-200',
        muted:    'bg-brown/10 text-brown/70',
      },
      size: {
        sm: 'text-[10px] px-2 py-px',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
