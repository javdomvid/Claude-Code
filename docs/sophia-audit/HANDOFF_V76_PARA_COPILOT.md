# SOPHIA · Traspaso V76 (Lote 2 · Edición fluida) — para continuar en Copilot

**Base anterior:** V75 Light. **Nueva base:** V76 Light. **Fecha:** 26‑11‑2026.
Complementa el prompt maestro (V74) y [`HANDOFF_V75_PARA_COPILOT.md`](HANDOFF_V75_PARA_COPILOT.md): todo lo dicho allí sigue vigente, incluidas las zonas de cuidado y las decisiones D1–D4. Adjunta el prompt maestro, este archivo, el de V75 y los dos HTML V76.

## 0. Prompt listo para pegar

> Continúa Project SOPHIA (Objective OLIVAW) como responsable de arquitectura de producto, ingeniería front-end y QA. **La base actual es V76 Light**: `SOP_Editor_V76_SOPHIA_Light.html` y `Quick_Card_Editor_V76_SOPHIA_Light.html`. Comprueba sus huellas SHA‑256 (sección 1) antes de tocar nada.
>
> V76 = V75 (Lote 1 · Fiabilidad y salida) + **Lote 2 · Edición fluida**: mini‑barra de selección, menú contextual, menú «/», pegar desde Word con estructura, «Changes since V…», atajos y ayuda F1, ortografía al editar, y deshacer que conserva el cursor. No cambia la disposición aprobada, el folio, el formato de `#record`, la numeración ni el historial guardado. En modo lectura, la pantalla es idéntica a V75. Dentro de cada HTML tienes `sophia-ui-contract` (V76) y `sophia-changelog`.
>
> Lee el prompt maestro y los traspasos V75 y V76. Respeta las zonas de cuidado de ambos. Trabaja por lotes con puerta de salida, en ambos perfiles, sobre copias versionadas. Si un cambio afecta a datos, a la disposición aprobada o a la publicación, pregunta antes. Siguen abiertas D1 (versiones), D2 (claves PID), D3 (IDs de bloque) y D4 (huella de integridad). En tu primer turno, solo confirma lo leído y verifica las huellas. No generes V77 hasta que te lo indique.

## 1. Identificación

| Archivo | Bytes | SHA‑256 |
|---|---:|---|
| `SOP_Editor_V76_SOPHIA_Light.html` | 587017 | `1af1e28832ecbdca107134bd9b70cc09c55a0d625f1f7cbafa4206e7533945ff` |
| `Quick_Card_Editor_V76_SOPHIA_Light.html` | 605329 | `5b36cb6730c93a8213335cec3eed808254c140a5e36a5d1665b2bc3123f79c1a` |
| *Base* `SOP_Editor_V75_SOPHIA_Light.html` | 540139 | `5eb460b28c2886b7501cf87181d64848a13ff8b51e46a94c10f100e832204377` |
| *Base* `Quick_Card_Editor_V75_SOPHIA_Light.html` | 558451 | `e966ae11683e4376957792f27110789fc8ca54ee1f5bc1c208e31dbd4b7f78b1` |

**Marcadores**: `<title>… V76 |`, `dataset.sophiaShell='76'` y dos bloques nuevos, `<style id="sophia-v76-flow-style">` y `<script id="sophia-v76-flow">`. Están **justo antes** de `sophia-v75-print-shell`, que sigue siendo el último `<style>`.

Se generan con `tools/v76/make_v76.py` a partir de V75; el código legible está en `tools/v76/sophia-v76.js` y `.css`.

## 2. Qué añade V76

| ID | Herramienta | Cómo funciona | Datos |
|---|---|---|---|
| W-01 | **Mini‑barra de selección** (`.sv76-selbar`) | Aparece sobre el texto seleccionado solo en edición: B, I, U, S, resaltar, enlace, limpiar. Alt+F10 entra; Esc vuelve a la selección. Llama a `EditorCommands.command`. | Contenido normal (transacción) |
| W-02 | **Menú contextual** (`.sv76-menu`) | Clic derecho o Shift+F10, solo en edición dentro del cuerpo. Según el objetivo: **texto** (cortar, copiar, pegar como texto, enlace, párrafo, Normal/H1/H2, insertar bloque debajo), **tabla** (filas, columnas, cabecera, Table Studio y Table Flow en QC, abriendo Table Studio con la operación preparada) o **imagen** (tamaño, Layout Studio, alt/pie, reemplazar, mover, borrar). En lectura se mantiene el menú nativo. | Ídem |
| W-03 | **Menú «/»** | `/` en un párrafo vacío abre un menú filtrable: Normal, Título 1–3, viñetas, numerada, cita, tabla, imagen, aviso «Warning», «Confirmation required», línea, empezar en página nueva (`data-layout-before="page"`), fecha y símbolos. `/` dentro de texto se escribe normal. | Ídem |
| W-04 | **Atajos + ayuda** | Ctrl+Alt+0/1/2/3 (normal, H1, H2, H3; **ignoran AltGr**, así que AltGr+2 = `@` en teclado español no cambia nada), Ctrl+Shift+7/8 (listas), Ctrl+F (buscar), Ctrl+H (reemplazar, en edición), Ctrl+Shift+V (texto plano), F1 o Ctrl+/ (ayuda). Ctrl+K sigue siendo Commands. | — |
| W-06 | **Pegar con estructura** | `window.SophiaPaste.handle()` sanea el HTML del portapapeles con lista blanca: h2–h4 (relativos al nivel más alto pegado), p, listas (incluidas las de Word `mso-list`), tablas simples, b/i/u/s/sub/sup, enlaces https/mailto. Descarta estilos, clases, `o:p`, scripts e imágenes y avisa de cuántas imágenes ha omitido. En celdas y viñetas, si hay bloques, pega texto plano. Todo el pegado se deshace con un solo Ctrl+Z. | Contenido |
| W-10 | **Ortografía** | `#document.spellcheck` activo solo al editar. | — |
| W-12 | **«Changes since V…»** | Tarjeta en el panel **Versions** con lo cambiado desde la última revisión guardada: tipo, texto, **Go to** y **Revert** (bloques modificados o añadidos, por transacción, con Ctrl+Z). El resaltado en el documento usa **CSS Highlight API**: no añade clases ni atributos, así que **no entra en las instantáneas**. Se apaga al imprimir y la preferencia se recuerda por usuario. | Solo «Revert» cambia contenido |
| — | **Deshacer conserva el cursor** | `stepUndo` guarda y restaura la posición como desplazamiento de texto. Antes se perdía al sustituir `innerHTML`. | — |
| — | **Intro crea `<p>`** | `defaultParagraphSeparator = 'p'`: los párrafos nuevos son `<p>`, no `<div>`. | Forma del contenido nuevo |
| — | **Commands** | `Workbench.register()` y `refresh()` expuestos. Comandos nuevos: *Keyboard shortcuts*, *Changes since last save* e *Insert symbol*. | — |

## 3. Pruebas

Entorno: Chromium 158 headless, `file://`, sin red.

| Prueba | SOP | QC |
|---|---|---|
| `tests/sophia-regression.mjs` (las 10 de V75) | 10 PASS · 0 FAIL · 4 KNOWN | 10 PASS · 0 FAIL · 4 KNOWN |
| `tests/v76-tools-check.cjs` (34 por perfil): lectura sin superficies nuevas, F1, Ctrl+F, mini‑barra + negrita + Ctrl+Z, menú contextual de texto, tabla (Table Studio con la operación preparada, Table Flow en QC) e imagen (mover), «Insert block below» → «/» → H1, `/` en párrafo vacío → aviso, `/` dentro de texto, Ctrl+Alt+2, AltGr+2 sin efecto, Ctrl+Shift+8, pegado Word con estructura y saneado (sin `mso`, sin `javascript:`, sin script), Ctrl+Z del pegado, Ctrl+Shift+V, tarjeta de cambios + resaltado sin tocar el DOM, Revert, exportar sin superficies V76, reabrir sin duplicados, Commands, cero errores de consola | 34/34 | 34/34 |
| Captura de página completa en modo lectura frente a V75 (1440, 1024, 390, 320 px) | idéntica\* | idéntica |

\* En una de las ejecuciones, el SOP a 390 px difería en 3 píxeles de un botón. La misma variación aparece entre dos capturas **de la propia V75**: es ruido de renderizado, no un cambio.

**NO EJECUTADO**:
- Edge corporativo y vista embebida (SharePoint o Copilot).
- Pegado real desde Word de escritorio: se probó con HTML de Word representativo, no con el portapapeles del sistema.
- Menú contextual con lector de pantalla.
- Táctil real.
- Documentos largos.

## 4. Zonas de cuidado nuevas (además de las de V75)

1. **`sophia-v76-flow` va antes de `sophia-v75-print-shell`**. Si añades bloques, mantén el de impresión como último `<style>`.
2. **Superficies V76** (`.sv76-selbar`, `.sv76-menu`, `.sv76-dialog`, `.sv76-changes`): llevan `data-runtime`, viven fuera de `#document` y se eliminan en `serial()`. Si creas otra, haz lo mismo y dala de alta en el contrato.
3. **Resaltado de cambios = CSS Highlight API.** No lo sustituyas por clases o atributos en el documento: se colarían en `cleanContent()`, en `canonical()` y en las instantáneas.
4. **`SophiaPaste.sanitize`** es la lista blanca de entrada. Si amplías los formatos admitidos, añade casos negativos (scripts, `javascript:`, estilos `mso`) a `v76-tools-check.cjs`.
5. **Atajos**: el manejador de V76 escucha en captura sobre `document` y **no hace nada si hay un diálogo abierto**. No captures Ctrl+S, P, Z, Y ni K: son del núcleo y de *Workbench*. Comprueba AltGr en cualquier atajo con Ctrl+Alt.
6. **`selectedImage`** es una variable global del núcleo. El menú contextual la asigna antes de llamar a `EditorMedia`. Si el núcleo la renombra, el menú de imagen deja de funcionar (está protegido con `try`).
7. **`stepUndo`** llama a `SophiaFlow.caretOffset()` y `restoreCaret()`. Si reescribes el deshacer, conserva ese contrato.

## 5. Siguiente

- Con tus respuestas a **D1, D2 y D4** → **V77 · Control documental** (`04_PLAN_DE_TRABAJO.md`).
- Con **D3** → **V78 · Identidad y revisión** (mover bloques, comentarios, «pendiente de confirmar», puerta de calidad).
- El catálogo completo de herramientas está en `05_HERRAMIENTAS_TIPO_WORD.md`.
