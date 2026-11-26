# Informe de auditoría — SOPHIA V74 (SOP Editor y Quick Card Editor)

> **Archivos auditados**
> - `SOP_Editor_V74_SOPHIA_Light_dock_point.html` (534 KB, 2.644 líneas) → en este informe: **SOP**
> - `Quick_Card_Editor_V74_SOPHIA_Light_dock_point.html` (553 KB, 2.757 líneas) → en este informe: **QC**
>
> Estilo declarado en el `<title>`: *Obsidian JAOM Material Expressive Glass*. Nombre de la aplicación en la interfaz: **SOPHIA**.
>
> Fecha de la auditoría: 2026‑11‑26. Navegador de prueba: Chromium 158 (headless, Playwright) + axe‑core 4.10.

---

## ★ Reconciliación con el «Prompt maestro y contexto integral» y estado en V75

**Bases verificadas.** Las dos bases recibidas coinciden byte a byte con la tabla del prompt maestro:
- SOP `74a978af…84f7`, 534.596 bytes;
- QC `17fb391c…ee85`, 552.908 bytes.

El sufijo `_dock_point` del nombre viene de la descarga.

**Qué cambia en mis recomendaciones tras leer el contexto:**
1. **Evolucionar, no reescribir.** Se acepta el criterio del proyecto: lotes pequeños en ambos perfiles, con puerta de salida y tocando el controlador responsable. La arquitectura del documento 02 queda como **destino de la Fase 4 «núcleo compartido sin big bang»**, no como un salto.
2. **La disposición aprobada se respeta.** Se mantienen el orden 4→1→3→2→7 │ 5→6, los ciclos Full/Mini/Hide, More tools, Focus y Views. Las propuestas de diseño que la alteran van marcadas «requiere aprobación» en el documento 03.
3. **ProseMirror y otros motores**: solo como experimento lateral, nunca en la rama estable (matriz de herramientas del prompt maestro).
4. **Nunca sobrescribir originales**: el guardado sigue siendo «copia nueva + verificación byte a byte».
5. **Dos IA distintas**:
   - la IA de desarrollo (Copilot), que evoluciona el código por lotes;
   - el futuro **agente SOPHIA**, que propone cambios de contenido revisables (`Proposal` con `targetBlockId`, `baseFingerprint`…) y nunca escribe por una vía paralela.

   Mis propuestas de IDs de bloque (A-04) y huellas (C-03) son **requisitos** de ese contrato de propuestas.
6. **PID = autoría declarada**: ya era el criterio del proyecto. C-02 se mantiene porque las claves en el HTML **contradicen la regla 8 del propio prompt maestro** («no almacenar credenciales ni secretos en HTML»).

### Estado de cada hallazgo

| ID | Estado en V75 | Nota |
|---|---|---|
| C-01 Impresión con interfaz | ✅ **Corregido** (L1-01, L1-02, L1-04) | Además, el lienzo negro ya no se imprime con «gráficos de fondo». |
| C-02 Claves PID | ⏸ Decisión D2 | Recomendado: identidad declarada sin claves. |
| C-03 Integridad | ⏸ Decisión D4 | Lote propio, con compatibilidad hacia atrás. |
| C-04 Versiones | ⏸ Decisión D1 | Mínimo recomendado: bloquear versiones repetidas. |
| A-01 Nodos de interfaz en exportación | ✅ **Corregido** (L1-05) | Ciclo ×2 sin IDs duplicados. |
| A-02 Ctrl+S → Publish | ✅ **Corregido** (L1-03) | |
| A-03 Cambios fantasma en QC | ✅ **Corregido** (L1-06) | |
| A-04 IDs de bloque | ⏸ Decisión D3 | |
| A-05 Crecimiento del archivo | 📋 Propuesto (Lote de activos) | Afecta al formato del registro. |
| A-06 Divergencia SOP/QC | 📋 Parcial | Table Flow solo en QC es **intencionado**; ver la nota en A-06. |
| A-07 Contenido en el motor | 📋 Propuesto | |
| A-08 Código muerto | 📋 Propuesto (lote de limpieza) | Sin borrarlo todavía: no era «seguro y explícito» sin una prueba de cobertura por función. |
| A-09 Cascada CSS | 📋 Propuesto (doc 03 §5) | V75 solo corrigió `glass-v31`. |
| A-10 Recuperación residual | ✅ **Corregido** en el guardado confirmado (L1-07) | La caducidad y el aviso en Checks siguen propuestos. |
| M-02, M-03, M-04, M-13 (selector de verificación) | ✅ **Corregidos** (L1-10, L1-08, L1-09, L1-12) | |
| Resto de M-xx y B-xx | 📋 Propuestos | B-04: **conservar** el aviso de diagnóstico (A01). |

Lo cambiado, cómo se probó y las zonas de cuidado están en [`HANDOFF_V75_PARA_COPILOT.md`](HANDOFF_V75_PARA_COPILOT.md).

---

## 0. Cómo leer este informe (humanos y Copilot)

- Cada hallazgo tiene un **ID estable**: `C-xx` (🔴 crítico), `A-xx` (🟠 alto), `M-xx` (🟡 medio), `B-xx` (🔵 bajo). Los hallazgos de diseño y experiencia de uso (`D-xx`) están en [`03_DISENO_OBSIDIAN_JAOM.md`](03_DISENO_OBSIDIAN_JAOM.md).
- Cada hallazgo sigue siempre el mismo formato:
  - **Dónde**: `id` del bloque `<script>`/`<style>` y la línea en el archivo **SOP**. En QC, busca el mismo `id` de bloque: las líneas se desplazan unas +34 a partir de la línea 18, porque QC tiene CSS propio al principio.
  - **Qué pasa**: el defecto.
  - **Evidencia**: cómo se comprobó (lectura del código o prueba real en navegador).
  - **Por qué importa**: el impacto.
  - **Arreglo**: pasos concretos.
  - **Aceptación**: cómo comprobar que quedó bien. Muchos criterios se pueden automatizar con [`tests/sophia-regression.mjs`](tests/sophia-regression.mjs).
- El orden de trabajo recomendado está en [`04_PLAN_DE_TRABAJO.md`](04_PLAN_DE_TRABAJO.md). La arquitectura a la que conviene migrar está en [`02_ARQUITECTURA_OBJETIVO.md`](02_ARQUITECTURA_OBJETIVO.md).
- **Regla para Copilot:** arregla siempre el hallazgo **en los dos perfiles** (SOP y QC). Si no se pueden unificar todavía, deja una nota en el commit explicando por qué solo se tocó uno.

### Escala de gravedad

| Nivel | Significado |
|---|---|
| 🔴 **Crítico** | El entregable sale mal (impresión), la trazabilidad se puede falsear o romper sin que nadie lo note, o el historial de versiones deja de ser fiable. Hay que arreglarlo antes de usarlo para algo oficial. |
| 🟠 **Alto** | Corrupción progresiva del archivo, atribución incorrecta, divergencia entre perfiles o arquitectura que provoca bugs continuamente. |
| 🟡 **Medio** | Errores de comportamiento, rendimiento, accesibilidad o experiencia de uso que molestan pero no rompen datos. |
| 🔵 **Bajo** | Limpieza: código muerto, textos de depuración, nombres, pequeñas incoherencias. |

---

## 1. Resumen ejecutivo

**Qué es.** Un HTML autocontenido que es a la vez:
1. el documento (SOP o Quick Card);
2. un editor tipo procesador de textos (cinta, estudios de tabla, imagen y maquetación, buscar y reemplazar);
3. un sistema de trazabilidad: revisiones con instantánea HTML, autoría por PID, «Big Validation», historial con atribución palabra a palabra y recibo de guardado con verificación de bytes.

Todo funciona offline y sin dependencias externas.

**Lo que está bien hecho**, y hay que conservarlo:
- Frontera de transacciones (`EditorTransactions.run`) con *rollback* del DOM y del historial de deshacer.
- Diálogos con «previsualizar antes de aplicar»: reemplazar, tablas, maquetación, biblioteca de imágenes.
- Recibo de guardado que compara byte a byte el archivo guardado antes de confirmar la revisión.
- Historial que reconstruye las instantáneas con una lista blanca (`safeRoot`) y las pinta en Shadow DOM.
- Vista de impresión en un `iframe` con CSP estricta.
- Gestión del foco al cerrar diálogos.
- Soporte de `prefers-reduced-motion` y `prefers-reduced-transparency`.
- Textos honestos («esto no es una aprobación oficial»).
- axe‑core solo detecta **1** problema de contraste en modo lectura.

**El problema de fondo.** Se ha construido por **acumulación de parches**:

| Concepto | SOP | QC |
|---|---|---|
| Bloques `<script>` | ≈28 | ≈31 |
| Bloques `<style>` | ≈58 | ≈66 |
| Usos de `!important` | 1.014 | 1.090 |
| Familias de clases con sufijo de versión | 31 | 31 |

Las familias con sufijo de versión son del tipo `ui30…ui36`, `h20…h72`, `ph2…ph65`. Hay 16 funciones globales redefinidas 26 veces. Además, el archivo **se guarda a sí mismo serializando el DOM vivo**, de modo que el estado de la interfaz acaba dentro del documento y cada versión tiene que «deshacer» lo que guardó la anterior. Casi todos los fallos graves salen de ahí.

### Los 10 problemas más importantes

| # | ID | Problema | Nivel |
|---|---|---|---|
| 1 | C-01 | Imprimir con **Ctrl+P** o desde el menú del navegador **imprime toda la barra del editor** encima del SOP, en cada página, junto con un aviso de depuración y un toast. | 🔴 |
| 2 | C-02 | Las claves PID están **en texto claro** en el HTML; «Publish» y «Big Validation» usan la misma clave. Cualquiera puede firmar como otro. | 🔴 |
| 3 | C-03 | **No hay control de integridad**: si se edita el HTML fuera del editor, se abre como versión oficial sin ningún aviso (probado). | 🔴 |
| 4 | C-04 | **Números de versión duplicados e incoherentes**: SOP muestra «V1» con un historial 0.1–0.4; se salta a 1.01; publicar sin cambios crea otra V1.01. | 🔴 |
| 5 | A-01 | Cada guardado **arrastra nodos de la interfaz** al archivo: los IDs duplicados crecen +1 por ciclo (probado con 2 ciclos). | 🟠 |
| 6 | A-03 | QC atribuye a la primera persona que guarda **17 «cambios» que no hizo** (tabla de identidad y logo). | 🟠 |
| 7 | A-04 | **Identidad de bloques rota**: 0 bloques con ID, e Intro duplica `data-block-id`. La atribución del historial depende de heurísticas. | 🟠 |
| 8 | A-05 | **El archivo crece sin control**: cada revisión copia el HTML entero con todas las imágenes en base64. El deshacer ocupó 15 MB con 8 imágenes; la recuperación local llega a llenar el `localStorage`. | 🟠 |
| 9 | A-02 | **Ctrl+S abre «Publicar»**, con clave, en vez de «Guardar borrador». | 🟠 |
| 10 | A-06 | **SOP y QC han divergido**: QC tiene funciones y arreglos que SOP no tiene, y cada arreglo hay que hacerlo dos veces. | 🟠 |

**Veredicto.** Es un prototipo muy trabajado y con buenas intenciones de seguridad en la experiencia de uso. Pero **la trazabilidad todavía no es fiable** y la arquitectura de parches hace que cada mejora rompa otra cosa. Recomendación, ajustada al proceso del proyecto:
1. **Lote 1 (hecho, V75)**: C-01, A-01, A-02, A-03, A-10 y varios medios.
2. **Decisiones D1–D4**: versiones, claves, IDs y huellas.
3. **Lote 2**: edición fluida tipo Word (documento 05).
4. **Fase 4 de vuestro plan**: núcleo compartido sin big bang, cuyo destino describe el documento 02.

Ese formato es además el que permite que **Copilot edite el código y genere contenido de SOP con seguridad**: Copilot edita módulos pequeños y JSON validado por esquema, nunca un HTML de 530 KB con líneas de 70.000 caracteres.

---

## 2. Método y alcance

**Lectura estática** completa de todos los bloques JavaScript: núcleo, sesión, transacciones, comandos, imágenes, historial, navegador, reemplazar, revisión, biblioteca, identidad, tablas, maquetación, *workbench*, islas e impresión. El CSS se revisó con métricas automáticas y por muestreo.

**Pruebas dinámicas** en Chromium 158 sin interfaz:
1. Carga de ambos perfiles y errores de consola. Resultado: **0 errores**.
2. Capturas a 1440, 1024 y 390 px, con lienzo oscuro y claro.
3. Ciclo completo: entrar con PID → escribir → «Save draft» → descargar → verificar el archivo → confirmar → **reabrir la copia** → **segundo ciclo** sobre la copia.
4. Impresión del navegador (PDF de la página principal) y Print Studio.
5. History Studio: última revisión y revisión histórica.
6. Accesibilidad con axe‑core.
7. Prueba de **manipulación**: editar el HTML fuera del editor y abrirlo.
8. Prueba de **almacenamiento**: `localStorage` compartido entre archivos `file://`.
9. Rendimiento con 8 imágenes de 277 KB.
10. Atajos de teclado: Ctrl+S, Ctrl+P y Ctrl+K.

**No probado:**
- Edge corporativo real ni vista previa de SharePoint o Teams.
- Lectores de pantalla.
- Firefox y Safari.
- DM Sans instalada localmente.
- Archivos con decenas de revisiones.

---

## 3. Mapa de la arquitectura actual (para orientarse)

```
<head>
  CSS base sin id (L2–17)  ← plantilla del folio, de la que tira Print Studio por posición
  script anónimo L17       normalizeBody()
  editor-session-v11       EditorSession   (PID, dirty, recuperación localStorage, render de estado)
  editor-transactions-v21  EditorTransactions.run()  (rollback DOM + undo)
  editor-commands-v12      EditorCommands  (execCommand, párrafo, tabla, enlace)
  editor-media-v14         EditorMedia     (importar, colocar, redimensionar, Layout Studio de imagen)
  jaom-glass-v48, jaom-v49 (CSS del estilo)
<body>
  .toolbar (HTML estático, onclick="…")  .ribbon  .navigator  #document (.sheet > .pagecontent)
  islands-v30-restore      deshace en la carga la interfaz que se guardó en la exportación anterior
  #record (JSON)           {schema,id,status,revisions[{version,date,author,…,snapshot(HTML)}],templateProfile}
  script núcleo (L324–466) data, edit, capture/undo (60 estados HTML), modal, side(), PID (localPIDKeys),
                           exportPID v1, serialiseCopy, downloadReceipt…   ← gran parte sobrescrita después
  editor-v2-upgrade        documentVersion, canonical(), serial(), offer() (recibo), exportPID v3 (vigente)
  history-engine-v20       replay(), transition() (LCS por palabras), History Studio (Shadow DOM)
  navigator-v19, replace-v21, review-v22, image-library-v23, block-identity-v25,
  table-studio-v26, layout-engine-v27, layout-studio-v27, workbench-commands-v24 (registro de comandos)
  [QC] table-flow-v28, history-repair-v29
  islands-v30-script (37 KB) reorganiza la barra por expresiones regulares sobre los textos de los botones
  p42-print-module, p425-table-resize
  ~25 bloques <style> jaom-v51…v55, sophia-phase1…2i, sophia-ui-v68/69, sophia-history-v71/72, sophia-light-elevation
  sophia-ui-contract (text/plain)  contrato de interfaz en español
```

**Flujo de guardado vigente** (`editor-v2-upgrade`, `exportPID` v3, L551):
1. Calcula `canonical()` (cuerpo + metadatos + fuente) y lo compara con `data.contentBaseline` para saber si hay cambios.
2. Calcula la versión con `next()` (L475).
3. Crea `r = copia de data` y le añade `revisions.push({…, snapshot: area.innerHTML})` y `enrichHistory(r)`.
4. `offer()` → `serial(r)`: **clona `document.documentElement` entero**, quita una lista de nodos conocidos e incrusta el JSON.
5. Descarga → el usuario elige el archivo guardado → se comparan los bytes → «Confirm saved» → `Object.assign(data, r)`.

---

## 4. 🔴 Hallazgos críticos

### C-01 · Imprimir desde el navegador imprime la interfaz del editor encima del SOP

- **Dónde**:
  - `<style id="glass-v31">` (L1293): `.toolbar[data-ui30]{display:flex!important;…}` **fuera de `@media screen`**.
  - `<style id="islands-v30-style">` (L1291): `@media print{.toolbar[data-ui30]{display:none!important}}`.
  - `#execution-context-v17` solo se oculta con una regla `@media screen` (`sophia-phase1-shared`).
  - `window.addEventListener('beforeprint', …)` (L432) llama a `paginateDocument(false)` → `LayoutEngine.reflow()` → `ready()` lanza «Fonts are still loading. Retry after they finish.» (L1093) como toast.
- **Qué pasa**:
  - Las dos reglas tienen la misma especificidad y las dos llevan `!important`. Gana la que aparece después (glass-v31), así que **la barra superior se imprime**.
  - Al usar Ctrl+P o el menú «Imprimir» del navegador, en lugar del botón «Print» de la app, el PDF lleva en la cabecera la barra SOPHIA con todos los botones. Como es `sticky`, se repite en varias páginas.
  - También se imprimen el aviso «Standalone window detected… no chat integration is added by this repair» y el toast de fuentes.
  - **Ctrl+P no se intercepta**: no abre Print Studio.
- **Evidencia**: `page.pdf()` de ambos perfiles → la barra aparece en las páginas 1 y 2 del SOP y en todas las de QC. En el modo de impresión emulado, el estilo calculado de `.toolbar` es `display:flex`.
- **Por qué importa**: el PDF o el papel es el entregable oficial de un SOP. Sale con la interfaz encima del contenido, tapa texto y no es presentable. Además, en QC la cabecera oscura se imprime clara si la opción «Gráficos de fondo» está desactivada: texto blanco sobre papel blanco.
- **Arreglo**:
  1. Mueve el contenido de `glass-v31` dentro de `@media screen { … }`. Revisa con una búsqueda que no quede **ninguna** regla de `.toolbar`, `.ribbon`, `.navigator`, `.ui31-*`, `.ui32-*`, `#session-strip`, `dialog`, `.toast` ni `#execution-context-v17` fuera de `@media screen`.
  2. Añade como **último** bloque del `<head>`, o del `<body>`, un `<style id="sophia-print-shell">` con:
     ```css
     @media print {
       body > :not(#document):not(.workspace) { display: none !important; }
       #document, #document * { visibility: visible !important; }
       .toast, dialog, [data-media-ui], #session-strip, #execution-context-v17 { display: none !important; }
     }
     ```
     Ajusta el selector si `#document` no es hijo directo de `body`; se puede comprobar en las DevTools.
  3. Intercepta Ctrl+P y Cmd+P en un único manejador global, en captura, que llame a `PrintStudio42.open()` salvo que ya haya un diálogo abierto. Mantén `beforeprint` solo como red de seguridad, **sin** mutar el DOM ni lanzar toasts:
     ```js
     document.addEventListener('keydown', e => {
       if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
         if (document.querySelector('dialog[open]')) return;
         e.preventDefault(); e.stopImmediatePropagation(); PrintStudio42.open();
       }
     }, true);
     ```
  4. En `beforeprint`, sustituye `paginateDocument(false)` por algo que no falle: si `document.fonts.status === 'loading'` o hay imágenes sin cargar, **no** repagines y no muestres toasts. El CSS de impresión ya fuerza los saltos.
  5. Añade a la impresión un pie controlado (ver M-10).
- **Aceptación**:
  - `page.emulateMedia({media:'print'})` → `getComputedStyle(document.querySelector('.toolbar')).display === 'none'`.
  - El texto del PDF no contiene «SOPHIA», «Commands», «Standalone», «Fonts are still loading».
  - Ctrl+P abre `#p42-print`.
  - Ver `checkPrintLeak` en el test.

---

### C-02 · Control de acceso y «firmas» falsificables (claves en texto claro)

- **Dónde**:
  - `const localPIDKeys = {…}` (L435): 9 PID con su clave en claro y con un patrón predecible (`PID_####`).
  - `edit()` (L440).
  - `exportPID` v3 (L551) usa **la misma** clave para «Publish» y para «Big Validation».
  - `history-engine-v20` usa `localPIDKeys` para decidir si una atribución es válida y qué color darle (L571–573).
- **Qué pasa**:
  - Cualquiera que abra el código fuente ve todas las claves.
  - Basta con `EditorSession.start('CUALQUIERA')` en la consola, o con editar el JSON `#record` en un editor de texto, para crear revisiones «publicadas» o «Big Validated» a nombre de otro.
  - La lista de PID de personas reales viaja dentro de **cada copia** del documento.
  - La interfaz lo admite («Keys are visible in the HTML source. This is not corporate authentication»), pero los campos `publisherPID`, `bigValidation` y `lastPublishedByPID` **parecen** atestaciones.
- **Por qué importa**: si el SOP se usa en un entorno con control documental (ISO 9001, GMP, 21 CFR Part 11), un registro de aprobación que cualquiera puede fabricar no vale como evidencia. Es peor que no tenerlo, porque da una falsa sensación de control.
- **Además**: contradice la regla no negociable 8 del prompt maestro: «No almacenar credenciales ni secretos en HTML, recuperación, prompts o registros».
- **Arreglo** (decisión del responsable; recomendado en este orden):
  1. **Inmediato (Fase 0)**:
     - Elimina las claves del archivo.
     - Sustituye «PID + clave» por «**identidad declarada**»: el PID y el nombre los escribe quien edita, más una casilla de declaración.
     - Renombra los campos para que digan lo que son: `declaredBy` en lugar de `publisherPID`.
     - En el historial, muestra «declarado por X».
     - Cambia «Big Validation» a «Validación declarada» hasta que exista firma real.
  2. **Si se quiere mantener un «freno» contra ediciones accidentales**: un código local de edición guardado como hash PBKDF2‑SHA‑256 con sal. Etiquétalo claramente como «bloqueo de comodidad, no seguridad». Con 4 dígitos se rompe en segundos, así que **no** debe usarse para atribuir autoría.
  3. **Fase 4 (firma real offline)**: firmas ECDSA P‑256 con WebCrypto (`crypto.subtle` funciona en `file://`; comprobado: `isSecureContext === true`).
     - La clave privada de cada persona **no** está en el SOP: va en IndexedDB del navegador, como clave no extraíble, o en un archivo `.jwk` personal.
     - En el SOP solo hay claves públicas y sus huellas.
     - Para que no puedan sustituir el registro de claves, publica la huella de cada versión publicada fuera del archivo: lista de SharePoint, correo o Teams.
     - Detalle en el documento 02, §6.
- **Aceptación**:
  - `grep` del HTML no encuentra `localPIDKeys` ni ninguna clave.
  - El historial muestra «declarado» para autorías sin firma.
  - Una revisión con firma inválida se marca en rojo.

---

### C-03 · Sin control de integridad: el contenido manipulado se presenta como oficial

- **Dónde**:
  - Carga del documento (núcleo L324 + `editor-v2-upgrade` L474).
  - `data.contentBaseline = data.contentBaseline || canonical()` y el script anónimo L738 (`newlineFixV5`) recalculan la línea base **a partir del DOM actual**, no de la última revisión.
  - `hash()` (L576) es FNV‑1a de 32 bits y solo sirve para el diff del historial, no para integridad.
- **Qué pasa**:
  - No se comprueba que lo que se ve (`#document`) coincide con la última revisión guardada.
  - Las revisiones no llevan hash ni encadenamiento, así que cualquiera puede borrar o reescribir revisiones antiguas en el JSON.
- **Evidencia**: se editó en el SOP el título «SCOPE» con un editor de texto (fuera de SOPHIA). Al abrirlo:
  - estado «Draft - not approved · Read only»;
  - `dirty:false`;
  - sin ningún aviso;
  - el texto manipulado aparece como contenido de la versión V1.
- **Por qué importa**: es el agujero principal de la trazabilidad. Además, **Copilot** u otra IA, al editar el HTML directamente, produciría justo esta situación sin dejar rastro.
- **Arreglo**:
  1. Define una **serialización canónica** del contenido: hoy, `canonical()` de `editor-v2-upgrade`; en la arquitectura objetivo, el JSON de bloques ordenado. Calcula `contentHash = SHA-256(canonical)` con `crypto.subtle.digest`.
  2. En cada revisión guarda `contentHash`, `prevHash` (el `hash` de la revisión anterior) y `hash = SHA-256(JSON canónico de la revisión sin el campo hash)`.
  3. **Al cargar** (de forma asíncrona, al arrancar):
     - recalcula el hash del contenido visible y compáralo con el `contentHash` de la última revisión;
     - recorre la cadena de revisiones.
  4. Muestra una franja de estado persistente con uno de cuatro estados:
     - «Íntegro · V1.3 publicada»;
     - «⚠ Contenido distinto de la última revisión registrada (cambios no registrados)»;
     - «⛔ Historial alterado (cadena rota en la revisión N)»;
     - «Formato antiguo sin hashes»: para V74 se migra calculando los hashes en la primera apertura y anotando una revisión de tipo `migration`.
  5. Con el contenido distinto: no bloquees la lectura, pero **impide «Publish»** hasta que alguien registre esos cambios como una revisión nueva con motivo.
  6. Deja claro en la interfaz el límite: un hash sin firma detecta cambios **accidentales o ingenuos**; la protección contra cambios **deliberados** necesita firma más una huella publicada fuera del archivo (C-02, punto 3).
- **Aceptación**:
  - Editar un carácter del cuerpo con `sed` → al abrir aparece el aviso y «Publish» queda deshabilitado.
  - Borrar una revisión del JSON → «cadena rota».
  - Ver `checkTamperDetection` en el test.

---

### C-04 · Numeración de versiones incoherente y duplicada

- **Dónde**:
  - `editor-v2-upgrade` (L469): `data.documentVersion = data.documentVersion || '1'`.
  - `next()` (L475).
  - `exportPID` v3 (L551): `version = big ? next(v, true) : dirty ? next(v, false) : data.documentVersion`.
  - Quedan además dos esquemas muertos: `'0.' + (revisions.length + 1)` (L324, L393, L442) y `nextDocumentVersion()` (L454).
- **Qué pasa**:
  1. El SOP tiene revisiones 0.1–0.4 pero **no** tiene `documentVersion`. Al cargar se pone «1»: la interfaz muestra «Document V1» y el historial 0.4.
  2. El siguiente guardado es **1.01** (con `padStart`): se salta de 0.4 a 1.01.
  3. «Publish & save» **sin cambios** reutiliza la versión actual. Probado: «V1.01 → V1.01 · Published». Esto crea **dos revisiones con el mismo número**.
  4. Los borradores y las publicaciones comparten numeración: no hay forma de distinguir un 1.02 borrador de un 1.02 publicado salvo por el campo `status`.
  5. El código muerto de `nextDocumentVersion()` daría `1.NaN` con una versión sin punto, como el «1» de QC.
- **Por qué importa**: en control documental, el número de versión es la clave de la trazabilidad. Si se repiten números o hay saltos sin explicar, el historial no vale como evidencia.
- **Arreglo**:
  1. Adopta un esquema explícito y documéntalo en el JSON (`versioning: "major.minor+draft"`):
     - **Borrador**: `X.Y-dN`. Por ejemplo, `1.1-d1`, `1.1-d2`. Cada borrador incrementa N.
     - **Publicación**: `X.Y`. Publicar sin cambios de contenido no crea versión: solo se permite «reemisión» con motivo obligatorio, y se registra como evento, no como revisión.
     - **Big Validation o cambio mayor**: `X+1.0`.
     - Regla de integridad: `version` es **única** en `revisions[]`. Valídalo antes de `offer()` y también al cargar.
  2. **Migración**: si existe `revisions[]` pero no `documentVersion`, deriva `documentVersion` de la última revisión (0.4) en lugar de poner «1». Registra un evento `migration` explicando el cambio de esquema, por ejemplo «0.4 → 1.0-d1 en el siguiente guardado».
  3. Borra `nextDocumentVersion`, la fórmula `'0.'+…` y todo `exportPID` anterior (ver A-08).
  4. Muestra en el diálogo de guardar: «Versión actual → versión nueva», el tipo (borrador o publicación) y por qué.
- **Aceptación**:
  - Guardar el SOP tal cual → `1.0-d1` (o el esquema elegido), nunca `1.01`.
  - Publicar sin cambios → bloqueado, o «reemisión» como evento.
  - `new Set(revisions.map(r=>r.version)).size === revisions.length`.

---

## 5. 🟠 Hallazgos altos

### A-01 · La exportación serializa el DOM vivo: la interfaz se acumula en el archivo

- **Dónde**: `serial()` en `editor-v2-upgrade` (L480). Clona `document.documentElement` entero y elimina una **lista cerrada** de nodos. Todo lo que crean scripts posteriores y no está en esa lista se guarda.
- **Evidencia**:
  - **Nodos de ejecución que acaban guardados.** El original no tiene ninguno de estos nodos; la copia exportada sí: `#jaom-view-heading`, `#media-replace-file`, `#v425-table-ui` y `#execution-context-v17`. Al reabrir, los scripts vuelven a crearlos, así que hay IDs duplicados. En un **segundo** ciclo hay 3 copias de cada uno: crece +1 por guardado.
  - **Atributos de interfaz en `<body>`.** También se guardan `data-ui34-edit`, `style="--ui34-ribbon-top:…"` y `data-jaom-light`.
  - **Código que deshace lo guardado.** Por eso existen `islands-v30-restore` (L317), el bloque «staleMini» (L1513–1520), «unwrap wb24 groups» (L1239) y «Remove duplicate buttons on reopening» (L449–450).
- **Por qué importa**:
  - Es una corrupción progresiva del archivo.
  - `getElementById` devuelve el nodo **más antiguo**.
  - Cada versión nueva de la interfaz necesita otro script de «restauración».
  - Cualquier IA que edite el archivo ve nodos fantasma y los toma por parte del diseño.
- **Arreglo**:
  - **Inmediato (Fase 0)**:
    1. Marca **todo** nodo creado en tiempo de ejecución con el atributo `data-runtime` y borra `[data-runtime]` en `serial()`.
    2. Además, en `serial()`, quita de `<body>` los atributos `data-ui34-edit`, `style`, `data-jaom-light` y `data-ph-*`.
    3. Al arrancar, antes de crear un nodo con `id`, haz `document.querySelectorAll('#'+id).forEach(n=>n.remove())`.
  - **Definitivo**: exportar **desde piezas prístinas**, no desde el DOM. La interfaz se genera siempre por JS dentro de un contenedor `#app` que nunca se serializa. La exportación se compone con:
    - el `textContent` de los `<style>` y `<script>` del motor, que nunca se mutan;
    - el JSON de datos nuevo;
    - un HTML estático de lectura regenerado.

    Es el patrón de TiddlyWiki: el archivo es un *quine*. Detalle en el documento 02, §2.
- **Aceptación**: guardar → reabrir → guardar → reabrir, y en ningún momento hay IDs duplicados. `checkExportCycle` en el test.

### A-02 · Ctrl+S abre «Publicar» en lugar de «Guardar borrador»

- **Dónde**: el `keydown` global (L394) llama a `closeRevision()`, que en L552 es `exportPID('Published')`.
- **Evidencia**: en modo edición, Ctrl+S abre «Save revision · PID X · V1 → V1.01 · Published».
- **Por qué importa**: Ctrl+S es «guardar» para cualquier usuario. Mapearlo a una publicación, aunque pida clave, invita a publicar por error y a acostumbrarse a teclear la clave sin pensar.
- **Arreglo**:
  - Ctrl+S → `exportPID('Draft')`.
  - Si no hay cambios, muestra un toast «Sin cambios que guardar».
  - Publicar solo desde su botón o desde la paleta de comandos.
  - Registra el atajo en `Workbench` para que la paleta lo muestre.
- **Aceptación**: Ctrl+S abre el diálogo con «· Draft».

### A-03 · QC: la tabla de identidad y el logo cuentan como «cambios de contenido» y se atribuyen a quien guarda

- **Dónde**:
  - En QC, `canonical()` y `blocks()` del historial incluyen `.qc-hero`.
  - La tabla `.identity`, y su fila `[data-trace]`, viven **dentro** de `.qc-hero`.
  - El logo en el DOM no coincide con el de la instantánea V1.
- **Evidencia**:
  - `historyCompare(última instantánea, contenido actual)` en QC **sin editar nada** da 17 cambios: «Image replaced» del logo y «Added» para Level, Client, Organization… Version y «V1».
  - En la copia guardada tras escribir una frase, `detectedChanges` tiene 19 entradas, incluida «Added → JAOM · 2026‑11‑26… · V1.01 · Save draft», es decir, la propia fila de trazabilidad.
  - En SOP la comparación da 0 cambios. El problema es exclusivo de QC.
- **Por qué importa**: la atribución a personas es la promesa central del historial, y aquí culpa o atribuye cambios que nadie hizo.
- **Arreglo**:
  1. En `blocks()` (history-engine) y en `canonical()`, excluye `.identity, [data-trace], [data-version-cell], .pagehead, .pagefoot, .doc-classification` y cualquier nodo marcado `data-meta`. Los metadatos deben ir en el JSON (`meta`), no en el contenido.
  2. Para el logo, compara por hash del activo, no por cadena `src`. Si la «reparación de logo» (`repairHistoricalLogo`) cambia el `src` en pantalla, esa reparación no debe contar como cambio.
  3. Al migrar QC, crea una revisión `migration` con la instantánea **actual**, para que la siguiente persona parta de una base limpia.
- **Aceptación**: en QC recién abierto, `historyCompare(last.snapshot, cleanContent()).changes.length === 0`. Escribir una palabra genera exactamente 1 cambio «Modified».

### A-04 · La identidad estable de bloques no funciona en la práctica

- **Dónde**: `block-identity-v25` (L955). Los IDs solo se asignan con una «migración» manual desde el diálogo *Structure*.
- **Evidencia**:
  - Ambos documentos tienen **0** bloques con `data-block-id` (41 bloques en SOP).
  - Al pulsar **Intro** dentro de un párrafo con ID, Chromium copia los atributos: hay **2** párrafos con el mismo ID.
  - La política «rekey de todas las ocurrencias» destruye también la identidad del original.
- **Por qué importa**:
  - `transition()` del historial usa los IDs como primera estrategia de emparejamiento. Sin ellos, cae en la similitud de palabras (umbral 0,32): un párrafo muy reescrito pasa a ser «Deleted + Added» y pierde su autoría previa.
  - Para la IA, los IDs son lo que permite decir «modifica el paso b-3f2…» sin ambigüedad.
- **Arreglo**:
  1. Asignación **automática** al cargar (si faltan) y tras cada transacción o entrada de texto, con un `MutationObserver` agrupado (*debounced*) que:
     - asigna un ID a bloques nuevos;
     - ante duplicados, **conserva el ID en el primer nodo en orden del documento** (el que tiene el inicio del texto original) y genera uno nuevo para los demás;
     - no cuenta como «cambio de contenido» en `canonical()`, porque los IDs se excluyen de la comparación.
  2. Usa IDs cortos y deterministas en formato, por ejemplo `b-` más 10 caracteres base32 aleatorios. 32 hexadecimales es excesivo y pesa en el archivo.
  3. Mantén el diálogo *Structure* como inspector de solo lectura más una reparación manual excepcional.
- **Aceptación**: tras abrir, el 100 % de los bloques tiene ID único. Pulsar Intro deja 0 duplicados. Ver `checkBlockIds`.

### A-05 · Crecimiento descontrolado del archivo, de la memoria y del almacenamiento

- **Dónde**:
  - `revisions[].snapshot` guarda el HTML completo con las imágenes en base64.
  - `contentBaseline` guarda otra copia completa del contenido en el JSON.
  - `detectedChanges` y `historyEngine`.
  - `undoStates`: hasta 60 cadenas HTML completas (L336–341).
  - Recuperación local en `localStorage` (`editor-session-v11`).
- **Evidencia**:

  | Medida | Resultado |
  |---|---|
  | SOP: un guardado de una línea | +47 KB. El logo (8 KB) aparece **6 veces** en el archivo: DOM, `templateProfile` y 4 instantáneas. |
  | QC: un guardado de una línea | **+124 KB**. `contentBaseline` ocupa 45 KB porque incluye el logo de la cabecera. |
  | Deshacer con 8 imágenes de 277 KB | 9 estados = **15,3 MB**. Con 60 estados se superarían los 100 MB. |
  | Recuperación local con esas 8 imágenes | 2,2 MB en `localStorage`. El cupo suele ser de unos 5 MB: con unas pocas capturas más pasa a «unavailable» sin avisar de por qué. |
- **Por qué importa**:
  - Los SOP con capturas de pantalla, que es lo normal, se volverán lentos y pesados a las pocas revisiones.
  - SharePoint, Teams y el correo tienen límites de tamaño y de vista previa.
  - La recuperación falla justo cuando más falta hace.
- **Arreglo**:
  1. **Almacén de activos direccionado por contenido**: `assets: { "sha256-<hex>": { mime, data } }`. Las imágenes del contenido y de las instantáneas referencian `data-asset="sha256-…"`. Al renderizar, se resuelve a un `blob:` URL. Cada imagen se guarda **una sola vez** en todo el archivo.
  2. Instantáneas: guarda el contenido canónico, ya sin imágenes en línea. Opcional: guarda solo deltas entre revisiones y una instantánea completa cada N.
  3. Deshacer: guarda el HTML con referencias a activos en lugar de base64, o pasa a deshacer por pasos, como en el editor objetivo del documento 02.
  4. Recuperación: IndexedDB, guardando las referencias a activos más los activos nuevos.
  5. Elimina `contentBaseline` del JSON: es derivable del `contentHash` de la última revisión.
- **Aceptación**:
  - Guardar 5 veces un SOP con 8 capturas → el archivo crece menos de 30 KB por guardado de texto.
  - Cada imagen aparece una sola vez en el archivo.

### A-06 · SOP y QC son dos ramas que han divergido

- **Evidencia**: ver la tabla de la sección 8. Solo QC tiene:
  - Table Flow (v28);
  - History repair (v29);
  - imprimir una revisión;
  - mostrar u ocultar etiquetas de PID en el historial;
  - logo tomado de `templateProfile`;
  - estilos propios de la cabecera.

  SOP marca `editorVersion='V27'` y QC `'V29'`. El botón Print de SOP llama a `window.print()` y se intercepta con un listener que **nunca** se ejecuta, porque *Workbench* ya ha quitado el `onclick` (L2201). En QC llama directamente a Print Studio.
- **Por qué importa**: cada arreglo hay que hacerlo dos veces, y con el tiempo se hará solo en uno. El contrato `sophia-ui-contract` ya lo intenta mitigar a mano.
- **Matiz tras leer el contexto**: algunas diferencias son **intencionadas**. Table Flow es solo de Quick Card, y el contrato dice «No unificar motores ni forzar paridad de perfiles». El riesgo real es la **deriva accidental**: `editorVersion` distinto, ruta de impresión distinta, `history-repair` y «Print revision» solo en QC sin decisión documentada.
- **Arreglo**:
  1. Documenta en el contrato una tabla «diferencias intencionadas por perfil».
  2. Lo que no esté en esa tabla se lleva a ambos perfiles en el mismo lote.
  3. A medio plazo, el núcleo compartido de la Fase 4 con perfiles de documento (`profile: "sop" | "quick-card"`) que activan componentes (cabecera, tarjetas, Table Flow). Ver el documento 02, §4.

### A-07 · El motor contiene contenido de un documento concreto

- **Dónde**:
  - `newPage()` (L324) escribe literalmente el título de **este** SOP y «Classification: TO BE CONFIRMED». Luego se parchea en L419 leyendo `.identity .value[4]` por posición.
  - `template()` del layout busca el título con `tr:nth-child(3) .value` (L1081+).
  - `repairHistoricalLogo` (L566) lleva incrustado en base64 el logo «malo» de una empresa concreta.
  - Table Studio tiene la paleta de marca con nombre: «Brand light blue #CBE7F5», «Brand highlight #EDF2AE» (L1018).
  - `historyCompare(…, pid='JAOM')` (L735).
  - La identidad del folio (`Level`, `Organization`, etc.) está en HTML, no en datos.
- **Por qué importa**: si Copilot usa este archivo como plantilla para un SOP nuevo, arrastra títulos, logos y colores de otro cliente. Y cualquier cambio en el orden de las filas rompe los encabezados de continuación.
- **Arreglo**: mueve todo eso a `templateProfile` y `meta` en JSON (título, clasificación, logo como activo, paleta de celdas, campos de identidad con clave) y referencia por **clave**, no por posición: `[data-meta-key="title"]`.

### A-08 · Cadenas de *monkey‑patching* y código muerto que confunden a cualquier editor, humano o IA

- **Evidencia**:
  - 16 funciones globales redefinidas 26 veces: `closeRevision` (×4), `download` (×4), `side` (×4 en SOP y ×5 en QC), `exportPID` (×3), `edit` (×3), `setEditable`, `historyView`, `metadataDialog`, `renumberPages`, `newPage`, `requestHTMLDownload`, `downloadReceipt`, `pidStatus`, `capture`, `setDocumentView` y `downloadCurrentCopy`.
  - Hay versiones completas **muertas**: `download()` con `prompt()` y `alert()`, `closeRevision()` v1, `exportPID` v1 y v2, `serialiseCopy` y `downloadReceipt`.
  - Dos de ellas incluyen el escape roto de B-01.
  - El comportamiento depende del orden de carga de 27 scripts.
- **Por qué importa**: una IA que busca `function exportPID` encuentra **la primera**, que está muerta, y la edita sin efecto. O peor, la «arregla» y reactiva un flujo antiguo.
- **Arreglo**:
  - Lote de limpieza: borra las versiones muertas de la tabla de la sección 10, tras confirmar con `console.count` que ninguna ruta las usa.
  - Fase 2: un módulo por responsabilidad, con API explícita y sin variables globales salvo `window.SOPHIA`.

### A-09 · Guerra de cascada CSS

- **Evidencia**:
  - 164 KB de CSS en 58 bloques.
  - **910** `!important` en `<style>` y 104 más en cadenas JS.
  - **728** colores hexadecimales distintos.
  - 29 radios, 63 sombras, 11 `backdrop-filter`, 24 tamaños de fuente, 23 `z-index` (hasta 15000) y 34 *media queries* distintas.
  - 291 selectores con `#historyStudio`, algunos como `#historyStudio.history-v71.history-v59.history-v38.history-v41`.
  - 31 familias de clases con versión.
- **Por qué importa**: C-01 es consecuencia directa de esto. Cualquier ajuste visual obliga a añadir otro `!important` más específico.
- **Arreglo**: ver el documento 03, §8 (plan con `@layer`, tokens y componentes canónicos). Fase 0: solo C-01. Fase 2: reescritura del CSS por capas.

### A-10 · Los borradores de recuperación se quedan en el navegador y cualquier HTML local puede leerlos

- **Dónde**: `editor-session-v11`. `saved()` (L45) **no** llama a `clearRecovery()`.
- **Evidencia**:
  - Tras confirmar el guardado, la clave `document-recovery:v11:<id>` sigue en `localStorage`.
  - En Chromium, **todos los archivos `file://` comparten el mismo `localStorage`**: un HTML en otra carpeta leyó el valor escrito por otro (probado).
- **Por qué importa**: hay copias completas de borradores, posiblemente confidenciales, que no caducan nunca, y cualquier HTML descargado y abierto en local puede leerlas.
- **Arreglo**:
  1. En `saved()` y en `discard()`, llama a `clearRecovery()`.
  2. Pon caducidad: borra al arrancar las recuperaciones de más de 7 días.
  3. Guarda la mínima información posible y muestra en el panel *Checks* «Hay X borradores de recuperación en este navegador · Borrar».
  4. Pasa a IndexedDB por el tamaño (A-05). IndexedDB también es compartido en `file://`, así que la caducidad y el borrado siguen siendo necesarios.
- **Aceptación**: tras «Confirm saved», no queda ninguna clave `document-recovery:*` para ese documento.

---

## 6. 🟡 Hallazgos medios

### M-01 · Números de versión internos incoherentes y visibles al usuario
- **Dónde**: `<title>` «V74», barra «SOP VIEW & EDITOR V42.5» (L477), HTML estático «Editor 0.11» (L317), `data.editorVersion='V27'` (SOP) o `'V29'` (QC) **escrito en el registro en cada carga** (L469), y cabeceras de diálogos con «LAYOUT ENGINE · V27/V28», «DOCUMENT ASSETS · V23», «STRUCTURED DOCUMENT EDITING · V26»…
- **Arreglo**: una sola constante `SOPHIA.ENGINE_VERSION`, mostrada solo en «Acerca de» o en el pie del panel. Las cabeceras de los diálogos no llevan versión. `editorVersion` se escribe solo al guardar, como `engineVersion` de la revisión.

### M-02 · Herramientas de solo lectura deshabilitadas en modo lectura
- **Evidencia**: en modo lectura están deshabilitados «Word count», «Check page overflow» y «Show ¶».
- **Causa**: `EditorSession.render()` (L37) decide qué es «solo vista» con una expresión regular sobre el atributo `onclick`, pero *Workbench* ya ha borrado esos atributos.
- **Arreglo**: decide la disponibilidad desde el registro de comandos (`editing:false`), no por texto de `onclick`.

### M-03 · Estadísticas desactualizadas
- **Evidencia**: el lateral muestra «4 pages · 546 approximate words» con 1 sola hoja en la vista continua.
- **Causa**: `refreshOutline()` se ejecuta antes de `mergeContinuous()` (L396 frente a L433).
- **Arreglo**: llama a `refreshOutline()` tras cualquier cambio de vista o paginación, y muestra «páginas A4 estimadas» solo en la vista A4.

### M-04 · El tema del lienzo se guarda dentro del documento y la etiqueta miente al reabrir
- **Evidencia**: activar «Canvas: Light» → descargar copia → reabrir: el lienzo está claro, pero el botón dice «Canvas: Dark» con `aria-checked="true"`.
- **Arreglo**:
  - La preferencia visual va en `localStorage` (`sophia:pref:canvas`), nunca en el documento.
  - Por defecto, respeta `prefers-color-scheme`.
  - La etiqueta se calcula del estado real.
  - En `serial()`, elimina `data-jaom-light`.

### M-05 · Doble vía para editar metadatos, con efectos distintos
- **Qué pasa**:
  - Las celdas `.identity .value` (Title, Owner, Organization…) se pueden editar directamente en el folio **y** desde «Document properties».
  - Solo el diálogo actualiza las cabeceras de continuación (`.pagehead`).
  - En línea se puede escribir cualquier cosa en *Document Owner*.
- **Arreglo**:
  - Celdas de identidad no editables en línea.
  - Un clic abre el diálogo de propiedades.
  - Validación por campo (lista de clasificaciones, formato de PID del propietario, «TO BE CONFIRMED» permitido).

### M-06 · La fuente DM Sans no está incrustada
- **Evidencia**: `@font-face{src:local('DM Sans')}` (L7). En la prueba, `document.fonts.check('12px "DM Sans"') === false`, así que se usa Arial.
- **Por qué importa**: la paginación A4 y la apariencia cambian de un equipo a otro. Además, el usuario tiene que buscar un archivo de fuente para «Embed DM Sans».
- **Arreglo**: incrusta una vez en el motor DM Sans en WOFF2 (licencia SIL OFL; subconjunto latino, pesos 400, 500, 600 y 700; unos 60–90 KB). Retira el botón «Embed font» o déjalo como avanzado.

### M-07 · Rendimiento evitable
- **Qué pasa**:
  - `capture()` clona y normaliza el documento entero cada 650 ms de inactividad y además llama a `refreshOutline()`, que vuelve a llamar a `cleanContent()`.
  - History Studio inyecta en el Shadow DOM unos 160 KB de CSS (`trustedStyles`) en **cada** `draw()`, y `draw()` se ejecuta en cada tecla del filtro de búsqueda.
  - `replay()` es O(n²) por revisión.
- **Arreglo**:
  - Usa `adoptedStyleSheets` con un `CSSStyleSheet` construido una vez y solo con el CSS del folio.
  - Pon *debounce* de 150 ms en la búsqueda.
  - Guarda en memoria el resultado de `replay()` por hash de revisión.
  - Que `refreshOutline` reutilice el clon de `capture`.

### M-08 · Marcado no semántico generado por `execCommand`
- **Qué pasa**:
  - `document.execCommand` está obsoleto.
  - `textSize` usa el truco de `fontSize=7` para crear `<font style="font-size:…">`.
  - Color y resaltado generan estilos en línea arbitrarios.
  - El resultado son colores y tamaños libres que no siguen la plantilla y que una IA no puede reproducir de forma consistente.
- **Arreglo**: limita el formato a un conjunto cerrado (negrita, cursiva, subrayado, enlace https, superíndice y subíndice, resaltado de **token**, estilos de párrafo de la plantilla). Ver el modelo de contenido del documento 02, §3. A corto plazo, normaliza `<font>` a `<span class="…">` con tokens.

### M-09 · Mutaciones fuera de la frontera de transacciones
- **Dónde**:
  - QC: «Insert information card» (L790 de QC) añade nodos sin `EditorTransactions.run` y sin comprobar el modo Focus.
  - El «Image Layout Studio» (L245–252) hace su propio `capture()` y respaldo manual.
- **Arreglo**: todo cambio del documento pasa por `EditorTransactions.run(label, fn)`.

### M-10 · La impresión no lleva pie de copia controlada ni marca de BORRADOR
- **Dónde**: `p42-print-module`. En la versión vigente, `@page @bottom-left{content:none}`.
- **Arreglo**:
  - Pie en todas las páginas: `ID · Versión · Estado · Impreso el AAAA‑MM‑DD HH:MM · Copia no controlada una vez impresa · Página X/Y`.
  - Con estado ≠ Published, marca de agua «BORRADOR — NO APROBADO».
  - Úsalo tanto en Print Studio como en la impresión del navegador (C-01).

### M-11 · Print Studio depende de la posición del CSS
- **Dónde**: `const templateCSS = [...style:not([id])].filter((s,i)=>i===0 || /\.qc-hero|SOP reference profile/…)` (L2051).
- **Por qué importa**: si Copilot añade un `id` al primer `<style>` o cambia su orden, la impresión pierde la plantilla sin dar ningún error.
- **Arreglo**: dale al CSS del folio un `id` explícito, por ejemplo `<style id="sophia-paper">`, y referencia ese `id`.

### M-12 · La atribución histórica depende de la lista actual de PID
- **Dónde**: `validPID` y `color()` en el historial (L571–573).
- **Qué pasa**: si se quita un PID o se reordena la lista, las revisiones antiguas pasan a «Attribution unavailable» y cambian de color.
- **Arreglo**: la atribución se lee de la revisión (el PID declarado o firmado). El color se deriva del hash del PID, no del índice en una lista.

### M-13 · Errores visuales concretos
- **Recibo de guardado**: el selector de archivo «Verify saved HTML» sale comprimido (se lee «Ch…»).
- **Cinta**: el campo «Size pt» corta el valor («1:»).
- **Móvil**: el toast tapa el contenido.
- **Historial**: el desplegable de revisión parte el texto en dos líneas cortadas.
- **Franja de sesión**: a 1440 px, el texto «Read-only document» queda oculto bajo el panel lateral.

Detalle visual en el documento 03 (D-xx).

### M-14 · Controles y estados duplicados
- **Controles**: Deshacer y Rehacer en el *dock* y en la cinta; Imprimir y Buscar en dos o tres sitios; «Discard» dentro del grupo «Review».
- **Estado**: aparece **tres veces** (chip «Viewing/Editing», `#state` y la franja de sesión). Ver D-03 y D-04.

### M-15 · Accesibilidad estructural
- **Evidencia (axe)**: no hay `main`; no hay `h1` en la página (el título del documento es una celda de tabla); 7 regiones fuera de *landmarks*; contraste de 3,83:1 en la franja de sesión con texto de 10 px.
- **Además**: hay mucho texto de interfaz de 9–11 px (132 declaraciones `font-size` de 9–11 px) y los toasts no tienen `role="status"`.
- **Arreglo**:
  - `<header>` para la app y `<main id="document">`.
  - El título del documento como `h1` (visualmente puede seguir en la tabla).
  - Mínimo 12 px en la interfaz.
  - Toasts en un contenedor `aria-live="polite"`.

### M-16 · Vista móvil del SOP desbordada
- **Evidencia**: a 390 px el folio A4 (210 mm) no se adapta: el logo y la tabla quedan cortados y hay que desplazarse en horizontal. En modo edición, la cinta ocupa media pantalla. QC sí se adapta.
- **Matiz**: **Fit width ya existe** (Views, desde V57: a 400 px, el A4 pasa de 746 a 376 px). El problema es que no está activo al abrir en una ventana estrecha.
- **Arreglo** (requiere aprobación, porque cambia un valor por defecto): si el ancho es menor de 820 px y el usuario no ha elegido zoom, activar Fit al abrir. Dejar Continuous fluido en estrecho como alternativa a valorar.

---

## 7. 🔵 Hallazgos bajos (limpieza)

| ID | Dónde | Qué | Arreglo |
|---|---|---|---|
| B-01 | L324, 393, 442, 456, 458 | `.replace(/</g,'<')`: en un literal JS, `'<'` **es** `<`, así que no escapa nada. Hoy es código muerto, pero da una falsa seguridad. El camino vigente (`encode` de v2, L470) sí usa `'\\u003c'`. | Borra el código muerto (A-08). Escapa también `<!--` y `-->` si se incrusta JSON en `<script>`. |
| B-02 | L431 | `window.print = function(){oldPrint();}`: envoltorio que no hace nada. | Bórralo. |
| B-03 | L735–736 | `window.historyCompare` y `historyReplay`, ganchos de prueba con el PID 'JAOM' por defecto. | Muévelos a `SOPHIA.debug` o a los tests. |
| B-04 | L742 | Aviso de diagnóstico `#execution-context-v17` («Standalone/Embedded preview detected…»). Se **imprimía** y se **guardaba** en la exportación. | **Conservarlo**: sirve para diagnosticar A01 (Cancel/Copilot en vista embebida). V75 ya impide que se imprima o se serialice. |
| B-05 | L738, L469 | Indicadores de migración (`newlineFixV5`, `upgradeV2`, `historyStudioInstalled`) mezclados con los datos. | Un único `format`/`migrations[]` en el registro. |
| B-06 | L400 | `side()` marca la pestaña activa comparando `textContent.toLowerCase()===name`. Se rompe con iconos o traducciones. | `data-panel="outline"`. |
| B-07 | Global | Interfaz en inglés y contrato en español, sin capa de idioma. | Diccionario `i18n` (en/es) en el motor. El idioma del documento va aparte, en `meta.language`. |
| B-08 | L464 | `requestHTMLDownload` v2 no revoca el `blob:` URL. | `URL.revokeObjectURL` tras el clic o al cerrar el recibo. |
| B-09 | L324 | `<details class="historybox">` «Revision history & prototype limits» sigue en el DOM, oculto por CSS. | Bórralo. |
| B-10 | L412, L417 | Dos `ResizeObserver` del núcleo recolocan la cinta y el navegador, y `islands` vuelve a hacerlo (`align()`). | Un único gestor de diseño de la interfaz con CSS (`position: sticky` y `grid`). |

---

## 8. Diferencias SOP frente a Quick Card (divergencia)

| Aspecto | SOP | QC | Acción |
|---|---|---|---|
| `editorVersion` escrito al cargar | V27 | V29 | Una constante del motor (M-01). |
| Table Flow (partir tabla con cabecera repetida) | ✗ | ✓ (v28) | Llevarlo al motor común. |
| `history-repair-v29` (fondo rojo histórico, marca de agua por hoja) | ✗ | ✓ | Común. |
| Imprimir una revisión desde el historial | ✗ | ✓ | Común. |
| Mostrar u ocultar etiquetas de PID en el historial | ✗ | ✓ | Común. |
| Botón Print | `window.print()` + interceptación que no se ejecuta | `PrintStudio42.open()` | Común (C-01). |
| `templateProfile` en el registro | ✓ | ✗ (el código lo lee con `?.`) | Perfil obligatorio en ambos. |
| `documentVersion` y `documentType` en el registro | ✗ | ✓ | Ambos (C-04). |
| Cabecera de la QC con la tabla de identidad dentro | — | ✓ | Sacar la identidad del contenido (A-03). |
| «Insert information card» | — | ✓ (sin transacción) | Componente `cardGrid` del modelo (M-09). |
| Campos editables extra (`.qc-hero h1`, `.qc-hero>p`) | — | ✓ (vía `setEditable` parcheado) | Declararlos en el perfil. |
| Contenido canónico | `.pagecontent` | `.qc-hero, .pagecontent` (sin `.identity`) | Modelo de bloques común. |

---

## 9. Lo que NO hay que romper (inventario de buenas piezas)

Copilot debe conservar o portar estas piezas tal cual cuando refactorice:

1. `EditorTransactions.run()`: síncrono, con *rollback* del DOM y del historial de deshacer.
2. El patrón «preparar plan → previsualizar → validar que nada cambió (`baseline`, `pid`, `epoch`) → aplicar en una transacción» de Replace, Table Studio, Layout Studio, Image Library y Block Identity.
3. `offer()`: recibo de guardado con verificación byte a byte y escritura con `showSaveFilePicker` verificada al releer.
4. `safeRoot()`: reconstrucción por lista blanca de las instantáneas. La lista de propiedades CSS permitidas es razonable.
5. History Studio: modos «Changes view» y «Clean text», fondo rojo y marca de agua en las revisiones históricas, «Go to block».
6. Print Studio: `iframe` con `srcdoc`, CSP `default-src 'none'`, saneado de la copia y elección A4 o Letter.
7. `LayoutEngine`: pagina moviendo nodos sin partirlos y comprueba la integridad con `signature()` antes y después.
8. La gestión del foco de origen en todos los diálogos.
9. Soporte de `prefers-reduced-motion` y `prefers-reduced-transparency`.
10. La honestidad de los textos: «declared, not verified», «does not approve the SOP».

---

## 10. Código muerto que se puede borrar en un lote de limpieza

Comprobado con el orden de ejecución: ninguna ruta viva llega a estas funciones después de que `editor-v2-upgrade` las sustituye.

| Bloque o línea | Elemento | Sustituido por |
|---|---|---|
| L324 | `function download()` (`prompt`/`alert`/`confirm`) | `closeRevision` → `exportPID` v3 |
| L393 | `function closeRevision()` v1 | L552 |
| L442 | `function exportPID()` v1 | L551 |
| L454–466 | `nextDocumentVersion`, `serialiseCopy`, `requestHTMLDownload` v1 y v2, `downloadReceipt` v1 y v2, `exportPID` v2, `downloadCurrentCopy` v1, `setupSaveButtons` | `offer()`, `serial()`, `exportPID` v3, `downloadCurrentCopy` v2 |
| L446–450 | Botones `data-pid-action` y su deduplicación | Botones de v2 y *Workbench* |
| L2201 (SOP) | Listener de captura sobre `button[onclick="window.print()"]` (nunca se cumple) | C-01 (atajo y botón directos) |
| L317 | `islands-v30-restore` | A-01 (no serializar la interfaz) |
| L324 | `<details class="historybox">` y `historyView()` v1 | History Studio |

> **Cómo comprobarlo antes de borrar**: añade temporalmente `console.count('NOMBRE')` al principio de cada función y ejecuta el ciclo completo del test (`node tests/sophia-regression.mjs <archivo>`). Si el contador no aparece, la función está muerta.

---

*Fin del informe. Continúa con [`02_ARQUITECTURA_OBJETIVO.md`](02_ARQUITECTURA_OBJETIVO.md).*
