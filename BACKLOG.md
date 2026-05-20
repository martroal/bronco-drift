# Backlog — Bronco Drift

Ordenado por prioridad. Movés items entre secciones a medida que avanza el proyecto. La sección **En curso** debería tener máximo 1-2 items a la vez.

> **Misión vigente (2026-05-19)**: aplicaciones funcionales, hermosas y gratis. El contenido de video es secundario. Toda feature pasa por [docs/SELF_CHECK.md](./docs/SELF_CHECK.md) antes de implementarse.

## En curso

- [ ] **Aplicar migration 004 (Freud / psicólogos)** en Supabase. SQL listo en `migrations/004_psicologos_modulo.sql` con 4 tablas + RLS + indexes full-text.

## Próximos pasos (en orden)

1. **Construir módulo Freud (`/freud` + `/freud/app`)** según `research/psicologos.md`. Bitácora estructurada + Timeline por paciente + Pre-sesión recap + búsqueda full-text. Self-check vigente durante todo el build.
2. **Validar con 3-5 psicólogos reales** el MVP de Freud antes de cualquier push de marketing público.
3. **Documentar bugs del día** en `docs/LESSONS_LEARNED.md` (Supabase Site URL, Vercel SPA rewrites, SMTP rate limit, decisión password sobre magic link).

## Diferidos (no urgentes)

- [ ] **Vencet (contadores) — repensar**: el módulo actual queda como caso de estudio en `src/proyectos/contadores/` (ver `docs/SELF_CHECK.md` para el aprendizaje). Si se retoma, arrancar de cero el Prompt 1 con validación de contador real.
- [ ] **Lazy loading por ruta** (`<Route lazy={...} />`). Necesario a partir del módulo 3 para que el bundle inicial no crezca linealmente.
- [ ] **Tests mínimos por módulo** (Vitest + 1 test E2E por feature crítica). Cuando haya 2+ módulos vivos para evitar regresiones cruzadas.
- [ ] **Privacy policy y términos** (legal argentina + GDPR-lite para Google). Antes del primer usuario real.
- [ ] **Decidir nombre real** (reemplazar codename "Bronco Drift"). Antes del primer push de marketing.
- [ ] **Flow "olvidé mi password"**: requiere SMTP funcionando (Resend bien configurado o equivalente).
- [ ] **Custom domain** para el deploy de Vercel.

## Decisiones tomadas (snapshot)

- Stack fijo: Vite + React + TS + Tailwind v3 + react-router v7 + Supabase + Vercel.
- Supabase: proyecto dedicado `oalmngyxgfomtbzysgym` (cuenta `bronco.drift@outlook.com`).
- Repo: [martroal/bronco-drift](https://github.com/martroal/bronco-drift), público.
- Deploy: [bronco-drift.vercel.app](https://bronco-drift.vercel.app/), auto-deploy desde `main`.
- Migraciones: SQL versionado en `migrations/`, aplicación manual al SQL Editor de Supabase (ver [docs/MIGRATIONS.md](./docs/MIGRATIONS.md)).
- **Auth compartida** (1 cuenta global de Bronco Drift) con tabla `bronco_user_nichos` para suscripciones por módulo.
- **Branding propio por módulo**. Cada módulo define nombre comercial, color de acento y tagline en su `config.ts`.
- **URLs anidadas en un deploy único**: `/` portfolio, `/<nicho>` landing pública, `/<nicho>/app` app privada.
- **Auth con email + password** (no magic link), sin "Confirm email" en Supabase.
- **UX de auth no bloqueante**: banner persistente + AuthMenu en header + ModalAuth reusable. La app se explora sin sesión.
- **Misión funcional + hermosa + gratis** prevalece sobre el video (2026-05-19).
