-- =====================================================================
-- Fase 1: PIN de la zona del padre.
-- El PIN es una barrera rapida contra el nino (no una contrasena larga),
-- segun PRD 5.6. Se guarda en la fila del padre (protegida por RLS).
-- Guardamos solo un hash simple (no texto plano).
-- =====================================================================
alter table public.parents
  add column if not exists pin_hash text;
