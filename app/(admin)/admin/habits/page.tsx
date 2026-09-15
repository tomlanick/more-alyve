import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminHabitsClient } from './AdminHabitsClient'

export default async function AdminHabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: avatars } = await supabase
    .from('avatar_profiles')
    .select('*')
    .order('sort_order')

  const { data: templates } = await supabase
    .from('habit_templates')
    .select('*, avatar_profiles(name, icon_emoji)')
    .order('sort_order')

  return <AdminHabitsClient avatars={avatars ?? []} templates={templates ?? []} />
}
