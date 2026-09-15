-- ============================================================
-- More Alyve – Seed-Daten
-- ============================================================

-- ============================================================
-- AVATAR PROFILES
-- ============================================================
insert into public.avatar_profiles (name, description, icon_emoji, color, sort_order) values
  ('Sportler', 'Fokus auf körperliche Gesundheit, Bewegung und gesunde Ernährung', '🏋️', '#22C55E', 1),
  ('Vertriebler', 'Täglich messbare Vertriebsziele erreichen und Netzwerk aufbauen', '💼', '#3B82F6', 2),
  ('Mentalistin', 'Geistige Stärke, Meditation und innere Balance', '🧘', '#8B5CF6', 3),
  ('Lernender', 'Kontinuierliches Wachstum durch Bücher, Kurse und neue Fähigkeiten', '📚', '#F59E0B', 4),
  ('Unternehmer', 'High-Performance-Routinen für unternehmerischen Erfolg', '🚀', '#FF1C47', 5);

-- ============================================================
-- HABIT TEMPLATES
-- ============================================================

-- Sportler
insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Sport / Training', 'Mindestens 30 Minuten Bewegung', '🏃', 'Gesundheit', true, 1
from public.avatar_profiles where name = 'Sportler';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Bewusste Ernährung', 'Gesund und ausgewogen essen', '🥗', 'Gesundheit', true, 2
from public.avatar_profiles where name = 'Sportler';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, '7h Schlaf', 'Mindestens 7 Stunden schlafen', '😴', 'Gesundheit', true, 3
from public.avatar_profiles where name = 'Sportler';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, '10 Seiten lesen', 'Täglich mindestens 10 Seiten lesen', '📖', 'Wissen', true, 4
from public.avatar_profiles where name = 'Sportler';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Positiver Tag', 'Etwas Positives im Tag finden und festhalten', '☀️', 'Mindset', true, 5
from public.avatar_profiles where name = 'Sportler';

-- Vertriebler
insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Kontaktgespräche', 'Neue Kontakte angesprochen', '📞', 'Vertrieb', true, 1
from public.avatar_profiles where name = 'Vertriebler';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Beratungen gehabt', 'Beratungsgespräche durchgeführt', '🤝', 'Vertrieb', true, 2
from public.avatar_profiles where name = 'Vertriebler';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Neukunden gewonnen', 'Neuen Kunden abgeschlossen', '🏆', 'Vertrieb', true, 3
from public.avatar_profiles where name = 'Vertriebler';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Geld verdient', 'Umsatz generiert heute', '💰', 'Vertrieb', true, 4
from public.avatar_profiles where name = 'Vertriebler';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Termine vereinbart', 'Follow-up Termine gesetzt', '📅', 'Vertrieb', true, 5
from public.avatar_profiles where name = 'Vertriebler';

-- Mentalistin
insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Meditation', 'Mindestens 10 Minuten meditiert', '🧘', 'Mindset', true, 1
from public.avatar_profiles where name = 'Mentalistin';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Journaling', 'Gedanken und Gefühle aufgeschrieben', '📓', 'Mindset', true, 2
from public.avatar_profiles where name = 'Mentalistin';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Dankbarkeit', '3 Dinge aufgeschrieben, für die ich dankbar bin', '🙏', 'Mindset', true, 3
from public.avatar_profiles where name = 'Mentalistin';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Affirmationen', 'Positive Affirmationen gesprochen', '✨', 'Mindset', true, 4
from public.avatar_profiles where name = 'Mentalistin';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Bewusste Atmung', 'Atemübungen oder Breathwork gemacht', '💨', 'Gesundheit', true, 5
from public.avatar_profiles where name = 'Mentalistin';

-- Lernender
insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, '10 Seiten lesen', 'Täglich mindestens 10 Seiten lesen', '📖', 'Wissen', true, 1
from public.avatar_profiles where name = 'Lernender';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Online-Kurs', 'Kurs-Lektion oder Video angeschaut', '🎓', 'Wissen', true, 2
from public.avatar_profiles where name = 'Lernender';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Neue Fähigkeit üben', 'Aktiv eine Fähigkeit geübt', '🎯', 'Wissen', true, 3
from public.avatar_profiles where name = 'Lernender';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Podcast', 'Lehrreichen Podcast gehört', '🎙️', 'Wissen', true, 4
from public.avatar_profiles where name = 'Lernender';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Reflektion', 'Tag reflektiert und Learnings notiert', '💡', 'Mindset', true, 5
from public.avatar_profiles where name = 'Lernender';

-- Unternehmer
insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Morgenroutine', 'Morgenroutine vollständig abgeschlossen', '🌅', 'Routine', true, 1
from public.avatar_profiles where name = 'Unternehmer';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Deep Work Block', 'Mindestens 2h fokussierte Arbeit', '⚡', 'Produktivität', true, 2
from public.avatar_profiles where name = 'Unternehmer';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Netzwerk-Kontakt', 'Wichtigen Kontakt gepflegt oder aufgebaut', '🌐', 'Netzwerk', true, 3
from public.avatar_profiles where name = 'Unternehmer';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Ziel-Review', 'Wochenziele und Fortschritt geprüft', '🎯', 'Strategie', true, 4
from public.avatar_profiles where name = 'Unternehmer';

insert into public.habit_templates (avatar_id, name, description, icon_emoji, category, is_default, sort_order)
select id, 'Körper-Check', 'Sport, Ernährung und Schlaf im grünen Bereich', '💪', 'Gesundheit', true, 5
from public.avatar_profiles where name = 'Unternehmer';

-- ============================================================
-- ROUTINE PROMPTS – Morgenroutine
-- ============================================================
insert into public.routine_prompts (type, prompt_text, placeholder_text, sort_order) values
  ('morning', 'Ich bin dankbar für …', 'Was macht dich heute dankbar?', 1),
  ('morning', 'Der Tag wird heute wundervoll, weil …', 'Was macht diesen Tag besonders?', 2),
  ('morning', 'An diesem Ziel arbeite ich heute …', 'Welches Ziel verfolgst du heute?', 3),
  ('morning', 'Das ist heute wichtig, weil …', 'Warum ist dieses Ziel jetzt wichtig?', 4),
  ('morning', 'Das Gute, das ich heute für mich tun kann …', 'Was tust du heute für dich selbst?', 5);

-- Abendroutine
insert into public.routine_prompts (type, prompt_text, placeholder_text, sort_order) values
  ('evening', 'Dafür bin ich heute dankbar und glücklich …', 'Was hat dich heute glücklich gemacht?', 1),
  ('evening', 'Das wünsche ich mir gerade …', 'Was wünschst du dir für die Zukunft?', 2),
  ('evening', 'Das macht mich erfolgreich …', 'Was treibt deinen Erfolg an?', 3),
  ('evening', 'Was werde ich morgen besser machen …', 'Wo kannst du dich verbessern?', 4),
  ('evening', 'Was habe ich heute gelernt …', 'Welche Erkenntnis nimmst du mit?', 5),
  ('evening', 'Was habe ich heute Gutes für jemanden getan …', 'Wie hast du anderen geholfen?', 6);

-- ============================================================
-- COURSES – Kursstruktur (Platzhalter)
-- ============================================================
insert into public.courses (title, description, category, is_premium, is_published, sort_order) values
  ('Stressbewältigung & innere Ruhe', 'Lerne effektive Techniken, um Stress zu reduzieren und innere Balance zu finden.', 'Stressbewältigung', false, true, 1),
  ('Selbstverwirklichung – Wer willst du sein?', 'Entdecke deine wahren Stärken und baue ein Leben auf, das zu dir passt.', 'Selbstverwirklichung', false, true, 2),
  ('Mentale Stärke aufbauen', 'Entwickle Resilienz und mentale Widerstandsfähigkeit für herausfordernde Zeiten.', 'Mentale Stärke', true, true, 3),
  ('Fokusarbeit & Deep Work', 'Maximiere deine Produktivität durch fokussiertes Arbeiten ohne Ablenkung.', 'Fokusarbeit', true, true, 4),
  ('Prokrastination überwinden', 'Verstehe die Wurzeln des Aufschiebens und brich den Kreislauf für immer.', 'Prokrastination', false, true, 5),
  ('Routinen die wirklich funktionieren', 'Baue Morgen- und Abendroutinen auf, die dein Leben transformieren.', 'Routinen', false, true, 6),
  ('Selbstbewusstsein & Ausstrahlung', 'Stärke dein Selbstbild und tritt mit Überzeugung auf.', 'Selbstbewusstsein', true, true, 7);

-- Beispiel-Kapitel für Kurs 1
insert into public.course_chapters (course_id, title, description, sort_order, is_published)
select id, 'Was ist Stress – und warum ist er nicht dein Feind?', 'Eine wissenschaftliche Einführung in das Stressystem', 1, true
from public.courses where title = 'Stressbewältigung & innere Ruhe';

insert into public.course_chapters (course_id, title, description, sort_order, is_published)
select id, 'Die 4-7-8 Atemtechnik', 'Sofortige Stressreduktion durch bewusste Atmung', 2, true
from public.courses where title = 'Stressbewältigung & innere Ruhe';

insert into public.course_chapters (course_id, title, description, sort_order, is_published)
select id, 'Körper-Scan Meditation', 'Progressive Muskelentspannung für mehr innere Ruhe', 3, true
from public.courses where title = 'Stressbewältigung & innere Ruhe';
