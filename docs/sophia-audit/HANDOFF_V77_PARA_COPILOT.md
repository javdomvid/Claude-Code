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
