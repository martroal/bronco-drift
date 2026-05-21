/**
 * Branding del módulo Vencet (contadores).
 * Aprobado en research/contadores.md el 2026-05-19.
 */
export const config = {
  nicho: 'contadores' as const,
  nombre: 'Vencet',
  audiencia: 'contadores',
  tagline: 'Tus vencimientos AFIP, ordenados.',
  acento: '#0ea5e9', // cyan-500
  acentoHover: '#0284c7', // cyan-600
  acentoSoft: 'rgba(14, 165, 233, 0.1)', // cyan-500 a 10%
};

export type ContadoresConfig = typeof config;
