import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        // Tinted variants read from the --tint-* tokens in admin.css so they
        // invert with the theme; the rest already run on theme tokens.
        default:
          'border-[hsl(var(--tint-ok-line))] bg-[hsl(var(--tint-ok-bg))] text-[hsl(var(--tint-ok-fg))]',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        accent:
          'border-[hsl(var(--tint-warn-line))] bg-[hsl(var(--tint-warn-bg))] text-[hsl(var(--tint-warn-fg))]',
        destructive:
          'border-[hsl(var(--tint-bad-line))] bg-[hsl(var(--tint-bad-bg))] text-[hsl(var(--tint-bad-fg))]',
        outline: 'border-border text-foreground',
        muted: 'border-border bg-muted text-muted-foreground',
        solid: 'border-transparent bg-primary text-primary-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
