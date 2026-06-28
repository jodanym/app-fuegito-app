-- =====================================================================
-- Ajuste: las lecciones son de LECTURA PUBLICA (anon + authenticated).
-- El contenido del curriculo no es sensible. Los limites del freemium
-- (cuantas lecciones por dia) se controlan en la logica de la app, no aqui.
-- La escritura sigue restringida (solo admin con service_role / migraciones).
-- =====================================================================
drop policy if exists lessons_read on public.lessons;
create policy lessons_read on public.lessons
  for select to anon, authenticated
  using (true);
