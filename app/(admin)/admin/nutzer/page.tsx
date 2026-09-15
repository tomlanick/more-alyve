import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminUserClient } from './AdminUserClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, role, premium, must_change_password, created_at')
    .order('created_at', { ascending: false })

  return <AdminUserClient users={users ?? []} currentUserId={user.id} />
}
