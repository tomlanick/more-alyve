'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, BookOpen, User, Sun } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Home,        label: 'Home'    },
  { href: '/habits',    icon: CheckSquare, label: 'Habits'  },
  { href: '/routine',   icon: Sun,         label: 'Routine' },
  { href: '/kurse',     icon: BookOpen,    label: 'Kurse'   },
  { href: '/profil',    icon: User,        label: 'Profil'  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        borderRadius: 50,
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
        padding: '8px 10px',
        width: 'calc(100% - 40px)',
        maxWidth: 440,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '7px 16px',
                borderRadius: 40,
                background: isActive ? 'rgba(255,28,71,0.12)' : 'transparent',
                transition: 'background 0.2s',
                textDecoration: 'none',
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.7}
                style={{
                  color: isActive ? '#FF1C47' : 'rgba(0,0,0,0.45)',
                  transition: 'color 0.2s',
                  filter: isActive ? 'drop-shadow(0 0 5px rgba(255,28,71,0.4))' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#FF1C47' : 'rgba(0,0,0,0.4)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
