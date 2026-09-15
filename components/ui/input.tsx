import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border-2 border-border bg-white px-4 py-2 text-base',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
