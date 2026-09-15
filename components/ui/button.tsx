'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white hover:bg-primary-dark shadow-sm',
        secondary:
          'bg-surface-2 text-foreground hover:bg-border',
        outline:
          'border-2 border-primary text-primary hover:bg-primary hover:text-white',
        ghost:
          'text-foreground hover:bg-surface-2',
        danger:
          'bg-danger text-white hover:bg-red-600',
        success:
          'bg-success text-white hover:bg-green-600',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        default: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
