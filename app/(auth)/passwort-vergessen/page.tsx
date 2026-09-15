'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/passwort-reset`,
    })

    if (error) {
      setError('Fehler: ' + error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <Image src="/logo-final.png" alt="More Alyve" width={260} height={130} className="object-contain" priority />
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 28, border: '1px solid #EBEBEA' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,28,71,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Mail size={24} style={{ color: '#FF1C47' }} />
              </div>
              <h2 style={{ color: '#111111', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
                E-Mail gesendet!
              </h2>
              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Wir haben dir einen Reset-Link an <strong>{email}</strong> geschickt. Schau auch im Spam-Ordner.
              </p>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: '#FF1C47', fontSize: 14, fontWeight: 700, textDecoration: 'none',
                }}
              >
                <ArrowLeft size={16} /> Zurück zum Login
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ color: '#111111', fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
                Passwort vergessen?
              </h2>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
                Gib deine E-Mail-Adresse ein — wir schicken dir einen Reset-Link.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
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
                      width: '100%', height: 52,
                      background: '#F2F2F0', border: '1px solid #E0E0DE',
                      borderRadius: 14, padding: '0 16px',
                      color: '#111111', fontSize: 15, outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#FF1C47' }}
                    onBlur={(e) => { e.target.style.borderColor = '#E0E0DE' }}
                  />
                </div>

                {error && (
                  <div style={{ background: 'rgba(255,28,71,0.1)', border: '1px solid rgba(255,28,71,0.3)', borderRadius: 12, padding: '10px 14px', color: '#FF1C47', fontSize: 13, fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 6, height: 54, width: '100%', borderRadius: 16,
                    background: loading ? '#F2F2F0' : 'linear-gradient(135deg, #FF1C47, #C8003A)',
                    border: 'none', color: loading ? '#999' : '#FFFFFF',
                    fontWeight: 900, fontSize: 16,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: loading ? 'none' : '0 8px 32px rgba(255,28,71,0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Senden…</> : 'Reset-Link senden'}
                </button>

                <Link
                  href="/login"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    color: '#666', fontSize: 13, textDecoration: 'none', marginTop: 4,
                  }}
                >
                  <ArrowLeft size={14} /> Zurück zum Login
                </Link>
              </form>
            </>
          )}
        </div>

        <p style={{ color: '#CCCCCC', fontSize: 11, textAlign: 'center', marginTop: 24, letterSpacing: '0.05em' }}>
          MORE ALYVE · POWERED BY CHRISTIAN WOLF
        </p>
      </div>
    </div>
  )
}
