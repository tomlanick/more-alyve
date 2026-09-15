'use client'

import { useState, useMemo } from 'react'
import { X, Search, Check, Plus } from 'lucide-react'

export interface ChangeItem {
  name: string
  emoji: string
  description: string
  category: string
}

const CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: 'alle',      label: 'Alle',      emoji: '✨' },
  { key: 'mindset',   label: 'Mindset',   emoji: '🧠' },
  { key: 'digital',   label: 'Digital',   emoji: '📱' },
  { key: 'ernaehrung',label: 'Ernährung', emoji: '🥗' },
  { key: 'schlaf',    label: 'Schlaf',    emoji: '😴' },
  { key: 'zeit',      label: 'Zeit',      emoji: '⏱️' },
  { key: 'sozial',    label: 'Sozial',    emoji: '💬' },
  { key: 'koerper',   label: 'Körper',    emoji: '💪' },
  { key: 'mental',    label: 'Mental',    emoji: '🧘' },
]

const CHANGES: ChangeItem[] = [
  // Mindset
  { name: 'Positiver denken',           emoji: '🌟', description: 'Bewusst positive Gedanken fördern',    category: 'mindset' },
  { name: 'Mehr Dankbarkeit',           emoji: '🙏', description: 'Täglich 3 Dinge, für die ich dankbar bin', category: 'mindset' },
  { name: 'Weniger Selbstkritik',       emoji: '💛', description: 'Freundlicher mit mir selbst umgehen',  category: 'mindset' },
  { name: 'Weniger negative Gedanken',  emoji: '🚫', description: 'Negative Gedankenmuster erkennen',    category: 'mindset' },
  { name: 'Mehr Selbstvertrauen',       emoji: '🦁', description: 'An mich und meine Stärken glauben',   category: 'mindset' },
  { name: 'Weniger Perfektionismus',    emoji: '🎯', description: 'Gut genug ist oft besser als perfekt', category: 'mindset' },
  { name: 'Offener für Veränderungen',  emoji: '🌱', description: 'Neues willkommen heißen statt meiden',category: 'mindset' },

  // Digital
  { name: 'Weniger Handy nutzen',       emoji: '📵', description: 'Bildschirmzeit bewusst reduzieren',   category: 'digital' },
  { name: 'Social Media reduzieren',    emoji: '📲', description: 'Weniger scrollen, mehr erleben',       category: 'digital' },
  { name: 'Kein Handy vor dem Schlafen',emoji: '🌙', description: 'Mindestens 1 h vor Schlaf offline',   category: 'digital' },
  { name: 'Kein Handy beim Essen',      emoji: '🍽️', description: 'Mahlzeiten ohne Bildschirm genießen', category: 'digital' },
  { name: 'Weniger Netflix',            emoji: '📺', description: 'Serienzeit bewusst begrenzen',         category: 'digital' },
  { name: 'Mehr Offline-Aktivitäten',   emoji: '🏔️', description: 'Echte Erlebnisse statt Digital',      category: 'digital' },

  // Ernährung
  { name: 'Weniger Zucker',             emoji: '🍬', description: 'Süßigkeiten & Softdrinks reduzieren', category: 'ernaehrung' },
  { name: 'Weniger Alkohol',            emoji: '🍺', description: 'Alkoholkonsum bewusst einschränken',   category: 'ernaehrung' },
  { name: 'Mehr Wasser trinken',        emoji: '💧', description: 'Mindestens 2 Liter täglich',           category: 'ernaehrung' },
  { name: 'Weniger Fast Food',          emoji: '🍟', description: 'Fertiggerichte und Fast Food meiden',  category: 'ernaehrung' },
  { name: 'Weniger Koffein',            emoji: '☕', description: 'Kaffeekonsum auf max. 2 Tassen tägl.', category: 'ernaehrung' },
  { name: 'Weniger Snacken',            emoji: '🍫', description: 'Nur zu Mahlzeiten essen',              category: 'ernaehrung' },
  { name: 'Bewusster essen',            emoji: '🥗', description: 'Langsamer essen, mehr genießen',       category: 'ernaehrung' },

  // Schlaf
  { name: 'Früher schlafen gehen',      emoji: '🛏️', description: 'Ziel: vor 23 Uhr im Bett',            category: 'schlaf' },
  { name: 'Regelmäßiger Schlafrhythmus',emoji: '⏰', description: 'Jeden Tag zur gleichen Zeit aufstehen',category: 'schlaf' },
  { name: 'Kein Koffein nach 14 Uhr',   emoji: '🚫', description: 'Guter Schlaf beginnt am Nachmittag',  category: 'schlaf' },
  { name: 'Besser abschalten',          emoji: '😌', description: 'Abendroutine für besseren Schlaf',     category: 'schlaf' },
  { name: 'Weniger Mittagsschlaf',      emoji: '💤', description: 'Mittagsschlaf begrenzen oder weglassen',category: 'schlaf' },

  // Zeit
  { name: 'Weniger prokrastinieren',    emoji: '⏳', description: 'Aufgaben sofort anpacken statt aufschieben', category: 'zeit' },
  { name: 'Pünktlicher sein',           emoji: '🕐', description: 'Rechtzeitig planen und loslegen',      category: 'zeit' },
  { name: 'Besser Nein sagen',          emoji: '🙅', description: 'Grenzen setzen und Zeit schützen',     category: 'zeit' },
  { name: 'Weniger Multitasking',       emoji: '🎯', description: 'Eine Sache nach der anderen erledigen',category: 'zeit' },
  { name: 'Klarer planen',              emoji: '📋', description: 'Tages- und Wochenziele definieren',    category: 'zeit' },
  { name: 'Prioritäten setzen',         emoji: '🔝', description: 'Wichtiges vor Dringendem erledigen',   category: 'zeit' },

  // Sozial
  { name: 'Mehr zuhören',               emoji: '👂', description: 'Aktiv zuhören statt nur reden',        category: 'sozial' },
  { name: 'Weniger klagen',             emoji: '😤', description: 'Konstruktiv statt negativ sein',       category: 'sozial' },
  { name: 'Mehr Empathie zeigen',       emoji: '❤️', description: 'Andere besser verstehen und einfühlen',category: 'sozial' },
  { name: 'Offener auf andere zugehen', emoji: '🤝', description: 'Neue Bekanntschaften machen',          category: 'sozial' },
  { name: 'Weniger Klatsch',            emoji: '🤐', description: 'Nicht über Abwesende lästern',         category: 'sozial' },
  { name: 'Mehr Wertschätzung zeigen',  emoji: '🌸', description: 'Lob und Dankbarkeit aussprechen',      category: 'sozial' },

  // Körper
  { name: 'Weniger sitzen',             emoji: '🚶', description: 'Regelmäßig aufstehen und bewegen',     category: 'koerper' },
  { name: 'Bessere Körperhaltung',      emoji: '🧍', description: 'Bewusst aufrecht sitzen und stehen',   category: 'koerper' },
  { name: 'Mehr Treppen statt Lift',    emoji: '🏃', description: 'Alltägliche Bewegung erhöhen',         category: 'koerper' },
  { name: 'Weniger Schmerzmedikamente', emoji: '💊', description: 'Natürliche Alternativen finden',       category: 'koerper' },
  { name: 'Mehr Pausen im Alltag',      emoji: '☕', description: 'Bewusste Pausen für Körper & Geist',   category: 'koerper' },

  // Mental
  { name: 'Weniger Stress',             emoji: '😤', description: 'Stressoren erkennen und reduzieren',   category: 'mental' },
  { name: 'Besser mit Kritik umgehen',  emoji: '💬', description: 'Feedback als Chance sehen',            category: 'mental' },
  { name: 'Mehr Ruhe im Alltag',        emoji: '🧘', description: 'Stille Momente bewusst einbauen',      category: 'mental' },
  { name: 'Weniger Sorgen machen',      emoji: '☁️', description: 'Im Moment leben statt grübeln',        category: 'mental' },
  { name: 'Resilienter werden',         emoji: '🌊', description: 'Rückschläge besser verarbeiten',       category: 'mental' },
  { name: 'Achtsamkeit üben',           emoji: '🌿', description: 'Im Jetzt sein statt abschweifen',      category: 'mental' },
  { name: 'Emotionen besser regulieren',emoji: '🎭', description: 'Impulsreaktionen kontrollieren',       category: 'mental' },
  { name: 'Stress',                     emoji: '🌀', description: 'Stressmomente erkennen und tracken',   category: 'mental' },
  { name: 'Gereizt gefühlt',            emoji: '😠', description: 'Reizbarkeit wahrnehmen und reduzieren',category: 'mental' },
  { name: 'Ängstlich oder nervös',      emoji: '😰', description: 'Angstmomente bewusst wahrnehmen',      category: 'mental' },
  { name: 'Beziehungsstress',           emoji: '💔', description: 'Konflikte im sozialen Umfeld tracken', category: 'mental' },

  // Ernährung (neue)
  { name: 'Alkohol konsumiert',         emoji: '🍷', description: 'Alkoholkonsum bewusst festhalten',     category: 'ernaehrung' },
  { name: 'Unkontrolliert gegessen',    emoji: '🍩', description: 'Essanfälle erkennen und reduzieren',   category: 'ernaehrung' },
  { name: 'Fastfood verzichtet',        emoji: '🥗', description: 'Bewusst auf Fast Food verzichtet',     category: 'ernaehrung' },
  { name: 'Spät abends gegessen',       emoji: '🌙', description: 'Essen kurz vor dem Schlafen meiden',   category: 'ernaehrung' },

  // Schlaf (neue)
  { name: 'Weniger als 6h Schlaf',      emoji: '😴', description: 'Schlafmangel erkennen und vermeiden', category: 'schlaf' },

  // Digital (neue)
  { name: 'Über 3h Handykonsum',        emoji: '📱', description: 'Exzessive Bildschirmzeit festhalten',  category: 'digital' },
  { name: 'Handy direkt nach Aufstehen',emoji: '🌅', description: 'Morgens offline starten statt scrollen',category: 'digital' },

  // Körper (neue)
  { name: 'Aufgeblähter Bauch',         emoji: '🫃', description: 'Blähungen und Unwohlsein tracken',     category: 'koerper' },
  { name: 'Nikotin konsumiert',         emoji: '🚬', description: 'Nikotinkonsum bewusst festhalten',     category: 'koerper' },
  { name: 'Drogen konsumiert',          emoji: '⚠️', description: 'Substanzkonsum wahrnehmen und reduzieren', category: 'koerper' },
  { name: 'Fieber',                     emoji: '🤒', description: 'Krankheitssymptome tracken',           category: 'koerper' },
  { name: 'Migräne',                    emoji: '🤕', description: 'Migräneanfälle erkennen und dokumentieren', category: 'koerper' },
  { name: 'Übelkeit',                   emoji: '🤢', description: 'Übelkeit als Signal des Körpers tracken', category: 'koerper' },
  { name: 'Gliederschmerzen',           emoji: '🦴', description: 'Körperschmerzen wahrnehmen und analysieren', category: 'koerper' },
  { name: 'Krankheit',                  emoji: '🏥', description: 'Krankheitstage dokumentieren',         category: 'koerper' },
]

interface Props {
  existingNames: string[]
  onAdd: (item: ChangeItem) => void
  onClose: () => void
}

export function WillChangeSheet({ existingNames, onAdd, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState('alle')
  const [search, setSearch] = useState('')
  const added = new Set(existingNames.map((n) => n.toLowerCase()))

  const filtered = useMemo(() => {
    const cat = activeCategory === 'alle' ? CHANGES : CHANGES.filter((c) => c.category === activeCategory)
    if (!search.trim()) return cat
    const q = search.toLowerCase()
    return cat.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  }, [activeCategory, search])

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100 }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
        background: '#FFFFFF', borderRadius: '24px 24px 0 0',
        maxHeight: '88dvh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0DE' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ color: '#111111', fontWeight: 900, fontSize: 17 }}>Was will ich ändern?</p>
            <p style={{ color: '#999', fontSize: 12, marginTop: 2 }}>Wähle aus, was du in deinem Leben verändern möchtest</p>
          </div>
          <button onClick={onClose} style={{ background: '#F2F2F0', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} style={{ color: '#666' }} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 10px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen…"
              style={{ width: '100%', height: 38, background: '#F2F2F0', border: '1px solid #E8E8E6', borderRadius: 10, padding: '0 12px 0 34px', fontSize: 13, color: '#111111', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px', overflowX: 'auto', flexShrink: 0 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 20,
                background: activeCategory === cat.key ? '#111111' : '#F2F2F0',
                border: 'none', cursor: 'pointer',
                color: activeCategory === cat.key ? '#FFFFFF' : '#666',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }}>
          {filtered.map((item) => {
            const isAdded = added.has(item.name.toLowerCase())
            return (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F4F4F2' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#111111', fontWeight: 700, fontSize: 14 }}>{item.name}</p>
                  <p style={{ color: '#999', fontSize: 11, marginTop: 1 }}>{item.description}</p>
                </div>
                <button
                  onClick={() => !isAdded && onAdd(item)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: 'none',
                    background: isAdded ? 'rgba(0,200,83,0.12)' : 'rgba(255,107,0,0.10)',
                    cursor: isAdded ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {isAdded
                    ? <Check size={15} style={{ color: '#00C853', strokeWidth: 3 }} />
                    : <Plus size={15} style={{ color: '#FF6B00', strokeWidth: 3 }} />
                  }
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
