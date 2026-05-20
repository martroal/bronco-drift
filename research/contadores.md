# Investigación de nicho — Contadores (Argentina / LATAM)

Output del Prompt 1, **aprobado el 2026-05-19**. Base para construir el módulo en `/contadores` (landing) y `/contadores/app` (app privada).

## Puntos de dolor

1. **Control manual de vencimientos AFIP/ARCA en Excel** — una planilla por estudio, sin alertas automáticas, error humano constante. Es el dolor #1 universal en estudios chicos y medianos.
2. **Burnout administrativo** por carga repetitiva (76% de los contadores cree que la IA podría reducir esa carga significativamente).
3. **Cambios normativos frecuentes** — actualizar la planilla manualmente cada vez que AFIP cambia un calendario o suma un régimen.
4. **Notificaciones del Domicilio Fiscal Electrónico** revisadas cliente por cliente, sin agregador.
5. **Falta de conexión entre sistemas** — el contador junta datos de Excel, facturadores, bancos y AFIP a mano.

## Software actual

- **Excel / Google Sheets** — usado por la mayoría de estudios chicos. Sin alertas, sin colaboración real, error de fórmula silencioso.
- **Witmi, Plan In, Cuonti, Aconpy** (SaaS argentinos especializados) — ARS 15-50k/mes, curva alta, overkill para estudios de 5-20 clientes.
- **Tango Estudios Contables (Axoft)** — enterprise, costoso, instalable, lento.
- **Thomson Reuters** — ecosistema grande para estudios medianos/grandes.

## Funcionalidades posibles

| # | Funcionalidad | Resuelve | Esfuerzo | Wow video | Decisión |
|---|---|---|---|---|---|
| 1 | **Panel de Vencimientos** con badges de color (verde/amarillo/rojo) y "marcar presentado" | Dolor #1 (Excel manual) | M (30-45min) | Alto | ✅ v0.1 |
| 2 | **Import CSV bulk** con upsert por CUIT y dedup automático | Friction de migrar desde Excel | S (20min) | Alto (wow moment del video) | ✅ v0.1 |
| 3 | **Export CSV** de toda la data del usuario | No-lock-in + confianza | S (15min) | Medio | ✅ v0.1 |
| 4 | **Recordatorio email** automático 3 días antes del vencimiento | Dolor #3 (olvidos) | M (40min) + setup SMTP | Bajo | ⏸️ v0.2 — sin SMTP confiable, un mail fallido pierde al usuario |
| 5 | **Dashboard notificaciones DFE** agregando los avisos del Domicilio Fiscal Electrónico | Dolor #4 | L (>1h) | Alto | ⏸️ v0.2 — requiere scraping AFIP, complejidad alta |
| 6 | **Cálculo automático de fechas** según calendario AFIP oficial | Dolor #3 + simplifica carga | L (>1h) + mantenimiento | Medio | ⏸️ v0.2 — requiere mantener el calendario AFIP actualizado |

**Funcionalidades elegidas para v0.1**: 1, 2, 3. Forman un producto completo y autocontenido. Las diferidas se documentan para que feedback post-video apunte a v0.2 sin perder contexto.

## Branding aprobado

| | |
|---|---|
| **Nombre comercial** | **Vencet** |
| **Color de acento** | `#0ea5e9` (cyan-500) |
| **Tagline** | Tus vencimientos AFIP, ordenados. |

Razones de la elección:
- Vencet es corto, único, pegadizo. No hay competencia con ese nombre. No genera confusión legal con AFIP (descartamos "AlAfip"). No suena a fintech de cuotas (descartamos "CuotaCero"). No es genérico (descartamos "Plazo").
- Cyan es profesional sin ser corporate aburrido. Verde es "money obvious", amber es alerta permanente, violeta es startup-cliché.
- El tagline dice qué hace, sin "potenciado con IA" ni "revolucioná tu estudio".

## Schema Supabase para v0.1

Aplicadas con migrations 002 y 003 (ver [docs/MIGRATIONS.md](../docs/MIGRATIONS.md)).

```sql
-- contadores_clientes (migration 002)
id          uuid (pk)
user_id     uuid (fk auth.users on delete cascade)
nombre      text not null
cuit        text not null
email       text
created_at  timestamptz default now()
UNIQUE (user_id, cuit)          -- clave para el upsert del import CSV
INDEX (user_id)
RLS: user_id = auth.uid()

-- contadores_obligaciones (migration 003)
id              uuid (pk)
user_id         uuid (fk auth.users on delete cascade)
cliente_id      uuid (fk contadores_clientes on delete cascade)
impuesto        text not null
proxima_fecha   date not null
estado          text default 'pendiente' check (estado in ('pendiente', 'presentado'))
created_at      timestamptz default now()
INDEX (user_id, proxima_fecha)  -- para el sort del panel
INDEX (cliente_id)
RLS: user_id = auth.uid()
```

Más la tabla compartida `bronco_user_nichos` (migration 001 ya aplicada) que registra la suscripción del usuario al módulo.

## Formato del CSV (import/export)

| nombre | cuit | email | impuesto | proxima_fecha |
|---|---|---|---|---|
| Estudio Pérez SRL | 30712345678 | perez@gmail.com | IVA mensual | 2026-06-15 |
| Estudio Pérez SRL | 30712345678 | perez@gmail.com | Ganancias | 2026-09-30 |
| Juan López | 20223456789 | juan@gmail.com | Monotributo | 2026-06-20 |

5 columnas, headers en minúscula sin tildes. Una fila = un vencimiento de un cliente. El cliente se repite por cada obligación (refleja cómo el contador ya piensa en su Excel).

### Mapeo CSV → tablas

```
Por cada fila del CSV:
  ┌─ UPSERT contadores_clientes WHERE (user_id, cuit) = (mi_uid, fila.cuit)
  │    → devuelve cliente_id (existente o recién creado)
  └─ INSERT contadores_obligaciones
       (user_id, cliente_id, impuesto, proxima_fecha, estado='pendiente')
```

### Validaciones del parser (papaparse)

- `cuit`: 11 dígitos numéricos. Limpia guiones y espacios automáticamente.
- `proxima_fecha`: acepta `YYYY-MM-DD` (ISO) y `DD/MM/YYYY` (formato argentino).
- `nombre`, `impuesto`: no vacíos.
- `email`: opcional. Si está, regex básico.

## Alcance del video

**SÍ se muestra**:
- Login magic-link con Supabase
- Landing pública `/contadores` con branding Vencet
- App privada `/contadores/app` (chequeo suscripción a `bronco_user_nichos`)
- Form para crear cliente (nombre + CUIT)
- Form para agregar obligación a un cliente (impuesto free-text + fecha)
- **Import CSV (wow moment)**: subir un archivo precargado con 10 clientes y 30 obligaciones → aparecen todos de golpe en el panel
- **Export CSV**: botón que descarga la data en un click
- Lista global de obligaciones ordenada por proximidad con badges de color
- Botón "marcar presentado" con optimistic update
- Deploy a Vercel funcionando con datos demo

**NO se muestra** (diferido a v0.2 o descartado):
- Integración real con AFIP/ARCA
- Notificaciones email automáticas (funcionalidad 4)
- Dashboard DFE (funcionalidad 5)
- Cálculo automático de fechas según calendario AFIP (funcionalidad 6)
- Calendario visual tipo Google Calendar
- Multi-usuario dentro del mismo estudio
- Export a PDF (solo CSV)
- Historial de obligaciones ya presentadas

## Stack del módulo

- **Dependencia nueva**: `papaparse` (~50KB, MIT) + `@types/papaparse` (dev).
- **Opcional**: `lucide-react` para íconos (tree-shakeable, ~5KB en el bundle final).
- **NO se suma**: framer-motion, date-fns, react-query, zustand, shadcn/ui. Todas innecesarias para este alcance.

## Estructura de archivos prevista

```
src/proyectos/contadores/
├── config.ts                    ← branding (nombre, color, tagline)
├── Landing.tsx                  ← landing pública
├── App.tsx                      ← la app entera (~250 LOC)
├── lib/
│   ├── queries.ts               ← 5 helpers: listar, importCSV, exportCSV, marcarPresentado, crearCliente
│   ├── csv.ts                   ← parse + unparse + validaciones
│   └── fechas.ts                ← parseFlexible (ISO o DD/MM/YYYY), diasHasta, colorBadge
└── components/
    ├── BadgeProximidad.tsx
    ├── FilaVencimiento.tsx
    ├── ModalImportCSV.tsx
    └── ModalNuevoCliente.tsx
```

**~500 LOC totales**. Build estimado en 60-75 min.

## Fuentes

- [Bienestar contable en Argentina (Thomson Reuters)](https://www.thomsonreuters.com.ar/es/soluciones-fiscales-contables-gestion/blog-contadores/burnout-contable.html)
- [Automatización contable: Sé infalible con los vencimientos (Thomson Reuters)](https://www.thomsonreuters.com.ar/es/soluciones-fiscales-contables-gestion/blog-contadores/automatizacion-contable-se-infalible-con-los-vencimientos.html)
- [Witmi](https://witmi.com.ar/)
- [Cuonti](https://www.cuonti.com)
- [Mejores Software de Contabilidad para PYMES en Argentina 2026](https://www.todaslascriticas.com.ar/los-mejores-software-de-contabilidad-para-pymes-en-argentina-en-2026-automatizacion-cloud-y-escalabilidad/)
