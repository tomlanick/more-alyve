import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // Verify the requesting user is admin
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  const { email, displayName } = await request.json()
  if (!email || !displayName) {
    return NextResponse.json({ error: 'E-Mail und Name erforderlich' }, { status: 400 })
  }

  // Use service role client to create user
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service-Role-Key nicht konfiguriert' }, { status: 500 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email,
    password: 'MoreAlyve2026!',
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Update profile
  await adminClient
    .from('profiles')
    .update({
      display_name: displayName,
      must_change_password: true,
    })
    .eq('id', newUser.user.id)

  return NextResponse.json({
    user: {
      id: newUser.user.id,
      display_name: displayName,
      role: 'user',
      premium: false,
      must_change_password: true,
      created_at: newUser.user.created_at,
    }
  })
}
