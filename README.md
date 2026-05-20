# Bronco Drift (codename)

Plataforma multi-tenant. Cada módulo es una app para un nicho distinto, accesible en `/proyectos/:slug`. Un módulo nuevo por semana, grabado y publicado como video.

## Stack

- Vite + React + TypeScript
- React Router v7
- Tailwind CSS v3
- Supabase (auth + DB compartida con tablas prefijadas por nicho)
- Vercel (deploy automático desde `main`)
- PWA (manifest.webmanifest)

## Setup local

```
npm install
cp .env.example .env.local
# completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

## Estructura

```
src/
├── main.tsx              # entry + BrowserRouter
├── App.tsx               # rutas
├── index.css             # tailwind
├── lib/
│   └── supabase.ts       # cliente compartido
├── routes/
│   ├── Layout.tsx        # header + main + footer
│   ├── Home.tsx          # listado de módulos
│   └── ProjectModule.tsx # placeholder por nicho
└── components/           # componentes compartidos (vacío por ahora)
```

Cada nicho nuevo añade su carpeta `src/proyectos/<slug>/` con su feature específica, y la ruta `/proyectos/<slug>` la renderiza.

## Reglas operativas y guion de los videos

Ver [CLAUDE.md](./CLAUDE.md).
