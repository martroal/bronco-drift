# Bronco Drift (codename)

Plataforma multi-tenant. Cada semana se publica un módulo para un nicho distinto (contadores, abogados, nutricionistas, etc.). Los módulos son productos vivos: los usuarios se registran y los usan, no son demos descartables.

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

**Cuando el usuario diga**: "Investigá el nicho de `<X>`"

**Tarea**:

1. Buscar online (WebSearch) los 3 a 5 puntos de dolor más mencionados de profesionales de ese nicho en Argentina / LATAM. Citar fuentes.
2. Listar el software que usan hoy (Excel, planillas, apps locales, SaaS caros) y sus limitaciones concretas.
3. Identificar UNA feature mínima que:
   - Resuelva un dolor real de la lista
   - Se pueda construir en 1 hora con el stack fijo
   - Sea grabable visualmente (algo que se "vea" funcionar al final)
4. Proponer **branding del módulo**: nombre comercial corto (no "App de X"), color de acento en hex, tagline de una línea.
5. Proponer el schema mínimo de Supabase: 2 a 4 tablas con prefijo `<nicho>_`. Incluir RLS y FKs.
6. Definir el alcance del video: qué SÍ se va a mostrar, qué NO (para no pasarse de 1 hora).

**Output esperado** (en este orden, sin relleno):

```
NICHO: <X>
PUNTOS DE DOLOR:
  1. ...
  2. ...
SOFTWARE ACTUAL:
  - <herramienta>: <limitación>
FEATURE PROPUESTA: <nombre interno>
  - Qué hace: ...
  - Por qué resuelve un dolor: ...
  - Qué se ve funcionar al final del video: ...
BRANDING DEL MÓDULO:
  - Nombre comercial: <Nombre> (corto, pegadizo, no genérico)
  - Color de acento: #XXXXXX
  - Tagline: <una línea>
SCHEMA SUPABASE:
  - <nicho>_<tabla>: campos + RLS policy
ALCANCE VIDEO:
  - SÍ: ...
  - NO: ...
```

**No avanzar a construir** hasta que yo apruebe explícitamente la feature, el branding y el schema.

---

## PROMPT 2 — EJECUCIÓN DEL MÓDULO DESDE CERO

**Cuando el usuario diga**: "Arrancá el módulo `<nicho>` según el plan aprobado"

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

- [BACKLOG.md](./BACKLOG.md) — qué falta, ordenado por prioridad. Decisiones tomadas y pendientes.
- [CHANGELOG.md](./CHANGELOG.md) — qué cambió en cada versión, en `[Unreleased]` lo que aún no se publicó.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — stack, estructura, diagrama de DB, decisiones de diseño, restricciones operativas.
- [docs/DEPLOY_LOG.md](./docs/DEPLOY_LOG.md) — registro de deploys a producción, éxitos y fallos.
- [docs/LESSONS_LEARNED.md](./docs/LESSONS_LEARNED.md) — bugs no-obvios y cómo evitar repetirlos.
- [docs/MIGRATIONS.md](./docs/MIGRATIONS.md) — workflow para cambios de schema en Supabase.
- `research/<nicho>.md` — output aprobado del Prompt 1 para cada nicho.

## Recordatorios al inicio de cada sesión

1. Leer [BACKLOG.md](./BACKLOG.md) "En curso" para saber dónde quedó el trabajo.
2. Si se va a tocar schema, leer [docs/MIGRATIONS.md](./docs/MIGRATIONS.md) ANTES de escribir el SQL.
3. Si se va a hacer commit, actualizar [CHANGELOG.md](./CHANGELOG.md) `[Unreleased]` ANTES.
4. Si un deploy a Vercel produce un fallo, registrarlo en [docs/DEPLOY_LOG.md](./docs/DEPLOY_LOG.md) y el aprendizaje en [docs/LESSONS_LEARNED.md](./docs/LESSONS_LEARNED.md).
