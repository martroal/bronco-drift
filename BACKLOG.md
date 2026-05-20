# Backlog — Bronco Drift

Ordenado por prioridad. Movés items entre secciones a medida que avanza el proyecto. La sección **En curso** debería tener máximo 1-2 items a la vez.

## En curso

- [ ] **Construir módulo Vencet (`/contadores` + `/contadores/app`)**: ver alcance, stack y estructura en `research/contadores.md`. ~500 LOC, ~60-75 min de build. Funcionalidades v0.1: Panel de Vencimientos + Import CSV + Export CSV.

## Próximos pasos (en orden)

1. **Grabar el primer video** (workflow OBS + CapCut + edición timelapse). Demo CSV listo en `demo/contadores-ejemplo.csv` para el wow moment.
2. **Documentar bugs del día** en `docs/LESSONS_LEARNED.md` (Supabase Site URL, Vercel SPA rewrites, SMTP rate limit, switch a password auth).
3. **Custom domain** (opcional, depende de feedback del primer video).

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
- Migraciones: SQL versionado en `migrations/`, aplicación manual al SQL Editor de Supabase (ver [docs/MIGRATIONS.md](./docs/MIGRATIONS.md)).
- **Auth compartida** (1 cuenta global de Bronco Drift). Pertenencia a módulos en tabla `bronco_user_nichos`.
- **Branding propio por módulo**. Cada módulo define nombre comercial, color de acento y tagline en su `config.ts`.
- **URLs anidadas en un deploy único**: `/` portfolio, `/<nicho>` landing pública, `/<nicho>/app` app privada.
