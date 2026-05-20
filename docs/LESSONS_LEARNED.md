# Lessons Learned — Bronco Drift

Bugs no obvios, sorpresas del stack y soluciones aplicadas. Sirve para no tropezar dos veces con la misma piedra y para acelerar el onboarding de cualquier persona (incluido vos mismo en 3 meses).

Una entrada por lección. Cada una incluye **Síntoma**, **Causa raíz**, **Solución** y **Cómo evitar**.

---

## 2026-05-19 — TypeScript build falló en Vercel pero funcionaba en dev

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

## 2026-05-19 — `npm.cmd` fallaba en Bash con path "C:\Program no se reconoce"

**Síntoma**: Bash devolvió error "`C:\Program` no se reconoce" al correr `npm.cmd install --prefix "C:\Users\MARCEL PC ASUS\Desktop\BRONCO DRIFT"`. Mismo comando en PowerShell funcionó perfecto.

**Causa raíz**: el shim de `npm.cmd` invoca `node.exe` desde `C:\Program Files\nodejs\` y Bash en Windows no escapa bien los espacios cuando pasa argumentos al subproceso. PowerShell sí los maneja.

**Solución**: usar PowerShell con `Set-Location "<path>"` + `npm.cmd install` directo.

**Cómo evitar**: en este proyecto, ejecutar npm/git desde PowerShell. Bash queda para shell scripts puros sin paths con espacios. La regla "usar `npm.cmd` y `npx.cmd`" del CLAUDE.md sigue válida; lo que se suma es "preferir PowerShell sobre Bash en este entorno".

---

## 2026-05-19 — preview_start no encontraba el servidor

**Síntoma**: `preview_start name="bronco-drift"` falló con "No server named 'bronco-drift' found in .claude/launch.json".

**Causa raíz**: el `launch.json` que lee Claude Preview vive en el home `C:\Users\MARCEL PC ASUS\.claude\launch.json`, no en `<proyecto>/.claude/launch.json`. Crear el archivo local no alcanza.

**Solución**: agregar la entrada del proyecto al `launch.json` global, con `runtimeExecutable` apuntando al path absoluto de `npm.cmd` (`C:\\Program Files\\nodejs\\npm.cmd`) y `cwd` al directorio del proyecto. Patrón que ya usa lumina-dev y otros.

**Cómo evitar**: cuando agregues un proyecto nuevo, editá `~/.claude/launch.json` global. Tener el local del proyecto está bien para autodocumentación, pero no se carga.
