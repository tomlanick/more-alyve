import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/AppHeader'
import { Lock, ChevronRight } from 'lucide-react'

const CATEGORY_ICONS: Record<string, string> = {
  'Stressbewältigung': '🧘',
  'Selbstverwirklichung': '🌟',
  'Mentale Stärke': '💪',
  'Fokusarbeit': '⚡',
  'Prokrastination': '🎯',
  'Routinen': '🔄',
  'Selbstbewusstsein': '✨',
}

export default async function CoursesPage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('premium').eq('id', user.id).single()
  const { data: courses } = await supabase.from('courses').select('id, title, description, category, is_premium').eq('is_published', true).order('sort_order')
  const categories = [...new Set(courses?.map((c) => c.category).filter(Boolean))]

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="Kurse" />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100 }}>

        {!profile?.premium && (
          <div style={{ borderRadius: 20, padding: 20, background: 'rgba(255,28,71,0.08)', border: '1px solid rgba(255,28,71,0.2)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Lock size={16} style={{ color: '#FF1C47' }} />
              <span style={{ color: '#FF1C47', fontWeight: 800, fontSize: 14 }}>Premium freischalten</span>
            </div>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
              Erhalte Zugang zu allen Kursen und dem KI-Coach.
            </p>
            <div style={{ background: 'rgba(255,28,71,0.1)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
              <span style={{ color: '#FF1C47', fontSize: 12, fontWeight: 700 }}>Bald verfügbar</span>
            </div>
          </div>
        )}

        {categories.map((category) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <p style={{ color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              {CATEGORY_ICONS[category!] ?? '📚'} {category}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {courses?.filter((c) => c.category === category).map((course) => {
                const locked = course.is_premium && !profile?.premium
                return (
                  <Link key={course.id} href={`/kurse/${course.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, opacity: locked ? 0.55 : 1 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F2F2F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {CATEGORY_ICONS[course.category ?? ''] ?? '📚'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <p style={{ color: '#111111', fontWeight: 700, fontSize: 14 }}>{course.title}</p>
                          {course.is_premium && (
                            <span style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.2)', color: '#FFD60A', borderRadius: 5, padding: '1px 5px', fontSize: 9, fontWeight: 800 }}>PRO</span>
                          )}
                        </div>
                        <p style={{ color: '#666', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.description}</p>
                      </div>
                      {locked ? <Lock size={16} style={{ color: '#CCCCCC', flexShrink: 0 }} /> : <ChevronRight size={16} style={{ color: '#CCCCCC', flexShrink: 0 }} />}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>🤖</p>
          <p style={{ color: '#111111', fontWeight: 900, fontSize: 16, marginBottom: 4 }}>KI-Coach</p>
          <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>Dein persönlicher Coach — kommt bald.</p>
          <span style={{ background: '#F2F2F0', border: '1px solid #E0E0DE', color: '#999', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>Bald verfügbar · Premium</span>
        </div>
      </div>
    </div>
  )
}
