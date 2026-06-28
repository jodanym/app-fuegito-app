-- =====================================================================
-- Universo de Fueguito — Esquema base de datos (FASE 0)
-- Basado en la Seccion 8.2 del PRD.
-- Privacidad de menores (Seccion 10): del nino solo se guardan APODO y EDAD.
--   Sin nombre legal, sin ubicacion, sin foto. El titular de la cuenta es el adulto.
-- Seguridad: Row Level Security (RLS) activado en todo. Cada padre solo ve
--   sus propios datos y los de sus hijos.
-- Este script es idempotente en lo posible (drop type if exists, if not exists).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tipos (enums): listas cerradas de valores validos.
-- ---------------------------------------------------------------------
do $$ begin
  create type paquete_edad as enum ('chispas', 'brasas', 'llamas');
exception when duplicate_object then null; end $$;

do $$ begin
  create type habilidad as enum ('logica', 'critica', 'resolucion');
exception when duplicate_object then null; end $$;

do $$ begin
  create type modo_leccion as enum ('interactivo', 'audio_narrativo', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tier_suscripcion as enum ('free', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_suscripcion as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2) parents — perfil del adulto titular.
--    La identidad y el email viven en auth.users (Supabase Auth).
--    Esta tabla solo extiende ese usuario.
-- ---------------------------------------------------------------------
create table if not exists public.parents (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) children — perfil del nino bajo un padre.
--    PRIVACIDAD: solo apodo y edad. Nada mas identificable.
-- ---------------------------------------------------------------------
create table if not exists public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references public.parents(id) on delete cascade,
  apodo       text not null,
  edad        smallint not null check (edad >= 0 and edad <= 12),
  paquete     paquete_edad,
  created_at  timestamptz not null default now()
);
create index if not exists idx_children_parent on public.children(parent_id);

-- ---------------------------------------------------------------------
-- 4) learner_profiles — vector de perfil de aprendizaje por nino.
--    4 ejes, escala 0-100. Por defecto 50 (neutro) hasta que el quiz lo defina.
-- ---------------------------------------------------------------------
create table if not exists public.learner_profiles (
  child_id    uuid primary key references public.children(id) on delete cascade,
  modalidad   smallint not null default 50 check (modalidad between 0 and 100),
  entrada     smallint not null default 50 check (entrada between 0 and 100),
  dinamica    smallint not null default 50 check (dinamica between 0 and 100),
  ritmo       smallint not null default 50 check (ritmo between 0 and 100),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5) lessons — metadatos + el CONTENIDO de la leccion como JSON (Seccion 7.2).
--    El contenido NO se programa a mano: vive como datos en la columna content.
-- ---------------------------------------------------------------------
create table if not exists public.lessons (
  id          text primary key,                  -- ej: 'brasas-logica-u1-l3'
  paquete     paquete_edad not null,
  habilidad   habilidad not null,
  objetivo    text not null,
  personaje   text,
  content     jsonb not null,                    -- la leccion completa (5 momentos, modos)
  created_at  timestamptz not null default now()
);
create index if not exists idx_lessons_paquete  on public.lessons(paquete);
create index if not exists idx_lessons_habilidad on public.lessons(habilidad);

-- ---------------------------------------------------------------------
-- 6) progress — registro de cada intento/avance del nino en una leccion.
-- ---------------------------------------------------------------------
create table if not exists public.progress (
  id              uuid primary key default gen_random_uuid(),
  child_id        uuid not null references public.children(id) on delete cascade,
  lesson_id       text not null references public.lessons(id) on delete cascade,
  modo            modo_leccion,
  completado      boolean not null default false,
  resultado       smallint check (resultado between 0 and 100),
  tiempo_segundos integer,
  pistas_usadas   smallint not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_progress_child  on public.progress(child_id);
create index if not exists idx_progress_lesson on public.progress(lesson_id);

-- ---------------------------------------------------------------------
-- 7) skill_mastery — maestria por nino y por habilidad (0-100).
-- ---------------------------------------------------------------------
create table if not exists public.skill_mastery (
  child_id    uuid not null references public.children(id) on delete cascade,
  habilidad   habilidad not null,
  maestria    smallint not null default 0 check (maestria between 0 and 100),
  updated_at  timestamptz not null default now(),
  primary key (child_id, habilidad)
);

-- ---------------------------------------------------------------------
-- 8) subscriptions — estado de suscripcion del padre (Stripe en Fase 1).
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  parent_id               uuid not null references public.parents(id) on delete cascade,
  tier                    tier_suscripcion not null default 'free',
  estado                  estado_suscripcion not null default 'active',
  stripe_customer_id      text,
  stripe_subscription_id  text,
  periodo_fin             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists idx_subscriptions_parent on public.subscriptions(parent_id);

-- ---------------------------------------------------------------------
-- 9) pdf_orders — compras de paquetes PDF (pago unico, maestros).
-- ---------------------------------------------------------------------
create table if not exists public.pdf_orders (
  id                        uuid primary key default gen_random_uuid(),
  parent_id                 uuid not null references public.parents(id) on delete cascade,
  paquete_pdf               text not null,
  stripe_payment_intent_id  text,
  monto_centavos            integer,
  moneda                    text default 'usd',
  descargado                boolean not null default false,
  created_at                timestamptz not null default now()
);
create index if not exists idx_pdf_orders_parent on public.pdf_orders(parent_id);

-- =====================================================================
-- 10) ROW LEVEL SECURITY (RLS)
--     Activamos seguridad por fila en TODAS las tablas. Sin politicas,
--     nadie (con clave anon) puede leer/escribir: por defecto se niega.
-- =====================================================================
alter table public.parents          enable row level security;
alter table public.children         enable row level security;
alter table public.learner_profiles enable row level security;
alter table public.lessons          enable row level security;
alter table public.progress         enable row level security;
alter table public.skill_mastery    enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.pdf_orders       enable row level security;

-- parents: el usuario solo ve/edita SU propia fila.
drop policy if exists parents_self on public.parents;
create policy parents_self on public.parents
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- children: el padre maneja SUS hijos.
drop policy if exists children_own on public.children;
create policy children_own on public.children
  for all to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- Helper: comprueba que un child_id pertenece al padre autenticado.
-- (Se usa en las tablas que cuelgan del nino.)
drop policy if exists learner_profiles_own on public.learner_profiles;
create policy learner_profiles_own on public.learner_profiles
  for all to authenticated
  using (child_id in (select id from public.children where parent_id = auth.uid()))
  with check (child_id in (select id from public.children where parent_id = auth.uid()));

drop policy if exists progress_own on public.progress;
create policy progress_own on public.progress
  for all to authenticated
  using (child_id in (select id from public.children where parent_id = auth.uid()))
  with check (child_id in (select id from public.children where parent_id = auth.uid()));

drop policy if exists skill_mastery_own on public.skill_mastery;
create policy skill_mastery_own on public.skill_mastery
  for all to authenticated
  using (child_id in (select id from public.children where parent_id = auth.uid()))
  with check (child_id in (select id from public.children where parent_id = auth.uid()));

-- subscriptions y pdf_orders: del padre.
drop policy if exists subscriptions_own on public.subscriptions;
create policy subscriptions_own on public.subscriptions
  for all to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

drop policy if exists pdf_orders_own on public.pdf_orders;
create policy pdf_orders_own on public.pdf_orders
  for all to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- lessons: contenido de solo lectura para cualquier usuario autenticado.
-- (La carga de lecciones la hace el administrador con service_role, que omite RLS.)
drop policy if exists lessons_read on public.lessons;
create policy lessons_read on public.lessons
  for select to authenticated
  using (true);

-- =====================================================================
-- 11) Trigger: al registrarse un padre nuevo en auth.users, crear
--     automaticamente su fila en parents y una suscripcion 'free'.
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.parents (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.subscriptions (parent_id, tier, estado)
  values (new.id, 'free', 'active');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Fin del esquema base (Fase 0).
-- =====================================================================
