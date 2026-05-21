import { supabase } from '@/lib/supabase';
import type {
  Paciente,
  Sesion,
  SesionConPaciente,
  SesionConTags,
  Tag,
} from './types';
import * as local from './queriesLocal';

/**
 * Repository híbrido del módulo Freud.
 *
 * - Si `userId` viene como string: usa Supabase (data persiste cross-device).
 * - Si `userId` viene como null: usa localStorage (data solo en este navegador).
 *
 * La firma de cada función acepta `userId: string | null`. Los componentes pasan
 * `user?.id ?? null` sin importarles dónde se persiste. Cuando el usuario se
 * loguea, `lib/migracion.ts` migra la data de localStorage a Supabase.
 */

// Re-export types for convenience
export type { Paciente, Sesion, SesionConTags, SesionConPaciente, Tag, EstadoPaciente } from './types';

function sb() {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

/* ============================================================
 * Pacientes
 * ============================================================ */

export async function listarPacientes(userId: string | null): Promise<Paciente[]> {
  if (!userId) return local.listarPacientes();
  const { data, error } = await sb()
    .from('psicologos_pacientes')
    .select('*')
    .eq('user_id', userId)
    .order('nombre');
  if (error) throw error;
  return (data ?? []) as Paciente[];
}

export async function obtenerPaciente(
  userId: string | null,
  id: string,
): Promise<Paciente | null> {
  if (!userId) return local.obtenerPaciente(id);
  const { data, error } = await sb()
    .from('psicologos_pacientes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Paciente | null;
}

export async function crearPaciente(
  userId: string | null,
  payload: Pick<Paciente, 'nombre' | 'motivo_consulta' | 'primera_sesion'>,
): Promise<Paciente> {
  if (!userId) return local.crearPaciente(payload);
  const { data, error } = await sb()
    .from('psicologos_pacientes')
    .insert({
      user_id: userId,
      nombre: payload.nombre,
      motivo_consulta: payload.motivo_consulta ?? null,
      primera_sesion: payload.primera_sesion ?? null,
      estado: 'activo',
    })
    .select()
    .single();
  if (error) throw error;
  return data as Paciente;
}

export async function actualizarPaciente(
  userId: string | null,
  id: string,
  parche: Partial<Pick<Paciente, 'nombre' | 'motivo_consulta' | 'estado' | 'proxima_sesion' | 'primera_sesion'>>,
): Promise<Paciente> {
  if (!userId) return local.actualizarPaciente(id, parche);
  const { data, error } = await sb()
    .from('psicologos_pacientes')
    .update(parche)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Paciente;
}

export async function eliminarPaciente(
  userId: string | null,
  id: string,
): Promise<void> {
  if (!userId) return local.eliminarPaciente(id);
  const { error } = await sb().from('psicologos_pacientes').delete().eq('id', id);
  if (error) throw error;
}

/* ============================================================
 * Sesiones
 * ============================================================ */

export async function listarSesionesDePaciente(
  userId: string | null,
  pacienteId: string,
): Promise<SesionConTags[]> {
  if (!userId) return local.listarSesionesDePaciente(pacienteId);
  const { data, error } = await sb()
    .from('psicologos_sesiones')
    .select(`
      id, user_id, paciente_id, fecha, tema_central, tarea_propuesta,
      estado_emocional, notas_libres, plan_proxima, created_at,
      psicologos_sesion_tags ( tag_id, psicologos_tags ( id, user_id, nombre, color, created_at ) )
    `)
    .eq('paciente_id', pacienteId)
    .order('fecha', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((s: any) => ({
    ...s,
    tags: (s.psicologos_sesion_tags ?? []).map((rel: any) => rel.psicologos_tags as Tag),
  })) as SesionConTags[];
}

export async function ultimasSesionesDePaciente(
  userId: string | null,
  pacienteId: string,
  limit = 3,
): Promise<Sesion[]> {
  if (!userId) return local.ultimasSesionesDePaciente(pacienteId, limit);
  const { data, error } = await sb()
    .from('psicologos_sesiones')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('fecha', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Sesion[];
}

export async function crearSesion(
  userId: string | null,
  payload: {
    paciente_id: string;
    fecha: string;
    tema_central?: string | null;
    tarea_propuesta?: string | null;
    estado_emocional?: string | null;
    notas_libres?: string | null;
    plan_proxima?: string | null;
    tagIds?: string[];
  },
): Promise<Sesion> {
  if (!userId) return local.crearSesion(payload);

  const { tagIds, ...rest } = payload;
  const { data, error } = await sb()
    .from('psicologos_sesiones')
    .insert({
      user_id: userId,
      paciente_id: rest.paciente_id,
      fecha: rest.fecha,
      tema_central: rest.tema_central ?? null,
      tarea_propuesta: rest.tarea_propuesta ?? null,
      estado_emocional: rest.estado_emocional ?? null,
      notas_libres: rest.notas_libres ?? null,
      plan_proxima: rest.plan_proxima ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  const sesion = data as Sesion;

  if (tagIds && tagIds.length > 0) {
    await asignarTagsASesion(userId, sesion.id, tagIds);
  }

  return sesion;
}

export async function actualizarSesion(
  userId: string | null,
  id: string,
  parche: Partial<Pick<Sesion, 'tema_central' | 'tarea_propuesta' | 'estado_emocional' | 'notas_libres' | 'plan_proxima' | 'fecha'>>,
  tagIds?: string[],
): Promise<Sesion> {
  if (!userId) return local.actualizarSesion(id, parche, tagIds);
  const { data, error } = await sb()
    .from('psicologos_sesiones')
    .update(parche)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  if (tagIds !== undefined) {
    await sb().from('psicologos_sesion_tags').delete().eq('sesion_id', id);
    if (tagIds.length > 0) await asignarTagsASesion(userId, id, tagIds);
  }

  return data as Sesion;
}

export async function eliminarSesion(
  userId: string | null,
  id: string,
): Promise<void> {
  if (!userId) return local.eliminarSesion(id);
  const { error } = await sb().from('psicologos_sesiones').delete().eq('id', id);
  if (error) throw error;
}

/* ============================================================
 * Tags
 * ============================================================ */

export async function listarTags(userId: string | null): Promise<Tag[]> {
  if (!userId) return local.listarTags();
  const { data, error } = await sb()
    .from('psicologos_tags')
    .select('*')
    .eq('user_id', userId)
    .order('nombre');
  if (error) throw error;
  return (data ?? []) as Tag[];
}

export async function crearTag(
  userId: string | null,
  nombre: string,
  color = '#a16207',
): Promise<Tag> {
  if (!userId) return local.crearTag(nombre, color);
  const { data, error } = await sb()
    .from('psicologos_tags')
    .upsert(
      { user_id: userId, nombre: nombre.trim(), color },
      { onConflict: 'user_id,nombre' },
    )
    .select()
    .single();
  if (error) throw error;
  return data as Tag;
}

export async function asignarTagsASesion(
  userId: string | null,
  sesionId: string,
  tagIds: string[],
): Promise<void> {
  if (!userId) return local.asignarTagsASesion(sesionId, tagIds);
  if (tagIds.length === 0) return;
  const rows = tagIds.map((tag_id) => ({ sesion_id: sesionId, tag_id }));
  const { error } = await sb()
    .from('psicologos_sesion_tags')
    .upsert(rows, { onConflict: 'sesion_id,tag_id' });
  if (error) throw error;
}

/* ============================================================
 * Búsqueda + próximos
 * ============================================================ */

export async function buscarSesiones(
  userId: string | null,
  q: string,
): Promise<SesionConPaciente[]> {
  if (!userId) return local.buscarSesiones(q);
  const termino = q.trim();
  if (!termino) return [];

  const { data, error } = await sb()
    .from('psicologos_sesiones')
    .select(`
      id, user_id, paciente_id, fecha, tema_central, tarea_propuesta,
      estado_emocional, notas_libres, plan_proxima, created_at,
      paciente:psicologos_pacientes!inner ( id, nombre, estado )
    `)
    .eq('user_id', userId)
    .or(
      [
        `tema_central.ilike.%${termino}%`,
        `tarea_propuesta.ilike.%${termino}%`,
        `estado_emocional.ilike.%${termino}%`,
        `notas_libres.ilike.%${termino}%`,
        `plan_proxima.ilike.%${termino}%`,
      ].join(','),
    )
    .order('fecha', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as SesionConPaciente[];
}

export async function proximosPacientes(
  userId: string | null,
  dentroDeDias = 7,
): Promise<Paciente[]> {
  if (!userId) return local.proximosPacientes(dentroDeDias);
  const ahora = new Date();
  const limite = new Date();
  limite.setDate(ahora.getDate() + dentroDeDias);

  const { data, error } = await sb()
    .from('psicologos_pacientes')
    .select('*')
    .eq('user_id', userId)
    .not('proxima_sesion', 'is', null)
    .gte('proxima_sesion', ahora.toISOString())
    .lte('proxima_sesion', limite.toISOString())
    .order('proxima_sesion', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Paciente[];
}
