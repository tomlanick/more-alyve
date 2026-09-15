'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'

interface Avatar {
  id: string
  name: string
  icon_emoji: string
  color: string
  description: string | null
  sort_order: number
  is_active: boolean
}

interface Template {
  id: string
  avatar_id: string | null
  name: string
  icon_emoji: string
  category: string | null
  avatar_profiles?: { name: string; icon_emoji: string } | null
}

export function AdminHabitsClient({ avatars: initialAvatars, templates: initialTemplates }: { avatars: Avatar[]; templates: Template[] }) {
  const [avatars, setAvatars] = useState(initialAvatars)
  const [templates, setTemplates] = useState(initialTemplates)
  const [newAvatarName, setNewAvatarName] = useState('')
  const [newAvatarEmoji, setNewAvatarEmoji] = useState('✨')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateEmoji, setNewTemplateEmoji] = useState('✅')
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('')

  async function addAvatar() {
    if (!newAvatarName.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('avatar_profiles')
      .insert({ name: newAvatarName, icon_emoji: newAvatarEmoji, sort_order: avatars.length + 1 })
      .select()
      .single()
    if (data) {
      setAvatars((prev) => [...prev, data])
      setNewAvatarName('')
      toast({ title: 'Avatar angelegt', variant: 'success' })
    }
  }

  async function deleteAvatar(id: string) {
    const supabase = createClient()
    await supabase.from('avatar_profiles').delete().eq('id', id)
    setAvatars((prev) => prev.filter((a) => a.id !== id))
    toast({ title: 'Avatar gelöscht', variant: 'default' })
  }

  async function addTemplate() {
    if (!newTemplateName.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('habit_templates')
      .insert({
        name: newTemplateName,
        icon_emoji: newTemplateEmoji,
        avatar_id: selectedAvatarId || null,
        sort_order: templates.length + 1,
      })
      .select()
      .single()
    if (data) {
      setTemplates((prev) => [...prev, data])
      setNewTemplateName('')
      toast({ title: 'Habit-Vorlage angelegt', variant: 'success' })
    }
  }

  async function deleteTemplate(id: string) {
    const supabase = createClient()
    await supabase.from('habit_templates').delete().eq('id', id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    toast({ title: 'Vorlage gelöscht', variant: 'default' })
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-black text-foreground">Habit-Verwaltung</h2>

      {/* Avatar-Profile */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <h3 className="font-bold text-sm mb-3">Avatar-Profile</h3>
        <div className="flex gap-2 mb-3">
          <Input value={newAvatarEmoji} onChange={(e) => setNewAvatarEmoji(e.target.value)} className="w-14 text-center" maxLength={2} />
          <Input value={newAvatarName} onChange={(e) => setNewAvatarName(e.target.value)} placeholder="Avatar-Name" className="flex-1" />
          <Button onClick={addAvatar} size="icon"><Plus size={18} /></Button>
        </div>
        <div className="flex flex-col gap-2">
          {avatars.map((a) => (
            <div key={a.id} className="flex items-center gap-2 p-2 bg-surface rounded-xl">
              <span>{a.icon_emoji}</span>
              <span className="flex-1 text-sm font-medium">{a.name}</span>
              <button onClick={() => deleteAvatar(a.id)} className="text-muted hover:text-danger">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Habit-Vorlagen */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <h3 className="font-bold text-sm mb-3">Habit-Vorlagen</h3>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2">
            <Input value={newTemplateEmoji} onChange={(e) => setNewTemplateEmoji(e.target.value)} className="w-14 text-center" maxLength={2} />
            <Input value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Habit-Name" className="flex-1" />
          </div>
          <select
            value={selectedAvatarId}
            onChange={(e) => setSelectedAvatarId(e.target.value)}
            className="w-full h-12 rounded-xl border-2 border-border px-3 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Kein Avatar (allgemein)</option>
            {avatars.map((a) => (
              <option key={a.id} value={a.id}>{a.icon_emoji} {a.name}</option>
            ))}
          </select>
          <Button onClick={addTemplate}><Plus size={16} /> Vorlage anlegen</Button>
        </div>
        <div className="flex flex-col gap-2">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-2 p-2 bg-surface rounded-xl">
              <span>{t.icon_emoji}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">{t.name}</span>
                {t.avatar_profiles && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    {t.avatar_profiles.icon_emoji} {t.avatar_profiles.name}
                  </Badge>
                )}
              </div>
              <button onClick={() => deleteTemplate(t.id)} className="text-muted hover:text-danger">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
