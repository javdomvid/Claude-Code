# Propuestas: más herramientas tipo Word (interactivas) para SOPHIA

> Catálogo pensado para **evolucionar el editor actual**, no para sustituirlo. Restricciones que se respetan:
> - offline;
> - sin CDN ni librerías nuevas;
> - `contenteditable` encapsulado;
> - toda mutación por `EditorTransactions.run`;
> - controles declarados según `sophia-ui-contract`;
> - nodos de ejecución con `data-runtime`;
> - nada se imprime ni se serializa salvo el contenido.
>
> Cada herramienta indica:
> - **Dónde**: superficie y grupo del contrato.
> - **Datos**: `ninguno` (solo interfaz), `contenido` (cambia `#document` y por tanto las revisiones) o `registro` (añade campos a `#record`). Lo que toca `contenido` o `registro` necesita tu OK antes de implementarse.
> - **Cómo**: esqueleto sobre las API que ya existen.
> - **Prueba**: mínima, alineada con la matriz de aceptación del prompt maestro.

## Requisito técnico previo (pequeño)

`Workbench` no expone `register()`: devuelve solo `run`, `openPalette` y `list`. Para que las herramientas nuevas aparezcan en Commands (Ctrl+K) y hereden la gestión de habilitado/deshabilitado, expón `register` en el `return Object.freeze({…})` de `workbench-commands-v24`. Es un cambio de 1 línea, sin efectos en el documento.

```js
// workbench-commands-v24, al final:
return Object.freeze({run, openPalette, register, list: () => …});
```

---

## Lote 2 · «Edición fluida» — sin cambios de datos (recomendado como siguiente)

### W-01 · Mini-barra flotante de selección
- **Qué**: al seleccionar texto en modo edición aparece encima de la selección una barra compacta de cristal (`--jaom-glass-2`) con:
  - **B**, *I*, U;
  - resaltar;
  - enlace;
  - limpiar formato;
  - «Pendiente de confirmar» (ver W-13; desactivado hasta aprobar W-13).
- **Dónde**: superficie temporal nueva (`.sophia-selection-bar`). Hay que darla de alta en el contrato. No aparece en Read, Focus, History ni en diálogos.
- **Datos**: ninguno propio. Usa los comandos existentes, que ya son transaccionales.
- **Cómo**:
  ```js
  // nuevo bloque <script id="sophia-w01-selection-bar">
  const bar = Object.assign(document.createElement('div'), {className:'sophia-selection-bar', hidden:true});
  bar.dataset.runtime = ''; bar.setAttribute('role','toolbar'); bar.setAttribute('aria-label','Formato rápido');
  // botones: mousedown -> preventDefault() para NO perder la selección (como la cinta actual)
  [['bold','B'],['italic','I'],['underline','U']].forEach(([cmd,label]) => {
    const b = document.createElement('button'); b.type='button'; b.textContent=label; b.setAttribute('aria-label',cmd);
    b.addEventListener('mousedown', e => e.preventDefault());
    b.addEventListener('click', () => EditorCommands.command(cmd));
    bar.append(b);
  });
  document.body.append(bar);
  document.addEventListener('selectionchange', () => requestAnimationFrame(() => {
    const s = getSelection(), ok = EditorSession.get().pid && !document.body.classList.contains('focusmode')
      && s.rangeCount && !s.isCollapsed && EditorCommands.hasSelection() && !document.querySelector('dialog[open]');
    bar.hidden = !ok; if (!ok) return;
    const r = s.getRangeAt(0).getBoundingClientRect();
    bar.style.left = Math.max(8, Math.min(innerWidth - bar.offsetWidth - 8, r.left + r.width/2 - bar.offsetWidth/2)) + 'px';
    bar.style.top = Math.max(8, r.top - bar.offsetHeight - 8) + 'px';
  }));
  ```
  CSS: `position:fixed; z-index: var(--jaom-z-dropdown)`; oculto en `@media print`; respeta `prefers-reduced-motion`.
- **Prueba**:
  - seleccionar → aplicar negrita → Ctrl+Z;
  - la barra no aparece en Read, Focus ni History;
  - Esc la oculta;
  - el teclado puede llegar a ella (Alt+F10 lleva el foco a la barra);
  - reabrir el exportado: no hay restos.

### W-02 · Menú contextual (clic derecho y tecla Menú / Shift+F10)
- **Qué**: un menú propio, solo en edición y dentro de `.pagecontent`, que cambia según dónde se pulse:
  - **Texto**: cortar, copiar, pegar como texto, enlace, estilo de párrafo e «Insertar debajo…» (abre W-03).
  - **Tabla**: insertar fila o columna (arriba, abajo, izquierda, derecha), borrar, Table Studio y, en QC, Table Flow.
  - **Imagen**: tamaño y espaciado, Layout Studio, reemplazar, texto alternativo, mover arriba o abajo y borrar.
- **Dónde**: superficie temporal (`role="menu"`). Esc devuelve el foco al punto de origen.
- **Datos**: ninguno propio. Llama a `TableStudio`, `EditorMedia` y `EditorCommands`.
- **Cómo**: `area.addEventListener('contextmenu', e => { if (!editable) return; e.preventDefault(); open(menuFor(e.target), e.clientX, e.clientY); })`. Cada elemento del menú llama al comando que ya existe. **No dupliques lógica.**
- **Prueba**:
  - cada elemento ejecuta exactamente una vez;
  - Cancel y Esc no tienen efectos;
  - en Read se muestra el menú nativo del navegador.

### W-03 · Menú «/» de inserción rápida
- **Qué**: escribir `/` al principio de un párrafo vacío abre un menú filtrable con:
  - Título 1 y 2;
  - lista con viñetas y numerada;
  - tabla;
  - imagen;
  - aviso (warning) y «Confirmación requerida»;
  - línea;
  - salto de página (regla de Layout `data-layout-before="page"`).
- **Dónde**: superficie temporal anclada al cursor.
- **Datos**: contenido. Inserta los mismos bloques que hoy crea la cinta, sin tipos nuevos.
- **Cómo**:
  - en `keydown`, si `e.key === '/'` y el bloque actual está vacío, abre el menú;
  - Enter ejecuta `EditorCommands.command('formatBlock','h2')`, `EditorCommands.insertTable()`, `EditorMedia.open()` o un `EditorTransactions.run('Insert callout', …)` que inserta `<aside class="warning">` igual que el contenido existente.
- **Prueba**:
  - cada opción, con Ctrl+Z después;
  - escribir `/` en medio de una frase no abre nada;
  - funciona igual en SOP y QC.

### W-04 · Atajos tipo Word + ayuda de atajos
| Atajo | Acción | Estado hoy |
|---|---|---|
| Ctrl+B/I/U | Negrita, cursiva, subrayado | El navegador ya lo hace (verificar que pasa por `capture`) |
| Ctrl+K | Insertar enlace | Hoy abre Commands: proponer **Ctrl+K = enlace** en edición, con la selección, y **Ctrl+Shift+P = Commands** |
| Ctrl+Alt+1/2/3 | Título 1, 2 y normal | Nuevo |
| Ctrl+Shift+7 / 8 | Lista numerada / viñetas | Nuevo |
| Ctrl+E/L/R/J | Centrar, izquierda, derecha, justificar | Nuevo |
| Ctrl+F / Ctrl+H | Buscar / Reemplazar | Hoy Ctrl+Shift+F: añadir Ctrl+F en edición y lectura |
| Alt+↑ / Alt+↓ | Mover el bloque arriba o abajo | Solo existe para imágenes (ver W-07) |
| Ctrl+Enter | Salto de página | Nuevo |
| Ctrl+S | Guardar borrador | **Hecho en V75** |
| Ctrl+P | Print Studio | **Hecho en V75** |
| F1 o Ctrl+/ | Panel de atajos | Nuevo |

- **Datos**: ninguno, salvo el contenido de los comandos que ejecutan.
- **Ojo**: si W-04 cambia el significado de Ctrl+K, hay que decidirlo y anunciarlo («Commands» se queda en el botón y en Ctrl+Shift+P).

### W-05 · Barra de estado tipo Word
- **Qué**: franja inferior fina (28–32 px) con:
  - `Página 2 de 4` (solo en A4) o `Continuous`;
  - `146 / 522 palabras` (selección / total);
  - idioma del documento;
  - zoom con − / slider / + y botón Fit;
  - modo (Lectura, Edición o Focus);
  - punto ámbar si hay cambios sin guardar.
- **Dónde**: **cambia la disposición aprobada**, así que necesita tu OK. Alternativa sin cambiar la disposición: reutilizar `#session-strip` y añadirle los datos.
- **Datos**: ninguno.

### W-06 · Pegar desde Word conservando la estructura
- **Qué**: hoy **todo pegado se convierte en texto plano** (núcleo L395). Con esto se conserva:
  - títulos (h2 y h3);
  - párrafos;
  - listas;
  - negrita, cursiva y subrayado;
  - enlaces `https:`;
  - tablas simples.

  Se descartan los estilos de Word (`mso-*`), las fuentes y los colores. **Ctrl+Shift+V** sigue pegando como texto plano.
- **Datos**: contenido.
- **Cómo**:
  1. Sanea con la **misma lista blanca** que History, generalizando `safeRoot()` a `SophiaSanitize.fragment(html, profile)`.
  2. Mapea `p.MsoHeading1` → `h2` y `p.MsoHeading2` → `h3`.
  3. Convierte `p.MsoListParagraph` en `ul`/`ol` leyendo `mso-list`.
  4. Pasa `normalizeBody()`.
  5. Inserta con `EditorTransactions.run('Paste formatted', …)`.
- **Prueba**:
  - fixtures de Word: lista anidada, tabla, títulos;
  - ningún `style` ni `class` de Word en el resultado;
  - Ctrl+Z en un paso.

### W-07 · Mover cualquier bloque (asa ⋮⋮ + teclado)
- **Qué**: al pasar el ratón por un bloque de nivel superior (párrafo, lista, tabla, aviso o figura) aparece un asa a la izquierda. Arrastrar muestra la guía de destino (la misma de `EditorMedia`). Con teclado, Alt+↑/↓.
- **Datos**: contenido (orden).
- **Cómo**: generalizar `relocate()`, `targets()` y la guía de `editor-media-v14` a un servicio `BlockMove`. Respetar `data-layout-keep` y no mover dentro de tablas.
- **Prueba**:
  - mover arriba y abajo entre páginas en A4;
  - Ctrl+Z;
  - la atribución del historial se conserva («Reordered», no «Deleted + Added»), lo cual exige A-04 (IDs).

### W-08 · Copiar formato (brocha)
- **Qué**: copia las propiedades de párrafo **permitidas** (las de `EditorCommands.properties`) de un bloque a otro u otros. No copia estilos libres.
- **Datos**: contenido. **Dónde**: cinta, Home → Text style.

### W-09 · Símbolos y caracteres especiales
- **Qué**: un selector con → ✓ ✗ ⚠ © ® ° ± ≤ ≥ × ÷ €, espacio de no separación y guion no separable, más la fecha de hoy (formato del idioma del documento).
- **Datos**: contenido. **Dónde**: cinta, Insert.

### W-10 · Ortografía offline del navegador
- **Qué**: `spellcheck="true"` y `lang` en `.pagecontent` cuando se está editando, tomando el idioma de los metadatos del documento. Fuera de edición, `spellcheck="false"`, para que no haya subrayados al leer ni al imprimir.
- **Datos**: ninguno. Es lo más barato de todo el lote.

### W-12 · «Cambios desde el último guardado» en vivo (control de cambios ligero)
- **Qué**: en edición, un margen izquierdo marca los bloques **añadidos**, **modificados** o **movidos** respecto a la última revisión guardada. Un panel lateral, *Changes*, los lista. Cada cambio tiene «Ir» y «Revertir este bloque», que trae el bloque de la última instantánea mediante una transacción.
- **Datos**: ninguno propio. «Revertir» cambia contenido, pero vía transacción y con Ctrl+Z.
- **Cómo**:
  - reutiliza `historyCompare(lastSnapshot, cleanContent())`, que ya existe y en V75 ya excluye los metadatos;
  - recalcula con *debounce* (800 ms) tras `capture()`;
  - el marcador es un pseudo-elemento por clase en tiempo de ejecución, quitado en `serial()` y en `cleanContent()`.
- **Prueba**:
  - escribir una palabra → 1 marcador «Modified»;
  - revertir → 0;
  - el exportado no contiene las clases de los marcadores.

---

## Lote 3 · «Revisión y control» — añade datos (necesita decisión)

### W-11 · Comentarios por bloque
- **Qué**: hilos de comentario anclados a un bloque, con autor PID declarado, fecha, respuesta y resolver o reabrir. Panel *Comments* en el lateral. Contador en Checks («3 comentarios abiertos») y aviso, no bloqueo, al publicar.
- **Datos**: registro (`record.comments[] = {id, blockId, pid, date, text, resolved, replies[]}`). **Dependen de A-04** (IDs estables y automáticos), porque sin ellos el comentario pierde su ancla.
- **No** se imprimen ni aparecen en la vista histórica limpia. En el historial anotado, opcionalmente.

### W-13 · «Pendiente de confirmar» como marca semántica
- **Qué**: marca `<span class="tbc">` (amarillo ámbar, borde punteado) aplicable desde la mini-barra, el menú contextual o Ctrl+Shift+T. Checks las cuenta y las lista con «Ir».
- **Opción de perfil**: Publish exige 0 marcas TBC.
- **Datos**: contenido (marcado nuevo). Al imprimir, se ve como texto con subrayado punteado, sin color de fondo (decisión del responsable).

### W-23 · Puerta de calidad antes de publicar
- **Qué**: al pulsar Publish, una lista de comprobación (formato bento) con:
  - TBC abiertos;
  - imágenes sin texto alternativo;
  - celdas vacías en tablas;
  - páginas que desbordan;
  - comentarios abiertos;
  - integridad (C-03);
  - número de versión nuevo y único (C-04).

  Bloqueante o informativa según el perfil.
- **Datos**: ninguno, salvo el registro de que se pasó la puerta.

---

## Lote 4 · «Estructura del documento» — cambia contenido existente (migración)

### W-14 · Numeración automática de títulos y pasos
- **Hoy**: la numeración se escribe a mano en el texto («3.1 Receive and access the ticket»).
- **Propuesta**: numeración generada por CSS *counters* o por el motor, que se reajusta al mover o insertar secciones.
- **Requiere migración**: quitar los números del texto existente. Hay que hacerlo en una revisión explícita de tipo «migration» para que el historial no lo atribuya a nadie.

### W-15 · Tabla de contenido insertable
Bloque generado (no editable a mano) que se actualiza al guardar o con un botón. Enlaces internos a las secciones.

### W-16 · Galería de estilos rápidos
Normal, Título 1–3, Paso, Nota, Aviso, Confirmación requerida y Cita. Cada estilo es una **clase de la plantilla del perfil**, no un estilo en línea. Sustituye al desplegable actual «Normal text / Heading 1 / Heading 2 / Quote».

### W-17 · Referencias cruzadas
«Ver §3.4» como enlace interno que se actualiza si cambia la numeración. Depende de W-14 y A-04.

---

## Lote 5 · «Entrada y salida Word» — HTML maestro + Word como entrada o salida

### W-18 · Importar `.docx` offline a un **borrador nuevo**
- **Viabilidad**: Edge y Chromium tienen `DecompressionStream('deflate-raw')`. Un `.docx` es un ZIP: se lee el directorio central, se descomprimen `word/document.xml`, `word/styles.xml`, `word/numbering.xml` y `word/media/*`, y se convierten con `DOMParser`. Todo sin librerías ni red.
- **Correspondencia**:

  | Word | SOPHIA |
  |---|---|
  | `Heading1–3` | `h2`/`h3` |
  | `ListParagraph` + `numPr` | `ul`/`ol` |
  | `w:tbl` | tabla simple |
  | `w:drawing` | figura con texto alternativo (`wp:docPr/@descr`) |
  | negrita, cursiva, subrayado | igual |

  El resto se convierte en párrafo y aparece en un **informe de importación**.
- **Regla**: siempre a un borrador nuevo o a una copia, nunca sobre el documento abierto. Revisión `mode: "import"` con el nombre y la huella del `.docx`.

### W-19 · Exportar `.docx` básico (salida, no sustituto del HTML)
WordprocessingML mínimo (títulos, párrafos, listas, tablas e imágenes) y ZIP con `CompressionStream`. Aviso de fidelidad: «el HTML es el maestro».

---

## Lote 6 · Lectura e interacción

| ID | Propuesta | Datos |
|---|---|---|
| W-20 | **Miniaturas de páginas** en el lateral (A4), con clic para ir. Render barato: proporción y título de la primera sección, no una captura. | ninguno |
| W-21 | **Navegación por secciones en lectura**: esquema fijo con la sección actual resaltada mientras se desplaza (`IntersectionObserver`). | ninguno |
| W-22 | **Comparar dos revisiones cualesquiera** (no solo la anterior) en History: selector A/B y vista lado a lado o anotada. | ninguno |
| W-24 | **Fragmentos reutilizables**: «Paso con captura», «Tabla de decisión», «Aviso de confidencialidad», como plantillas del perfil insertables con W-03. | contenido |
| W-25 | **Modo presentación** para formación: una sección por pantalla, flechas para avanzar, sin interfaz. | ninguno |

---

## Orden recomendado y dependencias

```
V75 (hecho) ─► Lote 2 (W-10, W-04, W-01, W-02, W-03, W-06, W-12, W-07*)  ← sin cambios de datos salvo contenido normal
                 * W-07 da mejor resultado con A-04 (IDs automáticos)
            ─► Decisiones: C-04 (numeración), C-02 (claves), A-04 (IDs automáticos), C-03 (hashes)
            ─► Lote 3 (W-11, W-13, W-23)  ← requiere A-04 y la decisión de formato del registro
            ─► Lote 4 (W-14…W-17)         ← migración de contenido explícita
            ─► Lote 5 (W-18, W-19)        ← Word como entrada o salida
            ─► Lote 6                      ← cuando haya tiempo
```

**Por qué este orden**:
- Lote 2 da la mayor sensación de «Word profesional» sin tocar el registro ni la disposición aprobada. Excepción: W-05, que se puede encajar en `#session-strip`.
- Los lotes 3 y 4 necesitan IDs de bloque estables. Sin A-04, los comentarios y las referencias se rompen al pulsar Intro.
