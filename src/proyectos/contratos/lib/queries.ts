import { supabase } from '@/lib/supabase';
import type { Contrato } from './types';
import * as local from './queriesLocal';

export type { Contrato, EstadoContrato, FirmaTipo, AuditTrailEntry } from './types';

function sb() {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

/* ============================================================
 * Listado y detalle
 * ============================================================ */

export async function listarContratos(userId: string | null): Promise<Contrato[]> {
  if (!userId) return local.listarContratos();
  const { data, error } = await sb()
    .from('contratos_documentos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Contrato[];
}

export async function obtenerContrato(
  userId: string | null,
  id: string,
): Promise<Contrato | null> {
  if (!userId) return local.obtenerContrato(id);
  const { data, error } = await sb()
    .from('contratos_documentos')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Contrato | null;
}

/* ============================================================
 * Creación / edición
 * ============================================================ */

export async function crearContrato(
  userId: string | null,
  payload: {
    titulo: string;
    template_slug: string | null;
    contenido_md: string;
    variables: Record<string, string>;
  },
): Promise<Contrato> {
  if (!userId) return local.crearContrato(payload);
  const { data, error } = await sb()
    .from('contratos_documentos')
    .insert({
      user_id: userId,
      titulo: payload.titulo,
      template_slug: payload.template_slug,
      contenido_md: payload.contenido_md,
      variables: payload.variables,
      estado: 'borrador',
    })
    .select()
    .single();
  if (error) throw error;
  return data as Contrato;
}

export async function actualizarContrato(
  userId: string | null,
  id: string,
  parche: Partial<Contrato>,
): Promise<Contrato> {
  if (!userId) return local.actualizarContrato(id, parche);
  const { data, error } = await sb()
    .from('contratos_documentos')
    .update(parche)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Contrato;
}

export async function eliminarContrato(
  userId: string | null,
  id: string,
): Promise<void> {
  if (!userId) return local.eliminarContrato(id);
  const { error } = await sb().from('contratos_documentos').delete().eq('id', id);
  if (error) throw error;
}

/* ============================================================
 * Página pública de firma (NO requiere userId)
 * Se accede solo con el token. RLS permite SELECT/UPDATE en docs
 * con estado 'enviado' (configurada en migration 005).
 * ============================================================ */

export async function obtenerPorToken(token: string): Promise<Contrato | null> {
  const { data, error } = await sb()
    .from('contratos_documentos')
    .select('*')
    .eq('link_firma_token', token)
    .eq('estado', 'enviado')
    .maybeSingle();
  if (error) throw error;
  return data as Contrato | null;
}

export async function firmarComoParteB(
  token: string,
  payload: {
    nombre: string;
    email: string | null;
    firma_data: string;
    firma_tipo: 'dibujo' | 'tipeo';
    ip: string | null;
    user_agent: string;
  },
): Promise<void> {
  const { error } = await sb()
    .from('contratos_documentos')
    .update({
      parte_b_nombre: payload.nombre,
      parte_b_email: payload.email,
      parte_b_firma_data: payload.firma_data,
      parte_b_firma_tipo: payload.firma_tipo,
      parte_b_firmado_at: new Date().toISOString(),
      parte_b_ip: payload.ip,
      parte_b_user_agent: payload.user_agent,
      estado: 'firmado',
    })
    .eq('link_firma_token', token)
    .eq('estado', 'enviado');
  if (error) throw error;
}
