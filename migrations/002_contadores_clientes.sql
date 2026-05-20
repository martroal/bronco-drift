-- 002_contadores_clientes.sql
-- 2026-05-19: Tabla de clientes de cada contador (módulo Vencet).
-- Un cliente representa una empresa o persona que el contador atiende.
-- El CUIT es la clave de negocio (un mismo user_id no puede tener dos clientes con el mismo CUIT).
-- Esto permite que el import CSV haga upsert por (user_id, cuit) sin duplicar.

create table if not exists contadores_clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  cuit text not null,
  email text,
  created_at timestamptz not null default now(),
  unique (user_id, cuit)
);

create index if not exists contadores_clientes_user_idx
  on contadores_clientes (user_id);

alter table contadores_clientes enable row level security;

drop policy if exists "owner full access" on contadores_clientes;
create policy "owner full access"
  on contadores_clientes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
