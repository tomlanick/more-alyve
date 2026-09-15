'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-Mail oder Passwort falsch.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#F7F7F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(255,28,71,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 360, position: 'relative' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <Image
              src="/logo-final.png"
              alt="More Alyve"
              width={260}
              height={130}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Form card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 28,
            border: '1px solid #EBEBEA',
          }}
        >
          <h2 style={{ color: '#111111', fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
            Willkommen zurück
          </h2>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
            Melde dich an und starte deinen Tag.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label
                style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}
              >
                E-Mail
              </label>
              <input
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  height: 52,
                  background: '#F2F2F0',
                  border: '1px solid #E0E0DE',
                  borderRadius: 14,
                  padding: '0 16px',
                  color: '#111111',
                  fontSize: 15,
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#FF1C47' }}
                onBlur={(e) => { e.target.style.borderColor = '#E0E0DE' }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}
              >
                Passwort
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Passwort eingeben"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: 52,
                    background: '#F2F2F0',
                    border: '1px solid #E0E0DE',
                    borderRadius: 14,
                    padding: '0 48px 0 16px',
                    color: '#111111',
                    fontSize: 15,
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#FF1C47' }}
                  onBlur={(e) => { e.target.style.borderColor = '#E0E0DE' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <a
                href="/passwort-vergessen"
                style={{ color: '#FF1C47', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
              >
                Passwort vergessen?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: 'rgba(255,28,71,0.1)',
                  border: '1px solid rgba(255,28,71,0.3)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#FF1C47',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                height: 54,
                width: '100%',
                borderRadius: 16,
                background: loading ? '#F2F2F0' : 'linear-gradient(135deg, #FF1C47, #C8003A)',
                border: 'none',
                color: loading ? '#999' : '#FFFFFF',
                fontWeight: 900,
                fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: loading ? 'none' : '0 8px 32px rgba(255,28,71,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Einloggen…</>
              ) : (
                'Einloggen'
              )}
            </button>
          </form>
        </div>

        <p style={{ color: '#CCCCCC', fontSize: 11, textAlign: 'center', marginTop: 24, letterSpacing: '0.05em' }}>
          MORE ALYVE · POWERED BY CHRISTIAN WOLF
        </p>
      </div>
    </div>
  )
}
