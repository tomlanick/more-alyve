'use client'

import { useState, useMemo } from 'react'
import { X, Plus, Check, Search } from 'lucide-react'

export interface InspirationHabit {
  name: string
  emoji: string
  description: string
  category: string
}

const CATEGORIES = [
  { id: 'all', label: 'Alle', emoji: '⭐' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'mind', label: 'Mind', emoji: '🧠' },
  { id: 'nutrition', label: 'Ernährung', emoji: '🥗' },
  { id: 'sleep', label: 'Erholung', emoji: '😴' },
  { id: 'productivity', label: 'Produktivität', emoji: '🎯' },
  { id: 'social', label: 'Soziales', emoji: '❤️' },
  { id: 'finance', label: 'Finanzen', emoji: '💰' },
  { id: 'nature', label: 'Natur', emoji: '🌿' },
  { id: 'creative', label: 'Kreativität', emoji: '🎨' },
]

const HABITS: InspirationHabit[] = [
  // Fitness
  { name: 'Sport / Training', emoji: '🏋️', description: 'Mindestens 30 Minuten Bewegung', category: 'fitness' },
  { name: 'Laufen', emoji: '🏃', description: 'Täglich laufen gehen', category: 'fitness' },
  { name: '10.000 Schritte', emoji: '👟', description: 'Täglich 10.000 Schritte gehen', category: 'fitness' },
  { name: 'Krafttraining', emoji: '💪', description: '3x pro Woche Gewichte', category: 'fitness' },
  { name: 'Yoga', emoji: '🧘', description: 'Tägliche Yoga-Session', category: 'fitness' },
  { name: 'Schwimmen', emoji: '🏊', description: 'Schwimmen gehen', category: 'fitness' },
  { name: 'Radfahren', emoji: '🚴', description: 'Mit dem Fahrrad fahren', category: 'fitness' },
  { name: 'Stretching', emoji: '🤸', description: '10 Minuten dehnen', category: 'fitness' },
  { name: 'Kalt duschen', emoji: '🚿', description: '2 Minuten kalt duschen', category: 'fitness' },
  { name: 'Treppe statt Lift', emoji: '🪜', description: 'Immer die Treppe nehmen', category: 'fitness' },
  { name: 'Spaziergang', emoji: '🌳', description: 'Täglicher Spaziergang in der Natur', category: 'fitness' },
  { name: 'Liegestütze', emoji: '💪', description: 'Täglich 20 Liegestütze', category: 'fitness' },
  { name: 'Plank', emoji: '🧱', description: '1 Minute Plank täglich', category: 'fitness' },
  { name: 'Kampfsport', emoji: '🥊', description: 'Boxen oder Kampfsport', category: 'fitness' },
  { name: 'Tennis', emoji: '🎾', description: 'Tennis spielen', category: 'fitness' },

  // Mind
  { name: '10 Seiten lesen', emoji: '📚', description: 'Täglich mindestens 10 Seiten lesen', category: 'mind' },
  { name: 'Meditieren', emoji: '🧘', description: '10 Minuten Meditation täglich', category: 'mind' },
  { name: 'Journaling', emoji: '✍️', description: 'Gedanken täglich aufschreiben', category: 'mind' },
  { name: 'Podcast hören', emoji: '🎧', description: 'Lehrreichen Podcast hören', category: 'mind' },
  { name: 'Sprache lernen', emoji: '🌍', description: '15 Minuten Sprachlernen', category: 'mind' },
  { name: 'Dankbarkeit', emoji: '🙏', description: '3 Dinge aufschreiben, wofür ich dankbar bin', category: 'mind' },
  { name: 'Visualisierung', emoji: '🌟', description: 'Ziele täglich visualisieren', category: 'mind' },
  { name: 'Weiterbildung', emoji: '🎓', description: '30 Minuten online lernen', category: 'mind' },
  { name: 'Gehirn trainieren', emoji: '🧩', description: 'Rätsel oder Schach spielen', category: 'mind' },
  { name: 'Affirmationen', emoji: '💬', description: 'Positive Affirmationen sprechen', category: 'mind' },
  { name: 'Kein Social Media', emoji: '📵', description: 'Social Media Pause einhalten', category: 'mind' },
  { name: 'Fokus-Session', emoji: '⏱️', description: '90 Minuten ungestört arbeiten', category: 'mind' },
  { name: 'Reflexion', emoji: '💭', description: 'Den Tag abends reflektieren', category: 'mind' },

  // Nutrition
  { name: 'Bewusste Ernährung', emoji: '🥗', description: 'Gesund und ausgewogen essen', category: 'nutrition' },
  { name: '2 Liter Wasser', emoji: '💧', description: 'Täglich 2 Liter Wasser trinken', category: 'nutrition' },
  { name: 'Kein Zucker', emoji: '🚫', description: 'Keinen raffinierten Zucker', category: 'nutrition' },
  { name: 'Kein Alkohol', emoji: '🚫', description: 'Alkoholfrei bleiben', category: 'nutrition' },
  { name: 'Gemüse essen', emoji: '🥦', description: 'Mindestens 3 Portionen Gemüse', category: 'nutrition' },
  { name: 'Frühstücken', emoji: '🍳', description: 'Jeden Tag frühstücken', category: 'nutrition' },
  { name: 'Meal Prep', emoji: '🥘', description: 'Mahlzeiten vorkochen', category: 'nutrition' },
  { name: 'Kein Fast Food', emoji: '🚫', description: 'Auf Fast Food verzichten', category: 'nutrition' },
  { name: 'Supplements nehmen', emoji: '💊', description: 'Vitamine & Supplements einnehmen', category: 'nutrition' },
  { name: 'Intervallfasten', emoji: '⏰', description: '16:8 Intervallfasten einhalten', category: 'nutrition' },
  { name: 'Grüner Tee', emoji: '🍵', description: 'Täglich grünen Tee trinken', category: 'nutrition' },
  { name: 'Weniger Koffein', emoji: '☕', description: 'Max. 1 Kaffee pro Tag', category: 'nutrition' },
  { name: 'Protein-Ziel', emoji: '🥩', description: 'Tägliches Protein-Ziel erreichen', category: 'nutrition' },

  // Sleep
  { name: '7h Schlaf', emoji: '😴', description: 'Mindestens 7 Stunden schlafen', category: 'sleep' },
  { name: 'Schlafenszeit', emoji: '🌙', description: 'Feste Schlafenszeit einhalten', category: 'sleep' },
  { name: 'Kein Handy im Bett', emoji: '📵', description: '1 Stunde vor Schlaf kein Handy', category: 'sleep' },
  { name: 'Powernap', emoji: '💤', description: '20 Minuten Mittagsschlaf', category: 'sleep' },
  { name: 'Abendroutine', emoji: '🌛', description: 'Entspannende Abendroutine', category: 'sleep' },
  { name: 'Früh aufstehen', emoji: '🌅', description: 'Vor 7 Uhr aufstehen', category: 'sleep' },
  { name: 'Keine Screens', emoji: '🖥️', description: '2h vor Schlaf keine Bildschirme', category: 'sleep' },
  { name: 'Sauna', emoji: '🧖', description: 'Sauna zur Entspannung', category: 'sleep' },

  // Productivity
  { name: 'To-Do Liste', emoji: '📋', description: 'Täglich To-Do Liste erstellen', category: 'productivity' },
  { name: 'Inbox Zero', emoji: '📧', description: 'E-Mail Postfach leeren', category: 'productivity' },
  { name: 'Tiefarbeit', emoji: '🔥', description: '2 Stunden ungestörte Tiefarbeit', category: 'productivity' },
  { name: 'Ziele überprüfen', emoji: '🎯', description: 'Tägliche Ziele überprüfen', category: 'productivity' },
  { name: 'Pünktlichkeit', emoji: '⏱️', description: 'Immer pünktlich erscheinen', category: 'productivity' },
  { name: 'Nein sagen', emoji: '🚫', description: 'Grenzen setzen & Nein sagen', category: 'productivity' },
  { name: 'Aufräumen', emoji: '🧹', description: 'Arbeitsplatz täglich aufräumen', category: 'productivity' },
  { name: 'Wochenplanung', emoji: '📅', description: 'Woche am Sonntag planen', category: 'productivity' },
  { name: 'Prokrastination', emoji: '⚡', description: 'Unangenehme Aufgabe zuerst', category: 'productivity' },
  { name: 'Keine Meetings', emoji: '🚫', description: 'Meeting-freie Zeit schützen', category: 'productivity' },

  // Social
  { name: 'Familie anrufen', emoji: '📞', description: 'Eltern oder Geschwister anrufen', category: 'social' },
  { name: 'Freunde treffen', emoji: '👥', description: 'Zeit mit Freunden verbringen', category: 'social' },
  { name: 'Kompliment machen', emoji: '😊', description: 'Jemandem ein Kompliment machen', category: 'social' },
  { name: 'Helfen', emoji: '🤝', description: 'Jemandem helfen', category: 'social' },
  { name: 'Danke sagen', emoji: '🙏', description: 'Dankbarkeit ausdrücken', category: 'social' },
  { name: 'Netzwerken', emoji: '🌐', description: 'Berufliches Netzwerk pflegen', category: 'social' },
  { name: 'Partner-Zeit', emoji: '❤️', description: 'Qualitätszeit mit Partner', category: 'social' },
  { name: 'Mentoring', emoji: '🎓', description: 'Jemanden mentoren oder begleiten', category: 'social' },

  // Finance
  { name: 'Ausgaben tracken', emoji: '📊', description: 'Alle Ausgaben notieren', category: 'finance' },
  { name: 'Sparen', emoji: '💰', description: 'Täglich etwas zur Seite legen', category: 'finance' },
  { name: 'Budget einhalten', emoji: '💳', description: 'Tagesbudget nicht überschreiten', category: 'finance' },
  { name: 'Investieren', emoji: '📈', description: 'Regelmäßig investieren', category: 'finance' },
  { name: 'Finanzen prüfen', emoji: '🔍', description: 'Kontostand & Ausgaben prüfen', category: 'finance' },
  { name: 'Kein Impulskauf', emoji: '🛑', description: 'Keine spontanen Käufe', category: 'finance' },
  { name: 'Einnahmen steigern', emoji: '🚀', description: 'An Einkommensquellen arbeiten', category: 'finance' },

  // Nature
  { name: 'Zeit in der Natur', emoji: '🌿', description: 'Täglich draußen sein', category: 'nature' },
  { name: 'Pflanzen gießen', emoji: '🌱', description: 'Zimmerpflanzen pflegen', category: 'nature' },
  { name: 'Nachhaltig leben', emoji: '♻️', description: 'Bewusst & nachhaltig handeln', category: 'nature' },
  { name: 'Sonnenaufgang', emoji: '🌅', description: 'Sonnenaufgang erleben', category: 'nature' },
  { name: 'Gartenarbeit', emoji: '🌻', description: 'Im Garten arbeiten', category: 'nature' },

  // Creative
  { name: 'Musik machen', emoji: '🎵', description: 'Instrument spielen oder singen', category: 'creative' },
  { name: 'Zeichnen', emoji: '🎨', description: 'Täglich zeichnen oder malen', category: 'creative' },
  { name: 'Schreiben', emoji: '✍️', description: 'Kreativ schreiben', category: 'creative' },
  { name: 'Fotografieren', emoji: '📷', description: 'Täglich ein Foto machen', category: 'creative' },
  { name: 'Kochen lernen', emoji: '👨‍🍳', description: 'Neues Rezept ausprobieren', category: 'creative' },
  { name: 'Tanzen', emoji: '💃', description: 'Tanzen oder Choreographie lernen', category: 'creative' },
  { name: 'Handwerk', emoji: '🔨', description: 'Etwas mit den Händen bauen', category: 'creative' },
]

interface Props {
  existingNames: string[]
  onAdd: (habit: InspirationHabit) => void
  onClose: () => void
}

export function InspirationSheet({ existingNames, onAdd, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [added, setAdded] = useState<Set<string>>(new Set(existingNames.map(n => n.toLowerCase())))

  const filtered = useMemo(() => {
    return HABITS.filter((h) => {
      const matchCat = activeCategory === 'all' || h.category === activeCategory
      const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.description.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeCategory, search])

  function handleAdd(habit: InspirationHabit) {
    setAdded((prev) => new Set([...prev, habit.name.toLowerCase()]))
    onAdd(habit)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 100, backdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 101,
        background: '#F7F7F5',
        borderRadius: '24px 24px 0 0',
        maxHeight: '88dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E0E0DE' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px' }}>
          <div>
            <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 18, marginBottom: 2 }}>Habit Inspiration</h2>
            <p style={{ color: '#999', fontSize: 12 }}>{HABITS.length} Habits in {CATEGORIES.length - 1} Kategorien</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#EBEBEA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: '1px solid #E0E0DE', borderRadius: 14, padding: '10px 14px' }}>
            <Search size={16} style={{ color: '#BBBBBB', flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Habit suchen…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#111111' }}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px',
                  borderRadius: 20,
                  background: isActive ? '#111111' : '#FFFFFF',
                  border: isActive ? '1px solid #111111' : '1px solid #E0E0DE',
                  color: isActive ? '#FFFFFF' : '#666',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: 14 }}>
              Keine Habits gefunden
            </div>
          ) : filtered.map((habit) => {
            const isAdded = added.has(habit.name.toLowerCase())
            return (
              <div
                key={`${habit.name}-${habit.category}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: '#FFFFFF',
                  borderRadius: 16, padding: '14px 16px',
                  border: isAdded ? '1px solid rgba(0,200,83,0.3)' : '1px solid #EBEBEA',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: isAdded ? 'rgba(0,200,83,0.1)' : '#F2F2F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {habit.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#111111', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{habit.name}</p>
                  <p style={{ color: '#999', fontSize: 12, lineHeight: 1.4 }}>{habit.description}</p>
                </div>
                <button
                  onClick={() => !isAdded && handleAdd(habit)}
                  style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: isAdded ? 'rgba(0,200,83,0.1)' : 'linear-gradient(135deg, #FF1C47, #C8003A)',
                    border: isAdded ? '1px solid rgba(0,200,83,0.3)' : 'none',
                    cursor: isAdded ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isAdded ? '#00C853' : '#FFFFFF',
                    transition: 'all 0.2s',
                  }}
                >
                  {isAdded ? <Check size={16} /> : <Plus size={16} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
