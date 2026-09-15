import Link from 'next/link'
import { Users, CheckSquare, BookOpen, BarChart3, Home } from 'lucide-react'

const adminNav = [
  { href: '/admin/nutzer', icon: Users, label: 'Nutzer' },
  { href: '/admin/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/admin/kurse', icon: BookOpen, label: 'Kurse' },
  { href: '/admin/statistiken', icon: BarChart3, label: 'Statistiken' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      {/* Admin Header */}
      <header className="bg-foreground text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-primary px-2 py-0.5 rounded-full">ADMIN</span>
          <span className="font-bold text-sm">More Alyve</span>
        </div>
        <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
          <Home size={18} />
        </Link>
      </header>

      {/* Admin Nav */}
      <nav className="bg-white border-b border-border px-4">
        <div className="flex gap-1 overflow-x-auto">
          {adminNav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-muted hover:text-foreground transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-primary"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 px-4 py-4">
        {children}
      </main>
    </div>
  )
}
