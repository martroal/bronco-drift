/**
 * Utilidades de fechas para el módulo Vencet.
 * Sin date-fns: el módulo no necesita locale ni cálculos complejos.
 */

/**
 * Parsea una fecha en formato ISO (YYYY-MM-DD) o argentino (DD/MM/YYYY).
 * Devuelve null si no es válida.
 */
export function parseFlexible(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // ISO: 2026-06-15
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  // Argentino: 15/06/2026 o 15-06-2026
  const arMatch = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(trimmed);
  if (arMatch) {
    const [, d, m, y] = arMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Formatea una fecha (string ISO de Supabase) al estilo argentino.
 * Ejemplo: "2026-06-15" → "15/06/2026".
 */
export function formatAR(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Convierte un Date a string ISO YYYY-MM-DD para guardar en Postgres date column.
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Días hasta una fecha (puede ser negativo si ya pasó).
 * Compara solo fechas, ignora hora.
 */
export function diasHasta(isoDate: string): number {
  const target = new Date(isoDate);
  const today = new Date();
  target.setUTCHours(0, 0, 0, 0);
  today.setUTCHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Color del badge según proximidad del vencimiento.
 * - rojo: vencido o menos de 3 días (urgente)
 * - amarillo: 3 a 7 días
 * - verde: más de 7 días
 */
export type Urgencia = 'rojo' | 'amarillo' | 'verde';

export function urgenciaPorDias(dias: number): Urgencia {
  if (dias < 3) return 'rojo';
  if (dias <= 7) return 'amarillo';
  return 'verde';
}
