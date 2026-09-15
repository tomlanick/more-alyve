'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'Sehr schwach', color: 'bg-danger' }
  if (score === 2) return { score, label: 'Schwach', color: 'bg-warning' }
  if (score === 3) return { score, label: 'Mittel', color: 'bg-yellow-400' }
  if (score === 4) return { score, label: 'Stark', color: 'bg-success' }
  return { score, label: 'Sehr stark', color: 'bg-success' }
}

export default function PasswordChangePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strength = getPasswordStrength(password)

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
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.push('/login'); return }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('Fehler beim Ändern des Passworts: ' + updateError.message)
      setLoading(false)
      return
    }

    // Mark must_change_password as false
    await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', user.id)

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #FF1C47 0%, #D4003C 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="More" width={100} height={50} className="brightness-0 invert" />
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Passwort festlegen</h2>
              <p className="text-xs text-muted">Bitte wähle ein neues, sicheres Passwort.</p>
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Neues Passwort</label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Mindestens 8 Zeichen"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength.score ? strength.color : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Passwort bestätigen</label>
              <Input
                type={showPw ? 'text' : 'password'}
                placeholder="Passwort wiederholen"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-danger-light text-danger text-sm rounded-xl p-3">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Speichern…</>
              ) : (
                'Passwort speichern & loslegen'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
