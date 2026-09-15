import { BottomNav } from '@/components/layout/BottomNav'
import { Toaster } from '@/components/ui/toaster'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#F7F7F5' }}>
      <main style={{ paddingBottom: 80 }}>
        {children}
      </main>
      <BottomNav />
      <Toaster />
    </div>
  )
}
