-- 003_contadores_obligaciones.sql
-- 2026-05-19: Tabla de obligaciones (vencimientos) de cada cliente.
-- Una fila = un vencimiento puntual de un impuesto para un cliente.
-- estado tiene CHECK constraint para evitar valores inválidos.
-- Índice compuesto (user_id, proxima_fecha) para el sort del panel principal.

create table if not exists contadores_obligaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references contadores_clientes(id) on delete cascade,
  impuesto text not null,
  proxima_fecha date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'presentado')),
  created_at timestamptz not null default now()
);

create index if not exists contadores_obligaciones_user_fecha_idx
  on contadores_obligaciones (user_id, proxima_fecha);

create index if not exists contadores_obligaciones_cliente_idx
  on contadores_obligaciones (cliente_id);

alter table contadores_obligaciones enable row level security;

drop policy if exists "owner full access" on contadores_obligaciones;
create policy "owner full access"
  on contadores_obligaciones for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
