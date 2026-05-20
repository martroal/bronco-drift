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
