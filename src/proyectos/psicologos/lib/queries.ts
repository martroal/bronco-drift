import { supabase } from '@/lib/supabase';

/* ============================================================
 * Tipos
 * ============================================================ */

export type EstadoPaciente = 'activo' | 'pausa' | 'alta';

export type Paciente = {
  id: string;
  user_id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  primera_sesion: string | null;
  motivo_consulta: string | null;
  estado: EstadoPaciente;
  proxima_sesion: string | null;
  created_at: string;
};

export type Sesion = {
  id: string;
  user_id: string;
  paciente_id: string;
  fecha: string;
  tema_central: string | null;
  tarea_propuesta: string | null;
  estado_emocional: string | null;
  notas_libres: string | null;
  plan_proxima: string | null;
  created_at: string;
};

export type Tag = {
  id: string;
  user_id: string;
  nombre: string;
  color: string;
  created_at: string;
};

export type SesionConPaciente = Sesion & {
  paciente: Pick<Paciente, 'id' | 'nombre' | 'estado'>;
};

export type SesionConTags = Sesion & {
  tags: Tag[];
};

function sb() {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

/* ============================================================
 * Pacientes
 * ============================================================ */

export async function listarPacientes(userId: string): Promise<Paciente[]> {
  const { data, error } = await sb()
    .from('psicologos_pacientes')
    .select('*')
    .eq('user_id', userId)
    .order('nombre');
  if (error) throw error;
  return (data ?? []) as Paciente[];
}

export async function obtenerPaciente(id: string): Promise<Paciente | null> {
  const { data, error } = await sb()
    .from('psicologos_pacientes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Paciente | null;
}

export async function crearPaciente(
  userId: string,
  payload: Pick<Paciente, 'nombre' | 'motivo_consulta' | 'primera_sesion'>,
): Promise<Paciente> {
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
  id: string,
  parche: Partial<Pick<Paciente, 'nombre' | 'motivo_consulta' | 'estado' | 'proxima_sesion' | 'primera_sesion'>>,
): Promise<Paciente> {
  const { data, error } = await sb()
    .from('psicologos_pacientes')
    .update(parche)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Paciente;
}

export async function eliminarPaciente(id: string): Promise<void> {
  const { error } = await sb().from('psicologos_pacientes').delete().eq('id', id);
  if (error) throw error;
}

/* ============================================================
 * Sesiones
 * ============================================================ */

export async function listarSesionesDePaciente(pacienteId: string): Promise<SesionConTags[]> {
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

export async function ultimasSesionesDePaciente(pacienteId: string, limit = 3): Promise<Sesion[]> {
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
  userId: string,
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
    await asignarTagsASesion(sesion.id, tagIds);
  }

  return sesion;
}

export async function actualizarSesion(
  id: string,
  parche: Partial<Pick<Sesion, 'tema_central' | 'tarea_propuesta' | 'estado_emocional' | 'notas_libres' | 'plan_proxima' | 'fecha'>>,
  tagIds?: string[],
): Promise<Sesion> {
  const { data, error } = await sb()
    .from('psicologos_sesiones')
    .update(parche)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  if (tagIds !== undefined) {
    // Reemplazar tags completamente.
    await sb().from('psicologos_sesion_tags').delete().eq('sesion_id', id);
    if (tagIds.length > 0) await asignarTagsASesion(id, tagIds);
  }

  return data as Sesion;
}

export async function eliminarSesion(id: string): Promise<void> {
  const { error } = await sb().from('psicologos_sesiones').delete().eq('id', id);
  if (error) throw error;
}

/* ============================================================
 * Tags
 * ============================================================ */

export async function listarTags(userId: string): Promise<Tag[]> {
  const { data, error } = await sb()
    .from('psicologos_tags')
    .select('*')
    .eq('user_id', userId)
    .order('nombre');
  if (error) throw error;
  return (data ?? []) as Tag[];
}

export async function crearTag(
  userId: string,
  nombre: string,
  color: string = '#78350f',
): Promise<Tag> {
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

export async function asignarTagsASesion(sesionId: string, tagIds: string[]): Promise<void> {
  if (tagIds.length === 0) return;
  const rows = tagIds.map((tag_id) => ({ sesion_id: sesionId, tag_id }));
  const { error } = await sb()
    .from('psicologos_sesion_tags')
    .upsert(rows, { onConflict: 'sesion_id,tag_id' });
  if (error) throw error;
}

/* ============================================================
 * Búsqueda full-text
 * ============================================================ */

export async function buscarSesiones(userId: string, q: string): Promise<SesionConPaciente[]> {
  const termino = q.trim();
  if (!termino) return [];

  // Postgres `websearch_to_tsquery` permite query estilo Google.
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

/* ============================================================
 * Próximos turnos (deriva del campo proxima_sesion de pacientes)
 * ============================================================ */

export async function proximosPacientes(userId: string, dentroDeDias = 7): Promise<Paciente[]> {
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
