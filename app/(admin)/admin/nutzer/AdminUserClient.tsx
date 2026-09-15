'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { UserPlus, RefreshCw, Shield, Crown, Loader2 } from 'lucide-react'

interface User {
  id: string
  display_name: string | null
  role: string
  premium: boolean
  must_change_password: boolean
  created_at: string
}

export function AdminUserClient({ users: initialUsers, currentUserId }: { users: User[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreateUser() {
    if (!newEmail.trim() || !newName.trim()) return
    setCreating(true)

    // Nutzeranlage über API Route (braucht service_role key)
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, displayName: newName }),
    })
    const data = await res.json()
    setCreating(false)

    if (!res.ok) {
      toast({ title: data.error ?? 'Fehler beim Anlegen', variant: 'danger' })
      return
    }

    toast({ title: `Nutzer ${newEmail} angelegt. Passwort: MoreAlyve2026!`, variant: 'success' })
    setNewEmail('')
    setNewName('')
    setUsers((prev) => [data.user, ...prev])
  }

  async function handleTogglePremium(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('profiles').update({ premium: !current }).eq('id', id)
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, premium: !current } : u))
    toast({ title: `Premium ${!current ? 'aktiviert' : 'deaktiviert'}`, variant: 'success' })
  }

  async function handleResetPassword(id: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ must_change_password: true }).eq('id', id)
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, must_change_password: true } : u))
    toast({ title: 'Passwort-Reset gesetzt', variant: 'success' })
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-foreground">Nutzerverwaltung</h2>

      {/* Neuen Nutzer anlegen */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <UserPlus size={16} className="text-primary" />
          Neuen Nutzer anlegen
        </h3>
        <div className="flex flex-col gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Anzeigename"
          />
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="E-Mail-Adresse"
          />
          <p className="text-xs text-muted">
            Standard-Passwort: <code className="bg-surface px-1 rounded">MoreAlyve2026!</code> — Nutzer muss es beim ersten Login ändern.
          </p>
          <Button onClick={handleCreateUser} disabled={creating || !newEmail || !newName}>
            {creating ? <><Loader2 size={16} className="animate-spin" /> Anlegen…</> : 'Nutzer anlegen'}
          </Button>
        </div>
      </div>

      {/* Nutzerliste */}
      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-sm font-bold text-muted flex-shrink-0">
                {(user.display_name ?? '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground">{user.display_name ?? '(kein Name)'}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.role === 'admin' && <Badge variant="default" className="text-[10px]"><Shield size={9} className="mr-0.5" />Admin</Badge>}
                  {user.premium && <Badge variant="success" className="text-[10px]"><Crown size={9} className="mr-0.5" />Premium</Badge>}
                  {user.must_change_password && <Badge variant="warning" className="text-[10px]">Passwort-Reset</Badge>}
                </div>
                <p className="text-[10px] text-muted mt-1">
                  Seit {new Date(user.created_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
            {user.id !== currentUserId && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTogglePremium(user.id, user.premium)}
                  className="flex-1 text-xs"
                >
                  <Crown size={12} />
                  {user.premium ? 'Premium entfernen' : 'Premium geben'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetPassword(user.id)}
                  className="flex-1 text-xs"
                >
                  <RefreshCw size={12} />
                  PW zurücksetzen
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
