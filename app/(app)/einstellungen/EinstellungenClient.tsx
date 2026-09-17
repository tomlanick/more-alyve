'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Bell, User, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'

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
  const [showPhaseConfirm, setShowPhaseConfirm] = useState(false)
  const [startingPhase, setStartingPhase] = useState(false)

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

  async function handleNewPhase() {
    setStartingPhase(true)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    // Zähle alle bisherigen Phasen
    const { count } = await supabase
      .from('user_phases')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Schließe alle offenen Phasen
    const { data: openPhases } = await supabase
      .from('user_phases')
      .select('id')
      .eq('user_id', userId)
      .is('ended_at', null)

    if (openPhases && openPhases.length > 0) {
      await supabase
        .from('user_phases')
        .update({ ended_at: today })
        .in('id', openPhases.map((p) => p.id))
    }

    const newPhaseName = `Phase ${(count ?? 0) + 1}`

    const { error } = await supabase.from('user_phases').insert({
      user_id: userId,
      name: newPhaseName,
      started_at: today,
    })

    setStartingPhase(false)
    setShowPhaseConfirm(false)

    if (error) {
      toast({ title: `Fehler: ${error.message}`, variant: 'danger' })
    } else {
      toast({ title: `${newPhaseName} gestartet! Deine Wertung beginnt neu.`, variant: 'success' })
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

      {/* Phase neu starten */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <RefreshCw size={16} style={{ color: '#FF6B00' }} />
          <span style={{ color: '#111111', fontWeight: 800, fontSize: 14 }}>Phase neu starten</span>
        </div>
        <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>
          Starte eine neue Bewertungsphase — dein Streak, Punkte und Tagebuch-Verlauf beginnen bei null. Deine gesamte History bleibt im Profil sichtbar.
        </p>

        {!showPhaseConfirm ? (
          <button
            onClick={() => setShowPhaseConfirm(true)}
            style={{
              background: 'rgba(255,107,0,0.08)',
              border: '1px solid rgba(255,107,0,0.3)',
              borderRadius: 10,
              color: '#FF6B00',
              fontSize: 13,
              fontWeight: 700,
              padding: '10px 16px',
              width: '100%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <RefreshCw size={14} />
            Neue Phase starten
          </button>
        ) : (
          <div style={{
            background: 'rgba(255,107,0,0.06)',
            border: '1px solid rgba(255,107,0,0.25)',
            borderRadius: 12,
            padding: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
              <AlertTriangle size={16} style={{ color: '#FF6B00', flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: '#111', fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
                Bist du sicher? Dein aktueller Streak und Punkte werden für diese Phase abgeschlossen und neu gezählt.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowPhaseConfirm(false)}
                disabled={startingPhase}
                style={{
                  flex: 1,
                  background: '#F2F2F0',
                  border: '1px solid #E0E0DE',
                  borderRadius: 10,
                  color: '#666',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '10px',
                  cursor: 'pointer',
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleNewPhase}
                disabled={startingPhase}
                style={{
                  flex: 1,
                  background: startingPhase ? '#F2F2F0' : 'linear-gradient(135deg, #FF6B00, #E05500)',
                  border: 'none',
                  borderRadius: 10,
                  color: startingPhase ? '#999' : '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '10px',
                  cursor: startingPhase ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {startingPhase ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Starte…</> : 'Jetzt starten'}
              </button>
            </div>
          </div>
        )}
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
