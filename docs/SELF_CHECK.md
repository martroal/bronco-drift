# Self-Check — Misión y criterios de Bronco Drift

> Establecido el 2026-05-19 tras revisar Vencet v0.1 y reconocer que era "Excel digital con badges": funcional pero sin valor real, sin emoción, sin diferenciación.

## Misión reformulada

Construir aplicaciones que sean, **en este orden y sin excepciones**:

1. **Funcionales** — resuelven un problema real end-to-end. El usuario no tiene que volver a su herramienta vieja a la mitad del flow.
2. **Hermosas** — generan emoción al abrirlas. La UI es deliberada, no austera por default. Tipografía, espaciado, color, micro-interacciones, todo se cuida.
3. **Gratis** — accesibles sin barreras económicas. Si llegan a costar algo, será solo cuando haya valor real validado y haya un free tier que siga siendo útil.

El video de YouTube/TikTok es **secundario**. Si la app no es buena, ningún edit de CapCut la salva. Si la app es buena, el contenido sale solo.

## Self-check obligatorio antes de implementar

Antes de escribir código nuevo (módulo, feature, componente), contestar **SÍ a las tres preguntas**:

### 1. ¿Aporta valor real?

No alcanza con "agrega una feature". Validar:

- ¿Resuelve un dolor concreto que el usuario tenga **hoy**?
- ¿El usuario no puede resolverlo igual de bien con su herramienta actual (Excel, Notion, WhatsApp, papel)?
- ¿Cuál es el diferenciador? Si la respuesta es "es como X pero web", no aporta valor.

**Antiejemplo de Vencet v0.1**: lista plana ordenada por fecha con badges de color. El contador ya tenía esto en su Excel con formato condicional. No aportamos nada nuevo.

### 2. ¿Es funcional end-to-end?

No alcanza con "anda". Validar:

- ¿El usuario puede completar el flujo principal **sin saltar a otra herramienta**?
- ¿Hay búsqueda, filtros, ordenamiento donde corresponde?
- ¿Hay bulk actions cuando es razonable?
- ¿Los errores se comunican claramente y se pueden recuperar?
- ¿Funciona en mobile?
- ¿Aguanta volumen real (no 5 filas demo sino 200)?

**Antiejemplo de Vencet v0.1**: sin búsqueda, sin filtros, sin agrupación por cliente, sin date picker visual, sin bulk actions, sin recuperación de "marcar presentado" accidental. Con 200 obligaciones (un estudio real) es inutilizable.

### 3. ¿Es hermoso?

No alcanza con "limpio". Validar:

- ¿Genera **emoción** al abrir la app?
- ¿La tipografía está pensada?
- ¿Los espaciados son deliberados (no defaults de Tailwind sin tocar)?
- ¿Hay micro-interacciones (transiciones, hovers, focus states)?
- ¿El layout transmite la personalidad del módulo?
- ¿Cualquier elemento visual está ahí **porque suma**, no porque "lo necesitamos"?

**Antiejemplo de Vencet v0.1**: empty state con "Probá Vencet", inputs sin estilo, botones planos, sin animación al marcar presentado, sin gráficos, sin nada que justifique no usar el Excel.

## Regla durable: cuando hay duda

- **Si dudás del valor**: no implementar. Validar primero con un usuario real (cliente, amigo del nicho, encuesta corta) antes de seguir.
- **Si dudás de si es funcional**: pensá el flow con 200 items, no con 5. Si rompe, rehacer la UI antes de seguir agregando features.
- **Si dudás de si es hermoso**: parar. Mirar referencias (Linear, Cron, Arc, Raycast, Notion, Bear). La UI es producto, no decoración final.

## Antimensiones (cosas que NO hacemos)

- ❌ Clonar funcionalidad ya disponible salvo que aportemos algo claramente diferenciador.
- ❌ Agregar features porque "es fácil" o "cuesta poco".
- ❌ Skipear UX con la excusa "es MVP" — un MVP feo es un MVP muerto.
- ❌ Mostrarle al usuario un empty state vacío sin que pueda probar nada (debe haber datos demo o un onboarding guiado).
- ❌ Hacer botones que solo dicen "Crear" sin contexto.
- ❌ Forms con inputs sin label, sin placeholder útil, sin validación inline.
- ❌ Color de marca cyan-corporate por default. Cada módulo necesita identidad visual propia que comunique algo del nicho.
- ❌ Tipografía sistema-por-default. Elegir y aplicar.

## Aprendizaje: Vencet v0.1

Vencet queda como **caso de estudio** en `src/proyectos/contadores/`. El código no se borra. Sirve de referencia de cómo NO hacer:

- Investigación basada en marketing de la competencia, sin hablar con usuarios reales.
- Producto MVP que es "versión web de Excel" sin diferenciación.
- UI funcional pero sin alma.

Si en algún momento volvemos al nicho contadores, **arrancamos de cero el Prompt 1** — esta vez validando con un contador real antes de definir el alcance.

## Cómo usar este self-check

- **Cada vez que se ejecuta el Prompt 1** (investigación de nicho), el output tiene que pasar las 3 preguntas. Si alguna falla, rehacer el Prompt 1.
- **Cada vez que se ejecuta el Prompt 2** (build), antes de empezar a tipear código, releer este archivo. Si el alcance aprobado no pasa el self-check, parar y volver al Prompt 1.
- **Antes de cada commit grande**, mirar lo que se hizo y contestar las 3 preguntas otra vez. Si alguna falla, no se mergea.
