import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { HabitsClient } from './HabitsClient'

export default async function HabitsPage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  // Avatar-Profile
  const { data: avatars } = await supabase
    .from('avatar_profiles')
    .select('id, name, icon_emoji, color, description')
    .eq('is_active', true)
    .order('sort_order')

  // Alle Templates mit Avatar-Info
  const { data: templates } = await supabase
    .from('habit_templates')
    .select('id, avatar_id, name, description, icon_emoji, category, sort_order')
    .order('sort_order')

  // User's eigene Habits
  const { data: userHabits } = await supabase
    .from('user_habits')
    .select('id, template_id, name, icon_emoji, is_active, sort_order')
    .eq('user_id', user.id)
    .order('sort_order')

  // User's Profil (für aktuellen Avatar)
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_id')
    .eq('id', user.id)
    .single()

  // User's Änderungen
  const { data: userChanges } = await supabase
    .from('user_changes')
    .select('id, name, icon_emoji, is_active, sort_order')
    .eq('user_id', user.id)
    .order('sort_order')

  return (
    <HabitsClient
      avatars={avatars ?? []}
      templates={templates ?? []}
      userHabits={userHabits ?? []}
      currentAvatarId={profile?.avatar_id ?? null}
      userId={user.id}
      userChanges={userChanges ?? []}
    />
  )
}
