# Diseño gráfico, campañas multiformato y estilo propio (no genérico) con Claude y conectores de diseño — estado a 23 de noviembre de 2026

> Notas de investigación para el redactor final. Idioma: español (creador en España). Se conservan literales los nombres de producto, comandos, nombres de herramientas MCP y URLs.
> Fuentes: páginas de Anthropic/Claude (anthropic.com, claude.com, support.claude.com), repositorio `anthropics/skills`, fichas de conectores en claude.com, documentación de fabricantes (Netlify, Metricool, Buffer, Figma, Higgsfield, Adobe, Canva) y prensa/blogs.
> **Limitación de red durante la investigación:** no se pudieron abrir blog.adobe.com, www.canva.com, venturebeat.com, kite.new, developers.figma.com ni higgsfield.ai (el host no resolvía en la sesión). Lo que viene de esos dominios procede de fragmentos del buscador y se marca así.
> **Observación de primera mano:** varias afirmaciones vienen de los *esquemas de herramientas MCP* de los conectores que el usuario ya tiene instalados (Figma, Gamma, Netlify, Lucid, Higgsfield, Metricool, Descript) y de los ficheros `SKILL.md` de los plugins instalados (adobe-for-creativity, postiz, small-business/canva-creator, theme-factory). Se citan como "esquema MCP observado en la cuenta (23-nov-2026)". No tienen URL pública; son la descripción oficial que cada fabricante envía a Claude.

---

## 1. Claude Design: qué es, cómo se accede, capacidades, exportaciones, límites y planes

### Takeaway
Claude Design es un producto de Anthropic Labs lanzado el 17-abr-2026 (research preview, Opus 4.7) para crear diseños, prototipos, slides, one-pagers y piezas de marketing conversando con Claude, con sistemas de diseño de marca leídos de tu código/ficheros. Tras una gran actualización el 17-jun-2026 y su integración en cualquier conversación (sept-2026), **la web independiente claude.ai/design cierra el 14-dic-2026**: a partir de ahí los diseños, sistemas de diseño y decks viven como *artifacts* dentro de Claude. Exporta a PDF, PPTX, HTML/zip y envía a Canva, Adobe (Express), Gamma, Netlify, Miro, Vercel, Wix, Lovable, Replit y Base44, además de traspaso a Claude Code.

### Cited Findings

**Lanzamiento y definición (abril 2026)**
- Lanzado el 17-abr-2026 como nuevo producto de Anthropic Labs, en *research preview*, con despliegue gradual; "lets you collaborate with Claude to create polished visual work"; funciona con Claude Opus 4.7, "most capable vision model" — [Anthropic: Introducing Claude Design by Anthropic Labs](https://www.anthropic.com/news/claude-design-anthropic-labs); confirmado por [TechCrunch, 17-abr-2026](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/) y [Fast Company](https://www.fastcompany.com/91528198/anthropic-claude-design-ai-design-tool).
- Salidas declaradas en el lanzamiento: diseños, prototipos, slides, one-pagers; prototipos interactivos a partir de mockups estáticos; wireframes y flujos de producto; exploraciones en varias direcciones; pitch decks; **"marketing collateral such as landing pages, social assets, and campaign visuals"**; y "frontier design" (prototipos con voz, vídeo, shaders, 3D e IA integrada) — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).
- Sistema de diseño: en el onboarding Claude construye el sistema de diseño del equipo leyendo el codebase y los ficheros de diseño, y aplica colores, tipografía y componentes automáticamente a proyectos nuevos; se puede refinar y un equipo puede mantener más de uno — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).
- Entradas: prompt de texto, imágenes y documentos (DOCX, PPTX, XLSX), el codebase y una herramienta de *web capture* que toma elementos de tu web — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).
- Edición: comentarios inline sobre elementos, edición directa de texto, controles de espaciado/color/layout y **"custom sliders made by Claude"**, y cambios aplicados a todo el diseño — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).
- Exportación en el lanzamiento: URL interna de la organización, carpeta, **Canva, PDF, PPTX y HTML standalone**; "handoff bundle" que se pasa a Claude Code con una sola instrucción — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).
- Planes en el lanzamiento: Pro, Max, Team y Enterprise; consume los límites de la suscripción (ampliable con *extra usage*); en Enterprise viene desactivado por defecto y lo activa un admin — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).
- Citas de clientes: Canva (Melanie Perkins) — los borradores de Claude Design "instantly become fully editable and collaborative designs" en Canva; Brilliant — páginas complejas que "required 2 prompts in Claude Design" frente a 20+ en otras herramientas; Datadog — de idea a prototipo en una conversación — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).
- Anthropic lo posiciona como complemento de Canva, no sustituto — [resumen de resultados de búsqueda sobre TechCrunch/Fast Company](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/).
- Más de un millón de personas lo usaron la primera semana — [Claude: "Claude Design now stays on brand for daily work"](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).

**Gran actualización del 17-jun-2026**
- Importación de uno o varios sistemas de diseño desde **un repo de GitHub, ficheros de diseño o subidas**; Claude "builds with your components, checks its output against your design system, and makes corrections before you see it"; nuevo rol de admin que puede "approve one standard system and lock down edits" — [Claude (17-jun-2026)](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- Comandos: `/design-sync` trae tu sistema de diseño para que el trabajo nuevo parta de componentes existentes; `/design` en Claude Code (desktop o terminal) crea, edita y sincroniza proyectos de diseño; el handoff a Claude Code continúa el trabajo existente en vez de partir de una captura — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work); también [TechRepublic](https://techrepublic.com/article/news-anthropic-claude-design-overhaul-enterprise-teams), [PureAI, 17-jun-2026](https://pureai.com/articles/2026/06/17/anthropic-overhauls-claude-design.aspx).
- Editor: arrastrar, redimensionar y alinear elementos individuales; "hundreds of stability fixes" — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- **Exportación y conectores tras junio:** PDF, PowerPoint o HTML; conectores listados: **Adobe, Base44, Canva, Gamma, Lovable, Miro, Replit, Vercel y Wix** (Wix vía Wix Headless; Adobe vía el conector Adobe for creativity → Adobe Express). Ejemplos: posts sociales, presentaciones y flyers terminados en Adobe Express; decks que pasan a Gamma "fully editable"; Tenex usa Claude Design para direcciones de web, brand assets y presentaciones — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- Uso/tokens: Claude Design pasa a compartir el pool de uso con chat, Cowork y Claude Code (antes tenía una asignación aparte, más pequeña) — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work); críticas: un diseñador citado por TechRepublic dice "Token usage is expensive, and Claude Design uses a lot… Many times, it takes longer than designing a component or changing that detail yourself" — [TechRepublic](https://techrepublic.com/article/news-anthropic-claude-design-overhaul-enterprise-teams); UX Planet considera resuelto el problema de tokens pero no la edición ni la sincronización bidireccional del design system — [UX Planet](https://uxplanet.org/claude-design-just-got-a-major-update-270ad55087f3).

**Septiembre–diciembre 2026: integración en Claude y cierre de la web independiente**
- Actualización de septiembre 2026: funciona dentro de cualquier conversación (incluido Claude Code y la pestaña Artifacts), en beta en planes de pago; los slide decks tienen su propio punto de partida en **Claude Slides** — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- Activado por defecto en Pro, Max, Ultra y Team; desactivado por defecto en Enterprise (admin: *Organization settings > Artifacts*); acceso desde cualquier conversación, la pestaña Artifacts o claude.ai/design — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- **La web independiente claude.ai/design cierra el 14-dic-2026**; los nuevos diseños, design systems y slide decks se crean como *artifacts*; Claude Design depende de artifacts (si la organización los tiene apagados, no se puede diseñar ni mover nada) — [Claude Help Center: Move from standalone Claude Design to Claude](https://support.claude.com/en/articles/17440474-move-from-standalone-claude-design-to-claude.md).
- Migración: solo el propietario mueve un proyecto (pop-up o banner → revisar → confirmar → se abre como artifact); "Move everything" desde la página Artifacts (Owner/Primary Owner); la copia en la web independiente queda **solo lectura de forma irreversible**; **chats y comentarios no se migran** y se borran tras el cierre; la página Artifacts lista hasta 60 proyectos independientes — [Claude Help Center](https://support.claude.com/en/articles/17440474-move-from-standalone-claude-design-to-claude.md).
- Exportar un proyecto: abrir → "Share" → "Project HTML" (en decks, bajo "More formats and apps") → mantener "Project archive" → "Export" → .zip; **las exportaciones son gratis y no cuentan para los límites**; los enlaces públicos temporales caducan en ~1 hora, los publicados con "Publish as artifact" siguen funcionando — [Claude Help Center](https://support.claude.com/en/articles/17440474-move-from-standalone-claude-design-to-claude.md).
- Planes según el Help Center: "Free, Pro, Max, Ultra, Team, and Enterprise" — [Claude Help Center](https://support.claude.com/en/articles/17440474-move-from-standalone-claude-design-to-claude.md); **contradicción**: la página de producto de claude.com dice "beta on paid plans" — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work). Una guía de terceros afirma que es "free on every plan" — [noxi.ai](https://noxi.ai/blog/claude-design).
- Fechas de terceros no verificadas: integración en todas las conversaciones el 16-sep-2026 y Enterprise activado por defecto desde el 15-oct-2026 ([resumen de búsqueda; wmedia/talkthinkdo](https://talkthinkdo.com/blog/claude-design-after-14-december/)); actualización del 8-oct con "live dashboards and animated video" ([resumen de búsqueda](https://taku.ai/blog/claude-design)).

**Destinos "Send to" observados en la cuenta del usuario**
- Netlify: la herramienta `import-claude-design-from-url` se describe como **"the 'Send to Netlify' destination for Claude Design"**: toma una URL pública a un bundle HTML autocontenido (imágenes, fuentes y estilos inline), crea un sitio Netlify, despliega y devuelve URL en vivo; acepta `claude_design_project_id` para actualizar el mismo sitio al reenviar y `password` opcional — esquema MCP observado en la cuenta (23-nov-2026). Netlify documenta también la vía manual: exportar zip, descomprimir y arrastrar a Netlify Drop (requiere `index.html` en la raíz) — [Netlify KB](https://www.netlify.com/knowledge-base/deploy-your-claude-artifacts-to-netlify/).
- Gamma: `import-claude-design-from-url` importa un bundle HTML autocontenido; la URL es válida ~1 hora; la importación corre en segundo plano y devuelve `gammaUrl` — esquema MCP observado en la cuenta.
- Lucid: `import-claude-board-from-url` importa un **"Claude Whiteboard board"** (URL caduca en 10 minutos; usa `download_token`) — esquema MCP observado. (Indica un producto/plantilla "Claude Whiteboard"; no encontré fuente pública sobre él.)
- Descript: `import-claude-motion-from-url` importa un MP4 de **"Claude Motion"** a un proyecto Descript — esquema MCP observado (relevante para covers/reels animados; sin fuente pública encontrada).

### Inferences
- Para un creador en noviembre de 2026, la recomendación práctica es trabajar ya en Claude (artifacts de Design / Design System / Slides) y **descargar los .zip de lo que quede en claude.ai/design antes del 14-dic-2026**, guardando aparte los chats/comentarios útiles (no se migran).
- El flujo "Claude Design → Send to Canva/Adobe Express/Gamma" es la vía para que las piezas queden **editables** por humanos; Netlify/Vercel/Wix sirven para landing pages de campaña.
- La disparidad sobre el plan Free sugiere comprobar en la propia cuenta; para uso intensivo (campañas completas) el consumo de tokens es el cuello de botella citado por diseñadores.

### Gaps
- No encontré documentación oficial con límites cuantitativos (nº de diseños, resolución máxima de exportación PNG/PDF, soporte CMYK/sangrado) de Claude Design.
- No pude abrir la cobertura de VentureBeat ni kite.new (bloqueados en la sesión); la lista "Hyperframes, HubSpot, v0, Netlify" como destinos solo aparece en terceros.
- "Claude Whiteboard" y "Claude Motion" solo aparecen en esquemas de conectores; sin anuncio público localizado.

---

## 2. Artifacts para diseño (HTML/SVG, skills canvas-design y frontend-design) y exportación a PNG/PDF para imprenta

### Takeaway
Fuera de Claude Design, Claude puede producir pósters y piezas como artifacts HTML/SVG o, con la skill **canvas-design**, como PNG/PDF de una página guiados por una "filosofía de diseño" escrita primero. La skill **frontend-design** (reescrita en 2026) es la principal defensa oficial contra la estética genérica. Para impresión real (CMYK, sangrado, 300 ppp) conviene terminar en Adobe Express/InDesign vía conector; no hay fuente oficial que garantice salida de imprenta desde artifacts.

### Cited Findings
- **canvas-design** (repo oficial `anthropics/skills`): proceso en dos pasos — (1) "Design Philosophy" en .md con un nombre de movimiento de 1–2 palabras y "4-6 paragraphs" sobre espacio, color, escala y composición; (2) "Canvas Expression" en .pdf o .png con "90% visual design, 10% essential text"; antes de pintar, buscar "a subtle, niche reference embedded within the art itself" — [SKILL.md canvas-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/canvas-design/SKILL.md).
- canvas-design: ejemplos de movimientos "Brutalist Joy", "Chromatic Silence", "Metabolist Dreams", "Concrete Poetry", "Analog Meditation", "Organic Systems", "Geometric Silence"; salida "only .md files, .pdf files, and .png files"; por defecto una sola página; fuentes desde el directorio `./canvas-fonts` (y descargar las que falten); "Most of the time, font should be thin"; nada puede salirse ni solaparse; refinamiento final: "Avoid adding more graphics; instead refine what has been created"; multipágina solo si se pide, como "coffee table book"; nunca copiar obra de artistas existentes — [SKILL.md canvas-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/canvas-design/SKILL.md).
- **frontend-design** (versión actual del repo): primero identificar el sujeto — su "industry, subject matter, materials, and vernacular are where distinctive visual choices come from"; dos pasadas: plan compacto (4–6 colores hex con nombre, roles tipográficos, layout con wireframes ASCII, principios) → revisarlo contra el brief y **reescribir todo lo que lea como default genérico** → construir; "Spend your boldness in one place"; revisar con capturas y quitar un elemento (consejo de Chanel) — [SKILL.md frontend-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md).
- La reescritura de frontend-design se fecha el 18-jun (commit 423563cf) según un post de DEV que dice que nombra tres clichés con códigos hex — [DEV Community](https://dev.to/kenimo49/anthropic-rewrote-frontend-design-skill-3-ai-design-cliches-named-with-hex-codes-22m4) (secundario; el contenido actual del SKILL.md confirma la lista de clichés con hex, ver sección 4).
- Instalación: plugin `frontend-design` en `anthropics/claude-code` (`plugins/frontend-design`); notebook de estética en `anthropics/claude-cookbooks`; `skill-creator` en `anthropics/skills` para crear skills propias; en claude.ai se activa la skill y se pide "use the web-artifacts-builder skill" — [Claude blog: Improving frontend design through Skills](https://claude.com/blog/improving-frontend-design-through-skills).
- **theme-factory** (skill de ejemplo de Anthropic): 10 temas predefinidos con paleta hex y pareja tipográfica (Ocean Depths, Sunset Boulevard, Forest Canopy, Modern Minimalist, Golden Hour, Arctic Frost, Desert Rose, Tech Innovation, Botanical Garden, Midnight Galaxy) o un tema nuevo generado al vuelo; flujo: mostrar `theme-showcase.pdf`, pedir elección, aplicar — `SKILL.md` theme-factory observado en la cuenta; ficha pública: [mcpservers.org/theme-factory](https://mcpservers.org/claude-skills/anthropic/theme-factory).
- **brand-guidelines** (skill de ejemplo): aplica la identidad de Anthropic (#141413, #faf9f5, #b0aea5, #e8e6dc; Poppins y Lora recomendadas) — [skills.sh/anthropics/skills/brand-guidelines](https://www.skills.sh/anthropics/skills/brand-guidelines). Útil como **plantilla** para escribir la skill de tu propia marca.
- El artifact de Claude se puede desplegar en Netlify (zip → Netlify Drop) — [Netlify KB](https://www.netlify.com/knowledge-base/deploy-your-claude-artifacts-to-netlify/).
- Para imprenta: el conector Adobe incluye InDesign y herramientas como `convert_pdf_to_indd` — [ficha del conector Adobe en claude.com](https://claude.com/connectors/adobe-creativity); la skill `adobe-resize-photos-and-videos` se activa con "resize for print", "make it 300 DPI ready", tamaños con nombre como "A4" — `SKILL.md` del plugin adobe-for-creativity observado en la cuenta.

### Inferences
- Píxeles para imprenta a 300 ppp (cálculo propio: mm ÷ 25,4 × 300): A4 2480×3508 px; A3 3508×4961 px; A2 4961×7016 px; cartel 50×70 cm 5906×8268 px. Añadir 3 mm de sangrado por lado (≈35 px a 300 ppp).
- Un artifact HTML/SVG se puede rasterizar a alta resolución con Chromium headless (p. ej. Playwright `deviceScaleFactor: 2–4` o `page.pdf()` con tamaño A3), pero el navegador produce RGB; la conversión a CMYK con perfil (FOGRA39/ISO Coated v2 en España) debe hacerse en InDesign/Acrobat/Illustrator o en la imprenta. SVG/PDF vectorial es preferible para tipografía.
- canvas-design es la mejor opción "artística" (póster de autor); frontend-design es la mejor para piezas tipo web/landing/plantillas HTML parametrizables que luego se exportan a cada formato.

### Gaps
- No hay documentación oficial de resolución máxima ni de PDF/X o CMYK para artifacts ni Claude Design.
- No verifiqué el contenido exacto de `./canvas-fonts` (qué familias incluye).

---

## 3. Conectores de diseño utilizables desde Claude: qué hace realmente cada uno y cómo se configuran

### Takeaway
El usuario ya tiene Figma, Gamma, Higgsfield, Adobe (for creativity), Canva (vía plugin), Netlify, Lucid, Descript y Metricool. Cada uno cubre un tramo: **Figma** = sistema de diseño, maquetas móviles, generación de imagen/shaders/vídeo de animación; **Canva** = piezas editables y plantillas de marca (funciones de marca/resize según plan); **Adobe** = foto, variaciones sociales con recorte inteligente/expansión generativa, Adobe Fonts, Express/InDesign; **Gamma** = posts sociales, carruseles, decks y imágenes con tema de marca; **Higgsfield** = imagen/vídeo generativo, Marketing Studio (pósters, UGC, producto), reencuadre de vídeo y publicación en TikTok/Meta Ads.

### Cited Findings

**Configuración general en Claude**
- Conectores remotos: Claude → *Customize > Connectors* → añadir (o "Add custom connector" con la URL) → iniciar sesión en el servicio — [ficha Canva en claude.com](https://claude.com/connectors/canva); [Buffer: How to Post on Social Media from Claude](https://buffer.com/resources/how-to-post-on-social-media-from-claude/); [Higgsfield Help Center (fragmento)](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent).
- Usuarios Free solo pueden usar un conector personalizado a la vez — [Metricool (fragmento de búsqueda)](https://metricool.com/metricool-claude-mcp-guide/).

**Figma (MCP oficial)**
- `use_figma` escribe en ficheros Figma a través de la Plugin API (estructura real, no capturas); **escribir requiere asiento Full**, los asientos Dev son solo lectura; "write to canvas" está en **beta** y pasará a ser función de pago por uso — [Figma Help: Write to canvas](https://help.figma.com/hc/en-us/articles/42495251338775-Write-to-canvas); [Figma MCP FAQs](https://help.figma.com/hc/en-us/articles/39252411778583-Figma-MCP-server-FAQs) (vía resultados de búsqueda; developers.figma.com no accesible en la sesión).
- `use_figma` no puede añadir imágenes nuevas: se usa `upload_assets` y, para crear una imagen, `generate_image`, que consume créditos de Figma AI según el plan del fichero destino y el modelo — [Figma Help: Write to canvas](https://help.figma.com/hc/en-us/articles/42495251338775-Write-to-canvas).
- `generate_image` (esquema observado): coloca una imagen raster directamente en un fichero Design/FigJam/Slides; modelos `gpt-image-2.5-flare` (por defecto), `gpt-image-2.5-sunburst`, `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`; tamaño máx. 2048 px por lado (el modelo elige la relación de aspecto soportada más cercana); puede reemplazar el relleno de imagen de un nodo existente sin redimensionarlo — esquema MCP observado en la cuenta.
- `export_video` (esquema observado): exporta la animación por keyframes de un frame de nivel superior como **MP4** (no GIF ni SVG animado), 5–60 fps, escala hasta 10x / 4096 px por lado, calidad low/medium/high — esquema MCP observado. Útil para covers animados y stories con motion.
- `create_shader` / `update_shader`: shaders "effect" (transforman la capa de debajo) o "fill" (generan píxeles) en la librería del usuario; requiere cargar la skill `figma-shaders` — esquema MCP observado. Fuente de texturas/grano/patrones propios.
- Weave: `weave_find_model`, `weave_run_model` (ejecuta modelos de IA de Weave; gasta créditos Weave y exige confirmación explícita de coste), `weave_run_tool` — esquema MCP observado. Figma compró Weavy y lo renombró **Figma Weave**: canvas por nodos con "every major AI model—image, video, audio, and 3D"; imagen→vídeo con Kling, Runway, Luma y Wan — [Figma blog: Figma Weave](https://www.figma.com/blog/figma-weave/); [TechRadar](https://www.techradar.com/pro/software-services/figma-boosts-its-ai-editing-tools-as-it-combines-forces-with-popular-ai-platform-weavy?rand=75697).
- Otras herramientas presentes: `generate_vector_illustration`, `search_design_system`, `get_variable_defs`, `get_libraries`, `create_new_file`, `create_session`, generative plugins — lista de herramientas observada; skills del plugin Figma instaladas: `figma-generate-design`, `figma-generate-library`, `figma-use`, `figma-use-motion`, `figma-shaders`, `figma-swiftui`, `figma-use-slides`, `figma-3d-transforms` — observado en la cuenta. Guía oficial: [github.com/figma/mcp-server-guide](https://github.com/figma/mcp-server-guide).

**Canva**
- Conector oficial de Canva (servidor MCP) en `https://mcp.canva.com/mcp`, "Anthropic verified", añadido en noviembre de 2025; 17 herramientas: `search-designs`, `get-design`, `get-design-pages`, `get-design-content`, `import-design-from-url`, `export-design`, `get-export-formats`, `create-folder`, `move-item-to-folder`, `add-comment-thread-to-design`, **`generate-design`**, `get-design-generation-job`, etc. — [ficha Canva en claude.com](https://claude.com/connectors/canva).
- Planes (contradictorio): la ayuda de Canva indica que **resize solo en planes de pago** y que **autofill y Brand Templates solo en Enterprise**; otras fuentes dicen que kits de marca y resize requieren Pro o superior con prueba limitada en Free; todas las cuentas de Canva (incl. Free) pueden conectarse — [Canva Help: MCP usage (fragmento)](https://www.canva.com/en_in/help/mcp-canva-usage/); [Build to Launch](https://buildtolaunch.substack.com/p/claude-canva-mcp-free-plan-guide); [Canva AI connector](https://www.canva.com/en_in/ai-connector/).
- La skill `canva-creator` (plugin small-business) indica: "Pro/Teams require manual template selection from the user's library (no autofill API). Enterprise can autofill from brand templates." y usa Canva solo para posts sociales (IG, FB, X, LinkedIn) — `SKILL.md` observado en la cuenta.
- Claude Design exporta a Canva como diseño editable — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).

**Adobe (antes "Adobe for creativity")**
- Lanzado el 28-abr-2026, disponible globalmente; 50+ herramientas en Photoshop, Firefly y Express según el anuncio — [Adobe Blog (fragmento)](https://blog.adobe.com/en/publish/2026/04/28/adobe-for-creativity-connector); [PetaPixel, 28-abr-2026](https://petapixel.com/2026/04/28/claude-ai-can-orchestrate-creative-workflows-across-adobe-apps/).
- Ficha actual en claude.com: URL `https://adobe-creativity.adobe.io/mcp`; apps: **Acrobat, Photoshop, Lightroom, Illustrator, Firefly, Premiere, Adobe Express, InDesign y Stock**; **109 herramientas** (p. ej. `animate_design`, `asset_search`, `change_background_color`, `convert_pdf_to_indd`, `create_firefly_board`); capacidades: plantillas de marketing personalizables en editor en vivo, edición de fotos individual o masiva, "Resize and crop images for social platforms", redimensionado de vídeo — [claude.com/connectors/adobe-creativity](https://claude.com/connectors/adobe-creativity).
- Renombrado a "Adobe" con nuevas capacidades de creatividad y productividad; las capacidades de Express no están disponibles para cuentas enterprise; iniciar sesión con Adobe ID amplía límites y guarda trabajo entre sesiones — [Adobe Help: Adobe for Claude (fragmento)](https://helpx.adobe.com/creative-cloud/apps/integration-with-other-apps/adobe-connectors/adobe-for-claude.html).
- Diseños de Claude se abren en Express como documentos nativos editables (texto, imágenes, layout) — [Adobe Express blog (fragmento)](https://www.adobe.com/express/learn/blog/adobe-creativity-connector).
- Skills del plugin instalado: `adobe-create-social-variations` (v2.1.0) — de un único archivo genera assets para Instagram, TikTok, LinkedIn, Facebook, YouTube, Snapchat, Pinterest, Threads y X con **recorte consciente del sujeto y expansión generativa de lienzo** (`image_generative_expand`), con vista previa de 3 recortes antes del lote; vídeo: solo redimensionado, sin reencuadre inteligente; `adobe-fonts` — `font_recommend`, `font_search`, `font_details`, `font_styles`, `font_preview`, con la regla de que solo se proponen fuentes reales y licenciables de Adobe Fonts devueltas por la herramienta; además `adobe-resize-photos-and-videos`, `adobe-edit-quick-cut`, `adobe-design-from-template`, `adobe-design-to-pdf`, `adobe-batch-edit-photos`, `adobe-retouch-portraits`, `adobe-create-pdfs-from-data` — `SKILL.md` del plugin observados en la cuenta.

**Gamma**
- Ficha: crea presentaciones, documentos, **posts sociales** y webs desde Claude; exporta a PDF o PPTX — [claude.com/marketplace/connectors/gamma](https://claude.com/de/marketplace/connectors/gamma).
- Esquema observado de `generate`: `format` = presentation | document | social | webpage; `cardOptions.dimensions` incluye **`1x1`, `4x5`, `9x16`**, 16x9, A4, letter…; `exportAs` pptx | pdf | **png (ZIP con un PNG por tarjeta; enlace caduca ~1 semana)**; `themeId` (temas personalizados de marca) o el nombre de la marca en `additionalInstructions`; `imageOptions.model` con decenas de modelos (p. ej. `recraft-v4-svg`, `ideogram-v3-quality`, `flux-2-pro`, `gpt-image-2-hd`, `gemini-3-pro-image-hd`) y `stylePreset` o `style` personalizado — esquema MCP observado.
- `generate_image` (observado): imagen independiente con `sizePreset` social-square (1:1), social-portrait (4:5), story (9:16), banner/slide (16:9); `themeId` para marca; hasta 4 `referenceImages` de sujeto (personaje o producto) — esquema MCP observado. (Un resultado de búsqueda decía que no existía; el esquema real del usuario lo confirma.)
- Gamma no publica directamente en Instagram (exportar PNG y subir); LinkedIn sí admite compartir directo — [Gamma guide](https://gamma.app/explore/content/guides/using-ai-for-social-media-to-generate-high-quality-graphics).

**Higgsfield**
- Conexión: conector personalizado con la URL del MCP de Higgsfield e inicio de sesión (sin API key); requiere suscripción activa; cada generación consume créditos — [Higgsfield Help Center (fragmento)](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent); [mcp.directory guide](https://mcp.directory/blog/higgsfield-mcp-guide).
- `show_marketing_studio_v2` abre la galería de Marketing Studio con pestañas **ugc, product-shot, motion, posters, ads, marketplace** (el usuario elige preset y sube su imagen de producto) — esquema MCP observado. (Hay contradicción en la web de Higgsfield sobre si Marketing Studio produce estáticos — [help center](https://higgsfield.ai/creator-hub/help-center/tools-and-workflows/how-do-i-use-marketing-studio-to-create-video-ads); el esquema actual sí lista "posters".)
- Instrucciones del servidor (observadas): `generate_image` por defecto con `gpt_image_2_6`, salida nativa GIF/SVG; `reframe` reencuadra vídeo a 16:9, 9:16, 4:3, **3:4**, 1:1, 21:9 (hasta 60 s, 480p–1080p) — esquema MCP observado.
- Soul ID = capa de consistencia de personaje de los modelos Soul; entrenar y generar requiere plan de pago; Marketing Studio genera anuncios desde la URL de un producto y Soul ID es opcional para mantener el mismo presentador — [Higgsfield Help: Soul ID (fragmento)](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-create-and-use-a-soul-id-character); [Higgsfield Marketing Studio](https://higgsfield.ai/marketing-studio-intro). Una fuente externa dice que Soul ID solo maneja caras humanas — [Creatify](https://creatify.ai/blog/higgsfield-soul-prompts-for-product-ads).
- Herramientas adicionales en la cuenta: `manage_reference_elements`/`show_reference_elements` (referencias reutilizables), `virality_predictor`, `outpaint_image`, `upscale_image`, `remove_background`, `tiktok_connect`/`tiktok_prepare_publish`/`tiktok_publish_status`, `meta_ads_connect`/`meta_ads_read`/`meta_ads_write`, `ads_studio_*` (marcas, productos, avatares) — lista de herramientas observada en la cuenta.

### Inferences
- Reparto recomendado: Figma = "fuente de verdad" del sistema (variables, componentes, plantillas maestras por formato); Claude Design/artifacts = exploración y piezas rápidas; Adobe = fotografía y adaptación a formatos con expansión generativa; Canva/Express = edición final por humanos y plantillas compartidas; Gamma = carruseles y decks rápidos con tema de marca; Higgsfield = imagen/vídeo generativo con personajes/productos consistentes y publicación.
- Con Canva en plan Pro (habitual en freelancers en España) no hay autofill por API: para variación por datos es más práctico HTML parametrizado o Adobe `create-pdfs-from-data`.

### Gaps
- No pude leer la documentación de herramientas de Figma (developers.figma.com bloqueado) para confirmar precios de write-to-canvas ni la relación oficial MCP↔Weave.
- No verifiqué precios/créditos actuales de Higgsfield ni de Gamma.
- No encontré confirmación oficial de herramientas de brand kit/resize en el MCP de Canva (no aparecen en la ficha de claude.com).

---

## 4. Por qué el diseño con IA parece genérico ("AI slop") y contramedidas concretas (con plantillas de prompt)

### Takeaway
Anthropic lo llama **convergencia distribucional**: sin dirección, el modelo cae en el "centro de alta probabilidad" (Inter/Roboto, degradados morados sobre blanco, tarjetas centradas, fondos planos). La versión 2026 de frontend-design va más allá y prohíbe también los "nuevos clichés" que la propia IA popularizó (crema + terracota, negro con un acento ácido, estilo periódico, kit de tarjetas SaaS, etiquetas en mayúsculas espaciadas y flechas →). La contramedida es un brief de dirección de arte específico del sujeto, con paleta hex cerrada, tipografía decidida, una sola "audacia", referencias selectivas y lista explícita de prohibiciones.

### Cited Findings
- Causa: "During sampling, models predict tokens based on statistical patterns in training data"; las elecciones seguras dominan, así que sin dirección Claude tiende al medio genérico — [Claude blog: Improving frontend design through Skills](https://claude.com/blog/improving-frontend-design-through-skills); el cookbook lo llama tendencia a outputs "on distribution", el estética "AI slop" — [Claude Cookbook: prompting for frontend aesthetics](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics).
- Qué evitar (2025–26): fuentes Inter, Roboto, Arial, Open Sans, Lato y del sistema (y Space Grotesk, que se repite); degradados morados sobre blanco; fondos planos; layouts predecibles — [Claude blog](https://claude.com/blog/improving-frontend-design-through-skills).
- Bloque `<frontend_aesthetics>` (~400 tokens) para system prompt o CLAUDE.md: tipografía "beautiful, unique, and interesting"; comprometerse con una estética cohesiva usando variables CSS; colores dominantes con acentos marcados mejor que paletas repartidas; inspirarse en temas de IDE y estéticas culturales; motion concentrado ("one well-orchestrated page load with staggered reveals"); fondos con atmósfera (degradados en capas, patrones geométricos); variar temas claro/oscuro — [Claude blog](https://claude.com/blog/improving-frontend-design-through-skills); [Cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics).
- Tipos sugeridos: código (JetBrains Mono, Fira Code, Space Grotesk), editorial (Playfair Display, Crimson Pro), técnico (IBM Plex, Source Sans 3), distintivo (Bricolage Grotesque, Newsreader); contrastes display+mono o serif+geométrica; pesos extremos (100/200 vs 800/900) y saltos de tamaño de 3x o más; una fuente distintiva usada con decisión, cargada desde Google Fonts — [Claude blog](https://claude.com/blog/improving-frontend-design-through-skills).
- **Lista de clichés de la frontend-design actual** (con hex): crema y terracota (fondo ~#F4F1EA + serif de alto contraste + acento arcilla ~#D97757, "Anthropic's own interaction accent"); casi-negro con un único acento brillante (verde ácido o bermellón); estilo broadsheet (filetes finos, radio 0, columnas densas); kit de tarjetas SaaS (tarjetas redondeadas idénticas, sombra rgba(0,0,0,.1), degradados decorativos); "template chrome" (eyebrows en MAYÚSCULAS espaciadas, metadatos con punto medio, etiquetas "WORD — fragment", etiquetas monoespaciadas pequeñas, "→" en enlaces y botones); destacar una sola palabra del titular; fade-and-slide-up en cada sección; evitar casi-negros teñidos (#0B0B0B, #111) como negro — [SKILL.md frontend-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md).
- Método de la skill: el sujeto (industria, materiales, vernáculo) es la fuente de lo distintivo; plan con 4–6 hex con nombre y roles tipográficos; revisar el plan y sustituir lo genérico; "Spend your boldness in one place"; abrir con "the most characteristic thing in the subject's world"; escala tipográfica según *The Elements of Typographic Style*; líneas < 80 caracteres — [SKILL.md frontend-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md).
- canvas-design: nombrar un movimiento propio, escribir su filosofía y esconder una referencia de nicho; no copiar a artistas existentes — [SKILL.md canvas-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/canvas-design/SKILL.md).
- Prácticas de diseñadores: usar 2–3 referencias y decir qué atributo tomar de cada una (no replicar el look completo) — [UX Planet: 6 tricks to level up Claude Design](https://uxplanet.org/6-tricks-to-level-up-claude-design-7ed86375be49); [Tutkit: reference images](https://www.tutkit.com/en/text-tutorials/26531-claude-design-reference-images-screenshots-use-selectively); nombrar lo que no se quiere ("no stock-photo-style hero images", "no gradient overlays on text") y evitar objetivos vagos como "sophisticated and modern"; construir antes el design system — [MindStudio](https://www.mindstudio.ai/blog/claude-design-avoid-generic-ai-aesthetics); [MindStudio: design system sin estética IA](https://www.mindstudio.ai/blog/build-design-system-claude-design-no-ai-aesthetics); describir el ánimo con una referencia histórica concreta, p. ej. "minimalist and warm, like a Swiss magazine from the 70s" — [resultados de búsqueda; The Sublime](https://sublimeinternet.substack.com/p/how-to-create-a-distinct-visual-identity); criticar como diseñador: "What did Claude understand correctly? Which assumptions are wrong? What feels generic?" — [UX Planet](https://uxplanet.org/youre-using-claude-design-wrong-7a4c3b78a6d7); recopilación de trucos de la primera semana — [Muzli](https://muz.li/blog/claude-design-one-week-in-hacks-best-practices-tips-from-real-world-use/).
- Anthropic tiene un caso de uso oficial sobre elevar el diseño con skills — [claude.com use case](https://claude.com/resources/use-case/elevate-claudes-design-using-skills).
- Adobe Fonts vía conector garantiza fuentes reales y licenciables (evita "fuentes parecidas" inventadas) — `SKILL.md` adobe-fonts observado.

### Inferences
- **Plantilla de brief de dirección de arte** (síntesis de las fuentes anteriores; para pegar en Claude/Claude Design o guardar en la skill de marca):
  ```
  SUJETO Y VERNÁCULO: [qué es, para quién, materiales/oficios/lugares del mundo del sujeto, p. ej. "vermut de grifo en un bar de Lavapiés: azulejo, papel de estraza, rotulación a mano de pizarra"]
  MOVIMIENTO / REFERENCIAS: [1 movimiento + 2–3 referencias con el atributo concreto a tomar de cada una: "de Otl Aicher: retícula y pictogramas; de carteles risográficos: sobreimpresión de 2 tintas; de etiquetas de conservas portuguesas: marco ornamental"]
  PALETA (cerrada, 4–6 hex con nombre y rol): Fondo …, Tinta …, Acento …, Soporte … (prohibido añadir colores)
  TIPOGRAFÍA: Display [familia + peso extremo], Texto [familia], Escala [p. ej. 1:3 o más], reglas (sin mayúsculas espaciadas, sin destacar una sola palabra)
  RETÍCULA: [p. ej. 6 columnas, margen 64 px en 1080, línea base 8 px]; zonas seguras por formato
  TEXTURA / ACABADO: [grano 3–5 %, desregistro 1–2 px, papel, halftone] — una sola técnica
  LA ÚNICA AUDACIA: [dónde se gasta el riesgo: p. ej. titular gigante cortado por el borde]
  PROHIBIDO: Inter/Roboto/Arial/Space Grotesk, degradados morados, glassmorphism, emoji, tarjetas redondeadas con sombra suave, crema+terracota, negro con acento ácido, flechas →, fade-up en todo, iconos genéricos.
  PROCESO: 1) escribe el plan (paleta, tipos, wireframe ASCII); 2) revísalo y sustituye todo lo que suene a default; 3) construye; 4) captura y quita un elemento.
  ```
- Estilos con "personalidad" fáciles de sistematizar en campañas: Swiss/International (retícula estricta), brutalista (tipografía cruda, contraste duro), risografía (2–3 tintas planas con sobreimpresión y grano), Y2K (cromados, metalizados), collage editorial, constructivismo, cartelismo español de los 30/movida madrileña; elegir **uno** y codificarlo como reglas medibles (no adjetivos).
- Generar la textura/imagen con Figma shaders, Higgsfield o modelos de Gamma en estilo personalizado, y la tipografía/composición en HTML/Figma, evita que los modelos de imagen rendericen texto (fuente habitual de "look IA").

### Gaps
- No encontré publicaciones de diseño (It's Nice That, Creative Bloq) de 2026 con análisis específicos; las prácticas de diseñadores provienen de blogs/Medium.
- No verifiqué directamente el commit 423563cf ni su fecha exacta (solo el post de DEV).

---

## 5. Sistemas de coherencia: mantener una identidad única en pósters, carruseles, stories, covers, banners, pantallas e impresión

### Takeaway
La coherencia se consigue con una "fuente de verdad" única y legible por Claude: **design system de Claude Design** (importado de GitHub/Figma/subidas, con bloqueo de admin), **skill de marca** (SKILL.md con tokens, reglas y prohibiciones), **variables/librerías de Figma**, **temas personalizados de Gamma**, kits de marca de Canva (según plan) y **referencias de personaje/producto** en los generadores de imagen (Soul ID, reference elements, referenceImages). Encima, plantillas maestras por formato + variación por datos.

### Cited Findings
- Claude Design importa design systems de GitHub, ficheros de diseño o subidas, verifica su salida contra el sistema y corrige antes de mostrarla; un admin puede aprobar un sistema estándar y bloquear ediciones — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- `/design-sync` y `/design` sincronizan el design system entre Claude Code y Claude Design — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- Design systems migran a Claude como artifacts; publicados y no privados se comparten con la organización; en planes individuales no se comparte nada; en Team vienen activados por defecto, en Enterprise apagados — [Claude Help Center](https://support.claude.com/en/articles/17440474-move-from-standalone-claude-design-to-claude.md).
- Skills: documentos markdown que Claude carga bajo demanda; `skill-creator` permite crear las propias — [Claude blog](https://claude.com/blog/improving-frontend-design-through-skills); ejemplo de skill de marca: brand-guidelines (colores hex + fuentes) — [skills.sh](https://www.skills.sh/anthropics/skills/brand-guidelines); theme-factory aplica paleta+tipos con hex a cualquier artifact — [mcpservers.org](https://mcpservers.org/claude-skills/anthropic/theme-factory).
- El cookbook recomienda variables CSS para el tema — [Claude blog](https://claude.com/blog/improving-frontend-design-through-skills).
- Figma: `get_variable_defs`, `search_design_system`, `get_libraries` y skill `figma-generate-library` ("for building a design system in Figma from code") — instrucciones del servidor MCP de Figma observadas en la cuenta; guía: [figma/mcp-server-guide](https://github.com/figma/mcp-server-guide).
- Gamma: `themeId` de tema personalizado de marca; "A standard theme (type 'standard') locks the look and keeps the brand out" — esquema MCP observado.
- Canva: Brand Templates/autofill en Enterprise; kits de marca según plan (contradicciones) — [Canva Help (fragmento)](https://www.canva.com/en_in/help/mcp-canva-usage/); [Build to Launch](https://buildtolaunch.substack.com/p/claude-canva-mcp-free-plan-guide).
- Consistencia de imagen: Higgsfield Soul ID (personaje) — [Higgsfield Help (fragmento)](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-create-and-use-a-soul-id-character); Gamma `generate_image` con hasta 4 imágenes de referencia de sujeto; Higgsfield `manage_reference_elements` — esquemas MCP observados; Figma Weave encadena pasos sobre un canvas reutilizable ("make your creative process repeatable") — [Figma blog: TL;DR on Figma Weave](https://www.figma.com/blog/the-tldr-on-figma-weave/).
- Variación por datos: Adobe `adobe-create-pdfs-from-data` (skill instalada, observado); Canva autofill solo Enterprise — [Canva Help (fragmento)](https://www.canva.com/en_in/help/mcp-canva-usage/).
- Varias guías coinciden en que guardar el design system es lo que evita resultados genéricos — [MindStudio](https://www.mindstudio.ai/blog/claude-design-avoid-ai-slop-design-system).

### Inferences
- Arquitectura recomendada para un creador:
  1. **Brand book como skill** (`/mnt/.../skills/mi-marca/SKILL.md`): sujeto y tono; tokens (hex, fuentes con URL de Google Fonts/Adobe Fonts, escala, retícula, radios=0 o el que sea, grano); reglas por formato (márgenes y zonas seguras); lista de prohibiciones; 3–6 imágenes de referencia en `assets/`; prompts de imagen "plantilla" (con estilo, luz, óptica, grano) para Higgsfield/Gamma/Figma.
  2. **Design system en Claude Design** importado del mismo repo/Figma y bloqueado.
  3. **Figma**: variables (color/tipo/espaciado) + componentes maestros por formato (1080×1350, 1080×1440, 1080×1920, 1920×1080, A3) con autolayout.
  4. **Tema de Gamma** con la misma paleta/fuentes para carruseles rápidos.
  5. **Elementos de referencia** de personaje/producto en Higgsfield (Soul ID / reference elements) para que todas las fotos/vídeos compartan sujeto y luz.
- "Plantilla + datos": un único HTML/Figma maestro por formato y un JSON/CSV con titulares, precios, fechas e imágenes; Claude genera N piezas idénticas en sistema y diferentes en contenido (evita que cada pieza "se reinvente").
- Proyecto de Claude con la skill de marca + referencias como conocimiento, para que cualquier conversación del equipo herede el estilo.

### Gaps
- No encontré documentación oficial de cómo Claude Design maneja varias marcas con fuentes no web (licencias de fuentes de escritorio).
- No verifiqué si los kits de marca de Canva son accesibles vía MCP (no aparecen herramientas específicas en la ficha).

---

## 6. Diseño móvil (pantallas de app) y formatos sociales mobile-first (9:16, 4:5, 3:4; zonas seguras 2026)

### Takeaway
Para apps: Claude Design genera prototipos interactivos, wireframes y flujos que pasan a Claude Code; Figma MCP genera pantallas en Figma con tu design system (skill `figma-generate-design`) y hay skill `figma-swiftui` para pasar a SwiftUI. Para social: lienzo 1080×1920 (9:16) para Reels/Stories/TikTok/Shorts; feed IG 1080×1350 (4:5) o el nuevo 1080×1440 (3:4) tras el cambio de cuadrícula a 3:4; mantener lo crítico en una caja central de ~900×1400 px. Las cifras de zona segura varían entre fuentes y la mayoría son orientativas.

### Cited Findings
**Diseño de app**
- Claude Design: "Interactive prototypes from static mockups", "Product wireframes and feature flows, which can go to Claude Code or designers" — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs); `/design` convierte código en prototipo vivo o importa el diseño al codebase — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- Figma MCP: flujo code-to-design con `create_new_file` → `create_session` → `search_design_system` → `use_figma`; skills `figma-generate-design` (traducir una página/app a Figma), `figma-design-to-code`, `figma-swiftui`, `figma-code-connect` — instrucciones del servidor MCP de Figma observadas en la cuenta; [figma/mcp-server-guide](https://github.com/figma/mcp-server-guide).
- Un diseñador gráfico usa Claude Code + Figma para infografías de LinkedIn — [Frontal (blog)](https://frontal.so/blog/claude-code-for-agencies).

**Formatos sociales 2026**
- 1080×1920 (9:16) es el lienzo consensuado para TikTok, Reels y Shorts; 4:5 a 1080×1350 para feed — [wildandfreetools cheat sheet 2026](https://wildandfreetools.com/blog/social-media-video-size-cheat-sheet-2026/); [digitalapplied 2026](https://www.digitalapplied.com/blog/social-media-image-sizes-2026-every-platform).
- Cuadrícula de perfil de Instagram a **3:4** desde finales de 2025; el feed muestra hasta 4:5 pero la cuadrícula recorta a 3:4; algunas guías recomiendan **1080×1440** como nuevo tamaño por defecto y para carruseles (hasta 20 elementos), otras mantienen 4:5 (1080×1350) diseñando dentro de una zona segura 3:4 centrada; todos los elementos de un carrusel deben compartir relación de aspecto; algunas herramientas de programación pueden no aceptar 3:4 — [Stan Store guide 2026](https://stan.store/blog/instagram-post-size-guide-2026/); [Linearity](https://www.linearity.io/blog/instagram-size-guide/); [Sked Social](https://skedsocial.com/blog/best-instagram-image-and-video-size-recommendations); [Buffer](https://buffer.com/library/instagram-image-size); [Metricool](https://metricool.com/instagram-image-size/).
- Zonas seguras (cifras de terceros, **no oficiales**, varían): Reels — conservadora 996×1400 centrada o área central 1080×1620 con franjas muertas de ~100 px arriba y ~200 px abajo; TikTok — 900×1492 central o caja universal 900×1400; YouTube Shorts — 840×960 (guía de anuncios) o 984×1500; caja común multiplataforma ~900×1400 centrada — [AdaptlyPost safe zones 2026](https://adaptlypost.com/en/blog/social-media-safe-zones-2026-complete-guide); [PostPlanify](https://postplanify.com/blog/social-media-safe-zones-2026-complete-guide); [Reap](https://reap.video/blog/short-form-video-safe-zones); [bundle.social checker](https://bundle.social/tools/safe-zone-checker); [wildandfreetools](https://wildandfreetools.com/blog/vertical-video-safe-zones-guide-2026/).
- Meta, Google y TikTok publican recursos de zona segura principalmente para anuncios; no deben presentarse como reglas permanentes para todo el orgánico — [Reap](https://reap.video/blog/short-form-video-safe-zones).
- Herramientas que ya conocen estos formatos: Gamma (`1x1`, `4x5`, `9x16`; `sizePreset` story/social-portrait), Higgsfield `reframe` (incl. 3:4 y 9:16), Adobe `adobe-create-social-variations` (recorte por sujeto + expansión generativa para IG, TikTok, LinkedIn, FB, YouTube, Snapchat, Pinterest, Threads, X) — esquemas/skills observados en la cuenta.
- Portada de Reel: Metricool admite `videoThumbnailUrl` (jpg/png) o `videoCoverMilliseconds` para Reels/TikTok (Business)/YouTube/LinkedIn/Facebook — esquema MCP observado.

### Inferences
- Plantillas maestras recomendadas (síntesis): Feed/carrusel IG 1080×1440 con contenido crítico en el 4:5 central y a su vez en el 3:4 de la cuadrícula (o diseñar en 1080×1350 con zona 3:4 centrada si la herramienta de programación no acepta 3:4); Story/Reel/TikTok/Short 1080×1920 con texto dentro de 900×1400 centrado (≈ 90 px laterales, 250–260 px arriba, 260–270 px abajo); cover de Reel diseñado en 1080×1920 pero legible en el recorte 3:4 de la cuadrícula (titular en el centro); banner YouTube/LinkedIn y X según especificación de cada uno; pantallas móviles en 390×844 / 393×852 pt (iPhone) y 412×915 dp (Android) para mockups (cifras de dispositivos comunes; verificar).
- Diseñar primero el 9:16 y el 3:4 (los formatos más restrictivos) y derivar el resto, en vez de partir del 1:1.

### Gaps
- No encontré especificaciones oficiales de Instagram/TikTok/YouTube publicadas en 2026 con zonas seguras orgánicas; todo proviene de terceros.
- No verifiqué tamaños de banners de YouTube/LinkedIn/X de 2026 ni de pantallas móviles con fuente.
- No encontré fuentes sobre React Native generado por Claude Design específicamente.

---

## 7. Flujos de campaña de principio a fin: adaptación a todos los formatos, programación/publicación y bucle de analítica

### Takeaway
La cadena completa ya se puede orquestar desde Claude: brief → sistema (skill/design system) → piezas maestras (Claude Design/Figma/HTML) → imágenes/vídeos consistentes (Higgsfield/Gamma/Figma) → variaciones por formato (Adobe social variations, Higgsfield reframe, Gamma dimensiones) → edición humana (Canva/Express) → programación (Metricool, Buffer, Postiz; TikTok directo desde Higgsfield) → analítica (Metricool `getAnalyticsDataByMetrics`, mejores horas) y vuelta al brief.

### Cited Findings
**Metricool**
- Conector oficial: programar y gestionar posts en 13 redes desde Claude — [ficha Metricool en claude.com](https://claude.com/connectors/metricool-social-media-management); MCP `https://ai.metricool.com/mcp`; en Claude.ai/Desktop se añade como conector personalizado; en Claude Code con comando de terminal — [Metricool Help: connect MCP with Claude](https://help.metricool.com/how-to-connect-metricools-mcp-with-claude-0l84v.md); [Metricool: Using Metricool within Claude Code](https://metricool.com/metricool-mcp-claude/).
- Funciona con cualquier plan (incluido Free, que limita a 20 posts programados); posts recurrentes solo en Advanced y Custom — [Metricool FAQ](https://help.metricool.com/faqs-about-the-metricool-mcp-1i3w0); [Metricool Help: more scheduling options](https://help.metricool.com/more-scheduling-options-with-metricools-mcp-ylkdd).
- Esquema observado de `createScheduledPost`: redes `twitter, facebook, instagram, linkedin, pinterest, youtube, tiktok, bluesky, threads, gmb`; Instagram `POST | REEL | STORY | TRIAL_REEL`, colaboradores, etiquetas por imagen de carrusel, audio de Reel, **`isAiGenerated`**; TikTok `isAigc`; YouTube `isAiGeneratedContent`; Pinterest `isAiGenerated`/`isAiGeneratedPerson`; LinkedIn `publishImagesAsPDF` (carrusel PDF); portada de vídeo `videoThumbnailUrl`/`videoCoverMilliseconds`; `autoPublish` true (API) o false (notificación al móvil); `getBestTimeToPostByNetwork` si no se indica hora; zona horaria desde `getBrandSettings`; también `createScheduledPostForReview`, `getAnalyticsDataByMetrics`, `getAnalyticsAvailableMetrics` — esquema MCP observado en la cuenta.
- Metricool publica rutinas como "Weekly Social Media Routine… in 15 Minutes with Claude" y automatización de informes — [Metricool](https://metricool.com/weekly-social-media-routine-mcp/); [Metricool: automate reports](https://metricool.com/how-to-automate-social-media-reports-ai/).

**Buffer**
- MCP oficial `https://mcp.buffer.com/mcp`: crear y programar posts, gestionar cola, guardar ideas, ver canales y contenido próximo; Claude Code: `claude mcp add --transport http buffer https://mcp.buffer.com/mcp` y autenticar con `/mcp` — [Buffer developers: Claude](https://developers.buffer.com/guides/integrations/claude); [Buffer: How to post from Claude](https://buffer.com/resources/how-to-post-on-social-media-from-claude/); [buffer.com/mcp](https://buffer.com/mcp).

**Postiz**
- CLI y MCP para programar en 28+ canales (X, LinkedIn, Instagram, Facebook, Threads, YouTube, TikTok, Pinterest, Bluesky, Mastodon, Reddit, Google My Business, Telegram, Discord…); instalación `npm install -g postiz`; reglas: autenticarse (`postiz auth:login` o `POSTIZ_API_KEY`), **subir antes cada archivo con `postiz upload`**, en TikTok usar `content_posting_method: "DIRECT_POST"` (UPLOAD solo deja el borrador en la bandeja), leer `postiz integrations:settings <id>` porque los ajustes no aplicables se descartan en silencio — `SKILL.md` del plugin postiz observado; [docs.postiz.com](https://docs.postiz.com/public-api/introduction); [github.com/gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app).

**Higgsfield → TikTok / Meta**
- Herramientas `tiktok_connect`, `tiktok_prepare_publish`, `tiktok_publish_status`, `tiktok_music_trending`, `meta_ads_connect`/`meta_ads_read`/`meta_ads_write`, `virality_predictor` — lista de herramientas observada en la cuenta. Higgsfield describe un flujo de campaña completa dentro de Claude — [Higgsfield blog (no accesible; título)](https://higgsfield.ai/blog/full-ad-campaign-inside-claude); [Higgsfield: MCP for marketers](https://higgsfield.ai/blog/mcp-for-marketers).

**Adaptación a formatos**
- Adobe `adobe-create-social-variations`: un archivo → set de plataformas con recorte por sujeto y expansión generativa, preview de 3 recortes antes del lote; vídeo solo redimensionado — `SKILL.md` observado; conector: "Resize and crop images for social platforms" — [claude.com/connectors/adobe-creativity](https://claude.com/connectors/adobe-creativity).
- Canva `generate-design`/`export-design` (resize según plan) — [claude.com/connectors/canva](https://claude.com/connectors/canva); [Canva Help (fragmento)](https://www.canva.com/en_in/help/mcp-canva-usage/).
- Skill `canva-creator`: brief → calendario → inventario de assets → diseños Canva → copy → programación en HubSpot, con aprobación en cada paso — `SKILL.md` observado.

### Inferences
- **Flujo tipo para un creador en España (Metricool es español y muy usado allí):**
  1. *Brief y sistema*: en un Proyecto de Claude, cargar la skill de marca y pedir 3 direcciones en Claude Design ("Ask for three directions…", sugerido por Anthropic) → elegir una y fijarla como design system.
  2. *Imagen clave*: generar fotografía/ilustración con Higgsfield (Soul ID/reference elements) o Figma `generate_image`/Weave; textura con `create_shader`.
  3. *Piezas maestras*: póster (canvas-design o Figma), carrusel (Gamma `format: social`, `dimensions: 4x5` o Figma 1080×1440), story/reel cover (1080×1920), banner 16:9, landing (Claude Design → Send to Netlify).
  4. *Variaciones*: Adobe social variations para fotos; Higgsfield `reframe` para vídeo; plantillas Figma por formato para tipografía (no dejar que la IA recoloque el texto).
  5. *Revisión humana*: Send to Canva / Adobe Express para retoques del equipo.
  6. *Programación*: Metricool `getBestTimeToPostByNetwork` → `createScheduledPost` (marcar `isAiGenerated`/`isAigc` cuando proceda) o `createScheduledPostForReview` para aprobación; TikTok directo con Higgsfield o Postiz (`DIRECT_POST`).
  7. *Analítica*: Metricool `getAnalyticsDataByMetrics` semanal → Claude resume qué formatos/variantes rindieron → ajustar brief.
- La declaración de contenido IA en Instagram/TikTok/YouTube/Pinterest ya está expuesta en el conector; conviene usarla por transparencia (y por el AI Act de la UE en vigor progresivo).

### Gaps
- No verifiqué tarifas actuales de Metricool, Buffer o Postiz en España.
- No pude abrir los artículos de Higgsfield sobre campañas end-to-end (dominio bloqueado).

---

## 8. Ejemplos y casos de 2026 (agencias/creadores) y qué funcionó

### Takeaway
Hay pocos casos documentados con detalle; la mayoría son testimonios de empresas en materiales de Anthropic (Brilliant, Datadog, Tenex, Canva) y guías de creadores/vendors. No encontré un estudio de caso independiente de una agencia que haya hecho una campaña completa de pósters/redes con Claude Design.

### Cited Findings
- Brilliant: páginas complejas en 2 prompts frente a 20+ en otras herramientas; Datadog: de idea a prototipo funcional en una conversación — [Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs).
- Tenex usa Claude Design para direcciones de diseño web, brand assets y presentaciones; posts sociales, presentaciones y flyers terminados en Adobe Express; Adobe Experience Manager/Journey Optimizer para webs y emails on-brand — [Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work).
- Un diseñador gráfico produce infografías IA para LinkedIn con Claude Code + Figma (playbook de agencias) — [Frontal](https://frontal.so/blog/claude-code-for-agencies).
- Creadora que genera campañas completas en Claude "no photographer, no editor, no designer" (Substack; no leído en detalle) — [Iman Oubou](https://imanoubou.substack.com/p/how-im-generating-full-marketing).
- Guía de marketing con cuatro casos reales (de pago; no leído) — [Future of Marketing](https://www.futureofmarketing.de/p/claude-design-for-marketing).
- Ojo con la confusión de nombres: Awesomic creó un proyecto llamado "Claude Design" en el hackathon "Built with Opus 4.6" que **no** es el producto de Anthropic — [Awesomic](https://www.awesomic.com/case-study/claude-design).
- Opinión crítica de diseñadores: el consumo de tokens hace que a veces sea más lento que diseñar a mano un detalle — [TechRepublic](https://techrepublic.com/article/news-anthropic-claude-design-overhaul-enterprise-teams); evaluación independiente de calidad — [Victor Dibia: How good is Claude Design?](https://newsletter.victordibia.com/p/how-good-is-anthropics-claude-design); límites del producto — [Moda: What it does and where it stops](https://moda.app/blog/claude-design).

### Inferences
- Lo que parece funcionar según testimonios: usar Claude Design para **explorar direcciones y prototipar rápido**, y terminar/ajustar en herramientas especializadas (Express, Canva, Figma); fijar el design system antes de producir en volumen; editar a mano los detalles finos para no quemar tokens.

### Gaps
- Sin casos de agencias españolas/europeas documentados; sin métricas de rendimiento (engagement/CTR) de campañas hechas con Claude.
- Sin cobertura de It's Nice That / Creative Bloq / Fast Company Design sobre campañas concretas hechas con Claude en 2026 (solo la noticia de lanzamiento de Fast Company).
