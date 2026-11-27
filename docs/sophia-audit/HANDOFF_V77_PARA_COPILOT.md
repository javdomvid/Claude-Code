# Traspaso V77 «super» → Copilot

**Base vigente: SOPHIA V77.1** (`SOP_Editor_V77.1_SOPHIA.html`, `Quick_Card_Editor_V77.1_SOPHIA.html`).
V77.1 = V77 + revisión del responsable (sección 5). El formato de archivo es el mismo (`sophia/77`).
V77 ya no es V76 con parches: se ha **reconstruido desde código fuente legible** (`sophia/src`).
Lo bueno de V74–V76 se ha reutilizado módulo a módulo y se han eliminado las capas acumuladas.

Cada HTML lleva dentro su propio «firmware» en inglés:

| Bloque dentro del HTML | Para quién | Qué contiene |
|---|---|---|
| `#sophia-agent-brief` | agente de documentos (SOPHIA + skills) | qué puede tocar (solo la zona del documento), gramática de bloques, IDs, versiones, formato de propuestas, lista de comprobación |
| `#sophia-ui-contract` | Copilot cuando mejora el editor | mapa de módulos y dependencias, eventos, cómo añadir una herramienta, reglas de oro |
| `#sophia-changelog` | todos | qué cambió en V77 |

Comandos → «Agent brief (firmware)» muestra el primero dentro del propio editor y permite copiarlo.

## 1. Qué pegar a Copilot

### a) Para mejorar el editor (desarrollo)
```
Base: SOPHIA V77 (adjunto los dos HTML). El código fuente vive en el repositorio, en sophia/src
(un módulo por tema, en orden de carga), y se ensambla con sophia/build.py.
Lee primero el bloque #sophia-ui-contract del HTML (o sophia/src/docs/ui-contract.md).
Reglas: edita el módulo responsable EN SU SITIO; nunca añadas scripts o estilos que «corrijan»
a otros; nunca toques la zona del documento de un documento real; toda mutación del documento
pasa por EditorTransactions.run; lo que crea la interfaz lleva data-runtime; el estilo
data-sophia="print" sigue siendo el último; sin red ni dependencias externas.
Para añadir una herramienta: regístrala en SOPHIA.commands y pon su id en MAIN (panel principal),
RIBBON (panel de edición) y/o SHEET (omnibox) en 70-shell. Los modos Mini muestran todas.
Al terminar: python3 sophia/build.py <doc.html> <out.html> y
node sophia/tests/v77-functional.cjs <out.html> → debe decir ALL PASS. Entrega el diff por módulo.
Tarea: <describe aquí el cambio>.
```

### b) Para que el agente escriba o revise contenido (SOP / Quick Card)
```
Trabajas sobre un documento SOPHIA V77. Lee el bloque #sophia-agent-brief del HTML.
Solo puedes cambiar la zona del documento y, preferiblemente, NO editas el archivo:
devuelves una PROPUESTA JSON (schema sophia.proposal/1) con operaciones por bloque
(replaceBlock / insertAfter / deleteBlock / updateMeta) usando los data-block-id del
«document map» que te adjunto. Usa expectedText con el texto actual. No escribas números
en los títulos (se numeran solos). Lo que no sepas: <span class="tbc">TO BE CONFIRMED</span>.
No inventes datos, versiones, fechas de aprobación ni aprobadores.
Tarea: <describe aquí el contenido>.
```
La persona carga la propuesta con **Commands (omnibox) → Apply agent proposal…** o el panel principal → Agent → Proposal: ve cada operación con antes/después, marca o desmarca, y se aplica todo en **un solo paso de deshacer**. Queda registrado como evento `proposal-applied`, y después se guarda como siempre.

## 2. Qué cambió (por letra)

| Letra | Qué se hizo | Implicaciones |
|---|---|---|
| **A1** | Refactor profundo: 29 módulos legibles reutilizando lo bueno (History, Print Studio, Table Studio, Layout, Media, Find/Replace, Checks, flujo V76) | Se acabó «parche sobre parche»; cada cosa tiene un dueño |
| **B1** | Zona del documento legible: un bloque por línea, con `data-block-id` | Un agente o una persona puede leer y comparar el contenido sin pelearse con líneas de 70.000 caracteres |
| **C2** | Una sola barra de app; Edit panel **Full / Mini / Hide**; panel lateral; hoja de comandos bento (Ctrl+K); un único estado | Mini = **todas** las herramientas, solo iconos, en una franja compacta (1–2 filas) |
| **D** | Versiones: borrador no cambia el número; Publish & save **+0.01** (también sin cambios); Big Validation → siguiente mayor **.00** | La versión de la app (V77) y la del documento (V1, V1.01…) son independientes |
| **F-id** | IDs de bloque automáticos `b-xxxxxxxxxx` | Comentarios, propuestas e historial se anclan a bloques estables |
| **G** | Imágenes guardadas **una vez** (almacén `assets` del registro) | Archivos más pequeños cuando hay muchas revisiones; transparente para el usuario |
| **H** | Pie de impresión controlado (ID · versión · estado · fecha · «Uncontrolled copy when printed») y marca de agua DRAFT si no está publicado | Todo papel impreso es identificable |
| **I** | DM Sans incrustada (licencia OFL, ~100 KB) | Se ve e imprime igual en cualquier PC; la paginación puede variar ligeramente respecto a V76 (en estos dos documentos no varió) |
| **J** | Comentarios por bloque (en el registro, no en el texto), marca **To Be Confirmed**, lista previa a publicar | Los comentarios no se imprimen; la lista avisa pero deja continuar con casilla y motivo |
| **K** | Numeración automática de títulos | No hay que escribir «3.1». Si un documento antiguo tenía números que no cuadran, la numeración automática queda **desactivada** y no se toca nada |
| **L** | Mover bloques (Alt+↑/↓), galería de estilos, índice automático, comparar dos revisiones cualesquiera, importar/exportar Word `.docx` | El `.docx` exportado es una **copia de revisión**, no el documento controlado |
| **M** | Propuestas de agente + «document map» | El agente nunca reescribe el archivo; una persona decide operación a operación |
| **N** | Interfaz en inglés | Textos en `SOPHIA.strings` para traducir más adelante |
| **O** | Migración automática al abrir V74–V76 (o «Upgrade an older SOPHIA file…»); los entregados ya vienen migrados con una revisión «Migration» | No cambia ni una palabra; añade IDs y numeración y lo deja registrado |
| **P** | Código fuente en el repositorio (`sophia/`), `build.py`, `finalize.cjs` y prueba funcional | Se puede regenerar cualquier documento con el motor nuevo |
| **E** | Claves PID: **sin cambios** (pendiente) | Siguen siendo un candado local visible en el archivo |
| **F** (hash) | Huella de integridad de revisiones: **pendiente** | — |

## 3. Pruebas realizadas (Chromium sin red)
- `sophia/tests/v77-functional.cjs`: **38/38 PASS** en SOP y Quick Card (interfaz, panel principal y panel de edición Full/Mini/Hide, omnibox con búsqueda en el documento, panel View, History «Clean text», A4 sin desbordes al escribir, escribir, deshacer, comentario, TBC, mover, índice, numeración, propuesta, Save draft → recibo → verificación byte a byte → reabrir, Publish +0.01, Big Validation → 2.00, publicar sin cambios → 2.01, `.docx` ida y vuelta, impresión y PDF).
- Paginación A4 idéntica a V76 (SOP 2 páginas, Quick Card 3).
- axe-core (WCAG A/AA) sobre la interfaz en lectura, edición, omnibox (con y sin búsqueda) y panel View: **0 infracciones**.
- Reconstruir un V77 desde sí mismo deja la zona del documento **idéntica**.

## 4. Zonas de cuidado
- `50-persist`: el guardado reconstruye el archivo desde las piezas originales (quine). Lo que pongas en un módulo viaja en cada copia guardada.
- No escribas en código en línea la secuencia de cierre de script ni la apertura de comentario HTML: `build.py` lo rechaza.
- `paper.*.css` es también la plantilla de Print Studio y de las instantáneas del historial: nada de interfaz ahí.
- El `.docx` importa texto, títulos, listas, tablas e imágenes PNG/JPEG; no importa estilos de Word a propósito.

## 5. V77.1 — revisión del responsable (26 nov 2026)
| Pedido | Hecho |
|---|---|
| Recuperar el **Main panel** siempre visible con Full / Mini / Hide | Vuelve como en V76 (teselas tonales Navigate · Review · Assets · Save & publish · Output · Agent). Botón «Main panel: Full/Mini/Hide» siempre en la barra; «Edit panel: …» aparte al editar. Muestra lo que se puede hacer ahora. |
| **Commands** como barra de búsqueda | Campo en la barra (Ctrl+K): al pulsar, cursor para escribir y panel con todos los comandos por área; al escribir filtra comandos **y busca en el texto del documento** (salta y resalta, o abre Find). |
| **View** con el estilo de tarjetas | Panel «Document layout»: tarjetas A4 pages / Continuous con ✓, Fit width, zoom, Layout Studio, Reflow, marcas ¶. |
| Más **glassmorphism** y tonos **Material Expressive** | Cristal más transparente (barra, paneles, menús, lateral) y tonos de V76 por área en teselas, grupos del panel de edición y omnibox. |
| History: **Clean text** sin resaltados | «Highlight changes» / «Clean text». Clean = documento formateado tal cual, sin resaltados, PIDs ni fechas; se cierra la barra de cambios; rojo y marca de agua se mantienen en versiones antiguas. |
| Guardado sin tener que **subir el HTML** | Basta con descargar y «Confirm saved». La comprobación byte a byte es opcional. «Save HTML as…» escribe, relee y confirma solo. |
| Texto que se salía del folio (A4) al editar | La página crece en vez de desbordarse y, al parar de escribir, se repagina conservando el cursor. |

## 6. V78 — segunda revisión del responsable (26 nov 2026)
Mismo formato de archivo (`sophia/77`). Fuente en `sophia/src`; módulos nuevos `08-i18n` y `64-table-tools`; `26-replace` se integra en `24-find`.

| Decisión | Hecho |
|---|---|
| **U** — rediseñar las ventanas (studios) y darles más utilidades | Familia única de studios (sección final de `dialogs.css` + `STUDIOS` en `70-shell`): cristal, cabecera tonal, ×, botones tonales y acción principal a la derecha. History › **Restore this version** (vuelve el contenido antiguo como cambio sin guardar, un paso de deshacer). Checks con acciones (siguiente TBC, buscar, comentarios, imágenes, índice). Print Studio muestra qué lleva la salida controlada. |
| **T** — Layout Studio | Reescrito: páginas como tarjetas con sus bloques; al pulsar un bloque: empezar en página nueva / mantener con el siguiente / con el anterior; el plan se recalcula solo; «Apply plan & show A4». |
| **S** — al editar | El Main panel pasa a **Mini** al entrar a editar y vuelve al salir; se puede cambiar igualmente. |
| **V** — galería de estilos | Solo los estilos establecidos del perfil (`SOPHIA.blocks.STYLES`): SOP con secciones 1. / 1.1 / 1.1.1, pasos, viñetas, aviso, confirmación, nota de fuente; Quick Card con secciones 01 ·, tarjeta, título de tarjeta, tabla de decisión, tarjeta pendiente… Sin estilos libres ni colores. |
| **V2** — tablas tipo Word | Pestaña contextual **Table ✦** cuando el cursor está en una tabla (filas, columnas, borrar, fila de cabecera, anchos iguales, sombreado con la paleta del documento, Table Studio); insertar tabla con cuadrícula de tamaño; tabla de decisión en Quick Card. |
| **V3** — buscar y reemplazar | Panel lateral **Find**: resalta todo, ‹ ›, mayúsculas, palabra completa, incluir información del documento, reemplazar uno / todos (un paso de deshacer). |
| **V4** — modo sugerencias | **No hecho a propósito**: «Changes since last save» con Revert por bloque y las propuestas del agente ya cubren el caso; se revisará con el responsable. |
| **X** — interfaz en español | Botón ES/EN. Un único diccionario en `08-i18n.js`; Copilot sigue escribiendo la interfaz en inglés y solo añade la traducción allí. Nunca se traduce el documento, el firmware ni el registro (`translate="no"` en contenedores con texto del documento). |
| Correcciones | Deshacer independiente de la paginación A4; estilo «source note» de Quick Card restaurado; pegado conserva la gramática del documento. |

Pendiente de decisión del responsable (explicado en la conversación): **Q**, **R**, **W**, **E** (claves PID: cómo añadir una persona o cambiar una clave de forma fácil y segura, y cómo debe hacerlo Copilot), **F** (huella de integridad de las revisiones). No implementar sin su decisión.

Nota: el análisis de accesibilidad marca el contraste de `.source-note` en Quick Card (color #70828c heredado de V76). Es estilo del documento; no cambiarlo sin el responsable.

## 7. V79 — salud del código, versión base y seis idiomas (27 nov 2026)
Mismo formato de archivo (`sophia/77`). **Empieza por `sophia/ARCHITECTURE.md`.**

### Qué cambia para quien toca el código
| Antes (V78) | Ahora (V79) |
|---|---|
| `70-shell.js`, 1.200 líneas con toda la interfaz | 10 módulos con una tarea cada uno: `70-command-registry`, `71-ui-kit`, `72-command-list`, `73-view`, `74-appbar`, `75-omnibox`, `76-main-panel`, `77-edit-panel`, `78-side-panel`, `79-shell` |
| `dialogs.css` (103 KB) + `app.css` (38 KB) | `styles/ui/NN-nombre.css`: una hoja por módulo, con el mismo número y nombre que su JS; en el HTML, un bloque `<style data-sophia="ui:NN-nombre">` por hoja |
| Cabeceras libres | **Ficha de módulo** obligatoria: capa, PURPOSE, OWNS, EXPORTS, USES, EMITS/LISTENS, DOM, RULES, MAP, TESTS. `sophia/MODULES.md` se genera a partir de ellas |
| Nada comprobaba la arquitectura | `tools/lint.py` (lo ejecuta el build): globales ocultas, regla de capas, eventos y comandos inexistentes, red, hojas sin módulo, diccionarios de idioma |
| Módulos bajos que llamaban a la interfaz (`window.side`, `SOPHIA.ui`) | Piden con `SOPHIA.ask.panel(...)` / `SOPHIA.ask.leaveFocus()`; responde `79-shell` |
| Plantillas HTML de hasta 3.700 caracteres en una línea | Cortadas en trozos legibles (el texto resultante es idéntico) |
| `tests/v77-functional.cjs` (46) | `tests/functional.cjs` (48) + `tests/unit.cjs` (16) + `tools/snapshot.cjs` (42 estados de la interfaz, antes/después) |

Toda la reorganización se verificó con `snapshot.cjs`: **idéntico** en los 42 estados, en SOP y Quick Card, antes de añadir funciones nuevas.

### Decisiones aplicadas
- **Q · Versión base.** «Save draft ▾ › Set base version…» y la operación `setBaseVersion` de las propuestas. Solo antes de la primera publicación; queda como evento `base-version` y se guarda con el siguiente «Save draft». El firmware del agente (§5) explica qué hace al **crear** (pone la versión que le diga la persona) y al **editar** (nunca toca la versión; recomienda Save draft / Publish / Big Validation).
- **X · Idiomas.** Inglés por defecto + español, francés, italiano, alemán y portugués (menú en la barra). Un módulo-diccionario por idioma (`09-lang-xx`), todos con las mismas 424 claves; el lint avisa si falta alguna. Para Copilot no cambia nada al programar: escribe en inglés y añade la traducción en los cinco diccionarios.

### Pendiente de decisión
**W** (ensayo del flujo del agente con tu Copilot), **E** (claves PID), **F** (huella de integridad), **R** (nuevo documento desde plantilla) y **V4** (modo sugerencias). No implementar sin decisión.
