# SOPHIA · Auditoría V74 → entrega V75 y propuestas

Auditoría completa de los editores **SOP** y **Quick Card** V74 (estilo *Obsidian JAOM Material Expressive Glass*), entrega de la **V75 · Lote 1 · Fiabilidad y salida** y propuestas para seguir con Copilot.

> Los HTML (V74 y V75) **no están en este repositorio a propósito**. Contienen contenido corporativo, logos y claves PID de prueba. Se entregan como adjuntos en la conversación. Aquí solo hay documentación, esquemas, tokens, el script que genera V75 a partir de V74 y la prueba de regresión.

## Por dónde empezar

| Archivo | Para qué |
|---|---|
| [`HANDOFF_V75_PARA_COPILOT.md`](HANDOFF_V75_PARA_COPILOT.md) | **Pegar a Copilot** junto con el prompt maestro y los dos HTML V75. Incluye huellas, qué cambió, qué se probó, zonas de cuidado y decisiones abiertas. |
| [`01_INFORME_AUDITORIA.md`](01_INFORME_AUDITORIA.md) | Hallazgos por gravedad (🔴 C · 🟠 A · 🟡 M · 🔵 B) con ubicación, evidencia, arreglo y aceptación, y el estado de cada uno en V75. |
| [`02_ARQUITECTURA_OBJETIVO.md`](02_ARQUITECTURA_OBJETIVO.md) | Destino de la Fase 4 (núcleo compartido sin big bang): formato motor + datos, modelo de bloques, huellas y firmas, activos, build, encaje del agente (`Proposal`). |
| [`03_DISENO_OBSIDIAN_JAOM.md`](03_DISENO_OBSIDIAN_JAOM.md) | Diagnóstico del estilo (métricas, D-01…D-16) y especificación con tokens, respetando la disposición aprobada. |
| [`04_PLAN_DE_TRABAJO.md`](04_PLAN_DE_TRABAJO.md) | Lotes V76… con prompts listos para pegar y puertas de salida. |
| [`05_HERRAMIENTAS_TIPO_WORD.md`](05_HERRAMIENTAS_TIPO_WORD.md) | Catálogo de herramientas tipo Word (mini-barra, menú contextual, «/», pegar desde Word, control de cambios ligero, comentarios, importar/exportar `.docx`…) con diseño e implementación. |
| [`copilot-instructions.md`](copilot-instructions.md) | Instrucciones permanentes para la IA de desarrollo, incluida la generación de contenido de SOP sin inventar datos. |
| [`schemas/`](schemas/) | Esquema JSON del contenido por bloques más ejemplos válidos de SOP y Quick Card (validados con jsonschema 2020‑12). |
| [`tokens/jaom-tokens.css`](tokens/jaom-tokens.css) | Tokens de diseño JAOM normalizados desde V74. |
| [`tools/make_v75.py`](tools/make_v75.py) | Genera V75 desde V74 con parches anclados y comprobación de huellas (reproduce V75 byte a byte). |
| [`tests/sophia-regression.mjs`](tests/sophia-regression.mjs) | Prueba de regresión en Chromium (Playwright): PASS, FAIL o KNOWN por comprobación. |

## Resultado de la prueba de regresión

| Archivo | FAIL | KNOWN (pendiente de decisión) |
|---|---:|---:|
| SOP V74 | 9 | 4 |
| Quick Card V74 | 9 | 4 |
| **SOP V75** | **0** | 4 |
| **Quick Card V75** | **0** | 4 |

En modo lectura, la pantalla de V75 es idéntica a la de V74 píxel a píxel a 1440, 1024, 390 y 320 px.

## Cómo ejecutar

```bash
# Generar V75 a partir de las bases V74 (comprueba sus SHA-256)
python3 tools/make_v75.py SOP_Editor_V74_SOPHIA_Light.html Quick_Card_Editor_V74_SOPHIA_Light.html out/

# Prueba de regresión (requiere Node 18+ y Playwright con Chromium)
node tests/sophia-regression.mjs out/SOP_Editor_V75_SOPHIA_Light.html out/Quick_Card_Editor_V75_SOPHIA_Light.html
```
