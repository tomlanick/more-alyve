import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white',
        secondary: 'bg-surface-2 text-foreground',
        success: 'bg-success-light text-success',
        danger: 'bg-danger-light text-danger',
        warning: 'bg-warning-light text-warning',
        outline: 'border border-border text-muted',
        premium: 'bg-gradient-to-r from-primary to-primary-dark text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
