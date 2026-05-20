# Investigación de nicho — Psicólogos clínicos privados (Argentina / LATAM)

Output del Prompt 1, **aprobado el 2026-05-19**. Pasó el self-check (ver [docs/SELF_CHECK.md](../docs/SELF_CHECK.md)). Base para construir el módulo en `/freud` (landing) y `/freud/app` (app privada).

## Puntos de dolor

1. **Documentación de sesión consume horas semanales**. "Most therapists still spend hours wrestling with SOAP, DAP, and treatment plans" (industria 2026). El psicólogo termina la sesión y posterga las notas; cuando las hace, son blob de texto sin estructura.
2. **Memoria limitada entre sesiones**. Antes de cada sesión hay que releer notas viejas — y eso si están bien escritas. Si no, hay 5 minutos entre paciente y paciente para "acordarse" de qué se trabajó.
3. **Patrones invisibles**. Cuando un tema recurre (trabajo, familia, ansiedad), el psicólogo lo sabe por memoria. No tiene una herramienta que lo muestre.
4. **Tareas / hipótesis sin tracking**. Una tarea propuesta hace 3 semanas se pierde. ¿Se la recordó? ¿Funcionó? ¿La cambió?
5. **Continuidad de proceso**: en pausas largas (vacaciones, días libres), el psicólogo no tiene una vista compacta del proceso del paciente para reconectar.

## Software actual

### Argentinas (saturado en booking + cobro, vacío en clínico)

- **Turnito** — agenda + WhatsApp + Mercado Pago. Gratis para empezar. **Notas: campo de texto libre.**
- **PsicoGestión** — suite operativa. UX vieja. Notas como blob.
- **Psicospace** — agenda + HC cifrada + recordatorios. HC: campo libre.
- **Sesión** — agenda + facturación + WhatsApp. Foco operativo.
- **Psicobit** — agenda + HC + archivos + videollamadas. Hace muchas cosas a la mitad.
- **AgendaPro** — para centros con múltiples profesionales.

> **Punto en común**: todas resuelven la parte operativa (agendar, cobrar, recordar). Ninguna toma en serio el lado clínico (notas estructuradas, evolución, patrones).

### Internacionales (lo que va a llegar)

- **SimplePractice**, **TherapyNotes**, **TheraNest**, **Valant** — EHR completos para US. Caros. Inglés.
- **Upheal**, **Mentalyc**, **JotPsych**, **Supanote**, **Freed**, **TheraPro**, **Twofold** — nueva ola de AI scribe (grabás la sesión, transcribe y estructura). Crecimiento explosivo en 2026. No localizado para Argentina.

## Funcionalidades posibles (filtradas por self-check)

| # | Funcionalidad | Self-check | Decisión |
|---|---|---|---|
| 1 | **Bitácora estructurada por sesión** — prompts cortos (tema central, tarea propuesta, estado emocional, plan próxima) + markdown libre opcional. | ✅ Valor (ninguna app argentina lo hace así) · ✅ Funcional (search + filtros) · ✅ Hermosa (form deliberado) | ✅ v0.1 — núcleo |
| 2 | **Timeline de evolución del paciente** — todas las sesiones cronológicas con tags de temas. Patrones visibles. | ✅ Valor (visualización única) · ✅ Funcional (virtualización para 300+ sesiones) · ✅ Hermosa (visual fuerte) | ✅ v0.1 — diferenciador |
| 3 | **Pre-sesión recap** — antes del próximo turno aparece resumen de las últimas sesiones + tareas pendientes. | ✅ Valor (resuelve dolor concreto) · ✅ Funcional (deriva de 1+2) · ✅ Hermosa (micro-notificación) | ✅ v0.1 — el momento mágico |
| 4 | AI scribe (grabar sesión → nota automática) | ⚠️ Privacy crítico, Whisper caro, validación necesaria | ⏸️ v0.2 |
| 5 | Búsqueda full-text en todas las notas | ✅ Indispensable con 300+ sesiones. Postgres lo tiene nativo. | ✅ v0.1 (lo sumamos al núcleo, es barato) |
| 6 | Recordatorios al paciente sobre tareas | ⚠️ Validar con psicólogos antes | ⏸️ v0.2 |
| 7 | Dashboard mensual del psicólogo | ⚠️ La mayoría ya conoce sus números | ⏸️ v0.2 |
| — | Agenda + cobros + WhatsApp | ❌ Saturado por Turnito/Sesión/etc | ❌ Descartado |

**Foco v0.1**: 1 + 2 + 3 + 5. Forma un producto cerrado: el psicólogo carga sesiones, ve historia con patrones, busca lo que necesita, recibe recap pre-sesión.

## Branding aprobado

| | |
|---|---|
| **Nombre comercial** | **Freud** |
| **Color de acento** | `#78350f` (amber-900, marrón cuero envejecido) |
| **Color soft** | `rgba(120, 53, 15, 0.08)` |
| **Tagline** | *El cuaderno que recuerda por vos.* |

Razones:
- "Freud" tiene guiño cultural fuerte en Argentina (uno de los países más freudianos del mundo). Memorable, único, breve.
- Marrón cuero evoca el cuaderno físico / sillón clásico de consultorio. Se aleja del cyan SaaS.
- Tagline cierra el chiste sin ser pretencioso. Dice qué hace.
- Riesgo conocido: psicólogos cognitivos/sistémicos pueden no identificarse con la marca freudiana. Aceptable porque el producto NO es psicoanalítico (sirve a cualquier corriente), solo la marca tiene ese guiño.

## Schema Supabase

```sql
psicologos_pacientes (
  id uuid PK,
  user_id uuid FK auth.users ON DELETE CASCADE,
  nombre text NOT NULL,
  fecha_nacimiento date NULL,
  primera_sesion date NULL,
  motivo_consulta text NULL,
  estado text NOT NULL DEFAULT 'activo'
    CHECK (estado IN ('activo','pausa','alta')),
  proxima_sesion timestamptz NULL,
  created_at timestamptz DEFAULT now()
)

psicologos_sesiones (
  id uuid PK,
  user_id uuid FK auth.users ON DELETE CASCADE,
  paciente_id uuid FK psicologos_pacientes ON DELETE CASCADE,
  fecha date NOT NULL,
  tema_central text NULL,
  tarea_propuesta text NULL,
  estado_emocional text NULL,
  notas_libres text NULL,
  plan_proxima text NULL,
  created_at timestamptz DEFAULT now()
)

psicologos_tags (
  id uuid PK,
  user_id uuid FK auth.users ON DELETE CASCADE,
  nombre text NOT NULL,
  color text NOT NULL DEFAULT '#78350f',
  UNIQUE (user_id, nombre)
)

psicologos_sesion_tags (
  sesion_id uuid FK psicologos_sesiones ON DELETE CASCADE,
  tag_id uuid FK psicologos_tags ON DELETE CASCADE,
  PRIMARY KEY (sesion_id, tag_id)
)
```

Todo con RLS `user_id = auth.uid()`. Las notas son texto plano (Supabase cifra at-rest a nivel infraestructura). Cifrado de aplicación queda en v0.2 si lo piden los usuarios.

## Alcance del módulo v0.1

**SÍ se construye**:
- Landing pública `/freud` con branding propio + CTA a registro.
- App privada `/freud/app` con auth global de Bronco Drift.
- CRUD de pacientes (alta, edición, archivado, baja).
- CRUD de sesiones por paciente con form estructurado (tema + tarea + estado + libres + plan).
- Vista timeline del paciente con todas sus sesiones, ordenadas y con tags visibles.
- Sistema de tags reutilizable (color por tag, asociación many-to-many con sesiones).
- Pre-sesión recap en la home del psicólogo (próximos pacientes + resumen).
- Búsqueda full-text en sesiones (Postgres GIN index).
- Auto-suscripción al módulo al primer login (vía `bronco_user_nichos`).

**NO se construye en v0.1**:
- Agenda de turnos (es Lumina / otras apps).
- Cobros / facturación.
- Recordatorios al paciente.
- AI scribe / transcripción automática.
- Cifrado de aplicación (solo at-rest del proveedor).
- Multi-profesional (un user = un psicólogo).
- Sincronización con Google Calendar.
- App nativa (es PWA web).

## Estructura de archivos prevista

```
src/proyectos/psicologos/
├── config.ts                    ← branding Freud
├── Landing.tsx                  ← landing pública
├── App.tsx                      ← shell de la app con sidebar/header
├── lib/
│   ├── queries.ts               ← CRUD pacientes/sesiones/tags + búsqueda
│   └── recap.ts                 ← construir el resumen pre-sesión
├── routes/
│   ├── Inicio.tsx               ← pre-sesión recap + lista de hoy
│   ├── Pacientes.tsx            ← lista + búsqueda + alta
│   ├── PacienteDetalle.tsx      ← timeline del paciente
│   └── NuevaSesion.tsx          ← form estructurado de sesión
└── components/
    ├── TimelineSesion.tsx       ← fila de timeline
    ├── TagPill.tsx              ← pill de tag
    ├── ModalNuevoPaciente.tsx
    ├── ModalEditarSesion.tsx
    └── BusquedaGlobal.tsx       ← search bar sticky
```

LOC estimado: 800-1200. Build estimado: 3-5 horas con cuidado de UX.

## Pendiente de validación post-MVP

- Hablar con 3-5 psicólogos reales antes de hacer push de marketing público. Mostrar la app, ver si la usan, qué les sobra y qué les falta.
- Si la respuesta es "ya tengo mis notas en Word, no quiero cambiar" → revisar el self-check #1 (¿realmente aporta valor?).

## Fuentes

- [Best Practice Management Software for Psychologists 2026 (SoftwareFinder)](https://softwarefinder.com/resources/best-practice-management-software-for-psychologists)
- [Best Therapy Notes Software 2026 (Twofold)](https://www.trytwofold.com/blog/best-therapy-notes-software)
- [Best AI Note-Taking Software for Psychologists 2026 (Freed)](https://www.getfreed.ai/resources/best-note-taking-software-therapists)
- [Trends Shaping Therapy 2026 (SimplePractice)](https://www.simplepractice.com/blog/trends-shaping-therapy-2026/)
- [Mejores Software de Reservas para Psicólogos Argentina](https://turnito.app/blog/los-mejores-software-de-reservas-para-psicologos-en-argentina-2026/)
- [PsicoGestión](https://psicogestion.app/), [Psicospace](https://psicospace.app/), [Sesión Argentina](https://app.sesion.com.ar/), [Psicobit](https://psicobit.com/es-ar/)
- [Mental Health PMS: What Vendors Won't Tell You](https://www.icanotes.com/2026/01/02/mental-health-practice-management-software-vendors-wont-tell-you/)
