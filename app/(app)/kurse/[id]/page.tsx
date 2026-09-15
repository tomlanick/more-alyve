import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect, notFound } from 'next/navigation'
import { AppHeader } from '@/components/layout/AppHeader'
import { Lock, PlayCircle, Clock } from 'lucide-react'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const { data: course } = await supabase.from('courses').select('*').eq('id', id).eq('is_published', true).single()
  if (!course) notFound()

  const { data: chapters } = await supabase.from('course_chapters').select('*').eq('course_id', id).eq('is_published', true).order('sort_order')
  const { data: profile } = await supabase.from('profiles').select('premium').eq('id', user.id).single()
  const canAccess = !course.is_premium || profile?.premium

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="" />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100 }}>

        {/* Hero */}
        <div style={{ borderRadius: 20, padding: '24px', background: 'linear-gradient(135deg, rgba(255,28,71,0.2), rgba(200,0,58,0.08))', border: '1px solid rgba(255,28,71,0.2)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span style={{ background: 'rgba(255,28,71,0.15)', border: '1px solid rgba(255,28,71,0.25)', color: '#FF1C47', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
              {course.category}
            </span>
            {course.is_premium && (
              <span style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.2)', color: '#FFD60A', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
                PRO
              </span>
            )}
          </div>
          <h1 style={{ color: '#111111', fontWeight: 900, fontSize: 22, lineHeight: 1.3, marginBottom: 10 }}>{course.title}</h1>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{course.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlayCircle size={14} style={{ color: '#666' }} />
            <span style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>{chapters?.length ?? 0} Lektionen</span>
          </div>
        </div>

        {/* Chapters */}
        <p style={{ color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Lektionen</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {chapters?.map((chapter, i) => (
            <div key={chapter.id} style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: canAccess ? 'rgba(255,28,71,0.1)' : '#F2F2F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: canAccess ? '#FF1C47' : '#444', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#111111', fontWeight: 600, fontSize: 14 }}>{chapter.title}</p>
                {chapter.description && <p style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{chapter.description}</p>}
                {chapter.duration_minutes && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Clock size={10} style={{ color: '#999' }} />
                    <span style={{ color: '#999', fontSize: 11 }}>{chapter.duration_minutes} Min.</span>
                  </div>
                )}
              </div>
              {canAccess
                ? <span style={{ color: '#CCCCCC', fontSize: 14 }}>▶</span>
                : <Lock size={15} style={{ color: '#CCCCCC' }} />
              }
            </div>
          ))}
        </div>

        {/* CTA */}
        {canAccess ? (
          <div style={{ background: '#FFFFFF', border: '1px dashed #2E2E2E', borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
            <PlayCircle size={40} style={{ color: '#CCCCCC', margin: '0 auto 12px' }} />
            <p style={{ color: '#111111', fontWeight: 800, fontSize: 15 }}>Videos kommen bald</p>
            <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Inhalte werden in Kürze verfügbar sein.</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,28,71,0.06)', border: '1px solid rgba(255,28,71,0.2)', borderRadius: 20, padding: '24px', textAlign: 'center' }}>
            <Lock size={32} style={{ color: '#FF1C47', margin: '0 auto 12px' }} />
            <p style={{ color: '#111111', fontWeight: 800, fontSize: 16 }}>Premium-Kurs</p>
            <p style={{ color: '#666', fontSize: 13, marginTop: 4, marginBottom: 14 }}>Schalte Premium frei um diesen Kurs anzusehen.</p>
            <span style={{ background: 'rgba(255,28,71,0.1)', border: '1px solid rgba(255,28,71,0.25)', color: '#FF1C47', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
              Premium freischalten · Bald verfügbar
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
