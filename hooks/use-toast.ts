'use client'

import * as React from 'react'
import type { ToastProps } from '@/components/ui/toast'

type ToastActionElement = React.ReactElement

export type Toast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const listeners: Array<(toasts: Toast[]) => void> = []
let memoryState: Toast[] = []

function dispatch(toast: Toast) {
  memoryState = [toast, ...memoryState].slice(0, 3)
  listeners.forEach(listener => listener(memoryState))
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast: Toast = { ...props, id, open: true }
  dispatch(newToast)

  setTimeout(() => {
    memoryState = memoryState.filter(t => t.id !== id)
    listeners.forEach(l => l(memoryState))
  }, 3000)

  return id
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const idx = listeners.indexOf(setToasts)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  return { toasts }
}
