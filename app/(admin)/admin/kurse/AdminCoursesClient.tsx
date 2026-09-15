'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Plus, Eye, EyeOff, Lock, Unlock } from 'lucide-react'

interface Course {
  id: string
  title: string
  category: string | null
  is_premium: boolean
  is_published: boolean
  sort_order: number
}

const CATEGORIES = ['Stressbewältigung', 'Selbstverwirklichung', 'Mentale Stärke', 'Fokusarbeit', 'Prokrastination', 'Routinen', 'Selbstbewusstsein']

export function AdminCoursesClient({ courses: initialCourses }: { courses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState(CATEGORIES[0])
  const [newPremium, setNewPremium] = useState(false)

  async function addCourse() {
    if (!newTitle.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('courses')
      .insert({ title: newTitle, category: newCategory, is_premium: newPremium, is_published: false, sort_order: courses.length + 1 })
      .select()
      .single()
    if (data) {
      setCourses((prev) => [...prev, data])
      setNewTitle('')
      toast({ title: 'Kurs angelegt', variant: 'success' })
    }
  }

  async function togglePublished(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('courses').update({ is_published: !current }).eq('id', id)
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, is_published: !current } : c))
    toast({ title: `Kurs ${!current ? 'veröffentlicht' : 'versteckt'}`, variant: 'success' })
  }

  async function togglePremium(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('courses').update({ is_premium: !current }).eq('id', id)
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, is_premium: !current } : c))
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black">Kursverwaltung</h2>

      <div className="bg-white rounded-2xl border border-border p-4">
        <h3 className="font-bold text-sm mb-3">Neuen Kurs anlegen</h3>
        <div className="flex flex-col gap-2">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Kurstitel" />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full h-12 rounded-xl border-2 border-border px-3 text-sm focus:outline-none focus:border-primary"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={newPremium} onChange={(e) => setNewPremium(e.target.checked)} className="w-4 h-4 accent-primary" />
            Premium-Kurs
          </label>
          <Button onClick={addCourse}><Plus size={16} /> Kurs anlegen</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-bold text-sm">{course.title}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{course.category}</Badge>
                  {course.is_premium && <Badge variant="premium" className="text-[10px]">Premium</Badge>}
                  {course.is_published
                    ? <Badge variant="success" className="text-[10px]">Veröffentlicht</Badge>
                    : <Badge variant="outline" className="text-[10px]">Entwurf</Badge>
                  }
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" size="sm" onClick={() => togglePublished(course.id, course.is_published)} className="flex-1 text-xs">
                {course.is_published ? <><EyeOff size={12} /> Verstecken</> : <><Eye size={12} /> Veröffentlichen</>}
              </Button>
              <Button variant="outline" size="sm" onClick={() => togglePremium(course.id, course.is_premium)} className="flex-1 text-xs">
                {course.is_premium ? <><Unlock size={12} /> Free</>: <><Lock size={12} /> Premium</>}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
