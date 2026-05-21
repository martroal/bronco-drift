# Bronco Drift (codename)

Plataforma multi-tenant donde se publican módulos para nichos distintos (contadores, abogados, nutricionistas, etc.). Los módulos son **productos vivos, no demos**: los usuarios se registran, los usan y dependen de ellos.

## Misión (prioridad estricta, en este orden)

1. **Funcional** — resuelve un problema real end-to-end.
2. **Hermoso** — genera emoción, no austeridad por default.
3. **Gratis** — accesible sin barreras.

El contenido de video es **secundario**. Si la app no es buena, ningún edit la salva. **Antes de implementar nada**, leer y aplicar [docs/SELF_CHECK.md](./docs/SELF_CHECK.md). Si el alcance no pasa las 3 preguntas, parar y volver al Prompt 1.

## Stack fijo (no cambia entre nichos)

- Vite + React + TypeScript + Tailwind v3
- react-router-dom v7
- Supabase (auth compartida + 1 DB con tablas prefijadas por nicho)
- Vercel (deploy automático desde GitHub `main`)
- PWA desde día 1 (manifest)

## Arquitectura "producto vivo"

Tres niveles de URLs, todos en un solo deploy:

```
/                  → portfolio público (todos los módulos)
/<nicho>           → landing pública del módulo (branding propio, CTA registro)
/<nicho>/app       → la app real (privada, requiere login + suscripción)
```

Cuando un usuario está logueado en `/<nicho>/app`, NUNCA ve "bronco-drift" en el layout. El header, footer y meta tags vienen del config del módulo.

**Auth compartida**: una sola tabla `auth.users` para toda la plataforma. La pertenencia a cada nicho se registra en `bronco_user_nichos (user_id, nicho)`. Si un mismo usuario quiere usar contadores y abogados, se suscribe a los dos sin re-registrarse.

**Branding por módulo**: cada módulo tiene su nombre comercial, color de acento y tagline. Definidos en el research (Prompt 1) y persistidos en `src/proyectos/<nicho>/config.ts`.

**Aislamiento de datos**: RLS por `user_id = auth.uid()` en TODAS las tablas. Sin esto los datos son legibles por cualquier usuario autenticado.

Ver [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) para diagramas completos.

## Reglas operativas del usuario

- **Windows PowerShell**: usar `npm.cmd` / `npx.cmd` (no `npm` / `npx`). Preferir PowerShell sobre Bash en este entorno para paths con espacios.
- **MVP minimalista**: no complicar al pedo. Si una regla teórica empeora la UX real, revisar trade-off antes de aplicarla en bloque.
- **Lint + tests SOLO antes de commit**, no después de cada edit.
- **1 commit por batch lógico** (no mega-commit final). CHANGELOG `[Unreleased]` actualizado ANTES de cada commit.
- **Commits siempre** con `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- **Brevedad**: una o dos frases por update. Sin "let me know if anything else".
- **No re-narrar lo que hizo el tool**: mostrar el resultado, no la transcripción.
- **Em dashes prohibidos en copy** de UI. Reemplazos: `:`, `;`, `,`, `(...)`, `.`.

## Reglas de seguridad para grabar en pantalla

- Repo público OK porque no hay secretos en código. Credenciales solo en `.env.local` y Vercel env vars.
- RLS activado en TODAS las tablas nuevas antes de aplicar la migration en producción.
- Pausar OBS (atajo de teclado) cuando se pegan API keys o credenciales.
- Cuenta Supabase y proyecto Vercel separados de Lumina y Optimal.
- Antes de subir un video: rotar las keys que aparecieron en pantalla.

---

## PROMPT 1 — INVESTIGACIÓN DE NICHO

**Cuando el usuario diga**: "Investigá el nicho de `<X>`" o equivalente ("Hola Claude, quiero hacer una app para `<X>`, ¿qué podemos hacer que les sirva?").

**Antes de empezar**: leer [docs/SELF_CHECK.md](./docs/SELF_CHECK.md). Cada funcionalidad propuesta tiene que pasar las 3 preguntas (valor real, funcional end-to-end, hermosa). Si la funcionalidad es "versión web de Excel/Notion/papel" sin diferenciador, **descartar**, no proponer.

**Tarea**:

1. Buscar online (WebSearch) los 3 a 5 puntos de dolor más mencionados de profesionales de ese nicho en Argentina / LATAM. Citar fuentes al final.
2. Listar el software que usan hoy (Excel, planillas, apps locales, SaaS caros) y sus limitaciones concretas.
3. Proponer **4 a 6 funcionalidades posibles** que resuelvan los dolores o reemplacen/mejoren las herramientas digitales actuales. Para cada una:
   - Qué hace (1 línea)
   - Qué dolor o herramienta digital resuelve
   - Esfuerzo de build: S (15-20 min), M (30-45 min), L (60+ min)
   - Wow factor en video: Alto / Medio / Bajo
   - Recomendación: incluir en v0.1 / diferir a v0.2 / descartar
4. Proponer **branding del módulo**: 3 a 4 opciones de nombre comercial (corto, pegadizo, único, NO "App de X") con color de acento en hex y tagline de una línea cada uno.
5. Proponer **schema mínimo de Supabase** que cubra las funcionalidades recomendadas para v0.1. Tablas con prefijo `<nicho>_`, RLS y FKs.
6. Dejar la **decisión final al usuario** sobre: qué funcionalidades incluir, qué branding elegir, qué se difiere a v0.2. NO avanzar a construir sin esa aprobación explícita.

**Output esperado** (en este orden, sin relleno):

```
NICHO: <X>

PUNTOS DE DOLOR:
  1. ...
  (3-5)

SOFTWARE ACTUAL:
  - <herramienta>: <limitación>

FUNCIONALIDADES POSIBLES:
  1. <Nombre>
     - Resuelve: dolor #N / reemplaza herramienta Y
     - Esfuerzo: S | M | L
     - Wow video: Alto | Medio | Bajo
     - Recomendación: ✅ v0.1 | ⏸️ v0.2 | ❌ descartar
  (4-6 items, con justificación de la recomendación)

BRANDING (propuestas, elegí una):
  - Opción A: <Nombre> | #XXXXXX | "<tagline>"
  - Opción B: ...
  (3-4 opciones)

SCHEMA SUPABASE (para v0.1, ajustable según decisión):
  - <nicho>_<tabla>: campos + RLS + FKs

DECISIÓN PENDIENTE DEL USUARIO:
  - ¿Qué funcionalidades incluís en v0.1?
  - ¿Qué branding elegís?
  - ¿Algo de v0.2 querés mover a v0.1 o viceversa?
```

Después de la aprobación, el output final se persiste en `research/<nicho>.md` con las decisiones tomadas + el alcance del video (SÍ/NO) ya cerrado.

**No avanzar al Prompt 2** hasta que el usuario apruebe explícitamente funcionalidades y branding.

---

## PROMPT 2 — EJECUCIÓN DEL MÓDULO DESDE CERO

**Cuando el usuario diga**: "Arrancá el módulo `<nicho>` según el plan aprobado"

**Antes de tipear código**: releer [docs/SELF_CHECK.md](./docs/SELF_CHECK.md) y verificar que el alcance aprobado pasa las 3 preguntas. Mientras se construye, **no agregar features porque "son fáciles"**. Cada componente visual debe ser deliberado (tipografía, espaciado, color, micro-interacciones). Cada flujo debe funcionar con 200 items, no solo con 5.

**Reglas no negociables para todo módulo nuevo** (establecidas el 2026-05-19):

1. **Sin landing de bienvenida**. La ruta `/<nicho>` lleva directamente a la app. NO se construye una landing previa con hero + features + CTA. Si el módulo necesita "vender" algo, lo hace dentro de la propia app (banner, empty state, onboarding).
2. **Funcional sin login**. El módulo debe poder usarse end-to-end SIN sesión iniciada, persistiendo en `localStorage`. Cuando el usuario se loguea, los datos locales se migran automáticamente a Supabase. Patrón implementado en Freud:
   - `lib/queries.ts` es un repository híbrido que delega a `queriesLocal.ts` o Supabase según `userId | null`.
   - `lib/queriesLocal.ts` implementa la misma API contra `localStorage`.
   - `lib/migracion.ts` migra al primer login (idempotente, no destructiva si falla).
   - Cada operación de query acepta `userId: string | null` en lugar de requerirlo.
3. **Onboarding inicial obligatorio**. Cada módulo declara `onboarding.tsx` con 3-4 pasos usando el componente compartido `<Onboarding>` (`src/components/Onboarding.tsx`). Se muestra la primera vez que el usuario entra (storage key por módulo, `bronco_<nicho>_onboarding_done`). Es saltable. Incluir al menos: bienvenida, primera acción concreta, segunda acción concreta, mención de privacidad/data.

**Pre-requisitos** (asumir que ya están listos):

- Repo `bronco-drift` clonado, dev server corriendo (verificable con `preview_start name="bronco-drift"`).
- Proyecto Supabase conectado, env vars en `.env.local` y Vercel.
- Migration `001_bronco_user_nichos.sql` aplicada en Supabase.
- `research/<nicho>.md` existe con plan aprobado.

**Tarea, en orden**:

1. **Crear migration SQL** en `migrations/<NNN>_<nicho>_<tabla>.sql` para cada tabla del nicho. Una migration por tabla. Idempotente. RLS + policies. Ver [docs/MIGRATIONS.md](./docs/MIGRATIONS.md).
2. **Pasarle el SQL al usuario** para que lo aplique manualmente al SQL Editor de Supabase. Esperar confirmación antes de seguir.
3. **Crear `src/proyectos/<nicho>/config.ts`** con `{ nombre, acentoHex, tagline }` del branding aprobado.
4. **Crear `src/proyectos/<nicho>/Landing.tsx`**: landing pública con hero, descripción, CTA "Probalo gratis" que abre modal de registro o lleva a `/<nicho>/app`.
5. **Crear `src/proyectos/<nicho>/App.tsx`**: la app real. Layout con branding del módulo (NO bronco-drift). Al montarse, verificar suscripción en `bronco_user_nichos`. Si no existe, mostrar modal de alta.
6. **Registrar las rutas** en `src/App.tsx`: `/<nicho>` → Landing, `/<nicho>/app` → App (con guard de auth).
7. **Agregar el módulo a la lista de Home** (`src/routes/Home.tsx`) con estado "live".
8. **Verificar localmente** con preview tools: golden path + caso de usuario no suscripto.
9. **Commit por feature lógica**. CHANGELOG `[Unreleased]` actualizado ANTES de cada commit.
10. **Push a `main`**. Esperar deploy verde de Vercel.
11. **Registrar el deploy** en [docs/DEPLOY_LOG.md](./docs/DEPLOY_LOG.md).
12. **Verificar producción**: visitar `https://bronco-drift.vercel.app/<nicho>` y `/<nicho>/app`. Datos demo cargados.

**Reglas mientras se graba**:

- No mostrar el contenido de `.env.local` en pantalla.
- No pegar API keys ni connection strings en vivo. Pausar OBS, pegar, retomar.
- Em dashes prohibidos en copy de UI (regla durable).
- Cada commit con `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- Una sola frase por update mío, sin narrar lo que el tool ya mostró.

**Output al final de la sesión**:

- URL pública `/<nicho>` y `/<nicho>/app` funcionando con datos demo cargados.
- Migration(s) aplicada(s) en Supabase y registrada(s) en [docs/MIGRATIONS.md](./docs/MIGRATIONS.md).
- CHANGELOG con entrada del módulo nuevo bajo nueva versión `0.X.0`.
- Si hubo gotchas no obvios, entry en [docs/LESSONS_LEARNED.md](./docs/LESSONS_LEARNED.md).

---

## Documentación del proyecto

Todo el estado vivo del proyecto está documentado. Antes de empezar una sesión, leer:

- [docs/SELF_CHECK.md](./docs/SELF_CHECK.md) — **lectura obligatoria**. Misión + las 3 preguntas que cada feature debe pasar. Antimensiones. Aprendizaje de Vencet v0.1.
- [BACKLOG.md](./BACKLOG.md) — qué falta, ordenado por prioridad. Decisiones tomadas y pendientes.
- [CHANGELOG.md](./CHANGELOG.md) — qué cambió en cada versión, en `[Unreleased]` lo que aún no se publicó.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — stack, estructura, diagrama de DB, decisiones de diseño, restricciones operativas.
- [docs/DEPLOY_LOG.md](./docs/DEPLOY_LOG.md) — registro de deploys a producción, éxitos y fallos.
- [docs/LESSONS_LEARNED.md](./docs/LESSONS_LEARNED.md) — bugs no-obvios y cómo evitar repetirlos.
- [docs/MIGRATIONS.md](./docs/MIGRATIONS.md) — workflow para cambios de schema en Supabase.
- `research/<nicho>.md` — output aprobado del Prompt 1 para cada nicho.

## Recordatorios al inicio de cada sesión

1. Releer [docs/SELF_CHECK.md](./docs/SELF_CHECK.md) — sin pasar las 3 preguntas, no se implementa.
2. Leer [BACKLOG.md](./BACKLOG.md) "En curso" para saber dónde quedó el trabajo.
3. Si se va a tocar schema, leer [docs/MIGRATIONS.md](./docs/MIGRATIONS.md) ANTES de escribir el SQL.
4. Si se va a hacer commit, actualizar [CHANGELOG.md](./CHANGELOG.md) `[Unreleased]` ANTES.
5. Si un deploy a Vercel produce un fallo, registrarlo en [docs/DEPLOY_LOG.md](./docs/DEPLOY_LOG.md) y el aprendizaje en [docs/LESSONS_LEARNED.md](./docs/LESSONS_LEARNED.md).
