'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        width: '100%',
        height: 48,
        borderRadius: 14,
        background: '#FFFFFF',
        border: '1px solid #E0E0DE',
        color: '#666',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <LogOut size={18} />
      Abmelden
    </button>
  )
}
