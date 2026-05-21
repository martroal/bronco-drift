# DESIGN.md — Bronco Drift

> Establecido el 2026-05-19 via `/impeccable teach`. Sistema visual de la plataforma. Cada módulo hereda pero puede sobreescribir su acento, su tipografía secundaria y su escala. **No puede** romper las reglas absolutas.

## Vibe general

**Warm-craft software** con tipografía mono-friendly. Paleta tirando al cálido (no cyan SaaS), tipografía con personalidad (Geist Sans + Geist Mono), espacios respirados, microdetalles que se notan a segunda mirada. Sensación de "estudio chico que entrega bien", no de "agencia que vende rápido".

Referencias para inspirarse (no copiar): Are.na, Cosmos, Pile, Stripe.press, Cron, Raycast, Linear blog.

Anti-referencias: ver `PRODUCT.md` → Aesthetic anti-references.

## Color

### Paleta base de plataforma

Color tokens en OKLCH para precisión perceptual. Los neutrales están tinteados sutilmente hacia el calor para evitar el gris muerto.

```css
/* Backgrounds */
--bg-0: oklch(0.18 0.005 60);   /* fondo plataforma, casi negro tinteado cuero */
--bg-1: oklch(0.22 0.005 60);   /* surface levantado (cards, modals) */
--bg-2: oklch(0.26 0.006 60);   /* surface 2nd, hover, divider */

/* Borders */
--border-base: oklch(0.30 0.008 60);
--border-strong: oklch(0.40 0.010 60);

/* Text */
--text-primary: oklch(0.96 0.005 60);  /* casi blanco tinteado */
--text-secondary: oklch(0.72 0.008 60);
--text-tertiary: oklch(0.55 0.010 60);
--text-disabled: oklch(0.42 0.008 60);

/* Acento de plataforma (solo para anchors y enlaces sutiles del shell, NO para módulos) */
--accent-platform: oklch(0.78 0.13 70);  /* mostaza envejecida */
```

> **Nota Tailwind v3**: estos tokens viven idealmente como CSS custom properties consumidas vía `bg-[--bg-0]` o configuradas en `tailwind.config.js`. Por simplicidad inicial usamos clases `neutral-950 / 900 / 800` de Tailwind que aproximan estos valores. Migrar a tokens explícitos cuando el primer módulo lo requiera.

### Color strategy por contexto

Aplicar el concepto de "color strategy" del skill `impeccable`:

- **Home portfolio (`/`)**: **Restrained**. Neutrales + 1 accent ≤10%. El acento de la plataforma solo aparece en hover y en pills de estado.
- **Landings de módulos (`/<nicho>`)**: **Committed**. Cada módulo tiene su color comercial cubriendo 30-60% de la superficie (tinted backgrounds, subheader). Es donde el módulo se vende.
- **Apps de módulos (`/<nicho>/app`)**: **Restrained**. Neutrales del módulo + el acento usado escasamente. Foco en la utilidad.

### Acentos por módulo (referencia)

| Módulo | Acento | Notes |
|---|---|---|
| Freud (psicólogos) | `#78350f` (amber-900 / OKLCH ~0.43 0.10 60) | Marrón cuero envejecido. Cálido, lejos de cyan SaaS. |
| Vencet (contadores) | `#0ea5e9` (cyan-500) | Decisión heredada de v0.1. Si se retoma el módulo, repensar para que pase el self-check. |

Cada módulo nuevo declara su acento en `src/proyectos/<nicho>/config.ts` junto al nombre y tagline.

### Reglas absolutas de color

- Nunca `#000` ni `#fff` puros. Todo tinteado hacia el calor base.
- Chroma alto solo en mid-lightness (0.35-0.75). Baja chroma a casi 0 en extremos.
- Gradientes solo en backgrounds (`radial-gradient` muy sutil con el acento del módulo). **Nunca** gradiente sobre texto. **Nunca** glassmorphism decorativo.
- Bordes laterales coloreados (`border-left: 4px solid X`) están prohibidos en cards, list items, alerts. Usar borders completos o tinted backgrounds.

## Tipografía

### Familias

- **Sans (default)**: **Geist Sans** (variable). Body, UI controls, navigation. Limpia, moderna, sin overdesigning.
- **Mono (acentos)**: **Geist Mono** (variable). Wordmarks, metadata, números, badges, labels técnicas, etiquetas de status. Le da al proyecto el vibe "software hecho con cuidado, no genérico".
- **Display / serif (opcional por módulo)**: cada módulo puede sumar su propia serif para titulares. Freud usa **Bitter**. Otros módulos pueden usar Fraunces, Source Serif, etc. La plataforma global NO usa serif por default.

### Cómo se cargan

Las fonts vienen de Google Fonts. Link en `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Bitter:ital,wght@0,400..700;1,400&display=swap" rel="stylesheet">
```

### Pilas de fallback

```css
--font-sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
--font-serif: "Bitter", "Georgia", "Cambria", serif;
```

### Escala tipográfica (ratio 1.25)

| Token | Tamaño | Uso |
|---|---|---|
| `text-xs` | 12px / 1.4 | meta, badges, labels técnicos (mono opcional) |
| `text-sm` | 14px / 1.5 | body por default, controls, formularios |
| `text-base` | 16px / 1.55 | body en zonas respiradas (landings) |
| `text-lg` | 18px / 1.5 | subtítulos, énfasis dentro de body |
| `text-xl` | 22px / 1.4 | titulares de sección |
| `text-2xl` | 28px / 1.3 | titulares principales de página |
| `text-3xl` | 36px / 1.2 | hero de landing |
| `text-5xl` | 56px / 1.1 | hero grande (solo brand) |

### Reglas

- **Hierarchy por scale + weight contrast**, no por color. Salto mínimo entre niveles: 1.25x.
- **Body line length**: max-w-prose (~65ch) en bloques de lectura larga.
- **Tracking**: tighter en displays (`tracking-tight`), normal en body, looser en uppercase pequeño (`tracking-[0.18em]`).
- **Mono para metadata**: fechas, IDs, tags, status, version. NO para body normal.
- **Weight cap**: el peso más bajo del proyecto es 400. Nunca 300 ni 100.

## Layout

### Espaciado

Variar para crear ritmo. Padding idéntico en todo es monotonía.

| Token | Uso típico |
|---|---|
| `space-1` (4px) | gap interno de pill, badge |
| `space-2` (8px) | gap entre items inline |
| `space-3` (12px) | padding de cards chicas, separación lista |
| `space-4` (16px) | padding card mid, separación bloques |
| `space-6` (24px) | padding card grande, separación secciones chicas |
| `space-8` (32px) | gap secciones mid |
| `space-12` (48px) | gap entre secciones grandes |
| `space-16` (64px) | gap entre bloques del hero |
| `space-24` (96px) | margins de página, hero |

### Containers

- **Portfolio `/`**: `max-w-5xl` (1024px), `px-6 py-10`.
- **Landings de módulo**: `max-w-3xl` (768px) para hero/copy, `max-w-5xl` para grids.
- **Apps de módulo**: `max-w-4xl` para vistas con foco (paciente), `max-w-5xl` para listas.
- **Modals**: `max-w-sm` para auth/confirm, `max-w-md` para crear simple, `max-w-2xl` para crear/editar con tags y campos múltiples.

### Cards

Cards son la respuesta perezosa. Usar SOLO cuando son la mejor affordance, no por defecto. **Nested cards siempre están mal.**

Cuando hagan falta cards:
- `rounded-xl` (12px) o `rounded-lg` (8px) según escala.
- Borde sutil `border border-neutral-800`.
- Hover: `hover:border-neutral-700` o `hover:border-neutral-600`.
- Background: `bg-neutral-900` o tinted con el acento del módulo (`rgba(<acento>, 0.03)`).

## Componentes globales

Componentes de plataforma que TODOS los módulos heredan. Su API es estable.

### BroncoShell (`src/components/BroncoShell.tsx`)

Wrapper que envuelve todas las rutas. Compone:
1. `BroncoHeader` (sticky)
2. `AuthBanner` (condicional)
3. `<Outlet />` del módulo

No agregar contenido propio acá. Si una vista necesita padding o container, lo agrega ella misma.

### BroncoHeader (`src/components/BroncoHeader.tsx`)

Sticky, `z-40`, `bg-neutral-950/85` con `backdrop-blur-md`. Wordmark `bronco-drift` en font-mono pequeña (texto sutil, sin protagonismo). AuthMenu a la derecha.

**No agregar más cosas al header global**. Tagline del proyecto, navegación al portfolio, links a secciones — todo eso va en el contenido de cada ruta, no en el header.

### AuthMenu (`src/components/AuthMenu.tsx`)

- Sin sesión: "Iniciar sesión" + "Crear cuenta" (botón con acento opcional).
- Con sesión: email (truncado a 180px) + ícono logout.
- Recibe prop `acento` para que los CTAs usen el color del módulo cuando se renderiza dentro de un módulo.

### AuthBanner (`src/components/AuthBanner.tsx`)

Banner persuasivo debajo del header global. Solo aparece sin sesión y si no fue dismissed (localStorage `bronco_auth_banner_dismissed`).

Copy default: *"Para guardar tus datos y volver a verlos cuando quieras, iniciá sesión."* Cada módulo puede sobreescribir.

### ModalAuth (`src/components/ModalAuth.tsx`)

Modal de login/registro reutilizable. Toggle entre los dos modos. Recibe `acento` + `nombreProducto` para personalizarse por módulo. Patrón scrolleable (overflow-y-auto + flex min-h-full items-center).

## Patrones de modal

Todos los modals siguen el mismo patrón estructural para evitar el bug de cortarse en viewports cortos:

```tsx
<div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm" onClick={onClose}>
  <div className="flex min-h-full items-center justify-center p-4">
    <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl my-auto" onClick={e => e.stopPropagation()}>
      {/* contenido */}
    </div>
  </div>
</div>
```

Si el módulo necesita un modal custom, debe respetar el patrón. `Z-index` del modal: 50. Sticky header global: 40.

## Motion

- **Ease**: `ease-out-quart` o `ease-out-quint` (curvas exponenciales). No usar `ease-in-out`, no usar bounce, no usar elastic.
- **Duración**: 150ms para hover/focus, 250ms para transiciones de page, 400ms para entradas de modal.
- **Propiedades animables**: opacity, transform (translate, scale). **No animar** layout props (width, height, top, left, padding, margin) — usar transform en su lugar.
- **Reducir motion**: respetar `prefers-reduced-motion: reduce`. Toda animación no esencial se disable o reduce drásticamente.

## Theme

**Dark mode default**. Razón concreta: el usuario típico (profesional independiente, developer-aware, usa la app a la noche o en consultorio con luz tenue) está mejor servido por dark. Light mode queda diferido a v0.2 si emerge feedback.

Si un módulo concreto necesita modo claro (ej. salud pública donde luz tenue no es contexto), puede sobreescribir su layout interno. Pero la plataforma (portfolio + shell) es dark.

## Accesibilidad

- **Contrastes**: WCAG AA mínimo para body (4.5:1), AAA para titulares grandes (7:1).
- **Focus states visibles**: todo elemento interactivo debe tener `:focus-visible` con outline o ring tinted con el acento del módulo.
- **Targets táctiles**: mínimo 44x44px en mobile.
- **Lectores de pantalla**: aria-labels en botones-solo-icono, `aria-hidden` en iconos decorativos.
- **Tab order**: lógico, sin trampas. Modal cierra con Escape.

## Iconografía

- **Lucide React** como única librería de iconos.
- **Tamaño base**: 14px en buttons, 16px en inputs/labels, 18px en headers de modal, 20-24px en feature blocks.
- **Stroke**: 2 (default de Lucide).
- **Color**: heredan `currentColor`. No usar fill diferente al stroke.

## Migración a tokens explícitos (futuro)

Ahora estamos usando clases `neutral-*` de Tailwind por simplicidad. Cuando un módulo necesite la paleta exacta de DESIGN.md, migrar a:

1. CSS custom properties en `src/index.css` (`--bg-0`, `--text-primary`, etc).
2. `tailwind.config.js` con `theme.extend.colors` mapeando a esas custom properties.
3. Uso vía `bg-platform-bg-0`, `text-platform-primary`, etc.

No hacer la migración preemptivamente. Hacerla cuando el primer módulo lo requiera por precisión visual.
