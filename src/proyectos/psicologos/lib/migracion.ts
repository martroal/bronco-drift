import { supabase } from '@/lib/supabase';
import * as local from './queriesLocal';

/**
 * Migra los datos del usuario que estaban en localStorage a Supabase
 * cuando recién se logueó. Es idempotente: si no hay nada que migrar,
 * sale sin hacer nada. Si la migración falla, los datos locales NO se borran.
 *
 * Estrategia:
 * 1. Si no hay nada en local, salir.
 * 2. Insertar todos los pacientes en Supabase con el user_id real,
 *    manteniendo los ids del local.
 * 3. Insertar todas las sesiones, idem.
 * 4. Insertar todos los tags (con upsert por nombre, idempotente).
 * 5. Insertar los pivots sesion_tags.
 * 6. Si todo salió bien, limpiar localStorage.
 *
 * Si en algún paso falla, los datos locales se mantienen para que el
 * usuario pueda reintentar la próxima vez (recargar la página).
 */
export async function migrarLocalASupabase(userId: string): Promise<{
  migradosPacientes: number;
  migradasSesiones: number;
  migradosTags: number;
}> {
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }

  if (!local.tieneData()) {
    return { migradosPacientes: 0, migradasSesiones: 0, migradosTags: 0 };
  }

  const data = local.dump();

  // 1. Pacientes con user_id reemplazado.
  if (data.pacientes.length > 0) {
    const pacientesParaSupabase = data.pacientes.map((p) => ({
      id: p.id,
      user_id: userId,
      nombre: p.nombre,
      fecha_nacimiento: p.fecha_nacimiento,
      primera_sesion: p.primera_sesion,
      motivo_consulta: p.motivo_consulta,
      estado: p.estado,
      proxima_sesion: p.proxima_sesion,
      created_at: p.created_at,
    }));
    const { error } = await supabase
      .from('psicologos_pacientes')
      .upsert(pacientesParaSupabase, { onConflict: 'id' });
    if (error) throw new Error(`Migración de pacientes falló: ${error.message}`);
  }

  // 2. Tags
  if (data.tags.length > 0) {
    const tagsParaSupabase = data.tags.map((t) => ({
      id: t.id,
      user_id: userId,
      nombre: t.nombre,
      color: t.color,
      created_at: t.created_at,
    }));
    const { error } = await supabase
      .from('psicologos_tags')
      .upsert(tagsParaSupabase, { onConflict: 'user_id,nombre' });
    if (error) throw new Error(`Migración de tags falló: ${error.message}`);
  }

  // 3. Sesiones (después de pacientes por FK)
  if (data.sesiones.length > 0) {
    const sesionesParaSupabase = data.sesiones.map((s) => ({
      id: s.id,
      user_id: userId,
      paciente_id: s.paciente_id,
      fecha: s.fecha,
      tema_central: s.tema_central,
      tarea_propuesta: s.tarea_propuesta,
      estado_emocional: s.estado_emocional,
      notas_libres: s.notas_libres,
      plan_proxima: s.plan_proxima,
      created_at: s.created_at,
    }));
    const { error } = await supabase
      .from('psicologos_sesiones')
      .upsert(sesionesParaSupabase, { onConflict: 'id' });
    if (error) throw new Error(`Migración de sesiones falló: ${error.message}`);
  }

  // 4. Pivots sesion_tags (después de sesiones y tags por FK)
  if (data.sesion_tags.length > 0) {
    const { error } = await supabase
      .from('psicologos_sesion_tags')
      .upsert(data.sesion_tags, { onConflict: 'sesion_id,tag_id' });
    if (error) throw new Error(`Migración de tags-sesión falló: ${error.message}`);
  }

  // Todo OK → limpiar local.
  local.wipe();

  return {
    migradosPacientes: data.pacientes.length,
    migradasSesiones: data.sesiones.length,
    migradosTags: data.tags.length,
  };
}
