/**
 * Branding del módulo Firma Digital Simple.
 * Aprobado en research/contratos.md el 2026-05-19.
 *
 * Estilo deliberadamente distinto del resto de la plataforma:
 * - Light mode local (papel cremoso) en lugar del dark global.
 * - Serif display Fraunces con personalidad editorial.
 * - Paleta lacre cera sobre papel ámbar.
 *
 * Sale de la zona segura "SaaS dark" sin caer en cliché legal corporate.
 */
export const config = {
  nicho: 'contratos' as const,
  nombre: 'Firma Digital Simple',
  audiencia: 'freelancers y pymes',
  tagline: 'Mandalo. Firmá. Listo.',

  // Colores light mode (este módulo NO usa dark)
  papel: '#fdfaf3',          // off-white tinteado ámbar
  papelHover: '#f8f1de',     // un poco más cálido en hover
  papelSombra: 'rgba(28, 25, 23, 0.04)',
  tinta: '#1c1917',           // stone-900 — texto principal
  tintaSuave: '#57534e',     // stone-600
  tintaMuyTenue: '#a8a29e',  // stone-400

  // Acento lacre
  acento: '#7c2d12',         // orange-900 — rojo lacre cera
  acentoHover: '#9a3412',    // orange-800
  acentoSoft: 'rgba(124, 45, 18, 0.10)',
  acentoSoftBorder: 'rgba(124, 45, 18, 0.35)',

  // Bordes y separadores
  borde: '#e7e1d4',          // ámbar muy claro
  bordeFuerte: '#d6cbb0',

  // Tipografía
  serifDisplay: '"Fraunces", "Georgia", "Cambria", serif',

  // Settings de Fraunces (variable font features)
  fraunces: {
    titularSuave: { fontVariationSettings: '"SOFT" 50, "opsz" 144' },
    titularDuro: { fontVariationSettings: '"SOFT" 0, "opsz" 144' },
    body: { fontVariationSettings: '"SOFT" 30, "opsz" 24' },
  },
};

export type ContratosConfig = typeof config;
