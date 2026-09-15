'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

// Full Apple emoji keyboard — all categories
const CATEGORIES: { id: string; icon: string; label: string; emojis: string[] }[] = [
  {
    id: 'recent', icon: '🕐', label: 'Zuletzt',
    emojis: [], // populated dynamically from localStorage
  },
  {
    id: 'smileys', icon: '😀', label: 'Smileys',
    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','🫠','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🫗','🤭','🫢','🫣','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','🫨','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','💫','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','💌','💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️‍🔥','❤️‍🩹','❤️','🧡','💛','💚','💙','🩵','💜','🤎','🖤','🩶','🤍','💋','💯','💢','💥','💫','💦','💨','🕳️','💬','👁️‍🗨️','🗨️','🗯️','💭','💤'],
  },
  {
    id: 'people', icon: '👋', label: 'Menschen',
    emojis: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','🫷','🫸','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁️','👅','👄','🫦','👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🫅','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🫃','🫄','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟','🧌','💆','💇','🚶','🧍','🧎','🏃','💃','🕺','🕴️','👯','🧖','🧗','🏇','🏂','🏋️','🤼','🤸','⛹️','🤺','🏊','🚵','🚴','🧘','🛀','🛌'],
  },
  {
    id: 'animals', icon: '🐶', label: 'Tiere',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪲','🦟','🦗','🕷️','🦂','🐢','🦎','🐍','🐲','🦕','🦖','🦎','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🪿','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔','🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🎋','🍃','🍂','🍁','🪺','🪹','🍄','🌾','💐','🌷','🌹','🥀','🪷','🌺','🌸','🌼','🌻','🌞','🌝','🍋','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌟','⭐','🌠','🌌','☀️','🌤️','⛅','🌥️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌀','🌈','🌂','☂️','☔','⛱️','⚡','🔥','💧','🌊'],
  },
  {
    id: 'food', icon: '🍎', label: 'Essen',
    emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🫒','🫑','🥑','🍆','🥔','🥕','🌽','🌶️','🫛','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🫘','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫔','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🫕','🍲','🥣','🥗','🍿','🧂','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🫖','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🫗','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥢','🧆'],
  },
  {
    id: 'activity', icon: '⚽', label: 'Sport',
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🛝','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🏇','🧘','🏊','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'],
  },
  {
    id: 'travel', icon: '✈️', label: 'Reisen',
    emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🚤','🛥️','🛳️','⛴️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🏖️','🏕️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🪨','🪵','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🎠','🛝','🎡','🎢','💈','🎪'],
  },
  {
    id: 'objects', icon: '💡', label: 'Objekte',
    emojis: ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💽','💾','💿','📀','🧮','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🪫','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💰','💴','💵','💶','💷','🪙','💸','💳','🪅','🪆','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🪝','🧲','🪜','🔑','🗝️','🔐','🔏','🔒','🔓','🚪','🪞','🪟','🛏️','🛋️','🪑','🚽','🪠','🚿','🛁','🪤','🧴','🧷','🧹','🧺','🧻','🪣','🧼','🫧','🪥','🧽','🧹','🧺','🪒','🧴','💊','💉','🩸','🩹','🩺','🩻','🩼','🩺','🔬','🔭','🩻','🩼','📋','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🔗','📎','🖇️','📐','📏','🧮','✂️','🗃️','🗄️','🗑️','🔒','🔓','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','🛡️','🪃','🏹','🪚','🔧','🪛','🔩','⚙️','🗜️','⚖️','🦯','🔗','⛓️','🪝','🧲','🪜','🔮'],
  },
  {
    id: 'symbols', icon: '✅', label: 'Symbole',
    emojis: ['✅','☑️','🔘','🔲','🔳','⬛','⬜','◼️','◻️','◾','◽','▪️','▫️','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔁','🔂','▶️','⏩','⏭️','⏯️','◀️','⏪','⏮️','🔼','⏫','🔽','⏬','⏸️','⏹️','⏺️','🎦','🔅','🔆','📶','🛜','📳','📴','♀️','♂️','⚧️','✖️','➕','➖','➗','🟰','♾️','‼️','⁉️','❓','❔','❕','❗','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','❌','❎','🚫','🔞','📵','🚳','🚭','🚯','🚱','🚷','📵','🔕','🔇','💯','🆚','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔠','🔡','🔢','🔣','🔤','🅰️','🅱️','🆎','🆑','🅾️','🆘','❓','❔','❕','❗','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️','❤️','🧡','💛','💚','💙','🩵','💜','🤎','🖤','🩶','🤍','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🪯','🕉️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','🛑','⛔','🚫'],
  },
]

// Get recently used from localStorage
function getRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('emoji_recent') || '[]')
  } catch { return [] }
}

function saveRecent(emoji: string) {
  if (typeof window === 'undefined') return
  try {
    const recent = getRecent().filter((e) => e !== emoji)
    recent.unshift(emoji)
    localStorage.setItem('emoji_recent', JSON.stringify(recent.slice(0, 28)))
  } catch {}
}

interface Props {
  value: string
  onChange: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ value, onChange, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(1) // default: smileys
  const [recent, setRecent] = useState<string[]>(getRecent)

  const allEmojis = useMemo(() => CATEGORIES.flatMap((c) => c.emojis), [])

  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    // Simple: return all emojis that match the search term (emoji itself)
    // For a real search, you'd need an emoji name database
    return allEmojis.filter((e) => e.includes(search))
  }, [search, allEmojis])

  const displayedCategory = activeCategory === 0
    ? recent
    : CATEGORIES[activeCategory].emojis

  const displayed = searchResults ?? displayedCategory

  function handleSelect(emoji: string) {
    saveRecent(emoji)
    setRecent(getRecent())
    onChange(emoji)
    onClose()
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E0E0DE',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid #F0F0EE' }}>
        <Search size={14} style={{ color: '#999', flexShrink: 0 }} />
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Emoji suchen…"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#111111' }}
        />
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {/* Category tabs */}
      {!search && (
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #F0F0EE', scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(idx)}
              title={cat.label}
              style={{
                flexShrink: 0,
                padding: '8px 11px',
                background: 'none',
                border: 'none',
                borderBottom: activeCategory === idx ? '2px solid #FF1C47' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: 17,
                lineHeight: 1,
                transition: 'border-color 0.15s',
                opacity: activeCategory === idx ? 1 : 0.5,
              }}
            >
              {idx === 0 ? '🕐' : cat.emojis[0]}
            </button>
          ))}
        </div>
      )}

      {/* Category label */}
      {!search && (
        <div style={{ padding: '6px 12px 2px', color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {CATEGORIES[activeCategory].label}
        </div>
      )}

      {/* Emoji grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1, padding: '6px 8px 10px', maxHeight: 220, overflowY: 'auto' }}>
        {displayed.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0', color: '#999', fontSize: 13 }}>
            {activeCategory === 0 ? 'Noch keine verwendet' : 'Keine Ergebnisse'}
          </div>
        ) : displayed.map((emoji, i) => (
          <button
            key={i}
            onClick={() => handleSelect(emoji)}
            style={{
              fontSize: 20,
              lineHeight: 1,
              padding: '5px 3px',
              borderRadius: 8,
              background: emoji === value ? 'rgba(255,28,71,0.1)' : 'transparent',
              border: emoji === value ? '1.5px solid rgba(255,28,71,0.3)' : '1.5px solid transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { if (emoji !== value) (e.currentTarget as HTMLElement).style.background = '#F2F2F0' }}
            onMouseLeave={(e) => { if (emoji !== value) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
