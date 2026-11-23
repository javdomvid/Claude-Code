# Convierte Claude en tu estudio creativo

A 23 de noviembre de 2026 no hay una única forma correcta de usar Claude para vídeo y diseño. Hay rutas distintas según cuánto quieras programar, cuánto quieras gastar y qué tengas ya conectado. Tu cuenta cubre más de lo que parece. **Higgsfield** es una central generativa con unos 60 modelos de vídeo (Kling, Seedance, Veo 3.1, Gemini Omni, MiniMax, Wan) y ElevenLabs dentro, pero sin **ningún Sora**, porque OpenAI lo cerró en 2026. **Descript** edita por texto y saca clips verticales desde el chat. **Figma**, **Gamma** y el plugin de **Adobe** cubren el diseño y la adaptación de formatos. **Metricool** y **Postiz** programan y miden. Te falta la capa "con código": Claude Code con ffmpeg/WhisperX para cortar metraje, y Remotion o HyperFrames para motion graphics. Es gratis o casi y da el máximo control. Las rutas sin terminal son más rápidas, pero tienen límites de plan. Hay tres matices que condicionan lo que puedes hacer hoy. **Claude Motion** solo está en los planes Team y Enterprise. Tu conector de **Motion (motion.so) es de solo lectura**. Y la web independiente de **Claude Design cierra el 14 de diciembre**. Para que todas las piezas compartan un estilo que no sea el "look Claude" (crema, terracota #D97757, Inter, degradados morados), la propia Anthropic da la receta: escribir la paleta, la tipografía y las prohibiciones en una skill de marca que lean todas las herramientas. Para la TV española, el máster de entrega sigue siendo **1080i25 en MXF XDCAM HD422 a 50 Mbps y −23 LUFS**. Desde el **2 de agosto de 2026**, el artículo 50 del AI Act obliga al anunciante a etiquetar cualquier deepfake desde la primera exposición. Cada bloque del informe compara entre 4 y 8 alternativas por coste, dificultad, riesgos y lo que ya tienes conectado. En vez de declarar un ganador único, cierra con una recomendación por perfil. Al final hay una tabla con las contradicciones entre fuentes.

## Tres superficies, once servicios: qué corre dónde

Casi todos los atascos de quien empieza a crear con Claude vienen de usar una pieza en la superficie equivocada. En noviembre de 2026 todo se gestiona desde **Customize**, en claude.ai o en la app de escritorio: **Customize > Skills**, **Customize > Plugins** y **Customize > Connectors**. Además, el interruptor **Code execution and file creation** de **Settings > Capabilities** tiene que estar activado para que funcione cualquier skill ([Claude Help Center](https://support.claude.com/en/articles/12512180-use-skills-in-claude)). Un plugin que añades ahí se guarda en tu cuenta y aparece en Cowork y en Claude Code sin reinstalarlo ([Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)). En la terminal se ve como `<nombre>@synced`. Al revés no funciona: lo que instalas con `/plugin` en la terminal no sube a claude.ai ([Claude Code Docs: plugins](https://code.claude.com/docs/en/discover-plugins)). Los conectores remotos (una URL) funcionan en todas partes, también en el móvil. Los servidores locales (stdio o extensiones `.mcpb`) solo funcionan en la app de escritorio, en Claude Code y en Cowork local ([Claude Docs: custom connectors](https://claude.com/docs/connectors/custom/add-unlisted.md)). Claude Code en el navegador (claude.ai/code) "has no plugin browser and doesn't load the plugins you installed at user or local scope". Por eso, en las sesiones en la nube las skills tienen que ir dentro del repositorio, en `.claude/skills/` ([Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)).

La segunda frontera separa conversar de ejecutar. El chat normal no edita archivos de vídeo; sirve para el guion y la lista de planos. Todos los casos de "Claude editó mi vídeo" son Claude Code ejecutando ffmpeg, Whisper y Remotion en el ordenador del creador ([shwetacreates](https://shwetacreates.substack.com/p/how-to-edit-videos-with-claude-code)). La tercera frontera afecta solo a Adobe. Su MCP (`https://adobe-creativity.adobe.io/mcp`) solo funciona en la app de escritorio o en Cowork. La CLI de Claude Code recibe un error 403 y Adobe no piensa darle soporte ([GitHub adobe/skills](https://github.com/adobe/skills)). Cowork es el agente de escritorio de Claude y tiene plugins desde enero de 2026 ([TechCrunch](https://www.techcrunch.com/2026/01/30/anthropic-brings-agentic-plugins-to-cowork/)). Si quieres trabajar con Photoshop, Express o InDesign sin terminal, es la vía natural.

Con ese mapa, esto es lo que aporta cada servicio de tu cuenta y dónde está su techo:

| Servicio en tu cuenta | Qué puede hacer Claude con él | Límite a tener en cuenta |
|---|---|---|
| Higgsfield (conector) | Imagen, vídeo, audio, clonación de voz, 3D, Ads/Marketing Studio, reencuadre, publicar en TikTok, leer y escribir en Meta Ads | Cada generación gasta créditos; lo "Unlimited" y las generaciones gratis solo valen en la web ([Higgsfield Help](https://higgsfield.ai/creator-hub/help-center/mcp-cli/how-do-i-connect-higgsfield-to-claude)) |
| Descript (conector) | Transcribir, editar con Agent Underlord, sacar clips sociales, exportar SRT y líneas de tiempo a Resolve/Premiere, publicar | No exporta un archivo final sin publicarlo; gasta minutos de media y créditos IA ([Descript Help](https://help.descript.com/api-and-mcp/mcp-claude)) |
| Figma (conector + plugin) | Diseñar con tu sistema, imagen generativa, shaders, animación por keyframes exportada a MP4 | Escribir exige asiento Full; "write to canvas" está en beta y pasará a pago por uso ([Figma Help](https://help.figma.com/hc/en-us/articles/42495251338775-Write-to-canvas)) |
| Gamma (conector) | Posts sociales 1:1, 4:5 y 9:16, carruseles, decks, imágenes con tema de marca, exportar a PNG/PDF/PPTX | No publica en Instagram ([Gamma](https://gamma.app/explore/content/guides/using-ai-for-social-media-to-generate-high-quality-graphics)) |
| Metricool (conector) | Programar en redes, ver las mejores horas, analítica, marcar contenido IA | El plan Free se queda en 20 posts programados ([Metricool FAQ](https://help.metricool.com/faqs-about-the-metricool-mcp-1i3w0)) |
| Adobe for Creativity (plugin) | 109 herramientas en Photoshop, Firefly, Express, InDesign, Premiere, Lightroom y Stock ([claude.com](https://claude.com/connectors/adobe-creativity)) | Solo en la app de escritorio o en Cowork |
| Canva (plugin small-business) | La skill `canva-creator` para posts sociales | En Pro/Teams no hay autofill; las Brand Templates son solo de Enterprise ([Canva Help](https://www.canva.com/en_in/help/mcp-canva-usage/)) |
| Postiz (plugin) | Programar en más de 28 redes desde una CLI | Hay que subir antes cada archivo ([Postiz docs](https://docs.postiz.com/public-api/introduction)) |
| Netlify (conector) | Publicar landings de Claude Design y artifacts | Si subes a mano, necesita un `index.html` en la raíz ([Netlify KB](https://www.netlify.com/knowledge-base/deploy-your-claude-artifacts-to-netlify/)) |
| Lucid (conector) | Diagramas, mapas mentales y tableros para planificar campañas y storyboards | No produce piezas finales |
| Motion de motion.so (conector) | Leer chats y exportaciones ya hechas, renovar enlaces de descarga | No crea ni edita vídeo; eso se hace en la app de [motion.so](https://motion.so) |

Esa última fila evita una confusión cara. **Motion (motion.so)** es una app de vídeo de terceros. Su conector se describe ante Claude con estas palabras: la creación, la edición, la animación, la música, las voces y las automatizaciones "are available in the Motion app… They cannot run through this connector". **Claude Motion** es otra cosa: un producto de Anthropic que @claudeai presentó así: "turns reports, charts, or product walkthroughs into short animations. Claude writes each one as code, with no video model involved, so you can change any word, number, or timing, then export an MP4. In beta on Team and Enterprise plans" ([X @claudeai](https://x.com/claudeai/status/2108271558170976743)). Se lanzó el 8 de octubre de 2026 junto con Claude Dashboards ([technology.org](https://www.technology.org/2026/10/09/claude-dashboards-motion-beta-launch/)). Anima texto, gráficos, formas e imágenes tuyas, pero no genera metraje ni personas ([Unite.AI](https://unite.ai/anthropic-launches-claude-dashboards-and-motion-takes-docs-out-of-beta)). A 31 de octubre no estaba disponible en Free, Pro ni Max ([aicatchup](https://aicatchup.com/news/claude-dashboards-motion-beta)). Anthropic no ha publicado ni la duración máxima ni la resolución ([Layer3 Labs](https://www.layer3labs.io/guides/claude-motion)). Un medio alemán habló de "clips de 30 segundos", pero ese límite no está confirmado ([BornCity](https://borncity.com/news/anthropic-startet-claude-motion-30-sekunden-clips-aus-geschaeftsdaten/)). Lo que sí está listo es el puente. El conector de Descript tiene `import-claude-motion-from-url`, que recoge el MP4 desde una URL que caduca en menos de 10 minutos y lo mete en un proyecto. Si reenvías el vídeo, actualiza el import que ya existía en vez de duplicarlo ([Descript Help](https://help.descript.com/api-and-mcp/mcp-claude)).

## Edición de vídeo: ocho rutas, del chat a la terminal

Editar con Claude son dos trabajos distintos que conviene no mezclar. Uno es **cortar metraje real**: quitar silencios, muletillas y tomas falsas, montar y subtitular. El otro es **crear animación**: tipografía cinética, rótulos, gráficos y transiciones. Algunas rutas solo hacen uno de los dos, y casi todo lo que ves en redes combina una ruta de cada tipo. La tabla las ordena de menos a más técnica. Las marcas entre corchetes señalan datos sin verificar o contradictorios.

| Opción | Para qué sirve mejor | Coste aproximado | Configuración | Limitaciones y riesgos | ¿Ya lo tienes? |
|---|---|---|---|---|---|
| Descript + Agent Underlord (conector) | Cortar por texto, quitar muletillas, subtitular, sacar Reels/Shorts, traducir | Plan de Descript (Creator, unos 24 $/mes en pago anual **[dato de tercero, sin verificar]**), más los minutos y créditos IA que gastes | Baja: ya conectado | Sin exportación de archivo si no publicas en Descript; el conector del directorio no trae herramientas generativas | Sí |
| Claude Motion | Animar datos, informes y walkthroughs como código y exportar a MP4 | Incluido en Team/Enterprise; gasta del límite de uso | Baja | Beta; duración, resolución y fps sin publicar **[sin verificar]**; no genera ni personas ni metraje | Depende de tu plan; el puente a Descript sí lo tienes |
| Figma Motion vía MCP | Rótulos, logos y títulos animados a partir de tu diseño | Asiento Full de Figma; el render en servidor es "lento y caro" | Media | Vía MCP solo exporta MP4; las APIs de motion pueden no estar activadas en tu cuenta; exportación Lottie **[contradictorio]** | Sí (conector + plugin) |
| HyperFrames (HeyGen) | Motion graphics en HTML/GSAP con unos 450 bloques listos; vídeo a partir de una web | Gratis (Apache 2.0); gasta más tokens **[anecdótico]** | Baja-media: plugin + `init` | La comunidad lo ve menos fino en diseño que Remotion | No (está en el directorio) |
| Remotion | Motion graphics en React, subtítulos tipo TikTok, versiones a partir de datos, render en Lambda | Gratis hasta 3 personas; empresas desde unos 100 $/mes **[cifras contradictorias]** | Media-alta: Node y React | La licencia cambiará en Remotion 5.0; en la nube puede fallar la descarga de Chrome | No |
| Claude Code + ffmpeg/WhisperX/auto-editor | Cortar metraje real con lista de cortes, silencios fuera, subtítulos quemados, −14 LUFS | Gratis (open source) + tokens | Media: terminal, Python y FFmpeg | Sin interfaz; hay que recodificar para cortar con precisión; los umbrales se ajustan a mano | No (requiere Claude Code local) |
| DaVinci Resolve Studio + MCP | Acabado profesional: línea de tiempo, color, Fusion, Fairlight y render | MCP gratis (MIT); Resolve Studio es de pago | Media-alta | La versión gratuita perdió el scripting en la 21.1; no elige la mejor toma | No |
| Premiere/After Effects (MCP comunitarios) y CapCut | Seguir trabajando en tu NLE de siempre | Gratis + suscripción de Adobe | Alta | Los puentes CEP/UXP se rompen con facilidad; CapCut no tiene API oficial; el MCP oficial de Adobe está en beta privada a principios de 2027 | No |

| Si buscas… | Ruta recomendada | Por qué, y con qué cuidado |
|---|---|---|
| Rapidez sin código | Descript desde el chat; Claude Motion si tienes Team/Enterprise; Figma Motion para rótulos | Ya está conectado. Vigila los minutos y créditos, y ten en cuenta que la salida es un enlace publicado |
| Control total y diseño fino | Claude Code + Remotion, con acabado en Resolve Studio vía MCP o XML | Máxima precisión y render escalable; exige Node/React y revisar la licencia si sois 4 o más |
| Lo más barato | Claude Code + ffmpeg/WhisperX/auto-editor para cortar y HyperFrames para animar | Todo es open source, también para empresas; el coste son tus tokens |
| Seguir en Premiere/After Effects | Descript o auto-editor exportando XML a tu NLE, a la espera del MCP oficial de Adobe | Los MCP comunitarios pueden romperse con cada versión; haz copia del proyecto |

### Los vídeos "editados por Claude" siguen todos el mismo guion

Los casos virales de 2026 repiten patrón. Branden Flasch dio a Claude Code la carpeta de clips y algunos vídeos anteriores como ejemplo, y tras pocos prompts tenía el vídeo listo para subir ([X @brandenflasch](https://x.com/brandenflasch/status/2111557583718777002)). Una amiga de Allie K. Miller convirtió siete vídeos (25 minutos) en un vídeo de boda de 10 minutos con dos prompts. Claude transcribió, agrupó las escenas por tema, reordenó y recortó ([X @alliekmiller](https://x.com/alliekmiller/status/2075234352217149787)). La mecánica es siempre la misma. Whisper o WhisperX transcriben con marcas de tiempo por palabra, Claude lee esa transcripción como un "paper edit" y escribe la lista de cortes, y ffmpeg la ejecuta ([jordanhongtai.com](https://www.jordanhongtai.com/guides/claude-code-video-editor)). Para los silencios se usa el filtro `silencedetect` de ffmpeg: los huecos de más de 0,5 s se recortan a pausas de 0,3 s. Hay que recodificar en vez de copiar el flujo (`-c copy`) para que el corte caiga en el fotograma exacto ([gettakes.app](https://gettakes.app/claude-code-video-editing)).

Para cortar metraje real hay cuatro piezas maduras. **auto-editor** (unas 6,1k estrellas) quita silencios con un solo comando y exporta la línea de tiempo a Premiere, Resolve o Final Cut ([GitHub auto-editor](https://github.com/WyattBlue/auto-editor)). **WhisperX** (unas 25,6k estrellas) da marcas de tiempo por palabra alineando con wav2vec2, funciona en CPU con `int8` y genera SRT con resaltado ([GitHub whisperX](https://github.com/m-bain/whisperX)). **ffmpeg-skill** (unas 9,8k estrellas, MIT) reúne 42 herramientas y un servidor MCP: subtítulos SRT/ASS tipo karaoke, reencuadre a 9:16 por recorte, detección de silencios a −35 dB y normalización a −14 LUFS/−1 dBTP para redes ([GitHub ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill)). **Kinocut** (Apache-2.0, versión 2.0.1 del 10 de noviembre) añade controles de calidad que detectan fotogramas negros, silencios y problemas de volumen ([GitHub Kinocut](https://github.com/KyaniteLabs/mcp-video)). Si prefieres algo más guiado, **MakeMyClip** quita silencios y tomas repetidas y exporta FCPXML 1.10 y XML de Premiere sin API key ([GitHub MakeMyClip](https://github.com/MakeMyClip/editor)). Otra opción es **claude-code-video-toolkit**, que trae plantillas y los comandos `/video`, `/scene-review` y `/generate-voiceover`. Con modelos abiertos en GPU propia, sus autores midieron un vídeo de 90 s en 0,33 $ ([GitHub digitalsamba](https://github.com/digitalsamba/claude-code-video-toolkit)).

```bash
pip install whisperx
whisperx entrevista.wav --compute_type int8 --device cpu --highlight_words True
auto-editor entrevista.mp4 --margin 0.2sec --export resolve
npx ffmpeg-skill setup && npx ffmpeg-skill doctor
claude mcp add kinocut -- uvx --from kinocut==2.0.1 kino --mcp
# MakeMyClip como plugin, dentro de una sesión de Claude Code:
/plugin marketplace add MakeMyClip/editor
/plugin install makemyclip-editor@makemyclip
```

Esta plantilla de prompt resume lo que funciona en esos flujos (es una síntesis de las guías citadas):

```text
Tienes en ./raw 7 clips y en ./refs 2 vídeos míos de ejemplo.
1) Transcribe con WhisperX y guarda un JSON por palabra.
2) Propón un montaje de 60 s para Reels 9:16 con gancho en los 3 primeros segundos;
   quita muletillas y silencios de más de 0,4 s.
3) Enséñame la lista de cortes antes de renderizar.
4) Subtítulos estilo Hormozi con mi fuente [X] y color [#…], dentro de una caja de 900×1400 centrada.
5) Extrae 6 fotogramas y revísalos; después renderiza a 1080×1920, 30 fps y −14 LUFS.
```

El último paso profesional no debería ser el render de ffmpeg, sino tu NLE. auto-editor y MakeMyClip exportan la línea de tiempo, y Descript la exporta en EDL, AAF, FCPXML, Premiere XML y DaVinci Resolve XML ([Descript Help](https://help.descript.com/api-and-mcp/mcp-claude)). Así el pulido final (color, mezcla, ajustes de corte) se hace con herramientas de editor. Ninguna fuente primaria documenta que se inserte B-roll de calidad de forma automática. En la práctica se resuelve con overlays en Remotion o HyperFrames o con el stock media de Underlord.

### Remotion frente a HyperFrames, en detalle

**Remotion** convierte componentes React en MP4. Renderiza en local con Chrome headless o en AWS Lambda. Su repositorio oficial de skills, `remotion-dev/skills` (unas 7,8k estrellas), trae 13 skills que se invocan como comandos. Entre ellas están `/remotion-best-practices`, la general; `/remotion-markup`, para composición, animación, tipografía y timing; `/remotion-captions`, con subtítulos tipo TikTok que resaltan palabra a palabra e importación de SRT; `/remotion-render` y `/remotion-license` ([GitHub remotion-dev/skills](https://github.com/remotion-dev/skills)). La plantilla probada instala `remotion` 4.0.545 y exige Node `^20.19.0`, `^22.13.0` o `>=24` ([Remotion docs](https://www.remotion.dev/docs/cli/create-video)). La licencia es gratuita para particulares y empresas de hasta 3 personas. A partir de 4 hace falta Company License, y las cifras no cuadran entre fuentes. La página oficial da un plan "Automators" de 100 $/mes. Otras fuentes hablan de 25 $ por asiento con un mínimo de 100 $/mes, o de 0,01 $ por render. El propio LICENSE avisa de que "en Remotion 5.0 la licencia cambiará ligeramente" ([Remotion pricing](https://www.remotion.dev/docs/license/pricing); [LICENSE](https://unpkg.com/remotion@4.0.489/LICENSE.md)). Para que no salga "plano", hay que dar el timing por escena en segundos, los assets, las fuentes y los colores, y decir qué no debe inventar ([autoae.online](https://autoae.online/blog/claude-remotion-videos-look-flat)). También conviene pedir que compruebe los titulares en vertical, porque es donde más se rompen ([autoae.online](https://autoae.online/blog/claude-code-remotion-tutorial)). Hay un detalle de instalación con dos versiones oficiales. Una página dice que las skills van a `.agents/skills` con un enlace simbólico desde `.claude/skills`, y otra más antigua dice `.claude/skills` ([Remotion CLI skills](https://www.remotion.dev/docs/cli/skills)). Si Claude no las ve, crea el enlace o instala con `--agent claude-code`.

**HyperFrames**, de HeyGen, salió como open source a mediados de abril de 2026 con licencia Apache 2.0 y ya tiene unas 88k estrellas. Convierte HTML/CSS/JS (con GSAP por defecto) en MP4 y requiere Node 22+ y FFmpeg ([GitHub HyperFrames](https://github.com/heygen-com/hyperframes)). En una prueba hecha durante esta investigación, `npx hyperframes init` detectó Claude Code. Instaló seis skills, entre ellas `reverse-any-video`, que reconstruye cualquier vídeo como proyecto editable, y `style-sampling`, y escribió un `CLAUDE.md`. Su registro ofrece unos 450 bloques: transiciones, kinetic type, subtítulos, mapas y 3D. Exporta WebM transparente para usarlo como overlay y puede renderizar en la nube de HeyGen ([GitHub HyperFrames](https://github.com/heygen-com/hyperframes)). La guía oficial de comparación concede a Remotion un renderizador en la nube más maduro ([HyperFrames vs Remotion](https://hyperframes.heygen.com/guides/hyperframes-vs-remotion)). La comunidad lo ve "más fácil de empezar, consume más tokens, más lento y con menos acierto en diseño" ([moda.app](https://moda.app/blog/hyperframes-vs-remotion)), aunque es una opinión anecdótica.

```bash
# Remotion: proyecto nuevo con las 13 skills oficiales
npx create-video@latest --yes --blank mi-video --skills
cd mi-video && claude            # pide el vídeo escena a escena, con timing
npm run dev                       # Remotion Studio para revisar
npx remotion render <Composicion> out/video.mp4
#   en sesiones cloud sin acceso a remotion.media, añade: --browser-executable=/usr/bin/google-chrome

# HyperFrames: plugin + proyecto
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
npx hyperframes init mi-video
#   en Claude: "Using /hyperframes, create a 15-second intro about [tema]"
npx hyperframes add flash-through-white     # un bloque del registro
npx hyperframes render -o out.mp4           # o --format webm para overlay transparente
```

Los dos funcionan sin GPU. En una sesión de Claude Code en la nube (4 vCPU y 15 GB) el 23 de noviembre, Remotion no pudo descargar su Chrome Headless Shell porque el dominio estaba bloqueado. Aun así, renderizó 5 s a 1080p30 en 14,7 s usando el Chrome preinstalado ([Remotion docs](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell#download-hosts)). HyperFrames renderizó 10 s en 15,5 s sin tocar nada ([GitHub HyperFrames](https://github.com/heygen-com/hyperframes)). El cuello de botella real en la nube no es el render, sino subir gigas de metraje de cámara. Para ese trabajo, Claude Code en local o Descript.

### Descript, Claude Motion y Figma: la vía sin terminal

El conector de Descript es la opción sin código más completa. **Agent Underlord** recorta, reordena, quita muletillas, añade subtítulos e importa stock media. En `prompt_project_agent` puedes elegir su modelo (`claude-opus-5.5`, `claude-sonnet-5.5`, GPT o Gemini). `create_social_clips` devuelve composiciones editables para TikTok, Reels y Shorts, no archivos renderizados. `export_transcript` saca SRT y `publish_project` devuelve los enlaces para compartir y descargar el MP4 ([Descript Help](https://help.descript.com/api-and-mcp/mcp-claude)). El conector del directorio no incluye las herramientas generativas de imagen y vídeo. Para tenerlas, o para usarlo desde Claude Code, hay que configurar el MCP a mano con `https://api.descript.com/v2/mcp` ([Descript Help: custom](https://help.descript.com/api-and-mcp/mcp-custom)). En Claude Code eso es `claude mcp add --transport http descript https://api.descript.com/v2/mcp` (es la sintaxis estándar; Descript no publica el comando exacto). Un prompt tipo: "Importa este vídeo, transcríbelo, pide a Underlord que quite muletillas y silencios, subtitula con mi tipografía, crea tres clips 9:16 de 30 s y exporta la línea de tiempo en XML de Resolve".

**Figma Motion** añadió en Config 2026 una línea de tiempo con keyframes a Figma Design. Se despliega gradualmente desde el 24 de junio de 2026 ([Figma blog](https://www.figma.com/blog/introducing-figma-motion/)). Desde Claude, la skill `figma-use-motion` crea animaciones (incluidos revelados de texto con `TextStagger`). `get_motion_context` devuelve el código equivalente en CSS @keyframes y motion.dev. `export_video` renderiza el frame a MP4, y solo a MP4, a 5–60 fps y hasta 4096 px ([Figma Help](https://help.figma.com/hc/en-us/articles/39582753756695)). La skill avisa de que la exportación es lenta y cara. Lo práctico es planificar 4–6 fotogramas clave, revisar a 320 px con `quality: "low"` y a 5–10 fps, y exportar en alta solo la versión final. Sirve para rótulos, logos y títulos que luego entran como overlay en Descript, Resolve o Remotion. No sirve para piezas largas.

### Resolve, Premiere, 3D y explicativos

Con el NLE, la integración más sólida es **DaVinci Resolve**. El MCP `samuelgursky/davinci-resolve-mcp` (MIT, unas 4,3k estrellas) ofrece 37 herramientas por defecto y 390 en modo granular. Cubre línea de tiempo, marcadores, nodos de color, LUT, Fusion, cola de render y Fairlight. Se instala con `npx davinci-resolve-mcp setup`, que configura Claude Desktop y Claude Code. Tiene límites. No elige la mejor toma ni juzga los cortes. Y en la práctica exige **Resolve Studio**, porque la versión 21.1 movió el scripting en Python a Studio ([GitHub davinci-resolve-mcp](https://github.com/samuelgursky/davinci-resolve-mcp)). Hay un caso documentado de Claude Code con este MCP que cortó tomas repetidas y silencios, añadió música y overlays y renderizó en 4K ([Ansub Khan](https://ansubkhan.com/blogs/davinci-resolve)). Para Premiere y After Effects solo hay MCP comunitarios que dependen de paneles CEP/UXP, que se rompen entre versiones ([premiere-pro-mcp](https://github.com/leancoderkavy/premiere-pro-mcp); [mcp-aftereffects](https://github.com/kumoproductions/mcp-aftereffects)). Adobe presentó en MAX (10 de noviembre de 2026) integraciones MCP locales para Photoshop, Illustrator, Premiere y After Effects, con beta privada a principios de 2027 ([TechCrunch](https://techcrunch.com/2026/11/10/adobe-adds-more-ai-to-its-products-and-launches-an-mcp/)). CapCut no tiene API oficial: los MCP existentes generan borradores sobre VectCutAPI y su compatibilidad es incierta ([GitHub capcut-mcp-server](https://github.com/Atx-Guy/capcut-mcp-server)). Para 3D, `claude mcp add blender uvx mcp-for-blender` conecta Blender. Ojo: ejecuta Python arbitrario por un socket sin autenticación ([GitHub mcp-for-blender](https://github.com/ahujasid/blender-mcp)). Para animaciones Lottie está el MCP oficial de LottieFiles ([LottieFiles docs](https://docs.lottiefiles.com/en/creator/13_ai-tools/lottie-creator-mcp)), y para explicativos estilo 3Blue1Brown hay skills comunitarias de Manim ([manim_skill](https://github.com/adithya-s-k/manim_skill)).

## Generar vídeo desde imagen: un hub conectado y seis alternativas

Antes de comparar, un descarte: **Sora no es una opción**. OpenAI anunció el 24 de marzo de 2026 que cerraba la app y la API ([Axios](https://www.axios.com/2026/03/24/openai-discontinue-sora-video-app); [PetaPixel](https://petapixel.com/2026/03/24/openai-kills-sora-and-loses-disneys-1b-investment/)). Las fechas de apagado más citadas son el 26 de abril para la app y el 24 de septiembre para la API ([Zilliz](https://zilliz.com/ai-faq/what-is-the-sora-shutdown-timeline); [Pillitteri](https://pasqualepillitteri.it/en/news/18764/openai-sora2-api-dismessa-en)). El catálogo de Higgsfield, consultado en vivo el 23 de noviembre, no incluye ningún modelo Sora ([Higgsfield MCP](https://mcp.higgsfield.ai/mcp)). Con eso descartado, estas son las rutas reales:

| Opción | Para qué sirve mejor | Coste aproximado | Configuración | Limitaciones y riesgos | ¿Ya lo tienes? |
|---|---|---|---|---|---|
| Higgsfield (MCP) | Todo en uno desde el chat: unos 60 modelos de vídeo, Marketing/Ads Studio, personajes, reencuadre, TikTok/Meta | Plus 49 €/mes (1.000 créditos) o Ultra 129 € (3.000); un clip va de unos 0,43 € (Kling 3.0, 5 s) a unos 7,84 € (Seedance 2.5, 10 s 1080p) a precio de lista | Baja | "Unlimited" no vale vía MCP; licencia de entrenamiento sobre tus archivos **[contradictorio]**; tu workspace parece no tener plan activo **[verificar]** | Sí |
| Figma Weave / `generate_image` | Imagen→vídeo con Kling, Runway, Luma o Wan en un lienzo de nodos repetible, junto a tu diseño | Créditos de Weave / Figma AI **[coste sin verificar]** | Baja-media | Pide confirmar el coste en cada ejecución; las imágenes llegan a 2048 px como máximo | Sí |
| Runway (MCP alojado) | Gen-4.5, edición de vídeo con Aleph; también revende Kling y Seedance | API: Gen-4.5 a 0,12 $/s; Kling 4.0 1080p a 0,235 $/s; Seedance 2.5 1080p a 0,68 $/s | Baja: sin API key, consume tu plan | El plan gratis exporta con marca de agua | No |
| fal.ai / Replicate (MCP) | Scripts reproducibles en lote con cientos de modelos, incluidos los abiertos | Pago por uso según modelo **[precios no recopilados]** | Media | Los precios cambian; la documentación de fal se contradijo sobre OAuth | No |
| Google directo (Gemini API / Vertex) | Gemini Omni 1.2 Flash barato y hasta 4K; scripts propios | 0,07 $/s a 720p, 0,104 $/s a 1080p, 0,209 $/s en 4K | Media-alta: API, sin MCP en las notas | Veo no estaba disponible en el EEE; endpoints preview de Veo 3.1 retirados **[sin verificar en la web oficial]** | No |
| Magnific (antes Freepik) / Krea | Estudio web con login; Kling 3.0 y otros; Magnific se usó en el spot de Aegon | Kling 3.0 en Magnific: 70–140 créditos/s | Baja | Si están en el directorio de Claude **[sin confirmar]** | No |
| Local: ComfyUI + LTX-2 / Wan 2.2 | Privacidad, LoRA propias, coste marginal cero | GPU de 16–24 GB de VRAM y 64 GB de RAM; LTX-2 gratis por debajo de 10 M$ de ingresos | Alta | Calidad por debajo de Seedance/Kling/Omni; los pesos de MiniMax H3 excluyen la UE | No |

| Si buscas… | Ruta recomendada | Por qué, y con qué cuidado |
|---|---|---|
| Rapidez sin código | Higgsfield desde el chat: Marketing Studio para producto y `generate_video` a partir de un keyframe | Pide siempre `estimate_video_cost` antes de lanzar un lote |
| Máximo realismo con audio | Seedance 2.0/2.5, Gemini Omni 1.2 Flash o Veo 3.1 dentro de Higgsfield | Seedance es, con diferencia, el más caro |
| Lo más barato por segundo | Kling 3.0, Veo 3.1 Lite, MiniMax H3 o Wan 3.0 en Higgsfield con plan anual; o Omni 1.2 Flash a 720p por API | Con Ultra anual en promoción, el crédito sale a unos 0,015 € |
| Control y automatización | fal o Replicate desde Claude Code, con scripts versionados | Sin suscripción; tú controlas prompts, seeds y costes |
| Privacidad o un personaje de marca entrenado | ComfyUI local con LoRA, o `gpu_lora_import` de Higgsfield | Requiere GPU propia o alquilada; la calidad queda por debajo de la gama alta |

### Lo que cuesta cada clip dentro de Higgsfield

Higgsfield es hoy el hub más completo que se puede conectar a Claude. Es un único MCP remoto (`https://mcp.higgsfield.ai/mcp`, con OAuth y sin API key) que, en la consulta en vivo, expuso unos 60 modelos de vídeo, 54 de imagen y 11 de audio. Sus herramientas cubren la generación en lote, la estimación de costes, el upscale, `reframe` (16:9, 9:16, 4:3, 3:4, 1:1 y 21:9 hasta 60 s), `motion_control`, el 3D, los elementos de referencia, AI Influencer, Ads Studio, Marketing Studio, la publicación en TikTok, Meta Ads y el alquiler de GPU con LoRA ([Higgsfield MCP](https://mcp.higgsfield.ai/mcp)). La consulta devolvió precios en euros para tu cuenta. El plan Plus da 1.000 créditos al mes por 49 € de lista y Ultra da 3.000 por 129 €. Había una promoción de Black Friday **válida hasta el 24 de noviembre**: Plus a 25 €/mes y Ultra a 45 €/mes con facturación anual. Todos los precios son sin IVA. La letra pequeña del servidor importa: "Unlimited models and Free Generations on plans are accessible only via higgsfield.ai and are not accessible on MCP/CLI". Todo lo que pidas desde Claude se paga en créditos. La prueba gratuita de 3 días vía MCP exige tarjeta y se renueva a Ultra (75 € y luego 129 €/mes) salvo que la canceles. La consulta mostró además la pestaña "Upgrade" y que tu cuenta podía activar la prueba. Eso sugiere que tu workspace **no tiene ahora un plan de pago activo**: compruébalo antes de lanzar lotes ([Higgsfield MCP](https://mcp.higgsfield.ai/mcp)). Estos son los presupuestos reales que devolvió `estimate_*_cost`, que calcula sin lanzar el trabajo. Los euros están calculados por crédito a precio de lista Plus (unos 0,049 €) y a Ultra anual en promoción (unos 0,015 €):

| Modelo | Petición | Créditos | € (Plus lista) | € (Ultra anual promo) |
|---|---|---|---|---|
| Kling 3.0 | 5 s | 8,75 | 0,43 | 0,13 |
| Kling 4.0 | 5 s, 1080p | 18,75 | 0,92 | 0,28 |
| Wan 3.0 | 5 s, 1080p | 15 | 0,74 | 0,23 |
| MiniMax H3 | 6 s, 2K | 12 | 0,59 | 0,18 |
| Veo 3.1 Lite | 8 s | 12 | 0,59 | 0,18 |
| Veo 3.1 | 8 s | 32 | 1,57 | 0,48 |
| Gemini Omni Flash 1.2 | 8 s, 1080p | 26 | 1,27 | 0,39 |
| Cinema Studio 4.0 | 5 s, 1080p | 80 | 3,92 | 1,20 |
| Seedance 2.0 | 8 s, 1080p | 96 | 4,70 | 1,44 |
| Seedance 2.5 | 10 s, 1080p | 160 | 7,84 | 2,40 |
| Nano Banana Pro (imagen) | 2K | 2 | 0,10 | 0,03 |
| GPT Image 2.6 (imagen) | 2K | 1,25 | 0,06 | 0,02 |

Si el conector aparece como conectado pero Claude no llama a sus herramientas, Higgsfield recomienda abrir una conversación nueva y mencionar "Higgsfield" de forma explícita ([Higgsfield Help](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-claude)). En Claude Code, la sintaxis estándar para servidores remotos es `claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp`. El blog de Higgsfield omite `--transport http` ([Higgsfield blog](https://higgsfield.ai/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP)). Para lotes automatizados, el propio Higgsfield recomienda su CLI con tokens de larga duración.

### Qué modelo para qué, y qué cambia en la UE

Los rankings no coinciden, así que conviene pensar en niveles y no en un ganador. En imagen→vídeo con audio, Artificial Analysis pone a Seedance 2.0 con 1191 Elo, MiniMax H3 con 1184 y Gemini Omni Flash con 1182 ([Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/image-to-video)). Un blog de Invideo de agosto ordenaba Omni 1245, H3 1242 y Seedance 1225 ([Invideo](https://invideo.io/blog/best-ai-video-model/)). En imagen, GPT-Image-2.6 Sunburst encabezaba arena.ai el 21 de noviembre con 1414 puntos ([arena.ai](https://arena.ai/leaderboard/text-to-image/overall/)). Con esa salvedad, este es el mapa de uso que sale de las notas:

| Necesidad | Modelos (todos dentro de Higgsfield salvo indicación) | Matiz |
|---|---|---|
| Realismo cinematográfico con audio nativo | Seedance 2.0/2.5, Gemini Omni Flash 1.2, Veo 3.1, MiniMax H3 | Seedance es el más caro del catálogo |
| Planos largos y multiplano | Kling 4.0 (3–30 s, hasta 4K), Kling 3.0 (multi-shot), Seedance 2.5 (hasta 30 s) | Kling 3.0 genera a 30 fps ([CineD](https://www.cined.com/kling-3-0-ai-video-model-introduced-native-4k-)) |
| Producto y anuncios | Marketing Studio, DTC Ads (hasta 14 referencias + brand kit), Ads Studio; texto en imagen: GPT Image 2.6, Nano Banana Pro, Ideogram 4.6; vectores: Recraft V4.1, Ideogram Vector | No dejes que el modelo escriba el texto legal |
| Personajes recurrentes | Soul 2.0 + Soul ID, Kling 3.0 Omni (7 referencias), Seedance (12 assets) | Las fuentes de consistencia son casi todas del propio vendedor |
| Lip-sync y presentadores | Higgsfield Intone, Sync Lipsync 3, lip-sync nativo de Kling 3.0 en español | Revisa la sincronía plano a plano |
| Volumen barato | Omni 1.2 Flash 720p, Veo 3.1 Lite, Kling 3.0 Turbo / 4.0 Flash, MiniMax H3; imagen: Nano Banana 2 Lite, FLUX 3 Klein | — |
| Estilizado | Wan 2.6/2.7, Recraft V4 Styles, FLUX 3 Image | Midjourney sigue sin API oficial ([WaveSpeed](https://wavespeed.ai/blog/posts/what-is-midjourney-v8-features-pricing-how-to-use-2026)) |

En la UE hay tres matices. El primero es Veo. Google indicaba que no estaba disponible en el EEE, y en un foro se reporta un error 404 en todas las regiones europeas de Vertex ([DEV](https://dev.to/astro-official/geo-restricted-ai-video-generators-is-it-possible-to-use-googles-veo3-outside-the-us-2bkf); [Google AI forum](https://discuss.ai.google.dev/t/request-veo-3-1-access-in-eu-regions-vertex-ai-project-moicro-ai-reception/181186)). Además, sus endpoints preview en la Gemini API se habrían apagado el 22 de octubre ([BenchLM](https://benchlm.ai/media-pricing/veo)). Higgsfield, que te factura en euros, actúa en la práctica como puerta de acceso, pero la obligación de etiquetar el resultado sigue siendo tuya. El segundo es el sucesor de Veo en la API. Gemini Omni 1.2 Flash salió el 5 de noviembre a 0,07 $/s en 720p, con clips nativos de 15 s, y desde el 3 de diciembre las peticiones a la versión 1.1 se redirigen a la 1.2 ([Google blog](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemini-omni-1-2-flash/); [MarkTechPost](https://www.marktechpost.com/2026/11/05/google-gemini-omni-1-2-flash-15-second-video/)). El tercero son los modelos abiertos. Los pesos de MiniMax H3 **excluyen la UE y EE. UU.** ([RITS NYU Shanghai](https://rits.shanghai.nyu.edu/ai/minimax-ships-h3-weights-with-the-us-and-eu-excluded/)), así que no puedes ejecutarlo en local con licencia desde España, aunque sí usarlo alojado. Wan 3.0 no tiene pesos ([Kenerate](https://kenerateai.com/blogs/is-wan-3-0-open-source)). LTX-2 es gratis para empresas con menos de 10 M$ de ingresos ([LTX license](https://ltx.io/model/license)) y pide unos 16 GB de VRAM y 64 GB de RAM ([SourceIT](https://sourceit.com.sg/blogs/news/rtx-5090-ai-video-generation-studio)).

### Cómo conectar las alternativas

Todos los agregadores relevantes tienen MCP oficial. Son la vía natural cuando quieres que Claude escriba scripts de lotes de pago por uso. fal usa OAuth remoto ([fal docs](https://fal.ai/docs/documentation/setting-up/mcp)). Replicate tiene servidor remoto y se autentica con `/mcp` ([Replicate docs](https://replicate.com/docs/reference/mcp.md)). Runware se ejecuta en local con tu API key ([GitHub runware/mcp](https://github.com/runware/mcp)). Krea entra con login OAuth ([Krea docs](https://www.krea.ai/docs/developers/mcp.md)). Ideogram y Recraft tienen MCP alojado ([Ideogram](https://ideogram.ai/features/mcp/); [Recraft](https://www.recraft.ai/docs/mcp-reference/setup)). Runway ofrece un MCP alojado que no pide key y consume tu plan ([Runway MCP](https://runwayml.com/mcp)), con tarifas por segundo publicadas ([Runway dev](https://dev.runway.com/learn/ai-video-api-pricing)). OpenRouter genera vídeo por API desde abril, pero no se encontró MCP propio ([OpenRouter](https://openrouter.ai/blog/announcements/video-generation/)). ComfyUI tiene MCP oficial local y en la nube ([Comfy docs](https://docs.comfy.org/development/mcp)).

```bash
claude mcp add --transport http --scope user fal https://mcp.fal.ai/mcp-relay
claude mcp add replicate https://mcp.replicate.com/sse --transport sse --scope user
claude mcp add --transport http ideogram https://mcp.ideogram.ai/mcp
claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp
# Runware (stdio, con RUNWARE_API_KEY):  npx -y @runware/mcp
# Krea (OAuth): https://api.krea.ai/mcp   ·   Recraft (OAuth): https://mcp.recraft.ai/mcp
# En claude.ai: Customize > Connectors > Add > Add custom connector > pegar la URL
```

### Voz y música: cuatro vías y un riesgo de licencia

| Opción | Para qué | Coste | Riesgos | ¿Ya lo tienes? |
|---|---|---|---|---|
| ElevenLabs (conector oficial) | Voz Eleven v4 en más de 90 idiomas, Music v2, dubbing | Plan de ElevenLabs **[precios sin verificar]** | La licencia de música depende del plan **[contradictorio]** | No |
| ElevenLabs dentro de Higgsfield | Eleven v4, Music v2/v2.5 y dubbing sin otra cuenta | Créditos | No está documentado cómo se trasladan los derechos de la música **[sin verificar]** | Sí |
| Clonación de voz (Higgsfield `create_voice`, Seed Audio, Qwen TTS; MiniMax MCP) | Locutor sintético recurrente | Créditos o API key | Necesita consentimiento expreso de la persona | Sí (Higgsfield) |
| Suno / Udio | Canciones completas | — | Litigios abiertos con Universal y Sony | No |

El conector alojado de ElevenLabs (`https://api.elevenlabs.io/v1/mcp`) genera ya voz, música, imagen y vídeo con más de 50 modelos ([ElevenLabs blog](https://elevenlabs.io/blog/introducing-voice-music-image-and-video-generation-in-the-elevenlabs-mcp)). Eleven v4 salió el 28 de septiembre de 2026 ([changelog](https://elevenlabs.io/docs/changelog/2026/9/28)) y Music v2 el 15 de junio ([changelog](https://elevenlabs.io/docs/changelog/2026/6/15)). El punto delicado es la licencia musical. La página de la API habla de uso comercial amplio en los planes de pago, con cine y TV reservados a Enterprise. Pero la tabla de derechos v1 marca la publicidad y la TV como no permitidas en el plan Creator ([Eleven Music v1 Terms](https://elevenlabs.io/eleven-music-v1-terms); [model-specific terms](https://elevenlabs.io/eleven-music-model-specific-terms)). Revisa la tabla de tu plan antes de usarla en un anuncio. Suno y Udio llegaron a acuerdos con Warner, y Udio también con Universal, pero Universal y Sony seguían en litigio con Suno ([Billboard](https://billboard.com/pro/suno-warner-music-sign-ai-licensing-deal-settle-lawsuit/); [Opus](https://www.opus.pro/blog/ai-music-news-april-2026)). Para campañas pagadas, mejor evitarlos.

### Consistencia: bloquear personaje, producto y luz antes de animar

En 2026 la consistencia se consigue con referencias multimodales nativas y con identidades entrenadas. Soul ID se entrena una vez y, según Higgsfield, se mantiene dentro de su plataforma en Seedance 2.0, Kling 3.0, Veo 3.1 y Nano Banana Pro ([Higgsfield blog](https://higgsfield.ai/blog/tools-for-consistent-ai-characters)). Es una fuente interesada y no hay benchmark independiente. El servidor de Higgsfield instruye "Preserve references and seed; use randomize=false for exact settings" ([Higgsfield MCP](https://mcp.higgsfield.ai/mcp)). El flujo que resulta tiene cinco pasos. Primero, una hoja de personaje o un Soul ID. Segundo, registrar personaje, producto, localización y voz como *reference elements*. Tercero, generar los keyframes como imagen con Nano Banana Pro, GPT Image 2.6 o Soul 2.0. Cuarto, animarlos con fotograma inicial y final en Kling 4.0, Seedance 2.5 u Omni 1.2. Quinto, guardar seeds y prompts en un archivo del proyecto que Claude reutilice. Prepara también el presupuesto de descarte. Kalshi necesitó entre 300 y 400 generaciones para obtener 15 clips útiles ([NPR](https://www.npr.org/2025/06/23/nx-s1-5432712/ai-video-ad-kalshi-advertising-nba-finals)). Y lee los términos de uso. Según una fuente, Higgsfield se reserva una licencia perpetua para entrenar con tus entradas y salidas ([StartupFortune](https://startupfortune.com/higgsfield-ai-tells-creators-they-own-their-videos-but-quietly-claims-a-perpetual-worldwide-license-to-train-on-them/)), aunque otra dice que no impone restricciones comerciales ([HackerNoon](https://hackernoon.com/can-you-use-ai-generated-video-commercially-heres-the-checklist-tool-by-tool)). Kling entrena con las entradas salvo que pidas la exclusión por email ([LicenseOrg](https://licenseorg.com/blog/ai-video-licensing-2026)). No subas assets confidenciales de clientes sin revisar esas condiciones.

## Instalar skills y plugins: siete vías con distinto nivel de confianza

Una **skill** es una carpeta con un `SKILL.md` (frontmatter YAML con `name` y `description` más instrucciones en Markdown). Puede llevar también `references/`, `assets/` y `scripts/`, que Claude solo carga cuando le hacen falta ([Anthropic Engineering](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)). Un **plugin** empaqueta skills, agentes, hooks y servidores MCP. Esa diferencia importa para la seguridad. `npx skills` y `gh skill` instalan skills sueltas, sin hooks. `/plugin install` puede traer además procesos que se ejecutan con tus permisos. El formato es un estándar abierto (agentskills.io). Anthropic lo donó el 22 de octubre de 2026 a la Agentic AI Foundation de la Linux Foundation. Lo usan más de 70 plataformas, con un millón de skills publicadas y casi 280 millones de instalaciones ([Anthropic](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation)).

| Vía | Para qué sirve mejor | Coste | Configuración | Limitaciones y riesgos | ¿Ya la usas? |
|---|---|---|---|---|---|
| Directorio de claude.ai (Customize > Plugins > Discover) | Plugins revisados por Anthropic que funcionan en el chat, Cowork y Claude Code | Incluido (Discover en Pro, Max, Ultra, Team y Enterprise) | Baja, sin terminal | Los agentes solo funcionan en Cowork/Code; no instala skills sueltas de GitHub | Sí: así tienes Adobe, Canva y Postiz |
| Subir tu skill a claude.ai (Customize > Skills) | Tu skill de marca en todas las superficies | Gratis | Baja-media (un ZIP) | Un frontmatter no portable da error; el nombre de la carpeta tiene que ser igual a `name` | No |
| `/plugin` con `claude-plugins-official` | Figma, Canva, HyperFrames, Runway, frontend-design… con actualización automática | Gratis | Baja-media | Un plugin ejecuta código con tus permisos; en sesiones cloud no carga a scope user | En parte (los sincronizados) |
| Marketplace del proveedor (`/plugin marketplace add owner/repo`) | Últimas versiones de HyperFrames, Canva, Adobe o MakeMyClip | Gratis | Media | Si lo añades por URL, Anthropic no lo revisa; la actualización automática viene apagada | No |
| `npx skills add` (Vercel) | Skills sueltas para Claude Code, Cursor, Codex y otros 75 agentes, con lockfile | Gratis | Media (Node 22.20+) | Telemetría activada por defecto; las fuentes no están revisadas | No |
| `gh skill install` (GitHub CLI) | Fijar la versión por tag o commit | Gratis | Media (gh 2.90+) | Está en preview y puede cambiar | No |
| Índices (SkillsMP, claudemarketplaces, listas "awesome") | Descubrir skills | Gratis | — | No revisan nada; algunas auditorías han encontrado credenciales mal gestionadas | No |

| Si buscas… | Vía recomendada | Por qué |
|---|---|---|
| Hacerlo sin terminal | Customize: Discover para plugins y Upload para tu skill de marca | Lo revisado se sincroniza solo con Cowork y Claude Code |
| Control total o trabajo en equipo | Claude Code a scope project, con skills commiteadas en `.claude/skills/` y versiones fijadas | Cualquier clon del repo, incluida una sesión en la nube, tiene lo mismo |
| Usar varios agentes | `npx skills add … -a claude-code` con `skills-lock.json` | La misma skill en Cursor, Codex o Gemini CLI, con hash por commit |
| Máxima seguridad | Solo el directorio y `claude-plugins-official`, leyendo antes los hooks y los scripts | Los incidentes documentados están fuera de esos canales |

### Paso a paso en claude.ai, Desktop y Cowork

| Paso | Ruta en la interfaz | Detalle |
|---|---|---|
| 1 | Settings > Capabilities | Activa **Code execution and file creation** |
| 2 | Customize > Skills → **+** → Create skill → Upload a skill | Un ZIP que contenga la carpeta: `zip -r mi-skill.zip mi-skill/`, y comprueba con `unzip -l` que todo empieza por `mi-skill/` |
| 3 | Customize > Plugins → Discover, Add > Add marketplace o Add > Upload plugin | `owner/repo` de GitHub, o un archivo `.zip` o `.plugin` |
| 4 | Pestaña **Connectors** de cada plugin | Conecta lo que aparezca como Not connected: añadir un plugin no conecta sus conectores |
| 5 | Customize > Connectors → Add → Add custom connector | URL HTTPS, autenticación "Detected" y después Connect |
| 6 | En cada chat: **+** → Connectors / Plugins | Actívalos por conversación; escribe `/` y filtra por `plugin:skill` |
| 7 | Servidores locales en Desktop: Settings > Extensions (`.mcpb`) o Settings > Developer > Edit Config | Reinicia la app por completo después de editar `claude_desktop_config.json` |

La ruta de subida y el empaquetado están en la documentación de Anthropic ([Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)). También lo están los plugins y la regla de que "añadir un plugin no conecta sus conectores" ([Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)), y los conectores personalizados, de los que el plan Free solo permite uno ([Claude Docs](https://claude.com/docs/connectors/custom/add-unlisted.md)). Anthropic revisa los plugins de su directorio, pero "that review doesn't cover a plugin you add from a marketplace URL or upload yourself" ([Claude Docs](https://claude.com/docs/plugins/overview)). Hay algo accionable en tu cuenta. Tu Canva llega a través del plugin small-business, cuya skill `canva-creator` solo hace posts sociales. El plugin oficial de Canva trae 8 skills, entre ellas `canva-brand-check` (comprueba si una pieza cumple el brand kit), `canva-resize-for-social-media` y `canva-bulk-create` ([GitHub canva-skills](https://github.com/canva-sdks/canva-skills)), y merece la pena añadirlo. Algunas guías de proveedores, como la de Higgsfield, siguen citando "Settings > Connectors". La ruta vigente es **Customize**. Desde el móvil puedes usar skills y conectores, pero no hay documentación para subirlos.

### Paso a paso en Claude Code

```bash
# Marketplace oficial (viene añadido; en una máquina nueva):
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install figma@claude-plugins-official
claude plugin install frontend-design@claude-plugins-official
claude plugin install runway-api@claude-plugins-official
# Skills de ejemplo de Anthropic (canvas-design, theme-factory, brand-guidelines, skill-creator…)
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
# Proveedores
claude plugin marketplace add heygen-com/hyperframes && claude plugin install hyperframes@hyperframes
/plugin marketplace add canva-sdks/canva-skills
/plugin install canva@canva-skills
# Skills sueltas multiagente
npx skills add remotion-dev/skills
npx skills add elevenlabs/skills
npx skills add higgsfield-ai/skills        # antes: higgsfield auth login
gh skill install remotion-dev/skills
# Comprobar y mantener
claude plugin list
claude plugin details <nombre>              # coste de contexto "Always-on"
claude plugin update <plugin>@<marketplace>
```

Los scopes son tres. User guarda la configuración en `~/.claude/settings.json`. Project la guarda en `.claude/settings.json`, que se commitea, y cada colaborador instala una vez con `--scope project`. Local la guarda en `.claude/settings.local.json`. La actualización automática solo viene activada en los marketplaces oficiales. En los de la comunidad y de terceros viene apagada. No hay un comando que lo actualice todo, y quitar un marketplace desinstala sus plugins ([Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)). El marketplace `claude-code-plugins` de `anthropics/claude-code` **está deprecado**. Sáltate cualquier tutorial que ejecute `/plugin marketplace add anthropics/claude-code` ([Claude Code Docs: marketplaces](https://code.claude.com/docs/en/plugins/anthropic-marketplaces.md)). Al escribir tu propia skill, ten en cuenta la portabilidad. Claude Code acepta campos extra (`context: fork`, `disable-model-invocation`…), pero al subirla a claude.ai solo valen `name`, `description`, `license`, `compatibility`, `metadata` y `allowed-tools`. "Other fields cause a hard error at packaging or upload" ([Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)). El CLI de Vercel guarda un `skills-lock.json` con el hash y el commit de cada skill, y su telemetría se desactiva con `DISABLE_TELEMETRY=1` ([GitHub vercel-labs/skills](https://github.com/vercel-labs/skills)). `gh skill` requiere GitHub CLI 2.90.0+ y permite fijar versiones como `@v1.2.0` ([GitHub Changelog](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/)).

### La lista de sospechas antes de instalar

Un plugin de Claude Code "can execute arbitrary code on your machine with your user privileges". Los hooks, los monitores y los servidores MCP se ejecutan fuera del sandbox. Y la actualización automática puede cambiar en disco archivos que ya habías revisado ([Claude Code Docs: Plugin security](https://code.claude.com/docs/en/plugins/security.md)). En 2026 hubo incidentes reales, todos fuera de los canales de Anthropic. Una campaña en ClawHub (el marketplace de OpenClaw) distribuyó skills con reverse shells entre el 27 y el 29 de enero ([Snyk](https://snyk.io/articles/clawdhub-malicious-campaign-ai-agent-skills/)). La auditoría ToxicSkills de Snyk encontró 76 skills con payloads maliciosos entre 3.984 ([Snyk](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)). Unit 42 documentó skills persistentes y evasivas ([Unit 42](https://unit42.paloaltonetworks.com/openclaw-ai-supply-chain/)). Claude Code también tuvo fallos ya parcheados. CVE-2025-59536 (CVSS 8,7) permitía que un `.claude/settings.json` del repo ejecutara comandos antes del diálogo de confianza ([Check Point](https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/)). CVE-2026-25725 permitía escapar del sandbox instalando hooks y se corrigió en la 2.1.2 ([Wiz](https://www.wiz.io/vulnerability-database/cve/cve-2026-25725)). La defensa práctica empieza por preferir el directorio, `claude-plugins-official` o el repo oficial del proveedor. Antes de instalar, lee el `SKILL.md` buscando `curl | bash`, base64, "prerequisites" que te pidan ejecutar binarios o peticiones de tokens. Revisa también `scripts/`, `hooks/hooks.json`, `.mcp.json` y `bin/`; con `claude --plugin-dir <dir> plugin details <nombre>` ves el inventario. Fija las versiones y deja apagada la actualización automática en marketplaces de terceros. No des API keys a una skill: para eso están los conectores con OAuth. En los conectores, bloquea las herramientas que publican o borran (la publicación en TikTok, el `autoPublish` de Metricool, la escritura en Meta Ads) hasta que confíes en el flujo, porque "custom connectors allow connections to unverified services" ([Claude Docs](https://claude.com/docs/connectors/custom/add-unlisted.md)). Y mantén Claude Code actualizado.

## Un estilo propio y coherente: diseño gráfico, móvil y campañas

Para pósters, carruseles, stories, banners, pantallas y prensa hay siete herramientas útiles. Cada una cubre un tramo distinto, y la coherencia no sale de elegir una, sino de que todas lean la misma fuente de verdad.

| Opción | Para qué sirve mejor | Coste | Configuración | Limitaciones y riesgos | ¿Ya lo tienes? |
|---|---|---|---|---|---|
| Claude Design (artifacts) | Explorar direcciones, design system de marca, landings, social assets, prototipos de app | Dentro de tu plan; comparte la bolsa de uso y gasta muchos tokens | Baja | La web independiente cierra el 14 de diciembre; disponibilidad en Free **[contradictorio]**; CMYK y PDF/X sin documentar | Sí (es parte de Claude) |
| Skills canvas-design + frontend-design + tu skill de marca | Pósters de autor en PNG/PDF y piezas HTML parametrizables sin estética genérica | Gratis + tokens | Media | Salida en RGB | No (hay que instalarlas) |
| Figma (MCP + plugin) | Fuente de verdad: variables, componentes maestros por formato, pantallas de app, shaders | Asiento Full + créditos de Figma AI | Media | "Write to canvas" en beta, pasará a ser de pago; imágenes de 2048 px como máximo | Sí |
| Adobe for Creativity | Fotos, variaciones por red con recorte por sujeto y expansión generativa, Adobe Fonts, InDesign | Adobe ID (con sesión iniciada, límites más altos) **[precios sin verificar]** | Baja en Desktop/Cowork | No funciona en Claude Code; las funciones de Express no están disponibles para cuentas enterprise | Sí (plugin) |
| Canva | Edición final por humanos, plantillas compartidas, comprobación de marca | Se conecta en Free; resize de pago; autofill y Brand Templates en Enterprise **[contradictorio]** | Baja | Tu plugin actual es `canva-creator`, no el oficial con brand-check | En parte |
| Gamma | Carruseles 4:5/1:1, stories 9:16 y decks con tema de marca | Créditos de Gamma **[sin verificar]** | Baja | No publica en Instagram; el ZIP de PNG caduca en una semana | Sí |
| Higgsfield Marketing Studio | Fotos de producto, pósters, UGC y anuncios con un personaje consistente | Créditos (Nano Banana Pro a 2K ≈ 0,10 €) | Baja | Estética "de anuncio" si no se dirige; el coste crece en lotes | Sí |

| Si buscas… | Ruta recomendada | Por qué, y con qué cuidado |
|---|---|---|
| Rapidez sin código | Claude Design → Send to Canva o Adobe Express → Metricool | Las piezas quedan editables por humanos; exporta antes del 14 de diciembre lo que tengas en la web independiente |
| Coherencia máxima y control | Skill de marca + `tokens.json` + variables de Figma + plantillas HTML/Figma por formato alimentadas con datos | Cada pieza cambia de contenido, no de sistema |
| Lo más barato | canvas-design/frontend-design en Claude + Gamma o Canva Free + Metricool Free (20 posts) | Sin suscripciones nuevas; el límite son los tokens y el plan Free de Metricool |
| Imprenta | Diseño vectorial → PDF → InDesign vía Adobe para CMYK y sangrado | El navegador solo da RGB |

### El "look IA" tiene nombre, hex y causa

Anthropic lo llama convergencia distribucional. Sin dirección, el modelo cae en el centro de alta probabilidad: Inter o Roboto, degradados morados sobre blanco, fondos planos y layouts predecibles ([Claude blog](https://claude.com/blog/improving-frontend-design-through-skills)). El cookbook lo llama directamente "AI slop" ([Claude Cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)). La reescritura de 2026 de la skill **frontend-design** va más allá y prohíbe también los clichés nuevos que popularizó la propia IA ([SKILL.md frontend-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)):

- fondo crema (~#F4F1EA) con serif de alto contraste y acento arcilla ~#D97757, que la skill describe como "Anthropic's own interaction accent";
- casi negro con un único acento verde ácido o bermellón;
- estilo periódico (broadsheet);
- tarjetas SaaS idénticas con sombra rgba(0,0,0,.1);
- etiquetas en MAYÚSCULAS espaciadas, metadatos separados con punto medio y flechas →;
- una sola palabra resaltada en el titular;
- fade-up en todas las secciones.

Es decir, el "estilo típico de Claude" del que quieres huir está documentado por Anthropic como lo que no se debe hacer. El método de la skill parte del sector, los materiales y el vernáculo del sujeto. Primero se hace un plan con 4–6 colores hex con nombre, roles tipográficos y wireframes ASCII. Luego se revisa ese plan y se reescribe todo lo que suene a opción por defecto. Después se construye ("Spend your boldness in one place"). Al final se hace una captura y se quita un elemento. **canvas-design** propone otro camino, más de autor. Se inventa un movimiento de una o dos palabras, se escribe su filosofía en 4–6 párrafos y se esconde una referencia de nicho en la obra. El resultado es 90 % visual y 10 % texto, con tipografía fina, y nunca se copia a artistas existentes ([SKILL.md canvas-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/canvas-design/SKILL.md)). Los diseñadores que lo usan añaden dos prácticas. Una es dar 2–3 referencias y decir qué atributo exacto tomar de cada una ([UX Planet](https://uxplanet.org/6-tricks-to-level-up-claude-design-7ed86375be49)). La otra es nombrar lo que no quieres y evitar objetivos vagos como "sofisticado y moderno" ([MindStudio](https://www.mindstudio.ai/blog/claude-design-avoid-generic-ai-aesthetics)). Para la tipografía, la skill `adobe-fonts` de tu plugin solo propone fuentes reales y con licencia de Adobe Fonts.

### La plantilla de dirección de arte

Esta plantilla sintetiza las fuentes anteriores. Puedes pegarla en Claude o en Claude Design, o guardarla en tu skill de marca:

```text
SUJETO Y VERNÁCULO: [qué es, para quién, materiales y oficios de su mundo; p. ej. "vermut de grifo en un bar de Lavapiés: azulejo, papel de estraza, rotulación de pizarra"]
MOVIMIENTO Y REFERENCIAS: [un movimiento propio + 2–3 referencias con el atributo exacto de cada una: "de Otl Aicher, la retícula; del cartel risográfico, la sobreimpresión a 2 tintas"]
PALETA CERRADA: 4–6 hex con nombre y rol (fondo, tinta, acento, soporte). Prohibido añadir colores.
TIPOGRAFÍA: display [familia + peso extremo] / texto [familia]; saltos de escala ≥3×; solo fuentes reales con licencia.
RETÍCULA: [p. ej. 6 columnas, margen de 64 px en 1080, línea base de 8 px] + zonas seguras por formato.
ACABADO: una sola técnica (grano del 3–5 %, desregistro de 1–2 px, papel o semitono).
LA ÚNICA AUDACIA: [dónde se gasta el riesgo; p. ej. un titular gigante cortado por el borde].
PROHIBIDO: Inter/Roboto/Arial/Space Grotesk, degradados morados, crema + terracota, negro con un acento ácido, tarjetas redondeadas con sombra suave, MAYÚSCULAS espaciadas, flechas →, una palabra resaltada, fade-up en todo, texto escrito por el modelo de imagen.
PROCESO: 1) plan (paleta, tipos, wireframe ASCII) 2) revísalo y sustituye todo lo que suene a opción por defecto 3) construye 4) haz una captura y quita un elemento.
```

La última prohibición tiene una razón práctica. Deja que los modelos de imagen hagan la foto o la textura, con Higgsfield, `generate_image` de Figma o los shaders de Figma ([Figma Weave](https://www.figma.com/blog/figma-weave/)), y compón la tipografía en HTML o en Figma. El texto renderizado por el modelo es una de las señales más reconocibles del look IA.

### Una sola fuente de verdad para todos los formatos

La plantilla oficial de Anthropic para una skill de marca es el ejemplo "Acme". Incluye colores hex, tamaños tipográficos, reglas de uso del logo, `assets/` con logos y fuentes, y un `scripts/check_contrast.py` que comprueba el contraste WCAG 4.5:1 ([Claude Docs](https://claude.com/docs/skills/how-to.md)). Adaptada a un creador, la estructura queda así:

```text
mi-marca/
├── SKILL.md            # name: mi-marca · description: "Aplica el estilo de <Nombre> a pósters,
│                       #   posts IG/TikTok/LinkedIn, miniaturas, anuncios y vídeos Remotion/HyperFrames"
├── references/
│   ├── paleta-y-tipografia.md   # hex con nombre, pares permitidos, escala
│   ├── composicion-poster.md    # retícula, márgenes, A3/4:5/9:16/16:9
│   ├── redes-sociales.md        # tamaños y zonas seguras por red
│   ├── motion-y-video.md        # easing, duraciones, transiciones, rótulos, subtítulos
│   ├── voz-y-copy.md
│   └── anti-cliches.md          # lo que nunca se hace
├── assets/
│   ├── tokens.json              # fuente única para CSS, Remotion/HyperFrames y Figma
│   └── logos/  fuentes/  plantillas/  ejemplos-aprobados/
└── scripts/
    └── check_contrast.py
```

Para que funcione igual en claude.ai que en Claude Code, deja el frontmatter en `name` y `description`. Antes de darla por buena, pruébala con `skill-creator`, que en Cowork y en Claude Code la compara con una versión base sin la skill ([Claude Docs](https://claude.com/docs/skills/how-to.md)). El `tokens.json` es el puente entre formatos. Las mismas variables alimentan el CSS de los pósters HTML, las composiciones de Remotion o HyperFrames y las variables de Figma. Después conecta la skill a cada herramienta:

- **Claude Design** importa el design system desde un repo de GitHub, archivos de diseño o subidas. Comprueba su salida contra ese sistema y la corrige antes de enseñártela. Un admin puede aprobar un sistema estándar y bloquear las ediciones. Además, `/design-sync` y `/design` lo sincronizan con Claude Code ([Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work)).
- **Figma** aporta las variables y los componentes maestros por formato. La skill `figma-generate-library` construye la librería a partir de código ([figma/mcp-server-guide](https://github.com/figma/mcp-server-guide)).
- **Gamma** acepta un `themeId` de marca.
- **Higgsfield** guarda personajes, productos y voces como *reference elements* y mantiene la marca y los productos de forma persistente en Ads Studio.
- **Canva** aporta `canva-brand-check` en su plugin oficial.
- **HyperFrames** incluye `/style-sampling`.
- **Cowork** ofrece un plugin de "brand voice", hecho con Tribe AI, que extrae la voz de marca de tus documentos ([Claude blog](https://claude.com/blog/cowork-plugins-across-enterprise)).

Para producir en volumen, la clave es "plantilla + datos": un maestro por formato y un CSV o JSON con titulares, precios e imágenes. Si no tienes autofill de Canva (solo en Enterprise), `adobe-create-pdfs-from-data` o HTML parametrizado cumplen la misma función.

Hay un calendario que vigilar en Claude Design. Se lanzó el 17 de abril de 2026 como research preview ([Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs)) y desde septiembre funciona dentro de cualquier conversación. La **web independiente claude.ai/design cierra el 14 de diciembre de 2026**. A partir de entonces, diseños, design systems y decks viven como artifacts. Solo el propietario puede mover un proyecto, y la copia en la web independiente queda en solo lectura de forma irreversible. Los **chats y comentarios no se migran** y se borran al cerrar. Para exportar, abre cada proyecto, ve a Share → Project HTML, deja marcado Project archive y pulsa Export para bajar un .zip. Las exportaciones no cuentan para tus límites ([Claude Help Center](https://support.claude.com/en/articles/17440474-move-from-standalone-claude-design-to-claude.md)). Claude Design exporta a PDF, PPTX y HTML. También envía a Canva, Adobe Express, Gamma, Miro, Vercel, Wix, Lovable, Replit y Base44 ([Claude](https://claude.com/resources/articles/claude-design-stays-on-brand-for-daily-work)), y a Netlify ([Netlify KB](https://www.netlify.com/knowledge-base/deploy-your-claude-artifacts-to-netlify/)). Un diseñador citado por TechRepublic avisa de que gasta muchos tokens y que a veces es más lento que retocar el detalle a mano ([TechRepublic](https://techrepublic.com/article/news-anthropic-claude-design-overhaul-enterprise-teams)).

### Imprenta, formatos móviles y apps

Para imprenta, el cálculo es mm ÷ 25,4 × 300. A 300 ppp, un A4 son 2480×3508 px, un A3 son 3508×4961 px y un cartel de 50×70 cm son 5906×8268 px. Hay que sumar 3 mm de sangrado por lado. El navegador produce RGB. La conversión a CMYK con perfil europeo (FOGRA39 o ISO Coated v2) hay que hacerla en InDesign, Acrobat o Illustrator, o en la imprenta. No hay documentación oficial de que Claude Design o los artifacts generen CMYK ni PDF/X. El conector de Adobe incluye InDesign y herramientas como `convert_pdf_to_indd` ([claude.com](https://claude.com/connectors/adobe-creativity)), y su skill de redimensionado entiende peticiones como "make it 300 DPI ready" o "A4".

En redes, 1080×1920 (9:16) es el lienzo común de TikTok, Reels, Shorts y Stories ([wildandfreetools](https://wildandfreetools.com/blog/social-media-video-size-cheat-sheet-2026/)). Instagram cambió a finales de 2025 la cuadrícula del perfil a 3:4. Unas guías recomiendan 1080×1440 como nuevo tamaño por defecto. Otras mantienen 1080×1350 (4:5), con una zona 3:4 centrada. Todos los elementos de un carrusel tienen que compartir proporción, y algunos programadores aún no aceptan 3:4 ([Stan Store](https://stan.store/blog/instagram-post-size-guide-2026/); [Buffer](https://buffer.com/library/instagram-image-size)). Las zonas seguras vienen de terceros y varían entre fuentes. Una caja de unos 900×1400 px centrada sirve para las tres plataformas verticales. En Reels, el 25 % inferior y el 15 % derecho quedan tapados por la interfaz ([AdaptlyPost](https://adaptlypost.com/en/blog/social-media-safe-zones-2026-complete-guide); [AdCreate](https://adcreate.com/blog/social-media-ad-sizes-safe-zones-2026)). Las guías oficiales de las plataformas son sobre todo para anuncios ([Reap](https://reap.video/blog/short-form-video-safe-zones)). Diseña primero el 9:16 y el 3:4, que son los formatos más restrictivos, y deriva de ahí el resto. Para pantallas de app tienes dos caminos. Claude Design hace prototipos interactivos a partir de maquetas estáticas y flujos que pasan a Claude Code ([Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs)). El MCP de Figma genera pantallas con tu sistema (`figma-generate-design`) y las traduce a SwiftUI con `figma-swiftui` ([figma/mcp-server-guide](https://github.com/figma/mcp-server-guide)).

### Publicar y medir: cuatro programadores comparados

| Opción | Para qué | Coste | Riesgos | ¿Ya lo tienes? |
|---|---|---|---|---|
| Metricool | 10 redes desde el conector, mejor hora para publicar, analítica, marcas de IA y flujo de revisión | Funciona con cualquier plan; Free hasta 20 posts programados; recurrentes solo en Advanced/Custom | Con `autoPublish` publica sin revisión | Sí |
| Postiz | Más de 28 canales, entre ellos Mastodon, Reddit y Telegram | **[precio sin verificar]** | Hay que subir antes cada archivo; los ajustes que no aplican se descartan sin avisar | Sí (plugin) |
| Buffer | Cola, ideas y programación | **[precio sin verificar]** | — | No |
| Higgsfield (TikTok / Meta Ads) | Publicar directo en TikTok; crear campañas de Meta en pausa | Créditos | Disponibilidad en la UE **[sin verificar]**; en Meta el vídeo se sube a Ads Manager a mano | Sí |

Metricool es la pieza central para un creador en España. Su conector oficial programa y analiza ([claude.com](https://claude.com/connectors/metricool-social-media-management)) y funciona con cualquier plan ([Metricool FAQ](https://help.metricool.com/faqs-about-the-metricool-mcp-1i3w0)). `createScheduledPost` admite los campos de contenido IA de cada red: `isAiGenerated` en Instagram, `isAigc` en TikTok, `isAiGeneratedContent` en YouTube e `isAiGeneratedPerson` en Pinterest. También admite portada de vídeo, carrusel PDF en LinkedIn, `getBestTimeToPostByNetwork` y `createScheduledPostForReview` para aprobar antes de publicar ([Metricool Help](https://help.metricool.com/how-to-connect-metricools-mcp-with-claude-0l84v.md)). Con Postiz hay tres reglas: autenticarse (`postiz auth:login` o `POSTIZ_API_KEY`), subir cada archivo con `postiz upload` y usar `content_posting_method: "DIRECT_POST"` en TikTok, porque `UPLOAD` solo deja un borrador ([Postiz](https://github.com/gitroomhq/postiz-app)). Higgsfield envía los vídeos directamente a TikTok. En Meta busca en la Ad Library y crea campañas en pausa, pero el vídeo se sube a mano ([Higgsfield blog](https://higgsfield.ai/blog/full-ad-campaign-inside-claude)). Buffer tiene MCP oficial por si prefieres su cola ([Buffer developers](https://developers.buffer.com/guides/integrations/claude)).

Con todo esto, una campaña completa con lo que ya tienes conectado sigue siete pasos:

1. **Brief y sistema.** En un Proyecto de Claude con la skill de marca, pide tres direcciones y fija una como design system.
2. **Imagen clave.** Genérala con Higgsfield (reference elements) o con Figma (`generate_image`, shaders).
3. **Piezas maestras.** El póster con canvas-design o Figma, el carrusel con Gamma en `4x5`, la story en 1080×1920 y la landing con Claude Design → Netlify.
4. **Variaciones.** Las de foto con `adobe-create-social-variations`, las de vídeo con `reframe` de Higgsfield y la tipografía con plantillas Figma por formato.
5. **Retoque humano.** En Canva o Express.
6. **Programación.** En Metricool, con la marca de IA activada.
7. **Analítica.** `getAnalyticsDataByMetrics` cada semana, y vuelta al brief.

## Anuncios de TV: cuatro rutas de producción, una sola norma de entrega

Un spot de TV con IA se puede producir por cuatro rutas, y la elección depende más de la marca y del canal de emisión que de la tecnología.

| Ruta | Para qué sirve mejor | Coste aproximado | Dificultad para ti | Limitaciones y riesgos | ¿Qué tienes conectado? |
|---|---|---|---|---|---|
| Estudio o productora de IA especializada | Spot de TV con calidad de emisión y responsabilidad profesional | Sin presupuestos publicados en España; las grandes marcas, meses y unas 100 personas **[fuente única]** | Baja | Coste y dependencia del estudio | — |
| Híbrido dirigido por ti con Claude + postproductora para acabado y QC | Spot de 15/20/30" con versiones y control creativo | Generación por unos 200–1.200 $ (cálculo abajo) + trabajo humano | Alta | QC de emisión, consistencia de producto, licencias | Higgsfield, Descript, Figma, Gamma |
| Herramientas de anuncios llave en mano (Higgsfield Ads/Marketing Studio; Arcads, Creatify, HeyGen, Synthesia) | UGC, producto y presentadores para redes y CTV | Higgsfield, unos 2,38 $ por clip de 8 s a 720p; Creatify, unos 3,30 $ por 20 s; HeyGen desde 29 $/mes **[varía entre fuentes]** | Baja | Estética UGC; fallos ocasionales de sincronía labial; 15 s por generación en UGC | Higgsfield |
| Rodaje tradicional (IA solo en post) | Marcas con herencia emocional y realismo con personas | Unos 67.000 $ (estimación de MediaPost); 250.000–500.000 $ un spot nacional en EE. UU. | Baja | Coste y un plazo de 6–10 semanas | — |

| Si buscas… | Ruta recomendada | Por qué, y con qué cuidado |
|---|---|---|
| Tu primer spot para TV lineal | Híbrido: tú y Claude hasta el montaje; una postproductora para color, mezcla R128, MXF y QC; Copy Advice de Autocontrol | El QC de emisión no admite improvisación y la responsabilidad legal es del anunciante |
| Solo CTV y redes | Higgsfield Ads/Marketing Studio + cutdowns en Descript + etiquetas de cada plataforma | Rápido y barato; el nivel de exigencia técnica es menor |
| Una marca con personaje propio o emoción realista | Estudio especializado, o rodaje con IA solo en post | El rechazo a la IA se concentra justo en estos casos |
| Presupuesto mínimo | Tono absurdo o fantástico, packshot real y rótulos en Remotion | Lo fantástico disimula los artefactos |

### Lo que enseñan Kalshi, Coca-Cola, Svedka y los primeros spots españoles

El caso de Kalshi en las NBA Finals de 2025 lo hizo el director PJ Accetturo en unos dos días. La generación costó menos de 2.000 $, con Gemini para el guion y los prompts y Veo 3 para el vídeo, y hicieron falta entre 300 y 400 generaciones para obtener 15 clips útiles ([NPR](https://www.npr.org/2025/06/23/nx-s1-5432712/ai-video-ad-kalshi-advertising-nba-finals)). Coca-Cola usó Leonardo, Luma, Runway y Kling en 2024 ([The Decoder](https://the-decoder.com/ai-generated-holidays-are-coming-coca-cola-ad-looks-festive-but-feels-artificial-critics-say/)) y firmó el spot con "Created by Real Magic AI" ([Ads of the World](https://adsoftheworld.com/campaigns/holidays-are-coming-ai-generated)). En 2025 sufrió de nuevo el rechazo por falta de calidez y por errores de continuidad: camiones con ruedas de más ([eWeek](https://www.eweek.com/news/coca-cola-ai-ads/)). Svedka llevó a la Super Bowl LX un spot hecho con Silverside sobre ComfyUI, tras 4 meses entrenando para recrear a su Fembot ([Adweek](https://www.adweek.com/creativity/svedka-bets-on-ai-and-its-fembot-to-make-super-bowl-history/); [Comfy](https://comfy.org/customers/svedka-silverside.md)). El panel de Adweek lo despachó así: "AI isn't an idea" ([Adweek](https://www.adweek.com/creativity/creatives-react-svedkas-forgettable-super-bowl-ad-proves-ai-isnt-an-idea/)). En España, LEPAS estrenó el 1 de septiembre de 2026, en TV y digital, un spot "100 % IA" de FIGARI Candy Store con Dreamshot ([El Plural](https://www.elplural.com/motor/coches/lepas-debuta-espana-campana-creada-100-inteligencia-artificial-romper-moldes_400511102)). Aegon activó el 13 de octubre uno de La Despensa, Glassy Films y Magnific, sobre todo en digital y TV conectada ([Ecosistema Startup](https://ecosistemastartup.com/aegon-primer-spot-asegurador-en-tv-espana-hecho-con-ia/)). El sector lo resume así: "la gente no quiere anuncios cutres" ([El Español](https://www.elespanol.com/omicrono/tecnologia/20260201/publicidad-abraza-ia-hacer-campanas-imparable-gente-no-quiere-anuncios-cutres/1003744105164_0.html)). Las lecciones son claras. Incluso los casos "baratos" tienen un director con oficio y mucha selección humana. El tono absurdo o fantástico disimula los artefactos mejor que el realismo emocional. Y la continuidad del producto es el punto débil, así que el packshot y el logo deben ser reales o 3D, nunca generados.

### El pipeline de un spot con Claude como orquestador

| Fase | Herramienta | Papel de Claude |
|---|---|---|
| Brief y guion | Claude; Gamma para presentar las rutas creativas | Claims verificables, mandatorios, versiones 15/20/30/60" y 9:16/4:5; guiones a duración exacta |
| Shot list y storyboard | Figma o Gamma para los frames; Higgsfield para las imágenes | Lenguaje de cámara y duración en frames a 25 fps |
| Bloqueo de personaje y producto | Higgsfield `manage_reference_elements`; LoRA/ComfyUI para personajes de marca | Mantener una "biblia" de referencias y un prompt base fijo |
| Imagen→vídeo | Kling 3.0 (4K a 30 fps, hasta 6 planos y lip-sync en español), Veo 3.1 en Flow (fotograma inicial y final, extensión de escena), Seedance | `estimate_video_cost` antes de cada lote; registrar seeds y prompts |
| Packshot, logo y rótulos legales | Fotografía o 3D real + overlays en Remotion | Nunca confiar el texto ni el logo al modelo de vídeo |
| Montaje | Descript (Underlord) → Resolve XML | Primera versión y exportación al NLE |
| Acabado | DaVinci Resolve; reescalado con Topaz o `upscale_video`; grano común | — |
| Mezcla y QC | ffmpeg `loudnorm` o un medidor R128 | Informe de loudness |
| Versiones | Remotion, `create_social_clips` de Descript, `reframe` de Higgsfield, 9:16 nativo de Veo | Tabla de versiones y lotes |
| Entrega | MXF + claqueta, vía Cape.io o la plataforma de la cadena | Generar la claqueta y el informe de QC |

Los datos de Kling 3.0 vienen de [CineD](https://www.cined.com/kling-3-0-ai-video-model-introduced-native-4k-). Los de Veo 3.1 en Flow (varias referencias, fotograma inicial y final, extensión de escena, 9:16 nativo desde enero), del [blog de Google](https://blog.google/technology/ai/veo-updates-flow/). La extensión de escena solo funciona con clips de Veo generados en Flow ([DataCamp](https://www.datacamp.com/tutorial/veo-3-1-complete-guide-with-examples)). La generación con IA suele salir a 24 o 30 fps, y la TV española emite a 25. Lo más limpio es generar o renderizar a 25 fps, o reinterpretar, porque interpolar de 30 a 25 puede producir judder. Monta en un máster ProRes 422 HQ 1080p25 (o UHD) y saca de él el MXF de emisión, el archivo para CTV y los cutdowns.

### Especificaciones de entrega en España

| Parámetro | Valor de referencia | Fuente |
|---|---|---|
| Vídeo | 1920×1080, 16:9, 25 fps entrelazado con campo superior primero (1080i25 TFF) | [Cape.io](https://help-advancedtv.cape.io/hc/en-us/articles/9864556855697-Especificaciones-T%C3%A9cnicas-de-Transmisi%C3%B3n-Premium-XDCAM) |
| Contenedor y códec | MXF OP1a, XDCAM HD422 a 50 Mbps y 10 bits; algunas autonómicas aceptan DV100 o AVC-Intra 100, y Canal Sur también MP4 H.264 1080 50i | [Apunt](https://static.apuntmedia.es/apunt/public/content/file/original/2025/1223/11/manual-entrega-materials-cacvsa-cas.pdf); [Canal Sur](https://static.canalsur.es/canalsur/public/content/file/original/2026/0507/08/requisitos-tecnicos-para-la-emision-de-spots-y-cunas.pdf) |
| Loudness | −23,0 LUFS ±1,0 LU (RD 250/2025, TDT), medido según ITU-R BS.1770/EBU R128 | [CNMC](https://www.cnmc.es/sites/default/files/6294243.pdf) |
| True peak / short-term | ≤ −1 dBTP; short-term máximo de −18 LUFS **[sin verificar en el PDF de la EBU]** | [EBU R128](https://tech.ebu.ch/docs/r/r128v4_0.pdf); [EBU R128 s1](https://tech.ebu.ch/docs/r/r128s1.pdf) |
| Claqueta | Unos 7 s con anunciante, clock number, título y duración, más 3 s de negro | [Cape.io Europa](https://help-advancedtv.cape.io/hc/es-es/articles/4407971511185-Especificaciones-t%C3%A9cnicas-para-Europa) |
| Distribución | Cape.io (antes Peach) o Extreme Reach | [Cape.io](https://cape.io/es/solutions/ad-delivery) |

No se obtuvieron las hojas oficiales de Atresmedia ni de Publiespaña. Hay que pedírselas al exclusivista. Publiespaña lanzó en 2026 formatos 3D, formatos en L y pre-roll de CTV, cada uno con especificaciones propias ([Mediaset](https://files.mediaset.es/file/2026/01/14/cp-publiespana-lanzamiento-pionero-formatos-3d-pdf_da39.pdf)). El artículo 121.4 de la LGCA prohíbe que los anuncios suenen más alto que el programa anterior, y la CNMC abrió una consulta en 2025 para concretar los criterios ([CNMC](https://cnmc.es/prensa/cp-volumen-anuncios-20250328)). Algunos medios dicen que R128 ya es obligatorio en todos los servicios, con multas de hasta 200.000 €, pero no está confirmado en fuentes de la CNMC ([Xataka Home](https://www.xatakahome.com/televisores/volumen-anuncios-tdt-siempre-nos-da-sustos-cnmc-ha-decidido-como-acabar-practica-habra-multazos)). RTVE no emite publicidad comercial convencional desde la Ley 8/2009 (dato de conocimiento previo que conviene verificar en el [BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2009-13988)). Subtitular el spot te diferencia: en 2023 las privadas solo subtitulaban el 7,4 % de los anuncios ([CNMC](https://www.cnmc.es/sites/default/files/editor_contenidos/Notas%20de%20prensa/2023/20231211%20NP%20INF%20Accesibilidad%20com%20comerciales.pdf)). Este comando de ffmpeg es solo un punto de partida para que Claude Code lo ajuste. Valídalo siempre con un medidor R128 y contra la hoja técnica de la cadena. Para emitir, lo prudente es un QC profesional.

```bash
ffmpeg -i master_1080p25.mov \
  -c:v mpeg2video -pix_fmt yuv422p -b:v 50M -flags +ilme+ildct -top 1 \
  -af loudnorm=I=-23:TP=-1 -c:a pcm_s24le -ar 48000 \
  -f mxf spot30_XDCAM_HD422.mxf
```

### Marco legal España/UE a 23 de noviembre de 2026

Esto es informativo, no asesoramiento jurídico. La norma central es el **artículo 50 del Reglamento (UE) 2024/1689**. Se aplica desde el **2 de agosto de 2026**, y como anunciante te obliga a revelar que un deepfake es artificial: imagen, audio o vídeo que se parezca a personas, lugares, objetos o sucesos reales y pueda pasar por auténtico ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1689/oj); [Orrick](https://www.orrick.com/en/Insights/2026/08/EU-AI-Act-Transparency-Obligations-for-AI-Generated-Content-Article-50)). El Ómnibus Digital (Reglamento (UE) 2026/1744, en vigor desde el 27 de julio) da hasta el **2 de diciembre de 2026** solo para el marcado legible por máquina que deben poner los proveedores en sistemas comercializados antes de agosto. El etiquetado de deepfakes no tiene periodo de gracia ([EUR-Lex 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj?locale=en); [CSA Labs](https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-article50-watermarking-deadline/)). Las directrices finales de la Comisión (20 de julio) admiten que la publicidad sea "evidentemente creativa" solo en supuestos concretos, y todos sus ejemplos publicitarios quedan fuera del régimen atenuado ([Bird & Bird](https://www.twobirds.com/en/insights/2026/european-commission-adopts-final-guidelines-on-ai-act-article-50-transparency-obligations-first-impr)). Publicar en internet con acceso desde la UE puede activar la obligación ([Faegre Drinker](https://www.faegredrinker.com/en/insights/publications/2026/7/eu-ai-act-commission-confirms-transparency-code-of-practice-as-adequate-and-publishes-final-version-of-its-guidelines-on-transparency-obligations)). Lo generado antes de agosto pero publicado después también hay que etiquetarlo ([Stibbe](https://www.stibbe.com/publications-and-insights/the-ai-acts-transparency-obligations-rules-scope-and-timeline)). Además, los metadatos C2PA se pierden al transcodificar, mientras que SynthID resiste ([DEV](https://dev.to/sujankoirala021/ai-content-is-getting-tagged-like-livestock-and-thats-actually-good-28ba)). Pasar a XDCAM borra la procedencia, así que guarda un registro aparte.

| Obligación | Estado | Qué haces |
|---|---|---|
| Etiquetar deepfakes (AI Act, art. 50.4–50.5) | Aplicable desde el 2-ago-2026; multas de hasta 15 M€ o el 3 % (art. 99.4, verificar en EUR-Lex) | Rótulo visible ("Imagen generada con IA") desde el primer plano, tanto en TV como en redes |
| Marcado por los proveedores (art. 50.2) y Código de Buenas Prácticas | Hasta el 2-dic-2026 para sistemas previos; código final del 10-jun-2026 ([Comisión](https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1328)) | Conservar C2PA/SynthID y un registro de procedencia |
| Ley española de IA | Proyecto en el Congreso desde el 12-jun-2026; no etiquetar sería infracción grave, supervisada por AESIA ([Finreg360](https://finreg360.com/alerta/el-congreso-inicia-el-tramite-del-proyecto-de-ley-organica-para-el-buen-uso-y-la-gobernanza-de-la-inteligencia-artificial/); [Xataka](https://www.xataka.com/legislacion-y-derechos/espana-aprueba-su-ley-ia-deepfakes-sexuales-fuera-etiqueta-ia-obligatoria-multas-millonarias-al-sector-privado)) | Etiquetar ya, aunque la ley no esté aprobada |
| Imagen y voz | LO 1/1982 vigente; el proyecto de LO del honor haría intromisión ilegítima el uso de voz o imagen con IA sin consentimiento en publicidad ([Cuatrecasas](https://www.cuatrecasas.com/es/spain/propiedad-intelectual/art/proyecto-ley-organica-derecho-honor-intimidad-imagen)) | Contrato de cesión con cláusula de IA (hay un AI Rider en español de [NAVA](https://navavoices.org/wp-content/uploads/2025/07/NAVA-AI-Rider-en-espanol-con-instrucciones.pdf)); nada de parecidos con famosos |
| Veracidad | Ley General de Publicidad y Ley de Competencia Desleal ([BOE](https://www.boe.es/buscar/act.php?id=BOE-A-1988-26156)); código de influencers de Autocontrol con reglas de IA desde el 1-oct-2025 ([Cuatrecasas](https://www.cuatrecasas.com/es/spain/propiedad-intelectual/art/nuevo-codigo-conducta-publicidad-influencers-contenido-claves-practicas)) | No "embellecer" con IA el resultado del producto; pedir Copy Advice antes de emitir |
| Autoría | Art. 5.1 del TRLPI: solo personas físicas; lo generado solo por IA probablemente no está protegido ([Cuatrecasas](https://www.cuatrecasas.com/es/spain/articulo/internacional-inteligencia-artificial-y-derechos-de-autor)); conclusiones del AG en el asunto C-250/25 el 3-nov-2026, sentencia pendiente ([TJUE](https://curia.europa.eu/site/upload/docs/application/pdf/2026-11/cp260155es.pdf)) | Documentar la aportación humana: guion, dirección, selección y montaje |
| Etiquetas de plataforma | Google Ads permite etiquetar desde jul-2026 ([Google](https://support.google.com/adspolicy/answer/17257106?hl=en)); Meta detecta C2PA desde jun-2026 y TikTok exige la etiqueta AIGC ([Billo](https://billo.app/blog/ai-labeling/)) **[Meta y TikTok, fuentes secundarias]** | Activar `isAiGenerated`/`isAigc` en Metricool |

### Costes y plazos realistas

Generar es barato; dirigir, no. MediaPost estima un spot con IA en 2.000–5.000 $ frente a unos 67.000 $ uno tradicional, y 1–2 días frente a 6–10 semanas, aunque avisa de que la rebaja no llega a todos los servicios ([MediaPost](https://www.mediapost.com/publications/article/409140)). Las comparativas de proveedores varían mucho según la base que elijan ([Invideo](https://invideo.io/faq/ai-film-production-vs-traditional-film-production-cost/)). Un cálculo propio con datos citados da una idea del coste de generación. Con el ratio de Kalshi (unos 25 intentos por plano útil), 15–20 planos útiles de 6 s suponen 2.000–3.000 s generados. A 0,10–0,40 $/s, eso son unos 200–1.200 $ de cómputo. El resto es humano: creatividad, dirección, operadores de IA, montaje, color y VFX correctivo, mezcla R128, locutor y música con licencia, QC y revisión legal. En el extremo alto, Svedka necesitó 4 meses ([Adweek](https://www.adweek.com/creativity/svedka-bets-on-ai-and-its-fembot-to-make-super-bowl-history/)). La compra de medios no cambia con la IA. El ahorro se reinvierte en más variantes para testar.

## Lo que las fuentes contradicen y cómo leerlo

| Tema | Qué dicen las fuentes | Cómo lo resuelvo |
|---|---|---|
| Cierre de Sora | Todas coinciden en el anuncio del 24-mar-2026 ([Axios](https://www.axios.com/2026/03/24/openai-discontinue-sora-video-app)). Una nota daba las fechas de apagado (app el 26-abr y API el 24-sep) como de fuente única ([Medium](https://medium.com/codetodeploy/openai-is-shutting-down-sora-that-says-more-than-most-product-launches-05db8b07c136)); otra las encuentra también en [Zilliz](https://zilliz.com/ai-faq/what-is-the-sora-shutdown-timeline) y [Pillitteri](https://pasqualepillitteri.it/en/news/18764/openai-sora2-api-dismessa-en) | Las fechas exactas son probables (varias fuentes secundarias coinciden). Lo seguro es que a 23-nov no hay vía de acceso y que el catálogo de Higgsfield no lista Sora |
| Existencia de Claude Motion | Una nota encontró el anuncio de @claudeai y cobertura de prensa; otras dos no hallaron anuncio oficial | Existe, en beta para Team/Enterprise desde el 8-oct-2026. Falta la página de ayuda (duración, resolución, fps, audio) |
| Planes de Claude Design | El Help Center dice de Free a Enterprise; la página de producto, "beta on paid plans"; un tercero, "free on every plan" | Compruébalo en tu cuenta. En cualquier caso, la web independiente cierra el 14-dic |
| Skills de Claude en el plan Free | El Help Center las permite activando la ejecución de código; el README de `anthropics/skills` habla de planes de pago | No te afecta si estás en un plan de pago |
| Ruta de las skills de Remotion | `.agents/skills` con enlace simbólico frente a `.claude/skills` | Crea el enlace o instala con `--agent claude-code` |
| Precio de Remotion para empresas | 100 $/mes "Automators" frente a 25 $/asiento con mínimo de 100 $, o 0,01 $/render | Mínimo práctico de unos 100 $/mes a partir de 4 personas; confírmalo con `/remotion-license` |
| Higgsfield y entrenamiento | Licencia perpetua para entrenar con tus archivos ([StartupFortune](https://startupfortune.com/higgsfield-ai-tells-creators-they-own-their-videos-but-quietly-claims-a-perpetual-worldwide-license-to-train-on-them/)) frente a "sin restricción comercial" ([HackerNoon](https://hackernoon.com/can-you-use-ai-generated-video-commercially-heres-the-checklist-tool-by-tool)) | Asume que puede entrenar con lo que subes |
| Licencia de Eleven Music | Uso comercial amplio en los planes de pago frente a una tabla v1 que excluye la publicidad y la TV en Creator | Revisa la tabla de tu plan; para TV, Enterprise o una librería con licencia |
| Funciones de Canva vía MCP | Resize solo de pago y autofill solo en Enterprise, frente a fuentes que dicen que con Pro basta | Con Pro, cuenta con que no hay autofill |
| Rankings de vídeo | Artificial Analysis: Seedance > H3 > Omni; Invideo: Omni > H3 > Seedance; otros ponen delante a Kling o Wan | Usa niveles; prueba 2–3 modelos con el mismo keyframe |
| Feed de Instagram | 1080×1350 (4:5) frente a 1080×1440 (3:4) | 1080×1440 con lo crítico en el 4:5 central, salvo que tu programador no acepte 3:4 |
| Loudness y CNMC | La prensa dice que R128 es obligatorio en todo, con multas de 200.000 €; la CNMC verificada recoge el RD 250/2025 para la TDT | Entrega siempre a −23 LUFS; la obligación confirmada es la de la TDT |
| Licencia de HyperFrames | El repo oficial dice Apache 2.0; un fork dice "Remotion License" | Apache 2.0 (ignora el fork) |
| Lottie en Figma Motion | La ayuda inicial lo daba como "futuro"; el foro lo da como añadido | Probablemente disponible en la app; vía MCP, solo MP4 |
| Referencia de las directrices del art. 50 | C(2026) 5054 frente a C/2026/6005 | Es el mismo documento del 20-jul-2026 |

## Conclusión

Generar ya no es lo escaso. Un clip de Kling cuesta céntimos y uno de Seedance, pocos euros. Lo escaso es dirigir, mantener la coherencia y cumplir la norma. Ahí está el valor real de Claude en este stack: menos en producir píxeles y más en orquestar y hacer cumplir reglas. La misma carpeta de marca (tokens, prohibiciones, referencias de personaje y producto) la leen Remotion, Figma, Higgsfield, Gamma y Metricool. Así el estilo deja de ser una intención y pasa a ser infraestructura, y la etiqueta de IA (en pantalla o con `isAiGenerated`) entra en la plantilla en vez de añadirse al final. La paradoja para quien quiere escapar del "look Claude" es que necesita darle a Claude más reglas, no menos. Y cada ruta "sin código" que hoy depende de un plan (Claude Motion en Team, el autofill de Canva en Enterprise, lo "Unlimited" de Higgsfield solo en la web) tiene un equivalente con código que es gratis y que puedes controlar. Antes de pagar un plan más alto, conviene valorar si una tarde montando Claude Code con Remotion o HyperFrames cubre lo mismo.

Las próximas semanas traen decisiones con fecha:

- **24 de noviembre:** termina la promoción de Higgsfield, que conviene valorar solo después de confirmar si tu workspace tiene plan activo.
- **2 de diciembre:** vence el plazo del marcado por máquina de los proveedores.
- **3 de diciembre:** Gemini Omni 1.1 pasa a redirigirse a la 1.2.
- **14 de diciembre:** cierra la web de Claude Design y se borran sus chats y comentarios.
- **Principios de 2027:** beta privada del MCP oficial de Adobe, que puede convertir Premiere y After Effects en ciudadanos de primera clase para Claude.

Siguen abiertos tres frentes legales y de licencia. La licencia de Remotion cambiará en su versión 5.0. La ley española de IA y la del derecho al honor siguen en el Congreso. Y la sentencia del TJUE sobre IA y derechos de autor está pendiente. Mientras tanto, etiquetar, documentar la autoría humana y licenciar voces y música es lo que separa un anuncio publicable de uno que solo funciona en una demo.
