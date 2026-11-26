# Diseño — Obsidian JAOM (Material Expressive · Glass · Bento): diagnóstico y especificación

> Objetivo: **mantener la identidad** que ya gusta y hacerla coherente, ligera y fácil de mantener. Se mantienen:
> - el lienzo obsidiana;
> - las barras de cristal lavanda;
> - las tarjetas tonales tipo bento;
> - el teal como acción principal;
> - el folio blanco protagonista.
>
> Este documento tiene cinco partes: (1) qué define hoy el estilo, (2) métricas, (3) problemas `D-xx`, (4) especificación propuesta con tokens y (5) plan de migración del CSS.
>
> Tokens listos para usar: [`tokens/jaom-tokens.css`](tokens/jaom-tokens.css).
>
> **Disposición aprobada (prompt maestro, §5):** se respetan
> - el orden superior History (4) → Edit/Save draft/Resume (1) → Focus (3) → Views (2) → Canvas (7) │ Main panel (5) → Sidebar (6) → Edit panel;
> - Layout view y Layout Studio juntos en Navigate;
> - los ciclos Full → Mini → Hide;
> - More tools flotante en estrecho;
> - Focus reversible;
> - el papel separado del lienzo;
> - el rojo y la marca de agua del History histórico.
>
> Los puntos marcados **«requiere aprobación»** alteran esa disposición y son solo propuestas. El resto (tokens, coherencia, estados, accesibilidad, CSS por capas) mejora la implementación sin moverla.

---

## 1. Lo que define hoy el estilo (descifrado del código)

| Elemento | Valor actual | Dónde |
|---|---|---|
| Lienzo «Obsidian» | `#0e0e11`; claro: `#fff` (`body[data-jaom-light]`) | `jaom-glass-v48` |
| Cristal de la barra | `rgba(231,239,255,.69)` + `blur(18px) saturate(1.28)`; *dock* en degradado `#e2ebfff0 → #eee3ffba` | `jaom-glass-v48`, `sophia-phase1-shared` |
| Tinta | `--ph-ink:#202e46` | `sophia-phase1-shared` |
| Primario (acción) | teal `--ph-main:#104f60` / `#185669` | `sophia-phase1-shared`, `jaom-glass-v48` |
| Selección | lila `--ph-selected:#e3d5ff`; pestaña activa `#e6ddfa` / `#42256b` | idem |
| Tarjetas tonales (bento) | Navigate azul, Assets menta `#e8f5f2`, Review lila `#eee8f9`, Output melocotón `#faf0e5`, Save verde | `jaom-glass-v48`, `ui32-tile[data-tone]` |
| Forma | radios de 9–18 px (barra 16–18, tarjeta 12, botón 9) | varios |
| Tipografía | DM Sans (no incrustada → Arial), 9–13 px en la interfaz, rótulos de tarjeta en VERSALITAS con espaciado | varios |
| Historial | fondo berenjena oscuro; histórico en rojo `#762d3d` con marca de agua | `history-*`, `sophia-history-v71/72` |
| Folio | blanco, sombra `--sophia-light-paper`, tabla de identidad gris, aviso ámbar | `sophia-light-elevation`, CSS base |

**Lectura de la mezcla, tal como está hoy:**
- **Cristal**: solo en las dos barras superiores y en el menú flotante de vistas.
- **Material Expressive**: botones tonales, primario relleno, pestañas con estado, formas redondeadas.
- **Bento**: el panel «Main panel: Full» con tarjetas por intención (Navigate, Assets, Review, Save & publish, Output).

La idea es buena. Lo que falla es la ejecución acumulada.

---

## 2. Métricas del CSS (archivo SOP)

| Métrica | Valor | Objetivo |
|---|---|---|
| CSS total | 164 KB en 58 bloques `<style>` | < 60 KB en 5 hojas |
| `!important` | 910 (+104 en cadenas JS) | 0 fuera de `@layer overrides` / `print` |
| Colores hexadecimales distintos | **728** | ≈ 40 tokens |
| `border-radius` distintos | 29 | 6 |
| `box-shadow` distintos | 63 | 4 (elevación 0–3) |
| `backdrop-filter` distintos | 11 (desenfoques de 2, 3, 4, 12, 15, 16, 18 y 22 px) | 2 |
| `font-size` distintos | 24 (132 declaraciones de 9–11 px) | 8 (escala) |
| `z-index` distintos | 23 (hasta 15000) | 7 (escala) |
| *Media queries* distintas | 34 (600, 620, 650, 690, 700, 720, 800, 820, 850, 900, 940, 1120, 1250 px…) | 3 puntos de ruptura + *container queries* |
| Familias de clases con versión | 31 (`ui30…ui36`, `h20…h72`, `ph2…ph65`, `wb24`, `ts26`…) | 0 |
| Selectores con 4 o más clases encadenadas | 44 | 0 |

---

## 3. Problemas de diseño y experiencia de uso (`D-xx`)

> Capturas de referencia en las pruebas: 1440×900, 1024×768 y 390×844; lienzo oscuro y claro; modo edición; historial; recibo; Print Studio; paleta.

### D-01 · Con los modos por defecto (Full/Full), el documento queda abajo
Inicio del folio (`y`) medido en V74/V75. Los modos Mini y Hide **ya existen** y resuelven gran parte:

| Ventana | Lectura Full | Lectura Mini | Lectura Hide | Edición Full/Full | Edición Mini (cinta) | Edición Mini/Mini |
|---|---|---|---|---|---|---|
| 1440×900 | 248 | 164 | 115 | **454** | 309 | 214 |
| 1024×768 | 248 | 164 | 115 | **556** (solo quedan ~210 px de documento) | 349 | 254 |
| 390×680 | 204 | 204 | 204 | 445 | 331 | 331 |

- **Propuesta compatible con la disposición aprobada** (no la mueve):
  - si `innerHeight < 820` y el usuario **no** ha elegido modo (no hay valor en `localStorage`), arrancar la edición en *Edit panel: Mini*;
  - mostrar una pista única: «Puedes cambiar a Full con este botón».

  La elección explícita del usuario siempre manda.
- **Propuesta que requiere aprobación**: la descrita a continuación, con barra única y hoja bento a demanda.
- **Propuesta**:
  - Lectura: una sola barra de app de 56–64 px.
  - Edición: cinta contextual de **una fila** (48 px) con desbordamiento.
  - El panel bento pasa a una **hoja de comandos** que se abre a demanda y no está siempre desplegada.
  - Objetivo: folio visible ≥ 75 % en lectura y ≥ 60 % en edición.

### D-02 · Cinco sistemas de navegación que repiten comandos — *requiere aprobación*
1. *dock* superior (History, Edit, Focus, View, Canvas, Main panel, Sidebar, Edit panel, Undo, Redo, Table Studio);
2. panel bento (Navigate, Assets, Review, Save & publish, Output);
3. cinta (Home, Paragraph, Insert, Review & view, más una fila suelta de botones heredados);
4. lateral (Outline, Images, Format, Versions, Checks);
5. paleta Ctrl+K.

Deshacer y Rehacer aparecen dos veces; Imprimir, Buscar e Historial, dos o tres.

- **Propuesta**: una jerarquía clara.
  - **Barra de app**: identidad + estado + 3–5 acciones principales.
  - **Hoja bento**: todos los comandos agrupados.
  - **Cinta**: solo formato, y solo en edición.
  - **Lateral**: navegación del documento.
  - **Paleta**: atajo a todo lo anterior.

  Cada comando vive en **un** sitio visible más la paleta.

### D-03 · El estado aparece tres veces y con textos distintos — *requiere aprobación*
- Chip «● Viewing / Editing / Unsaved changes».
- Tarjeta de identidad «SOP VIEW & EDITOR V42.5 · Document V1 / Draft - not approved · Read only».
- Franja de sesión con «Read-only document / No pending content changes / Local recovery is not a saved HTML».

A 1440 px, el primer texto de la franja queda **oculto bajo el lateral**.

- **Propuesta**: un único **chip de estado** con un popover de detalle. Estados:
  - `Solo lectura`
  - `Editando · JAOM`
  - `Cambios sin guardar`
  - `Guardado V1.2-d3`
  - `⚠ Cambios no registrados`
  - `⛔ Historial alterado`

  La versión del documento va junto al título (`V1.2-d3 · Borrador`). La versión del motor, solo en «Acerca de».

### D-04 · Agrupación con semántica dudosa — *requiere aprobación*
- «Discard» y «Big Validation» están dentro de **Review**.
- «Embed font» está en **Assets**.
- «Output» queda **sola en la segunda fila** a 1440 px.
- «Layout view» y «Layout Studio» aparecen juntos y confunden.
- **Propuesta de grupos**:
  - **Documento**: Propiedades, Estructura, Tablas, Maquetación.
  - **Revisar**: Checks, Buscar, Historial.
  - **Recursos**: Imágenes.
  - **Salida**: Imprimir, Descargar copia.
  - **Guardar y publicar**: Guardar borrador, Publicar, Validar, Descartar. Descartar va separado y en el tono de peligro.

### D-05 · El «bento» no es una rejilla
- Las tarjetas son *flex-wrap* de anchura variable: las filas quedan dentadas y hay tarjetas huérfanas.
- Los rótulos de tarjeta son de 9–10 px.
- **Propuesta**:
  - Rejilla de 12 columnas con *spans* fijos por tarjeta (4/4/4 y 6/6) y *gutter* de 8 px.
  - *Container queries* para pasar a 6/6 y 12 en contenedores estrechos.
  - Rótulo de 11 px en versalitas con espaciado de 0,08 em y contraste ≥ 4,5:1.

### D-06 · Cristal: legibilidad y coste
- Opacidad 0,69 con texto de 11–12 px encima de un documento que se desplaza debajo, porque la barra es *sticky*: en algunos momentos baja el contraste.
- Ocho valores de desenfoque. Los de 2–4 px sobre tarjetas pequeñas apenas se notan y cuestan lo mismo.
- `backdrop-filter` en áreas grandes repinta al desplazar: es lento en portátiles corporativos.
- **Propuesta**:
  - Solo **dos** niveles de cristal: `--jaom-glass-1` (barra) y `--jaom-glass-2` (popovers y hojas flotantes).
  - Opacidad mínima de 0,82 sobre el lienzo con contenido.
  - Nunca cristal en diálogos, tarjetas dentro de una superficie de cristal ni en el folio.
  - Con `prefers-reduced-transparency`, superficie sólida (ya existe: conservarlo).

### D-07 · Tres «oscuros» distintos y un interruptor de tema a medias
- Lienzo `#0e0e11`, historial berenjena y rojo histórico `#762d3d`. Barras y diálogos siempre claros.
- «Canvas: Dark/Light» solo cambia el lienzo, se guarda **dentro del documento** y la etiqueta miente al reabrir (M-04).
- **Propuesta**:
  - Lienzo con dos variantes de tokens (`obsidian` y `paper-light`) que siguen `prefers-color-scheme`, con preferencia del usuario en `localStorage`.
  - Barras: variante «glass-light» por defecto y «glass-dark» opcional.
  - Historial: mismo sistema de superficies, con el rojo reservado **solo** para «versión histórica».

### D-08 · El estado deshabilitado casi no se distingue
- En lectura, «Big Validation», «Discard» y «Publish & save» se ven casi igual que los activos.
- **Propuesta**:
  - Token `--jaom-state-disabled`: 38 % de opacidad en el contenido y sin capa de estado.
  - Icono de candado opcional y *tooltip* «Empieza a editar para…».
  - Sin `pointer-events:none`, para que el *tooltip* funcione.

### D-09 · Tamaños demasiado pequeños
- Botones de 30–34 px de alto y texto de interfaz de 9–11 px.
- **Propuesta**:
  - Altura mínima de 40 px en escritorio y 44 px en táctil.
  - Texto de interfaz de 13–14 px y rótulos de 11–12 px (solo versalitas).

### D-10 · La indicación de «editable» sobre el folio se ve rota
- En edición, los contornos discontinuos de las celdas de identidad se cruzan con los bordes de la tabla y no quedan alineados.
- **Propuesta**:
  - Sin contorno permanente.
  - Al pasar el ratón o con foco: fondo `--jaom-paper-editable` (tinte del 4 %) y un indicador de 2 px en el margen izquierdo del bloque.
  - Las celdas de identidad no son editables en línea (M-05): mostrar un lápiz que abre Propiedades.

### D-11 · Móvil — *requiere aprobación*
- **SOP**: el folio A4 desborda en horizontal (logo y tabla cortados).
- **Edición**: la cinta ocupa media pantalla.
- **Toasts**: tapan el contenido.
- QC sí se adapta bien: tomarlo como referencia.
- **Propuesta**:
  - Por debajo de 820 px: activar al abrir el **Fit** que ya existe en Views (si el usuario no eligió zoom). Valorar un folio fluido en Continuous.
  - Cinta como hoja inferior (*bottom sheet*) con las 6 acciones más usadas y «Más».
  - Toasts encima de la barra inferior, con `max-width` de 90 vw.

### D-12 · Los diálogos no forman una familia
- Cada estudio (Table, Layout, Replace, Library, Structure, Receipt, Review, Print, History) tiene su propio ancho, cabecera, versión en la cabecera, pie y color primario (teal o violeta).
- **Propuesta**: componente `StudioDialog` con:
  - anchos `sm` 480, `md` 720, `lg` 1040 y `full`;
  - cabecera con rótulo, título y descripción, sin versiones;
  - cuerpo con desplazamiento;
  - pie con secundaria a la izquierda y primaria a la derecha;
  - variante de peligro.

### D-13 · Dos juegos de iconos
- `uiPaths` (21×21, trazo de 1,5) y `islands` (24×24, trazo de 1,65); unos botones tienen icono y otros no.
- **Propuesta**:
  - Un único juego de 24×24 con trazo de 1,75 y extremos redondeados, incrustado como `<symbol>` en un SVG *sprite*.
  - Regla: los botones de la barra siempre con icono y texto; la versión «Mini» solo con icono y `aria-label`.

### D-14 · Demasiados acentos
- Teal, violeta, azul, menta, melocotón, verde, rojo y ámbar, además de 728 hexadecimales.
- **Propuesta**: 1 primario (teal), 1 de selección (lila), 4 tonos de tarjeta (azul, menta, lila y melocotón), 3 semánticos (éxito, aviso y peligro) y neutros. Todo como token.

### D-15 · Movimiento
- Solo 6 transiciones y ninguna «expresiva». Hay buen soporte de `reduced-motion`.
- **Propuesta**:
  - Duraciones de 100, 200, 300 y 450 ms.
  - Curvas `emphasized` `cubic-bezier(.2,0,0,1)` y `emphasized-decelerate` `cubic-bezier(.05,.7,.1,1)`.
  - Retroalimentación al pulsar: `scale(.97)` y cambio de radio de 12 a 16 en tarjetas.
  - Apertura de hoja bento con escala y opacidad.
  - Todo a 0 con `prefers-reduced-motion`.

### D-16 · El folio y la interfaz comparten CSS
- El folio hereda reglas de la interfaz y viceversa: el caso extremo es C-01.
- **Propuesta**:
  - El folio tiene su propia capa (`@layer paper`) y **sus propios tokens**: los de la plantilla y el perfil.
  - El CSS de la app no puede seleccionar nada dentro de `#document .sheet`, salve indicadores de edición con el prefijo `.is-editing`.

---

## 4. Especificación propuesta

### 4.1 Roles de la mezcla (en vez de porcentajes abstractos)

| Capa | Peso visual | Dónde se usa | Dónde **no** |
|---|---|---|---|
| **Glass** | ≈ 20 % | Barra de app, popovers, hoja bento flotante, barra inferior en móvil | Diálogos, tarjetas dentro de una superficie de cristal, folio, impresión |
| **Material Expressive** | ≈ 50 % | Botones (relleno, tonal, de texto), chips, capas de estado, formas, tipografía, movimiento, acción principal destacada | — |
| **Bento** | ≈ 30 % | Hoja de comandos, panel *Checks*, resumen del historial, recibo de guardado, inicio de documento nuevo | Cinta de formato y folio |

> **Pregunta abierta para el responsable**: si la mezcla original tenía otros porcentajes, sustituye esta tabla. Las reglas de las columnas «dónde» siguen valiendo.

### 4.2 Superficies

| Token | Uso |
|---|---|
| `--jaom-canvas` | Lienzo de fondo (obsidiana o claro). |
| `--jaom-glass-1` / `--jaom-glass-2` | Barra de app / flotantes. |
| `--jaom-surface`, `--jaom-surface-container`, `--jaom-surface-container-high` | Diálogos, tarjetas y paneles. |
| `--jaom-tone-navigate/assets/review/output/save` | Contenedores tonales del bento. |
| `--jaom-paper` | Folio (siempre blanco; tokens de perfil para el interior). |
| `--jaom-scrim` | Fondo de modales. |
| `--jaom-historic` | Exclusivo de «versión histórica». |

### 4.3 Escalas
- **Radio**: `xs 6` · `sm 9` · `md 12` · `lg 16` · `xl 20` · `pill 999`.
- **Elevación**: `0` (plano) · `1` (tarjeta) · `2` (barra y menús) · `3` (diálogo), en variantes para lienzo oscuro y claro.
- **Espaciado** (base 4): `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40`.
- **Tipografía de interfaz**: `label-sm 11/16 versalitas` · `label 13/18` · `body 14/20` · `title-sm 16/22` · `title 20/26` · `headline 24/30`. Peso 500 en botones y 600 en títulos.
- **z-index**: `base 0` · `sticky 10` · `dropdown 20` · `overlay 30` · `modal 40` · `toast 50` · `print-hidden -1`.
- **Puntos de ruptura**: `compact < 600` · `medium 600–1023` · `expanded ≥ 1024`. Para las tarjetas, *container queries* sobre `.command-sheet`.

### 4.4 Componentes canónicos

| Componente | Sustituye a | Notas |
|---|---|---|
| `.app-bar` (cristal 1) | `.toolbar`, `.ui31-dock`, `.ui31-card`, `.jaom-*` | Identidad + chip de estado + acciones principales + botón «Comandos». |
| `.status-chip` | `#state`, `#session-strip`, chip «Viewing» | Un único estado con popover de detalle. |
| `.command-sheet` + `.tile` | `.ui31-glass`, `.ui32-tile`, `.ui32-grid`, `.ui33-lane`, `.wb24-group` | Rejilla de 12 columnas y tarjetas tonales. |
| `.edit-ribbon` | `.ribbon`, `.tabs`, `.panel`, `.group`, `.ph2-mini` | Una fila con desbordamiento. Solo en edición. |
| `.side-panel` | `.navigator`, `.side-tabs`, `#sideContent` | Pestañas con `data-panel`. |
| `.studio-dialog` | `.command-dialog`, `.table-studio-v26`, `.layout-studio-v27`, `.replace-studio-v21`, `.image-library-v23`, `.structure-v25`, `.review-workspace-v22`, `.save-receipt`, `.wb24-palette`, `#p42-print` | Familia común (D-12). |
| `.history-studio` | `#historyStudio.history-v20…v71`, `.h20-*`, `.h37-*`, `.h38-*`, `.h41-*`, `.h59-*`, `.h72-*` | Selectores de una clase. |
| `.toast-region` | `.toast` | `aria-live="polite"`, apilado y sin tapar acciones. |
| `.btn` `--filled/--tonal/--text/--danger` | botones sueltos | Capas de estado (hover 8 %, pressed 12 %) y foco visible. |

### 4.5 Disposición recomendada (escritorio) — *requiere aprobación*

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◆ SOPHIA · Recepción de materias primas  [V1.2-d3 · Borrador] (● Solo lectura)│  ← app-bar (glass-1, 56px)
│                                [Leer|Editar]  Historial  Imprimir  ⌘ Comandos │
├──────────────┬───────────────────────────────────────────────────────────────┤
│ Esquema      │                 ┌───────────── folio A4 ─────────────┐        │
│ Imágenes     │                 │ logo · clasificación               │        │
│ Checks (3)   │                 │ tabla de identidad                 │        │
│ Versiones    │                 │ 1. Alcance …                       │        │
│ (side-panel) │                 │                                    │        │
└──────────────┴───────────────────────────────────────────────────────────────┘
En edición: debajo de la app-bar aparece la edit-ribbon (48px, una fila):
[Estilo ▾] [B I U] [• 1.] [Alinear ▾] [Tabla] [Imagen] [Enlace] [⋯]      [Guardar borrador]
«⌘ Comandos» abre la command-sheet (glass-2) con tiles bento:
┌ Documento ┐┌ Revisar ┐┌ Recursos ┐┌ Salida ┐┌ Guardar y publicar ┐
```

### 4.6 Accesibilidad (obligatorio)
- `<header class="app-bar">`, `<nav class="side-panel">` y `<main id="document">`. Título del documento en `h1`.
- Contraste ≥ 4,5:1 para el texto, también sobre cristal en el peor caso (texto negro del folio desplazándose debajo).
- Foco visible: `outline: 2px solid var(--jaom-focus); outline-offset: 2px`, también en botones tonales.
- Objetivos táctiles ≥ 40 px (44 px en `pointer: coarse`).
- Ningún dato se comunica solo por color: el chip de estado lleva icono y texto, y el historial, etiqueta además del color.
- Conservar el foco de origen de los diálogos (ya existe) y el orden de tabulación igual al orden visual.

### 4.7 Folio e impresión (regla de oro)
- El folio solo usa tokens de **perfil** (`--paper-*`), nunca de la app.
- La impresión **solo** muestra `#document`, con pie controlado (M-10) y marca de agua de borrador.
- La interfaz no puede añadir reglas que afecten a `@media print`, salvo `display:none` de sí misma en `@layer print`.

### 4.8 Qué hacer y qué no (para Copilot)

**Hacer:**
- usar tokens `var(--jaom-*)`;
- usar un componente canónico existente antes de crear otro;
- usar `@layer components`;
- usar *container queries* para el bento;
- probar con lienzo oscuro y claro, a 390, 1024 y 1440 px, e imprimir.

**No hacer:**
- `!important`;
- colores hexadecimales nuevos;
- clases con sufijo de versión (`-v73`, `ui37`);
- selectores con `#id.clase.clase.clase`;
- `backdrop-filter` en diálogos o en el folio;
- CSS de la app que seleccione `.sheet`, `.pagecontent` o `.identity`;
- calcular anchos por número de botones (el contrato ya lo dice: mantenerlo).

---

## 5. Plan de migración del CSS (sin romper nada)

1. **Capa heredada**: envuelve **todos** los `<style>` actuales, salvo el CSS del folio, en `@layer legacy { … }`.
   - Ojo: con `!important`, las capas **anteriores** ganan. Por eso, cada vez que una regla nueva choque con un `!important` heredado, **borra** la regla heredada en lugar de añadir otro `!important`.
2. Declara el orden: `@layer reset, tokens, legacy, base, paper, app, components, utilities, overrides, print;`.
3. Añade `tokens/jaom-tokens.css` como `<style id="sophia-tokens">` en `@layer tokens`.
4. Migra por componentes en este orden:
   1. `print`, que arregla C-01;
   2. `.status-chip`;
   3. `.app-bar`;
   4. `.studio-dialog`;
   5. `.command-sheet` y `.tile`;
   6. `.edit-ribbon`;
   7. `.side-panel`;
   8. `.history-studio`.

   Por cada componente:
   - crea el CSS nuevo en `@layer components` usando tokens;
   - cambia el marcado o JS para usar la clase canónica (conservando atributos `data-*` y ARIA);
   - borra las reglas heredadas del componente (búsqueda por las clases antiguas de la tabla 4.4);
   - ejecuta los tests y las capturas.
5. Al terminar, la capa `legacy` debe quedar vacía y se elimina.
6. **Métrica de salida**: 0 `!important` fuera de `print` y `overrides`, ≤ 60 colores literales (todos en tokens) y 0 clases con versión.
