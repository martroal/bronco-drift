# Bronco Drift (codename)

Plataforma multi-tenant donde cada semana se publica un módulo para un nicho distinto (contadores, abogados, nutricionistas, etc.). URL pattern: `broncodrift.app/<nicho>`. Cada módulo se construye y graba en una sola sesión de 1 hora.

## Stack fijo (no cambia entre nichos)

- React + Vite + Tailwind
- Supabase (auth compartida, 1 sola DB con tablas prefijadas por nicho)
- Vercel (deploy automático desde GitHub `main`)
- PWA desde día 1 (manifest + service worker)

## Reglas operativas del usuario

- **Windows PowerShell**: usar `npm.cmd` / `npx.cmd` (no `npm` / `npx`).
- **MVP minimalista**: no complicar al pedo. Si una regla teórica empeora la UX real, revisar trade-off antes de aplicarla en bloque.
- **Lint + tests SOLO antes de commit**, no después de cada edit.
- **1 commit por batch lógico** (no mega-commit final). CHANGELOG actualizado antes de cada commit.
- **Commits siempre** con `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- **Brevedad**: una o dos frases por update. Sin "let me know if anything else".
- **No re-narrar lo que hizo el tool**: mostrar el resultado, no la transcripción.

## Reglas de seguridad para grabar en pantalla

- Repo privado en GitHub mientras se desarrolla.
- Credenciales solo en `.env.local` y Vercel env vars. Nunca en código.
- RLS activado en TODAS las tablas nuevas antes de publicar el módulo.
- Pausar OBS (atajo de teclado) cuando se pegan API keys o credenciales.
- Cuenta Supabase y proyecto Vercel separados de Lumina y Optimal (cuentas demo, datos falsos).
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
4. Proponer el schema mínimo de Supabase: 2 a 4 tablas con prefijo `<nicho>_`.
5. Definir el alcance del video: qué SÍ se va a mostrar, qué NO (para no pasarse de 1 hora).

**Output esperado** (en este orden, sin relleno):

```
NICHO: <X>
PUNTOS DE DOLOR:
  1. ...
  2. ...
SOFTWARE ACTUAL:
  - <herramienta>: <limitación>
FEATURE PROPUESTA: <nombre>
  - Qué hace: ...
  - Por qué resuelve un dolor: ...
  - Qué se ve funcionar al final del video: ...
SCHEMA SUPABASE:
  - <nicho>_<tabla>: campos + RLS policy
ALCANCE VIDEO:
  - SÍ: ...
  - NO: ...
```

**No avanzar a construir** hasta que yo apruebe explícitamente la feature propuesta.

---

## PROMPT 2 — EJECUCIÓN DEL MÓDULO DESDE CERO

**Cuando el usuario diga**: "Arrancá el módulo `<nicho>` según el plan aprobado"

**Pre-requisitos** (asumir que ya están listos):

- Repo `bronco-drift` clonado en `C:\Users\MARCEL PC ASUS\Desktop\BRONCO DRIFT`.
- Proyecto Supabase conectado, env vars cargadas en `.env.local` y Vercel.
- Proyecto Vercel conectado a GitHub, auto-deploy de `main` activo.
- Auth compartida ya funcionando en la base.

**Tarea, en orden**:

1. Crear la ruta `/proyectos/<nicho>` con el layout multi-tenant existente.
2. Aplicar el SQL del schema aprobado en Supabase (tablas + RLS).
3. Construir la UI según la feature aprobada. Mobile-first, Tailwind, sin componentes custom complicados.
4. Conectar la UI a Supabase: queries con RLS, no service role keys en el cliente.
5. Commit por feature lógica. CHANGELOG actualizado antes de cada commit.
6. Push a `main`. Esperar deploy de Vercel.
7. Verificar la URL pública (`broncodrift.app/<nicho>`) funcionando antes de cerrar.

**Reglas mientras se graba**:

- No mostrar el contenido de `.env.local` en pantalla.
- No pegar API keys ni connection strings en vivo. Pausar OBS, pegar, retomar.
- Si aparece un error con stack trace que muestra paths del sistema, considerarlo aceptable (no expone credenciales).
- Cada commit con `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- Una sola frase por update mío, sin narrar lo que el tool ya mostró.

**Output al final de la sesión**:

- URL pública funcionando con datos demo cargados.
- README mínimo del módulo (qué hace, cómo se prueba).
- CHANGELOG con entrada del módulo nuevo.

---

## Decisiones tomadas

- **Supabase**: proyecto nuevo dedicado a Bronco Drift (aislado de Lumina y Optimal).
- **Video 0**: diferido. La decisión de grabarlo o no se toma más adelante.

## Pendientes (antes de grabar el primer video de nicho)

- [ ] Nombre real (reemplazar "Bronco Drift").
- [ ] Crear proyecto Supabase nuevo + cargar env vars en `.env.local`.
- [ ] Crear proyecto Vercel + conectar a GitHub + dominio.
- [ ] Scaffold base local: Vite + React + Tailwind + ruta `/proyectos/[slug]` + auth compartida + manifest PWA.
