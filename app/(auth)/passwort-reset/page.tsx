'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Sehr schwach', color: '#FF1C47' }
  if (score === 2) return { score, label: 'Schwach', color: '#FF9500' }
  if (score === 3) return { score, label: 'Mittel', color: '#FFD60A' }
  if (score === 4) return { score, label: 'Stark', color: '#34C759' }
  return { score, label: 'Sehr stark', color: '#34C759' }
}

export default function PasswordResetPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  const strength = getPasswordStrength(password)

  useEffect(() => {
    const supabase = createClient()

    // If the URL has a recovery token in the hash, Supabase exchanges it automatically.
    // We just need to wait briefly for the exchange to complete, then show the form.
    const hash = window.location.hash
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      // Give Supabase ~1s to process the hash token, then show the form regardless
      setTimeout(() => setReady(true), 800)
      return
    }

    // No hash — check if there's already an active session (e.g. page refreshed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        // Fallback: listen for state change
        supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            setReady(true)
          }
        })
        // Final fallback after 3s — show form anyway, updateUser will validate
        setTimeout(() => setReady(true), 3000)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }
    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Fehler: ' + updateError.message)
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,28,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} style={{ color: '#FF1C47' }} />
            </div>
            <div>
              <h2 style={{ color: '#111111', fontSize: 19, fontWeight: 900, marginBottom: 2 }}>Neues Passwort</h2>
              <p style={{ color: '#666', fontSize: 12 }}>Wähle ein sicheres Passwort.</p>
            </div>
          </div>

          {!ready ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#666', fontSize: 14 }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#FF1C47' }} />
              Link wird überprüft…
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Neues Passwort
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Mindestens 8 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', height: 52,
                      background: '#F2F2F0', border: '1px solid #E0E0DE',
                      borderRadius: 14, padding: '0 48px 0 16px',
                      color: '#111111', fontSize: 15, outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#FF1C47' }}
                    onBlur={(e) => { e.target.style.borderColor = '#E0E0DE' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= strength.score ? strength.color : '#E0E0DE', transition: 'background 0.2s' }} />
                      ))}
                    </div>
                    <p style={{ color: '#888', fontSize: 11 }}>{strength.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Passwort bestätigen
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Passwort wiederholen"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
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
                  marginTop: 4, height: 54, width: '100%', borderRadius: 16,
                  background: loading ? '#F2F2F0' : 'linear-gradient(135deg, #FF1C47, #C8003A)',
                  border: 'none', color: loading ? '#999' : '#FFFFFF',
                  fontWeight: 900, fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: loading ? 'none' : '0 8px 32px rgba(255,28,71,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Speichern…</> : 'Passwort speichern'}
              </button>
            </form>
          )}
        </div>

        <p style={{ color: '#CCCCCC', fontSize: 11, textAlign: 'center', marginTop: 24, letterSpacing: '0.05em' }}>
          MORE ALYVE · POWERED BY CHRISTIAN WOLF
        </p>
      </div>
    </div>
  )
}
