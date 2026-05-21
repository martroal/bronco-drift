# Lessons Learned — Bronco Drift

Bugs no obvios, sorpresas del stack y soluciones aplicadas. Sirve para no tropezar dos veces con la misma piedra y para acelerar el onboarding de cualquier persona (incluido vos mismo en 3 meses).

Una entrada por lección. Cada una incluye **Síntoma**, **Causa raíz**, **Solución** y **Cómo evitar**.

---

## Setup inicial (scaffold + tooling)

### 2026-05-19 — TypeScript build falló en Vercel pero funcionaba en dev

**Síntoma**: `npm run dev` local funcionaba sin errores. En Vercel, `npm run build` falló con 4 errores de TS:

```
vite.config.ts(3,18): error TS2307: Cannot find module 'node:path'
vite.config.ts(9,25): error TS2304: Cannot find name '__dirname'
tsconfig.json: error TS6306: Referenced project must have setting "composite": true
tsconfig.json: error TS6310: Referenced project may not disable emit
```

**Causa raíz**: Vite en dev usa esbuild para transformar TypeScript, que es laxo y NO valida tipos. `npm run build` corre `tsc -b` primero, que es estricto. El scaffold inicial:
- No incluía `@types/node` → `node:path` y `__dirname` no se resolvían.
- Tenía `tsconfig.node.json` referenciado en el root sin `composite: true` (obligatorio en references) ni emit habilitado (composite es incompatible con `noEmit: true`).

**Solución** (commit `5228b47`):
- Agregar `@types/node` a devDependencies.
- Split de tsconfigs al patrón estándar de Vite: root + `tsconfig.app.json` + `tsconfig.node.json`.
- `tsconfig.node.json` con `composite: true` y `outDir: ./node_modules/.tmp/node` (composite obliga a emitir; redirigir a `.tmp/` evita que ensucie el repo con `vite.config.{js,d.ts}`).
- `.gitignore` blinda `vite.config.{js,d.ts}` y `*.tsbuildinfo` como red de seguridad.

**Cómo evitar**:
- **Correr `npm run build` localmente antes del primer push** del scaffold. Si pasa local, pasa en Vercel (mismo `tsc -b`).
- Cuando uses `references` en tsconfig, los referenciados SIEMPRE necesitan `composite: true` y NO pueden tener `noEmit: true`. Si querés evitar emit ensuciando el repo, configurá `outDir` a `node_modules/.tmp/` o similar.

---

### 2026-05-19 — `npm.cmd` fallaba en Bash con path con espacios

**Síntoma**: Bash devolvió error "`C:\Program` no se reconoce" al correr `npm.cmd install --prefix "C:\Users\MARCEL PC ASUS\Desktop\BRONCO DRIFT"`. Mismo comando en PowerShell funcionó perfecto.

**Causa raíz**: el shim de `npm.cmd` invoca `node.exe` desde `C:\Program Files\nodejs\` y Bash en Windows no escapa bien los espacios cuando pasa argumentos al subproceso. PowerShell sí los maneja.

**Solución**: usar PowerShell con `Set-Location "<path>"` + `npm.cmd install` directo.

**Cómo evitar**: en este proyecto, ejecutar npm/git desde PowerShell. Bash queda para shell scripts puros sin paths con espacios.

---

### 2026-05-19 — preview_start no encontraba el servidor

**Síntoma**: `preview_start name="bronco-drift"` falló con "No server named 'bronco-drift' found in .claude/launch.json".

**Causa raíz**: el `launch.json` que lee Claude Preview vive en el home `~/.claude/launch.json`, no en `<proyecto>/.claude/launch.json`. Crear el archivo local no alcanza.

**Solución**: agregar la entrada del proyecto al `launch.json` global, con `runtimeExecutable` apuntando al path absoluto de `npm.cmd` (`C:\\Program Files\\nodejs\\npm.cmd`) y `cwd` al directorio del proyecto.

**Cómo evitar**: cuando agregues un proyecto nuevo, editá `~/.claude/launch.json` global. Tener el local del proyecto está bien para autodocumentación, pero no se carga.

---

## Deploy y producción

### 2026-05-19 — Vercel devolvía 404 en rutas anidadas (`/contadores/app`)

**Síntoma**: el home `/` funcionaba en producción, pero `/contadores/app` (o cualquier ruta client-side de React Router) tiraba 404 NOT_FOUND de Vercel. Especialmente molesto cuando el magic-link de Supabase Auth redirigía a esa ruta.

**Causa raíz**: Vercel sirve archivos estáticos. Como `/contadores/app` no es un archivo en `dist/`, devuelve 404 por default. React Router nunca llega a procesar la URL porque la app ni se carga.

**Solución**: agregar `vercel.json` con rewrite:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Eso le dice a Vercel "para cualquier URL, servime `index.html`". React Router carga y desde JS toma el control del path.

**Cómo evitar**: cualquier SPA en Vercel necesita este rewrite. Es parte del setup base, debería estar desde el primer commit del scaffold.

---

### 2026-05-19 — Supabase Site URL default `localhost:3000` rompía magic link en producción

**Síntoma**: el usuario pedía magic link en `bronco-drift.vercel.app/contadores/app`, recibía el mail, clickeaba, y caía en `localhost:3000` (no en producción). Como el browser no tiene server local corriendo, "ERR_CONNECTION_REFUSED".

**Causa raíz**: el Site URL por defecto de Supabase Auth es `localhost:3000`. Cuando el cliente pasa `emailRedirectTo: window.location.origin + ...`, Supabase valida que esa URL esté en la whitelist de Additional Redirect URLs. Si no está, **cae silenciosamente al Site URL default**.

**Solución**: configurar en [Authentication → URL Configuration](https://supabase.com/dashboard):
- Site URL: la URL de producción (ej `https://bronco-drift.vercel.app`).
- Additional Redirect URLs: agregar `https://bronco-drift.vercel.app/**` y `http://localhost:5173/**` para dev.

**Cómo evitar**: configurar Site URL + Redirect URLs como parte del setup inicial del proyecto Supabase, antes del primer test de auth.

---

### 2026-05-19 — SMTP rate limit del Supabase default

**Síntoma**: al probar magic link muchas veces durante el debug, Supabase empezó a devolver `email rate limit exceeded` y dejó de mandar mails.

**Causa raíz**: el SMTP default que Supabase provee es muy limitado: alrededor de 3-4 mails por hora por usuario/IP en plan free. Ideal para signup confirmation ocasional, pésimo para testing intensivo.

**Solución corta**: esperar 60 minutos o usar otro email.

**Solución correcta**: configurar Custom SMTP con un proveedor real (Resend, SendGrid, Mailgun). El plan free de Resend permite 100 emails/día, suficiente para arrancar.

**Cómo evitar**: si vas a confiar en el envío de mails como parte del producto (magic link, recovery, notificaciones), configurá Custom SMTP desde el día 1 con dominio propio o reutilizado. El default solo sirve para que Supabase mande el primer mail de signup en producción muy chica.

---

### 2026-05-19 — Resend rechazó sender de dominio no verificado

**Síntoma**: tras configurar Custom SMTP con Resend, el Dashboard de Supabase devolvía:
```
500: Error sending recovery email
gomail: could not send email 1: 550 The outlook.com domain is not verified. 
Please, add and verify your domain on https://resend.com/domains
```

**Causa raíz**: el Sender email que se puso en Supabase era `bronco.drift@outlook.com` (el email del owner del proyecto). Resend (como cualquier SMTP serio) exige que el remitente sea de un dominio que vos demostraste poseer (con registros DNS). `outlook.com` es de Microsoft, no es tuyo, no podés mandar desde ahí.

**Solución**: cambiar el Sender a un email de un dominio Verified en la cuenta de Resend. Si todavía no tenés dominio propio, reutilizar uno que ya esté verificado (en este caso, `luminaagenda.click` de otro proyecto).

**Cómo evitar**: a la hora de configurar SMTP custom:
1. Verificá el dominio en Resend primero (TXT + MX + CNAME).
2. Solo después, usá ese dominio como Sender en Supabase.
3. **Una API key separada por proyecto** (separation of concerns: si tenés que rotarla, no rompe los otros).

---

## React, CSS y rendering

### 2026-05-19 — Modal atrapado en stacking context del header sticky

**Síntoma**: el `ModalAuth` rendereado desde el `AuthMenu` (que vive dentro del `BroncoHeader` sticky) quedaba **detrás** del subheader del módulo y los tabs internos. El `z-50` del modal no escapaba.

**Causa raíz**: el `BroncoHeader` tenía `backdrop-blur-md` (para el efecto frosted glass). Per spec CSS, **cualquier valor de `backdrop-filter` distinto de `none` crea un stacking context propio**. Como el modal estaba siendo renderizado dentro del árbol DOM del header (vía `AuthMenu`), su `z-50` era relativo a ese stacking context limitado a los pixels del header.

**Solución**: usar `React Portal` (`createPortal(jsx, document.body)`) en todos los modales. El portal monta el overlay como hijo directo del `<body>`, escapando de cualquier stacking context interno. Aplicado a `ModalAuth`, `Modal` genérico, `ModalNuevoPaciente`, `ModalSesion`.

**Cómo evitar**: **los modales SIEMPRE deben ir por Portal**, no importa qué se ponga después en la app. Es regla durable. Cualquier estilo (filter, transform, perspective, will-change, contain) puede crear un stacking context y atrapar al modal.

---

### 2026-05-19 — Modal se cortaba arriba en viewports cortos

**Síntoma**: en mobile con teclado abierto, o en laptops chicas, el modal con form largo se cortaba arriba. No había scroll, no se podía llegar a la parte superior del dialog.

**Causa raíz**: pattern original `fixed inset-0 flex items-center justify-center` centra el modal sin permitir scroll si el contenido excede la viewport.

**Solución**: pattern correcto:

```tsx
<div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm" onClick={onClose}>
  <div className="flex min-h-full items-center justify-center p-4">
    <div className="modal-content my-auto" onClick={(e) => e.stopPropagation()}>
      {/* contenido */}
    </div>
  </div>
</div>
```

El outer `fixed inset-0 overflow-y-auto` permite scroll. El inner `flex min-h-full items-center` centra cuando hay espacio y deja scrollear cuando no. `my-auto` en el dialog termina de empujar al centro vertical si cabe.

**Cómo evitar**: usar SIEMPRE este pattern para nuevos modales. Documentado en `docs/ARCHITECTURE.md` sección "Patrones de modal".

---

### 2026-05-19 — Acento amber-900 desaparecía contra fondo casi negro

**Síntoma**: el módulo Freud con acento `#78350f` (amber-900) se veía "opaco". Los íconos, botones secundarios y subheader tinted casi no se distinguían del fondo `#0a0a0a`.

**Causa raíz**: amber-900 tiene lightness OKLCH ~43%. Sobre un fondo de lightness 18% (casi negro), el contraste es pobre. La saturación además se "come" porque el espacio negro absorbe color.

**Solución**: subir el acento a `#a16207` (amber-700, lightness ~52%). Mantiene el "cuero envejecido" pero con presencia visual real. Reservar lightness sub-50 para fondos tinted y bordes, no para foreground.

**Cómo evitar**: cuando elijas el color de acento de un módulo nuevo, **probalo siempre contra el fondo que va a tener al lado**. Si el módulo es dark, el acento necesita lightness ≥50 para tener presencia. Si el módulo es light, lightness ≤50 para tener contraste.

---

### 2026-05-19 — Default cyan del AuthMenu rompía coherencia de marca

**Síntoma**: estando dentro del módulo Freud (vibe cuero), el botón "Crear cuenta" del header global aparecía celeste (`#0ea5e9` cyan-500). Primer color saturado que veía el usuario, sin coherencia con el módulo.

**Causa raíz**: el `AuthMenu` global no sabía en qué módulo se estaba renderizando, y caía a un default hardcodeado.

**Solución**: nuevo helper `src/lib/routeAccent.ts` que mapea `pathname` → `{ acento, nombreProducto }` del módulo activo. `AuthMenu` y `AuthBanner` lo consumen via `useLocation`. Cada módulo nuevo agrega su entrada al mapeo.

**Cómo evitar**: componentes globales que tienen color de marca tienen que saber el módulo activo. Nunca hardcodear acento en componentes que viven en el shell.

---

## Supabase RLS y data

### 2026-05-19 — RLS `with check` bloqueaba la transición de estado al firmar

**Síntoma**: la parte B abría el link público de firma, clickeaba "Confirmar firma", recibía:
```
new row violates row-level security policy for table contratos_documentos
```

**Causa raíz**: la policy de UPDATE público tenía:
```sql
using (estado = 'enviado' and link_firma_token is not null)
with check (link_firma_token is not null)
```

El UPDATE cambia `estado` de `'enviado'` a `'firmado'`. Postgres aplica `with check` sobre la fila RESULTANTE. Aunque `link_firma_token` sigue presente, el chequeo implícito del `using` (no expreso pero esperado por Postgres) rechaza la fila porque `estado` ya no es `'enviado'`.

**Solución**: ampliar `with check` para incluir explícitamente todos los estados válidos post-update:
```sql
with check (estado in ('enviado', 'firmado') and link_firma_token is not null)
```

**Cómo evitar**: cuando una policy de UPDATE permite cambiar columnas que aparecen en el `using`, asegurate de que `with check` permita los valores nuevos. Si el UPDATE hace transición de estado, listá todos los estados válidos antes y después.

---

## Performance y bundle

### 2026-05-19 — Bundle inicial 1.67 MB sin lazy loading

**Síntoma**: la home `/` tardaba mucho en mobile/3G. Tres módulos importados estáticamente desde `src/App.tsx` traían 1.67 MB de JS sincronizado (486 KB gzip), incluyendo `html2pdf.js` (~1 MB) que solo se usa en `/contratos/:id`.

**Causa raíz**: rutas top-level con import estático. `import ContratosApp from './proyectos/contratos/App'` arrastra todo el módulo + dependencias al chunk inicial.

**Solución** (commit `1482f2a`):
- Convertir cada módulo a `React.lazy` + `Suspense` en `src/App.tsx`.
- `html2pdf.js` se importa dinámicamente DENTRO de `generarPDF` (no al inicio del módulo). Solo se descarga si el usuario hace clic en "Descargar PDF".

Resultado: chunk inicial pasa de 486 KB gzip → **119 KB gzip**. `html2pdf` (286 KB gzip) on-demand.

**Cómo evitar**: cada módulo nuevo se importa con `lazy(() => import(...))` en el routing top-level. Para librerías pesadas (`html2pdf`, `pdf-lib`, `tiptap`, etc.) usar dynamic import dentro de la función que las usa.

---

### 2026-05-19 — html2pdf rasterizaba con fonts no cargadas

**Síntoma**: el PDF exportado mostraba palabras pegadas en headings ("Propiedadintelectual", "Soluciónlecontroversias"). Los espacios entre palabras se "comían" solo en titulares.

**Causa raíz**: `html2canvas` (que usa `html2pdf` por debajo) rasteriza el DOM ANTES de que las custom fonts (Fraunces, Geist) terminen de cargarse. Como fallback usa system fonts cuyo kerning es agresivo en spans con `font-variation-settings` raros, los espacios se aplastan.

**Solución**: en `generarPDF`:
```ts
await document.fonts.ready;
await new Promise(r => setTimeout(r, 100));  // tick de layout estable
// luego html2pdf...
```
Más `html2canvas.onclone` también esperando `clonedDoc.fonts.ready`, más `letterRendering: true`.

**Cómo evitar**: cualquier rasterización a imagen/PDF debe esperar `document.fonts.ready` primero. Es 1 línea, no cuesta nada.

---

### 2026-05-19 — html2pdf inyectaba página blanca al inicio

**Síntoma**: el PDF tenía siempre una página vacía como primera página, antes del contenido del contrato.

**Causa raíz**: la opción `pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }` con `legacy` inyecta un break sintético al principio del documento.

**Solución**: sacar `legacy` del array. `['css', 'avoid-all']` cubre los breaks reales sin la página fantasma.

**Cómo evitar**: empezar SIN `legacy` y agregar solo si hace falta para casos legacy específicos.

---

## UX y producto

### 2026-05-19 — Pantalla de login bloqueante: el mismo error dos veces

**Síntoma**: tanto Vencet como Freud arrancaron con una pantalla de "Bienvenido, iniciá sesión" que bloqueaba ver la app. El usuario veía un wall antes de cualquier valor.

**Causa raíz**: copiar el patrón naive de "private route" sin pensar. Pero el self-check del proyecto dice: no escondas el producto detrás del login.

**Solución**: la app se ve siempre, los datos están vacíos si no hay sesión. Los botones que requieren guardar abren el `ModalAuth`. La cuenta es opcional para explorar, obligatoria para sincronizar / enviar a otros.

**Cómo evitar**: regla durable establecida en `CLAUDE.md` Prompt 2: "Funcional sin login". Cada módulo tiene que ser explorable sin sesión, con storage local. La cuenta agrega cross-device sync, no es gate de acceso.

---

### 2026-05-19 — AuthBanner en página pública standalone

**Síntoma**: cuando alguien llegaba a `/contratos/firmar/:token` (link enviado por WhatsApp para firmar un contrato puntual), veía el AuthBanner global pidiéndole crear cuenta en Bronco Drift. Confuso: esa persona no quiere registrarse, solo firmar.

**Causa raíz**: el shell global (BroncoHeader + AuthBanner) se renderizaba sin discriminar entre "estás navegando la plataforma" y "te invitaron a hacer algo puntual con un link".

**Solución**: helper `src/lib/publicRoutes.ts` con regex de rutas públicas standalone. `BroncoHeader` y `AuthBanner` se ocultan en esas rutas.

**Cómo evitar**: cada vez que se crea una funcionalidad de "link compartido" (firma, view compartida, invitación), agregar la regex de esa ruta al array `PATRONES_PUBLICOS`. El shell sabe ocultarse automáticamente.

---

### 2026-05-19 — Landing previa entre nicho y app: friction innecesaria

**Síntoma**: `/freud` y `/contadores` empezaron como landings tipo hero + features + CTA. El usuario hacía clic en el portfolio, llegaba a la landing, tenía que hacer otro clic para entrar a la app.

**Causa raíz**: copiar el patrón SaaS landing sin cuestionar. Cada friction reduce conversión.

**Solución**: regla durable establecida en `CLAUDE.md`: **sin landings**. `/<nicho>` lleva directo a la app. Si el módulo necesita "vender" algo, lo hace dentro (empty states, banner, onboarding).

**Cómo evitar**: regla en Prompt 2. Cada módulo nuevo va a `/<nicho>` directo, nunca a `/<nicho>/app`.

---

### 2026-05-19 — `opacity-60` en preview anónimo: la peor primera impresión

**Síntoma**: la card-ejemplo "Mariana G." en `/freud` para visitantes anónimos tenía `opacity-60` "para mostrar que era ejemplo". Resultado: la pieza más importante del módulo se veía velada, ilegible.

**Causa raíz**: usar opacity como código visual de "esto es ejemplo". Mal patrón: opacity reduce TODO, incluida la legibilidad. El usuario lo lee como "esta app está rota".

**Solución**: badge sutil "VISTA DE EJEMPLO" en la esquina superior, mantener el contenido 100% legible. La diferenciación es semántica (texto), no visual (opacity).

**Cómo evitar**: nunca usar opacity como marcador semántico. Para diferenciar tipo de contenido (real vs demo vs preview) usar etiquetas, colores de marco, fondos tinted. La legibilidad del contenido es sagrada.
