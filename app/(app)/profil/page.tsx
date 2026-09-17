import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/layout/AppHeader'
import Link from 'next/link'
import { SignOutButton } from './SignOutButton'
import { Settings, BarChart3, ChevronRight, Shield, Crown, Calendar, Flag } from 'lucide-react'
import { calculateStreak } from '@/lib/scoring'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role, premium, avatar_id')
    .eq('id', user.id)
    .single()

  const { data: avatar } = profile?.avatar_id
    ? await supabase.from('avatar_profiles').select('name, icon_emoji').eq('id', profile.avatar_id).single()
    : { data: null }

  // Alle Scores (alltime für Gesamtstatistik)
  const { data: allScoreData } = await supabase
    .from('daily_scores')
    .select('score_date, points')
    .eq('user_id', user.id)
    .order('score_date', { ascending: true })

  const totalScore = allScoreData?.reduce((a, b) => a + b.points, 0) ?? 0
  const daysTracked = allScoreData?.length ?? 0
  const streak = calculateStreak(allScoreData?.map((s) => s.score_date) ?? [])

  // Phasen laden
  const { data: phases } = await supabase
    .from('user_phases')
    .select('id, name, started_at, ended_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  // Phasen-Stats: Punkte + Tage pro Phase aus allScoreData berechnen
  const phaseStats = (phases ?? []).map((phase) => {
    const endDate = phase.ended_at ?? new Date().toISOString().split('T')[0]
    const phaseScores = (allScoreData ?? []).filter(
      (s) => s.score_date >= phase.started_at && s.score_date <= endDate
    )
    const points = phaseScores.reduce((sum, s) => sum + s.points, 0)
    const days = phaseScores.length
    const isActive = !phase.ended_at
    return { ...phase, points, days, isActive }
  })

  const menuItems = [
    { href: '/einstellungen', icon: Settings, label: 'Einstellungen' },
    { href: '/auswertung/woche', icon: BarChart3, label: 'Wochenauswertung' },
    { href: '/auswertung/monat', icon: Calendar, label: 'Monatsauswertung' },
  ]

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="Profil" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Profile card */}
        <div
          style={{
            borderRadius: 20,
            padding: 20,
            background: 'linear-gradient(135deg, #FF1C4722, #C8003A11)',
            border: '1px solid rgba(255,28,71,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: 'rgba(255,28,71,0.15)',
              border: '1px solid rgba(255,28,71,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            {avatar?.icon_emoji ?? '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 18 }}>
                {profile?.display_name ?? 'Nutzer'}
              </h2>
              {profile?.premium && (
                <span style={{ background: 'rgba(255,200,0,0.15)', border: '1px solid rgba(255,200,0,0.3)', color: '#FFD60A', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Crown size={10} />
                  Premium
                </span>
              )}
            </div>
            <p style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{user.email}</p>
            {avatar && (
              <p style={{ color: '#FF1C47', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                {avatar.name}
              </p>
            )}
          </div>
        </div>

        {/* Gesamt-Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <StatCard label="GESAMT" value={totalScore.toString()} color="#FF1C47" />
          <StatCard label="TAGE" value={daysTracked.toString()} color="#2979FF" />
          <StatCard
            label="STREAK"
            value={streak > 0 ? `${streak}` : '0'}
            color="#FF6B00"
            icon={streak > 0 ? '🔥' : undefined}
          />
        </div>

        {/* Phasen-Timeline */}
        {phaseStats.length > 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #EBEBEA', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #F0F0EE', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flag size={15} style={{ color: '#FF6B00' }} />
              <span style={{ color: '#111111', fontWeight: 800, fontSize: 14 }}>Phasen-Verlauf</span>
            </div>
            <div style={{ padding: '0 0 4px' }}>
              {phaseStats.map((phase, idx) => (
                <div
                  key={phase.id}
                  style={{
                    padding: '14px 18px',
                    borderBottom: idx < phaseStats.length - 1 ? '1px solid #F4F4F2' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* Phase-Dot */}
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: phase.isActive ? '#FF1C47' : '#CCCCCC',
                    flexShrink: 0,
                    boxShadow: phase.isActive ? '0 0 0 3px rgba(255,28,71,0.15)' : 'none',
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ color: '#111111', fontWeight: 700, fontSize: 13 }}>{phase.name}</span>
                      {phase.isActive && (
                        <span style={{ background: 'rgba(255,28,71,0.1)', color: '#FF1C47', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '1px 6px' }}>
                          Aktiv
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#999', fontSize: 11 }}>
                      {formatDate(phase.started_at)} – {phase.ended_at ? formatDate(phase.ended_at) : 'heute'}
                    </p>
                  </div>

                  {/* Phase-Stats */}
                  <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#FF1C47', fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{phase.points}</p>
                      <p style={{ color: '#BBBBBB', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pkt</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#2979FF', fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{phase.days}</p>
                      <p style={{ color: '#BBBBBB', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tage</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #EBEBEA', overflow: 'hidden' }}>
          {menuItems.map(({ href, icon: Icon, label }, idx) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderBottom: idx < menuItems.length - 1 ? '1px solid #F0F0EE' : 'none',
                textDecoration: 'none',
              }}
            >
              <Icon size={18} style={{ color: '#666' }} />
              <span style={{ color: '#111111', fontWeight: 600, fontSize: 14, flex: 1 }}>{label}</span>
              <ChevronRight size={16} style={{ color: '#CCCCCC' }} />
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link
              href="/admin/nutzer"
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderTop: '1px solid #F0F0EE', textDecoration: 'none' }}
            >
              <Shield size={18} style={{ color: '#FF1C47' }} />
              <span style={{ color: '#FF1C47', fontWeight: 700, fontSize: 14, flex: 1 }}>Admin-Bereich</span>
              <ChevronRight size={16} style={{ color: '#FF1C4766' }} />
            </Link>
          )}
        </div>

        <SignOutButton />
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon?: string }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #EBEBEA',
        padding: '16px 12px',
        textAlign: 'center',
      }}
    >
      <p style={{ color, fontWeight: 900, fontSize: 24, lineHeight: 1 }}>
        {icon ? `${icon}${value}` : value}
      </p>
      <p style={{ color: '#999', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
        {label}
      </p>
    </div>
  )
}
