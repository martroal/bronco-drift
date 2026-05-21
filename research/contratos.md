# Investigación de nicho — Contratos simples + firma electrónica

Output del Prompt 1, **aprobado el 2026-05-19**. Pasó el self-check. Base para construir el módulo en `/contratos`.

## Puntos de dolor

1. **Friction de imprimir + escanear + reenviar** firmando en papel. La mayoría de freelancers/pymes en Argentina no tiene impresora a mano.
2. **Templates en español son escasos o gringos traducidos**. Las apps globales (DocuSign, etc.) ofrecen NDAs en inglés US o español neutro robótico.
3. **Apps existentes son caras o limitadas**. DocuSign desde USD 15/usuario/mes, SignWell free solo 3 docs/mes, etc.
4. **No hay opciones argentinas que se sientan "del país"**. Tono robotic, sin WhatsApp como canal nativo, sin templates locales.
5. **Acuerdos de palabra terminan en disputas** cuando una parte se desentiende. Una firma electrónica simple con audit trail funciona como prueba.

## Marco legal Argentina

**Ley 25.506** distingue:
- **Firma digital con certificado licenciado** → equivale a manuscrita, presunción de validez. Compleja, requiere infra de PKI.
- **Firma electrónica simple** → válida con valor probatorio. Si la contraparte impugna, hay que probar autenticidad (con audit trail: IP, fecha, hash del documento, user agent).

Para contratos privados simples (Freelance, NDAs, Servicios, Locación entre privados, Préstamo entre personas), la firma electrónica simple con buen audit trail **es suficiente**. Es lo que ofrecen DocuSign Standard, Dropbox Sign, etc.

**NO se cubre**: escrituras públicas, contratos laborales bajo convenio, testamentos. Esos requieren escribano.

## Apps existentes — gap claro en LATAM

| App | Lo que falla en LATAM |
|---|---|
| DocuSign / Adobe Sign | Caros, UX traducida sin alma argentina |
| Dropbox Sign | $15/mes, mismo tono gringo |
| PandaDoc / AiDocX | Recientes, paywall fuerte, sin templates ARG |
| SignWell | 3 docs/mes gratis (limitante) |
| Mifiel / Worky / Buk | México-focus |

**Gap real**: templates argentinos en español natural, WhatsApp como canal nativo, sin paywall agresivo.

## Funcionalidades aprobadas v0.1

| # | Funcionalidad | Self-check | Notas |
|---|---|---|---|
| 1 | **4 templates argentinos** en español natural: Freelance, NDA, Servicios profesionales, Locación temporal | ✅ Diferenciador clave | Como archivos `.md` en el módulo con `{{variables}}` |
| 2 | **Editor con variables**: el template tiene `{{nombre_a}}`, `{{cuit_b}}`, etc., el usuario completa un form y el preview se actualiza vivo | ✅ Indispensable | Markdown render + form auto-generado |
| 3 | **Generar link único de firma** + botón WhatsApp/email | ✅ Diferenciador WhatsApp | UUID token, `wa.me/?text=...` |
| 4 | **Página pública de firma** sin login: ver doc, firmar (canvas), captura IP + fecha + UA + hash | ✅ Núcleo legal | Ruta `/contratos/firmar/:token` accesible sin sesión |
| 5 | **PDF final con audit trail** | ✅ Cierre legal | html2pdf.js del lado cliente |
| 6 | **Tracker estado**: borrador / enviado / firmado / cancelado | ✅ | Estado en DB |

**Diferidos a v0.2**:
- Verificación pública por código
- Recordatorios por email automáticos (requiere SMTP)
- Multi-parte (3+ firmantes)
- Importar contrato existente desde Word/PDF
- 4 templates adicionales (Préstamo, Sociedad simple, Trabajo eventual, Autorización viaje)

## Branding aprobado

| | |
|---|---|
| **Nombre comercial** | **Firma Digital Simple** |
| **Audiencia** | freelancers y pymes |
| **Color de acento** | `#7c2d12` (orange-900, rojo lacre cera) |
| **Color soft** | `rgba(124, 45, 18, 0.08)` |
| **Color papel** | `#fdfaf3` (off-white cremoso ámbar) |
| **Tinta** | `#1c1917` (stone-900) |
| **Tagline** | *Mandalo. Firmá. Listo.* |
| **Serif display** | **Fraunces** (Google Fonts, variable) |

**Estilo deliberado**: light mode local del módulo, paleta papel + lacre, tipografía editorial. Visualmente MUY distinto a Freud (dark + cuero + Bitter) y al portfolio (dark + neutral). La sorpresa de entrar a `/contratos` y ver una transición tonal fuerte es parte del valor.

## Schema Supabase

```sql
contratos_documentos (
  id uuid pk,
  user_id uuid (fk auth.users on delete cascade),
  titulo text not null,
  template_slug text,
  contenido_md text not null,
  variables jsonb not null default '{}',
  estado text check (estado in ('borrador','enviado','firmado','cancelado')),

  -- Parte A = creador del contrato (yo)
  parte_a_nombre text, parte_a_email text,
  parte_a_firma_data text, parte_a_firma_tipo text,
  parte_a_firmado_at timestamptz, parte_a_ip text, parte_a_user_agent text,

  -- Parte B = la otra persona que llega por el link público
  parte_b_nombre text, parte_b_email text,
  parte_b_firma_data text, parte_b_firma_tipo text,
  parte_b_firmado_at timestamptz, parte_b_ip text, parte_b_user_agent text,

  link_firma_token text unique,  -- UUID v4 para la URL pública
  hash_documento text,            -- sha256 del contenido_md al cerrarse

  created_at timestamptz default now()
)
```

**RLS**:
- Owner full access para `user_id = auth.uid()`.
- SELECT público SOLO para docs con `estado = 'enviado'` y token presente (la app filtra por token, atacantes no pueden adivinar UUIDs).
- UPDATE público SOLO para docs `enviado` (para que la otra parte firme).

## Tensión local-first (decidido)

A diferencia de Freud, este módulo tiene una restricción técnica: enviar el link de firma y que la otra parte firme **requiere Supabase** (el doc tiene que vivir online para que el otro lo vea desde su browser).

**Modo sin login (localStorage)**:
- Crear contratos, editar, ver preview del documento.
- Descargar PDF en blanco (sin firmas, solo el documento).
- Útil como "lo armo antes de mandar".

**Modo con cuenta (Supabase)**:
- TODO lo anterior +
- Firma propia (yo soy parte A).
- Enviar link único a la otra parte.
- Recibir firma online + audit trail.
- PDF final firmado descargable.

El onboarding explica la diferencia claramente.

## Stack del módulo

- **Markdown render**: `react-markdown` con sanitización
- **Firma canvas**: `react-signature-canvas` (~30KB)
- **PDF**: `html2pdf.js` (cliente, sin servidor)
- **Hash**: SubtleCrypto API nativa del browser
- **WhatsApp share**: link `https://wa.me/?text=...`

**Dependencias nuevas**: `react-markdown`, `react-signature-canvas`, `html2pdf.js`. ~100KB total.

## Estructura de archivos prevista

```
src/proyectos/contratos/
├── config.ts                  ← branding (nombre, audiencia, color lacre, Fraunces)
├── App.tsx                    ← shell + routing interno + light mode wrapper
├── onboarding.tsx             ← 4 steps
├── templates/                 ← archivos markdown con {{vars}}
│   ├── freelance.md
│   ├── nda.md
│   ├── servicios.md
│   └── locacion.md
├── lib/
│   ├── types.ts
│   ├── queries.ts             ← repository híbrido (Supabase + localStorage)
│   ├── queriesLocal.ts
│   ├── migracion.ts
│   ├── templates.ts           ← parser de templates + lista
│   ├── pdf.ts                 ← generador PDF
│   └── hash.ts                ← sha256 del contenido
├── routes/
│   ├── Lista.tsx              ← lista de contratos del user
│   ├── Nuevo.tsx              ← selector de template + editor
│   ├── Detalle.tsx            ← preview + acciones (firmar, enviar, descargar)
│   └── Firmar.tsx             ← página pública por token
└── components/
    ├── EditorContrato.tsx     ← textarea con preview + form de variables
    ├── FirmaCanvas.tsx        ← canvas para dibujar firma
    ├── TemplateCard.tsx
    └── AuditTrail.tsx
```

~900-1100 LOC. Build estimado 3-4 horas.

## Onboarding (4 pasos)

1. **Firma Digital Simple**: contratos en español, firma online, audit trail con valor legal en Argentina (Ley 25.506).
2. **Elegí un template**: Freelance, NDA, Servicios o Locación. Personalizá nombres, montos, fechas.
3. **Firmá vos, mandá el link**: WhatsApp o email a la otra parte. Firma con su dedo o tipeo. Captura IP, fecha y hash.
4. **Sin cuenta podés armar el borrador. Con cuenta podés enviar.** Para que el otro firme online, necesitamos guardar el doc online. La cuenta es gratis.

## Fuentes

- [Ley 25.506 Firma Digital Argentina](https://servicios.infoleg.gob.ar/infolegInternet/anexos/70000-74999/70749/norma.htm)
- [Validez de la Firma Electrónica en Argentina (Contractia)](https://contractia.io/validez-de-la-firma-electronica-en-argentina-odo-lo-que-debes-saber/)
- [Los 8 Mejores Software de Firma Electrónica Gratis 2026](https://aidocx.ai/es/blog/best-free-esignature-software-2026)
- [DocuSign Alternatives Small Business 2026](https://boldsign.com/blogs/docusign-alternatives-small-business/)
- [Best E-Signature Software for Startups 2026](https://aidocx.ai/en/blog/best-esignature-software-startups-2026)
