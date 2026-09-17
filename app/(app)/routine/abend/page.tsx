import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { todayISO } from '@/lib/utils'
import { RoutineFlow } from '@/components/routine/RoutineFlow'

export const dynamic = 'force-dynamic'

const EDIT_WINDOW_DAYS = 3

function isValidPastDate(date: string, today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const d1 = new Date(date + 'T12:00:00')
  const d2 = new Date(today + 'T12:00:00')
  const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
  return diff >= 0 && diff <= EDIT_WINDOW_DAYS
}

export default async function EveningRoutinePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const today = todayISO()
  const params = await searchParams
  const entryDate = (params.date && isValidPastDate(params.date, today)) ? params.date : today

  const { data: prompts } = await supabase
    .from('routine_prompts')
    .select('id, prompt_text, placeholder_text')
    .eq('type', 'evening')
    .eq('is_active', true)
    .order('sort_order')

  const [{ data: entries }, { data: personalNote }] = await Promise.all([
    supabase.from('routine_entries').select('prompt_id, answer')
      .eq('user_id', user.id).eq('entry_date', entryDate)
      .in('prompt_id', prompts?.map((p) => p.id) ?? []),
    supabase.from('routine_personal_notes').select('note')
      .eq('user_id', user.id).eq('entry_date', entryDate).eq('type', 'evening').maybeSingle(),
  ])

  return (
    <RoutineFlow
      type="evening"
      prompts={prompts ?? []}
      existingEntries={entries ?? []}
      existingNote={personalNote?.note ?? ''}
      today={entryDate}
      userId={user.id}
    />
  )
}
