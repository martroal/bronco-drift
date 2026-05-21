# Process — Cómo armamos un módulo

Documento operativo. Describe el ciclo completo de armar un módulo de Bronco Drift desde "tengo una idea de nicho" hasta "está live en producción". Sirve para no improvisar el proceso cada vez y para que cualquiera (vos en 3 meses, un colaborador nuevo, un Claude en otra sesión) pueda continuar el trabajo sin perder la metodología.

> **Tono y reglas que prevalecen sobre todo este proceso**: lo que dice [`SELF_CHECK.md`](./SELF_CHECK.md), [`PRODUCT.md`](../PRODUCT.md) y los Prompts de [`CLAUDE.md`](../CLAUDE.md). Si algo en este doc contradice esos tres, esos ganan.

## Las 5 fases

| Fase | Output | Quién lo hace |
|---|---|---|
| 1. **Investigación** | `research/<nicho>.md` aprobado | Claude propone, vos decidís |
| 2. **Preparación de DB** | Migration SQL versionada + aplicada | Claude escribe SQL, vos lo aplicás |
| 3. **Construcción** | Módulo funcional en local | Claude tipea, vos validás |
| 4. **Polish** | Audit pasado, fixes aplicados | Claude audita, vos priorizás fixes |
| 5. **Validación con usuario real** | Feedback documentado | Vos hablás con 3-5 usuarios del nicho |

Cada fase tiene checkpoints donde vos aprobás antes de avanzar. **Sin tu OK explícito, Claude no pasa a la fase siguiente.**

---

## Fase 1 — Investigación

**Trigger**: "Hola Claude, quiero hacer una app para `<X>`, ¿qué podemos hacer que les sirva?" (o equivalente).

**Lo que Claude hace** (Prompt 1, ver `CLAUDE.md`):

1. WebSearch sobre el nicho: dolor real, apps existentes en LATAM/mundo, marco legal si aplica.
2. Lista 4-6 funcionalidades posibles, cada una evaluada con el **self-check** (valor real / funcional con 200 items / hermoso). Marca cada una como ✅ v0.1, ⏸️ v0.2, o ❌ descartar.
3. Propone branding del módulo: 3-4 opciones de nombre + color de acento + tagline.
4. Propone schema Supabase mínimo para v0.1.
5. Propone alcance del video / del producto v0.1 (SÍ / NO).
6. **Deja la decisión a vos**: qué funcionalidades, qué branding, qué descartar.

**Tu rol**:

- Leer el menú de funcionalidades. Cuestionar.
- Validar que tiene sentido vs lo que el usuario realmente hace hoy.
- **Si dudás del valor**, pedir más investigación o validar con un usuario antes de avanzar.
- Elegir branding o pedir más opciones.
- Cuando estés conforme, decir "OK, vamos con 1+2+3, branding Vencet, color cyan".

**Checkpoint para pasar a Fase 2**: tenés `research/<nicho>.md` con decisiones tomadas (no propuestas) y aprobado explícitamente por vos.

**Antipatrón a evitar**: arrancar a tipear código sin tener el research aprobado. Eso fue lo que hicimos con Vencet la primera vez y resultó en un módulo que fallaba el self-check (ver `SELF_CHECK.md` → aprendizaje Vencet v0.1).

---

## Fase 2 — Preparación de DB

**Lo que Claude hace**:

1. Escribe migration(s) SQL en `migrations/<NNN>_<nicho>_<descripcion>.sql`.
2. Cada migration es **idempotente** (`CREATE TABLE IF NOT EXISTS`, `CREATE POLICY IF NOT EXISTS`, etc).
3. Incluye RLS habilitada + policies (owner full access via `user_id = auth.uid()`).
4. Para módulos con páginas públicas (ej Firma Digital Simple), incluye policies de lectura/escritura pública controlada por token.
5. Hace `git add` + commit + push (la migration vive en el repo ANTES de aplicarse en producción).
6. Te pasa el SQL completo en chat listo para pegar.

**Tu rol**:

- Abrir SQL Editor de Supabase.
- Pegar el SQL.
- Run → verificar "Success" (sin filas devueltas está bien).
- Decirle a Claude "aplicada".

**Lo que Claude hace después**:

- Actualiza `docs/MIGRATIONS.md` con la fila de la migration aplicada.
- Commit + push.

**Checkpoint para pasar a Fase 3**: la migration está aplicada en producción Y registrada en `docs/MIGRATIONS.md`.

**Antipatrón a evitar**: aplicar SQL improvisado en producción sin que esté en el repo. La regla es: el archivo `migrations/*.sql` es la fuente de verdad histórica.

---

## Fase 3 — Construcción

**Trigger**: "Arrancá el módulo `<nicho>` según el plan aprobado" (o equivalente).

**Lo que Claude hace** (Prompt 2, ver `CLAUDE.md`):

1. Releer `SELF_CHECK.md` antes de tipear nada. Si el alcance no pasa las 3 preguntas, parar.
2. Crear estructura en `src/proyectos/<nicho>/`:
   - `config.ts` con branding (`nombre`, `audiencia`, `tagline`, `acento`, `acentoSoft`, `acentoSoftBorder`, opcional `serifDisplay`).
   - `App.tsx` shell del módulo con su routing interno.
   - `onboarding.tsx` con los 3-4 pasos del onboarding inicial.
   - `lib/`: `types.ts`, `queriesSupabase.ts` (lógica Supabase), `queriesLocal.ts` (localStorage), `queries.ts` (repository híbrido), `migracion.ts`.
   - `routes/`: páginas internas del módulo.
   - `components/`: piezas reutilizables internas.
3. Implementar las **3 reglas durables** sin negociación:
   - Sin landing previa (`/<nicho>` directo a la app).
   - Funcional sin login (storage local con migración a Supabase al primer login).
   - Onboarding 3-4 pasos la primera vez.
4. Registrar rutas en `src/App.tsx` con `lazy()` para code splitting.
5. Sumar el módulo a `src/routes/Home.tsx` para que aparezca en el portfolio.
6. Build local (`npm run build`) para validar que tipa.
7. Verificar visualmente con preview server (`preview_start`).
8. Commit por chunk lógico (no 1 mega-commit). CHANGELOG `[Unreleased]` actualizado antes de cada commit.
9. Push a `main`. Vercel hace deploy automático.

**Tu rol**:

- Mirar la implementación en producción cuando termine.
- Probar el flujo completo end-to-end.
- Reportar bugs específicos con screenshots si algo no convence.

**Estilo visual del módulo**:

Cada módulo es un **cosmos visual distinto**. La plataforma es paraguas neutro, pero adentro cada módulo elige su propio tono.

Ejemplos de cómo nos diferenciamos:
- **Freud** (psicólogos): dark warm, marrón cuero, serif Bitter para titulares, vibe cuaderno de consultorio.
- **Firma Digital Simple** (contratos): **light mode local** (papel cremoso), serif Fraunces, acento lacre cera, vibe editorial-papelería.
- **Vencet** (contadores, pausado): cyan SaaS (lo que aprendimos a NO hacer; ver `SELF_CHECK.md`).

La consigna: **al entrar a un módulo, el cambio tonal debe sentirse fuerte**. Si todos los módulos parecen primos, algo está mal.

**Checkpoint para pasar a Fase 4**: el módulo funciona end-to-end en producción. Build verde. No hay errores en console.

---

## Fase 4 — Polish (audit + fixes)

**Trigger**: "Audit /<nicho>" (manda `impeccable audit` u objetivo similar).

**Lo que Claude hace**:

1. Recorre las páginas del módulo en preview.
2. Toma screenshots, snapshots DOM, inspecciona elementos, verifica console.
3. Compila reporte con findings ordenados por severity (Critical / High / Medium / Low).
4. Cada finding tiene: descripción + impacto + fix concreto + tiempo estimado.
5. Verifica self-check explícitamente (¿pasa las 3 preguntas el módulo terminado?).
6. Te entrega plan de fix priorizado.

**Tu rol**:

- Leer el reporte.
- Decidir cuáles fixes aplicar (típicamente todos los Critical + High; Medium y Low quedan para v0.2).
- Dar OK con "aplica todo" o "solo C1, C3, H4".

**Lo que Claude hace después**:

- Aplica los fixes en una pasada coherente.
- Re-verifica con build local.
- Commit + push.

**Checkpoint para pasar a Fase 5**: módulo en producción con Critical y High atendidos. Bundle size razonable. Accesibilidad mínima (touch targets, landmarks, doc title dinámico).

---

## Fase 5 — Validación con usuario real

**Lo que vos hacés**:

1. Conseguir 3-5 usuarios del nicho (psicólogos para Freud, freelancers para Sello, etc.).
2. Mostrarles el módulo en producción durante 10-15 min cada uno.
3. Anotar: qué entienden / qué no entienden, qué les sobra, qué les falta, si lo usarían.
4. Volver con feedback agrupado.

**Lo que Claude hace después con el feedback**:

- Lo registra en `BACKLOG.md` como items específicos.
- Si surge un cambio grande (cambiar el alcance, eliminar feature), abrir nueva fase 1 con la pregunta replanteada.
- Si surgen bugs concretos, aplicar como fixes.

**Checkpoint final**: vos decidís cuándo el módulo está listo para "promover" (push de marketing, dominio propio, branding agresivo). **No promover sin validación**.

---

## Reglas durables que aplican a todo el proceso

Estas no son sugerencias, son ley. Si algún paso del proceso las contradice, los pasos están mal.

### Hard rules

1. **Self-check antes de implementar cualquier feature** (`SELF_CHECK.md`). Tres preguntas: valor real, funcional con 200 items, hermoso.
2. **Sin landings previas en módulos**. `/<nicho>` → app directa.
3. **Funcional sin login** con storage local + migración automática a Supabase al primer login.
4. **Onboarding 3-4 pasos** la primera vez en cada módulo (componente compartido `<Onboarding>`).
5. **Branding propio por módulo** declarado en `config.ts` (nombre, audiencia, tagline, acento). El portfolio lo descubre automáticamente.
6. **Sin SMTP rate limit en mente**: si el módulo depende de mails, configurar Custom SMTP desde el día 1.
7. **Migrations versionadas idempotentes** aplicadas manualmente al SQL Editor.
8. **RLS en TODAS las tablas nuevas** antes de publicar el módulo.

### Soft rules (preferencias del operador)

9. **Brevedad en chat**: una o dos frases por update. Sin "let me know if anything else".
10. **No re-narrar lo que hizo el tool**: mostrar el resultado, no la transcripción.
11. **Em dashes prohibidos en copy**: usar `:`, `;`, `,`, `(...)`, `.`.
12. **PowerShell sobre Bash** en este entorno (paths con espacios).
13. **`npm.cmd` y `npx.cmd`** (no `npm`/`npx`, PS execution policy bloquea shims `.ps1`).
14. **1 commit por batch lógico**. CHANGELOG `[Unreleased]` actualizado ANTES de cada commit.
15. **Commits con co-author**: `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.

### Cosas que NUNCA hacemos

- Esconder el producto detrás de un wall de login.
- Empty states que no permiten probar nada.
- Cards con `opacity` bajo como marcador semántico.
- Acento de marca con lightness similar al fondo.
- Colores cyan / azul corporate como default sin pensar.
- Componentes globales con acento hardcodeado (deben leer del módulo activo via `routeAccent.ts`).
- Modales sin `React Portal` (caen en stacking contexts).
- Modales con `flex items-center` sin overflow scroll (se cortan en viewports cortos).
- Promover un módulo nuevo sin validación con usuarios reales.

---

## Mapa de archivos críticos por fase

| Fase | Archivos donde vive el estado |
|---|---|
| 1 (Investigación) | `research/<nicho>.md` |
| 2 (DB) | `migrations/<NNN>_<nicho>_*.sql`, `docs/MIGRATIONS.md` |
| 3 (Build) | `src/proyectos/<nicho>/**`, `src/App.tsx` (routing top-level), `src/routes/Home.tsx` (portfolio) |
| 4 (Polish) | Findings van a `CHANGELOG.md`; aprendizajes a `docs/LESSONS_LEARNED.md` |
| 5 (Validación) | Feedback va a `BACKLOG.md` |

Si después de leer este doc abrís el repo, los archivos clave que dan contexto son, en orden:

1. `PRODUCT.md` — quién es Bronco Drift, qué somos, cómo hablamos.
2. `docs/SELF_CHECK.md` — la regla maestra.
3. `CLAUDE.md` — Prompts 1 y 2, reglas operativas.
4. `BACKLOG.md` — qué hay pendiente.
5. `CHANGELOG.md` `[Unreleased]` — qué cambió últimamente.

Con eso, el contexto cultural y técnico se recupera en 10 minutos sin que importe cuánto tiempo pasó desde la última sesión.
