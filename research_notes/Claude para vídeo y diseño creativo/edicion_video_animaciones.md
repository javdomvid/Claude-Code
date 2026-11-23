# Edición y creación de vídeo con Claude: motion graphics, tipografía cinética, subtítulos y transiciones (estado a noviembre de 2026)

> Notas de investigación (fecha de corte: 23-nov-2026). Comandos, URLs y nombres de producto se dejan literales.
> Leyenda de fiabilidad: **[oficial]** = documentación/repositorio/cuenta oficial del fabricante; **[3ª parte]** = blog, agregador o directorio; **[prueba propia]** = comprobado en esta sesión de Claude Code en la nube el 23-nov-2026; **[conector]** = leído directamente del esquema de herramientas del conector MCP (Descript, Figma) o de la skill del plugin Figma instalada en esta sesión; no hay URL pública del dato literal, y la URL enlazada en esas líneas es solo la página pública más cercana del fabricante como contexto.
> Limitación de método: en esta sesión, `remotion.dev` y `help.descript.com` estaban bloqueados para fetch directo; sus datos proceden de fragmentos de búsqueda de esas mismas páginas oficiales. GitHub sí era accesible y se leyó directamente.

---

## 1. Remotion: Agent Skills oficiales, configuración, prompts, render y licencia

### Takeaway
Remotion (React → MP4) es la cadena más madura para que Claude Code genere motion graphics: tiene un repo oficial de Agent Skills (`remotion-dev/skills`, 13 skills, ~7,8k estrellas) que se instala con `npx skills add remotion-dev/skills` o directamente al crear el proyecto con `npx create-video@latest --skills`; renderiza en local con Chrome headless (o en AWS Lambda), y es gratis para particulares y empresas de hasta 3 personas, pero de pago (licencia de empresa) a partir de 4.

### Cited Findings
**Skills oficiales e instalación**
- Repo oficial `remotion-dev/skills`: "Agent Skills" con buenas prácticas para proyectos Remotion, pensado para Claude Code, Codex, Cursor, Kimi Code y OpenCode; ~7,8k estrellas, 864 forks, 100 commits en `main` **[oficial]** — [GitHub remotion-dev/skills](https://github.com/remotion-dev/skills)
- Comandos de instalación literales del README: `npx remotion skills add` (dentro de un proyecto Remotion), `npx skills add remotion-dev/skills` (si Remotion no está instalado), `gh skill install remotion-dev/skills` (GitHub CLI) y `npx create-video@latest --skills` (instala todas las skills al crear un proyecto nuevo, sin preguntar) **[oficial]** — [GitHub remotion-dev/skills](https://github.com/remotion-dev/skills)
- Las 13 skills incluidas (se invocan como slash commands): `/remotion-best-practices` (paraguas, úsala si dudas), `/remotion-create`, `/remotion-markup` (composición, animación, layout, tipografía, media, efectos, audio, fuentes, timing), `/remotion-studio`, `/remotion-render`, `/remotion-maps` (Mapbox, MapLibre, MapTiler, GeoJSON, CesiumJS), `/remotion-captions`, `/remotion-saas`, `/remotion-interactivity`, `/remotion-docs`, `/remotion-license`, `/remotion-upgrade`, `/remotion-multimedia` (Mediabunny) **[oficial]** — [GitHub remotion-dev/skills](https://github.com/remotion-dev/skills)
- Ubicación: la doc del CLI dice que las skills se instalan en `.agents/skills` del proyecto y que la compatibilidad con Claude Code se consigue con un symlink `.claude/skills` → `.agents/skills`; una página más antigua de Remotion decía `.claude/skills` (conflicto entre páginas oficiales) **[oficial, vía fragmento de búsqueda]** — [remotion.dev/docs/cli/skills](https://www.remotion.dev/docs/cli/skills); [remotion.dev/docs/ai/skills](https://www.remotion.dev/docs/ai/skills)
- Instalación de una sola skill para Claude Code: `npx -y skills add remotion-dev/skills --skill remotion-best-practices --agent claude-code` (instala en `.claude/skills` del proyecto); verificación con `npx skills list --agent claude-code` **[3ª parte]** — [vibehackers.io](https://vibehackers.io/claude-code/skills/remotion-best-practices-remotion-dev); [mer.vin](https://mer.vin/2026/05/remotion-agent-skills-install-remotion-dev-skills-for-claude-code-and-cursor/)
- Remotion documenta que funciona bien con agentes como Claude Code, Codex, Kimi Code y OpenCode, y que hace falta Node.js **[oficial, fragmento]** — [remotion.dev/docs/ai/claude-code](https://remotion.dev/docs/ai/claude-code)

**Creación del proyecto (`npx create-video`)**
- Salida literal de `npx create-video@latest --help` (nov-2026): `npx create-video --yes --blank my-video`; opciones `--yes/-y` (no interactivo, requiere flag de plantilla y directorio), `--tailwind`, `--skills` ("Install all Remotion agent skills without prompting"), `--tmp`. Plantillas: `--blank`, `--hello-world`, `--next`, `--vercel`, `--recorder`, `--prompt-to-motion-graphics`, `--render-server`, `--electron`, `--react-router`, `--element-library`, `--three`, `--still`, `--audiogram`, `--music-visualization`, `--prompt-to-video`, `--skia`, `--overlay`, `--code-hike`, `--stargazer`, `--tiktok` **[prueba propia]** — [remotion.dev/docs/cli/create-video](https://www.remotion.dev/docs/cli/create-video)
- Versión actual instalada por la plantilla: `remotion` / `@remotion/cli` **4.0.545**, React 19.3.1; `engines.node`: `^20.19.0 || ^22.13.0 || >=24`; scripts `dev` = `remotion studio`, `build` = `remotion bundle` **[prueba propia]** — [remotion.dev/docs/cli/create-video](https://www.remotion.dev/docs/cli/create-video)
- Flujo típico de tutorial: crear proyecto, instalar skills, lanzar `claude` desde la misma carpeta, previsualizar en Remotion Studio (`npm run dev`) y renderizar por CLI **[3ª parte]** — [Tella](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code); [OpenReplay (ES)](https://blog.openreplay.com/es/crear-videos-claude-code-remotion/)
- Remotion publica una galería de prompts de ejemplo (p. ej. "launch video on X") **[oficial]** — [remotion.dev/prompts/launch-video-on-x](https://www.remotion.dev/prompts/launch-video-on-x)

**Cómo se le pide a Claude (prompting) y errores frecuentes**
- Indicar timing explícito por escena en segundos/frames (ej.: "Scene 1 (0-2.3s): the wordmark … springs in, centered, with an orange glow") **[3ª parte]** — [autoae.online tutorial](https://autoae.online/blog/claude-code-remotion-tutorial)
- Dar de entrada assets, rutas, fuentes, colores y estilo de movimiento, y decir qué NO debe inventar; "el prompt, las fuentes y los assets importan más que el modelo" **[3ª parte]** — [autoae.online "look flat"](https://autoae.online/blog/claude-remotion-videos-look-flat)
- Reglas técnicas típicas en skills: preferir `interpolate()` salvo que se quiera física; `spring()` con `{ damping: 200 }` para movimiento suave sin rebote; siempre `extrapolateRight: 'clamp'`; pasar siempre `fps` a `spring()` **[3ª parte]** — [skills.sh oakoss/remotion](https://skills.sh/oakoss/agent-skills/remotion); [autoae.online](https://autoae.online/blog/claude-code-remotion-tutorial)
- Fallo habitual: titulares que se parten mal en formato vertical; pedir comprobación de layout en la relación de aspecto final (en una prueba hizo falta una segunda ronda) **[3ª parte]** — [autoae.online](https://autoae.online/blog/claude-code-remotion-tutorial)
- Subtítulos tipo TikTok con resaltado por palabra e importación SRT están cubiertos por la skill de captions **[3ª parte]** — [Tella](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code)
- Existe una skill comunitaria con patrones "extraídos de la sesión de Claude Code de Jonny Burger (creador de Remotion) construyendo el vídeo de anuncio de las skills" (no verificado el carácter viral ni la fecha) **[3ª parte]** — [skills.sh remotion-animation](https://www.skills.sh/kmshihab7878/claude-code-setup/remotion-animation)

**Render: local, Lambda, Cloud Run**
- Render local: Remotion lanza Chromium headless y captura cada frame (30 s a 30 fps = 900 capturas) **[3ª parte]** — [OpenReplay](https://blog.openreplay.com/making-videos-claude-code-remotion/)
- En Chrome reciente pueden producirse cuelgues; Remotion recomienda migrar a Chrome Headless Shell; timeouts de `delayRender()` suelen ser un bug de código (falta `continueRender()`) **[oficial, fragmento]** — [remotion.dev stuck render](https://remotion.dev/docs/troubleshooting/stuck-render); [remotion.dev Lambda debug](https://www.remotion.dev/docs/lambda/troubleshooting/debug)
- Lambda: "la forma más rápida y escalable"; despliegue con `npx remotion lambda functions deploy`, validar antes con `npx remotion lambda policies validate`; cuotas con `npx remotion lambda quotas` (1000 invocaciones concurrentes por región por defecto, cuentas nuevas pueden tener 10); la función va ligada a la versión de Remotion (al actualizar hay que redeplegar) **[oficial, fragmento]** — [remotion.dev/docs/lambda/setup](https://www.remotion.dev/docs/lambda/setup); [remotion.dev/docs/lambda](https://remotion.dev/docs/lambda)
- Coste Lambda orientativo ~0,013 $/minuto (fragmento truncado; depende de región, memoria, tipo de vídeo); solo cómputo, CloudWatch aparte; equipos de 4+ necesitan además licencia de empresa **[oficial, fragmento]** — [remotion.dev/lambda](https://remotion.dev/lambda); [cost example](https://remotion.dev/docs/lambda/cost-example)
- Cloud Run: "currently not being actively developed", nunca marcado production-ready, sin render distribuido **[oficial, fragmento]** — [remotion.dev/docs/cloudrun-alpha](https://www.remotion.dev/docs/cloudrun-alpha)

**Licencia y costes**
- Licencia gratuita para particulares y empresas de hasta 3 personas; por encima, Company License; también Enterprise **[oficial, fragmento]** — [remotion.dev/docs/license/pricing](https://www.remotion.dev/docs/license/pricing); [LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
- El LICENSE anuncia que "en Remotion 5.0 la licencia cambiará ligeramente" (sin detalle) **[oficial]** — [unpkg LICENSE](https://unpkg.com/remotion@4.0.489/LICENSE.md)
- Cifras de la Company License (conflicto entre fuentes): "Automators" 100 $/mes (página oficial de precios, fragmento) y pago por uso; terceros citan 25 $/asiento/mes de desarrollador con mínimo 100 $/mes o 1000 $/año, y 0,01 $/render con mínimo 100 $/mes; Enterprise desde 500 $/mes; la FAQ oficial dice que si se combinan opciones aplica un mínimo de 100 $/mes **[mezcla oficial/3ª parte]** — [remotion.dev/pricing](https://remotion.dev/pricing); [License FAQ](https://www.remotion.dev/docs/license/faq); [Wireflow](https://www.wireflow.ai/blog/remotion-pricing); [Spotsaas](https://www.spotsaas.com/blog/remotion-review)
- HeyGen lo describe como "source-available", no open source **[oficial HeyGen]** — [HyperFrames vs Remotion](https://hyperframes.heygen.com/guides/hyperframes-vs-remotion)

### Inferences
- Para un creador individual o una empresa de ≤3 personas en España, Remotion es gratis; un autónomo con un pequeño equipo de 4+ tendría que pagar (mínimo ~100 $/mes según las fuentes).
- La forma más rápida de empezar: `npx create-video@latest --yes --blank mi-video --skills` → `cd mi-video` → `claude` → pedir el vídeo por escenas con timing → `npm run dev` para revisar → `npx remotion render`.
- Lambda solo compensa si se hacen muchos renders o vídeos largos; para piezas de redes de 15–60 s el render local es suficiente (ver sección 8: 5 s 1080p30 en ~15 s en 4 vCPU).

### Gaps
- No pude leer la tabla de precios oficial actual en directo (dominio bloqueado); confirmar en https://www.remotion.dev/docs/license/pricing antes de citar cifras.
- No hay confirmación oficial de un "plugin de Claude Code" de Remotion (una fuente de terceros lo menciona; el repo oficial solo documenta skills).
- Fecha exacta de lanzamiento de `remotion-dev/skills` no encontrada en fuente primaria.

---

## 2. HeyGen HyperFrames y otros frameworks "agent‑native" de 2026

### Takeaway
HyperFrames (HeyGen, open source Apache‑2.0, publicado a mediados de abril de 2026) convierte HTML/CSS/JS (GSAP por defecto) en MP4 mediante Chrome headless; está diseñado para agentes, se instala como skills o como plugin de Claude Code y ha superado a Remotion en estrellas (~88k), aunque Remotion conserva un renderizador en la nube y un Studio más maduros. La comunidad lo ve más fácil de arrancar pero más "token hungry" y a veces con peor diseño final.

### Cited Findings
- Descripción: "An open-source AI video editor from HeyGen" — escribir HTML y renderizarlo a MP4 con agentes de código o con la app gratuita Studio; ~88,3k estrellas, 8,2k forks, 7.859 commits; licencia Apache 2.0 **[oficial]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- Requisitos: Node.js 22+ y FFmpeg; el render usa Chrome headless + Puppeteer **[oficial]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- Instalación literal: skills `npx skills add heygen-com/hyperframes` (elegir "Core Skills"), o `npx hyperframes skills update`; plugin de Claude Code: `claude plugin marketplace add heygen-com/hyperframes` + `claude plugin install hyperframes@hyperframes`; proyecto: `npx hyperframes init my-video` **[oficial]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- Variante para instalar solo la skill de animación globalmente: `npx skills add heygen-com/hyperframes --skill "hyperframes-animation" -g -a claude-code -y` **[3ª parte]** — [vibehackers.io](https://vibehackers.io/claude-code/skills/hyperframes-animation-heygen-com)
- CLI (salida de `npx hyperframes --help`, v0.9.83): `init`, `preview`, `render -o out.mp4`, `render --format webm -o out.webm` (overlay WebM transparente), `lint`, `inspect`, `doctor`, `publish` (a hyperframes.studio), `benchmark`, `browser`; deploy: `cloud` ("Render compositions on HeyGen's cloud (no local Chrome/ffmpeg)"), `lambda` (AWS Lambda distribuido), `cloudrun` (Google Cloud Run); IA: `skills`, `transcribe` (timestamps por palabra), `models` (p. ej. `models install parakeet`), `tts` (local, Kokoro‑82M), `remove-background` **[prueba propia]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- `hyperframes init` en Claude Code detecta el agente e instala sin preguntar 6 skills (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`, `reverse-any-video`, `style-sampling`) en `~/.agents/skills` copiadas a Claude Code, y genera `CLAUDE.md`/`AGENTS.md` en el proyecto; prompt inicial sugerido: "Using /hyperframes, create a 15-second intro about [your topic]"; scripts `npm run dev` / `check` / `render` / `publish` **[prueba propia]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- La skill `hyperframes-registry` describe ~450 bloques listos (transiciones, overlays, títulos, kinetic type, captions, gráficos, mapas, 3D, movimientos de cámara) instalables con `npx hyperframes add <bloque>` (ej. `npx hyperframes add flash-through-white`); `reverse-any-video` reconstruye cualquier vídeo como proyecto editable comprobándolo frame a frame **[prueba propia / oficial]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- Fecha: open source el 17‑abr‑2026 según una fuente; "mediados de abril de 2026" según otra **[3ª parte]** — [yuv.ai](https://yuv.ai/blog/hyperframes-heygen); [andrew.ooo](https://andrew.ooo/posts/hyperframes-heygen-html-video-agents-review/)
- Guía oficial HyperFrames vs Remotion: ambos usan Chrome headless y son deterministas; HeyGen usó Remotion en producción durante meses y le reconoce patrones (flags de Chrome, streaming a FFmpeg); diferencias: HTML vs componentes React, sin build step vs bundler, Apache 2.0 vs source‑available; Remotion gana en renderizador cloud maduro **[oficial]** — [hyperframes.heygen.com/guides/hyperframes-vs-remotion](https://hyperframes.heygen.com/guides/hyperframes-vs-remotion); [GitHub](https://github.com/heygen-com/hyperframes)
- Recepción comunitaria: "más fácil de empezar, más fluido, consume más tokens, más lento y con menos acierto en diseño que Remotion" (hilo de comparación); post chino "con Remotion ya no quiero tocar HyperFrames" **[3ª parte, anecdótico]** — [moda.app](https://moda.app/blog/hyperframes-vs-remotion); [woshipm](https://www.woshipm.com/?p=6408883)
- HyperFrames también aparece como conector/plugin en el directorio de Claude **[oficial Anthropic]** — [claude.com/plugins/hyperframes](https://claude.com/plugins/hyperframes); [claude.com/connectors/hyperframes-heygen](https://claude.com/connectors/hyperframes-heygen)
- HeyGen ofrece render en su infraestructura y documentación propia **[oficial]** — [developers.heygen.com/hyperframes-overview](https://developers.heygen.com/hyperframes-overview); [help.heygen.com](https://help.heygen.com/en/articles/15001510-hyperframes-x-heygen)
- Un fork de terceros (`js0980420/hyperframes`) afirma una "Remotion License"; no es el repo oficial y contradice el Apache 2.0 oficial — ignorar **[3ª parte]** — [GitHub js0980420/hyperframes](https://github.com/js0980420/hyperframes)

### Inferences
- Para un creador que no programa en React, HyperFrames es probablemente la entrada más amable (HTML + GSAP, ~450 bloques de registry, skills que se instalan solas con `init`); para diseño fino y render distribuido maduro, Remotion.
- Coste: HyperFrames es gratis incluso para empresas (Apache 2.0); el coste real son los tokens de Claude (reportado como mayor).

### Gaps
- No pude leer los benchmarks/cifras de tokens de la guía oficial (dominio no accesible en directo); las cifras de "7 s vs 50 s de setup" vienen de un resumen de terceros no verificado.
- No encontré otros frameworks "agent‑native" de 2026 comparables en tracción (aparte de wrappers como Kinocut y OpenMontage, que usan Remotion/HyperFrames como runtime).

---

## 3. Otras herramientas de animación por código y NLE controlados por Claude

### Takeaway
Además de Remotion/HyperFrames, hay vías maduras para: matemáticas/explicativos (Manim vía skills comunitarias), 3D (blender-mcp, ~35k estrellas, ahora `mcp-for-blender`), edición profesional en DaVinci Resolve (davinci-resolve-mcp, ~4,3k estrellas, requiere Studio en la práctica), Lottie (MCP oficial de LottieFiles), Figma Motion y After Effects/Premiere (MCPs comunitarios; Adobe anunció un MCP local oficial en MAX 2026, beta privada a principios de 2027). Motion Canvas/Revideo y CapCut tienen soporte solo comunitario/irregular.

### Cited Findings
**Motion Canvas / Revideo**
- Revideo es un fork de Motion Canvas convertido en librería para desarrolladores (con edición de audio) porque Motion Canvas se concibe como aplicación independiente **[oficial]** — [GitHub redotvideo/revideo](https://github.com/redotvideo/revideo)
- Motion Canvas: MIT, librería TypeScript con generadores + editor web con previsualización y sincronización de audio; existe una skill comunitaria **[3ª parte]** — [autoae.online](https://autoae.online/blog/motion-canvas-vs-remotion); [skills.sh motion-canvas](https://skills.sh/udnisap/skills/motion-canvas)
- Kinocut integra herramientas de Hyperframes y Revideo para motion graphics por código **[oficial del proyecto]** — [GitHub KyaniteLabs/kinocut](https://github.com/KyaniteLabs/mcp-video)

**Manim (estilo 3Blue1Brown)**
- No hay skill oficial de 3Blue1Brown ni de Anthropic; skills comunitarias: Yusuke710 Manim Skill (MIT, Manim Community Edition, plan→código→render→iterar), `davila7/claude-code-templates` manim, `adithya-s-k/manim_skill`, `vumichien/manim-skill` (plugin con pipeline de 4 agentes de tema/paper a animación), y skill "Manim Video" de Nous Hermes **[3ª parte]** — [skillsmp Yusuke710](https://skillsmp.com/creators/yusuke710/manim-skill); [skills.sh davila7](https://skills.sh/davila7/claude-code-templates/manim); [GitHub adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill); [GitHub vumichien/manim-skill](https://github.com/vumichien/manim-skill); [Hermes docs](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/creative/creative-manim-video)

**GSAP / Lottie / Rive**
- GSAP es el motor por defecto de HyperFrames (timeline pausado y "seek" por frame) **[oficial / prueba propia]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- LottieFiles Creator MCP (hosted) para Claude Code y claude.ai: `claude mcp add --transport http creator-mcp https://creator.mcp.lottiefiles.com/mcp`; descarga Lottie JSON, dotLottie, MP4, WebM, GIF, AVIF, WebP o PNG **[oficial]** — [docs.lottiefiles.com Creator MCP](https://docs.lottiefiles.com/en/creator/13_ai-tools/lottie-creator-mcp); [lottiefiles.com/creator-mcp](https://lottiefiles.com/creator-mcp)
- No encontré skill/MCP específico de Rive para Claude **[3ª parte, ausencia]** — [lottiefiles blog](https://lottiefiles.com/blog/design-guides-and-tips/best-motion-design-tools-ranked-by-use-case)
- Demos de producto con GSAP generadas con Claude (tutorial) **[3ª parte]** — [dev.to vein05](https://dev.to/vein05/professional-scripted-product-demos-with-gsap-with-claude-32bf)

**After Effects (ExtendScript) y Premiere Pro**
- AE usa ExtendScript (.jsx) **[oficial Adobe]** — [helpx.adobe.com scripts](https://helpx.adobe.com/after-effects/using/scripts.html)
- Guía: Claude Code genera .jsx, ejecución headless con `afterfx -r`, render con `aerender`, usa `app.beginSuppressDialogs()` **[3ª parte]** — [claudecodeguides.com](https://claudecodeguides.com/claude-code-after-effects-extendscript-2026/)
- MCP AE: `kumoproductions/mcp-aftereffects` (AE 2024–2026, Win/macOS, sin panel, Node 24+); `a-y-ibrahim/after-effects-mcp` (47 herramientas, panel ScriptUI abierto, herramienta de script arbitrario); `Aodaruma/adobe-mcp-rs` (Rust, AE completo + Premiere experimental vía UXP) **[3ª parte / repos]** — [GitHub kumoproductions](https://github.com/kumoproductions/mcp-aftereffects); [GitHub a-y-ibrahim](https://github.com/a-y-ibrahim/after-effects-mcp); [GitHub Aodaruma](https://github.com/Aodaruma/adobe-mcp-rs)
- Plugins comerciales: MATE for AE (soporte Claude Sonnet 5 desde jul‑2026), AE GPT (login con cuenta Claude Pro/Max, "Claude Code in After Effects") **[3ª parte/vendedor]** — [aescripts MATE](https://aescripts.com/mate-for-ae/); [aescripts AE GPT](https://aescripts.com/ae-gpt/)
- MCP Premiere comunitarios: `leancoderkavy/premiere-pro-mcp` (instalación como plugin de Claude Code + panel CEP, Premiere 2020–2026), `antipaster/Adobe-Premiere-Pro-MCP` (solo Windows, 170+ herramientas), `hetpatel-11/Adobe_Premiere_Pro_MCP` (instalador Windows + config Claude Desktop), `ayushozha/AdobePremiereProMCP`; dependen de paneles CEP/UXP que pueden romperse entre versiones; hacer copia del proyecto **[3ª parte]** — [leancoderkavy](https://github.com/leancoderkavy/premiere-pro-mcp); [antipaster](https://github.com/antipaster/Adobe-Premiere-Pro-MCP); [hetpatel-11](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP); [ayushozha](https://github.com/ayushozha/AdobePremiereProMCP)
- Adobe MAX 2026 (10‑nov‑2026): preview de integraciones MCP locales para que agentes de terceros (Claude, ChatGPT…) trabajen en Photoshop, Illustrator, Premiere y After Effects sobre archivos nativos; beta privada a principios de 2027, solo formulario de interés por ahora; no está confirmado qué agentes **[prensa]** — [TechCrunch](https://techcrunch.com/2026/11/10/adobe-adds-more-ai-to-its-products-and-launches-an-mcp/); [No Film School](https://nofilmschool.com/adobe-local-mcp-integrations); [RedShark](https://www.redsharknews.com/adobe-max-2026-premiere-color-mode-mcp)

**Blender (blender-mcp → mcp-for-blender)**
- Repo `ahujasid/mcp-for-blender` (antes `blender-mcp`): ~35,4k estrellas; no afiliado a la Blender Foundation; `uvx blender-mcp` sigue funcionando **[oficial del proyecto]** — [GitHub ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp)
- Instalación literal: Claude Code `claude mcp add blender uvx mcp-for-blender`; Claude Desktop → Settings → Developer → Edit Config: `{"mcpServers":{"blender":{"command":"uvx","args":["mcp-for-blender"]}}}`; addon: `uvx mcp-for-blender install-addon` y activar "Interface: MCP for Blender" en Edit → Preferences → Add-ons; requisitos Blender 3.0+, Python 3.10+, uv con instalador oficial (no `pip install uv`) **[oficial del proyecto]** — [GitHub](https://github.com/ahujasid/blender-mcp); [PyPI](https://pypi.org/project/blender-mcp/)
- Capacidades: `execute_blender_code` (Python arbitrario, incl. animación/rigging), `look` (viewport, cámara, tira de frames de animación, render), Poly Haven (CC0 sin API key), generación 3D (Hyper3D Rodin, Tripo, Hunyuan3D, Meshy), Sketchfab, Poly Pizza, World Labs (Blender 5.3+) **[oficial del proyecto]** — [GitHub](https://github.com/ahujasid/blender-mcp)
- Riesgos: ejecuta Python arbitrario; socket sin autenticación; una sola instancia; Blender puede congelarse en descargas; telemetría mínima por defecto; error `spawn uvx ENOENT` en clientes GUI → usar ruta completa de uvx **[oficial del proyecto]** — [GitHub](https://github.com/ahujasid/blender-mcp); [PyPI](https://pypi.org/project/blender-mcp/)

**DaVinci Resolve**
- `samuelgursky/davinci-resolve-mcp`: MIT, ~4,3k estrellas, versión 5.4.0; Resolve 18.5+ (base 19.1.3); Studio soporta scripting externo (Preferences → "External scripting using" = Local); la versión gratuita solo vía puente in‑app "supported-until-it-is-not" y la página indica que Resolve 21.1 movió el scripting Python a Studio; Python 3.10–3.12 recomendado **[oficial del proyecto]** — [GitHub samuelgursky/davinci-resolve-mcp](https://github.com/samuelgursky/davinci-resolve-mcp)
- Instalación: `npx davinci-resolve-mcp setup` o `git clone https://github.com/samuelgursky/davinci-resolve-mcp.git` → `cd davinci-resolve-mcp` → `python install.py` (configura Claude Desktop y Claude Code automáticamente) **[oficial del proyecto]** — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
- Herramientas: servidor compuesto 37 tools (por defecto), granular 390 tools, servidor offline 18 tools para .drp/.drt/.drx; timeline (ripple insert, gaps/overlaps), marcadores, color (nodos, CDL, LUT, copia de grade con salvaguarda `acknowledge_trap: true`), Fusion, render queue, Fairlight; NO elige la mejor toma ni juzga cortes; no modifica media original **[oficial del proyecto]** — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
- Caso real: Claude Code + Resolve MCP cortó retomas y silencios, añadió música y overlays y renderizó en 4K **[3ª parte/creador]** — [Ansub Khan](https://ansubkhan.com/blogs/davinci-resolve)

**CapCut / JianYing**
- No hay API oficial; proyectos comunitarios sobre VectCutAPI/pyJianYingDraft que generan borradores (carpeta `dfd_…` a copiar al directorio de drafts de CapCut); wrapper `capcut-mcp-server` (`claude mcp add capcut -- node /absolute/path/to/capcut-mcp-server/dist/index.js`, requiere VectCutAPI corriendo en el puerto 9001); mantenimiento y compatibilidad de versiones inciertos **[3ª parte]** — [GitHub Atx-Guy/capcut-mcp-server](https://github.com/Atx-Guy/capcut-mcp-server); [VectCutAPI docs](https://docsearch.algolia.com/mcp/docs/repo/sun-guannan/vectcutapi); [MigueDuque extended](https://github.com/MigueDuque/capcut-mcp-server-extended)

### Inferences
- Para el creador español típico (Premiere/CapCut/Resolve), la integración más sólida hoy es DaVinci Resolve **Studio** + davinci-resolve-mcp; Premiere/AE dependen de puentes comunitarios frágiles hasta que llegue el MCP oficial de Adobe (2027).
- CapCut solo es viable vía borradores no oficiales: alto riesgo de rotura; mejor usar ffmpeg/Descript/Resolve.

### Gaps
- Estado de mantenimiento 2026 de Motion Canvas/Revideo no confirmado (sin fechas de commit).
- Estrellas de los MCP de Premiere/AE no verificadas.

---

## 4. Cortar y editar metraje real con Claude (ffmpeg, auto-editor, Whisper/WhisperX, silencios, B‑roll, MCP de vídeo)

### Takeaway
El flujo "Claude editó mi vídeo" es casi siempre Claude Code + ffmpeg en local: Whisper/WhisperX genera una transcripción con timestamps por palabra, Claude actúa como editor de "paper edit" y escribe una lista de cortes que ffmpeg ejecuta; silencios con `silencedetect` o auto-editor; subtítulos quemados con SRT/ASS; Remotion/HyperFrames para overlays. Hay skills/MCP listos (ffmpeg-skill ~9,8k estrellas, Kinocut, MakeMyClip, claude-code-video-toolkit).

### Cited Findings
**Patrón de flujo**
- Claude Code edita vídeo ejecutando ffmpeg, Whisper y Remotion en tu ordenador; el chat normal de Claude no puede editar los archivos (sirve para guion y lista de planos) **[3ª parte]** — [shwetacreates Substack](https://shwetacreates.substack.com/p/how-to-edit-videos-with-claude-code)
- Whisper da transcripción por palabra; Claude la lee como un "paper edit", escribe la lista de cortes y ffmpeg la ejecuta **[3ª parte]** — [jordanhongtai.com](https://www.jordanhongtai.com/guides/claude-code-video-editor)
- Silencios: `silencedetect` de ffmpeg, recortar huecos >0,5 s a pausas de 0,3 s; recodificar en lugar de stream copy para cortes con precisión de frame **[3ª parte]** — [gettakes.app](https://gettakes.app/claude-code-video-editing)

**Herramientas base**
- auto-editor (Unlicense, ~6,1k estrellas): `auto-editor path/to/your/video.mp4`; `--margin 0.2sec` (por defecto) o `--margin 0.3s,1.5sec`; exportar timeline `--export premiere`, `--export resolve`, `--export final-cut-pro`; skill: `npx skills add WyattBlue/auto-editor` **[oficial del proyecto]** — [GitHub WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor)
- WhisperX (BSD‑2, ~25,6k estrellas): `pip install whisperx`; `whisperx path/to/audio.wav`; timestamps por palabra por alineación wav2vec2; `--highlight_words True` para SRT con resaltado; CPU: `--compute_type int8 --device cpu`; GPU: CUDA 12.8; diarización requiere token de Hugging Face (`--hf_token`) y aceptar el modelo speaker-diarization-community-1 **[oficial del proyecto]** — [GitHub m-bain/whisperX](https://github.com/m-bain/whisperX)

**Skills/MCP de edición más relevantes (con estrellas observadas)**
- **ffmpeg-skill** (`kajisho5/ffmpeg-skill`, MIT, ~9,8k estrellas, v4.0.0): "42 FFmpeg tools" + servidor MCP para Claude Code, Cursor, Codex; `npx ffmpeg-skill setup`, `npx ffmpeg-skill doctor`; `caption.py` (SRT/ASS, karaoke, transcripción local opcional), `fit.py --aspect 9:16 --fit crop`, `silence.py` (umbral por defecto `--threshold -35`), `loudness.py` (−14 LUFS / −1 dBTP), `export.py`/`check.py`/`render.py --template`; MCP: `{"mcpServers": {"ffmpeg-skill": {"command": "python3", "args": ["/Users/you/.claude/skills/ffmpeg-skill/mcp/server.py"]}}}`; probado con FFmpeg 6.1–9 **[oficial del proyecto]** — [GitHub kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) (el recuento de estrellas varía según fecha: 1.967 en oct, 6.158 el 16‑nov — [skillsllm](https://skillsllm.com/skill/ffmpeg-skill), [explainx](https://explainx.ai/blog/ffmpeg-skill-local-video-mcp-coding-agents-github-trending-2026))
- **Kinocut** (antes mcp-video, `KyaniteLabs`, Apache‑2.0, ~278 estrellas, release 2.0.1 del 10‑nov‑2026): `claude mcp add kinocut -- uvx --from kinocut==2.0.1 kino --mcp`; `pip install kinocut==2.0.1` + `kino doctor`; trim, merge, captions, resize, overlay, crop, speed, eliminar "dead air", quality gates (negros, silencio, loudness), 18 tools por defecto / 206 con `KINOCUT_TOOLS=all`; FFmpeg en PATH + Python 3.11+ **[oficial del proyecto]** — [GitHub KyaniteLabs/kinocut](https://github.com/KyaniteLabs/mcp-video)
- **MakeMyClip editor** (MIT, ~29 estrellas, v0.5.x nov‑2026): skill `npx skills add MakeMyClip/editor`; plugin `/plugin marketplace add MakeMyClip/editor` + `/plugin install makemyclip-editor@makemyclip`; quita silencios (`clip timeline silence`) y tomas repetidas (`clip timeline remove-retakes`), captions, exporta FCPXML 1.10 (Final Cut/Resolve) y XML para Premiere; Node 24+, whisper.cpp opcional, sin API key **[oficial del proyecto]** — [GitHub MakeMyClip/editor](https://github.com/MakeMyClip/editor)
- **claude-code-video-toolkit** (digitalsamba, MIT, ~2,7k estrellas): plantillas + skills (Remotion, voz, música, imagen/vídeo, diseño, Blender), comandos `/setup`, `/video`, `/scene-review`, `/design`, `/generate-voiceover`; instalación `git clone https://github.com/digitalsamba/claude-code-video-toolkit.git` → `cd claude-code-video-toolkit` → `uv sync` → `claude`; Node 22+ (24 LTS recomendado); vídeo de 90 s medido a 0,33 $ usando modelos abiertos (Qwen3‑TTS, FLUX.2, ACE‑Step) en GPU propia (Modal 30 $/mes gratis, RunPod) **[oficial del proyecto]** — [GitHub digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit)
- **6missedcalls/video-editing-skill** (MIT): Bash + FFmpeg + Whisper; trim, jump cut, captions (Hormozi/estándar/minimal), texto, velocidad **[repo]** — [GitHub 6missedcalls](https://github.com/6missedcalls/video-editing-skill)
- Otros MCP ffmpeg (estrellas según resultados de búsqueda, no verificadas en directo): `hyepartners-gmail/vibevideo-mcp` (~206), `video-creator/ffmpeg-mcp` (~154), `misbahsy/video-audio-mcp` (~90), `chandler767/mcp-video-editor` (FFmpeg + OpenAI Whisper), `wizenheimer/vibestudio` (~27) **[3ª parte]** — [vibevideo](https://github.com/hyepartners-gmail/vibevideo-mcp); [ffmpeg-mcp](https://github.com/video-creator/ffmpeg-mcp); [video-audio-mcp](https://github.com/misbahsy/video-audio-mcp); [mcp-video-editor](https://github.com/chandler767/mcp-video-editor); [ChatCut ranking](https://chatcut.io/blog/best-video-editing-mcp-servers)

### Inferences
- Pipeline recomendado para talking‑head de un creador: (1) `whisperx` → JSON/SRT por palabra; (2) Claude lee transcripción y propone cortes (muletillas, retomas, silencios) → EDL/JSON; (3) ffmpeg recodifica; (4) subtítulos quemados (ASS estilo Hormozi) o Remotion `/remotion-captions`; (5) export FCPXML a Resolve/Premiere para el pulido final. auto-editor/MakeMyClip cubren 1–3 en un comando.
- B‑roll: ninguna fuente primaria documenta inserción automática de B‑roll de alta calidad; en la práctica se hace con overlays en Remotion/HyperFrames, con `media-use` de HyperFrames o con Descript/Underlord (stock media).

### Gaps
- No hay benchmarks independientes de calidad de corte; los umbrales de silencio varían (0,4–0,5 s; −35 dB).
- No verifiqué en directo estrellas de varios MCP pequeños.

---

## 5. "Claude Motion": qué es, lanzamiento, acceso, planes, capacidades, límites y conexión con Descript

### Takeaway
Claude Motion es una función beta de Anthropic dentro de Claude (claude.ai/apps), lanzada el **8‑oct‑2026** junto a Claude Dashboards, que convierte informes, gráficos o walkthroughs en animaciones cortas escritas como código (sin modelo de vídeo: no genera metraje ni personas), editables palabra/número/timing y exportables a **MP4**; solo para planes **Team y Enterprise**. El conector de Descript expone `import-claude-motion-from-url`, que recibe una URL MP4 temporal (caduca en <10 min) + `download_token` para llevar esa animación a un proyecto de Descript.

### Cited Findings
- Anuncio oficial (@claudeai en X): "Claude Motion turns reports, charts, or product walkthroughs into short animations. Claude writes each one as code, with no video model involved, so you can change any word, number, or timing, then export an MP4. In beta on Team and Enterprise plans." **[oficial]** — [X @claudeai](https://x.com/claudeai/status/2108271558170976743)
- Lanzamiento el 8‑oct‑2026 en beta junto a Claude Dashboards; en el mismo anuncio Docs (y Slides/Design) salen de beta para todos los planes **[prensa]** — [technology.org (9‑oct‑2026)](https://www.technology.org/2026/10/09/claude-dashboards-motion-beta-launch/); [Unite.AI](https://unite.ai/anthropic-launches-claude-dashboards-and-motion-takes-docs-out-of-beta); [TechJack](https://techjacksolutions.com/ai-brief/anthropic-claude-dashboards-motion-beta-sql-docs-free/); [Digital Trends](https://digitaltrends.com/computing/claude-can-now-build-live-dashboards-and-animated-explainers-from-your-data/)
- Sin modelo de generación de vídeo: anima texto, gráficos, formas e imágenes del usuario; sin metraje generado ni personas generadas por IA **[prensa citando a Anthropic]** — [Unite.AI](https://unite.ai/anthropic-launches-claude-dashboards-and-motion-takes-docs-out-of-beta); [RuntimeWire](https://runtimewire.com/article/anthropic-claude-dashboards-motion-beta)
- Acceso: Team activado por defecto; en Enterprise lo activa un owner/admin (una fuente lo sitúa en Organization settings → Artifacts); Free/Pro/Max no lo incluyen (a 31‑oct‑2026) **[3ª parte]** — [aicatchup](https://aicatchup.com/news/claude-dashboards-motion-beta); [eesel.ai](https://www.eesel.ai/blog/claude-motion)
- Exportación desde la interfaz del artifact: Export → MP4 (único formato citado); Anthropic no ha publicado duración máxima ni resolución de exportación; consume del límite de uso del plan (animaciones largas/complejas gastan más); no hay precio separado **[3ª parte]** — [Layer3 Labs](https://www.layer3labs.io/guides/claude-motion); [CreateMotion](https://createmotion.io/guides/claude-motion-explained/)
- Un medio alemán lo describe como "clips de 30 segundos a partir de datos de negocio" (no confirmado como límite oficial) **[prensa]** — [BornCity](https://borncity.com/news/anthropic-startet-claude-motion-30-sekunden-clips-aus-geschaeftsdaten/)
- Socios para abrir/seguir editando un proyecto Motion (según terceros que citan el post de Anthropic): Adobe, Descript, HeyGen, Higgsfield, invideo, Luma AI y Runway; Canva y Captions "próximamente" **[3ª parte, no verificado en fuente Anthropic]** — [claudemotion.site](https://claudemotion.site/); [pexo.ai](https://pexo.ai/blog/what-is-claude-motion-3387)
- Herramienta del conector Descript `import-claude-motion-from-url`: "Import a Claude Motion MP4 from its short-lived url and download_token into a Descript project. Waits until the video is in the project, then returns the project_url"; parámetros `url` ("MP4 URL. Expires within 10 minutes. Fetch it server-side"), `download_token` (pasar sin modificar), `title`, y `claude_design_project_id` ("Stable identifier of the video; same on every re-send. Use it to update an existing import instead of creating a new one") **[conector]** — [help.descript.com MCP Claude](https://help.descript.com/api-and-mcp/mcp-claude)
- Contexto: Claude Design (Anthropic Labs) se lanzó en abril de 2026 (research preview en Pro, Max, Team, Enterprise) y genera HTML interactivo; Motion es un producto distinto **[oficial]** — [anthropic.com/news/claude-design-anthropic-labs](https://www.anthropic.com/news/claude-design-anthropic-labs)
- Prompts de ejemplo para Motion (12 prompts) en un Substack de creador **[3ª parte]** — [Charlie Hills](https://charliehills.substack.com/p/claude-motion-graphics)

### Inferences
- El parámetro `claude_design_project_id` sugiere que Motion comparte infraestructura con Claude Design (el ID del proyecto de diseño identifica el vídeo); por eso reenviar desde Claude actualiza el mismo import en Descript en lugar de duplicarlo.
- Flujo práctico Motion → Descript: crear la animación en Claude (Team/Enterprise) → usar la acción de abrir/enviar a Descript (o pedir a Claude que la importe con el conector) → en Descript añadir voz, música, subtítulos, cortes y publicar. Para usuarios Pro/Max sin Motion, la alternativa equivalente es Claude Code + Remotion/HyperFrames.

### Gaps
- No encontré la página de ayuda oficial de Anthropic (support.claude.com) ni el post de anthropic.com/news de Motion; plan, toggles, duración máxima, resolución, fps, audio y formatos verticales no confirmados por Anthropic.
- La lista de socios de exportación no está verificada en una fuente de Anthropic.

---

## 6. Conector MCP de Descript (Agent Underlord)

### Takeaway
Descript tiene conector oficial en el directorio de Claude (OAuth, sin token) y servidor MCP remoto `https://api.descript.com/v2/mcp`; desde Claude se puede importar/transcribir media, pedir a **Agent Underlord** que edite en lenguaje natural (recortes, quitar muletillas, subtítulos, stock media…), crear clips sociales, exportar transcripciones/timelines (EDL, AAF, FCPXML, Premiere XML, Resolve XML) y publicar; consume minutos de media y créditos IA del plan de Descript.

### Cited Findings
- Herramientas del conector: `import_media`, `create_social_clips`, `transcribe_audio_video`, `prompt_project_agent` (Agent Underlord: "trim, rearrange, remove filler words, add captions, import stock media, and much more"), `publish_project` (devuelve URLs de share y descarga), `export_transcript` (txt, markdown, html, rtf, srt), `export_timeline` (EDL, AAF, SESX, FCPXML, Premiere XML, DaVinci Resolve XML), `wait_for_job`, `list_jobs`, `cancel_job`, `open_descript` (panel de subida, requiere MCP Apps), `list_projects`, `get_project`, `list_folders`, `get_drive_info`, `import_drive_media`, `search_drive` (búsqueda visual solo en Enterprise), `send_feedback`, `import-claude-motion-from-url` **[conector]** — [descript.com/mcp](https://descript.com/mcp); [help.descript.com MCP](https://help.descript.com/api-and-mcp/mcp)
- `create_social_clips`: crea o adapta clips para TikTok, Reels, Shorts; encuentra momentos, corta por timestamps/temas, captions, recorte de hablante, aspecto y ritmo; devuelve composiciones editables (no ficheros renderizados) **[conector]** — [help.descript.com MCP Claude](https://help.descript.com/api-and-mcp/mcp-claude)
- `prompt_project_agent` permite elegir el modelo de Underlord (`auto`, `claude-opus-5.5`, `claude-sonnet-5.5`, `claude-haiku-5.5`, GPT y Gemini) y mantener contexto con `conversation_id` **[conector]** — [help.descript.com MCP Claude](https://help.descript.com/api-and-mcp/mcp-claude)
- Configuración en Claude: Customize (panel izquierdo) → Connectors → buscar Descript → Connect; el conector del directorio no incluye herramientas generativas de imagen/vídeo; para eso, o para Claude Code/Cursor, usar la configuración MCP personalizada con `https://api.descript.com/v2/mcp`; OAuth con login de Descript; acotado a un Drive **[oficial, fragmentos]** — [help.descript.com MCP Claude](https://help.descript.com/api-and-mcp/mcp-claude); [help.descript.com MCP custom](https://help.descript.com/api-and-mcp/mcp-custom); [help.descript.com MCP](https://help.descript.com/api-and-mcp/mcp)
- Costes: importaciones y ediciones de Underlord vía MCP consumen minutos de media y créditos IA **[oficial, fragmento]** — [help.descript.com MCP Claude](https://help.descript.com/api-and-mcp/mcp-claude)
- Limitación: exportar un archivo final sin publicar no está soportado; la salida es vía publicación alojada en Descript con enlaces MP4 **[oficial, fragmento]** — [help.descript.com MCP Claude](https://help.descript.com/api-and-mcp/mcp-claude)
- Prompts de ejemplo: "Import this video from my desktop into my 'Podcasts' folder and transcribe it"; el listado de Claude sugiere limpiar un episodio de podcast, sacar clips destacados o traducir un vídeo al español **[oficial]** — [claude.com/marketplace/connectors/descript](https://claude.com/marketplace/connectors/descript)
- Planes (terceros): Creator 24 $/mes (anual) con 30 h de subida y 800 créditos IA/mes; Business 50 $/mes (anual); confirmar en descript.com/pricing; no hay cargo separado por MCP **[3ª parte]** — [Sonix review](https://sonix.ai/resources/descript-review-pricing/amp/); [Kompozy](https://kompozy.io/reviews/descript-mcp)
- Los conectores remotos en claude.ai requieren plan de pago de Claude (según terceros) **[3ª parte]** — [usecarly.com](https://www.usecarly.com/blog/claude-descript-integration/)

### Inferences
- Para Claude Code: `claude mcp add --transport http descript https://api.descript.com/v2/mcp` es la forma estándar de añadir un MCP remoto HTTP (inferido del URL oficial; comando exacto no visto en la página de Descript).
- Descript es la opción "sin terminal" más completa para un creador: transcribir, quitar muletillas, subtitular y sacar shorts desde el chat de Claude; para animación de marca se combina con Claude Motion (Team/Enterprise) o con MP4 de Remotion/HyperFrames importados con `import_media`.

### Gaps
- No pude leer la página de ayuda completa (dominio bloqueado); hay contradicción entre "conector del directorio" y "custom connector" en páginas de ayuda distintas.
- No hay requisito de plan mínimo de Descript documentado oficialmente para el MCP.

---

## 7. Figma Motion vía Figma MCP (export_video, get_motion_context, skill figma-use-motion)

### Takeaway
Sí: desde Config 2026 Figma Design tiene timeline con keyframes (Figma Motion, despliegue gradual desde el 24‑jun‑2026) y el Figma MCP permite a Claude crear animaciones (`use_figma` + skill `figma-use-motion`), leerlas como código (`get_motion_context`, CSS @keyframes + motion.dev) y **exportarlas a MP4** con `export_video` (render en servidor, lento/caro). Vale para assets animados cortos (UI, logos, tipografía con TextStagger), no para edición de metraje.

### Cited Findings
- Figma Motion: timeline con keyframes y presets en Figma Design; exportación MP4, WebM, SVG animado o GIF (en la app); beta abierta a todos los asientos de pago, Starter con exportaciones limitadas; agente de Figma para motion solo en planes de pago; despliegue gradual desde el 24‑jun‑2026 **[oficial]** — [Figma blog Introducing Figma Motion](https://www.figma.com/blog/introducing-figma-motion/); [Config 2026 recap](https://www.figma.com/blog/config-2026-recap/); [help.figma.com](https://help.figma.com/hc/en-us/articles/39582753756695)
- Actualización posterior: estilos personalizados, audio, animaciones de texto y exportación Lottie (el centro de ayuda inicial decía Lottie "futuro" → conflicto) **[oficial foro]** — [Figma forum](https://forum.figma.com/product-updates-3/motion-adds-custom-styles-audio-text-animations-and-lottie-export-58554)
- Problemas reportados: GIF cortados **[foro]** — [Figma forum](https://forum.figma.com/share-your-feedback-26/figma-motion-gif-export-get-cut-off-and-other-issues-55394)
- `export_video` (MCP): "Export a Figma frame's keyframe animation as an MP4 video. This tool only produces MP4 — GIF and animated SVG export are not supported yet"; render en servidor con URL prefirmada; `ttlSeconds` por defecto 1 h (30 s–7 días); `fps` 5–60; `quality` low/medium/high; `constraint` SCALE/WIDTH/HEIGHT con máximo 10x/4096 px; solo archivos Figma Design; `nodeId` debe ser el frame de nivel superior dueño del timeline; si no termina, devuelve `jobId` para sondear cada 10–15 s **[conector]** — [help.figma.com Figma Motion](https://help.figma.com/hc/en-us/articles/39582753756695)
- `get_motion_context`: inventario de nodos animados, pistas de keyframes con easing, snippets CSS @keyframes y motion.dev, y `timelineCohorts` **[conector]** — [help.figma.com](https://help.figma.com/hc/en-us/articles/39582753756695)
- Skill `figma-use-motion` (plugin Figma para Claude): APIs `manualKeyframeTracks`, `applyManualKeyframeTrack`, `applyAnimationStyle`, `setTimelineDuration`, `figma.motion.figmaAnimationStyles()`, estilos de animación personalizados, `TextStagger` para revelados de texto por carácter/palabra/línea (typewriter), keyframes 3D si están habilitados; las APIs de motion pueden no estar habilitadas para el usuario (error `"<name>" is not a supported API` → parar); `get_screenshot` solo muestra el estado en reposo; `export_video` es "slow and expensive (~10s to minutes)": planificar 4–6 frames clave, empezar a 320 px y `quality: "low"`, fps 5–10 para revisión, y extraer frames con `ffmpeg -ss <t> -i anim.mp4 -frames:v 1 frame_<t>.png` **[conector/skill local]** — [Figma blog](https://www.figma.com/blog/introducing-figma-motion/)
- Skill `figma-implement-motion`: traduce motion de Figma a código (motion.dev, CSS keyframes) vinculando `get_motion_context` y `get_design_context` por node id **[conector/skill local]** — [Figma blog](https://www.figma.com/blog/introducing-figma-motion/)

### Inferences
- Flujo útil para un creador: diseñar en Figma un lower‑third/logo/título → pedir a Claude que lo anime (TextStagger, keyframes) → `export_video` en `quality: "high"` → importar el MP4 en Descript/Resolve o usarlo como overlay en Remotion/HyperFrames (HyperFrames incluye una skill `/figma`).
- No sirve para piezas largas: coste por píxel×frame y sin audio vía MCP.

### Gaps
- Precio/consumo exacto de `export_video` y si cuenta contra límites del plan de Figma no documentados.
- Disponibilidad de las APIs de motion por plan no confirmada públicamente.

---

## 8. Hardware/software: local vs Claude Code en la web / sesiones cloud

### Takeaway
Remotion y HyperFrames renderizan sin GPU (Chrome headless + FFmpeg) y funcionan en una sesión cloud de Claude Code: en esta sesión (4 vCPU, 15 GB RAM, x86_64) había FFmpeg 6.1.1, Node 22, Bun, Python 3.13, uv y Google Chrome for Testing 153; Remotion falló al descargar su Chrome Headless Shell (host bloqueado por la red) pero renderizó 5 s 1080p30 en ~15 s usando el Chrome preinstalado; HyperFrames renderizó 10 s 1080p30 en ~15,5 s sin tocar nada. Blender, DaVinci Resolve, Premiere/AE, CapCut y GPU para WhisperX solo tienen sentido en local.

### Cited Findings
- Entorno observado (23‑nov‑2026): `ffmpeg 6.1.1`, `node v22.23.5`, `bun 1.4.4`, `python 3.13.18`, `uv 0.11.32`, `/usr/bin/google-chrome` = Chrome for Testing 153.0.8010.12; sin Chromium, Blender ni Manim; 4 núcleos, 15 GiB RAM, ~60 GB libres **[prueba propia]** — [Remotion Chrome Headless Shell docs](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell#download-hosts)
- Remotion: `npx create-video@latest --yes --hello-world` + instalación de dependencias ≈ 1 min; `npx remotion compositions` falló con "Could not download Chrome Headless Shell from https://remotion.media/… ENOTFOUND remotion.media" y el propio error sugiere permitir los hosts de descarga, ejecutar `npx remotion browser ensure` en el build o pasar `browserExecutable`; con `npx remotion render HelloWorld out/hello.mp4 --browser-executable=/usr/bin/google-chrome` renderizó 150 frames (1920×1080, 30 fps, h264, 5 s, 882 KB) en 14,7 s **[prueba propia]** — [remotion.dev chrome-headless-shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell#download-hosts)
- HyperFrames v0.9.83: `npx hyperframes doctor` detectó Chrome (env `/usr/bin/google-chrome`), FFmpeg/FFprobe, 16 GB de /dev/shm; faltaban whisper-cpp (opcional, transcripción), Kokoro TTS y MusicGen (opcionales); render de la plantilla inicial: 300 frames, 1920×1080, 30 fps, 10 s en 15,5 s con 2 workers, en modo "screenshot capture · software gpu" (BeginFrame necesita chrome-headless-shell; composiciones pesadas pueden atascarse con GL por software) **[prueba propia]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- HyperFrames ofrece `hyperframes cloud render` en la nube de HeyGen "no local Chrome/ffmpeg" y Lambda/Cloud Run **[prueba propia / oficial]** — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- Una fuente afirma que FFmpeg viene incluido en cada proyecto Remotion (no hace falta instalarlo aparte) **[3ª parte]** — [OpenReplay](https://blog.openreplay.com/making-videos-claude-code-remotion/)
- Requisitos locales: Remotion `engines.node` `^20.19.0 || ^22.13.0 || >=24` **[prueba propia]**; HyperFrames Node 22+ y FFmpeg **[oficial]** — [GitHub hyperframes](https://github.com/heygen-com/hyperframes); blender-mcp Blender 3.0+/Python 3.10+ **[oficial]** — [GitHub](https://github.com/ahujasid/blender-mcp); Resolve MCP Resolve 18.5+ (Studio) y Python 3.10–3.12 **[oficial]** — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp); WhisperX CUDA 12.8 para GPU o CPU int8 **[oficial]** — [GitHub](https://github.com/m-bain/whisperX)
- El chat normal de Claude (sin Code) no edita archivos de vídeo; sirve para guion/plan **[3ª parte]** — [shwetacreates](https://shwetacreates.substack.com/p/how-to-edit-videos-with-claude-code)

### Inferences
- En Claude Code web, si `remotion.media` no está en la allowlist, añadir `Config.setBrowserExecutable('/usr/bin/google-chrome')` en `remotion.config.ts` o el flag `--browser-executable` evita el bloqueo; alternativamente pedir a quien gestiona el entorno que permita los hosts de descarga.
- Subir/bajar vídeos pesados a una sesión cloud es el cuello de botella real (no el render); para metraje de cámara (GB) conviene Claude Code local o Descript.
- Un portátil moderno (Apple Silicon/8+ núcleos) debería renderizar estas piezas cortas igual o más rápido que los 4 vCPU de la nube (inferencia, no medido).

### Gaps
- No encontré documentación oficial de Anthropic sobre qué binarios trae la imagen de Claude Code web (puede variar por entorno); los datos son de una sola sesión.
- No medí composiciones complejas (vídeo de fondo, blur, 3D), donde el modo GL por software puede ser mucho más lento.

---

## 9. Prompts, flujos y consejos de creadores; fallos comunes

### Takeaway
Los casos virales de 2026 siguen el mismo patrón: dar a Claude Code una carpeta de clips + ejemplos de vídeos previos + pocas instrucciones; Claude transcribe, agrupa, reordena, corta y añade títulos/subtítulos con ffmpeg/Remotion (o vía Resolve MCP). Los fallos típicos son layout de texto en vertical, timing vago, diseño "plano" si no se dan assets/fuentes, y renders bloqueados por Chrome.

### Cited Findings
- Branden Flasch (X, 17‑oct‑2026): vídeo "entirely edited by @claudeai": entregó a Claude Code la carpeta de clips y algunos vídeos anteriores como ejemplo; tras pocos prompts estaba listo para subir **[creador]** — [X @brandenflasch](https://x.com/brandenflasch/status/2111557583718777002)
- Allie K. Miller (X, 9‑jul‑2026): una amiga convirtió 7 vídeos (25 min) en un vídeo de boda de 10 min en 2 prompts; Claude revisó, transcribió, agrupó escenas por tema, reordenó y recortó **[creador]** — [X @alliekmiller](https://x.com/alliekmiller/status/2075234352217149787)
- @levelsio: "Video editing with Claude Code" **[creador]** — [X @levelsio](https://x.com/levelsio/status/2034817543387427089)
- Hamza Khalid: tutorial "How to Edit VIRAL Instagram Reels Using Claude Code" (presentador IA + edición del reel en una terminal) **[creador]** — [X @humzaakhalid](https://x.com/humzaakhalid/status/2112801267710095825)
- Theo: "how to make viral videos with Claude Code for $0 (full guide)" **[creador]** — [X @theoxmotion](https://x.com/theoxmotion/status/2116684286837330374)
- Ansub Khan: Claude Code + DaVinci Resolve MCP: cortó retomas y silencios, añadió música y overlays, render 4K **[creador]** — [ansubkhan.com](https://ansubkhan.com/blogs/davinci-resolve)
- Prompts de vídeo con Claude Code (5 ejemplos) **[creador]** — [sabrina.dev](https://www.sabrina.dev/p/5-insane-claude-code-video-prompts)
- Consejos de prompting Remotion: timing por escena, ≥3 técnicas de animación (spring de entrada, interpolate continuo, salida con easing), assets/colores/fuentes explícitos, comprobación de layout en el aspecto final **[3ª parte]** — [mindstudio](https://mindstudio.ai/blog/remotion-claude-code-animated-logo-reveals-motion-graphics); [autoae.online](https://autoae.online/blog/claude-code-remotion-tutorial)
- HyperFrames: prompt de arranque "Using /hyperframes, create a 15-second intro about [your topic]" y guía de prompting oficial **[oficial / prueba propia]** — [hyperframes.heygen.com](https://hyperframes.heygen.com/guides/hyperframes-vs-remotion)
- Fallos y arreglos de render: timeout `delayRender()` → falta `continueRender()`; cuelgues con Chrome nuevo → Chrome Headless Shell; en Lambda revisar el campo `errors` y reproducir con `npx remotion lambda render … --log=verbose` **[oficial, fragmento]** — [remotion.dev Lambda debug](https://www.remotion.dev/docs/lambda/troubleshooting/debug); [stuck render](https://remotion.dev/docs/troubleshooting/stuck-render)
- Fallos de edición de metraje: usar recodificado para cortes precisos (no `-c copy`), ajustar umbral de silencio en un clip de prueba **[3ª parte]** — [gettakes.app](https://gettakes.app/claude-code-video-editing)
- Seguridad: blender-mcp ejecuta Python arbitrario y Resolve MCP granular no archiva antes de escribir; Premiere MCP puede modificar proyectos → copia de seguridad **[oficial del proyecto]** — [blender-mcp](https://github.com/ahujasid/blender-mcp); [davinci-resolve-mcp](https://github.com/samuelgursky/davinci-resolve-mcp)

### Inferences
- Plantilla de prompt reutilizable (síntesis): "Tienes en ./raw 7 clips y en ./refs 2 vídeos míos de ejemplo. 1) Transcribe con WhisperX y guarda JSON por palabra. 2) Propón un montaje de 60 s para Reels 9:16 con gancho en los 3 primeros segundos; quita muletillas y silencios >0,4 s. 3) Enséñame la lista de cortes antes de renderizar. 4) Subtítulos estilo Hormozi con mi fuente X y color #… 5) Render 1080×1920 30 fps y −14 LUFS."
- Pedir siempre "previsualiza/extrae frames y revísalos antes del render final" reduce iteraciones (las skills de HyperFrames y Figma ya fuerzan este bucle).

### Gaps
- La mayoría de casos virales son autodeclarados; cifras de vistas no verificadas. No encontré URL del hilo de Wilco de Kreij citado por un agregador (~166k vistas).
- No hay tutoriales primarios en español de referencia identificados en esta búsqueda.
