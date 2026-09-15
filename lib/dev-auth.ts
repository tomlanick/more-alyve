/**
 * Dev-Auth Helper
 * Wenn DEV_BYPASS_AUTH=true → gibt einen Fake-User mit echter User-ID zurück.
 * Alle Supabase-Queries laufen normal, aber kein Login nötig.
 */

const DEV_USER_ID = '33e6d107-56ce-4915-bff4-5f43632d997b'

export function getDevUser() {
  if (process.env.DEV_BYPASS_AUTH !== 'true') return null
  return {
    id: DEV_USER_ID,
    email: 'tom@lanick-partner.de',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '',
  } as { id: string; email: string; app_metadata: object; user_metadata: object; aud: string; created_at: string }
}
