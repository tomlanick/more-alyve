import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminCoursesClient } from './AdminCoursesClient'

export default async function AdminCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, category, is_premium, is_published, sort_order')
    .order('sort_order')

  return <AdminCoursesClient courses={courses ?? []} />
}
