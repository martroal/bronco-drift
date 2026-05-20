# Arquitectura — Bronco Drift

Este documento describe el sistema completo: cómo está organizado el código, las decisiones de DB y auth, los flujos de usuario y las restricciones operativas.

## Stack

| Capa | Tecnología | Versión | Por qué |
|---|---|---|---|
| Bundler / dev | Vite | 6.x | rápido, HMR ESM nativo |
| UI | React | 18.x | familiar al usuario, ecosistema |
| Tipado | TypeScript | 5.x | strict mode obligatorio |
| Routing | react-router-dom | 7.x | rutas anidadas + lazy loading nativo |
| Estilos | Tailwind CSS | 3.x | sin componentes custom complicados, mobile-first |
| Backend / DB | Supabase | última | Postgres + Auth + RLS + Storage |
| Deploy | Vercel | Hobby | auto-deploy desde GitHub `main` |
| PWA | manifest.webmanifest | — | instalable Android e iOS desde día 1 |

## Estructura de carpetas

```
BRONCO DRIFT/
├── BACKLOG.md
├── CHANGELOG.md
├── CLAUDE.md
├── README.md
├── docs/
│   ├── ARCHITECTURE.md         (este archivo)
│   ├── DEPLOY_LOG.md           (registro de deploys)
│   ├── LESSONS_LEARNED.md      (bugs no-obvios y soluciones)
│   └── MIGRATIONS.md           (workflow Supabase)
├── migrations/
│   └── 001_*.sql               (versionadas, aplicadas manualmente)
├── research/
│   └── <nicho>.md              (output del Prompt 1 aprobado)
├── public/
│   └── manifest.webmanifest
├── src/
│   ├── main.tsx                (entry + BrowserRouter)
│   ├── App.tsx                 (definición de rutas)
│   ├── index.css               (tailwind)
│   ├── lib/
│   │   └── supabase.ts         (cliente único compartido)
│   ├── routes/
│   │   ├── Layout.tsx          (header + main + footer del portfolio)
│   │   ├── Home.tsx            (lista de módulos)
│   │   └── ProjectModule.tsx   (placeholder genérico /proyectos/:slug)
│   ├── proyectos/              (un subdirectorio por nicho activo)
│   │   └── <nicho>/
│   │       ├── Landing.tsx     (pública)
│   │       ├── App.tsx         (privada, requiere login)
│   │       ├── components/
│   │       └── lib/
│   └── components/             (componentes compartidos entre módulos)
├── .claude/launch.json         (config dev server para Preview tools)
├── .env.example
├── .env.local                  (NO commitear)
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json               (root, references)
├── tsconfig.app.json           (src/)
├── tsconfig.node.json          (vite.config.ts, composite)
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

## Diagrama de base de datos

### Tablas compartidas de plataforma

```
auth.users                          bronco_user_nichos
─────────────────────               ────────────────────────
id          uuid (pk)               id           uuid (pk)
email       text                    user_id      uuid (fk → auth.users)
...         (gestionada por         nicho        text (contadores, abogados, ...)
            Supabase Auth)          created_at   timestamptz
                                    UNIQUE (user_id, nicho)

                                    RLS: user_id = auth.uid()
```

`bronco_user_nichos` registra a qué módulos se suscribió cada usuario. Cuando entra a `/<nicho>/app` el frontend chequea si existe la fila; si no, le pide alta.

### Tablas por nicho

Cada nicho declara sus propias tablas con prefijo `<nicho>_`. Ejemplo de **contadores**:

```
contadores_clientes                 contadores_obligaciones
──────────────────────              ──────────────────────────────
id          uuid (pk)               id              uuid (pk)
user_id     uuid (fk auth.users)    user_id         uuid (fk auth.users)
nombre      text                    cliente_id      uuid (fk contadores_clientes)
cuit        text                    impuesto        text
email       text                    proxima_fecha   date
created_at  timestamptz             estado          text ('pendiente'|'presentado')
                                    created_at      timestamptz

RLS: user_id = auth.uid()           RLS: user_id = auth.uid()
                                    INDEX (user_id, proxima_fecha)
```

Reglas para todas las tablas de nicho:
- Prefijo obligatorio `<nicho>_` (evita colisiones).
- Columna `user_id` que referencia `auth.users(id)` con `on delete cascade`.
- Row Level Security activada con policy `user_id = auth.uid()` para todas las operaciones.
- Foreign keys internas al nicho con `on delete cascade`.

## Flujo de URLs y usuario

```
/                                   →  Portfolio público: lista de módulos
                                       (vista de Bronco Drift, branding plataforma)

/<nicho>                            →  Landing pública del producto
                                       (branding propio del nicho, CTA "Probalo gratis")

/<nicho>/app                        →  App real (privada, requiere login)
                                       (branding propio del nicho)
       ↑
       └── chequeo: ¿user_id está en bronco_user_nichos para este nicho?
           ├── sí  → render de la app
           └── no  → modal de alta + insert en bronco_user_nichos
```

Cuando un usuario está logueado y va a `/<nicho>/app`, NO se le muestra "bronco-drift" en ningún lado: el header, footer y meta tags vienen del config del módulo.

## Decisiones tomadas

- **Auth compartida**: una sola tabla `auth.users` para toda la plataforma. Permite que un mismo usuario use varios módulos sin re-registrarse. La aislación de datos la garantiza el RLS por `user_id`.
- **Branding propio por módulo**: cada módulo define nombre comercial, color de acento y tagline. Definidos en el output del Prompt 1, persistidos en `src/proyectos/<nicho>/config.ts`.
- **URLs anidadas en un solo deploy**: `/`, `/<nicho>`, `/<nicho>/app` viven en una sola app Vercel. Si un módulo crece mucho, se puede migrar a su propio dominio sin reescribir nada.
- **Supabase project dedicado**: aislado de Lumina y Optimal. URL/keys en `.env.local` y Vercel env vars.
- **Migraciones SQL versionadas, aplicación manual**: ver `docs/MIGRATIONS.md`.

## Restricciones operativas

- **Bundle size**: a partir del módulo 3, lazy loading de rutas obligatorio (ver `BACKLOG.md`).
- **RLS no opcional**: ninguna tabla se publica sin policies activas. Sin esto los datos son legibles por cualquier usuario autenticado.
- **No service role key en cliente**: solo se usa la `anon public key` (formato `sb_publishable_...`). El cliente nunca debe ver la `service_role` key.
- **Em dashes prohibidos** en copy de UI (regla durable del usuario en sus otros proyectos).
- **Brevedad en commits**: una o dos frases en el body, foco en el "por qué".
