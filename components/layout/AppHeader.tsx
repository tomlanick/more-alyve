import Image from 'next/image'
import Link from 'next/link'
import { Bell } from 'lucide-react'

interface AppHeaderProps {
  title?: string
  showLogo?: boolean
  right?: React.ReactNode
}

export function AppHeader({ title, showLogo = false, right }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #EEEEEC', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
    >
      <div
        className="flex items-center justify-between"
        style={{ height: 56, paddingTop: 'env(safe-area-inset-top)', maxWidth: 480, margin: '0 auto', padding: '0 24px' }}
      >
        {showLogo ? (
          <Link href="/dashboard">
            <Image
              src="/logo.png"
              alt="More"
              width={56}
              height={28}
              className="object-contain"
              style={{ mixBlendMode: 'multiply', opacity: 0.9 }}
            />
          </Link>
        ) : (
          <h1 style={{ color: '#111111', fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>
            {title}
          </h1>
        )}

        <div>
          {right ?? (
            <Link
              href="/einstellungen"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#F2F2F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={17} style={{ color: '#999' }} />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
