-- ============================================================
-- Admin-User anlegen: tom@lanick-partner.de
-- WICHTIG: Dieses Script über die Supabase Dashboard SQL Editor
-- ausführen NACHDEM der User über Supabase Auth angelegt wurde.
--
-- Schritt 1: Im Supabase Dashboard unter Authentication > Users
--            einen neuen User anlegen:
--            Email: tom@lanick-partner.de
--            Password: MoreAlyve2026!
--
-- Schritt 2: Dieses SQL im SQL Editor ausführen:
-- ============================================================

update public.profiles
set
  role = 'admin',
  display_name = 'Tom Lanick',
  must_change_password = true
where id = (
  select id from auth.users where email = 'tom@lanick-partner.de'
);

-- Bestätigung
select id, display_name, role, must_change_password
from public.profiles
where id = (select id from auth.users where email = 'tom@lanick-partner.de');
