# Deploy Log — Bronco Drift

Registro de deploys a producción. Sirve para reconstruir qué cambió en cada deploy y diagnosticar regresiones.

Una fila por deploy. Cuando hay un fallo, anotar la causa raíz y enlazar al fix.

| Fecha (UTC-3) | Commit | Estado | Notas |
|---|---|---|---|
| 2026-05-19 23:03 | [`3539872`](https://github.com/martroal/bronco-drift/commit/3539872) | ❌ Failed | Initial scaffold. Build falló en Vercel con 4 errores de TS (`node:path`, `__dirname`, composite sin `composite:true`, composite con `noEmit`). Ver [LESSONS_LEARNED.md](./LESSONS_LEARNED.md#2026-05-19-typescript-build-fallo-en-vercel-pero-funcionaba-en-dev). |
| 2026-05-19 ~23:10 | [`5228b47`](https://github.com/martroal/bronco-drift/commit/5228b47) | ✅ Success | Fix tsconfig (split + composite + outDir + @types/node). Producción en [bronco-drift.vercel.app](https://bronco-drift.vercel.app/). Supabase conectado verificado. |
