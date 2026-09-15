'use client'

interface Avatar {
  id: string
  name: string
  icon_emoji: string
  color: string
  description: string
}

interface AvatarPickerProps {
  avatars: Avatar[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function AvatarPicker({ avatars, selectedId, onSelect }: AvatarPickerProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {avatars.map((avatar) => {
        const isSelected = avatar.id === selectedId
        return (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            style={{
              padding: '16px 14px',
              borderRadius: 16,
              border: isSelected ? '1.5px solid rgba(255,28,71,0.5)' : '1px solid #E8E8E5',
              background: isSelected ? 'rgba(255,28,71,0.05)' : '#FFFFFF',
              boxShadow: isSelected ? '0 2px 12px rgba(255,28,71,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 26 }}>{avatar.icon_emoji}</span>
              {isSelected && (
                <span style={{ color: '#FF1C47', fontSize: 14, fontWeight: 900 }}>✓</span>
              )}
            </div>
            <p style={{ color: '#111111', fontWeight: 800, fontSize: 13 }}>{avatar.name}</p>
            <p style={{ color: '#888', fontSize: 11, marginTop: 3, lineHeight: 1.4 }}>{avatar.description}</p>
          </button>
        )
      })}
    </div>
  )
}
