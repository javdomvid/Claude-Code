#!/usr/bin/env python3
"""Genera SOPHIA V75 (Lote 1 · Fiabilidad y salida) a partir de las bases V74.

Cada parche es una sustitución exacta sobre un ancla que debe aparecer el número
de veces esperado; si no, el script falla sin escribir nada. Se aplica idéntico a
SOP y Quick Card.
"""
import hashlib, sys, pathlib

# Uso: python3 make_v75.py <SOP_V74.html> <QuickCard_V74.html> <carpeta_salida>
BASES = {
    'sop': ('74a978af0a67750d82ca046440942b159fed8d2fb50c896a20fa3b5ad11b84f7',
            'SOP_Editor_V75_SOPHIA_Light.html', 'SOP Editor'),
    'qc': ('17fb391c181de9af2d47b8685ea4ab5547ca4903fb3dc5823816fc7ac176ee85',
           'Quick_Card_Editor_V75_SOPHIA_Light.html', 'Quick Card Editor'),
}

PRINT_SHELL_AND_V75 = r'''<style id="sophia-v75-print-shell">/* V75 · L1-01. Salida de impresion del navegador (Ctrl+P bloqueado -> Print Studio; menu Imprimir sigue aqui).
Solo oculta la interfaz: no cambia el folio. Debe seguir siendo el ULTIMO bloque de estilos. */
@media print{
 html,body{background:#fff!important}
 body>:not(#document){display:none!important}
 #document [data-media-ui],#document .ui-icon{display:none!important}
}
/* V75 · L1-12. Recibo: el verificador de archivo heredaba el tamano de la antigua casilla (16x16). */
@media screen{
 .save-receipt .receipt-check{flex-direction:column;align-items:stretch}
 .save-receipt .receipt-check input[type=file]{width:100%;height:auto;min-height:36px;flex:1 1 auto;margin:6px 0 0;font:inherit}
}
</style><script id="sophia-v75-runtime-hygiene">
/* V75 · L1-05. Los HTML exportados con V74 y anteriores pueden contener copias de nodos de ejecucion
   (se serializaba el DOM vivo). Los nodos vivos de V75 llevan data-runtime; las copias heredadas
   sin data-runtime se eliminan al terminar el parseo. No toca #document ni #record. */
(()=>{'use strict';
const ids=['jaom-view-heading','media-replace-file','v425-table-ui','execution-context-v17'];
function clean(){for(const id of ids){const all=[...document.querySelectorAll('[id="'+id+'"]')];if(all.length<2)continue;const live=all.find(n=>n.hasAttribute('data-runtime'));if(!live)continue;for(const n of all)if(n!==live&&!n.hasAttribute('data-runtime'))n.remove();}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
})();
</script><script type="text/plain" id="sophia-changelog">
# SOPHIA V75 · Lote 1 · Fiabilidad y salida (base V74 Light)

Cambios (mismos en SOP y Quick Card):
- L1-01 Impresion del navegador: la barra ya no se imprime. glass-v31 queda en @media screen y sophia-v75-print-shell oculta toda la interfaz al imprimir y fuerza fondo blanco (el lienzo obsidiana ya no se imprime con 'graficos de fondo').
- L1-02 Ctrl/Cmd+P abre Print Studio (si no hay un dialogo abierto) en lugar de la impresion nativa.
- L1-03 Ctrl/Cmd+S guarda BORRADOR (exportPID('Draft')), ya no abre Publish.
- L1-04 beforeprint no repagina si faltan fuentes/imagenes (sin toast impreso) y afterprint devuelve Continuous si estaba activo.
- L1-05 Higiene de exportacion: serial() elimina [data-runtime] y nodos de ejecucion conocidos, clases y atributos transitorios de <body>. Copias heredadas se limpian al abrir.
- L1-06 History: la tabla de identidad, la fila de trazabilidad, el logo/brand, clasificacion y cabeceras/pies de pagina no cuentan como contenido (evita atribucion falsa en Quick Card).
- L1-07 Confirm saved borra la recuperacion local de ese documento y PID (antes quedaba para siempre).
- L1-08 Estadisticas del lateral correctas en Continuous / A4.
- L1-09 La etiqueta Canvas refleja el estado real al reabrir.
- L1-10 Word count, Check page overflow y Show marks disponibles en lectura.
- L1-12 Recibo de guardado: el selector de verificacion ya cabe.

No cambiado a proposito (requiere decision): numeracion de versiones, claves PID, hashes/integridad,
IDs de bloque automaticos, disposicion aprobada de la barra, formato del registro.
</script>'''

CONTRACT_ADD = r'''
## V75 · Reglas nuevas (Lote 1)
- Todo nodo creado en ejecucion fuera de #document lleva data-runtime y NO se serializa (serial() lo elimina). Si creas uno nuevo con id, anadelo tambien a la lista de sophia-v75-runtime-hygiene.
- La impresion del navegador solo muestra #document (sophia-v75-print-shell, ultimo bloque). Ningun CSS de interfaz puede vivir fuera de @media screen.
- Ctrl/Cmd+P -> Print Studio; Ctrl/Cmd+S -> Save draft. Publish solo desde su boton o Commands.
- History no trata como contenido .identity, [data-trace], .brand, .doc-classification, .pagehead ni .pagefoot.
'''

def patches(profile_label):
    return [
        # (nombre, ancla, reemplazo, ocurrencias esperadas)
        ('title', f'<title>{profile_label} V74 |', f'<title>{profile_label} V75 |', 1),
        ('shell-marker', "dataset.sophiaShell='74'", "dataset.sophiaShell='75'", 1),
        ('identity-title', "phIdentity.title='SOPHIA V74 | Standalone HTML'", "phIdentity.title='SOPHIA V75 | Standalone HTML'", 1),
        # L1-01: glass-v31 solo en pantalla (sus reglas sin @media ganaban a @media print)
        ('glass-screen', '<style id="glass-v31">', '<style id="glass-v31">@media screen{', 1),
        # L1-02 + L1-03: atajos (controlador responsable: keydown del nucleo)
        ('shortcuts',
         "if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();closeRevision()}",
         "if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();exportPID('Draft')}"
         "if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='p'){if(document.querySelector('dialog[open]'))return;e.preventDefault();window.PrintStudio42?.open()}", 1),
        # L1-04: beforeprint sin toast y con vuelta a Continuous
        ('beforeprint',
         "window.addEventListener('beforeprint',()=>{document.body.classList.remove('continuous-view');paginateDocument(false);});",
         "let v75PrintWasContinuous=false;window.addEventListener('beforeprint',()=>{v75PrintWasContinuous=document.body.classList.contains('continuous-view');document.body.classList.remove('continuous-view');if(document.fonts?.status!=='loading'&&[...area.querySelectorAll('img')].every(i=>i.complete))paginateDocument(false);});window.addEventListener('afterprint',()=>{if(v75PrintWasContinuous)setDocumentView('continuous');v75PrintWasContinuous=false;});", 1),
        # L1-05: higiene de serializacion
        ('serial',
         "c.querySelectorAll('[data-media-ui],#session-strip,#archiveView,#historyStudio,.structure-v25,.wb24-palette,.image-library-v23,.review-workspace-v22,.replace-studio-v21,.command-dialog,.save-receipt,.modalveil,.toast,#directDownloadLink').forEach(n=>n.remove());c.querySelector('body').classList.remove('editing','archive-mode');",
         "c.querySelectorAll('[data-media-ui],#session-strip,#archiveView,#historyStudio,.structure-v25,.wb24-palette,.image-library-v23,.review-workspace-v22,.replace-studio-v21,.command-dialog,.save-receipt,.modalveil,.toast,#directDownloadLink,[data-runtime],#jaom-view-heading,#media-replace-file,#v425-table-ui,#execution-context-v17,#p42-print,body>dialog').forEach(n=>n.remove());c.querySelector('body').classList.remove('editing','archive-mode','focusmode','showmarks','media-placing','ui30-side-on','ui30-side-off');c.querySelector('body').removeAttribute('data-ui34-edit');c.querySelector('body').removeAttribute('style');", 1),
        ('rt-note', "note.id='execution-context-v17';", "note.id='execution-context-v17';note.dataset.runtime='';", 1),
        ('rt-surface', "surface.id='v425-table-ui';", "surface.id='v425-table-ui';surface.dataset.runtime='';", 1),
        ('rt-replace', "replaceInput.id='media-replace-file';", "replaceInput.id='media-replace-file';replaceInput.dataset.runtime='';", 1),
        ('rt-heading', "jaomViewHeading.id='jaom-view-heading';", "jaomViewHeading.id='jaom-view-heading';jaomViewHeading.dataset.runtime='';", 1),
        # L1-06: History ignora metadatos y plantilla
        ('hist-meta-fn', "function hash(s){let h=2166136261;",
         "const h75Meta=n=>!!n.closest?.('.identity,[data-trace],.brand,.doc-classification,.pagehead,.pagefoot');function hash(s){let h=2166136261;", 1),
        ('hist-meta-use', "if(n.tagName!=='IMG'&&n.querySelector('h1,h2,h3,h4,p,li,td,th,figcaption'))return;nodes.push(n)",
         "if(h75Meta(n))return;if(n.tagName!=='IMG'&&n.querySelector('h1,h2,h3,h4,p,li,td,th,figcaption'))return;nodes.push(n)", 2),
        # L1-07: recuperacion local borrada tras Confirm saved
        ('recovery', "function saved(){clearTimeout(timer);adapter.end();",
         "function purgeSavedRecovery(){try{const pid=state.pid,prefix=key();for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(!k||!(k===prefix||k.startsWith(prefix+':')))continue;const r=JSON.parse(localStorage.getItem(k)||'null');if(r&&r.documentId===adapter.record.id&&(!pid||r.pid===pid))localStorage.removeItem(k);}}catch{}state.recovery='idle';state.recoveryAt=null}"
         "function saved(){clearTimeout(timer);purgeSavedRecovery();adapter.end();", 1),
        # L1-08: estadisticas
        ('stats',
         "document.getElementById('liveStats').textContent=area.querySelectorAll('.sheet').length+' pages · '+textOf(cleanContent()).trim().split(/\\s+/).length+' approximate words'",
         "{const w=textOf(cleanContent()).trim().split(/\\s+/).filter(Boolean).length,p=area.querySelectorAll('.sheet').length;document.getElementById('liveStats').textContent=(document.body.classList.contains('continuous-view')?'Continuous view':p+(p===1?' page':' pages'))+' · '+w+' approximate words'}", 1),
        ('stats-boot', "document.body.classList.add('continuous-view');mergeContinuous();",
         "document.body.classList.add('continuous-view');mergeContinuous();refreshOutline();", 1),
        ('stats-view',
         "document.getElementById('continuousView').classList.toggle('active',mode==='continuous');window.scrollTo(0,y);};",
         "document.getElementById('continuousView').classList.toggle('active',mode==='continuous');refreshOutline();window.scrollTo(0,y);};", 1),
        # L1-09: etiqueta Canvas real
        ('canvas', "const jaomCanvas=upperButton('Canvas: Dark','page',()=>{",
         "const jaomCanvas=upperButton(document.body.hasAttribute('data-jaom-light')?'Canvas: Light':'Canvas: Dark','page',()=>{", 1),
        # L1-10: herramientas de solo lectura
        ('viewonly', "let viewOnly=/setDocumentView|paginateDocument|window.print|side\\(/.test(",
         "let viewOnly=/setDocumentView|paginateDocument|window.print|side\\(|countWords|overflowCheck|showmarks/.test(", 1),
        # Contrato
        ('contract', '# SOPHIA | Contrato de interfaz adaptable (V74)', '# SOPHIA | Contrato de interfaz adaptable (V75)', 1),
        ('contract-add', '- Al cerrar un panel, usar el disparador visible', CONTRACT_ADD.strip('\n') + '\n- Al cerrar un panel, usar el disparador visible', 1),
    ]

def close_glass(s):
    start = s.index('<style id="glass-v31">@media screen{')
    end = s.index('</style>', start)
    return s[:end] + '}' + s[end:]

def main():
    if len(sys.argv) != 4:
        sys.exit('Uso: python3 make_v75.py <SOP_V74.html> <QuickCard_V74.html> <carpeta_salida>')
    inputs = {'sop': pathlib.Path(sys.argv[1]), 'qc': pathlib.Path(sys.argv[2])}
    outdir = pathlib.Path(sys.argv[3]); outdir.mkdir(parents=True, exist_ok=True)
    report = []
    for key, (sha, out, label) in BASES.items():
        raw = inputs[key].read_bytes()
        got = hashlib.sha256(raw).hexdigest()
        if got != sha:
            sys.exit(f'{key}: la base no coincide con V74 ({got})')
        s = raw.decode('utf-8')
        for name, anchor, repl, n in patches(label):
            c = s.count(anchor)
            if c != n:
                sys.exit(f'{key}: ancla {name!r} aparece {c} veces (esperado {n})')
            s = s.replace(anchor, repl)
        s = close_glass(s)
        if not s.endswith('</style></body></html>\n'):
            sys.exit(f'{key}: final inesperado')
        s = s[:-len('</body></html>\n')] + PRINT_SHELL_AND_V75 + '</body></html>\n'
        data = s.encode('utf-8')
        (outdir / out).write_bytes(data)
        report.append((out, len(data), hashlib.sha256(data).hexdigest()))
    for r in report:
        print(*r)

if __name__ == '__main__':
    main()
