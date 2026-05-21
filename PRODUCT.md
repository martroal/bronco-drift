# PRODUCT.md — Bronco Drift

> Establecido el 2026-05-19 via `/impeccable teach`. Este archivo define el contexto estratégico del proyecto. Es la fuente de verdad para decisiones de marca, audiencia y tono. Cuando algo en la app no cierra, esta es la primera referencia a consultar.

## Register

**Brand** (con cara product en cada módulo).

El repo es una plataforma multi-tenant. El portfolio público (`/`) y las landings de cada módulo son **brand**: el diseño ES el producto, son piezas de comunicación. Las apps internas de cada módulo (`/<nicho>/app`) son **product**: el diseño SIRVE al producto, prevalece la utilidad sobre la expresividad.

Cuando trabajemos en `/`, `/freud`, `/contadores` → aplica register brand. Cuando trabajemos en `/freud/app`, `/contadores/app` → aplica register product.

## Misión (prioridad estricta)

1. **Funcional** — resuelve un problema real end-to-end. El usuario no tiene que volver a su herramienta vieja a la mitad del flow.
2. **Hermoso** — genera emoción al abrirlo. Deliberado, no austero por default.
3. **Gratis** — accesible sin barreras económicas. Sin tarjeta, sin trial, sin friction.

El contenido de video / contenido es secundario al producto. Si la app no es buena, ningún edit la salva. Si es buena, el contenido sale solo.

## Personalidad de plataforma

**Paraguas neutro**. Bronco Drift es identificación mínima (header sticky con wordmark mono, AuthMenu único). El portfolio en `/` es funcional, no protagonista. Cada módulo es libre de su personalidad visual interna.

La identidad del proyecto se transmite por **el tono de la copy**, **la curaduría de los módulos** y **el cuidado del craft**, no por un wordmark grande.

## Audiencia

Dos capas, distintas y complementarias:

### Capa 1: Visitantes del portfolio (`/`)

- Otros constructores de software (developers, designers, indie hackers).
- Potenciales contratantes (agencias, founders buscando alguien que ejecute).
- Profesionales del nicho que llegan por referido o búsqueda y descubren la plataforma.
- Curiosos.

Lo que buscan: ver qué se hizo y juzgar la calidad. La home es un portfolio en clave de "estudio que entrega productos", no de "agencia que vende servicios".

### Capa 2: Usuarios de cada módulo

- Profesionales del nicho específico que el módulo atiende. Ejemplo Freud: psicólogos clínicos privados en Argentina/LATAM.
- Llegan por búsqueda directa, referido, o paseando desde Capa 1.
- Lo que buscan: una herramienta que resuelva algo concreto, sin friction, gratis.

Cada módulo tiene su `research/<nicho>.md` con su audiencia específica. Esta sección de PRODUCT.md trata sobre la plataforma.

## Tono de voz

Una persona que sabe lo que hace y no necesita probarlo.

### Cómo se escribe

- **Directo**: una idea por oración. Sin "estamos orgullosos de presentar". Sin "transforma tu negocio".
- **Honesto**: cuando algo es limitación, lo decimos. Cuando algo está pausado, lo decimos.
- **Argentino con cabeza**: "podés", "decime", "te tiro", "che" cuando aplica. Sin sobreactuar el voseo en copy formal.
- **Sin SaaS lingo**: nunca "potenciado con IA", "revolucioná tu workflow", "experiencia transformadora", "platform-agnostic", "next-generation".
- **Sin promesas vacías**: si la app no manda mails, no decimos "te avisa automáticamente". Si los datos son del usuario, lo decimos textual ("tu data es solo tuya"), no como "tu información está segura con nosotros".

### Cómo se siente

Confiado pero no arrogante. Cálido pero no servicial. Técnico cuando hace falta serlo, simple cuando puede serlo. Cero entusiasmo forzado.

## Anti-references (lo que NO somos)

Cosas concretas que rechazamos:

### Aesthetic anti-references

- **SaaS cliché**: el header cyan/violet azul con gradiente, hero centrado con metric grande, cards iguales en grid de 3, "trusted by" con logos grises, footer enorme con 8 columnas.
- **AI tool slop**: glow violet/teal en bordes, gradient text, "powered by AI" stickers, robotic illustrations.
- **Devtool brutalism over-the-top**: terminal-cursor blinking everywhere, ASCII art en headings, "v0.0.0-alpha-rc1" como decoración.
- **Healthcare aseptic**: blanco puro + teal/celeste, ilustraciones de gente sonriendo con stetoscopio, micro-copy con corazoncitos.

### Anti-patterns de UX

- Pantalla bloqueante de login antes de ver el producto.
- Empty state vacío sin que se pueda probar nada.
- Modal como primera respuesta a cualquier acción.
- Formularios con inputs sin labels y placeholders genéricos.
- Loaders que aparecen y nunca terminan.

### Anti-patterns de copy

- Em dashes (` — `).
- "Te damos la bienvenida a...".
- "¿Listo para empezar?".
- "Más fácil que nunca".
- Cualquier oración con "experiencia" como sustantivo de marketing.

## Principios estratégicos

Reglas no-negociables del proyecto, ya documentadas en `docs/SELF_CHECK.md`. Resumidas acá:

1. **Self-check de 3 preguntas** antes de implementar cualquier feature: ¿aporta valor real vs herramienta actual del usuario? ¿es funcional con 200+ items, no 5? ¿es hermoso de verdad?
2. **MVP minimalista pero no MVP feo**. Un MVP feo es un MVP muerto.
3. **Validar con usuario real** del nicho antes de cerrar el alcance de un módulo. Si no se puede validar, marcar el módulo como "pre-validación" hasta que se haga.
4. **Branding propio por módulo**. Cada módulo define nombre, color de acento, tagline. Bronco Drift no se mete en lo visual del módulo, solo lo aloja.
5. **Documentar el aprendizaje**. Cada bug no-obvio va a `docs/LESSONS_LEARNED.md`. Cada decisión va al CHANGELOG. Cada deploy a `docs/DEPLOY_LOG.md`.
6. **Si dudás, parar**. Antes de seguir agregando features, mirar referencias (Linear, Cron, Arc, Raycast, Notion, Bear, Are.na). La UI es el producto, no decoración final.

## Contexto técnico (resumido)

- Stack: Vite + React 18 + TypeScript + Tailwind v3 + react-router v7 + Supabase + Vercel.
- Auth: email + password compartido en toda la plataforma (sin SMTP custom todavía).
- Datos: Supabase Postgres con RLS por `user_id = auth.uid()`.
- Deploy: auto-deploy desde `main` a `bronco-drift.vercel.app`.
- Repo: [martroal/bronco-drift](https://github.com/martroal/bronco-drift), público.

Para detalles arquitecturales, ver [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
