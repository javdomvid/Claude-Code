# Instrucciones permanentes para la IA de desarrollo (Copilot) · Project SOPHIA

> Pega este texto como instrucciones personalizadas del espacio o agente de Copilot. Si trabajas en un repositorio con GitHub Copilot, guárdalo como `.github/copilot-instructions.md`. Complementa el prompt maestro y el traspaso vigente; si hay contradicción, manda la última decisión expresa de Javier.

## Qué es
SOPHIA (SOP HTML Interactive Architect) es un estudio documental offline: cada SOP o Quick Card es **un único HTML** que contiene:
- el documento (`#document`);
- su registro de revisiones (`#record`, JSON);
- el editor;
- el historial;
- la impresión.

Funciona desde disco en Edge/Chromium sin red. Hay dos perfiles, `SOP` y `Quick Card`, con motor casi común y diferencias intencionadas (por ejemplo, Table Flow solo en QC).

## Reglas de oro
1. **Evoluciona, no reescribas.** Trabaja por lotes pequeños sobre copias versionadas (`…_V76_…html`). Nunca modifiques la base ni sobrescribas originales.
2. **Ambos perfiles en el mismo lote**, salvo diferencia intencionada documentada en el contrato.
3. **Reproduce antes de cambiar** y toca el **controlador responsable**. No añadas otra capa global que «compense».
4. **Un cambio de interfaz nunca cambia** `#document`, `#record`, el PID, la revisión activa, el estado de guardado, la publicación ni el folio impreso.
5. **Toda mutación del documento** pasa por `EditorTransactions.run(label, fn)`.
6. **Nodos creados por JS** fuera de `#document` llevan `data-runtime` (no se guardan). Si tienen `id`, añádelo a `sophia-v75-runtime-hygiene`.
7. **CSS**:
   - nada de interfaz fuera de `@media screen`;
   - `sophia-v75-print-shell` debe seguir siendo el **último** `<style>`;
   - sin `!important` nuevos;
   - sin clases con sufijo de versión;
   - usa `var(--jaom-*)`.
8. **Disposición aprobada intocable sin OK**: orden superior 4→1→3→2→7 │ 5→6; ciclos Full/Mini/Hide; More tools; Focus reversible; Views; Layout view + Layout Studio en Navigate; papel separado del lienzo; rojo y marca de agua del History histórico.
9. **Guardado**: copia nueva → recibo → verificación **byte a byte** → «Confirm saved». No alteres ese orden ni la comparación de bytes.
10. **Sin red ni dependencias**: nada de CDN, `fetch`, fuentes remotas, telemetría ni `eval`. **Ningún secreto ni credencial en el HTML.**
11. **PID = autoría declarada**, no identidad verificada. No afirmes aprobación oficial. Las ediciones hechas con IA se registran como «AI-assisted» y la persona que las pidió queda diferenciada.
12. **No borres funciones** para simplificar. Si algo parece muerto, demuéstralo con `console.count` en la matriz completa antes de borrarlo.

## Cómo editar el HTML con seguridad
- Usa **sustituciones exactas sobre anclas únicas**: cuenta las apariciones antes de reemplazar y aborta si no coinciden.
- El archivo tiene líneas muy largas (una de 70.000 caracteres contiene `#record`): **nunca** reescribas una línea entera para cambiar un fragmento.
- Tras cada lote: comprueba la sintaxis de cada `<script>` y ejecuta `node tests/sophia-regression.mjs` sobre los dos HTML, si tienes Node y Playwright.
- Haz capturas a 390, 1024 y 1440 en lectura y edición y compáralas con la versión anterior.
- Actualiza `sophia-changelog` y, si cambias superficies, `sophia-ui-contract`, en ambos perfiles.
- Entrega con este formato:
  - nombres y SHA‑256;
  - qué fallaba y por qué;
  - qué cambiaste y dónde (id del bloque y función);
  - **probado / no probado** (PASS, FAIL, NO EJECUTADO);
  - riesgos y vuelta atrás.

## Generar o modificar contenido de un SOP (cuando lo pida Javier)
- Escribe en el idioma y la terminología de la fuente. No traduzcas por defecto.
- Estructura de un SOP:
  1. Alcance;
  2. Consideraciones generales;
  3. Procedimiento (pasos numerados, uno por acción, con el elemento de la interfaz en **negrita**);
  4. Excepciones;
  5. Puntos de revisión y fuente.
- Estructura de una Quick Card: tarea, pasos breves, decisiones, avisos, checklist y enlace al SOP o la fuente.
- **Nunca inventes** owner, clasificación, fechas de validación, responsables, aprobaciones ni reglas. Usa `TO BE CONFIRMED` y un aviso «Confirmation required» con la pregunta concreta.
- Distingue fuente oficial, borrador, nota, captura y deducción. Si dos fuentes se contradicen, cita ambas y marca la discrepancia.
- Si el editor aún no importa propuestas, entrega el contenido como **propuesta por bloque** (bloque destino, texto actual esperado, texto propuesto, justificación y fuente) para que una persona lo aplique en el editor. No reescribas `#document` ni `#record` en el archivo.
- Usa solo lo que el editor ya renderiza:
  - `h2` y `h3`;
  - `p`;
  - `ul`/`ol`;
  - `table` simple con `th` en la primera fila;
  - `aside.warning`;
  - `figure > img[alt] + figcaption`.

  Sin estilos en línea ni colores libres. Referencia futura del modelo de bloques: `schemas/sophia-document.schema.json`.
