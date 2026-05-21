# Migrations — Workflow Supabase

Las migraciones son SQL versionado en `migrations/`. Se aplican manualmente al SQL Editor del proyecto Supabase. No usamos Supabase CLI ni migrations automáticas (decisión: control total + visibilidad antes de cada cambio en producción).

## Convención de naming

```
migrations/
├── 001_bronco_user_nichos.sql
├── 002_contadores_clientes.sql
├── 003_contadores_obligaciones.sql
├── 004_abogados_clientes.sql
└── ...
```

- **Prefijo numérico de 3 dígitos** (`001`, `002`, ...). Orden estricto de aplicación.
- **Descripción en snake_case** después del número: nombre de la tabla o feature principal.
- **Una migración por cambio lógico**, no por commit ni por nicho entero. Si un nicho requiere 3 tablas, son 3 migraciones.

## Reglas de contenido

Cada archivo `.sql` debe ser:

1. **Idempotente**: usar `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE POLICY ... IF NOT EXISTS`, etc. Aplicar dos veces no debe romper nada.
2. **Auto-contenida**: incluir todo lo necesario para que el cambio funcione (tabla + RLS + policies + índices). No depender de configuración manual posterior.
3. **Sin DROP destructivo**: si tenés que eliminar algo, hacé una nueva migración con la corrección, no edites una anterior.
4. **Comentario header** con fecha, autor (Claude / vos), y motivo:

```sql
-- 001_bronco_user_nichos.sql
-- 2026-05-XX: Tabla de suscripciones de usuarios a módulos.
-- Permite que un mismo auth.users tenga acceso a varios nichos sin re-registro.
```

## Workflow de aplicación

```
1. Crear archivo en migrations/<numero>_<nombre>.sql
2. Revisar localmente: pegarlo en un SQL Editor de prueba (puede ser otro
   proyecto Supabase descartable o tu instancia local).
3. Commit + push (el archivo queda en git ANTES de aplicarse en producción).
4. Abrir Supabase Dashboard → SQL Editor → New query.
5. Pegar el contenido completo del .sql.
6. Run. Verificar que no hubo errores.
7. Actualizar `docs/MIGRATIONS.md` con la fecha de aplicación (tabla de abajo).
```

## Aplicación cross-environment

Por ahora hay un solo entorno (producción Supabase). Cuando se sume staging:

- Aplicar migración primero en staging → verificar app funciona → aplicar en producción.
- El orden de aplicación debe ser idéntico al de los números del archivo.

## Registro de migraciones aplicadas

| # | Archivo | Proyecto Supabase | Aplicada | Notas |
|---|---|---|---|---|
| 001 | `001_bronco_user_nichos.sql` | `oalmngyxgfomtbzysgym` | 2026-05-19 | Success. Tabla de suscripciones de usuarios a módulos con RLS activado. |
| 002 | `002_contadores_clientes.sql` | `oalmngyxgfomtbzysgym` | 2026-05-19 | Success. Clientes del contador con unique (user_id, cuit) para upsert del import CSV. |
| 003 | `003_contadores_obligaciones.sql` | `oalmngyxgfomtbzysgym` | 2026-05-19 | Success. Obligaciones con FK a clientes e índice (user_id, proxima_fecha) para sort del panel. |
| 004 | `004_psicologos_modulo.sql` | `oalmngyxgfomtbzysgym` | 2026-05-19 | Success. Schema completo del módulo Freud: pacientes, sesiones, tags, sesion_tags. RLS en las 4 tablas + GIN full-text index en español sobre los campos textuales de sesiones. |
| 005 | `005_contratos_documentos.sql` | `oalmngyxgfomtbzysgym` | 2026-05-19 | Success. Tabla del módulo Firma Digital Simple con dos firmantes inline (parte A y B), link_firma_token capability, hash_documento sha256. RLS con owner full access + public read/update solo en estado `enviado` con token. |
| 005b | RLS fix `public sign por token` | `oalmngyxgfomtbzysgym` | 2026-05-19 | Success. ALTER de la policy para permitir `estado in (enviado, firmado)` en el `with check`, no solo `link_firma_token is not null`. Sin este fix, el UPDATE de firma por la parte B violaba RLS. |
| 006 | `006_contratos_dni.sql` | `oalmngyxgfomtbzysgym` | 2026-05-21 | Success. Columnas `parte_a_dni` y `parte_b_dni` nullable agregadas a `contratos_documentos`. Para la aclaración estándar argentina debajo de cada firma. |

> Cuando apliques una migración, agregá una fila acá inmediatamente. Si la app rompe después de aplicarla, esta tabla te dice qué revertir.

## Rollback

Si una migración rompe la app:

1. **No editar el .sql aplicado**. Queda como registro histórico.
2. Crear una migración nueva con número siguiente que revierta el cambio.

Ejemplo: si `005_xyz.sql` agregó una columna NOT NULL que rompe el INSERT existente:

```sql
-- 006_revert_005_xyz.sql
-- 2026-XX-XX: revertir la columna NOT NULL agregada en 005,
-- el frontend no envía ese campo en el flujo de alta.
ALTER TABLE xyz ALTER COLUMN nueva_columna DROP NOT NULL;
```

## Generar tipos TypeScript (futuro, opcional)

Cuando el schema se estabilice, conviene generar `src/lib/database.types.ts` automáticamente desde el proyecto Supabase:

```
npx supabase gen types typescript --project-id oalmngyxgfomtbzysgym > src/lib/database.types.ts
```

Requiere `supabase login` en el CLI. Diferir hasta que sea molesto manejar tipos a mano (~módulo 3 en adelante).
