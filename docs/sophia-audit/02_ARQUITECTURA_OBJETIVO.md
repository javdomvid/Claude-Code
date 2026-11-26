# Arquitectura objetivo — SOPHIA v2 («motor inmutable + datos»)

> **Encaje con el proceso del proyecto** (prompt maestro, «Fase 4 · Núcleo compartido, sin big bang»): esto describe el **destino**, no un plan de reescritura.
> - Se llega por lotes desde V75, extrayendo primero funciones puras y tokens de un comportamiento ya probado.
> - En cada paso se mantiene la paridad y la vuelta atrás al binario base.
> - La rama estable conserva `contenteditable` encapsulado.
> - ProseMirror u otros motores solo como experimento lateral.
> - El guardado **nunca sobrescribe el original**.

> Objetivo: mantener lo que hace especial a SOPHIA y quitar la causa de la mayoría de los fallos. Lo que se mantiene:
> - **un solo archivo HTML**;
> - **funciona offline**;
> - **el documento lleva su editor y su historial**.
>
> La causa de los fallos es que el archivo se guarda serializando el DOM vivo y se amplía con parches. Esta arquitectura también es la que permite que **Copilot edite el código y genere contenido de SOP con garantías**.

---

## 1. Principios (invariantes del proyecto)

1. **Un archivo, offline.** Nada de CDN, `fetch`, fuentes remotas ni telemetría. CSP estricta dentro del propio archivo.
2. **Motor inmutable, datos separados.** El código y los estilos del motor nunca se modifican en tiempo de ejecución. Al guardar se copian **tal cual**: son su `textContent` original. Los datos son JSON.
3. **La interfaz nunca se guarda.** Todo lo que crea el JS vive dentro de `#app`, que no se serializa.
4. **El contenido es un modelo, no HTML libre.** Es una lista de bloques tipados con un conjunto cerrado de formatos. Es válido por esquema y se renderiza igual en el navegador, en Node (CLI) y en la impresión.
5. **Trazabilidad verificable.** Cada revisión lleva hash SHA‑256 encadenado y, opcionalmente, una firma. Al abrir se verifica siempre y el estado se muestra.
6. **Honestidad.** La interfaz dice exactamente qué garantiza cada cosa: «declarado», «íntegro», «firmado por la clave X», «verificado fuera del archivo».
7. **Un motor, varios perfiles.** SOP y Quick Card son configuraciones (`profile`), no copias del código.
8. **Código fuente en módulos pequeños + build.** Se edita en `src/` y un script sin dependencias genera el `.html` final. Nadie, ni humano ni IA, edita el HTML compilado a mano.

---

## 2. Formato de archivo v2

```html
<!doctype html>
<html lang="en" data-sophia-format="2">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';
                 img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
  <title>{meta.title} · {version} · SOPHIA</title>
  <style id="sophia-fonts">/* @font-face DM Sans WOFF2 base64 (OFL) */</style>
  <style id="sophia-tokens">/* @layer tokens: tokens JAOM */</style>
  <style id="sophia-app">/* @layer base, app, components: interfaz (solo @media screen) */</style>
  <style id="sophia-paper">/* @layer paper: folio común + perfiles (sop, quick-card) */</style>
  <style id="sophia-print">/* @layer print: siempre el último */</style>
</head>
<body>
  <!-- 1) Vista estática de lectura: generada al guardar. Se ve aunque el JS esté bloqueado
          (vista previa de SharePoint/Teams/Outlook) y es indexable. -->
  <main id="sophia-static" data-static>…HTML del documento renderizado…</main>

  <!-- 2) Raíz de la app (vacía en el archivo; la rellena el motor) -->
  <div id="app" hidden></div>

  <!-- 3) Datos (JSON; '<' escapado como \u003c) -->
  <script type="application/json" id="sophia-manifest">{"format":2,"engine":"2.0.0","profile":"sop","documentId":"…"}</script>
  <script type="application/json" id="sophia-profile">{…perfil de plantilla…}</script>
  <script type="application/json" id="sophia-document">{…contenido actual: meta + blocks…}</script>
  <script type="application/json" id="sophia-history">{…revisiones encadenadas + eventos…}</script>
  <script type="application/json" id="sophia-assets">{"sha256-…":{"mime":"image/png","data":"…base64…"}}</script>
  <script type="application/json" id="sophia-keys">{…claves públicas de confianza (opcional)…}</script>

  <!-- 4) Motor (un único script; nunca se muta) -->
  <script id="sophia-engine">/* build de src/engine/** */</script>
</body>
</html>
```

### 2.1 Exportar sin tocar el DOM (patrón *quine*)

```js
// src/engine/persist/serialize.js
export function serializeFile(state) {
  const pristine = id => document.getElementById(id).textContent; // nunca mutados
  const json = obj => JSON.stringify(obj)
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const styles = ['sophia-fonts','sophia-tokens','sophia-app','sophia-paper','sophia-print']
    .map(id => `<style id="${id}">${pristine(id)}</style>`).join('\n');
  return `<!doctype html>
<html lang="${escAttr(state.document.meta.language || 'en')}" data-sophia-format="2">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<title>${escText(state.document.meta.title)} · ${escText(state.currentVersion)} · SOPHIA</title>
${styles}
</head>
<body>
<main id="sophia-static" data-static>${renderStatic(state)}</main>
<div id="app" hidden></div>
<script type="application/json" id="sophia-manifest">${json(state.manifest)}</script>
<script type="application/json" id="sophia-profile">${json(state.profile)}</script>
<script type="application/json" id="sophia-document">${json(state.document)}</script>
<script type="application/json" id="sophia-history">${json(state.history)}</script>
<script type="application/json" id="sophia-assets">${json(state.assets)}</script>
<script type="application/json" id="sophia-keys">${json(state.keys)}</script>
<script id="sophia-engine">${pristine('sophia-engine')}</script>
</body>
</html>`;
}
```

- `renderStatic()` es la **misma** función pura (cadena de texto, sin DOM) que usan Node, la CLI y la impresión.
- La exportación ya **no** depende de lo que haya en pantalla, así que A-01 desaparece por construcción.

### 2.2 Arranque

1. Leer y validar los JSON con el esquema. Si falla, mostrar el modo «solo lectura de emergencia» con `#sophia-static` y el error.
2. Resolver los activos a URLs `blob:`.
3. **Verificar integridad** (§6.3) de forma asíncrona y mostrar la franja de estado.
4. Ocultar `#sophia-static` y montar la app en `#app`: interfaz, editor sobre el modelo y paneles.
5. Aplicar preferencias **del usuario**, como tema, densidad o panel abierto, desde `localStorage` con el prefijo `sophia:pref:`. Nunca desde el documento.

---

## 3. Modelo de contenido (lo que Copilot genera)

Esquema completo: [`schemas/sophia-document.schema.json`](schemas/sophia-document.schema.json). Ejemplo válido: [`schemas/example.sop.document.json`](schemas/example.sop.document.json).

### 3.1 Documento

```json
{
  "schema": "sophia.document/2",
  "id": "QA-SOP-0042",
  "profile": "sop",
  "meta": {
    "title": "Recepción y verificación de materias primas",
    "language": "es",
    "classification": "TO BE CONFIRMED",
    "fields": {
      "level": "Site",
      "organization": "Quality Assurance",
      "documentIdentity": "Working Instructions",
      "owner": "TO BE CONFIRMED"
    },
    "source": { "title": "Job aid del proveedor", "updated": "2026-05-29" }
  },
  "blocks": [ … ]
}
```

### 3.2 Tipos de bloque (conjunto cerrado)

| Tipo | Campos clave | Notas |
|---|---|---|
| `heading` | `level` 1–3, `text`, `numbering?` | La numeración (1, 1.1, 1.1.1) la calcula el motor; no la escribas en `text`. |
| `paragraph` | `content` (inline[]), `style?` (`normal`, `lead`, `small`) | Sin estilos libres. |
| `list` | `ordered`, `items[]` (cada ítem: `id`, `content`, `children?` con hasta 3 niveles) | |
| `step` | `content`, `substeps?`, `role?`, `expected?` | Paso de procedimiento con responsable y resultado esperado (opcional). |
| `callout` | `variant` (`warning`, `caution`, `note`, `confirmation`, `draft`), `title?`, `content` | `confirmation` = «pendiente de confirmar». |
| `table` | `columns[]` (`{width?: %}`), `headerRows` 0–2, `rows[][]` (celdas: `{content, colspan?, rowspan?, align?}`), `caption?` | Sin tablas anidadas. |
| `figure` | `asset` (`sha256-…`), `alt` (obligatorio), `caption?`, `width` (%), `align` | La imagen está en `assets`. |
| `cardGrid` | `columns` 1–3, `cards[]` (`{id, title, tone, blocks[]}`) | Perfil quick-card. |
| `hero` | `eyebrow?`, `title`, `subtitle?`, `tags[]?` | Perfil quick-card; uno como máximo y al principio. |
| `divider` | — | |
| `pageBreak` | — | Regla de maquetación explícita. |

Todos los bloques llevan `id` con el patrón `^b-[a-z0-9]{10}$`, **único** en el documento.

### 3.3 Inline (texto con marcas)

```json
[
  { "text": "Selecciona " },
  { "text": "Return to supplier", "marks": ["bold"] },
  { "text": " en el menú " },
  { "text": "Action", "marks": ["code"] },
  { "text": ". Ver " },
  { "text": "portal", "link": "https://example.com/portal" },
  { "text": ". " },
  { "text": "Responsable de aprobación", "marks": ["tbc"] }
]
```

- Marcas permitidas: `bold`, `italic`, `underline`, `code`, `sup`, `sub`, `highlight` y **`tbc`**. `tbc` = «To Be Confirmed»: se pinta resaltado, cuenta en *Checks* y bloquea «Publish» si el perfil lo exige.
- Enlaces solo `https:` y `mailto:`.
- Sin colores ni tamaños libres. El aspecto lo deciden la plantilla y los tokens.

### 3.4 Por qué este modelo hace que la IA «lo haga bien»

- **Validable**: un esquema JSON rechaza enseguida lo que no encaja (tipos, campos obligatorios, `alt` vacío, enlaces no https, IDs duplicados).
- **Sin decisiones visuales**: la IA no elige tamaños ni colores, así que no puede romper la plantilla.
- **Direccionable**: «cambia el paso `b-7k2…`» no es ambiguo. Los diffs por bloque son limpios y la atribución se conserva.
- **Marcado de incertidumbre**: con `tbc` y `callout: confirmation`, la IA marca lo que no sabe en lugar de inventarlo. *Checks* lo cuenta.

---

## 4. Perfiles de plantilla (SOP / Quick Card)

`#sophia-profile` contiene datos, no código:

```json
{
  "id": "sop-reference",
  "version": "1.2",
  "kind": "sop",
  "paper": { "size": "A4", "margins": "13mm 15mm 15mm", "font": "DM Sans", "baseSize": "10.5pt" },
  "identityFields": [
    { "key": "level", "label": "Level" },
    { "key": "organization", "label": "Organization" },
    { "key": "documentIdentity", "label": "Document Identity" },
    { "key": "owner", "label": "Document Owner", "validate": "pid-or-tbc" },
    { "key": "title", "label": "Title", "source": "meta.title" }
  ],
  "logo": { "asset": "sha256-…", "alt": "Corporate logo", "maxWidthMm": 45 },
  "header": { "firstPage": "logo-right+classification+identity", "continuation": "title-label" },
  "footer": { "content": ["documentId", "version", "status", "page"], "uncontrolledCopyNotice": true },
  "allowedBlocks": ["heading","paragraph","list","step","callout","table","figure","divider","pageBreak"],
  "palette": { "tableHeader": "#0B3C56", "cellFills": { "light": "#CBE7F5", "highlight": "#EDF2AE" } },
  "rules": { "publishRequiresNoTbc": true, "minAltLength": 5 }
}
```

- `quick-card` añade `hero` y `cardGrid` a `allowedBlocks`, con su propia paleta y cabecera.
- Las funciones propias de un perfil, como Table Flow, se activan aquí (`features: ["tableFlow"]`) y viven en el motor común.
- El CSS del folio por perfil se aplica con `[data-profile="quick-card"]` dentro de `@layer paper`.

---

## 5. Motor de edición

### Opción A — Mantener `contentEditable` propio + normalizador (riesgo bajo, Fase 1–2)
- El DOM editable es una **proyección** del modelo.
- Tras cada transacción, un **normalizador** convierte el DOM a modelo: solo reconoce el conjunto cerrado de bloques y marcas y descarta el resto. Después vuelve a renderizar si hace falta.
- Se reemplaza `execCommand` por comandos propios sobre el modelo (`toggleMark`, `setBlockType`, `insertTable`).
- IDs automáticos (§5.3).

### Opción B — Editor con esquema (ProseMirror): **solo experimento lateral**

> Por decisión del proyecto, no entra en la rama estable. Evalúalo en paralelo solo si el motor actual no cumple un requisito **medido**: pegado, deshacer, tablas o IDs. Compara fidelidad de ida y vuelta, tamaño, modo offline y plan de vuelta atrás.

- ProseMirror (MIT) se integra **en línea** en el build: `model`, `state`, `view`, `transform`, `history`, `keymap`, `commands` y `tables`. Ocupa unos 150–200 KB minificado, menos que los ~300 KB de JS actuales.
- Da directamente lo que hoy se ha construido a mano y con fallos:
  - esquema obligatorio;
  - pegado saneado;
  - deshacer por pasos (memoria O(cambios), no O(documento × 60));
  - atributos de nodo (`id`) con un *plugin* `appendTransaction` que repara duplicados;
  - selección robusta;
  - tablas con fusión de celdas.
- El modelo de §3 se corresponde 1:1 con un esquema ProseMirror.

### 5.3 Identidad de bloques automática (cualquier opción)

```js
// después de cada transacción o entrada de texto (con debounce de 300 ms)
function ensureBlockIds(blocks) {
  const seen = new Set();
  for (const b of walkBlocks(blocks)) {           // en orden del documento
    if (!b.id || !/^b-[a-z0-9]{10}$/.test(b.id) || seen.has(b.id)) b.id = newId(seen);
    seen.add(b.id);
  }
}
// El primer nodo en orden conserva su ID (el que contiene el inicio del texto original al pulsar Intro);
// las copias reciben uno nuevo. Los IDs no cuentan como cambio de contenido.
```

---

## 6. Trazabilidad e integridad

### 6.1 Historial (`#sophia-history`)

```json
{
  "schema": "sophia.history/2",
  "versioning": "major.minor+draft",
  "revisions": [
    {
      "seq": 7,
      "version": "1.2-d3",
      "status": "draft",
      "date": "2026-11-26T10:39:23.883Z",
      "author": { "declared": "JAOM", "name": "Nombre declarado", "kind": "human" },
      "mode": "manual",
      "reason": "Corrige el paso 3.4 y añade captura del portal",
      "engine": "2.0.0",
      "baseSeq": 6,
      "content": { "schema": "sophia.document/2", "blocks": "…documento completo o delta…" },
      "contentHash": "sha256-…",
      "assets": ["sha256-…"],
      "changes": [ { "type": "modified", "block": "b-7k2…", "summary": "…" } ],
      "prevHash": "sha256-…",
      "hash": "sha256-…",
      "signatures": [
        { "role": "author", "keyId": "k-JAOM-2026", "alg": "ECDSA-P256-SHA256", "sig": "base64…", "signedAt": "…" }
      ]
    }
  ],
  "events": [
    { "type": "export", "seq": 7, "date": "…", "file": "QA-SOP-0042_1.2-d3.html", "bytesSha256": "…" },
    { "type": "migration", "from": "V74", "date": "…", "note": "Hashes calculados por primera vez" }
  ]
}
```

- `mode`: `manual`, `ai-assisted`, `migration` o `reissue`.
- `author.kind`: `human` o `ai-assisted`. Si es `ai-assisted`, añade `requestedBy` (PID declarado de la persona que pidió el cambio) y `tool` («GitHub Copilot»).
- **Estados**: `draft` → `in-review` → `published` → `superseded`. Además, `validated` como atestación sobre una versión publicada.
- **Versiones**: `X.Y-dN` (borrador), `X.Y` (publicada), `X+1.0` (cambio mayor o validación). Nunca se repiten.

### 6.2 Hash canónico

- **Serialización canónica**: JSON con claves ordenadas, sin espacios, cadenas normalizadas NFC y números sin ceros sobrantes (estilo RFC 8785 / JCS).
- `contentHash = sha256(canonical(document))`. Los IDs se incluyen, porque forman parte del modelo.
- `hash = sha256(canonical(revisión sin el campo hash ni signatures))`, que incluye `prevHash`.
- Navegador: `crypto.subtle.digest('SHA-256', …)`, disponible en `file://`, que es un contexto seguro. Node: `crypto.createHash('sha256')`. Mismo resultado byte a byte.

### 6.3 Verificación al abrir (siempre)

| Comprobación | Resultado en la interfaz |
|---|---|
| El esquema de los JSON es válido | Si no: «Archivo dañado» y se muestra la vista estática. |
| `contentHash` del documento actual = `contentHash` de la última revisión | Si no: **«⚠ Cambios no registrados»**. Permite leer y guardar como borrador; **bloquea publicar**. |
| La cadena `prevHash` y `hash` cuadra en todas las revisiones | Si no: **«⛔ Historial alterado en la revisión N»**. Solo lectura. |
| Firmas válidas con claves de `#sophia-keys` | «Firmado por k-JAOM-2026 (huella AB12…)» o «Firma inválida». |
| La versión es única y la secuencia correlativa | Si no: error de historial. |
| `#sophia-static` coincide con `renderStatic(document)` | Si no: aviso «vista estática desactualizada». Se regenera al guardar. |

### 6.4 Firmas (opcional, Fase 4)

- Cada persona genera **una vez** un par de claves ECDSA P‑256 con WebCrypto.
- La **clave privada no extraíble** se guarda en IndexedDB de su navegador. Alternativa portátil: un `.jwk` cifrado con su contraseña mediante PBKDF2 + AES‑GCM.
- La **clave pública** y su huella se añaden al registro `#sophia-keys` del documento y a un **registro externo de confianza**: lista de SharePoint, wiki de calidad o PDF firmado del índice maestro.
- Firmar = `crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'}, privateKey, utf8(revision.hash))`.
- **Límite honesto**: quien tenga el archivo puede sustituir `#sophia-keys` por sus propias claves y volver a firmar todo. Por eso la interfaz muestra la **huella** de cada clave y el proceso exige compararla con el registro externo. Sin ancla externa, la firma solo prueba coherencia interna.
- **Ancla mínima recomendada** sin infraestructura: al publicar, la app muestra «Huella de esta versión: `sha256-…`». Esa huella se pega en la lista de SharePoint o en el correo de publicación. Cualquiera puede comprobar después que su copia tiene la misma huella.

---

## 7. Activos (imágenes)

- `assets` es un diccionario `sha256-<hex>` → `{mime, data, width, height}`. Cada imagen se guarda **una sola vez** en todo el archivo.
- Los bloques `figure`, el logo del perfil y las revisiones hacen referencia al hash. Al guardar, se eliminan los activos que nada referencia: ni el documento actual ni ninguna revisión.
- La importación ofrece optimización a WebP o JPEG con calidad elegida y vista previa de legibilidad. Nunca es automática, y se conserva el original hasta confirmar.
- Límites por perfil, configurables: por ejemplo, 15 MB por imagen y 60 MB en total, con aviso.

---

## 8. Guardar, recuperar y publicar

| Acción | Qué hace |
|---|---|
| **Guardar borrador** (Ctrl+S, ya en V75) | Añade una revisión. **Siempre como copia nueva** con nombre versionado: descarga o «Save HTML as…» con nombre nuevo, más el recibo con verificación byte a byte. **Nunca sobrescribe el original** ni da por hecho que se ha escrito en SharePoint. |
| **Publicar** | Exige: sin «cambios no registrados», sin `tbc` (si el perfil lo pide) y checks sin errores. Crea `X.Y` con estado `published` y archivo nuevo `ID_vX.Y.html`, muestra la huella y opcionalmente firma. |
| **Validar** | Atestación sobre una versión publicada. Con firma, si existe. |
| **Recuperación** | IndexedDB (`sophia-recovery`), clave `docId + baseSeq`; caduca a los 7 días; se borra al guardar o descartar; contador visible en *Checks*. |
| **Descargar copia** | Mismo serializador y nombre `…_copy.html`. No crea revisión. |

> Escribir directamente en un archivo existente solo como opción explícita (*opt-in*) y probada por entorno. Nunca sobre el original abierto.

---

## 9. Código fuente + build (cómo trabaja Copilot)

```
sophia/
├─ src/
│  ├─ engine/
│  │  ├─ core/        (state store, events, i18n, ids, canonical-json, sha256)
│  │  ├─ model/       (schema validate, normalize, render-html (puro), render-static, diff)
│  │  ├─ editor/      (view, commands, selection, paste, tables, figures)
│  │  ├─ history/     (replay, attribution, history-studio)
│  │  ├─ integrity/   (hash chain, verify, signatures, keys)
│  │  ├─ persist/     (serialize (quine), save, receipt, recovery)
│  │  ├─ print/       (print studio, print css builder)
│  │  ├─ ui/          (app shell, toolbar, ribbon, panels, dialogs, toasts, command registry)
│  │  └─ profiles/    (sop.js, quick-card.js: solo registran componentes y reglas)
│  ├─ styles/  tokens.css · base.css · app.css · components.css · paper.css · paper-sop.css · paper-qc.css · print.css
│  └─ fonts/   dm-sans-latin-{400,500,600,700}.woff2
├─ schemas/   sophia-document.schema.json · sophia-history.schema.json · sophia-profile.schema.json
├─ documents/ <docId>/document.json · profile.json · assets/
├─ tools/
│  ├─ build.mjs       (sin dependencias: concatena módulos en orden, incrusta CSS, fuentes y datos → dist/*.html)
│  └─ sophia-cli.mjs  (ver §10)
├─ tests/    regression.mjs (Playwright) · unit/*.mjs (node --test)
└─ dist/     *.html (generado; no editar)
```

- **Build sin dependencias**: un `build.order.json` lista los módulos. Cada módulo es una IIFE que se registra en `window.SOPHIA`. Así no hace falta *bundler* y Copilot entiende el orden con solo leer un JSON. Si más adelante se quiere `import`/`export` real, `esbuild` como dependencia de desarrollo; en tiempo de ejecución sigue sin necesitar red.
- **Tests**: `node --test tests/unit` para lo puro (canonical, hash, versiones, render, normalize, diff) y `node tests/regression.mjs dist/*.html` para el navegador.
- **Regla**: `dist/` no se edita nunca a mano. Si un `.html` antiguo necesita arreglo, se **migra** (§11).

---

## 10. `sophia-cli` — herramienta de desarrollo y QA (fixtures, migración, verificación)

> No es la vía por la que el agente SOPHIA escribe documentos: el agente propone y la persona aplica en el editor (ver §10 bis). `commit` sirve para fixtures de prueba y migraciones aprobadas.

```bash
# 1) Extraer el contenido actual de un SOP a JSON editable
node tools/sophia-cli.mjs extract SOP.html --out work/doc.json

# 2) (Copilot edita work/doc.json siguiendo el esquema)

# 3) Validar (esquema + reglas del perfil: IDs únicos, alt, enlaces, tbc, niveles de títulos)
node tools/sophia-cli.mjs validate work/doc.json --profile sop

# 4) Ver qué cambia, bloque a bloque, frente a la última revisión
node tools/sophia-cli.mjs diff SOP.html work/doc.json

# 5) Registrar una revisión NUEVA (nunca reescribe las anteriores) y generar el archivo
node tools/sophia-cli.mjs commit SOP.html work/doc.json \
  --status draft --mode ai-assisted --tool "GitHub Copilot" \
  --requested-by JAOM --reason "Añade sección 3.8 y aclara 3.2" \
  --out out/SOP_1.2-d1.html

# 6) Verificar cualquier archivo (esquema, hashes, cadena, firmas, vista estática)
node tools/sophia-cli.mjs verify out/SOP_1.2-d1.html

# 7) Crear un documento nuevo desde un perfil
node tools/sophia-cli.mjs new --profile quick-card --id QC-0007 --title "…" --out work/new.json
```

Reglas que impone la CLI (y que **debe** respetar la IA):
- Nunca borra ni modifica `revisions[]`: solo añade.
- `mode: ai-assisted` es **obligatorio** si el cambio lo hizo una IA, con `requestedBy`.
- Las revisiones `ai-assisted` **no pueden** tener `status: published` ni `validated`. Solo un humano publica, desde la app y con su declaración o firma.
- Si `validate` falla, `commit` no se ejecuta.

---

## 10 bis. Dónde encaja el agente SOPHIA (contrato `Proposal` del prompt maestro)

- La CLI anterior es una **herramienta de desarrollo y QA**: fixtures, migraciones y verificación. **No** es la vía por la que el agente escribe documentos.
- El agente SOPHIA produce **propuestas**:

  `Proposal { schemaVersion, proposalId, documentId, documentType, baseDocumentVersion, baseFingerprint, intent, operations[], evidence[], unresolved[], requiresHumanApproval }`

  Una persona las revisa **dentro del editor** y se aplican por la ruta transaccional (`EditorTransactions.run`), con diff y posibilidad de rechazar.
- Para que eso funcione de forma determinista hacen falta dos piezas de esta arquitectura:
  1. **IDs de bloque estables y automáticos** (A-04, §5.3) → `operations[].targetBlockId`.
  2. **Huella de contenido** (C-03, §6.2) → `baseFingerprint` = `contentHash` de la revisión sobre la que se hizo la propuesta. Si no coincide, la propuesta se rechaza sin mutar nada y se pide *rebase*.
- **Operaciones iniciales**:
  - `replaceBlockText` (con el valor anterior esperado);
  - `insertBlockAfter` (bloque del esquema de §3, anclado a un ID);
  - `updateMeta` (solo campos no protegidos).

  Validadas con el esquema JSON (`schemas/sophia-document.schema.json`). Se rechazan scripts, *handlers*, URLs no https, IDs duplicados y cambios en revisiones cerradas.
- Etapas: A0 (solo lectura) → A1 (bibliotecas de solo lectura) → A2 (importar una propuesta a **una copia de borrador**) → A3 (integración corporativa con permisos). Ver el prompt maestro, §8.

## 11. Migración desde V74

`node tools/sophia-cli.mjs migrate SOP_Editor_V74….html --profile sop --out work/`

1. Lee `#record`: `id`, `status`, `revisions[]` con sus instantáneas HTML y `templateProfile`.
2. Convierte el **DOM actual** de `#document` a bloques con el normalizador. Lo que no encaje se convierte en `paragraph` y se lista en un informe de migración.
3. Extrae los metadatos de `.identity` a `meta.fields` (por **etiqueta**, no por posición).
4. Extrae el logo y todas las imágenes a `assets` con deduplicación.
5. Revisiones antiguas: se conservan como `legacyHtml`, saneadas con la misma lista blanca que `safeRoot`, con hash calculado y marcadas `mode: "migration-legacy"`. Se pueden ver en el historial, pero no participan en la atribución palabra a palabra.
6. Crea una revisión `migration` con el contenido convertido. Versión: la siguiente según el esquema; por ejemplo, el SOP 0.4 pasa a `1.0-d1`.
7. Genera `work/document.json`, `work/history.json`, `work/assets/` y el informe `work/migration-report.md`.
8. `build` → nuevo `.html` v2 → `verify`.

---

## 12. Fases (alineadas con el plan del prompt maestro)

| Fase del proyecto | Lotes concretos | Estado |
|---|---|---|
| 1A · Fiabilidad | **Lote 1 / V75**: C-01, A-01, A-02, A-03, A-10 (en el guardado confirmado), M-02, M-03, M-04 y el selector del recibo | ✅ Entregado y probado (Chromium) |
| 1A (cont.) | **Decisiones D1–D4**: numeración, claves, IDs automáticos, huellas | ⏸ Pendiente de decisión |
| 1B · Pulido de la disposición | Valores por defecto Mini en alturas pequeñas, estados deshabilitados, tamaños mínimos (doc 03), sin mover lo aprobado | 📋 Propuesto |
| 2 · Historial y control documental | Huellas encadenadas (C-03), versiones únicas (C-04), comparar dos revisiones cualesquiera (W-22) | 📋 Tras D1/D4 |
| 3A · Documento e impresión | Pie de copia controlada y marca de BORRADOR (M-10); la impresión del navegador reutiliza el CSS de Print Studio | 📋 Propuesto |
| 3B · Tablas e imágenes | Mover bloques (W-07), activos por hash (A-05) | 📋 Tras D3 |
| Lote «Edición fluida» | W-01, W-02, W-03, W-04, W-06, W-10, W-12 (doc 05) | 📋 Recomendado como siguiente |
| 4 · Núcleo compartido | `src/` + build a un solo archivo, perfiles, CSS por capas, formato v2 (este documento) | 📋 Destino |
| Agente (paralelo) | A0 solo lectura con el esquema de §3 y el contrato `Proposal` (§10 bis) | 📋 Especificado |
