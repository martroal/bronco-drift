# Investigación de nicho — Contadores (Argentina / LATAM)

Output del Prompt 1, aprobado el 2026-05-19. Base para construir el módulo en `/contadores` (landing pública) y `/contadores/app` (app privada).

> **Última revisión**: 2026-05-19. Alcance extendido para incluir Import/Export CSV (decisión: sin esto, ningún contador real va a recargar 100 entradas de su Excel a mano).

## Puntos de dolor

1. Control manual de vencimientos AFIP/ARCA en Excel: una planilla por estudio, sin alertas automáticas, error humano constante. Es el dolor #1 universal en estudios chicos y medianos.
2. Burnout administrativo por carga repetitiva (76% de los contadores cree que la IA podría reducir esa carga significativamente).
3. Cambios normativos frecuentes — actualizar la planilla manualmente cada vez que AFIP cambia un calendario o suma un régimen.
4. Notificaciones del Domicilio Fiscal Electrónico revisadas cliente por cliente, sin agregador.
5. Falta de conexión entre sistemas: el contador junta datos de Excel, facturadores, bancos y AFIP a mano.

## Software actual

- **Excel / Google Sheets** — usado por la mayoría de estudios chicos. Limitación: sin alertas, sin colaboración real, error de fórmula silencioso.
- **Witmi, Plan In, Cuonti, Aconpy** (SaaS argentinos especializados) — Limitación: suscripción mensual ARS 15k-50k, curva de aprendizaje, overkill para estudios de 5-20 clientes.
- **Tango Estudios Contables (Axoft)** — enterprise, costoso, instalable. Limitación: no cloud-native, lento, sobrecargado de features.
- **Thomson Reuters** — ecosistema grande pensado para estudios medianos/grandes.

## Feature aprobada: Panel de Vencimientos

- **Qué hace**: lista los próximos vencimientos de TODOS los clientes ordenados por proximidad, con badges de color (verde >7 días, amarillo 3-7, rojo <3). Click para marcar como "presentado" y se rota al siguiente vencimiento.
- **Por qué resuelve un dolor**: ataca directamente el #1 (control manual de vencimientos). Reemplaza la planilla Excel del contador en 30 segundos.
- **Qué se ve funcionar al final del video**: panel con 5-6 clientes demo cargados, badges de color visibles, animación al marcar presentado, persistencia en Supabase (refresh y los datos siguen ahí).

## Schema Supabase

```sql
-- contadores_clientes
create table contadores_clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  cuit text not null,
  email text,
  created_at timestamptz default now()
);

alter table contadores_clientes enable row level security;

create policy "owner full access"
  on contadores_clientes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- contadores_obligaciones
create table contadores_obligaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references contadores_clientes(id) on delete cascade,
  impuesto text not null,
  proxima_fecha date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'presentado')),
  created_at timestamptz default now()
);

alter table contadores_obligaciones enable row level security;

create policy "owner full access"
  on contadores_obligaciones for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index contadores_obligaciones_user_fecha_idx
  on contadores_obligaciones (user_id, proxima_fecha);
```

## Import / Export CSV

Carga manual uno por uno es buena para demo, pero ningún contador real va a recargar 100 entradas de su Excel a mano. Por eso el alcance incluye import/export desde el día 1.

### Formato del CSV (5 columnas, denormalizado)

| nombre | cuit | email | impuesto | proxima_fecha |
|---|---|---|---|---|
| Estudio Pérez SRL | 30712345678 | perez@gmail.com | IVA mensual | 2026-06-15 |
| Estudio Pérez SRL | 30712345678 | perez@gmail.com | Ganancias | 2026-09-30 |
| Juan López | 20223456789 | juan@gmail.com | Monotributo | 2026-06-20 |

Headers en minúscula, sin tildes. Una fila = un vencimiento de un cliente. El cliente se repite por cada obligación (refleja cómo el contador ya piensa en su Excel).

### Mapeo CSV → tablas

```
Por cada fila del CSV:
  ┌─ UPSERT contadores_clientes WHERE (user_id, cuit) = (mi_uid, fila.cuit)
  │    → devuelve cliente_id (existente o recién creado)
  └─ INSERT contadores_obligaciones
       (user_id, cliente_id, impuesto, proxima_fecha, estado='pendiente')
```

Resultado: "Estudio Pérez SRL" se inserta UNA vez en `contadores_clientes`, sus dos obligaciones quedan apuntando al mismo `cliente_id`.

### Validaciones del parser (papaparse)

- `cuit`: 11 dígitos numéricos. Limpia guiones y espacios automáticamente.
- `proxima_fecha`: acepta `YYYY-MM-DD` (ISO) y `DD/MM/YYYY` (formato argentino).
- `nombre`, `impuesto`: no vacíos.
- `email`: opcional. Si está, regex básico.

### UX del flujo

1. Botón **"Descargar template CSV"** → archivo de ejemplo con 2 filas demo.
2. Botón **"Importar CSV"** → file picker.
3. Tras parsear: preview de las primeras 5 filas + cantidad total + warnings de validación.
4. Botón **"Confirmar import"** → procesa y muestra "X clientes creados, Y obligaciones cargadas".

### Export

Botón **"Descargar mis datos"** → CSV idéntico al template, a partir de un JOIN de `contadores_clientes` y `contadores_obligaciones`. Le da al contador confianza ("si la app se cae, tengo mi data") y permite migrar a otra herramienta sin lock-in.

### Dependencia nueva

- `papaparse` (~50KB, MIT). Single-purpose, sin transitivas. Maneja CSV de forma robusta (quotes, escapes, BOM).

## Alcance del video

**SÍ se muestra**:
- Login magic-link con Supabase
- Form para crear cliente (nombre + CUIT)
- Form para agregar obligación a un cliente (impuesto free-text + fecha)
- **Import CSV (wow moment)**: subir un archivo precargado con 10 clientes y 30 obligaciones → aparecen todos de golpe en el panel
- **Export CSV**: botón que descarga la data en un click
- Lista global de obligaciones ordenada por proximidad con badges de color
- Botón "marcar presentado" que actualiza estado
- Deploy a Vercel funcionando con datos demo

**NO se muestra**:
- Integración real con AFIP/ARCA
- Notificaciones email/WhatsApp
- Calendario visual tipo Google Calendar
- Cálculo automático de próxima fecha según calendario AFIP real
- Multi-usuario dentro del mismo estudio
- Export a PDF (solo CSV)
- Historial de obligaciones ya presentadas

## Fuentes

- [Bienestar contable en Argentina (Thomson Reuters)](https://www.thomsonreuters.com.ar/es/soluciones-fiscales-contables-gestion/blog-contadores/burnout-contable.html)
- [Automatización contable: Sé infalible con los vencimientos (Thomson Reuters)](https://www.thomsonreuters.com.ar/es/soluciones-fiscales-contables-gestion/blog-contadores/automatizacion-contable-se-infalible-con-los-vencimientos.html)
- [Witmi](https://witmi.com.ar/)
- [Cuonti](https://www.cuonti.com)
- [Mejores Software de Contabilidad para PYMES en Argentina 2026](https://www.todaslascriticas.com.ar/los-mejores-software-de-contabilidad-para-pymes-en-argentina-en-2026-automatizacion-cloud-y-escalabilidad/)
