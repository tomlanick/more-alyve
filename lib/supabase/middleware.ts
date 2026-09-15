import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protected app routes – redirect to login if not authenticated
  const isAppRoute = path.startsWith('/dashboard') ||
    path.startsWith('/habits') ||
    path.startsWith('/routine') ||
    path.startsWith('/auswertung') ||
    path.startsWith('/kurse') ||
    path.startsWith('/profil') ||
    path.startsWith('/einstellungen')

  const isAdminRoute = path.startsWith('/admin')

  // Dev-Bypass: DEV_BYPASS_AUTH=true überspringt Auth-Check
  const devBypass = process.env.DEV_BYPASS_AUTH === 'true'

  if (!devBypass && !user && (isAppRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated, check must_change_password
  if (!devBypass && user && isAppRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('must_change_password, role')
      .eq('id', user.id)
      .single()

    if (profile?.must_change_password && path !== '/passwort-aendern') {
      const url = request.nextUrl.clone()
      url.pathname = '/passwort-aendern'
      return NextResponse.redirect(url)
    }
  }

  // Admin route guard
  if (!devBypass && user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from login
  if (user && path === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
