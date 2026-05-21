import type {
  Paciente,
  Sesion,
  SesionConPaciente,
  SesionConTags,
  Tag,
} from './types';

/**
 * Implementación localStorage del repository del módulo Freud.
 * Se usa cuando NO hay sesión iniciada. La data persiste solo en el navegador
 * actual hasta que el usuario se loguea (ahí migracion.ts la sube a Supabase).
 *
 * Diseño:
 * - 3 buckets: pacientes, sesiones, tags.
 * - 1 bucket pivote: sesion_tags (pares { sesionId, tagId }).
 * - Cada item tiene user_id = LOCAL_USER_ID (placeholder) — al migrar, se reemplaza.
 */

const LOCAL_USER_ID = '__local__';
const KEY_PACIENTES = 'bronco_freud_pacientes';
const KEY_SESIONES = 'bronco_freud_sesiones';
const KEY_TAGS = 'bronco_freud_tags';
const KEY_SESION_TAGS = 'bronco_freud_sesion_tags';

type SesionTagPivot = { sesion_id: string; tag_id: string };

function leer<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function escribir<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function ahora(): string {
  return new Date().toISOString();
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback simple si crypto.randomUUID no está disponible.
  return 'local-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}

/* ============================================================
 * Pacientes
 * ============================================================ */

export async function listarPacientes(): Promise<Paciente[]> {
  return leer<Paciente>(KEY_PACIENTES).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function obtenerPaciente(id: string): Promise<Paciente | null> {
  return leer<Paciente>(KEY_PACIENTES).find((p) => p.id === id) ?? null;
}

export async function crearPaciente(
  payload: Pick<Paciente, 'nombre' | 'motivo_consulta' | 'primera_sesion'>,
): Promise<Paciente> {
  const pacientes = leer<Paciente>(KEY_PACIENTES);
  const nuevo: Paciente = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    nombre: payload.nombre,
    motivo_consulta: payload.motivo_consulta ?? null,
    primera_sesion: payload.primera_sesion ?? null,
    fecha_nacimiento: null,
    estado: 'activo',
    proxima_sesion: null,
    created_at: ahora(),
  };
  pacientes.push(nuevo);
  escribir(KEY_PACIENTES, pacientes);
  return nuevo;
}

export async function actualizarPaciente(
  id: string,
  parche: Partial<Pick<Paciente, 'nombre' | 'motivo_consulta' | 'estado' | 'proxima_sesion' | 'primera_sesion'>>,
): Promise<Paciente> {
  const pacientes = leer<Paciente>(KEY_PACIENTES);
  const idx = pacientes.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error('Paciente no encontrado');
  pacientes[idx] = { ...pacientes[idx], ...parche };
  escribir(KEY_PACIENTES, pacientes);
  return pacientes[idx];
}

export async function eliminarPaciente(id: string): Promise<void> {
  // Cascade: borrar sesiones del paciente + sus pivots
  const sesiones = leer<Sesion>(KEY_SESIONES);
  const sesionesDelPaciente = sesiones.filter((s) => s.paciente_id === id);
  const sesionIds = new Set(sesionesDelPaciente.map((s) => s.id));

  escribir(
    KEY_SESIONES,
    sesiones.filter((s) => s.paciente_id !== id),
  );
  escribir(
    KEY_SESION_TAGS,
    leer<SesionTagPivot>(KEY_SESION_TAGS).filter((p) => !sesionIds.has(p.sesion_id)),
  );
  escribir(
    KEY_PACIENTES,
    leer<Paciente>(KEY_PACIENTES).filter((p) => p.id !== id),
  );
}

/* ============================================================
 * Sesiones
 * ============================================================ */

function joinSesionTags(sesion: Sesion): SesionConTags {
  const pivots = leer<SesionTagPivot>(KEY_SESION_TAGS).filter(
    (p) => p.sesion_id === sesion.id,
  );
  const tags = leer<Tag>(KEY_TAGS);
  const tagsDeSesion = pivots
    .map((p) => tags.find((t) => t.id === p.tag_id))
    .filter((t): t is Tag => t !== undefined);
  return { ...sesion, tags: tagsDeSesion };
}

export async function listarSesionesDePaciente(pacienteId: string): Promise<SesionConTags[]> {
  const sesiones = leer<Sesion>(KEY_SESIONES)
    .filter((s) => s.paciente_id === pacienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  return sesiones.map(joinSesionTags);
}

export async function ultimasSesionesDePaciente(
  pacienteId: string,
  limit = 3,
): Promise<Sesion[]> {
  return leer<Sesion>(KEY_SESIONES)
    .filter((s) => s.paciente_id === pacienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, limit);
}

export async function crearSesion(payload: {
  paciente_id: string;
  fecha: string;
  tema_central?: string | null;
  tarea_propuesta?: string | null;
  estado_emocional?: string | null;
  notas_libres?: string | null;
  plan_proxima?: string | null;
  tagIds?: string[];
}): Promise<Sesion> {
  const sesiones = leer<Sesion>(KEY_SESIONES);
  const nueva: Sesion = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    paciente_id: payload.paciente_id,
    fecha: payload.fecha,
    tema_central: payload.tema_central ?? null,
    tarea_propuesta: payload.tarea_propuesta ?? null,
    estado_emocional: payload.estado_emocional ?? null,
    notas_libres: payload.notas_libres ?? null,
    plan_proxima: payload.plan_proxima ?? null,
    created_at: ahora(),
  };
  sesiones.push(nueva);
  escribir(KEY_SESIONES, sesiones);

  if (payload.tagIds && payload.tagIds.length > 0) {
    await asignarTagsASesion(nueva.id, payload.tagIds);
  }

  return nueva;
}

export async function actualizarSesion(
  id: string,
  parche: Partial<Pick<Sesion, 'tema_central' | 'tarea_propuesta' | 'estado_emocional' | 'notas_libres' | 'plan_proxima' | 'fecha'>>,
  tagIds?: string[],
): Promise<Sesion> {
  const sesiones = leer<Sesion>(KEY_SESIONES);
  const idx = sesiones.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error('Sesión no encontrada');
  sesiones[idx] = { ...sesiones[idx], ...parche };
  escribir(KEY_SESIONES, sesiones);

  if (tagIds !== undefined) {
    // Reemplazar tags
    const pivots = leer<SesionTagPivot>(KEY_SESION_TAGS).filter((p) => p.sesion_id !== id);
    const nuevos = tagIds.map((tag_id) => ({ sesion_id: id, tag_id }));
    escribir(KEY_SESION_TAGS, [...pivots, ...nuevos]);
  }

  return sesiones[idx];
}

export async function eliminarSesion(id: string): Promise<void> {
  escribir(
    KEY_SESIONES,
    leer<Sesion>(KEY_SESIONES).filter((s) => s.id !== id),
  );
  escribir(
    KEY_SESION_TAGS,
    leer<SesionTagPivot>(KEY_SESION_TAGS).filter((p) => p.sesion_id !== id),
  );
}

/* ============================================================
 * Tags
 * ============================================================ */

export async function listarTags(): Promise<Tag[]> {
  return leer<Tag>(KEY_TAGS).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function crearTag(nombre: string, color = '#a16207'): Promise<Tag> {
  const tags = leer<Tag>(KEY_TAGS);
  const limpio = nombre.trim();
  const existente = tags.find((t) => t.nombre === limpio);
  if (existente) return existente;
  const nuevo: Tag = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    nombre: limpio,
    color,
    created_at: ahora(),
  };
  tags.push(nuevo);
  escribir(KEY_TAGS, tags);
  return nuevo;
}

export async function asignarTagsASesion(sesionId: string, tagIds: string[]): Promise<void> {
  if (tagIds.length === 0) return;
  const pivots = leer<SesionTagPivot>(KEY_SESION_TAGS);
  const yaPresentes = new Set(pivots.filter((p) => p.sesion_id === sesionId).map((p) => p.tag_id));
  const nuevos = tagIds.filter((tagId) => !yaPresentes.has(tagId)).map((tag_id) => ({ sesion_id: sesionId, tag_id }));
  if (nuevos.length === 0) return;
  escribir(KEY_SESION_TAGS, [...pivots, ...nuevos]);
}

/* ============================================================
 * Búsqueda + próximos
 * ============================================================ */

export async function buscarSesiones(q: string): Promise<SesionConPaciente[]> {
  const termino = q.trim().toLowerCase();
  if (!termino) return [];
  const sesiones = leer<Sesion>(KEY_SESIONES);
  const pacientes = leer<Paciente>(KEY_PACIENTES);

  const matchea = (s: string | null) => s !== null && s.toLowerCase().includes(termino);
  return sesiones
    .filter(
      (s) =>
        matchea(s.tema_central) ||
        matchea(s.tarea_propuesta) ||
        matchea(s.estado_emocional) ||
        matchea(s.notas_libres) ||
        matchea(s.plan_proxima),
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 50)
    .map((s) => {
      const p = pacientes.find((p) => p.id === s.paciente_id);
      return {
        ...s,
        paciente: p
          ? { id: p.id, nombre: p.nombre, estado: p.estado }
          : { id: s.paciente_id, nombre: '(sin nombre)', estado: 'activo' as const },
      };
    });
}

export async function proximosPacientes(dentroDeDias = 7): Promise<Paciente[]> {
  const ahoraDate = new Date();
  const limite = new Date();
  limite.setDate(ahoraDate.getDate() + dentroDeDias);

  return leer<Paciente>(KEY_PACIENTES)
    .filter((p) => p.proxima_sesion !== null)
    .filter((p) => {
      const fecha = new Date(p.proxima_sesion!);
      return fecha >= ahoraDate && fecha <= limite;
    })
    .sort((a, b) => (a.proxima_sesion ?? '').localeCompare(b.proxima_sesion ?? ''));
}

/* ============================================================
 * Dump y wipe — para migración a Supabase
 * ============================================================ */

export function dump(): {
  pacientes: Paciente[];
  sesiones: Sesion[];
  tags: Tag[];
  sesion_tags: SesionTagPivot[];
} {
  return {
    pacientes: leer<Paciente>(KEY_PACIENTES),
    sesiones: leer<Sesion>(KEY_SESIONES),
    tags: leer<Tag>(KEY_TAGS),
    sesion_tags: leer<SesionTagPivot>(KEY_SESION_TAGS),
  };
}

export function wipe(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY_PACIENTES);
  localStorage.removeItem(KEY_SESIONES);
  localStorage.removeItem(KEY_TAGS);
  localStorage.removeItem(KEY_SESION_TAGS);
}

export function tieneData(): boolean {
  const d = dump();
  return d.pacientes.length > 0 || d.sesiones.length > 0 || d.tags.length > 0;
}
