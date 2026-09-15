'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-20 left-0 right-0 z-[100] flex flex-col gap-2 px-4',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: 'default' | 'success' | 'danger'
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      'flex items-center gap-3 rounded-2xl p-4 shadow-lg border',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[swipe=end]:animate-out data-[state=closed]:fade-out-80',
      'data-[state=open]:slide-in-from-bottom-4',
      variant === 'success' && 'bg-success-light border-success text-success',
      variant === 'danger' && 'bg-danger-light border-danger text-danger',
      variant === 'default' && 'bg-white border-border text-foreground',
      className
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('font-semibold text-sm', className)} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-xs opacity-80', className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close ref={ref} className={cn('ml-auto opacity-70 hover:opacity-100', className)} {...props}>
    <X size={16} />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  type ToastProps,
}
