# SOPHIA · Auditoría V74 → entregas V75, V76 y V77

Auditoría completa de los editores **SOP** y **Quick Card** V74 (estilo *Obsidian JAOM Material Expressive Glass*), entregas **V75 · Lote 1 · Fiabilidad y salida** y **V76 · Lote 2 · Edición fluida**, y propuestas para seguir con Copilot.

> Los HTML (V74, V75 y V76) **no están en este repositorio a propósito**. Contienen contenido corporativo, logos y claves PID de prueba. Se entregan como adjuntos en la conversación. Aquí solo hay documentación, esquemas, tokens, el script que genera V75 a partir de V74 y la prueba de regresión.

## Por dónde empezar

| Archivo | Para qué |
|---|---|
| [`HANDOFF_V77_PARA_COPILOT.md`](HANDOFF_V77_PARA_COPILOT.md) | **Base vigente V77** (reconstruida desde código fuente en [`/sophia`](../../sophia/)): qué pegar a Copilot (desarrollo o contenido), qué cambió por letra, pruebas y zonas de cuidado. |
| [`HANDOFF_V76_PARA_COPILOT.md`](HANDOFF_V76_PARA_COPILOT.md) | Traspaso del Lote 2 (V76) junto con el prompt maestro, el traspaso V75 y los dos HTML V76. |
| [`HANDOFF_V75_PARA_COPILOT.md`](HANDOFF_V75_PARA_COPILOT.md) | Traspaso del Lote 1: huellas, qué cambió, qué se probó, zonas de cuidado y decisiones abiertas (D1–D4). |
| [`01_INFORME_AUDITORIA.md`](01_INFORME_AUDITORIA.md) | Hallazgos por gravedad (🔴 C · 🟠 A · 🟡 M · 🔵 B) con ubicación, evidencia, arreglo y aceptación, y el estado de cada uno en V75. |
| [`02_ARQUITECTURA_OBJETIVO.md`](02_ARQUITECTURA_OBJETIVO.md) | Destino de la Fase 4 (núcleo compartido sin big bang): formato motor + datos, modelo de bloques, huellas y firmas, activos, build, encaje del agente (`Proposal`). |
| [`03_DISENO_OBSIDIAN_JAOM.md`](03_DISENO_OBSIDIAN_JAOM.md) | Diagnóstico del estilo (métricas, D-01…D-16) y especificación con tokens, respetando la disposición aprobada. |
| [`04_PLAN_DE_TRABAJO.md`](04_PLAN_DE_TRABAJO.md) | Lotes V76… con prompts listos para pegar y puertas de salida. |
| [`05_HERRAMIENTAS_TIPO_WORD.md`](05_HERRAMIENTAS_TIPO_WORD.md) | Catálogo de herramientas tipo Word (mini-barra, menú contextual, «/», pegar desde Word, control de cambios ligero, comentarios, importar/exportar `.docx`…) con diseño e implementación. |
| [`copilot-instructions.md`](copilot-instructions.md) | Instrucciones permanentes para Copilot desde V77 (editor por módulos, contenido por propuestas, sin inventar datos). |
| [`schemas/`](schemas/) | Esquema JSON del contenido por bloques más ejemplos válidos de SOP y Quick Card (validados con jsonschema 2020‑12). |
| [`tokens/jaom-tokens.css`](tokens/jaom-tokens.css) | Tokens de diseño JAOM normalizados desde V74. |
| [`tools/make_v75.py`](tools/make_v75.py) | Genera V75 desde V74 con parches anclados y comprobación de huellas (reproduce V75 byte a byte). |
| [`tools/v76/`](tools/v76/) | Código legible del Lote 2 (`sophia-v76.js`, `sophia-v76.css`) y `make_v76.py`, que genera V76 desde V75. |
| [`tests/v76-tools-check.cjs`](tests/v76-tools-check.cjs) | 34 comprobaciones por perfil de las herramientas de V76 (`SOPHIA_DIR=<carpeta con los V76> node tests/v76-tools-check.cjs`). |
| [`tests/sophia-regression.mjs`](tests/sophia-regression.mjs) | Prueba de regresión en Chromium (Playwright): PASS, FAIL o KNOWN por comprobación. |

## Resultado de la prueba de regresión

| Archivo | FAIL | KNOWN (pendiente de decisión) |
|---|---:|---:|
| SOP V74 | 9 | 4 |
| Quick Card V74 | 9 | 4 |
| **SOP V75** | **0** | 4 |
| **Quick Card V75** | **0** | 4 |
| **SOP V76** | **0** (+ 34/34 herramientas) | 4 |
| **Quick Card V76** | **0** (+ 34/34 herramientas) | 4 |

En modo lectura, la pantalla de V75 es idéntica a la de V74, y la de V76 a la de V75, píxel a píxel a 1440, 1024, 390 y 320 px.

## Cómo ejecutar

```bash
# Generar V75 a partir de las bases V74 (comprueba sus SHA-256)
python3 tools/make_v75.py SOP_Editor_V74_SOPHIA_Light.html Quick_Card_Editor_V74_SOPHIA_Light.html out/

# Prueba de regresión (requiere Node 18+ y Playwright con Chromium)
node tests/sophia-regression.mjs out/SOP_Editor_V75_SOPHIA_Light.html out/Quick_Card_Editor_V75_SOPHIA_Light.html
```
