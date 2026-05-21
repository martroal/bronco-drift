/**
 * Branding del módulo Freud (psicólogos).
 * Aprobado en research/psicologos.md el 2026-05-19.
 *
 * Paleta marrón cuero pero subida en lightness (amber-700) para que
 * se vea presente sobre fondo oscuro. amber-900 lo dejaba "opaco".
 */
export const config = {
  nicho: 'psicologos' as const,
  nombre: 'Freud',
  audiencia: 'psicólogos',
  tagline: 'El cuaderno que recuerda por vos.',

  // Colores
  acento: '#a16207',          // amber-700 — marrón cuero con presencia
  acentoHover: '#854d0e',     // amber-800
  acentoSoft: 'rgba(161, 98, 7, 0.14)',
  acentoSoftBorder: 'rgba(161, 98, 7, 0.40)',
  papel: '#fef3c7',           // amber-100 — para tintes muy sutiles
  tinta: '#1c1917',           // stone-900 — para acentos oscuros

  // Tipografía
  serif: '"Bitter", "Georgia", "Cambria", serif',
};

export type FreudConfig = typeof config;
