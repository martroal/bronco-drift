-- 004_psicologos_modulo.sql
-- 2026-05-19: Schema completo del módulo Freud (psicólogos).
-- 4 tablas: pacientes, sesiones, tags y la relación N:M sesion_tags.
-- Todas con RLS = user_id auth.uid(). Foreign keys con ON DELETE CASCADE.
-- Índices para búsqueda full-text en español y sort por fecha.

-- ============================================================
-- 1. psicologos_pacientes
-- ============================================================
create table if not exists psicologos_pacientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  fecha_nacimiento date,
  primera_sesion date,
  motivo_consulta text,
  estado text not null default 'activo' check (estado in ('activo','pausa','alta')),
  proxima_sesion timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists psicologos_pacientes_user_idx
  on psicologos_pacientes (user_id);

create index if not exists psicologos_pacientes_proxima_idx
  on psicologos_pacientes (user_id, proxima_sesion)
  where proxima_sesion is not null;

alter table psicologos_pacientes enable row level security;

drop policy if exists "owner full access" on psicologos_pacientes;
create policy "owner full access"
  on psicologos_pacientes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 2. psicologos_sesiones
-- ============================================================
create table if not exists psicologos_sesiones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paciente_id uuid not null references psicologos_pacientes(id) on delete cascade,
  fecha date not null,
  tema_central text,
  tarea_propuesta text,
  estado_emocional text,
  notas_libres text,
  plan_proxima text,
  created_at timestamptz not null default now()
);

create index if not exists psicologos_sesiones_paciente_fecha_idx
  on psicologos_sesiones (paciente_id, fecha desc);

create index if not exists psicologos_sesiones_user_fecha_idx
  on psicologos_sesiones (user_id, fecha desc);

-- Full-text search en español sobre todos los campos textuales de la sesión.
-- GIN index acelera la búsqueda libre del psicólogo.
create index if not exists psicologos_sesiones_fts_idx
  on psicologos_sesiones using gin (
    to_tsvector(
      'spanish',
      coalesce(tema_central,'') || ' ' ||
      coalesce(tarea_propuesta,'') || ' ' ||
      coalesce(estado_emocional,'') || ' ' ||
      coalesce(notas_libres,'') || ' ' ||
      coalesce(plan_proxima,'')
    )
  );

alter table psicologos_sesiones enable row level security;

drop policy if exists "owner full access" on psicologos_sesiones;
create policy "owner full access"
  on psicologos_sesiones for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 3. psicologos_tags
-- ============================================================
create table if not exists psicologos_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  color text not null default '#78350f',
  created_at timestamptz not null default now(),
  unique (user_id, nombre)
);

create index if not exists psicologos_tags_user_idx
  on psicologos_tags (user_id);

alter table psicologos_tags enable row level security;

drop policy if exists "owner full access" on psicologos_tags;
create policy "owner full access"
  on psicologos_tags for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 4. psicologos_sesion_tags (N:M)
-- ============================================================
create table if not exists psicologos_sesion_tags (
  sesion_id uuid not null references psicologos_sesiones(id) on delete cascade,
  tag_id uuid not null references psicologos_tags(id) on delete cascade,
  primary key (sesion_id, tag_id)
);

create index if not exists psicologos_sesion_tags_tag_idx
  on psicologos_sesion_tags (tag_id);

alter table psicologos_sesion_tags enable row level security;

-- RLS sobre la pivot: usuario tiene acceso si es dueño de la sesión.
drop policy if exists "owner full access via sesion" on psicologos_sesion_tags;
create policy "owner full access via sesion"
  on psicologos_sesion_tags for all
  using (
    exists (
      select 1 from psicologos_sesiones s
      where s.id = sesion_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from psicologos_sesiones s
      where s.id = sesion_id and s.user_id = auth.uid()
    )
  );
