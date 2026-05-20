-- 001_bronco_user_nichos.sql
-- 2026-05-19: Tabla de suscripciones de usuarios a módulos.
-- Permite que un mismo auth.users use varios nichos (contadores, abogados, etc.)
-- sin re-registrarse. Cada fila representa una suscripción activa al módulo.

create table if not exists bronco_user_nichos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nicho text not null,
  created_at timestamptz not null default now(),
  unique (user_id, nicho)
);

create index if not exists bronco_user_nichos_user_idx
  on bronco_user_nichos (user_id);

alter table bronco_user_nichos enable row level security;

drop policy if exists "owner full access" on bronco_user_nichos;
create policy "owner full access"
  on bronco_user_nichos for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
