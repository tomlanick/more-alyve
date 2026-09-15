'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Bell, User, Loader2 } from 'lucide-react'

interface Props {
  userId: string
  displayName: string
  notificationMorning: string
  notificationEvening: string
  notificationsEnabled: boolean
}

export function EinstellungenClient({
  userId,
  displayName: initialName,
  notificationMorning: initialMorning,
  notificationEvening: initialEvening,
  notificationsEnabled: initialEnabled,
}: Props) {
  const [displayName, setDisplayName] = useState(initialName)
  const [morningTime, setMorningTime] = useState(initialMorning.slice(0, 5))
  const [eveningTime, setEveningTime] = useState(initialEvening.slice(0, 5))
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      notification_morning_time: morningTime,
      notification_evening_time: eveningTime,
      notifications_enabled: notificationsEnabled,
    }).eq('id', userId)
    setSaving(false)
    if (error) {
      console.error('Save error:', error)
      toast({ title: `Fehler: ${error.message}`, variant: 'danger' })
    } else {
      toast({ title: 'Einstellungen gespeichert!', variant: 'success' })
    }
  }

  async function handleEnableNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      toast({ title: 'Push-Benachrichtigungen werden auf diesem Gerät nicht unterstützt.', variant: 'default' })
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      toast({ title: 'Benachrichtigungen aktiviert!', variant: 'success' })
    } else {
      toast({ title: 'Benachrichtigungen wurden abgelehnt.', variant: 'default' })
    }
  }

  const inputStyle = {
    background: '#F2F2F0',
    border: '1px solid #E0E0DE',
    borderRadius: 10,
    color: '#111111',
    fontSize: 14,
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
  }

  const labelStyle = {
    color: '#666',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
    display: 'block',
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Profil */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <User size={16} style={{ color: '#FF1C47' }} />
          <span style={{ color: '#111111', fontWeight: 800, fontSize: 14 }}>Profil</span>
        </div>
        <label style={labelStyle}>Anzeigename</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Dein Name"
          style={inputStyle}
        />
      </div>

      {/* Benachrichtigungen */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} style={{ color: '#FF1C47' }} />
            <span style={{ color: '#111111', fontWeight: 800, fontSize: 14 }}>Push-Erinnerungen</span>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: notificationsEnabled ? 'rgba(255,28,71,0.8)' : '#E0E0DE',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: 3,
              left: notificationsEnabled ? 26 : 3,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {!notificationsEnabled && (
          <button
            onClick={handleEnableNotifications}
            style={{ background: '#F2F2F0', border: '1px solid #E0E0DE', borderRadius: 10, color: '#666', fontSize: 13, fontWeight: 600, padding: '10px', width: '100%', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Bell size={14} />
            Benachrichtigungen erlauben
          </button>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>☀️ Morgenroutine-Erinnerung</label>
            <input
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              disabled={!notificationsEnabled}
              style={{ ...inputStyle, opacity: notificationsEnabled ? 1 : 0.4 }}
            />
          </div>
          <div>
            <label style={labelStyle}>🌙 Abendroutine-Erinnerung</label>
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => setEveningTime(e.target.value)}
              disabled={!notificationsEnabled}
              style={{ ...inputStyle, opacity: notificationsEnabled ? 1 : 0.4 }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saving ? '#F2F2F0' : 'linear-gradient(135deg, #FF1C47, #C8003A)',
          border: 'none',
          borderRadius: 14,
          color: saving ? '#999' : '#FFFFFF',
          fontSize: 15,
          fontWeight: 800,
          padding: '14px',
          cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: saving ? 'none' : '0 4px 20px rgba(255,28,71,0.3)',
        }}
      >
        {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Speichern…</> : 'Speichern'}
      </button>
    </div>
  )
}
