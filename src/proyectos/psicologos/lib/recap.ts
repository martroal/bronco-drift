import type { Paciente } from './queries';
import { ultimasSesionesDePaciente } from './queries';

/**
 * Construye un mini-resumen del paciente para mostrar antes de la próxima sesión.
 * Toma las últimas 3 sesiones y arma un texto compacto con:
 * - Tema central recurrente o más reciente
 * - Tarea propuesta pendiente
 * - Plan que el psicólogo había anotado para la próxima
 *
 * Devuelve null si el paciente no tiene sesiones previas.
 */
export type Recap = {
  pacienteId: string;
  pacienteNombre: string;
  proximaSesion: string | null; // ISO timestamp
  ultimaFecha: string | null;
  temaUltima: string | null;
  tareaPendiente: string | null;
  planProxima: string | null;
  cantidadSesiones: number;
};

export async function construirRecap(paciente: Paciente): Promise<Recap | null> {
  const sesiones = await ultimasSesionesDePaciente(paciente.id, 3);
  if (sesiones.length === 0) {
    return {
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
      proximaSesion: paciente.proxima_sesion,
      ultimaFecha: null,
      temaUltima: null,
      tareaPendiente: null,
      planProxima: null,
      cantidadSesiones: 0,
    };
  }

  const ultima = sesiones[0];
  return {
    pacienteId: paciente.id,
    pacienteNombre: paciente.nombre,
    proximaSesion: paciente.proxima_sesion,
    ultimaFecha: ultima.fecha,
    temaUltima: ultima.tema_central,
    tareaPendiente: ultima.tarea_propuesta,
    planProxima: ultima.plan_proxima,
    cantidadSesiones: sesiones.length,
  };
}

/**
 * Formatea una fecha ISO al estilo argentino. Ejemplo: "Hoy 18:00", "Mañana 09:30", "Vie 22/05 10:00".
 */
export function formatearProxima(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const pasado = new Date(hoy);
  pasado.setDate(pasado.getDate() + 2);

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const hora = `${hh}:${mm}`;

  if (date >= hoy && date < manana) return `Hoy ${hora}`;
  if (date >= manana && date < pasado) return `Mañana ${hora}`;

  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dd = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  return `${dias[date.getDay()]} ${dd}/${mes} ${hora}`;
}

/**
 * Formato relativo del pasado: "hace 3 días", "hace 2 semanas", "el 5/4".
 */
export function formatearPasado(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoy.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (dias === 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  if (dias < 14) return 'hace 1 semana';
  if (dias < 30) return `hace ${Math.floor(dias / 7)} semanas`;
  if (dias < 60) return 'hace 1 mes';
  if (dias < 365) return `hace ${Math.floor(dias / 30)} meses`;
  return `hace ${Math.floor(dias / 365)} años`;
}

/**
 * Formatea una fecha (ISO YYYY-MM-DD) al estilo "mié 22 may".
 * Para mostrar en timelines y listas.
 */
export function formatearFecha(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${dias[date.getUTCDay()].toLowerCase()} ${d} ${meses[date.getUTCMonth()]}`;
}

/**
 * Convierte un Date a ISO YYYY-MM-DD para columna date de Postgres.
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
