# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added
- `BACKLOG.md` con próximos pasos, diferidos y decisiones tomadas/pendientes.
- `CHANGELOG.md` siguiendo Keep a Changelog.
- `docs/ARCHITECTURE.md` con stack, estructura de carpetas, diagrama de DB, flujos de URL y decisiones.
- `docs/DEPLOY_LOG.md` con registro de deploys (incluye los 2 de hoy: fallo y fix).
- `docs/LESSONS_LEARNED.md` con 3 lecciones del setup inicial (TS build, npm en Bash, preview_start).
- `docs/MIGRATIONS.md` con workflow para SQL versionado en `migrations/` aplicado manualmente al SQL Editor de Supabase.
- `migrations/README.md` apuntando al workflow.
- `migrations/001_bronco_user_nichos.sql`: tabla de suscripciones de usuarios a módulos (idempotente, RLS activado, índice por user_id). Aplicada en producción el 2026-05-19.

### Changed
- `CLAUDE.md` reescrito para reflejar la arquitectura "producto vivo" aprobada: auth compartida, branding propio por módulo, URLs anidadas (`/`, `/<nicho>`, `/<nicho>/app`).
- Prompt 1 ahora pide branding (nombre comercial + color hex + tagline) además de schema.
- Prompt 2 ahora crea migrations + landing pública + app privada con guard de auth + chequeo de suscripción, en lugar del placeholder `/proyectos/<slug>`.
- `research/contadores.md`: alcance extendido para incluir Import / Export CSV. Decisión: sin esto el producto es demo, no usable. Formato CSV documentado (5 columnas, denormalizado), mapeo a las dos tablas con upsert por CUIT, validaciones del parser y dependencia nueva `papaparse`. El "wow moment" del video pasa de la carga manual al bulk import.
- **Prompt 1 reescrito** para devolver un menú de 4-6 funcionalidades posibles (con esfuerzo S/M/L + wow factor + recomendación v0.1/v0.2/descartar), no UNA sola feature. Deja la decisión final al usuario antes de avanzar al Prompt 2.
- **`research/contadores.md` reformateado** al patrón nuevo: 6 funcionalidades posibles + decisión (1+2+3 en v0.1, 4+5+6 diferidas), branding aprobado (Vencet + cyan), schema final, formato CSV, alcance del video, estructura de archivos prevista (~500 LOC).

### Added
- `migrations/002_contadores_clientes.sql`: tabla de clientes con unique constraint en (user_id, cuit) para habilitar upsert del import CSV. Aplicada en producción el 2026-05-19.
- `migrations/003_contadores_obligaciones.sql`: tabla de obligaciones con índice compuesto (user_id, proxima_fecha) para el sort del panel. Aplicada en producción el 2026-05-19.
- **Módulo Vencet (contadores)** en `src/proyectos/contadores/`: módulo completo de Panel de Vencimientos.
  - `config.ts` con branding Vencet (cyan-500, tagline).
  - `lib/queries.ts` con 7 helpers: listar pendientes, crear/listar clientes, crear obligación, marcar presentado, import bulk con upsert por CUIT, export todo.
  - `lib/csv.ts` con parser papaparse (acepta DD/MM/YYYY e ISO), validaciones por fila, template descargable, downloadCSV helper.
  - `lib/fechas.ts` con parseFlexible, formatAR, diasHasta, urgenciaPorDias.
  - Componentes: `BadgeProximidad` (verde/amarillo/rojo), `FilaVencimiento`, `Modal` reusable, `ModalNuevoCliente`, `ModalNuevaObligacion`, `ModalImportCSV` con preview y errores por fila.
  - `Landing.tsx` con hero + 3 features + sección "Cómo funciona".
  - `App.tsx` con flujo completo: login magic-link → activar suscripción → panel con toolbar (Importar/Exportar/Nuevo cliente/Nueva obligación) y filas con optimistic update al marcar presentado.
- Helpers compartidos:
  - `src/lib/auth.ts` con `useUser`, `loginWithMagicLink`, `logout`.
  - `src/lib/modulos.ts` con `estaSuscripto`, `suscribir` (upsert en `bronco_user_nichos`).
- Rutas registradas: `/contadores` (landing) y `/contadores/app` (la app, con branding propio fuera del layout de Bronco Drift).
- Home portfolio actualizado: muestra Vencet con tagline y estado "live".
- Dependencias nuevas: `papaparse`, `lucide-react`, `@types/papaparse` (dev).
- `vercel.json` con rewrites a `/index.html` para que las rutas de React Router (ej `/contadores/app`) no devuelvan 404 cuando se cargan directo o se entra por magic link.

### Changed (auth)
- **Auth pasó de magic-link a email + password**. Razones: el SMTP default de Supabase tiene rate limit que choca durante las pruebas y arruinaría el video; Resend custom requiere dominio verificado y agrega un punto de falla externo; los contadores prefieren password tradicional (similar a AFIP/banking).
- `src/lib/auth.ts`: nuevas funciones `signIn(email, password)` y `signUp(email, password)` con `supabase.auth.signInWithPassword` y `signUp`. `loginWithMagicLink` se conserva por si en v0.2 se necesita para "olvidé mi password".
- `PantallaLogin` reescrita: toggle entre "Iniciar sesión" y "Crear cuenta", campo password con mínimo 8 caracteres, confirmación en registro, mensajes de error traducidos a español para casos comunes (credenciales inválidas, email ya registrado, email no confirmado).
- **Requiere desactivar "Confirm email"** en Supabase Auth Settings (Authentication → Providers → Email) para que el primer registro quede logueado automáticamente sin necesidad de SMTP.

### Added (Freud, módulo psicólogos)
- `research/psicologos.md`: investigación completa del nicho con menú de 7 funcionalidades filtrado por self-check. Solo 4 pasan (bitácora estructurada, timeline de evolución, pre-sesión recap, búsqueda full-text). Branding aprobado: **Freud** + `#78350f` marrón cuero + tagline *El cuaderno que recuerda por vos.* Documenta lo que NO se construye (agenda, cobros, AI scribe) y por qué.
- `migrations/004_psicologos_modulo.sql`: 4 tablas (`psicologos_pacientes`, `psicologos_sesiones`, `psicologos_tags`, `psicologos_sesion_tags`) con RLS, foreign keys con cascade, índice GIN full-text en español sobre los campos textuales de cada sesión. Aplicada en producción el 2026-05-19.
- **Módulo Freud (psicólogos) v0.1 implementado** en `src/proyectos/psicologos/`:
  - `config.ts` con branding Freud (`#78350f` amber-900, tagline, serif Bitter).
  - `lib/queries.ts`: CRUD pacientes/sesiones/tags + asignación N:M + búsqueda + próximos pacientes.
  - `lib/recap.ts`: construcción del recap pre-sesión + formato de fechas humano (Hoy, Mañana, "hace 3 días").
  - Componentes: `TagPill`, `TimelineSesion` (con línea vertical + punto + campos estructurados), `ModalNuevoPaciente`, `ModalSesion` (crear y editar con prompts clínicos + tags toggleables).
  - Páginas: `Inicio` (saludo según hora + próximos 7 días con recap detallado + acciones rápidas), `Pacientes` (búsqueda en cliente + filtro por estado + cards con motivo y próxima sesión), `PacienteDetalle` (timeline cronológico de sesiones + motivo editable inline + estado selector + borrar con confirmación).
  - `App.tsx` shell con subheader Freud + nav tabs internas (Inicio · Pacientes) + Routes anidadas `/freud/app/*`.
  - `Landing.tsx` pública con hero + 3 pilares (notas estructuradas, pre-sesión recap, memoria buscable) + cómo funciona en 3 pasos + footer de privacidad.
- Rutas registradas en `src/App.tsx`: `/freud` y `/freud/app/*`.
- Home portfolio sumó Freud como módulo **live** (Vencet sigue pausado).

### Changed (shell global)
- Nuevo **`BroncoShell`** que envuelve TODAS las rutas (portfolio, landings de nichos, apps de nichos). Compone `BroncoHeader` sticky + `AuthBanner` debajo + outlet del módulo.
- Nuevo **`BroncoHeader`**: identifica la plataforma con un header sticky discreto (`bronco-drift` + `AuthMenu`). Único punto de auth de toda la app.
- `Layout.tsx` (la versión vieja del wrapper de portfolio) eliminado. Su footer global pasó al `Home.tsx` (porque era contenido del portfolio, no de la plataforma).
- `Landing.tsx` y `App.tsx` de Vencet ahora son módulos "libres" debajo del shell: tienen su propio subheader tinted con el acento del nicho, sin duplicar AuthMenu ni AuthBanner. Esto permite que otros módulos a futuro puedan no tener header, tener barra de navegación inferior, o el layout que quieran.
- Home portfolio muestra Vencet con estado **pausado** (no live) reflejando la decisión del self-check.

### Added (impeccable teach: contexto formal)
- `PRODUCT.md`: register (brand + product mix), misión, audiencia en dos capas, tono de voz, anti-references estéticas y de UX, principios estratégicos.
- `DESIGN.md`: sistema visual completo. Color en OKLCH con neutrales tinteados al calor, color strategy por contexto (Restrained/Committed). Tipografía pair sans + mono: Geist + Geist Mono cargadas desde Google Fonts. Bitter como serif opcional por módulo (Freud ya la usa). Escala tipográfica 1.25x, layout containers por contexto, patrones de modal scrolleable, motion ease-out exponencial, theme dark default.
- `index.html` precarga las 3 familias de fonts.
- `src/index.css` aplica Geist como font-family base, Geist Mono para code/kbd/pre/samp, con features cv11/ss01/ss03 activadas.
- `tailwind.config.js` extiende fontFamily para que `font-sans`, `font-mono`, `font-serif` resuelvan al stack Geist/Geist Mono/Bitter.

### Added (misión y self-check)
- **`docs/SELF_CHECK.md`** con la misión reformulada (funcional, hermosa, gratis — el video es secundario) y las 3 preguntas que toda feature debe pasar antes de implementarse (valor real, funcional end-to-end, hermosa). Incluye antimensiones explícitas y el aprendizaje de Vencet v0.1 como caso de estudio.
- `CLAUDE.md` actualizado para referenciar SELF_CHECK como lectura obligatoria al inicio de cada sesión. Prompts 1 y 2 ahora exigen pasar el self-check antes de proponer alcance o tipear código.
- `BACKLOG.md` reescrito al rededor de la nueva misión. Vencet pasa de "En curso" a "Diferido / repensar" con nota sobre el aprendizaje. Próximo paso es decidir nicho nuevo aplicando los criterios del self-check.

### Added (demo data)
- `demo/contadores-ejemplo.csv` con 10 clientes argentinos y 30 obligaciones distribuidas entre mayo-septiembre 2026. Mezcla de impuestos reales y formatos de fecha (ISO y DD/MM/YYYY) para validar el parser. Distribución de proximidad pensada para que el panel quede colorido al importar (rojos vencidos, amarillos esta semana, verdes a futuro). Ideal para el wow moment del video.
- `demo/README.md` documentando qué hay en la carpeta y cómo usar cada archivo.

### Changed (UX de auth no bloqueante)
- **PantallaLogin bloqueante eliminada** del módulo Vencet. La app entera se puede explorar sin estar logueado.
- Nuevos componentes compartidos en `src/components/`:
  - `ModalAuth.tsx`: form de login/registro con toggle, reusable por cualquier módulo (recibe acento + nombreProducto).
  - `AuthMenu.tsx`: header de auth. Sin sesión muestra "Iniciar sesión" + "Crear cuenta"; con sesión muestra email + logout.
  - `AuthBanner.tsx`: banner persistente arriba que invita a registrarse, dismisible con X y persistido en localStorage.
- `Layout.tsx` (portfolio) ahora incluye AuthBanner + AuthMenu.
- `Landing.tsx` (Vencet) ahora incluye AuthBanner + AuthMenu con branding propio.
- `App.tsx` (Vencet) ahora:
  - Renderiza el panel siempre, con o sin sesión.
  - Sin user: empty state que invita a registrarse, los botones de toolbar abren ModalAuth en lugar de modals de creación.
  - Con user: auto-suscripción en background a `bronco_user_nichos` (sin modal bloqueante), panel normal con queries reales.
  - Header del módulo usa AuthMenu en lugar del LogOut directo.

## [0.0.2] — 2026-05-19

### Fixed
- Build de TypeScript en Vercel (`tsc -b`) fallaba con 4 errores: `node:path` sin tipos, `__dirname` sin tipos, `tsconfig.node.json` sin `composite: true`, y composite incompatible con `noEmit`.
- Split de tsconfigs al patrón estándar de Vite: `tsconfig.json` (raíz, solo references), `tsconfig.app.json` (src), `tsconfig.node.json` (vite.config.ts, composite + outDir bajo `node_modules/.tmp/`).
- `@types/node` agregado a devDependencies.
- `.gitignore` blinda `vite.config.{js,d.ts}` y `*.tsbuildinfo` por si composite filtra artifacts al root.

## [0.0.1] — 2026-05-19

### Added
- Scaffold inicial: Vite 6 + React 18 + TypeScript + Tailwind v3 + react-router v7.
- Estructura multi-tenant con `src/routes/Layout.tsx`, `Home.tsx`, `ProjectModule.tsx` (catch-all `/proyectos/:slug`).
- Cliente Supabase en `src/lib/supabase.ts` con flag `isSupabaseConfigured`.
- Manifest PWA en `public/manifest.webmanifest`.
- CLAUDE.md con dos prompts maestros (investigación de nicho + ejecución de módulo).
- `research/contadores.md` con investigación aprobada del primer nicho (Panel de Vencimientos).
- `.env.example` con las dos env vars de Supabase.
- Repo público en GitHub: [martroal/bronco-drift](https://github.com/martroal/bronco-drift).
- Deploy en Vercel: [bronco-drift.vercel.app](https://bronco-drift.vercel.app/) con env vars cargadas.
