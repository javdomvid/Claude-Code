/* ============================================================================
 * SOPHIA · 08-i18n  (V78 · owner decision X: interface in English or Spanish)
 * - English is the SOURCE language of the code, the firmware and the document.
 *   This module only translates the INTERFACE around the document, after it is
 *   drawn: text nodes and title / aria-label / placeholder attributes.
 * - Never translated: #document (the document zone), anything inside an element
 *   with translate="no" (outline, search results, comments, revision reasons…),
 *   form values, the record, the firmware, the History snapshot.
 * - To add a translation: add "English text": "Texto en español" to ES below
 *   (exact text, without surrounding spaces) or a pattern to PATTERNS.
 *   Do not translate inside modules; keep writing English there.
 * ========================================================================== */
SOPHIA.i18n = (() => {
  'use strict';
  const ES = {
    /* app bar, chips, toggles */
    'Read only': 'Solo lectura', 'Edit mode': 'Modo edición', 'Save draft': 'Guardar borrador', 'History': 'Historial', 'Focus': 'Foco',
    'Commands & search': 'Comandos y búsqueda', 'Sidebar': 'Panel lateral', 'Canvas': 'Lienzo', 'More save options': 'Más opciones de guardado',
    'Draft': 'Borrador', 'Published': 'Publicado', 'Document actions': 'Acciones del documento', 'Main panel': 'Panel principal', 'Edit panel': 'Panel de edición',
    'Full': 'Completo', 'Hide': 'Oculto', 'Close': 'Cerrar', 'Close (Esc)': 'Cerrar (Esc)', 'Exit focus (Esc)': 'Salir del foco (Esc)', 'Language': 'Idioma',
    /* main panel tiles + ribbon groups + tabs */
    'Navigate': 'Navegar', 'Review': 'Revisar', 'Assets': 'Recursos', 'Save & publish': 'Guardar y publicar', 'Output': 'Salida', 'Agent': 'Agente',
    'Agent (SOPHIA)': 'Agente (SOPHIA)', 'View': 'Vista', 'Help': 'Ayuda', 'Home': 'Inicio', 'Insert': 'Insertar', 'Layout': 'Diseño', 'Table': 'Tabla',
    'Clipboard': 'Portapapeles', 'Styles of this document': 'Estilos de este documento', 'Font': 'Fuente', 'Paragraph': 'Párrafo',
    'Objects': 'Objetos', 'Blocks': 'Bloques', 'Generated': 'Generado', 'Bring in': 'Traer', 'Pages': 'Páginas', 'Arrange': 'Ordenar',
    'Tables & images': 'Tablas e imágenes', 'Comments': 'Comentarios', 'Versions': 'Versiones', 'Quality': 'Calidad', 'Find': 'Buscar',
    'Rows & columns': 'Filas y columnas', 'Delete': 'Eliminar', 'Format': 'Formato', 'Studios': 'Estudios', 'More tools': 'Más herramientas',
    /* commands */
    'Start editing': 'Empezar a editar', 'Publish & save (+0.01)': 'Publicar y guardar (+0.01)', 'Publish & save': 'Publicar y guardar',
    'Big Validation (next major)': 'Big Validation (siguiente versión mayor)', 'Big Validation': 'Big Validation', 'Download a copy': 'Descargar una copia',
    'Recover local draft': 'Recuperar borrador local', 'Discard session changes': 'Descartar cambios de la sesión', 'Discard': 'Descartar',
    'Upgrade an older SOPHIA file…': 'Actualizar un archivo SOPHIA antiguo…', 'Print Studio / PDF': 'Print Studio / PDF', 'Print': 'Imprimir',
    'Export Word review copy (.docx)': 'Exportar copia de revisión para Word (.docx)', 'Export document map for agents (.json)': 'Exportar mapa del documento para agentes (.json)',
    'Apply agent proposal…': 'Aplicar propuesta del agente…', 'Agent brief (firmware)': 'Instrucciones del agente (firmware)', 'History Studio': 'Historial',
    'Undo': 'Deshacer', 'Redo': 'Rehacer', 'Paste as plain text': 'Pegar como texto sin formato', 'Clear formatting': 'Borrar formato', 'Bold': 'Negrita',
    'Italic': 'Cursiva', 'Underline': 'Subrayado', 'Strikethrough': 'Tachado', 'Superscript': 'Superíndice', 'Subscript': 'Subíndice',
    'Bulleted list': 'Lista con viñetas', 'Numbered list': 'Lista numerada', 'Decrease indent': 'Reducir sangría', 'Increase indent': 'Aumentar sangría',
    'Align left': 'Alinear a la izquierda', 'Center': 'Centrar', 'Align right': 'Alinear a la derecha', 'Justify': 'Justificar', 'Paragraph settings…': 'Ajustes de párrafo…',
    'Table…': 'Tabla…', 'Image or screenshot…': 'Imagen o captura…', 'Link…': 'Enlace…', 'Warning callout': 'Aviso', 'Confirmation required': 'Confirmación necesaria',
    'Horizontal line': 'Línea horizontal', 'Start on a new page': 'Empezar en página nueva', 'Insert block menu (/)': 'Menú de bloques (/)', 'Table of contents': 'Índice',
    "Today's date": 'Fecha de hoy', 'Information card': 'Tarjeta informativa', 'Card pending / confirmed': 'Tarjeta pendiente / confirmada', 'Import from Word (.docx)…': 'Importar de Word (.docx)…',
    'Decision table': 'Tabla de decisión', 'A4 pages': 'Páginas A4', 'Continuous': 'Continuo', 'Fit width': 'Ajustar al ancho', 'Zoom out': 'Alejar', 'Zoom in': 'Acercar',
    'Zoom 100 %': 'Zoom 100 %', 'Focus reading': 'Lectura en foco', 'Light / obsidian canvas': 'Lienzo claro / obsidiana', 'Show / hide side panel': 'Mostrar / ocultar panel lateral',
    'Edit panel: Full / Mini / Hide': 'Panel de edición: completo / mini / oculto', 'Main panel: Full / Mini / Hide': 'Panel principal: completo / mini / oculto',
    'Reflow A4 pages': 'Repaginar A4', 'Layout Studio…': 'Layout Studio…', 'Automatic heading numbers': 'Numeración automática de títulos', 'Move block up': 'Subir bloque',
    'Move block down': 'Bajar bloque', 'Table Studio…': 'Table Studio…', 'Table Flow…': 'Table Flow…', 'Image Layout Studio…': 'Diseño de imagen…', 'Image library…': 'Biblioteca de imágenes…',
    'Add comment': 'Añadir comentario', 'Mark To Be Confirmed': 'Marcar «Por confirmar»', 'Comments panel': 'Panel de comentarios', 'Versions & changes': 'Versiones y cambios',
    'Compare revisions…': 'Comparar revisiones…', 'Document checks…': 'Comprobaciones del documento…', 'Block structure…': 'Estructura de bloques…', 'Find & replace': 'Buscar y reemplazar',
    'Word count': 'Recuento de palabras', 'Outline panel': 'Panel de esquema', 'Show paragraph marks': 'Mostrar marcas de párrafo', 'Keyboard shortcuts': 'Atajos de teclado', 'About this file': 'Sobre este archivo',
    'Insert row above': 'Insertar fila arriba', 'Insert row below': 'Insertar fila abajo', 'Insert column left': 'Insertar columna a la izquierda', 'Insert column right': 'Insertar columna a la derecha',
    'Delete row': 'Eliminar fila', 'Delete column': 'Eliminar columna', 'Delete table': 'Eliminar tabla', 'Header row on / off': 'Fila de encabezado sí / no', 'Equal column widths': 'Columnas iguales',
    'Shade: header grey': 'Sombreado: gris encabezado', 'Shade: attention amber': 'Sombreado: ámbar atención', 'Shade: confirmed green': 'Sombreado: verde confirmado', 'Clear shading': 'Quitar sombreado',
    'Changes since last save': 'Cambios desde el último guardado', 'Insert symbol': 'Insertar símbolo',
    /* short labels */
    'Plain paste': 'Pegar sin formato', 'Clear': 'Limpiar', 'Image': 'Imagen', 'Link': 'Enlace', 'Blocks /': 'Bloques /', 'Warning': 'Aviso', 'Confirm': 'Confirmar',
    'Line': 'Línea', 'Page break': 'Salto de página', 'Card': 'Tarjeta', 'Pending': 'Pendiente', 'Contents': 'Índice', 'Date': 'Fecha', 'Symbol': 'Símbolo',
    'Word .docx': 'Word .docx', 'Proposal': 'Propuesta', 'A4': 'A4', 'Fit': 'Ajustar', 'Zoom −': 'Zoom −', 'Zoom +': 'Zoom +', 'Reflow': 'Repaginar',
    'Auto 1.2': 'Auto 1.2', 'Up': 'Subir', 'Down': 'Bajar', 'Table Studio': 'Table Studio', 'Table Flow': 'Table Flow', 'Image layout': 'Diseño de imagen', 'Library': 'Biblioteca',
    'Comment': 'Comentario', 'TBC': 'Por confirmar', 'All comments': 'Todos', 'Changes': 'Cambios', 'Compare': 'Comparar', 'Checks': 'Comprobaciones', 'Structure': 'Estructura',
    'Count': 'Recuento', 'Replace': 'Reemplazar', 'Marks ¶': 'Marcas ¶', 'Shortcuts': 'Atajos', 'Row above': 'Fila arriba', 'Row below': 'Fila abajo', 'Column left': 'Columna izq.',
    'Column right': 'Columna der.', 'Row': 'Fila', 'Column': 'Columna', 'Header row': 'Encabezado', 'Equal widths': 'Anchos iguales', 'Grey': 'Gris', 'Amber': 'Ámbar', 'Green': 'Verde',
    'No shading': 'Sin sombreado', 'Outline': 'Esquema', 'Images': 'Imágenes', 'Tables': 'Tablas', 'Import .docx': 'Importar .docx', 'Download': 'Descargar', 'Word copy': 'Copia Word',
    'Brief': 'Instrucciones', 'Map': 'Mapa', 
    /* style gallery */
    'Body text': 'Texto normal', 'Section': 'Sección', 'Sub-section': 'Subsección', 'Step group': 'Grupo de pasos', 'Procedure steps': 'Pasos del procedimiento',
    'Bullet list': 'Lista con viñetas', 'Source note': 'Nota de fuente', 'Card title': 'Título de tarjeta', 'Pending card': 'Tarjeta pendiente', 'Line spacing': 'Interlineado', 'Size': 'Tamaño',
    /* side panel */
    'Close side panel': 'Cerrar panel lateral', 'Side panel': 'Panel lateral', 'Go to': 'Ir', 'Reply': 'Responder', 'Resolve': 'Resolver', 'Reopen': 'Reabrir',
    'Full checks': 'Comprobación completa', 'Next mark': 'Siguiente marca', 'Find them': 'Buscarlos', 'Open comments': 'Abrir comentarios', 'Image library': 'Biblioteca de imágenes',
    'Update contents': 'Actualizar índice', 'Nothing to flag': 'Nada que señalar', 'No saved revisions yet.': 'Aún no hay revisiones guardadas.',
    'Find in document': 'Buscar en el documento', 'Replace with': 'Reemplazar por', 'Replace all': 'Reemplazar todo', 'Match case': 'Mayúsculas y minúsculas',
    'Whole word': 'Palabra completa', 'Include document information': 'Incluir datos del documento', 'Type to search the document.': 'Escribe para buscar en el documento.',
    'No matches.': 'Sin coincidencias.', 'Start editing to replace text.': 'Empieza a editar para reemplazar texto.', 'Document information': 'Datos del documento',
    'Each replacement is one undo step (Ctrl+Z). Formatting of the first matched character is kept.': 'Cada reemplazo se deshace con Ctrl+Z. Se conserva el formato del primer carácter.',
    /* omnibox + view panel */
    'Commands': 'Comandos', 'In this document': 'En este documento', 'No command matches.': 'Ningún comando coincide.', 'Open Find for all matches': 'Abrir Buscar con todas las coincidencias',
    'Type to filter commands and search the text of this document · ↑↓ to move · Enter to run · Esc to close': 'Escribe para filtrar comandos y buscar en el texto · ↑↓ moverse · Intro ejecutar · Esc cerrar',
    'Document layout': 'Diseño del documento', 'Document views': 'Vistas del documento', 'Separate pages': 'Páginas separadas', 'One scrolling surface': 'Una sola superficie',
    'Pages & layout': 'Páginas y diseño', 'Layout Studio': 'Layout Studio', 'Reflow pages': 'Repaginar', 'Auto numbers': 'Numeración auto', 'Esc to close': 'Esc para cerrar', 'Reset': 'Restablecer',
    /* status popover */
    'Document': 'Documento', 'Version': 'Versión', 'Last revision': 'Última revisión', 'Session': 'Sesión', 'Application': 'Aplicación',
    'None since last save': 'Ninguno desde el último guardado', 'Unsaved changes': 'Cambios sin guardar',
    /* dialogs (common) */
    'Cancel': 'Cancelar', 'Apply': 'Aplicar', 'Tool key': 'Clave', 'PID or key not recognised.': 'PID o clave no reconocidos.', 'Reason for the change': 'Motivo del cambio',
    'Confirm tool key': 'Confirmar clave', 'I reviewed and confirm this action.': 'He revisado y confirmo esta acción.', 'Save & download': 'Guardar y descargar', 'Confirm & download': 'Confirmar y descargar',
    'Your HTML is ready': 'Tu HTML está listo', 'Download HTML': 'Descargar HTML', 'Download again': 'Descargar de nuevo', 'Save HTML as…': 'Guardar HTML como…',
    'Back to editing': 'Volver a editar', 'Confirm saved': 'Confirmar guardado', 'Check a saved copy (optional)': 'Comprobar una copia guardada (opcional)', 'Saved HTML': 'HTML guardado',
    'Ready to request download': 'Listo para descargar', 'Before publishing': 'Antes de publicar', 'Before Big Validation': 'Antes de la Big Validation', 'Continue': 'Continuar',
    'I reviewed these items and want to continue.': 'He revisado estos puntos y quiero continuar.', 
    'Restore this version…': 'Restaurar esta versión…', 'Restore content': 'Restaurar contenido', 'Print revision': 'Imprimir revisión', 'Close history': 'Cerrar historial',
    'Highlight changes': 'Resaltar cambios', 'Clean text': 'Texto limpio', 'Show changes': 'Mostrar cambios', 'Hide changes': 'Ocultar cambios',
    'Print preview': 'Vista previa de impresión', 'Download print copy': 'Descargar copia de impresión', 'Print / Save PDF': 'Imprimir / Guardar PDF', 'Paper': 'Papel', 'Page breaks': 'Saltos de página',
    'Keep sheet starts': 'Mantener inicios de hoja', 'Let content flow': 'Dejar fluir el contenido',
    'Plan the pages': 'Planificar las páginas', 'Selected block': 'Bloque seleccionado', 'Keep with the next block': 'Mantener con el bloque siguiente', 'Auto': 'Auto',
    'Always': 'Siempre', 'Allow break': 'Permitir salto', 'Keep with previous': 'Mantener con el anterior', 'Reset all rules': 'Quitar todas las reglas', 'Warnings': 'Avisos',
    'Apply plan & show A4': 'Aplicar plan y ver A4', 'Show A4 pages': 'Ver páginas A4', 'Discard rules and close': 'Descartar reglas y cerrar',
    'Auto keeps headings with what follows.': 'Auto mantiene los títulos con lo que sigue.', 'Start editing to change page breaks. You can still preview the plan.': 'Empieza a editar para cambiar saltos de página. Puedes ver el plan igualmente.',
    'Insert table': 'Insertar tabla', 'First row is a header': 'La primera fila es encabezado', 'Custom size…': 'Tamaño personalizado…',
    /* gallery previews */
    'Aa text': 'Aa texto', '1. SECTION': '1. SECCIÓN', '01 · SECTION': '01 · SECCIÓN', '1.1 Sub-section': '1.1 Subsección', '1.1.1 Group': '1.1.1 Grupo', '1. Step': '1. Paso',
    '• Item': '• Elemento', 'Source…': 'Fuente…', 'If → Then': 'Si → Entonces',
    /* PID, save, receipt, checklist, comments */
    'Local PID check. Keys are visible in the HTML source: this is declared authorship, not corporate authentication.': 'Comprobación local de PID. Las claves se ven en el código HTML: es autoría declarada, no autenticación corporativa.',
    'Declared local PID record, not a verified signature or official approval.': 'Registro local de PID declarado; no es una firma verificada ni una aprobación oficial.',
    'Reason and confirmation required.': 'Motivo y confirmación obligatorios.', 'Incorrect key.': 'Clave incorrecta.', 'Type BIG VALIDATION': 'Escribe BIG VALIDATION',
    'Type BIG VALIDATION exactly.': 'Escribe BIG VALIDATION exactamente.', 'PORTABLE DOCUMENT · SAVE': 'DOCUMENTO PORTÁTIL · GUARDAR',
    'Download creates a new file. The original is never overwritten. With “Save HTML as”, choose a new name.': 'La descarga crea un archivo nuevo. El original nunca se sobrescribe. Con «Guardar HTML como», elige un nombre nuevo.',
    'If the download does not start, use “Save HTML as”. Previews inside SharePoint, Teams or Copilot may block downloads: open the file directly in Edge or Chrome.': 'Si la descarga no empieza, usa «Guardar HTML como». Las vistas previas de SharePoint, Teams o Copilot pueden bloquear descargas: abre el archivo directamente en Edge o Chrome.',
    'The copy is compared byte by byte with this export. It stays on this device.': 'La copia se compara byte a byte con esta exportación. No sale de este equipo.',
    'Download requested. When the file is in your Downloads folder, confirm.': 'Descarga solicitada. Cuando el archivo esté en tu carpeta de Descargas, confirma.',
    'Saved copy verified byte by byte. Confirm to record the revision.': 'Copia verificada byte a byte. Confirma para registrar la revisión.',
    'File written and verified.': 'Archivo escrito y verificado.', 'Save not confirmed. Your editing session is preserved.': 'Guardado sin confirmar. Tu sesión de edición se mantiene.',
    'These items are usually resolved before publishing. You can go back and fix them, or continue and record your reason in the next step.': 'Estos puntos suelen resolverse antes de publicar. Puedes volver y corregirlos, o continuar y anotar el motivo en el paso siguiente.',
    'These items are usually resolved before a Big Validation. You can go back and fix them, or continue and record your reason in the next step.': 'Estos puntos suelen resolverse antes de una Big Validation. Puedes volver y corregirlos, o continuar y anotar el motivo en el paso siguiente.',
    'Tick the box to continue, or Cancel to go back.': 'Marca la casilla para continuar o pulsa Cancelar para volver.', 'Write the comment first.': 'Escribe primero el comentario.',
    'Comment added. It is saved with your next Save draft or Publish.': 'Comentario añadido. Se guarda con el próximo Guardar borrador o Publicar.',
    'Discard session changes?': '¿Descartar los cambios de la sesión?', 'Discard session': 'Descartar sesión', 'Restore draft': 'Restaurar borrador',
    'Compare revisions': 'Comparar revisiones', 'From': 'Desde', 'To': 'Hasta', 'Apply agent proposal': 'Aplicar propuesta del agente', 'Apply selected': 'Aplicar seleccionadas',
    /* toasts */
    'Undone': 'Deshecho', 'Redone': 'Rehecho', 'Start editing with your PID first.': 'Primero empieza a editar con tu PID.', 'Finish or cancel the current dialog first.': 'Termina o cancela primero el diálogo abierto.',
    'No changes to save as a draft.': 'No hay cambios para guardar como borrador.', 'Place the cursor in a table cell first.': 'Coloca primero el cursor en una celda de tabla.',
    'Contents updated.': 'Índice actualizado.', 'Pages recalculated.': 'Páginas recalculadas.'
  };
  const MODE = { Full: 'completo', Mini: 'mini', Hide: 'oculto', Hidden: 'oculto' };
  const PATTERNS = [
    [/^Main panel: (Full|Mini|Hide|Hidden)$/, (m) => 'Panel principal: ' + MODE[m[1]]],
    [/^Edit panel: (Full|Mini|Hide|Hidden|Mini \(every tool, compact\))$/, (m) => 'Panel de edición: ' + (MODE[m[1]] || 'mini (todas las herramientas)')],
    [/^(Main|Edit) panel · next: (Full|Mini|Hide)$/, (m) => 'Siguiente: ' + MODE[m[2]]],
    [/^View: (A4 pages|Continuous)$/, (m) => 'Vista: ' + (m[1] === 'Continuous' ? 'continua' : 'páginas A4')],
    [/^Canvas: (Dark|Light)$/, (m) => 'Lienzo: ' + (m[1] === 'Dark' ? 'oscuro' : 'claro')],
    [/^Editing · (.+)$/, (m) => 'Editando · ' + m[1]],
    [/^Unsaved · (.+)$/, (m) => 'Sin guardar · ' + m[1]],
    [/^Editing as (.+)$/, (m) => 'Editando como ' + m[1]],
    [/^(\d+) open · (\d+) resolved$/, (m) => m[1] + ' abiertos · ' + m[2] + ' resueltos'],
    [/^(\d+) words · (\d+) A4 pages?$/, (m) => m[1] + ' palabras · ' + m[2] + ' página' + (m[2] === '1' ? '' : 's') + ' A4'],
    [/^(\d+) words · continuous view$/, (m) => m[1] + ' palabras · vista continua'],
    [/^Page (\d+)$/, (m) => 'Página ' + m[1]],
    [/^(\d+) blocks? · (\d+)% full$/, (m) => m[1] + ' bloques · ' + m[2] + ' % lleno'],
    [/^(\d+) of (\d+\+?) match(es)?$/, (m) => m[1] + ' de ' + m[2] + ' coincidencia' + (m[2] === '1' ? '' : 's')],
    [/^Replace all \((\d+)\)$/, (m) => 'Reemplazar todo (' + m[1] + ')'],
    [/^In this document · (.+)$/, (m) => 'En este documento · ' + m[1]],
    [/^(\d+) item\(s\) to review$/, (m) => m[1] + ' punto(s) a revisar'],
    [/^(\d+) page\(s\) · (\d+) warning\(s\)(.*)$/, (m) => m[1] + ' página(s) · ' + m[2] + ' aviso(s)' + (m[3] ? ' · reglas cambiadas, aún sin aplicar' : '')],
    [/^Save draft keeps V(.+) · Publish & save → V(.+) · Big Validation → V(.+)$/, (m) => 'Guardar borrador mantiene V' + m[1] + ' · Publicar y guardar → V' + m[2] + ' · Big Validation → V' + m[3]],
    [/^Styles of this (SOP|Quick Card)$/, (m) => 'Estilos de este ' + m[1]],
    [/^(\d+) text mark\(s\) still To Be Confirmed\.$/, (m) => m[1] + ' marca(s) «Por confirmar» pendientes.'],
    [/^(\d+) open comment\(s\)\.$/, (m) => m[1] + ' comentario(s) abiertos.'],
    [/^(\d+) place\(s\) still say “TO BE CONFIRMED”\.$/, (m) => m[1] + ' sitio(s) dicen todavía «TO BE CONFIRMED».'],
    [/^(\d+) image\(s\) without alternative text\.$/, (m) => m[1] + ' imagen(es) sin texto alternativo.'],
    [/^(\d+) empty table cell\(s\)\.$/, (m) => m[1] + ' celda(s) de tabla vacías.']
  ];
  const ATTRS = ['title', 'aria-label', 'placeholder', 'data-short'];
  let lang = 'en';
  try { lang = localStorage.getItem('sophia:pref:lang') === 'es' ? 'es' : 'en'; } catch {}
  const origText = new Map(), origAttr = new Map();
  function tr(en) {
    if (lang !== 'es' || !en) return en;
    const lead = en.match(/^\s*/)[0], trail = en.match(/\s*$/)[0], core = en.trim();
    if (!core) return en;
    if (Object.hasOwn(ES, core)) return lead + ES[core] + trail;
    for (const [rx, fn] of PATTERNS) { const m = rx.exec(core); if (m) return lead + fn(m) + trail; }
    return en;
  }
  const skip = (el) => !el || el.closest?.('#document, [translate="no"], script, style, textarea, [contenteditable="true"]');
  let busy = false;
  function translate(root) {
    if (!root || root.nodeType !== 1 && root.nodeType !== 3) return;
    busy = true;
    try {
      const doText = (t) => {
        if (skip(t.parentElement)) return;
        const en = origText.has(t) ? origText.get(t) : t.nodeValue;
        const out = tr(en);
        if (out !== t.nodeValue) { if (!origText.has(t)) origText.set(t, en); t.nodeValue = out; }
      };
      const doEl = (el) => {
        if (skip(el)) return;
        for (const a of ATTRS) {
          if (!el.hasAttribute(a)) continue;
          const key = el, store = origAttr.get(key) || {};
          const en = a in store ? store[a] : el.getAttribute(a);
          const out = tr(en);
          if (out !== el.getAttribute(a)) { store[a] = en; origAttr.set(key, store); el.setAttribute(a, out); }
        }
      };
      if (root.nodeType === 3) { doText(root); return; }
      if (skip(root)) return;
      doEl(root);
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: (n) => (n.nodeType === 1 && skip(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      let n;
      while ((n = w.nextNode())) n.nodeType === 3 ? doText(n) : doEl(n);
    } finally {
      busy = false;
      mo.takeRecords();
    }
  }
  const mo = new MutationObserver((records) => {
    if (busy || lang !== 'es') return;
    for (const r of records) {
      if (r.type === 'childList') r.addedNodes.forEach((n) => translate(n));
      else if (r.type === 'characterData') { if (!origText.has(r.target) || tr(origText.get(r.target)) !== r.target.nodeValue) { origText.delete(r.target); translate(r.target); } }
      else if (r.type === 'attributes') { const st = origAttr.get(r.target); if (st) delete st[r.attributeName]; translate(r.target); }
    }
  });
  function restoreEnglish() {
    busy = true;
    try {
      for (const [t, en] of origText) if (t.isConnected) t.nodeValue = en;
      for (const [el, st] of origAttr) if (el.isConnected) for (const a in st) el.setAttribute(a, st[a]);
    } finally { origText.clear(); origAttr.clear(); busy = false; mo.takeRecords(); }
  }
  function set(next) {
    lang = next === 'es' ? 'es' : 'en';
    try { localStorage.setItem('sophia:pref:lang', lang); } catch {}
    document.documentElement.dataset.uiLang = lang;
    if (lang === 'es') translate(document.body); else restoreEnglish();
    SOPHIA.bus.emit('lang-changed', lang);
  }
  function start() {
    document.documentElement.dataset.uiLang = lang;
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    if (lang === 'es') translate(document.body);
  }
  /* periodic cleanup of disconnected nodes (dialogs come and go) */
  setInterval(() => { for (const t of origText.keys()) if (!t.isConnected) origText.delete(t); for (const e of origAttr.keys()) if (!e.isConnected) origAttr.delete(e); }, 30000);
  return { set, start, tr, get lang() { return lang; }, ES, PATTERNS };
})();
