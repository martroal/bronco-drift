-- 005_contratos_documentos.sql
-- 2026-05-19: Tabla del módulo Firma Digital Simple.
--
-- Una sola tabla con dos firmantes inline (parte_a = creador, parte_b = otra persona
-- que llega por link público sin login). El link_firma_token es un UUID v4 que
-- funciona como capability URL: solo quien tiene el token puede ver/firmar.
--
-- Hash del documento se calcula al pasar de borrador a enviado para que cualquier
-- modificación posterior se note. PDF final se genera del lado cliente con html2pdf.
--
-- RLS pragmática: el dueño tiene full access; el público con token puede SELECT
-- y UPDATE solo cuando el doc está en estado 'enviado'. Atacantes no pueden
-- adivinar tokens (UUID v4 = 122 bits entropy).

create table if not exists contratos_documentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  titulo text not null,
  template_slug text,
  contenido_md text not null,
  variables jsonb not null default '{}'::jsonb,
  estado text not null default 'borrador'
    check (estado in ('borrador', 'enviado', 'firmado', 'cancelado')),

  -- Parte A: creador del contrato
  parte_a_nombre text,
  parte_a_email text,
  parte_a_firma_data text,
  parte_a_firma_tipo text check (parte_a_firma_tipo in ('dibujo', 'tipeo')),
  parte_a_firmado_at timestamptz,
  parte_a_ip text,
  parte_a_user_agent text,

  -- Parte B: la otra persona que firma vía link público
  parte_b_nombre text,
  parte_b_email text,
  parte_b_firma_data text,
  parte_b_firma_tipo text check (parte_b_firma_tipo in ('dibujo', 'tipeo')),
  parte_b_firmado_at timestamptz,
  parte_b_ip text,
  parte_b_user_agent text,

  link_firma_token text unique,
  hash_documento text,

  created_at timestamptz not null default now()
);

create index if not exists contratos_documentos_user_idx
  on contratos_documentos (user_id);

create index if not exists contratos_documentos_token_idx
  on contratos_documentos (link_firma_token)
  where link_firma_token is not null;

create index if not exists contratos_documentos_estado_idx
  on contratos_documentos (user_id, estado);

alter table contratos_documentos enable row level security;

-- 1. Dueño tiene full access sobre sus contratos.
drop policy if exists "owner full access" on contratos_documentos;
create policy "owner full access"
  on contratos_documentos for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2. Anyone con token puede leer docs en estado 'enviado' (para la pagina de firma).
-- La aplicación filtra por token específico; atacantes no pueden adivinar UUIDs.
drop policy if exists "public read enviado por token" on contratos_documentos;
create policy "public read enviado por token"
  on contratos_documentos for select
  to anon, authenticated
  using (estado = 'enviado' and link_firma_token is not null);

-- 3. Anyone puede UPDATE docs en estado 'enviado' (para que la otra parte firme).
-- El cliente filtra por token; la app solo permite escribir en columnas parte_b_*.
-- IMPORTANTE: el with check debe permitir 'firmado' porque ese es el estado al
-- que pasa después del UPDATE. Si solo permitiera 'enviado', el UPDATE fallaría
-- justo al firmar (lección aprendida 2026-05-19).
drop policy if exists "public sign por token" on contratos_documentos;
create policy "public sign por token"
  on contratos_documentos for update
  to anon, authenticated
  using (estado = 'enviado' and link_firma_token is not null)
  with check (estado in ('enviado', 'firmado') and link_firma_token is not null);
