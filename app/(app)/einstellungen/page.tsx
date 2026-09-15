import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/layout/AppHeader'
import { EinstellungenClient } from './EinstellungenClient'

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, notification_morning_time, notification_evening_time, notifications_enabled')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <AppHeader title="Einstellungen" />
      <EinstellungenClient
        userId={user.id}
        displayName={profile?.display_name ?? ''}
        notificationMorning={(profile?.notification_morning_time as string) ?? '07:00:00'}
        notificationEvening={(profile?.notification_evening_time as string) ?? '21:00:00'}
        notificationsEnabled={profile?.notifications_enabled ?? false}
      />
    </div>
  )
}
