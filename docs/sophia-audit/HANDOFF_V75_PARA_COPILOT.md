# SOPHIA · Traspaso V75 (Lote 1 · Fiabilidad y salida) — para continuar en Copilot

**Base anterior:** V74 Light. **Nueva base:** V75 Light. **Fecha:** 26‑11‑2026.
Este documento **complementa** el «Prompt maestro y contexto integral de SOPHIA» (V74), no lo sustituye. Adjunta los tres archivos: este `.md`, el prompt maestro y los dos HTML V75.

---

## 0. Prompt listo para pegar

> Continúa Project SOPHIA (Objective OLIVAW) como responsable de arquitectura de producto, ingeniería front-end y QA. **La base actual es V75 Light**: `SOP_Editor_V75_SOPHIA_Light.html` y `Quick_Card_Editor_V75_SOPHIA_Light.html`. Comprueba sus huellas SHA‑256 (tabla de la sección 1) antes de tocar nada. V75 es V74 más el **Lote 1 · Fiabilidad y salida**: 12 cambios (11 arreglos de comportamiento + contrato), idénticos en ambos perfiles, **sin cambios en la disposición aprobada, el folio, el formato de `#record`, la numeración de versiones ni el historial guardado**. En modo lectura, la pantalla es idéntica a V74 píxel a píxel a 1440, 1024, 390 y 320 px (captura de página completa).
>
> Lee completos el prompt maestro (contrato, cronología, matriz de aceptación) y este traspaso. Respeta las «zonas de cuidado» de la sección 4: son las piezas que sostienen el guardado verificado, la impresión y el historial. Dentro de cada HTML tienes `sophia-ui-contract` (actualizado a V75) y `sophia-changelog`.
>
> Trabaja por lotes con puerta de salida, en ambos perfiles, sobre copias versionadas (V76…). Reproduce primero y toca el controlador responsable, no añadas otra capa global. Si un cambio afecta a datos, a la disposición aprobada o a la publicación, **pregunta antes**. Hay 4 decisiones abiertas en la sección 5. Separa siempre lo confirmado, lo reproducido, lo probado de verdad y lo pendiente. En tu primer turno, solo confirma que has leído el material, verifica las huellas y propón el siguiente lote: por defecto, el **Lote 2 · Edición fluida** de `05_HERRAMIENTAS_TIPO_WORD.md`. No generes V76 hasta que te lo indique.

---

## 1. Identificación de archivos

| Archivo | Bytes | SHA‑256 |
|---|---:|---|
| `SOP_Editor_V75_SOPHIA_Light.html` | 540139 | `5eb460b28c2886b7501cf87181d64848a13ff8b51e46a94c10f100e832204377` |
| `Quick_Card_Editor_V75_SOPHIA_Light.html` | 558451 | `e966ae11683e4376957792f27110789fc8ca54ee1f5bc1c208e31dbd4b7f78b1` |
| *Base* `SOP_Editor_V74_SOPHIA_Light.html` | 534596 | `74a978af0a67750d82ca046440942b159fed8d2fb50c896a20fa3b5ad11b84f7` |
| *Base* `Quick_Card_Editor_V74_SOPHIA_Light.html` | 552908 | `17fb391c181de9af2d47b8685ea4ab5547ca4903fb3dc5823816fc7ac176ee85` |

**Marcadores de V75**:
- `<title>… V75 | Obsidian JAOM Material Expressive Glass`;
- `dataset.sophiaShell='75'`;
- bloques nuevos al final: `sophia-v75-print-shell` (`<style>`), `sophia-v75-runtime-hygiene` (`<script>`) y `sophia-changelog` (`text/plain`);
- `sophia-ui-contract` titulado «(V75)».

---

## 2. Qué se cambió y por qué (Lote 1)

Todos los cambios son sustituciones exactas sobre un ancla verificada, aplicadas igual a SOP y QC.

| ID | Problema en V74 (reproducido) | Cambio en V75 | Dónde |
|---|---|---|---|
| L1-01 | Al imprimir con el navegador (menú o Ctrl+P), **la barra SOPHIA se imprimía encima del SOP**, junto con el aviso de diagnóstico. En QC, con «gráficos de fondo» activado, se imprimía además el lienzo negro. Causa: `.toolbar[data-ui30]{display:flex!important}` en `glass-v31` estaba **fuera de `@media screen`** y ganaba a la regla de impresión. Una regla `body{background}` sin `@media` ganaba a la de impresión. | Todo `glass-v31` pasa a `@media screen{…}`. Nuevo bloque **final** `sophia-v75-print-shell`: al imprimir, `html,body{background:#fff}` y `body>:not(#document){display:none}`. | `<style id="glass-v31">`, `<style id="sophia-v75-print-shell">` |
| L1-02 | Ctrl+P no abría Print Studio. | Ctrl/Cmd+P → `PrintStudio42.open()` si no hay ningún `dialog[open]`. | `keydown` global del núcleo (junto a Ctrl+S) |
| L1-03 | **Ctrl+S abría «Publish»** (pedía la clave). | Ctrl/Cmd+S → `exportPID('Draft')`. Publish solo desde su botón o Commands. | idem |
| L1-04 | `beforeprint` repaginaba aunque faltaran fuentes o imágenes, y el toast «Fonts are still loading» salía en el PDF. Después de imprimir no se volvía a Continuous. | Solo repagina si fuentes e imágenes están listas. `afterprint` restaura Continuous si estaba activo. | `window.addEventListener('beforeprint'…)` del núcleo |
| L1-05 | Cada exportación **guardaba nodos de ejecución** (`#jaom-view-heading`, `#media-replace-file`, `#v425-table-ui`, `#execution-context-v17`) y atributos de `<body>`. Al reabrir había IDs duplicados: +1 por ciclo; con 2 ciclos, ×3. | `serial()` elimina `[data-runtime]`, esos nodos, `#p42-print`, los `dialog` de `body`, las clases transitorias (`focusmode`, `showmarks`, `media-placing`, `ui30-side-on/off`) y los atributos `data-ui34-edit` y `style` de `<body>`. Los 4 nodos se crean con `data-runtime`. `sophia-v75-runtime-hygiene` limpia las copias heredadas al abrir. | `serial()` en `editor-v2-upgrade`, creación de los 4 nodos, bloque nuevo |
| L1-06 | En **QC**, el historial trataba como contenido la tabla de identidad, la fila Last Edition/Big Validation y el logo. Recién abierto ya había **17 «cambios» fantasma** atribuibles a quien guardara. | `h75Meta(n)`: History ignora `.identity, [data-trace], .brand, .doc-classification, .pagehead, .pagefoot`. En SOP no cambia nada, porque esos nodos ya estaban fuera de `.pagecontent`. | `history-engine-v20`: `blocks()` y `draw()` |
| L1-07 | Tras «Confirm saved», la **recuperación local quedaba en `localStorage` para siempre**. En `file://` cualquier HTML local puede leerla. | `saved()` borra la recuperación de ese documento y PID. Solo tras un guardado **confirmado**: cancelar o fallar no borra nada. | `EditorSession.saved()` (`editor-session-v11`) |
| L1-08 | El lateral decía «4 pages» con 1 hoja en Continuous. | `Continuous view · N approximate words` o `N page(s) · …` en A4. Se refresca al cambiar de vista. | `refreshOutline()`, arranque y `setDocumentView` |
| L1-09 | Al reabrir una copia con lienzo claro, el botón decía «Canvas: Dark». | La etiqueta inicial se calcula del estado real. | `jaomCanvas` en `islands-v30-script` |
| L1-10 | En lectura estaban deshabilitados «Word count», «Check page overflow» y «Show ¶», que son de solo lectura. | Se añaden a la lista de solo lectura de `EditorSession.render()`. | `editor-session-v11` |
| L1-11 | — | Contrato actualizado («V75 · Reglas nuevas») y `sophia-changelog`. | `sophia-ui-contract`, bloque nuevo |
| L1-12 | En el recibo de guardado, el selector «Verify saved HTML» medía 32 px. Heredaba el CSS de la casilla antigua (`.receipt-check input{width:16px}`). | El selector de archivo ocupa el ancho disponible. **No se tocó la comprobación de bytes.** | `sophia-v75-print-shell` (parte `@media screen`) |

---

## 3. Qué se probó (y qué no)

**Entorno**: Chromium 158 headless (Playwright) desde `file://`, sin red. **No** es Edge corporativo.

| Prueba | V74 SOP | V74 QC | V75 SOP | V75 QC |
|---|---|---|---|---|
| Carga sin errores de consola | PASS | PASS | PASS | PASS |
| Impresión del navegador: solo `#document` (modo de impresión emulado + PDF real; texto del PDF sin «SOPHIA/Commands/Standalone/Fonts are still loading»; sin fondo negro con gráficos de fondo) | FAIL | FAIL | PASS | PASS |
| Ctrl+P abre Print Studio, con la vista previa lista | FAIL | FAIL | PASS | PASS |
| Ctrl+S en edición abre «Draft» | FAIL | FAIL | PASS | PASS |
| Herramientas de solo lectura activas en lectura | FAIL | FAIL | PASS | PASS |
| Estadísticas coherentes con la vista | FAIL | PASS* | PASS | PASS |
| Sin cambios fantasma en History al abrir | PASS | FAIL | PASS | PASS |
| PID de prueba → editar → Save draft → descargar → verificar → confirmar → **reabrir** → editar → guardar → **reabrir** (sin IDs duplicados, sin recuperación residual, sin errores) | FAIL | FAIL | PASS | PASS |
| Etiqueta Canvas al reabrir una copia clara | FAIL | FAIL | PASS | PASS |
| Selector de verificación con ancho usable (≥ 120 px) | FAIL | FAIL | PASS | PASS |
| **Captura de página completa en modo lectura idéntica a V74** (1440×900, 1024×768, 390×680, 320×568; texto de estadísticas neutralizado) | — | — | idéntica | idéntica |
| History abre (última y anterior), Focus entra y sale, Table Flow abre (QC) | — | — | PASS | PASS |

\* QC tenía 1 sola hoja, así que «1 pages» coincidía por casualidad.

**Fallos conocidos que siguen en V75** (dependen de decisión, sección 5):
- A-04: Intro duplica `data-block-id`.
- C-04: publicar sin cambios repite la versión (V1 → V1).
- C-03: el contenido editado fuera del editor no se detecta.
- C-02: `localPIDKeys` sigue en el HTML.

**NO EJECUTADO**:
- Edge corporativo ni vista embebida de SharePoint o Copilot (incluido el síntoma A01 de Cancel/Send).
- Diálogo nativo de «Save HTML as».
- Diálogo nativo de impresión. Se probó el PDF de Chromium, no la impresora.
- PDF de Print Studio comparado página a página con V74. Print Studio no se ha tocado; su iframe no carga los estilos de la página.
- Lector de pantalla.
- Documentos largos (más de 20 páginas, tabla de 90 filas) en V75.
- Publish y Big Validation completos hasta confirmar.

**Prueba automatizable**: `node tests/sophia-regression.mjs <html…>` (en `docs/sophia-audit/tests/`, requiere Node + Playwright). Úsala antes y después de cada lote.

---

## 4. Zonas de cuidado («ten cuidado al tocar…»)

1. **`offer()` / `serial()` / `matchesExport()`** (`editor-v2-upgrade`): el guardado se confirma solo si el archivo guardado coincide **byte a byte** con la exportación. No cambies el orden «serializar → Blob → descargar → verificar → confirmar → `Object.assign(data, r)`». Si añades un nodo de interfaz nuevo, márcalo `data-runtime` o `serial()` lo guardará en el documento.
2. **`#record`**: nunca se edita a mano ni por CSS o interfaz. `encode()` (v2) escapa `<` como `<`; las funciones antiguas con `.replace(/</g,'<')` están **muertas y no escapan nada**: no las reactives (informe 01, sección 10).
3. **`sophia-v75-print-shell` debe ser el ÚLTIMO bloque `<style>`**. Ninguna regla de interfaz puede quedar fuera de `@media screen`. Si `display` de `.toolbar` vuelve a ganar en impresión, la barra sale en el PDF otra vez.
4. **`EditorTransactions.run`**: toda mutación del documento pasa por aquí. Hay dos excepciones heredadas que conviene corregir: «Insert information card» de QC e «Image Layout Studio».
5. **`history-engine-v20`**: `h75Meta()` debe aplicarse por igual en `blocks()` y en `draw()`, o la decoración se desalinea. No reatribuyas revisiones guardadas.
6. **`keydown` global del núcleo**: aquí viven Ctrl+S, Ctrl+P, Ctrl+Z y Ctrl+Y. Los diálogos bloquean S, Z, Y y P en captura: mantenlo así.
7. **Disposición aprobada**: orden superior 4→1→3→2→7 │ 5→6, ciclos Full→Mini→Hide, More tools en estrecho, Focus reversible y Layout view junto a Layout Studio en Navigate. **No la cambies sin aprobación** (prompt maestro, sección 5). `islands-v30-script` agrupa los botones **por su texto** (expresiones regulares sobre etiquetas): si renombras un botón, revisa `rules`, `aliases`, `short35` y `shorter`.
8. **`#execution-context-v17`**: aviso de diagnóstico de la vista embebida (relacionado con A01, Cancel/Copilot). **No lo borres**. Desde V75 no se imprime ni se guarda.
9. **`LayoutEngine`**: mueve nodos sin partirlos y verifica `signature()` antes y después. No metas aquí lógica de interfaz.
10. **Table Flow es solo de Quick Card** por diseño. No fuerces paridad de perfiles sin decisión.
11. **`localPIDKeys`**: no añadas PID ni claves nuevas. Su retirada está pendiente de decisión (C-02).
12. **No uses** `!important` nuevos, clases con sufijo de versión (`ui37`, `-v76`) ni CDN. Usa `var(--jaom-*)` cuando migres estilos (`tokens/jaom-tokens.css`).

---

## 5. Decisiones abiertas (necesitan tu OK; recomendación entre paréntesis)

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| D1 · C-04 | **Numeración de versiones**. Hoy el SOP muestra V1 con historial 0.1–0.4, guarda 1.01, y Publish sin cambios repite V1.01. | (a) Mantener `1.01`, pero bloquear la repetición y derivar la versión inicial de la última revisión. (b) Esquema `X.Y-dN` para borradores, `X.Y` al publicar y `X+1.0` en Big Validation. | (b), con migración anotada. Mientras tanto, como mínimo (a). |
| D2 · C-02 | **Claves PID en el HTML** (contradice la regla 8 del prompt maestro: no guardar credenciales en el HTML). | (a) Quitar claves: identidad declarada más casilla. (b) Código local con hash PBKDF2 como freno de comodidad. (c) Firmas ECDSA (fase posterior). | (a) ya, y (c) cuando haya piloto. |
| D3 · A-04 | **IDs de bloque automáticos**: añadir `data-block-id` a todo el contenido y reparar duplicados al pulsar Intro. | Sí o no. Añade atributos al contenido y, por tanto, a las instantáneas siguientes. | Sí. Es requisito de comentarios, mover bloques y de las propuestas del agente (`targetBlockId`). |
| D4 · C-03 | **Huella de integridad** (SHA‑256 por revisión, encadenada, verificada al abrir). | Añade campos a `#record`. | Sí, en un lote propio con compatibilidad hacia atrás. |

---

## 6. Siguiente lote propuesto

**Lote 2 · Edición fluida** (`05_HERRAMIENTAS_TIPO_WORD.md`), sin cambios de registro ni de disposición:
- W-10 ortografía;
- W-04 atajos;
- W-01 mini-barra de selección;
- W-02 menú contextual;
- W-03 menú «/»;
- W-06 pegar desde Word con estructura;
- W-12 cambios desde el último guardado.

Previo de 1 línea: exponer `Workbench.register`.

**Puerta de salida del Lote 2**:
- matriz «Edición o diálogos» del prompt maestro en ambos perfiles;
- `sophia-regression.mjs` sin FAIL;
- capturas sin regresiones en lectura;
- exportar y reabrir sin restos de las superficies nuevas;
- Ctrl+Z tras cada herramienta.

**Informe completo y propuestas**: `01_INFORME_AUDITORIA.md` (hallazgos), `02_ARQUITECTURA_OBJETIVO.md` (evolución del núcleo y agente), `03_DISENO_OBSIDIAN_JAOM.md` (diseño y tokens), `04_PLAN_DE_TRABAJO.md` (lotes) y `05_HERRAMIENTAS_TIPO_WORD.md` (herramientas).
