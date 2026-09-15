'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AvatarPicker } from '@/components/habits/AvatarPicker'
import { AppHeader } from '@/components/layout/AppHeader'
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react'
import { EmojiPicker } from '@/components/habits/EmojiPicker'
import { InspirationSheet, type InspirationHabit } from '@/components/habits/InspirationSheet'
import { WillChangeSheet, type ChangeItem } from '@/components/habits/WillChangeSheet'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface Avatar { id: string; name: string; icon_emoji: string; color: string; description: string }
interface Template { id: string; avatar_id: string | null; name: string; description: string | null; icon_emoji: string; category: string | null; sort_order: number }
interface UserHabit { id: string; template_id: string | null; name: string; icon_emoji: string; is_active: boolean; sort_order: number }
interface UserChange { id: string; name: string; icon_emoji: string; is_active: boolean; sort_order: number }

interface Props {
  avatars: Avatar[]
  templates: Template[]
  userHabits: UserHabit[]
  currentAvatarId: string | null
  userId: string
  userChanges: UserChange[]
}

export function HabitsClient({ avatars, templates, userHabits: initialHabits, currentAvatarId, userId, userChanges: initialChanges }: Props) {
  const router = useRouter()
  const [userHabits, setUserHabits] = useState(initialHabits)
  const [userChanges, setUserChanges] = useState(initialChanges)
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId)
  const [showAvatarPicker, setShowAvatarPicker] = useState(!currentAvatarId)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitEmoji, setNewHabitEmoji] = useState('✅')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showInspiration, setShowInspiration] = useState(false)
  const [showChangeSheet, setShowChangeSheet] = useState(false)
  const [newChangeName, setNewChangeName] = useState('')
  const [newChangeEmoji, setNewChangeEmoji] = useState('🔄')
  const [showChangeEmojiPicker, setShowChangeEmojiPicker] = useState(false)
  const [, startTransition] = useTransition()

  const avatarTemplates = templates.filter((t) => t.avatar_id === selectedAvatarId)

  async function handleAvatarSelect(avatarId: string) {
    setSelectedAvatarId(avatarId)
    setShowAvatarPicker(false)
    const supabase = createClient()
    await supabase.from('profiles').update({ avatar_id: avatarId }).eq('id', userId)
    const avatarTemplateList = templates.filter((t) => t.avatar_id === avatarId)
    const existingTemplateIds = new Set(userHabits.map((h) => h.template_id))
    const toAdd = avatarTemplateList.filter((t) => !existingTemplateIds.has(t.id))
    if (toAdd.length > 0) {
      const { data: newHabits } = await supabase
        .from('user_habits')
        .insert(toAdd.map((t, i) => ({ user_id: userId, template_id: t.id, name: t.name, icon_emoji: t.icon_emoji, is_active: true, sort_order: userHabits.length + i })))
        .select('id, template_id, name, icon_emoji, is_active, sort_order')
      if (newHabits) {
        setUserHabits((prev) => [...prev, ...newHabits])
        toast({ title: `${toAdd.length} Habits hinzugefügt`, variant: 'success' })
      }
    }
    router.refresh()
  }

  async function handleToggleHabit(templateId: string, active: boolean) {
    const supabase = createClient()
    const existing = userHabits.find((h) => h.template_id === templateId)
    if (active && !existing) {
      const template = templates.find((t) => t.id === templateId)
      if (!template) return
      const { data } = await supabase.from('user_habits').insert({ user_id: userId, template_id: template.id, name: template.name, icon_emoji: template.icon_emoji, is_active: true, sort_order: userHabits.length }).select('id, template_id, name, icon_emoji, is_active, sort_order').single()
      if (data) setUserHabits((prev) => [...prev, data])
    } else if (!active && existing) {
      await supabase.from('user_habits').update({ is_active: false }).eq('id', existing.id)
      setUserHabits((prev) => prev.map((h) => h.id === existing.id ? { ...h, is_active: false } : h))
    } else if (active && existing) {
      await supabase.from('user_habits').update({ is_active: true }).eq('id', existing.id)
      setUserHabits((prev) => prev.map((h) => h.id === existing.id ? { ...h, is_active: true } : h))
    }
  }

  async function handleAddCustomHabit() {
    if (!newHabitName.trim()) return
    const supabase = createClient()
    const { data } = await supabase.from('user_habits').insert({ user_id: userId, name: newHabitName.trim(), icon_emoji: newHabitEmoji, is_active: true, sort_order: userHabits.length }).select('id, template_id, name, icon_emoji, is_active, sort_order').single()
    if (data) {
      setUserHabits((prev) => [...prev, data])
      setNewHabitName('')
      toast({ title: 'Habit hinzugefügt!', variant: 'success' })
    }
  }

  async function handleAddInspirationHabit(habit: InspirationHabit) {
    const supabase = createClient()
    const { data } = await supabase.from('user_habits').insert({ user_id: userId, name: habit.name, icon_emoji: habit.emoji, is_active: true, sort_order: userHabits.length }).select('id, template_id, name, icon_emoji, is_active, sort_order').single()
    if (data) {
      setUserHabits((prev) => [...prev, data])
      toast({ title: `${habit.emoji} ${habit.name} hinzugefügt!`, variant: 'success' })
    }
  }

  async function handleDeleteHabit(id: string) {
    const supabase = createClient()
    await supabase.from('user_habits').delete().eq('id', id)
    setUserHabits((prev) => prev.filter((h) => h.id !== id))
  }

  async function handleAddChange(item: ChangeItem) {
    const supabase = createClient()
    const { data } = await supabase
      .from('user_changes')
      .insert({ user_id: userId, name: item.name, icon_emoji: item.emoji, is_active: true, sort_order: userChanges.length })
      .select('id, name, icon_emoji, is_active, sort_order')
      .single()
    if (data) {
      setUserChanges((prev) => [...prev, data])
      toast({ title: `${item.emoji} ${item.name} hinzugefügt!`, variant: 'success' })
    }
  }

  async function handleAddCustomChange() {
    if (!newChangeName.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('user_changes')
      .insert({ user_id: userId, name: newChangeName.trim(), icon_emoji: newChangeEmoji, is_active: true, sort_order: userChanges.length })
      .select('id, name, icon_emoji, is_active, sort_order')
      .single()
    if (data) {
      setUserChanges((prev) => [...prev, data])
      setNewChangeName('')
      toast({ title: 'Änderung hinzugefügt!', variant: 'success' })
    }
  }

  async function handleDeleteChange(id: string) {
    const supabase = createClient()
    await supabase.from('user_changes').delete().eq('id', id)
    setUserChanges((prev) => prev.filter((c) => c.id !== id))
  }

  const activeHabits = userHabits.filter((h) => h.is_active)
  const activeChanges = userChanges.filter((c) => c.is_active)

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="Meine Habits" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Avatar */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #EBEBEA', overflow: 'hidden' }}>
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            style={{ padding: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: '#111111', fontWeight: 800, fontSize: 15 }}>Dein Profil-Avatar</p>
              {selectedAvatarId && (
                <p style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                  {avatars.find((a) => a.id === selectedAvatarId)?.icon_emoji}{' '}
                  {avatars.find((a) => a.id === selectedAvatarId)?.name}
                </p>
              )}
            </div>
            {showAvatarPicker
              ? <ChevronUp size={18} style={{ color: '#666' }} />
              : <ChevronDown size={18} style={{ color: '#666' }} />
            }
          </button>
          {showAvatarPicker && (
            <div style={{ padding: '0 16px 16px' }}>
              <AvatarPicker avatars={avatars} selectedId={selectedAvatarId} onSelect={handleAvatarSelect} />
            </div>
          )}
        </div>

        {/* Avatar Habit-Templates */}
        {selectedAvatarId && avatarTemplates.length > 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #EBEBEA', padding: 16 }}>
            <p style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              {avatars.find((a) => a.id === selectedAvatarId)?.name}-Habits
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {avatarTemplates.map((template) => {
                const isActive = !!userHabits.find((h) => h.template_id === template.id && h.is_active)
                return (
                  <button
                    key={template.id}
                    onClick={() => handleToggleHabit(template.id, !isActive)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: isActive ? 'rgba(255,28,71,0.08)' : '#F2F2F0',
                      border: isActive ? '1px solid rgba(255,28,71,0.3)' : '1px solid #E0E0DE',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{template.icon_emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#111111', fontWeight: 700, fontSize: 14 }}>{template.name}</p>
                      {template.description && (
                        <p style={{ color: '#666', fontSize: 11, marginTop: 1 }}>{template.description}</p>
                      )}
                    </div>
                    {isActive
                      ? <CheckCircle2 size={20} style={{ color: '#FF1C47', flexShrink: 0 }} />
                      : <Circle size={20} style={{ color: '#E0E0DE', flexShrink: 0 }} />
                    }
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Habit Inspiration */}
        <button
          onClick={() => setShowInspiration(true)}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'linear-gradient(135deg, rgba(255,28,71,0.06), rgba(123,97,255,0.06))',
            border: '1px solid rgba(255,28,71,0.15)',
            borderRadius: 20, padding: '18px 20px',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #FF1C47, #7B61FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={20} style={{ color: '#FFFFFF' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#111111', fontWeight: 800, fontSize: 15, marginBottom: 2 }}>Habit Inspiration</p>
            <p style={{ color: '#999', fontSize: 12 }}>Über 80 Habits in 9 Kategorien entdecken</p>
          </div>
          <span style={{ color: '#FF1C47', fontSize: 20 }}>→</span>
        </button>

        {/* Eigenes Habit */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #EBEBEA', padding: 16 }}>
          <p style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Eigenes Habit hinzufügen
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: showEmojiPicker ? 10 : 0 }}>
            {/* Emoji button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                width: 52,
                height: 48,
                background: showEmojiPicker ? 'rgba(255,28,71,0.08)' : '#F2F2F0',
                border: showEmojiPicker ? '1.5px solid rgba(255,28,71,0.3)' : '1px solid #E0E0DE',
                borderRadius: 12,
                fontSize: 22,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
              title="Icon auswählen"
            >
              {newHabitEmoji}
            </button>
            <input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Habit-Name…"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomHabit()}
              style={{
                flex: 1,
                height: 48,
                background: '#F2F2F0',
                border: '1px solid #E0E0DE',
                borderRadius: 12,
                padding: '0 14px',
                color: '#111111',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddCustomHabit}
              disabled={!newHabitName.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: newHabitName.trim() ? 'linear-gradient(135deg, #FF1C47, #C8003A)' : '#F2F2F0',
                border: 'none',
                color: newHabitName.trim() ? '#FFFFFF' : '#BBBBBB',
                cursor: newHabitName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <EmojiPicker
              value={newHabitEmoji}
              onChange={(emoji) => setNewHabitEmoji(emoji)}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Was will ich ändern - Inspiration */}
        <button
          onClick={() => setShowChangeSheet(true)}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'linear-gradient(135deg, rgba(255,107,0,0.06), rgba(255,200,0,0.08))',
            border: '1px solid rgba(255,107,0,0.18)',
            borderRadius: 20, padding: '18px 20px',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #FF6B00, #FFB800)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={20} style={{ color: '#FFFFFF' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#111111', fontWeight: 800, fontSize: 15, marginBottom: 2 }}>Was will ich ändern?</p>
            <p style={{ color: '#999', fontSize: 12 }}>Inspiration aus über 40 Veränderungen</p>
          </div>
          <span style={{ color: '#FF6B00', fontSize: 20 }}>→</span>
        </button>

        {/* Eigenes Was will ich ändern */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #EBEBEA', padding: 16 }}>
          <p style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Eigenes „Was will ich ändern" hinzufügen
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: showChangeEmojiPicker ? 10 : 0 }}>
            <button
              onClick={() => setShowChangeEmojiPicker(!showChangeEmojiPicker)}
              style={{
                width: 52, height: 48,
                background: showChangeEmojiPicker ? 'rgba(255,107,0,0.08)' : '#F2F2F0',
                border: showChangeEmojiPicker ? '1.5px solid rgba(255,107,0,0.3)' : '1px solid #E0E0DE',
                borderRadius: 12, fontSize: 22, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              {newChangeEmoji}
            </button>
            <input
              value={newChangeName}
              onChange={(e) => setNewChangeName(e.target.value)}
              placeholder="Was möchtest du ändern…"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomChange()}
              style={{
                flex: 1, height: 48,
                background: '#F2F2F0', border: '1px solid #E0E0DE',
                borderRadius: 12, padding: '0 14px',
                color: '#111111', fontSize: 14, outline: 'none',
              }}
            />
            <button
              onClick={handleAddCustomChange}
              disabled={!newChangeName.trim()}
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: newChangeName.trim() ? 'linear-gradient(135deg, #FF6B00, #FFB800)' : '#F2F2F0',
                border: 'none',
                color: newChangeName.trim() ? '#FFFFFF' : '#BBBBBB',
                cursor: newChangeName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Plus size={20} />
            </button>
          </div>
          {showChangeEmojiPicker && (
            <EmojiPicker
              value={newChangeEmoji}
              onChange={(emoji) => setNewChangeEmoji(emoji)}
              onClose={() => setShowChangeEmojiPicker(false)}
            />
          )}
        </div>

        {/* Aktive Änderungen */}
        {activeChanges.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Meine Änderungen
              </p>
              <span style={{ background: '#F2F2F0', color: '#666', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {activeChanges.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeChanges.map((change) => (
                <div
                  key={change.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', background: '#FFFFFF',
                    borderRadius: 14, border: '1px solid #EBEBEA',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,107,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {change.icon_emoji}
                  </div>
                  <span style={{ flex: 1, color: '#111111', fontWeight: 600, fontSize: 14 }}>{change.name}</span>
                  <button
                    onClick={() => handleDeleteChange(change.id)}
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: '#E8E8E6', margin: '4px 0' }} />

        {/* Aktive Habits */}
        {activeHabits.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Aktive Habits
              </p>
              <span style={{ background: '#F2F2F0', color: '#666', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {activeHabits.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeHabits.map((habit) => (
                <div
                  key={habit.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', background: '#FFFFFF',
                    borderRadius: 14, border: '1px solid #EBEBEA',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F2F2F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {habit.icon_emoji}
                  </div>
                  <span style={{ flex: 1, color: '#111111', fontWeight: 600, fontSize: 14 }}>{habit.name}</span>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showInspiration && (
        <InspirationSheet
          existingNames={userHabits.map((h) => h.name)}
          onAdd={handleAddInspirationHabit}
          onClose={() => setShowInspiration(false)}
        />
      )}

      {showChangeSheet && (
        <WillChangeSheet
          existingNames={userChanges.map((c) => c.name)}
          onAdd={handleAddChange}
          onClose={() => setShowChangeSheet(false)}
        />
      )}
    </div>
  )
}
