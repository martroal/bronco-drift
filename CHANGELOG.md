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

### Added (cultura blindada en docs para sobrevivir compacts y nuevas sesiones)
- **`docs/LESSONS_LEARNED.md`** completado con 17+ lecciones agrupadas en 5 secciones: Setup inicial, Deploy y producción, React/CSS/rendering, Supabase RLS y data, Performance y bundle, UX y producto. Cada lección documenta síntoma, causa raíz, solución aplicada y cómo evitarla. Resuelve la tarea pending #15 que arrastraba desde el inicio del proyecto.
- **`docs/PROCESS.md`** (nuevo) — proceso operativo completo de armar un módulo: las 5 fases (investigación, DB, build, polish, validación), qué hace Claude en cada una, qué hacés vos, checkpoints, antipatrones a evitar. Documenta las 15 reglas durables (hard rules + soft rules) y la lista de "cosas que nunca hacemos". Es el manual de cómo replicar el éxito del flow.
- **`PRODUCT.md`** sumó subsección **"Tono en concreto"**: 7+ pares de ejemplos textuales (empty states, CTAs, errores, microcopy de progreso, etc.) mostrando cómo SÍ escribimos vs cómo NO. Bloquea el riesgo de que el tono se pierda en nuevas sesiones o se diluya en SaaS-speak. También documenta el tono entre Claude y el operador en chat.
- **`CLAUDE.md`** actualizado para referenciar PRODUCT.md y PROCESS.md como lectura inicial de toda sesión nueva.

### Added (aclaración + DNI estándar argentino en bloque de firma)
- Bajo cada firma del contrato ahora se renderiza `Aclaración: <nombre completo>` y `DNI/CUIT: <número>`, en formato estándar de contratos argentinos. Aplica en preview, en PDF y en la página pública de firma.
- Schema: nuevas columnas `parte_a_dni` y `parte_b_dni` en `contratos_documentos` (nullable, no rompe contratos viejos). Migration `006_contratos_dni.sql`.
- UX firma propia (Detalle): inputs de "Nombre completo" y "DNI/CUIT" requeridos antes del canvas. Error inline si falta alguno.
- UX firma parte B (Firmar.tsx página pública): el form ahora pide Nombre + DNI/CUIT (requeridos) + Email (opcional). Layout grid 2 columnas en desktop, stack en mobile.
- `firmarComoParteB` ahora acepta `dni` en el payload y lo persiste.

### Changed (revert: variables sin completar quedan visibles en el PDF)
- Removido el confirm dialog antes de generar PDF. Las variables `{{x}}` sin reemplazar se exportan tal cual y actúan como señal visual de qué campos quedan por completar (decisión consciente del usuario).

### Added (editar borrador + crear versión nueva)
- **Botón "Editar"** en `Detalle.tsx` cuando estado === 'borrador'. Linkea a `/contratos/:id/editar`. `Nuevo.tsx` ahora soporta modo edición: detecta `useParams.id`, carga el contrato existente, pre-llena título y variables, y al guardar hace `UPDATE` en lugar de `INSERT`. Si el contrato tenía firma del creador (`parte_a_firma_data`), se invalida al guardar porque el contenido cambió. Warning visible en el form al editar un contrato con firma.
- **Botón "Crear versión nueva"** cuando estado !== 'borrador' (enviado, firmado, cancelado). Duplica el contrato como nuevo borrador con título `(v2)` (o `(vN+1)` si ya había versión previa). El original queda intacto preservando audit trail. Usuario decide qué hacer con la versión vieja (mantenerla como histórico, cancelarla, etc.).
- Nueva ruta `/contratos/:id/editar` montada en `App.tsx` del módulo.

### Fixed (3 bugs del PDF de contratos)
- **Página en blanco inicial**: `pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }` con `legacy` inyectaba una página vacía al inicio del PDF. Sacamos `legacy`. Quedan `css` y `avoid-all`, que cubren los breaks reales sin ese efecto fantasma.
- **Palabras pegadas en headings** ("Propiedadintelectual", "Soluciónlecontroversias"): `html2canvas` rasterizaba ANTES de que las fonts Fraunces/Geist terminaran de cargar, cayendo a fallback con kerning agresivo que se comía espacios. Ahora `generarPDF` espera `document.fonts.ready` + un tick para layout estable, y `html2canvas.onclone` también espera las fonts dentro del clon. Agregamos `letterRendering: true` para rasterización letter-by-letter.
- **Variables sin reemplazar exportadas a PDF**: si el usuario hace clic en "Descargar PDF" sin completar las `{{variables}}` del template, ahora aparece un `confirm` listando las variables faltantes. Puede generar igual (para revisar el formato) o cancelar e ir a editar el contrato.

### Fixed (8 fixes del audit /contratos)
- **C1 — Rutas públicas standalone limpias**: nuevo helper `src/lib/publicRoutes.ts` con regex de rutas tipo `/contratos/firmar/:token`. BroncoHeader y AuthBanner detectan y se ocultan en esas rutas. La página de firma queda sin el shell de la plataforma.
- **C2 — Lazy loading por módulo + dynamic import de html2pdf**: cada módulo (`/contadores/*`, `/freud/*`, `/contratos/*`) en su chunk separado vía `React.lazy` + `Suspense`. `html2pdf.js` se importa dinámicamente solo cuando se llama a `generarPDF`. Bundle inicial pasó de **486 KB gzip → 119 KB gzip** (~4x más rápido en mobile). html2pdf (285 KB gzip) solo se descarga cuando el usuario hace clic en descargar PDF.
- **C3 — Touch targets a 44px+**: AuthMenu y AuthBanner usan padding vertical mayor (py-2.5). El botón X del banner ahora tiene hit area de 36×36 (`p-2` + ícono 14px).
- **C4 — Doc title dinámico**: nuevo hook `useDocTitle` en `src/lib/useDocTitle.ts`. Aplicado en Home (`Bronco Drift · Apps funcionales y gratis`), Freud Inicio (`Inicio · Freud`), Contratos Lista (`Tus contratos · Firma Digital Simple`), Nuevo, Detalle (usa el título del contrato cargado), Firmar.
- **H1 + H2 — AuthBanner adaptativo**: detecta si está en módulo light (`/contratos/*`) y cambia el tono del banner al papel cremoso con tinte del acento. En módulos dark mantiene el tono oscuro. Copy mobile más corto ("Guardá tu data en la nube") + completo desde sm en adelante.
- **H3 — Landmark `<main>`** en Firmar.tsx (incluyendo la pantalla de error) y en Lista.tsx. Los lectores de pantalla ahora pueden saltar al contenido principal.
- **H4 — Search + filtros en Lista de contratos**: input de búsqueda por título + tabs de estado (Todos / Borradores / Enviados / Firmados). Empty state separado cuando no matchea búsqueda.
- **H5 — Bitter URL en Google Fonts**: reorganización del query string. La sintaxis combinada con ítalico variable + axis no funcionaba bien con `0,400..700;1,400`. Ahora `0,400;0,500;0,600;0,700;1,400` (weights explícitos). Bitter ahora carga y Freud recupera su tipografía display.

### Fixed (RLS policy bloqueaba la firma de la otra parte)
- La policy `public sign por token` en `contratos_documentos` tenía `with check (link_firma_token is not null)` pero faltaba permitir explícitamente `estado in ('enviado', 'firmado')`. Como el UPDATE de firma cambia el estado a `'firmado'`, Postgres rechazaba la fila resultante con `new row violates row-level security policy`. Fix: ampliar el `with check` para que acepte ambos estados. Aplicar el ALTER en producción manualmente.

### Added (Módulo Firma Digital Simple — para freelancers y pymes)
- **Nuevo módulo `/contratos`** con estilo deliberadamente distinto: **light mode local** (papel cremoso `#fdfaf3`), serif display **Fraunces** (Google Fonts) con personalidad editorial, paleta acento lacre cera `#7c2d12` (orange-900). Visualmente NADA en común con Freud (dark + cuero + Bitter) ni con la plataforma. Cuando entrás se siente otro lugar.
- `research/contratos.md` con investigación, marco legal Ley 25.506, gap real en LATAM, funcionalidades aprobadas, branding aprobado.
- `migrations/005_contratos_documentos.sql` con una sola tabla `contratos_documentos` (dos firmantes inline, link_firma_token capability-based, hash_documento sha256). RLS: owner full + lectura/update público SOLO para docs en estado `enviado` con token presente.
- 4 templates argentinos en español natural: Freelance, NDA, Servicios profesionales recurrentes, Locación temporal. En `lib/templates.ts` con sistema de variables `{{key}}`.
- Páginas:
  - `Lista.tsx`: listado de contratos con estado coloreado (borrador / esperando firma / firmado / cancelado).
  - `Nuevo.tsx`: selector de template + form de variables con preview vivo a la derecha.
  - `Detalle.tsx`: preview + acciones (Firmar yo, Generar link de firma, Copiar link, Mandar por WhatsApp, Descargar PDF) + audit trail.
  - `Firmar.tsx`: página pública sin login. La otra parte abre por token, ve el contrato, completa nombre + email + firma (canvas o tipeo), queda registrada con IP + fecha + user-agent + hash.
- Componentes: `PreviewContrato` (Fraunces serif renderizado del markdown), `FirmaCanvas` (toggle dibujo/tipeo con react-signature-canvas), `AuditTrail` (hash + fechas + IPs).
- `lib/hash.ts`: SHA-256 via SubtleCrypto nativa + obtenerIPPublica via ipify.org + generarToken UUID v4.
- `lib/pdf.ts`: generador PDF cliente con html2pdf.js a A4 portrait.
- Storage local + Supabase + migración automática (sigue las 3 reglas durables).
- **Tensión local-first explicada**: borradores funcionan sin login en localStorage, pero el envío de link requiere cuenta porque la otra parte tiene que poder leer el doc desde otro browser. Decisión consciente, documentada en `research/contratos.md` y en el onboarding step 4.
- Onboarding de 4 pasos.
- Dependencias nuevas: `react-markdown`, `react-signature-canvas`, `html2pdf.js`, `@types/react-signature-canvas` (dev).
- Fraunces sumada a Google Fonts en `index.html`.
- Bundle: 2049 modules, 1.67 MB raw, 486 KB gzip. **Lazy loading subió a urgente en BACKLOG**.

### Changed (módulos en home muestran audiencia)
- Cada `config.ts` de módulo sumó campo `audiencia` (plural en minúscula: "psicólogos", "contadores"). La home portfolio en `/` lee los configs directamente (sin hardcodear) y muestra cada módulo como **"Freud · para psicólogos"** con el tagline debajo.
- Regla durable agregada al Prompt 2 del CLAUDE.md: cada nuevo módulo declara `nombre`, `audiencia`, `tagline`, `acento`, `acentoSoft`, `acentoSoftBorder` en su `config.ts`. El portfolio los descubre automáticamente.

### Changed (3 reglas durables nuevas, aplicadas a Freud)
- **Sin landings de bienvenida en módulos**. `Landing.tsx` eliminado en Freud y Contadores. `/freud` y `/contadores` ahora apuntan directo a la app del módulo. La regla queda en `PRODUCT.md` y en el Prompt 2 del `CLAUDE.md` para futuros módulos.
- **Módulos funcionales sin login con storage local**. Implementado repository híbrido en `src/proyectos/psicologos/lib/queries.ts`: si hay `userId` va a Supabase, si no, a `localStorage` via `queriesLocal.ts`. Los componentes pasan `userId | null` indistintamente. Al loguearse, `lib/migracion.ts` migra automáticamente la data local a Supabase (idempotente, no destructiva si falla). Recarga la página al terminar para que las queries lean desde Supabase.
- **Onboarding obligatorio por módulo**. Nuevo componente compartido `src/components/Onboarding.tsx` con stepper de 3-4 pasos, dots, botones Saltar/Atrás/Siguiente, persistido en `localStorage`. Freud declara sus pasos en `src/proyectos/psicologos/onboarding.tsx` (BookOpen → Bienvenido, UserPlus → Cargá tu primer paciente, NotebookPen → Anotá cada sesión en 5 prompts, Shield → Tu data en tu navegador).
- Rutas internas del módulo Freud: pasaron de `/freud/app/...` a `/freud/...`. Todos los Links actualizados.

### Fixed (modales atrapados detrás del subheader)
- Los modales rendereados desde `AuthMenu` (dentro del `BroncoHeader` que tiene `backdrop-blur-md`) quedaban atrapados en el stacking context del header y eran tapados por el subheader del módulo y el contenido. **Root cause**: `backdrop-filter` crea un nuevo stacking context, por lo que `z-50` del modal era relativo a ese contexto, no al viewport.
- Solución: usar `React Portal` (`createPortal(jsx, document.body)`) en los 4 modales del proyecto para que el overlay se monte como hijo directo de `body` y escape de cualquier stacking context. Aplicado a `ModalAuth`, `Modal` genérico de contadores, `ModalNuevoPaciente` y `ModalSesion` de Freud.

### Fixed (impeccable critique de Freud: 6 fixes del opaco)
- **Preview anónimo del Inicio**: se eliminó el `opacity-60` que velaba toda la card-ejemplo "Mariana G." (peor primera impresión posible). Se reemplazó con un badge sutil "VISTA DE EJEMPLO" en la esquina superior, manteniendo legibilidad del 100% del contenido.
- **Acento de Freud**: subido de `#78350f` (amber-900, lightness 43%) a `#a16207` (amber-700, lightness 52%) para que se vea presente contra el fondo oscuro. amber-900 se "comía" en el espacio negativo.
- **acentoSoft alpha**: subido de 0.08 a 0.14 para que el subheader del módulo y los tints sean perceptibles. La borde tinted pasó de 0.25 a 0.40 para reforzar separación.
- **Borders y fondos tinted al calor**: todo el módulo Freud usa ahora `border-stone-800` y `bg-stone-900/950` en lugar de `neutral-*`, coherente con DESIGN.md (neutrales tinteados al calor para evitar el gris muerto).
- **BroncoShell y BroncoHeader globales**: pasaron a `bg-stone-950` para que la plataforma entera tenga tinte cálido, no gris frío.
- **AuthMenu y AuthBanner detectan el módulo activo por ruta** (`src/lib/routeAccent.ts`): cuando estás en `/freud/*` el botón "Crear cuenta" sale marrón cuero, cuando estás en `/contadores/*` sale cyan (el del módulo), en el portfolio sale stone-400 neutro. Antes salía siempre cyan, rompiendo la coherencia del módulo Freud.

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
