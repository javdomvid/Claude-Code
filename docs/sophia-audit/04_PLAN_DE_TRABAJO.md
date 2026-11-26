# Plan de trabajo por lotes (desde V75)

> Cada lote es una versión candidata (V76, V77…) con:
> - objetivos y no‑objetivos;
> - los mismos cambios en SOP y QC, salvo diferencias intencionadas y documentadas;
> - una **puerta de salida**: pruebas pasadas, capturas, exportar y reabrir;
> - una lista de lo no probado.
>
> No se avanza al siguiente lote por subir el número de versión, sino por cerrar la puerta de salida.
>
> Los prompts de cada lote están listos para pegar a Copilot **después** del prompt de traspaso ([`HANDOFF_V75_PARA_COPILOT.md`](HANDOFF_V75_PARA_COPILOT.md)).

## Mapa

| Lote | Versión | Contenido | Requiere decisión | Toca datos |
|---|---|---|---|---|
| 1 · Fiabilidad y salida | **V75 ✅** | C-01, A-01, A-02, A-03, A-10, M-02, M-03, M-04, receptor del recibo | — | No |
| D · Decisiones | — | D1 versiones · D2 claves · D3 IDs · D4 huellas | **Sí** | — |
| 2 · Edición fluida | V76 | W-10, W-04, W-01, W-02, W-03, W-06, W-12 (+ `Workbench.register`) | No (W-05 sí) | Contenido normal |
| 3 · Control documental | V77 | D1 (versiones únicas y esquema), D4 (huellas SHA‑256 + aviso al abrir), D2 (sin claves) | Tras D1, D2, D4 | **Registro** |
| 4 · Identidad y revisión | V78 | D3 (IDs automáticos), W-07 (mover bloques), W-11 (comentarios), W-13 (TBC), W-23 (puerta de calidad) | Tras D3 | Contenido + registro |
| 5 · Impresión controlada | V79 | M-10 (pie de copia controlada, marca de BORRADOR), la impresión del navegador usa el CSS de Print Studio, M-11 (CSS del folio con `id`) | Formato del pie | No |
| 6 · Limpieza | V80 | A-08 (código muerto con prueba de cobertura), B-01…B-10, A-07 (contenido fuera del motor) | No | No |
| 7 · Activos | V81 | A-05 (imágenes por hash, instantáneas sin base64, recuperación en IndexedDB) | Formato del registro | **Registro** |
| 8 · Diseño por capas | V82+ | Doc 03 §5: tokens, `@layer`, componentes canónicos, sin mover la disposición | Solo lo marcado «requiere aprobación» | No |
| 9 · Word como entrada y salida | — | W-18 importar `.docx` a un borrador nuevo, W-19 exportar `.docx` básico | Alcance | Contenido |
| 10 · Núcleo compartido | — | Doc 02: `src/` + build, perfiles, formato v2 | Arquitectura | Migración |

---

## Prompts por lote

### Lote 2 · Edición fluida (V76)

> Partiendo de V75 (verifica las huellas), prepara **V76 · Lote 2 · Edición fluida** en ambos perfiles, siguiendo `05_HERRAMIENTAS_TIPO_WORD.md`: W-10, W-04 (sin cambiar Ctrl+K todavía), W-01, W-02, W-03, W-06 y W-12.
>
> Reglas del lote:
> - Primero expón `register` en `Workbench` (1 línea).
> - Cada herramienta llama a los comandos existentes (`EditorCommands`, `EditorMedia`, `TableStudio`), y cualquier mutación pasa por `EditorTransactions.run`.
> - Las superficies nuevas llevan `data-runtime`, `role` y `aria-label`, no aparecen en Read, Focus ni History, se ocultan al imprimir y se dan de alta en `sophia-ui-contract`.
> - No muevas la disposición aprobada. No uses `!important` nuevos. Usa `var(--jaom-*)` (`tokens/jaom-tokens.css`) en el CSS nuevo.
>
> Puerta de salida:
> - matriz «Edición o diálogos» del prompt maestro;
> - Ctrl+Z tras cada herramienta;
> - Cancel/Esc sin efectos;
> - exportar y reabrir sin restos;
> - `tests/sophia-regression.mjs` sin FAIL;
> - capturas de lectura iguales a V75.
>
> Entrega los dos HTML, sus huellas, la lista de lo probado y lo no probado, y actualiza `sophia-changelog`.

### Decisiones D1–D4 (antes del Lote 3)

> Antes de tocar el registro, presenta a Javier las opciones de D1–D4 (tabla de la sección 5 del traspaso) con un ejemplo concreto de cómo quedaría el historial del SOP actual (0.1–0.4 → …) con cada opción. No implementes nada hasta tener su respuesta por escrito.

### Lote 3 · Control documental (V77)

> Implementa las decisiones D1, D2 y D4 aprobadas.
> - **D1**: versión única y validada antes de `offer()`. Versión inicial derivada de la última revisión (no un «1» fijo). Publicar sin cambios bloqueado o como evento «re-issue».
> - **D4**: `contentHash`, `prevHash` y `hash` (SHA‑256 con `crypto.subtle`) en cada revisión nueva; las antiguas se marcan `legacy` sin reescribirlas. Al abrir, una franja de estado: «Íntegro», «Cambios no registrados» (Publish bloqueado) o «Historial alterado».
> - **D2**: sin `localPIDKeys`; identidad declarada.
>
> Compatibilidad: un V75 se abre y se migra con una revisión `migration` explícita.
>
> Prueba:
> - manipular el HTML con un editor de texto → aviso;
> - borrar una revisión del JSON → «cadena rota»;
> - versiones únicas tras Draft, Publish y Big Validation;
> - ciclo exportar y reabrir ×2.

### Lote 4 · Identidad y revisión (V78)

> Implementa D3:
> - IDs automáticos `data-block-id` al abrir y tras cada transacción;
> - si hay duplicados, conserva el ID en el primer nodo en orden del documento;
> - los IDs se excluyen de `canonical()`.
>
> Después: W-07 (mover bloques, reutilizando la guía de `EditorMedia`), W-11 (comentarios en `record.comments`, anclados por `blockId`, no se imprimen), W-13 (marca `span.tbc` y contador en Checks) y W-23 (puerta de calidad al publicar).
>
> Prueba:
> - Intro y Supr no dejan duplicados;
> - mover un bloque se registra como «Reordered» en History;
> - comentarios conservados tras exportar y reabrir.

### Lote 5 · Impresión controlada (V79)

> - **M-10**: pie en todas las páginas, `ID · Versión · Estado · Impreso el … · Copia no controlada una vez impresa · Página X/Y`, más marca de agua «BORRADOR — NO APROBADO» si el estado no es Published. En Print Studio y en la impresión del navegador.
> - La impresión del navegador (`@media print` de la página) usa las mismas reglas que Print Studio. Unifica, por ejemplo, extrayendo `rules` y `pageCSS` a una función compartida.
> - **M-11**: el CSS del folio lleva un `id` y Print Studio lo referencia por `id`, no por posición.
>
> Prueba:
> - PDF real A4 y Letter, histórico y vigente;
> - tabla de 90 filas sin pérdidas;
> - texto del pie correcto.

### Lote 6 · Limpieza (V80)

> Instrumenta con `console.count` cada función de la sección 10 del informe 01 y ejecuta la matriz completa. Borra solo las que no se ejecutan nunca. Sustituye los `onclick` heredados por el registro de *Workbench*, sin cambiar las etiquetas visibles (`islands` agrupa por texto). Saca de `newPage()` y de `template()` el título y la clasificación fijos: léelos de `.identity` por etiqueta, no por posición.
>
> Prueba: matriz completa y capturas idénticas.

---

## Matriz mínima de cada entrega (resumen del prompt maestro)

1. Ambos perfiles a 320×568, 390×680, 1024×768, 1440×900 (y 1759/2560 si se toca la barra).
2. Read, Edit y Focus (dos clics); Main y Edit en Full, Mini y Hide; lateral abierto y cerrado; Views y Layout con Esc y retorno del foco.
3. PID de prueba → editar → Focus/Resume → descargar → elegir una copia errónea (rechazada) → verificar la correcta → confirmar → reabrir → sin interfaz duplicada.
4. History: revisión actual y anterior; rojo y marca de agua; Clean text; Go to block; Esc.
5. Impresión: PDF real, sin interfaz, A4 y Letter, histórico.
6. Anotar como **NO EJECUTADO**: Edge corporativo, SharePoint o Copilot embebido, diálogos nativos y lector de pantalla.
