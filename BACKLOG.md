# Backlog — Bronco Drift

Ordenado por prioridad. Movés items entre secciones a medida que avanza el proyecto. La sección **En curso** debería tener máximo 1-2 items a la vez.

## En curso

- [ ] Aprobar arquitectura "producto vivo" (auth compartida, branding por módulo, URLs anidadas). Pendiente OK explícito del usuario antes de empezar el Prompt 2.

## Próximos pasos (en orden)

1. **Migration 001 — `bronco_user_nichos`**: tabla de suscripciones de usuarios a módulos. Schema definido en `docs/ARCHITECTURE.md`.
2. **Extender Prompt 1**: el output debe incluir nombre comercial + color de acento + tagline del módulo, no solo schema.
3. **Migration 002 — `contadores_clientes` y `contadores_obligaciones`**: del schema aprobado en `research/contadores.md`.
4. **Implementar landing pública `/contadores`**: hero, descripción del producto, CTA "Probalo gratis" → registro.
5. **Implementar app privada `/contadores/app`**: Panel de Vencimientos según `research/contadores.md`.
6. **Grabar el primer video**: workflow OBS + CapCut + edición timelapse.
7. **Custom domain** (opcional, depende de feedback del primer video).

## Diferidos (no urgentes)

- [ ] **Lazy loading por ruta** (`<Route lazy={...} />`). Necesario a partir del módulo 3 para que el bundle inicial no crezca linealmente.
- [ ] **Tests mínimos por módulo** (Vitest + 1 test E2E por feature crítica). Cuando haya 2+ módulos vivos para evitar regresiones cruzadas.
- [ ] **Privacy policy y términos** (legal argentina + GDPR-lite para Google). Antes del primer usuario real.
- [ ] **SMTP propio para magic-link** (Resend, mismo de Lumina/Optimal). Cuando se pase el límite del SMTP default de Supabase (~30 mails/hora).
- [ ] **Decidir nombre real** (reemplazar codename "Bronco Drift"). Antes del primer push de marketing.
- [ ] **Video 0** (setup base grabado). Decisión: diferida.

## Decisiones tomadas (snapshot)

- Stack fijo: Vite + React + TS + Tailwind v3 + react-router v7 + Supabase + Vercel.
- Supabase: proyecto dedicado `oalmngyxgfomtbzysgym` (aislado de Lumina y Optimal).
- Repo: [martroal/bronco-drift](https://github.com/martroal/bronco-drift), público.
- Deploy: [bronco-drift.vercel.app](https://bronco-drift.vercel.app/), auto-deploy desde `main`.
- Migraciones: SQL versionado en `migrations/`, aplicación manual al SQL Editor de Supabase (ver `docs/MIGRATIONS.md`).

## Decisiones pendientes

- Auth compartida vs aislada por nicho.
- Branding propio por módulo vs branding único de plataforma.
- Estructura de URLs: `/` portfolio, `/<nicho>` landing, `/<nicho>/app` la app.
