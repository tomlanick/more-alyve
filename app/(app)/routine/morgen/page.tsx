import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { todayISO } from '@/lib/utils'
import { RoutineFlow } from '@/components/routine/RoutineFlow'

export const dynamic = 'force-dynamic'

export default async function MorningRoutinePage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const today = todayISO()

  const { data: prompts, error: promptsError } = await supabase
    .from('routine_prompts')
    .select('id, prompt_text, placeholder_text')
    .eq('type', 'morning')
    .eq('is_active', true)
    .order('sort_order')

  if (promptsError) console.error('[morgen] prompts error:', promptsError?.message, promptsError?.code, promptsError?.details, promptsError?.hint)

  const [{ data: entries }, { data: personalNote }] = await Promise.all([
    supabase.from('routine_entries').select('prompt_id, answer')
      .eq('user_id', user.id).eq('entry_date', today)
      .in('prompt_id', prompts?.map((p) => p.id) ?? []),
    supabase.from('routine_personal_notes').select('note')
      .eq('user_id', user.id).eq('entry_date', today).eq('type', 'morning').maybeSingle(),
  ])

  return (
    <RoutineFlow
      type="morning"
      prompts={prompts ?? []}
      existingEntries={entries ?? []}
      existingNote={personalNote?.note ?? ''}
      today={today}
      userId={user.id}
    />
  )
}
