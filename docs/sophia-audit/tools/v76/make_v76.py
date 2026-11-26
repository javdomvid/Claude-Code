#!/usr/bin/env python3
"""Genera SOPHIA V76 (Lote 2 · Edición fluida) a partir de V75.
Uso: python3 make_v76.py <SOP_V75.html> <QuickCard_V75.html> <carpeta_salida>
"""
import hashlib, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
BASES = {
    'sop': ('5eb460b28c2886b7501cf87181d64848a13ff8b51e46a94c10f100e832204377', 'SOP_Editor_V76_SOPHIA_Light.html', 'SOP Editor'),
    'qc': ('e966ae11683e4376957792f27110789fc8ca54ee1f5bc1c208e31dbd4b7f78b1', 'Quick_Card_Editor_V76_SOPHIA_Light.html', 'Quick Card Editor'),
}

CONTRACT_ADD = '''
## V76 · Superficies nuevas (Lote 2 · Edicion fluida)
- .sv76-selbar (mini-barra de seleccion): solo en edicion, con seleccion dentro de [contenteditable=true] fuera de .identity/[data-trace]. Alt+F10 entra, Esc sale y devuelve la seleccion.
- .sv76-menu (menu contextual, menu "/", simbolos): role=menu, flechas/Home/End/Enter/Esc, cierra al pulsar fuera y devuelve la seleccion. Clic derecho y Shift+F10 solo en edicion; en lectura queda el menu nativo.
- .sv76-changes (tarjeta "Changes since V..."): se pinta en el panel Versions. El resaltado usa CSS Highlight API (sophia-added/modified/moved): NO toca el DOM del documento ni las instantaneas.
- .sv76-dialog (ayuda de atajos, F1).
- Todas llevan data-runtime, viven fuera de #document y no se imprimen. Nuevos comandos en Commands: Keyboard shortcuts, Changes since last save, Insert symbol.
- Pegado: window.SophiaPaste.handle() sanea con lista blanca (h2-h4, p, listas, tablas simples, b/i/u/s/sub/sup, enlaces https/mailto). Ctrl+Shift+V = texto plano. En celdas y vinetas, si hay bloques, texto plano.
- Atajos: Ctrl+Alt+0..3 ignoran AltGr (teclados ES: AltGr+2 = @).
'''

CHANGELOG_V76 = '''# SOPHIA V76 · Lote 2 · Edicion fluida (base V75)

Nuevo (mismo en SOP y Quick Card; sin cambios en #record, PID, folio impreso ni disposicion aprobada):
- W-01 Mini-barra al seleccionar texto: B, I, U, S, resaltar, enlace, limpiar formato (Alt+F10).
- W-02 Menu contextual en edicion (clic derecho / Shift+F10): texto, tabla (filas, columnas, cabecera, Table Studio, Table Flow en QC) e imagen (tamano, Layout Studio, reemplazar, mover, borrar).
- W-03 Menu "/" en parrafo vacio: titulos, listas, cita, tabla, imagen, avisos (Warning / Confirmation required), linea, empezar en pagina nueva, fecha, simbolos.
- W-04 Atajos: Ctrl+Alt+0/1/2/3, Ctrl+Shift+7/8, Ctrl+F (buscar), Ctrl+H (reemplazar), Ctrl+Shift+V (texto plano), F1 o Ctrl+/ (ayuda).
- W-06 Pegar desde Word/Google Docs/web conservando titulos, listas, tablas simples, negrita/cursiva/subrayado y enlaces https.
- W-10 Ortografia del navegador activa solo al editar.
- W-12 "Changes since V..." en el panel Versions: lista de cambios desde el ultimo guardado, Ir, Revertir bloque (con Undo) y resaltado en el documento (opcional, recordado por usuario).
- Deshacer/Rehacer conservan la posicion del cursor (antes se perdia al sustituir el contenido).
- Intro crea <p> en lugar de <div> (defaultParagraphSeparator).
- Workbench expone register() y refresh().

'''

def patches(label):
    return [
        ('title', f'<title>{label} V75 |', f'<title>{label} V76 |', 1),
        ('shell-marker', "dataset.sophiaShell='75'", "dataset.sophiaShell='76'", 1),
        ('identity-title', "phIdentity.title='SOPHIA V75 | Standalone HTML'", "phIdentity.title='SOPHIA V76 | Standalone HTML'", 1),
        ('workbench-api', 'return Object.freeze({run,openPalette,list:', 'return Object.freeze({run,openPalette,register,refresh,list:', 1),
        ('paste', "else{e.preventDefault();cmd('insertText',e.clipboardData.getData('text/plain'))}",
         "else{e.preventDefault();if(window.SophiaPaste?.handle(e))return;cmd('insertText',e.clipboardData.getData('text/plain'))}", 1),
        ('undo-caret', "muted=true;undoPosition=target;area.innerHTML=undoStates[target];setEditable();muted=false;",
         "muted=true;undoPosition=target;const v76caret=window.SophiaFlow?.caretOffset?.();area.innerHTML=undoStates[target];setEditable();muted=false;window.SophiaFlow?.restoreCaret?.(v76caret);", 1),
        ('contract-title', '# SOPHIA | Contrato de interfaz adaptable (V75)', '# SOPHIA | Contrato de interfaz adaptable (V76)', 1),
        ('contract-add', '- Al cerrar un panel, usar el disparador visible', CONTRACT_ADD.strip('\n') + '\n- Al cerrar un panel, usar el disparador visible', 1),
        ('changelog', '<script type="text/plain" id="sophia-changelog">\n# SOPHIA V75', '<script type="text/plain" id="sophia-changelog">\n' + CHANGELOG_V76 + '# SOPHIA V75', 1),
    ]

def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    js = (HERE / 'sophia-v76.js').read_text(encoding='utf-8')
    css = (HERE / 'sophia-v76.css').read_text(encoding='utf-8')
    for bad in ('</script', '</style', '<!--'):
        if bad in js or bad in css:
            sys.exit(f'el codigo V76 contiene {bad!r}')
    block = f'<style id="sophia-v76-flow-style">{css}</style><script id="sophia-v76-flow">\n{js}</script>'
    inputs = {'sop': pathlib.Path(sys.argv[1]), 'qc': pathlib.Path(sys.argv[2])}
    out = pathlib.Path(sys.argv[3]); out.mkdir(parents=True, exist_ok=True)
    for key, (sha, name, label) in BASES.items():
        raw = inputs[key].read_bytes()
        if hashlib.sha256(raw).hexdigest() != sha:
            sys.exit(f'{key}: la base no es V75')
        s = raw.decode('utf-8')
        for pname, anchor, repl, n in patches(label):
            c = s.count(anchor)
            if c != n:
                sys.exit(f'{key}: ancla {pname!r} aparece {c} veces (esperado {n})')
            s = s.replace(anchor, repl)
        shell = '<style id="sophia-v75-print-shell">'
        if s.count(shell) != 1:
            sys.exit('print shell no unico')
        s = s.replace(shell, block + shell)
        data = s.encode('utf-8')
        (out / name).write_bytes(data)
        print(name, len(data), hashlib.sha256(data).hexdigest())

if __name__ == '__main__':
    main()
