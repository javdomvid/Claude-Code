# Instrucciones permanentes para la IA de desarrollo (Copilot) · Project SOPHIA · desde V77

> Pega este texto como instrucciones personalizadas del espacio o agente de Copilot. Si trabajas en un repositorio con GitHub Copilot, guárdalo como `.github/copilot-instructions.md`. Complementa el prompt maestro y el traspaso vigente (`HANDOFF_V77_PARA_COPILOT.md`). Si hay contradicción, manda la última decisión expresa de Javier.
>
> El firmware completo va **dentro de cada HTML**: `#sophia-agent-brief` (agente de documentos) y `#sophia-ui-contract` (desarrollo). Léelos antes de cambiar nada.

## Qué es
SOPHIA es un estudio documental offline. Cada SOP o Quick Card es **un único HTML** con:
- el documento (`main#document`, la **zona del documento**, un bloque por línea);
- su registro (`#record`, JSON);
- el editor (módulos `script[data-sophia-module]`);
- su firmware (`script[data-sophia-doc]`).

Funciona desde disco en Edge/Chromium sin red. Hay dos perfiles, `sop` y `quick-card`, con el mismo motor (`data-profile`).

Desde V77, el editor se genera con `sophia/build.py` a partir de `sophia/src`: un módulo por tema y una hoja de estilos por capa.

## Dos trabajos distintos
1. **Contenido** (agente SOPHIA + skills): solo la zona del documento, y preferiblemente con una **propuesta JSON** `sophia.proposal/1` que una persona aplica con «Apply agent proposal…». Detalles en `#sophia-agent-brief`.
2. **Editor** (Copilot desarrollador): solo `sophia/src`, editando el módulo responsable **en su sitio**, y después reconstruir y probar. Detalles en `#sophia-ui-contract`.

Nunca mezcles los dos en el mismo cambio.

## Reglas de oro (editor)
1. **Sin capas de parches.** No añadas scripts ni estilos al final que «corrijan» otros. Si un módulo está mal, arregla ese módulo.
2. **Ambos perfiles a la vez.** Las diferencias van por `SOPHIA.profile` o por `profile` en el registro de comandos.
3. **Toda mutación del documento** pasa por `EditorTransactions.run(label, fn)`.
4. **Lo que crea la interfaz** lleva `data-runtime` y vive fuera de `#document`.
5. **Una única barra.** Para añadir una herramienta:
   - regístrala en `SOPHIA.commands`;
   - pon su id en `RIBBON` y/o `SHEET` (70-shell).

   Full, Mini y Hide se mantienen; Mini enseña todas las herramientas.
6. **CSS por capas:**
   - `tokens` → `app` (solo interfaz, clases `sx-*`);
   - `paper.*` (solo el folio);
   - `dialogs`;
   - `print`, que es siempre el último.

   Usa los tokens `--sx-*`.
7. **Guardado:**
   - copia nueva → recibo → verificación **byte a byte** → «Confirm saved»;
   - el guardado reconstruye el archivo desde las piezas originales.
8. **Versiones (regla D):**
   - Save draft no cambia el número;
   - Publish & save suma +0.01;
   - Big Validation pasa al siguiente mayor con .00.

   La versión de la app (V77…) es independiente.
9. **Sin red ni dependencias:**
   - nada de CDN, `fetch`, fuentes remotas ni `eval`;
   - ningún secreto nuevo en el HTML;
   - no copies ni muestres las claves PID.
10. **PID = autoría declarada**, no identidad verificada. Las claves quedan como están (decisión E pendiente).
11. **Prueba siempre:**
    - `python3 sophia/build.py <doc.html> <out.html>`;
    - `node sophia/tests/v77-functional.cjs <out.html>`, que debe dar **ALL PASS**.

    Añade una comprobación por cada herramienta nueva.

Entrega con este formato:
- archivos y módulos tocados;
- qué fallaba y por qué;
- qué cambiaste;
- probado / no probado (PASS, FAIL, NO EJECUTADO);
- riesgos y vuelta atrás.

## Generar o modificar contenido de un SOP (cuando lo pida Javier)
- Escribe en el idioma y la terminología de la fuente.
- Estructura de un SOP:
  1. Scope;
  2. General considerations;
  3. Procedures (pasos `ol > li`, uno por acción, con el elemento de la interfaz en **negrita**);
  4. Exceptions;
  5. Review points and source.
- Estructura de una Quick Card:
  - tarea;
  - tarjetas (`div.cards > section`);
  - decisiones en tabla;
  - avisos;
  - checklist;
  - fuente (`p.source-note`).
- **No escribas números en los títulos.** Se numeran solos.
- **Nunca inventes**:
  - owner, clasificación o responsables;
  - fechas de validación o aprobaciones;
  - versiones ni reglas.

  Lo desconocido va como `<span class="tbc">TO BE CONFIRMED</span>`, y la pregunta concreta en un `aside.warning` «Confirmation required:».
- Usa solo la gramática de `#sophia-agent-brief` §3. Sin estilos en línea, sin base64 y sin reutilizar `data-block-id`.
- Entrega una propuesta `sophia.proposal/1` con `expectedText`, basada en el «document map» exportado desde el editor.
