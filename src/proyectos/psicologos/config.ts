/**
 * Branding del módulo Freud (psicólogos).
 * Aprobado en research/psicologos.md el 2026-05-19.
 *
 * Paleta marrón cuero envejecido para evocar el cuaderno físico
 * del consultorio clásico. Deliberadamente lejos del cyan SaaS.
 */
export const config = {
  nicho: 'psicologos' as const,
  nombre: 'Freud',
  tagline: 'El cuaderno que recuerda por vos.',

  // Colores
  acento: '#78350f',          // amber-900 — marrón cuero
  acentoHover: '#92400e',     // amber-800
  acentoSoft: 'rgba(120, 53, 15, 0.08)',
  acentoSoftBorder: 'rgba(120, 53, 15, 0.25)',
  papel: '#fef3c7',           // amber-100 — para tintes muy sutiles
  tinta: '#1c1917',           // stone-900 — para acentos oscuros

  // Tipografía
  serif: '"Bitter", "Georgia", "Cambria", serif',
};

export type FreudConfig = typeof config;
