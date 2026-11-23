# Generación de imagen, vídeo y audio conectable a Claude (estado a 23-nov-2026)

> Notas de investigación para el redactor del informe final (en español, creador en España).
> **Método y límites:** WebFetch estaba bloqueado en esta sesión para `higgsfield.ai`, `invideo.io` y `artificialanalysis.ai` (DNS fuera de la lista de dominios permitidos), así que las cifras de esas webs proceden de fragmentos de búsqueda y deben verificarse. En cambio, el **conector Higgsfield de la cuenta del usuario sí funcionaba**: se consultaron en vivo (23-nov-2026) el catálogo de modelos (`models_explore`), presupuestos de créditos (`estimate_video_cost` / `estimate_image_cost`, que no lanzan trabajos) y planes (`show_plans_and_credits`). Esos datos son fuente primaria y se citan como "Higgsfield MCP (consulta en vivo)". Muchas cifras de precios de terceros son agregadores/revendedores: se marca cuando es así.

---

## 1. Higgsfield: qué ofrece su conector/MCP oficial, qué modelos agrega, precios

### Takeaway
Higgsfield es hoy el "hub" más completo conectable a Claude: un único MCP remoto (`https://mcp.higgsfield.ai/mcp`, OAuth, sin API key) que expone ~200 herramientas (imagen, vídeo, audio, voz, 3D, Ads Studio, Marketing Studio, AI Influencer, elementos de referencia, publicación en TikTok, lectura/escritura en Meta Ads, alquiler de GPU con LoRA) sobre ~60 modelos de vídeo, ~54 de imagen y ~11 de audio de Google, Kling, ByteDance, OpenAI, BFL, MiniMax, Wan, xAI, ElevenLabs, etc. **No incluye Sora** (OpenAI cerró Sora). Planes en EUR para esta cuenta: Plus 1.000 créditos/mes (49 € lista; 25 €/mes anual en promo) y Ultra 3.000 créditos/mes (129 € lista; 45 €/mes anual en promo); **las ofertas "Unlimited" y generaciones gratis NO funcionan vía MCP/CLI**, solo en la web.

### Cited Findings

**Conexión**
- Pasos oficiales en claude.ai: Settings → Connectors → *Add custom connector* → pegar `https://mcp.higgsfield.ai/mcp` → autorizar con la cuenta Higgsfield; no requiere API key; requiere suscripción de pago activa; cada generación consume créditos — [Higgsfield Help Center: How do I connect Higgsfield to Claude](https://higgsfield.ai/creator-hub/help-center/mcp-cli/how-do-i-connect-higgsfield-to-claude) (vía resumen de búsqueda; página no recuperable directamente).
- Claude Code: `claude mcp add higgsfield https://mcp.higgsfield.ai/mcp`; para pipelines automatizados Higgsfield recomienda su CLI con tokens de API de larga duración porque el MCP depende de login interactivo — [Higgsfield blog: Generate AI Videos From Claude with Higgsfield MCP](https://higgsfield.ai/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP); [Higgsfield CLI](https://www.higgsfield.ai/cli).
- Solución de problemas: si Claude muestra el conector como conectado pero no llama a las herramientas, abrir conversación nueva y mencionar "Higgsfield" explícitamente; algunas interfaces tienen un toggle por conversación — [Higgsfield Help Center](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-claude).
- Higgsfield tiene ficha propia en el Claude Marketplace ("AI creative production platform"): conectar el MCP permite generar imágenes, vídeos y voces en la misma conversación; se puede pagar con compromiso de gasto Anthropic existente — [Claude Marketplace: Higgsfield AI](https://claude.com/marketplace/agents-products/higgsfield-ai).
- Existe una ruta de terceros (Composio, `https://connect.composio.dev/mcp`) que es un servidor distinto; no mezclar URLs — [Composio: How to connect Higgsfield to Claude](https://composio.dev/toolkits/higgsfield/framework/claude-cowork).
- Clientes soportados: claude.ai, Claude Desktop, Cursor y agentes CLI (Claude Code, OpenClaw, Hermes) — [Higgsfield blog: MCP for marketers](https://higgsfield.ai/blog/mcp-for-marketers).

**Capacidades expuestas (observadas en la lista de herramientas del conector de la cuenta, 23-nov-2026)** — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp)
- Generación: `generate_image`, `generate_video`, `generate_audio` (+ variantes `_batch`), `estimate_image_cost` / `estimate_video_cost` / `estimate_audio_cost`, `models_explore`, `jobs_wait`, `upscale_image`, `upscale_video`, `outpaint_image`, `remove_background`, `reframe`, `motion_control`, `generate_3d`, `scene_builder_3d_*` (escenas 3D, ángulos, `.glb`/`.blend`).
- Personajes/consistencia: `manage_reference_elements`, `show_reference_elements`, `show_characters`, `ai_influencer_prepare` → `ai_influencer_generate`, `build_ai_influencer`, flujo "character-sheet" (vía `get_workflow_instructions`).
- Publicidad: Ads Studio (`ads_studio_create_brand`, `ads_studio_add_product`, `ads_studio_list_avatars`, `ads_studio_story_presets`, `ads_studio_quote`, `ads_studio_generate`), Marketing Studio (`show_marketing_studio_v2`), `virality_predictor`, `video_analysis_create`.
- Publicación/distribución: `tiktok_connect`, `tiktok_prepare_publish`, `tiktok_publish_status`, `tiktok_music_trending`, `tiktok_music_tune`; `meta_ads_connect`, `meta_ads_read`, `meta_ads_write`.
- Audio/voz: `create_voice` (clonación), `list_voices`, `voice_change`, `separate_stems`, doblaje.
- Infra: `gpu_rent`, `gpu_generate`, `gpu_lora_import`, `gpu_list_loras`, `gpu_private_models`; constructor de webs (`create_website`, `deploy_website`); proyectos/carpetas y `publish_project`.
- Instrucciones del servidor: modelo de imagen por defecto `gpt_image_2_6` (salida nativa GIF/SVG); "Genjutsu" = transferencia de movimiento (`hf_mult_motion_control`) y sustitución de objetos (`hf_mult_replace_object`) dentro de `generate_video`; AI Influencer exige `ai_influencer_prepare` (devuelve diseño y precio sin generar) y luego `ai_influencer_generate` con `max_credits`; las hojas de personaje requieren petición explícita — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).
- Según Higgsfield, el MCP envía los vídeos terminados directamente a TikTok, mientras que el conector de Meta hace búsquedas en Ad Library, crea campañas en pausa y lee métricas; el vídeo se sube a Ads Manager a mano (paso manual en Meta) — [Higgsfield blog: full ad campaign inside Claude](https://higgsfield.ai/blog/full-ad-campaign-inside-claude).
- AI Influencer Studio crea un personaje con rasgos ajustables; para reutilizarlo en un canal se recomienda entrenar la identidad en Soul ID antes de generar muchos vídeos — [Higgsfield blog: AI TikTok pipeline 2026](https://higgsfield.ai/blog/ai-tiktok-pipeline-2026).

**Modelos agregados (catálogo en vivo, 23-nov-2026)** — [Higgsfield MCP `models_explore` (consulta en vivo)](https://mcp.higgsfield.ai/mcp)
- Vídeo (60 entradas), con duración/resolución declaradas:
  - Google: `veo3_1` (Veo 3.1, 4/6/8 s, calidades basic/high/ultra), `veo3_1_lite` (4/6/8 s, start+end frame), `gemini_omni_flash_1_1` (3–10 s, 360p–4K), `gemini_omni_flash_1_2` (3–15 s, 360p–4K, keyframes, referencias multimodales, edición).
  - Kling: `kling2_6` (5/10 s), `kling3_0` (3–15 s, "multi-shot, audio sync, motion transfer"), `kling3_0_turbo`, `kling_o3_image_reference` (Kling 3.0 Omni, hasta 7 imágenes de referencia), `kling_o3_flf`, `kling_video_edit`, `kling3_0_motion_control`, `kling4_0` (3–30 s, 720p/1080p/4K, keyframes, referencias, edición), `kling_4_0_flash` (3–20 s, 720p).
  - ByteDance: `seedance_2_0` (4–15 s, hasta 4K, refs imagen/vídeo/audio, "consistent identity, multi-SKU"), `seedance_2_0_mini`, `seedance_2_5` (4–30 s, hasta 4K, omni-reference, edición, extensión), `seedance_2_5_flash`.
  - Wan: `wan2_6` (5/10/15 s), `wan2_7` (2–15 s, audio sincronizado, "character-consistent"), `wan3_0` y `wan3_0_prime` (hasta 30 s, 1080p, audio nativo).
  - MiniMax: `minimax_hailuo` (6/10 s, hasta 1080), `minimax_h3` (4–15 s, 2K, refs imagen/vídeo/audio), `minimax_h3_max`.
  - BFL: `flux_3_video` (5–20 s, 720p–4K, audio sincronizado, continuación), `flux_3_video_edit` (1 crédito/s procesado, máx. 15 s).
  - xAI: `grok_video`, `grok_video_v15` (2–15 s, 1080p, refs imagen+audio), `grok_video_v15_lite`.
  - Otros: `happy_horse_video` (3–15 s, 720p/1080p); propios de Higgsfield: Cinema Studio 3.0/3.5/4.0 (4.0: 4–30 s, dirección automática de cámara, luz, género, época), Marketing Studio Video (UGC/producto, 4–30 s), Ad Multiplier (sobre Seedance 2.5) y Ad Multiplier Recreate, Genjutsu / Genjutsu Lite (Wan 3.0 / Kling 4.0), `intone` (talking-head 1–2 personajes con 1–6 audios), `sync_so` (Sync Lipsync 3), dubbing, voice_change, Topaz (upscale, SDR→HDR Hyperion 2.5), FPS Boost, deflicker, quitar fondo de vídeo (SAM 3), Depth Anything.
  - **No aparece ningún modelo Sora** en el catálogo.
- Imagen (54 entradas): Higgsfield Soul 2.0 (con `soul_id`), Soul Cinema, Soul Cast ("consistent cinematic character identity"), Soul Location; OpenAI GPT Image 2, 2.5, 2.6 (Sunburst), 2.6 Flare, "OpenAI Hazel" (edición y texto); Google Nano Banana, Nano Banana Pro (1K/2K/4K), Nano Banana 2, 2.1 (refs imagen y vídeo), 2 Lite; Seedream 4.5, 5.0 Lite/Flash/Pro, 5.5 (PNG con fondo transparente); FLUX.2 (pro/flex/max), FLUX.2 Pro Outpaint, FLUX 3 Image (hasta 10 refs, hasta 4K), Flux Kontext; Kling O1 Image, Kling Image 4.0 (2K/4K/8K, "elements"); Grok Image / 2.0; Ideogram 4.5 (hasta 5 imágenes fuente), 4.6 (2K/4K), 4.6 Precise Edit, Ideogram Vector (SVG); Recraft V4.1 (vector/logos/iconos), Recraft V4 Styles (estilos guardados); MiniMax H3 Image (hasta 16 refs); Z Image (Tongyi-MAI); DTC Ads (hasta 14 imágenes de referencia, brand kit); Marketing Studio Product Shot; upscalers Topaz/ByteDance.
- Audio (11 entradas): ElevenLabs Eleven v4 (hasta 10 voces, 10.000 caracteres) y v4 Turbo; ElevenLabs Music v2 y v2.5 (3–600 s; letras propias hasta 120 s; instrumental); Audio Dubbing (ElevenLabs); ByteDance Seed Audio 1.0 (con referencias de voz); Qwen Audio 3.0 TTS Flash (voz clonada como reference element); Text to Speech V2 (motores ElevenLabs, MiniMax, Seed Speech, VibeVoice, CozyVoice); SFX/música de juego (Mirelo, Sonilo, Inworld, vía FAL).

**Precios y créditos (planes en vivo para esta cuenta, moneda EUR, 23-nov-2026)** — [Higgsfield MCP `show_plans_and_credits` (consulta en vivo)](https://mcp.higgsfield.ai/mcp)
- PLUS: 1.000 créditos/mes; precio de lista 49 €/mes; promo "Black Friday" (válida hasta 24-nov) 35 €/mes mensual o 25 €/mes facturado anual; hasta 6 vídeos y 8 imágenes en paralelo; "~600 generaciones Nano Banana Pro o ~200 vídeos Kling 3.0".
- ULTRA: 3.000 créditos/mes; lista 129 €/mes; promo 75 € primer mes o 45 €/mes anual; 8 vídeos/8 imágenes en paralelo; "~1.500 Nano Banana Pro o ~500 Kling 3.0".
- Prueba de 3 días gratis vía MCP (tarjeta obligatoria; renueva a Ultra 75 € y luego 129 €/mes salvo cancelación diciendo "cancel auto-renewal"). **Nota literal del servidor:** "Unlimited models and Free Generations on plans are accessible only via higgsfield.ai and are not accessible on MCP/CLI, Canvas, Supercomputer, Studios and plugins. Prices exclude VAT and local taxes".
- Recarga automática: 18 créditos por dólar; los créditos de recarga caducan a los 90 días.
- La consulta devolvió pestaña "Upgrade" y elegibilidad para la prueba, lo que sugiere que el workspace conectado **no tiene plan de pago activo** en este momento (verificar con el usuario).
- Precios de terceros (en USD, fechas distintas): Starter 19 $/mes (270 créditos), Plus 59 $ (47 $ anual, 1.200 créditos), Ultra 129 $ (99 $ anual, 3.000 créditos) a oct-2026 — [HeyGen: Higgsfield pricing](https://www.heygen.com/blog/higgsfield-pricing); el propio blog de Higgsfield da Starter 15 $/200 cr., Plus 49 $/1.000, Ultra 129 $/3.000 y dice que Plus y Ultra abren todos los modelos — [Higgsfield blog: pricing explained](https://higgsfield.ai/blog/higgsfield-pricing-explained). Los precios se ajustan por país.

**Coste por generación en créditos (presupuestos reales, parámetros por defecto salvo indicado)** — [Higgsfield MCP `estimate_*_cost` (consulta en vivo)](https://mcp.higgsfield.ai/mcp)

| Modelo (id) | Petición | Créditos |
|---|---|---|
| Veo 3.1 (`veo3_1`) | 8 s, calidad por defecto | 32 |
| Veo 3.1 Lite | 8 s | 12 |
| Gemini Omni Flash 1.2 | 8 s, 1080p | 26 |
| Kling 3.0 | 5 s | 8,75 |
| Kling 4.0 | 5 s, 1080p | 18,75 |
| Seedance 2.0 | 8 s, 1080p | 96 |
| Seedance 2.5 | 10 s, 1080p | 160 |
| Wan 3.0 | 5 s, 1080p | 15 |
| MiniMax H3 | 6 s (2K) | 12 |
| Cinema Studio 4.0 | 5 s, 1080p | 80 |
| Nano Banana Pro | 2K | 2 |
| GPT Image 2.6 | 2K, calidad por defecto | 1,25 |
| Soul 2.0 | 2K por defecto | 0,12 exacto (se factura 1) |

### Inferences
- Coste efectivo por crédito: Plus lista ≈ 0,049 €; Plus anual promo ≈ 0,025 €; Ultra lista ≈ 0,043 €; Ultra anual promo ≈ 0,015 €; recarga ≈ 0,056 $. Así, un Veo 3.1 de 8 s (32 cr.) cuesta ≈ 0,48–1,57 €; un Seedance 2.5 de 10 s 1080p (160 cr.) ≈ 2,40–7,84 €; Kling 3.0 5 s ≈ 0,13–0,43 €. Seedance 2.x es, con diferencia, el modelo caro dentro de Higgsfield; Kling 3.0/4.0, MiniMax H3, Wan 3.0 y Veo 3.1 Lite son los "baratos de volumen".
- Para el usuario, Higgsfield cubre casi todo el stack desde un único conector ya instalado; las rutas directas (Gemini API, fal, etc.) solo compensan si se necesita automatizar en scripts o abaratar volumen muy alto.
- Dado que las ofertas Unlimited no aplican vía MCP, quien trabaje "desde Claude" paga créditos por cada generación; conviene pedir a Claude `estimate_*_cost` antes de lotes grandes.

### Gaps
- No se pudo abrir higgsfield.ai (bloqueado en la sesión): no se verificaron los términos completos, la fecha exacta de lanzamiento del MCP ni si el plan Starter da acceso al MCP.
- El comando de Claude Code citado no incluye `--transport http`; probablemente funcione igual, pero no se pudo verificar en la documentación oficial.
- No se encontró documentación sobre si las funciones TikTok/Meta están disponibles para cuentas en la UE.

---

## 2. Agregadores MCP/API: fal.ai, Replicate, Runware, Krea, Freepik (Magnific), OpenRouter

### Takeaway
Todos los agregadores relevantes tienen ya MCP oficial: fal (remoto OAuth `mcp.fal.ai/mcp-relay`), Replicate (remoto `mcp.replicate.com/sse`), Runware (`npx -y @runware/mcp`), Krea (remoto OAuth `api.krea.ai/mcp`), Magnific/Freepik (conector con login). OpenRouter tiene API de vídeo asíncrona (desde abr-2026) pero no se encontró MCP propio. Son la vía preferida cuando Claude escribe scripts de lotes (pago por uso, sin suscripción).

### Cited Findings
- **fal.ai** — documentación actual: servidor remoto `https://mcp.fal.ai/mcp-relay` con OAuth; Claude Code: `claude mcp add --transport http --scope user fal https://mcp.fal.ai/mcp-relay`; guía específica para Claude con conectores — [fal docs: MCP](https://fal.ai/docs/documentation/setting-up/mcp); [fal docs: Claude](https://fal.ai/docs/documentation/setting-up/mcp/claude.md). Guía anterior con API key: `claude mcp add --transport http fal-ai https://mcp.fal.ai/mcp --header "Authorization: Bearer $FAL_KEY"`; el blog anuncia acceso a 1.000+ modelos — [fal blog: Connect your AI to 1,000+ models](https://blog.fal.ai/connect-your-ai-to-1-000-models-with-the-fal-mcp-server). Una página antigua de fal decía que los Custom Connectors de claude.ai/Desktop no eran compatibles por falta de OAuth; la doc actual ya usa OAuth (conflicto temporal).
- fal fue "official partner API" de GPT Image 2 desde el 25-abr-2026 — [Programming Insider](https://programminginsider.com/fal-launches-as-official-partner-api-for-gpt-image-2-delivering-immediate-developer-access-to-openais-next-generation-image-model/).
- **Replicate** — servidor remoto oficial; comando: `claude mcp add replicate https://mcp.replicate.com/sse --transport sse --scope user`, luego `/mcp` en Claude Code para autenticar con token de Replicate; alternativa local: paquete npm `replicate-mcp` vía `npx` — [Replicate MCP](https://mcp.replicate.com/); [Replicate docs: MCP](https://replicate.com/docs/reference/mcp.md); [Replicate blog: remote MCP server](https://replicate.com/blog/remote-mcp-server).
- **Runware** — MCP oficial `@runware/mcp` (stdio, autoalojado): `npx -y @runware/mcp` con `RUNWARE_API_KEY`; cubre imagen, vídeo, audio, 3D, upscaling, quitar fondo, captioning — [GitHub runware/mcp](https://github.com/runware/mcp).
- **Krea** — MCP alojado en `https://api.krea.ai/mcp`, sin API key, login OAuth con cuenta Krea; guías para Claude Code, Cursor y Codex — [Krea docs: MCP](https://www.krea.ai/docs/developers/mcp.md). Una fuente dice que está en el directorio de conectores de Claude; otra búsqueda en el marketplace no lo encontró (sin confirmar).
- **Freepik → Magnific** — Freepik aparece ahora como Magnific, con conector personalizado que requiere login (comparativa de OpenArt, nov-2026, autor con producto competidor) — [OpenArt: best image generation MCP servers for Claude](https://openart.ai/blog/best-image-generation-mcp-servers-for-claude/).
- **OpenRouter** — anunció generación de vídeo el 15-abr-2026 con la misma facturación que texto/imagen; API asíncrona `POST /api/v1/videos` (devuelve job ID, se hace polling) y `GET /api/v1/videos/models`; colección de nov-2026 destaca HeyGen Video, Seedance 2.5 y Veo 3.1 Lite; Grok Imagine Video publicado 18-may-2026 — [OpenRouter: Announcing Video Generation](https://openrouter.ai/blog/announcements/video-generation/); [OpenRouter docs: video generation](https://openrouter.ai/docs/guides/overview/multimodal/video-generation); [OpenRouter: GPT Image 2](https://openrouter.ai/openai/gpt-image-2?view=api); [OpenRouter: FLUX 3 Image](https://openrouter.ai/black-forest-labs/flux-3-image).
- **Runway como agregador** — su API de créditos (1 crédito = 0,01 $) también factura Kling, Seedance, Wan y Gemini Omni Flash — [Runway dev: AI video API pricing](https://dev.runway.com/learn/ai-video-api-pricing).
- **ComfyUI Cloud** también actúa de router de modelos de pago (p. ej. `pika/pika-2.5-text-to-video` vía Comfy Router) — [Comfy docs: Pika 2.5](https://docs.comfy.org/development/comfy-router/models/pika/pika-2-5-text-to-video/code).
- Directorio Anthropic: los conectores remotos solo están disponibles en planes de pago; la categoría "creative" listaba ~59 conectores (Canva, Adobe con 50+ herramientas de Photoshop/Illustrator/Premiere/Lightroom/Firefly, ElevenLabs, Picsart…) — [Claude Marketplace: creative](https://claude.com/marketplace/connectors-plugins?categories=creative); [Anthropic: Claude for creative work](https://www.anthropic.com/news/claude-for-creative-work).

### Inferences
- Para un creador: Higgsfield (suscripción, todo-en-uno, flujos de anuncios) + fal o Replicate (pago por uso, scripts reproducibles, modelos open como LTX/Wan 2.x/FLUX Klein) es la combinación más flexible. Krea y Magnific son alternativas "de estudio" con login, sin gestionar claves.
- OpenRouter es útil si ya se usa para LLMs y se quiere una sola factura, pero Claude tendría que escribir scripts contra su API (no hay MCP verificado).

### Gaps
- Precios por modelo de fal/Replicate/Runware/Krea no recopilados en detalle (cambian por modelo; consultar sus páginas).
- No se confirmó si Krea y Magnific figuran en el directorio oficial de conectores de Claude.
- No se verificó el número de estrellas/última actualización de los repos (GitHub no consultado directamente).

---

## 3. Proveedores directos y "qué modelo es mejor para qué" (benchmarks, fechas, precios, límites)

### Takeaway
A finales de 2026 el podio de vídeo lo ocupan **Seedance 2.0/2.5 (ByteDance)**, **MiniMax H3**, **Gemini Omni Flash (Google, sucesor de Veo 3.1 en la Gemini API)**, **HappyHorse-1.0** y **Kling 3.0/4.0**; en imagen lideran **GPT Image 2.5/2.6 Sunburst (OpenAI)** seguidos de **Nano Banana 2.1/Pro (Google)**. **Sora está muerto** (app cerrada 26-abr-2026, API 24-sep-2026). Veo 3.1 sigue disponible vía Higgsfield/Vertex pero sus endpoints preview en la Gemini API se retiraron (22-oct-2026). Midjourney sigue sin API oficial.

### Cited Findings

**Benchmarks (fechas inciertas en los snapshots)**
- Artificial Analysis, imagen→vídeo con audio: Dreamina Seedance 2.0 720p 1191 Elo, MiniMax H3 1184, Gemini Omni Flash 1182; MiniMax H3 lidera entre modelos open-weights — [Artificial Analysis I2V leaderboard](https://artificialanalysis.ai/video/leaderboard/image-to-video).
- Artificial Analysis, texto→vídeo: con audio, Seedance 2.0 720p y HappyHorse-1.0 empatados a 1211; sin audio, HappyHorse-1.0 lidera con 1357 — [Artificial Analysis T2V leaderboard](https://artificialanalysis.ai/video/leaderboard/text-to-video). Contradicción: un blog de Invideo (ago-2026) daba Gemini Omni Flash 1245, MiniMax H3 1242, Seedance 2.0 1225 — [Invideo: best AI video model](https://invideo.io/blog/best-ai-video-model/).
- MiniMax H3 fue el primer modelo abierto en liderar un ranking de vídeo — [The Decoder](https://the-decoder.com/chinas-minimax-h3-is-the-first-open-model-to-top-an-ai-video-ranking/).
- Imagen, LMArena (arena.ai) snapshot 21-nov-2026: GPT-Image-2.6 Sunburst (Medium) 1º con 1414, GPT-Image-2.5 Sunburst 1413, MAI-Image-2.7 4º con 1367 (642.524 votos, 87 modelos) — [arena.ai text-to-image](https://arena.ai/leaderboard/text-to-image/overall/). Artificial Analysis a 13-nov-2026 (vía fuente secundaria): GPT Image 2.6 Sunburst 1261, Nano Banana 2.1 1176 — [Tech Insider](https://tech-insider.org/is-best-ai-image-model-today/). Hay categorías específicas en arena.ai para "Product, Branding & Commercial Design" y "Photorealistic & Cinematic" — [arena.ai commercial design](https://arena.ai/leaderboard/text-to-image/commercial-design).

**Google (Gemini API / Vertex AI)**
- Gemini Omni Flash: preview el 30-jun-2026 (`gemini-omni-flash-preview`, 0,10 $/s 720p); Omni 1.1 Flash GA el 27-ago-2026; **Omni 1.2 Flash el 5-nov-2026**: −30% (0,07 $/s 720p), clips nativos de 15 s; tarifas aprox. 0,023 $/s 360p, 0,07 $/s 720p, 0,104 $/s 1080p, 0,209 $/s 4K; las peticiones a 1.1 se enrutarán a 1.2 desde el 3-dic-2026 — [Google blog: Gemini Omni 1.2 Flash](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemini-omni-1-2-flash/); [MarkTechPost 5-nov-2026](https://www.marktechpost.com/2026/11/05/google-gemini-omni-1-2-flash-15-second-video/); [eesel: Omni 1.1 pricing](https://www.eesel.ai/blog/gemini-omni-1-1-flash-pricing).
- Veo 3.1 en Gemini API (tarifas históricas, audio incluido): Standard 0,40 $/s (720p/1080p), 0,60 $/s 4K; Fast 0,10/0,12/0,30 $/s; Lite 0,05/0,08 $/s; los endpoints preview de Veo 3.1 se habrían apagado el 22-oct-2026 con Omni 1.1 Flash como sustituto — [BenchLM: Veo pricing](https://benchlm.ai/media-pricing/veo); [Magic Hour: Veo 3.1 pricing](https://magichour.ai/blog/veo-3-pricing); queja de precio real de Veo 3.1 Lite 8× superior al mostrado — [Google AI forum](https://discuss.ai.google.dev/t/veo-3-1-lite-pricing-shows-0-05-per-video-but-actually-costs-8-times-more/143844). (No verificado contra la página oficial de precios.)
- Nano Banana 2 (`gemini-3.1-flash-image`): ≈0,045 $ (512 px), 0,067 $ (1K), 0,101 $ (2K), 0,151 $ (4K) por imagen; Nano Banana Pro (`gemini-3-pro-image`): 0,134 $ (1K/2K), 0,24 $ (4K); Batch ≈ −50%; Nano Banana 2 Lite ≈0,034 $ (1K) — [Apidog: Nano Banana 2 API pricing](https://apidog.com/blog/nano-banana-2-api-pricing); [Moda: NB2 vs Pro vs Lite](https://moda.app/resources/models/nano-banana). Nano Banana 2 Lite lanzado (GA) el 30-jun-2026 junto a Omni Flash — [Google blog](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/); [Google Cloud blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available).

**OpenAI**
- Sora: discontinuación anunciada el 24-mar-2026; app/web cerrada el 26-abr-2026; API (Videos API, Sora 2 y Sora 2 Pro) apagada el 24-sep-2026, sin sustituto recomendado; Disney retiró una inversión de 1.000 M$ — [VentureBeat](https://venturebeat.com/technology/openai-is-shutting-down-sora-its-powerful-ai-video-app); [PetaPixel 24-mar-2026](https://petapixel.com/2026/03/24/openai-kills-sora-and-loses-disneys-1b-investment/); [Zilliz: Sora shutdown timeline](https://zilliz.com/ai-faq/what-is-the-sora-shutdown-timeline); [Pasquale Pillitteri: Sora 2 API dismessa](https://pasqualepillitteri.it/en/news/18764/openai-sora2-api-dismessa-en).
- GPT Image 2 (`gpt-image-2`): lanzado 21-abr-2026 en API y Codex junto a ChatGPT Images 2.0; ≈8 $/M tokens de imagen de entrada y 30 $/M de salida — [OpenAI Community](https://community.openai.com/t/introducing-gpt-image-2-available-today-in-the-api-and-codex/1379479); [eWeek](https://www.eweek.com/news/openai-chatgpt-images-2-0/). Sucesores `gpt-image-2.5-flare` y `gpt-image-2.5-sunburst` (mismas tarifas por token según una fuente) — [Apidog: ChatGPT Images 2.5](https://apidog.com/blog/what-is-chatgpt-images-2-5/). GPT Image 2.6 (Sunburst y Flare, salida GIF/SVG) disponible en Higgsfield — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).

**Runway**
- MCP alojado oficial: usar Runway en Claude, ChatGPT, Cursor; ofrece Gen-4.5 y otros; no requiere API key, consume el plan Runway; Aleph 2.0 para edición de vídeo — [Runway MCP](https://runwayml.com/mcp); [Runway news: Introducing Runway MCP](https://runwayml.com/news/mcp). Servidor GitHub `runwayml/runway-api-mcp-server` (extensión de Claude Desktop o config manual con API key) — [GitHub](https://github.com/runwayml/runway-api-mcp-server).
- API: Gen-4.5 a 12 créditos (0,12 $)/s; Seedance 2.5 vía Runway 0,30 $/s 720p y 0,68 $/s 1080p (mínimo 80 créditos/clip); Kling 4.0 1080p 0,235 $/s — [Runway dev: AI video API pricing](https://dev.runway.com/learn/ai-video-api-pricing).

**Kling (Kuaishou)**
- Kling 3.0 lanzado a principios de feb-2026 (3 o 5 de febrero según fuente); Kling 3.0 Turbo 17-jun-2026 (≈0,11 $/s 720p con audio, ¥0,8/s); Kling 4.0 Flash en acceso anticipado 28-sep-2026 y Kling 4.0 completo en octubre de 2026 — [Atlas Cloud: Kling 3.0 Turbo/Omni](https://www.atlascloud.ai/blog/guides/kling-3.0-turbo-kling-omni); [Carat: Kling 4.0 release guide](https://carat.im/en/curated/kling-4-0-release-guide). Higgsfield programó una promoción "kling_4_release" desde el 21-oct-2026 — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).
- Precios revendedores Kling 4.0: 0,157 $/s 720p, 0,235 $/s 1080p, Flash 0,094 $/s; Kling 3.0 ≈0,084–0,168 $/s según canal — [Runway dev pricing](https://dev.runway.com/learn/ai-video-api-pricing); [BuildMVPFast: AI video API costs nov-2026](https://www.buildmvpfast.com/api-costs/ai-video).
- MCP: no hay MCP oficial confirmado (una sola fuente afirma `kling.ai/mcp` tras login); existen wrappers comunitarios (`mcp-kling` en npm/PyPI, useapi.net, RunAPI `@runapi.ai/kling-mcp`) que usan claves del Kling developer console — [AITuber: Kling AI MCP server](https://aituber.app/blog/kling-ai-mcp-server/); [npm mcp-kling](https://www.npmjs.com/package/mcp-kling).

**ByteDance (Seedance / Seedream)**
- Seedance 2.5: lanzamiento consumidor 31-jul-2026 (Jimeng, Doubao, Dreamina); API en BytePlus ModelArk "en mercados soportados globalmente" desde 6–7-ago-2026; sin tarifa oficial publicada según un medio — [ByteDance Seed blog: Introducing Seedance 2.5](https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5); [BytePlus: Seedance 2.5 release date](https://ai.byteplus.com/lumina/en/resource/seedance-2-5-release-date); [BytePlus blog](https://byteplus.com/blog/dreamina-seedance2-5).
- Seedance 2.0 desplegado por BytePlus a más de 100 países excluyendo EE. UU.; ByteDance reforzó marcas de agua y salvaguardas de PI antes del despliegue global (31-mar-2026) — [The Decoder](https://the-decoder.com/bytedance-rolls-out-seedance-2-0-to-100-countries-but-keeps-the-us-off-the-list/); [TNW](https://thenextweb.com/news/bytedance-seedance-watermarking-ip-global-rollout). Precios: ≈0,15 $/s 720p (Seedance 2.0) — [Runway dev pricing](https://dev.runway.com/learn/ai-video-api-pricing).
- Seedream 4.5/5.0 Lite/Flash/Pro/5.5 disponibles en Higgsfield (5.5 con PNG transparente) — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).

**MiniMax (Hailuo / H3)**
- MCP oficial `MiniMax-AI/MiniMax-MCP` (PyPI `minimax-mcp`, stdio o SSE, requiere API key de MiniMax): TTS, clonación de voz, vídeo (Hailuo-02, 6/10 s, 768P/1080P), imagen; existe versión JS `MiniMax-MCP-JS` — [PyPI minimax-mcp](https://pypi.org/project/minimax-mcp/); [mcpservers.org: MiniMax MCP](https://mcpservers.org/servers/github-com-minimax-ai-minimax-mcp).
- MiniMax H3: estreno en WAIC (Shanghái) y pesos en Hugging Face el 3-ago-2026; 33.000 M de parámetros; vídeo 2K con audio estéreo nativo; licencia "MiniMax H3 Community License" (no OSI, uso comercial limitado a organizaciones bajo un umbral de ingresos; H3-Context-IR no publicado) — [RITS NYU Shanghai](https://rits.shanghai.nyu.edu/ai/minimax-releases-h3-2k-video-with-native-audio-open-weights-promised/); [eWeek](https://www.eweek.com/news/minimax-h3-2k-ai-video-open-weights/); [DeepLearning.AI The Batch](https://www.deeplearning.ai/the-batch/minimaxs-state-of-the-art-video-model-is-only-minimally-open). **Los pesos excluyen EE. UU. y la UE** — [RITS: MiniMax ships H3 weights with the US and EU excluded](https://rits.shanghai.nyu.edu/ai/minimax-ships-h3-weights-with-the-us-and-eu-excluded/).

**Luma**
- Modelo actual Ray3.2 (jun-2026); Dream Machine y Ray2 deprecados; Ray3.14 más barato y rápido (afirmación del fabricante); API vía "Luma Agents"; Ray3.2 ≈0,06 $/s 720p y 0,24 $/s 1080p (0,30 $ / 1,20 $ por clip de 5 s); plan Plus 30 $/mes (10.000 créditos) — [Luma LLM info](https://lumalabs.ai/llm-info); [Luma Agents docs: pricing](https://docs.agents.lumalabs.ai/guides/pricing/); [WaveSpeed: Luma pricing](https://wavespeed.ai/blog/cost-and-billing/luma-ai-pricing/). No se encontró MCP oficial de Luma.

**Black Forest Labs (FLUX)**
- FLUX 3 anunciado en jul-2026 (acceso anticipado); FLUX 3 Video GA (desde ≈0,06 $/s, 20 s con audio; BFL afirma superar a Seedance 2.0); FLUX 3 Image (≈1-oct-2026): 0,041 $ 768², 0,048 $ 1K, 0,100 $ 1,5K, 0,607 $ 4K; FLUX 3 Image Klein open-weights desde 0,009 $/imagen 1K con límites de licencia — [The Decoder](https://the-decoder.com/black-forest-labs-makes-flux-3-video-generally-available-and-claims-it-beats-seedance-2-0/); [VentureBeat](https://venturebeat.com/technology/black-forest-labs-launches-flux-3-capable-of-generating-images-and-20-second-video-with-audio-but-in-limited-release-to-start); [Layer3 Labs (16-oct-2026)](https://www.layer3labs.io/guides/flux-3-image-pricing); [Magica: FLUX 3 Klein open weights](https://magica.com/news/black-forest-labs-flux-3-image-klein-open-weights). Precios de vídeo contradictorios entre fuentes.

**Wan / LTX / HappyHorse (abiertos o "semi")**
- Wan 3.0 solo como servicio alojado (Alibaba Cloud Model Studio, Qwen Cloud, wan.video); a nov-2026 no hay pesos, código ni licencia; la última línea abierta es Wan 2.2 (Apache 2.0) — [Kenerate: Is Wan 3.0 open source? (nov-2026)](https://kenerateai.com/blogs/is-wan-3-0-open-source); [Wan 2.2 vs 3.0](https://wanvideogenerator.com/blog/wan-2-2-vs-wan-3-0-comparison-guide).
- LTX-2 (Lightricks): pesos abiertos; licencia comunitaria gratis (incluido uso comercial, fine-tuning) para empresas con ingresos anuales < 10 M$; LTX-2.5 añade multi-shot nativo (licencia LTX-2.x efectiva 11-ago-2026) — [Lightricks LTX-2 license (Hugging Face LTX-2.3)](https://huggingface.co/Lightricks/LTX-2.3/blob/main/LICENSE); [LTX license page](https://ltx.io/model/license); [RITS: LTX-2.5](https://rits.shanghai.nyu.edu/ai/ltx-2-5-adds-native-multi-shot-video-and-a-diffusion-decoder/); [GamesBeat](https://gamesbeat.com/lightricks-open-sources-ltx-2-ai-audio-and-video-generation-model/).
- HappyHorse-1.0: creador no identificado con fiabilidad ("laboratorio independiente"); su estatus "open source" es una intención no verificada; muchas webs promocionales son SEO de baja calidad — [Cutout.pro: Is HappyHorse-1.0 open source?](https://www.cutout.pro/learn/blog-is-happyhorse-1-0-open-source/); [WaveSpeed](https://wavespeed.ai/blog/posts/is-happyhorse-1-0-open-source-2026).

**Midjourney, Ideogram, Recraft, Pika**
- Midjourney: sigue siendo plataforma cerrada sin API pública; su vídeo es "V1" (18-jun-2025, solo imagen→vídeo); revendedores no oficiales (Atlas Cloud ≈0,086 $/s, WaveSpeed, CometAPI) — [WaveSpeed: What is Midjourney V8](https://wavespeed.ai/blog/posts/what-is-midjourney-v8-features-pricing-how-to-use-2026); [Atlas Cloud: Youchuan V8.1 I2V](https://www.atlascloud.ai/models/youchuan/v8.1/image-to-video).
- Ideogram: MCP oficial alojado `https://mcp.ideogram.ai/mcp` (OAuth); Claude Code: `claude mcp add --transport http ideogram https://mcp.ideogram.ai/mcp`; generar, editar, upscale y reencuadrar — [Ideogram MCP](https://ideogram.ai/features/mcp/).
- Recraft: MCP alojado `https://mcp.recraft.ai/mcp` (OAuth 2.0, factura créditos de suscripción, enlace de un clic "Add Recraft to Claude"); local `@recraft-ai/mcp-recraft-server` con API key (unidades API separadas) — [Recraft docs: MCP setup](https://www.recraft.ai/docs/mcp-reference/setup); [Recraft blog](https://www.recraft.ai/blog/recraft-mcp).
- Pika: solo se halló Pika 2.5 vía Comfy Router; no se encontró en OpenRouter ni MCP propio — [Comfy docs](https://docs.comfy.org/development/comfy-router/models/pika/pika-2-5-text-to-video/code).

**Lip-sync / talking heads**
- fal destaca H3 Max Lip Sync como mejor opción para presentadores de producto desde una foto, además de sync-3 (Sync), Kling LipSync, VEED Fabric 1.0, LatentSync, etc. — [fal: AI lip sync generators](https://fal.ai/learn/tools/ai-lip-sync-generators). VEED afirma que Fabric 1.0 supera a Kling V2 Pro, HeyGen, Creatify Aurora, OmniHuman v1.5 y Hedra (test propio, sesgado) — [VEED: best lipsync API](https://www.veed.io/learn/best-lipsync-api). PixVerse considera a Kling el lip-sync más cinematográfico para vídeo de personajes — [PixVerse](https://pixverse.ai/en/blog/best-ai-lip-sync-video-generators-2026). Kling 3.0: lip-sync nativo en 8+ idiomas (según Higgsfield) — [Higgsfield blog: consistent AI characters](https://higgsfield.ai/blog/tools-for-consistent-ai-characters).
- En Higgsfield: Sync Lipsync 3 (`sync_so`) y Higgsfield Intone (1–2 personajes, 1–6 audios) — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).

### Inferences (mapa "para qué")
- **Realismo/cinematografía con audio nativo:** Seedance 2.0/2.5, Gemini Omni Flash 1.2, Veo 3.1 (aún vía Higgsfield/Vertex), MiniMax H3; Kling 4.0 para planos largos (hasta 30 s) y 4K.
- **Movimiento/física y multi-shot:** Kling 3.0/4.0 (multi-shot con consistencia entre cortes), Seedance 2.5 ("one-take", hasta 30 s).
- **Producto/anuncios:** Higgsfield Marketing Studio / DTC Ads / Ads Studio / Ad Multiplier (sobre Seedance 2.5), Seedance 2.0 "multi-SKU"; para imágenes de producto con texto: GPT Image 2.6, Nano Banana Pro, Ideogram 4.6; vectores/logos: Recraft V4.1, Ideogram Vector.
- **Personajes/influencers:** Higgsfield Soul 2.0 + Soul ID, Soul Cast, AI Influencer; Kling 3.0 Omni (7 refs), Seedance (hasta 12 refs en Higgsfield).
- **Lip-sync/talking head:** Higgsfield Intone o Sync Lipsync 3; H3 Max Lip Sync; o modelos con audio nativo (Kling 3.0, Seedance) cuando el diálogo es corto.
- **Estilizado/animación:** Wan 2.6/2.7 ("stylized, experimental"), Z Image, Recraft V4 Styles, FLUX 3 Image; Midjourney solo manualmente (sin API).
- **Presupuesto/volumen:** Gemini Omni 1.2 Flash 720p (0,07 $/s), Veo 3.1 Lite, Kling 3.0 Turbo / 4.0 Flash, Luma Ray3.2 720p, MiniMax H3; imágenes: Nano Banana 2 Lite, FLUX 3 Klein.

### Gaps
- No se pudo abrir Artificial Analysis directamente: los Elo citados no tienen fecha clara y no se sabe si Kling 4.0, Seedance 2.5 u Omni 1.2 ya están ranqueados.
- No hay tarifa oficial de Kling 4.0 ni de Seedance 2.5 (solo revendedores).
- Fecha exacta de lanzamiento de Seedance 2.0, GPT Image 2.5/2.6 y Nano Banana 2.1 no confirmada.
- No se confirmó en la web oficial de Google si Veo 3.1 sigue disponible en Vertex AI tras el 22-oct-2026.

---

## 4. Audio: ElevenLabs (MCP oficial), Suno/Udio y licencias de música IA para anuncios

### Takeaway
ElevenLabs tiene conector oficial alojado (`https://api.elevenlabs.io/v1/mcp`, OAuth) que desde 2026 genera voz, música, imagen y vídeo (50+ modelos) además de gestionar agentes; Eleven v4 (28-sep-2026) y Music v2 (15-jun-2026) son sus modelos actuales. Para música en anuncios, ElevenLabs Music es la opción "limpia" más clara (uso comercial amplio en planes de pago, con matices por plan); Suno/Udio están en transición a servicios licenciados y Suno sigue en litigio con Universal y Sony.

### Cited Findings
- Conector ElevenLabs: voz, música, imagen y vídeo en Claude, ChatGPT y Cursor con acceso a 50+ modelos; en Claude se instala desde el directorio de conectores; en Claude Code: `claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp` y luego `/mcp` para iniciar sesión; el conector alojado llegó en agosto solo con gestión de agentes y luego añadió generación — [ElevenLabs blog: voice, music, image and video generation in the ElevenLabs MCP](https://elevenlabs.io/blog/introducing-voice-music-image-and-video-generation-in-the-elevenlabs-mcp); [TestingCatalog](https://www.testingcatalog.com/elevenlabs-mcp-can-now-generate-voice-music-images-video/). La ficha del marketplace de Claude lo describe para gestionar ElevenAgents — [Claude Marketplace: creative](https://claude.com/marketplace/connectors-plugins?categories=creative).
- Servidor local original: repo `elevenlabs/elevenlabs-mcp`, lanzamiento `uvx elevenlabs-mcp` con `ELEVENLABS_API_KEY` en config; si aparece `spawn uvx ENOENT`, usar la ruta absoluta de `uvx`; un directorio lo marca como deprecado en favor del alojado — [GitHub elevenlabs/elevenlabs-mcp](https://github.com/elevenlabs/elevenlabs-mcp); [PyPI elevenlabs-mcp](https://pypi.org/project/elevenlabs-mcp). Las funciones MCP no están disponibles con Zero Retention Mode o HIPAA — [ElevenLabs music API terms](https://elevenlabs.io/music-api-terms).
- Eleven v4 y v4 Turbo lanzados el 28-sep-2026 (v4 Turbo ≈100 ms de latencia; 90+ idiomas) — [ElevenLabs changelog 28-sep-2026](https://elevenlabs.io/docs/changelog/2026/9/28).
- Music v2 disponible en la API (changelog 15-jun-2026) con rebaja de precios de hasta 50% (API) / 40% (ElevenCreative); TechCrunch (27-may-2026): puede cambiar de género a mitad de pista — [ElevenLabs changelog 15-jun-2026](https://elevenlabs.io/docs/changelog/2026/6/15); [ElevenLabs blog: Music v2](https://elevenlabs.io/blog/introducing-music-v2); [TechCrunch](https://techcrunch.com/2026/05/27/elevenlabss-new-music-generation-model-can-switch-genres-mid-track/). Music v2.5 aparece en el catálogo de Higgsfield — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).
- Licencia Eleven Music: página API "uso comercial amplio en todos los planes de pago; cine, TV y grandes estudios de juegos requieren Enterprise"; pero la tabla de derechos v1 lista para el plan Creator publicidad/cine/TV/juegos y contenido patrocinado como no permitidos y exige atribución en algunos planes; en el plan gratis se exige "Created in collaboration with ElevenLabs" — [Eleven Music v1 Terms](https://elevenlabs.io/eleven-music-v1-terms); [Eleven Music model-specific terms](https://elevenlabs.io/eleven-music-model-specific-terms); [YourStory](https://yourstory.com/ai-story/elevenlabs-eleven-music-ai-generator-launch). (Conflicto: revisar la tabla del plan concreto antes de usar en anuncios.)
- Suno/Udio: Warner llegó a acuerdo con Udio (nov-2025) y con Suno (nov-2025, con compra de Songkick y opt-in de artistas para voz/imagen); Universal pactó con Udio; Universal y Sony seguían litigando contra Suno (negociación estancada abr-2026; nueva demanda según resumen de sep-2026); Sony volvió a demandar a Udio por 30.000+ grabaciones; Klay firmó con las tres grandes — [Billboard](https://billboard.com/pro/suno-warner-music-sign-ai-licensing-deal-settle-lawsuit/); [Music Business Worldwide](https://www.musicbusinessworldwide.com/warner-music-group-settles-with-suno-strikes-first-of-its-kind-deal-with-ai-song-generator/); [Music Week](https://www.musicweek.com/labels/read/warner-music-group-signs-ai-licensing-agreement-with-udio/093097); [Opus: AI music news abr-2026](https://www.opus.pro/blog/ai-music-news-april-2026).
- MiniMax MCP también ofrece TTS y clonación de voz — [PyPI minimax-mcp](https://pypi.org/project/minimax-mcp/). En Higgsfield: `create_voice` (clonación), `voice_change`, `separate_stems`, Seed Audio 1.0, Qwen TTS, ElevenLabs Dubbing — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).

### Inferences
- Para anuncios de un creador español: voz con Eleven v4 (directo o vía Higgsfield), música con Eleven Music en plan de pago verificando la tabla de derechos del plan; evitar Suno/Udio para campañas pagadas hasta que sus productos licenciados y términos estén claros.
- Si se genera música desde Higgsfield (ElevenLabs Music v2/v2.5), la licencia aplicable es la de Higgsfield + la del proveedor subyacente; no se encontró documentación que lo aclare.

### Gaps
- No se encontró cómo se mapean los derechos de Eleven Music cuando se genera a través de Higgsfield o del MCP.
- No se verificaron precios por minuto de TTS/música de ElevenLabs a nov-2026.
- Estado comercial actual de los productos licenciados de Suno/Udio (lanzados o no a nov-2026) sin confirmar.

---

## 5. Consistencia de personajes, productos y estilos

### Takeaway
En 2026 la consistencia se consigue sobre todo con **referencias multimodales nativas** (Seedance 2.x hasta 12 assets en Higgsfield; Kling 3.0 Omni hasta 7 imágenes; FLUX 3 Image hasta 10; MiniMax H3 Image hasta 16) y con **identidades entrenadas** (Higgsfield Soul ID / Soul Cast, LoRA). Para productos: fotos de producto como referencia en Marketing Studio/Ads Studio y "brand kits". Para estilo: Recraft V4 Styles, `style_id` de Soul, referencias de estilo. Start/end frame está disponible en casi todos los modelos de vídeo.

### Cited Findings
- Higgsfield lista siete herramientas de consistencia en 2026: Soul ID, Flux.2, LoRA, Seedance 2.0, Kling 3.0, Midjourney, Runway Gen-4.5 (fuente interesada) — [Higgsfield blog: tools for consistent AI characters](https://higgsfield.ai/blog/tools-for-consistent-ai-characters).
- Soul ID se entrena una vez y se mantiene en Seedance 2.0, Kling 3.0, Veo 3.1 y Nano Banana Pro dentro de Higgsfield — [Higgsfield blog](https://higgsfield.ai/blog/tools-for-consistent-ai-characters).
- En Higgsfield, Seedance 2.0 acepta hasta 12 assets de referencia en una generación; una comparativa afirma 2 personajes fijos a lo largo de 41 planos sin LoRA (anécdota) — [Higgsfield blog: best AI video consistent characters](https://higgsfield.ai/blog/best-ai-video-consistent-characters); [DevX: Seedance 2.0 character consistency](https://www.devx.com/artificial-intelligence-ai/seedance-2-0-character-consistency/).
- Kling 3.0 mantiene la cara entre cortes en multi-shot — [Higgsfield blog](https://higgsfield.ai/blog/tools-for-consistent-ai-characters); [Kapwing: Seedance vs Veo vs Kling](https://www.kapwing.com/resources/seedance-vs-veo-vs-kling-text-to-video-comparison-2026).
- "La técnica más eficaz es usar imágenes de referencia" — [DEV: AI video character consistency](https://dev.to/genra_ai/ai-video-character-consistency-keep-the-same-face-across-every-scene-5fb7).
- Parámetros del catálogo en vivo: `soul_2` acepta `soul_id` y `style_id` (estilos curados); Soul Cinema acepta `soul_id`; `kling_o3_image_reference` hasta 7 imágenes; `flux_3_image` hasta 10; `minimax_h3_image` hasta 16; `ms_image` (DTC Ads) hasta 14 con brand kit, avatares y productos; `marketing_studio_v2_video` con roles `product_photo`, `character_photo`, `location_photo`, `avatars`; `marketing_studio_v2_reference2video` recrea un vídeo de referencia con tu personaje y producto; `recraft_v4_styles` usa un estilo Recraft guardado; Seedance/Kling 4.0/Wan 3.0/Omni Flash aceptan `start_image`, `end_image`, `image_references`, `video_references` y (varios) `audio_references`; voces clonadas como "reference elements" reutilizables en Eleven v4, Qwen TTS y Seed Audio; herramientas `manage_reference_elements`, `show_characters`, flujo "character-sheet", `gpu_lora_import` — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).
- Instrucción del servidor Higgsfield: "Preserve references and seed; use randomize=false for exact settings" en AI Influencer — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).
- Ads Studio permite crear marca y productos persistentes (`ads_studio_create_brand`, `ads_studio_add_product`) — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).

### Inferences
- Flujo recomendado para el usuario: (1) hoja de personaje / AI Influencer o Soul ID en Higgsfield; (2) registrar personaje, producto, localización y voz como *reference elements*; (3) generar keyframes en imagen (Nano Banana Pro / GPT Image 2.6 / Soul 2.0) y animarlos con start/end frame (Kling 4.0, Seedance 2.5, Omni Flash 1.2); (4) fijar seed y guardar prompts en un fichero de proyecto que Claude reutilice; (5) para marca, Ads Studio con brand kit.
- LoRA tiene sentido solo con el camino local (ComfyUI + FLUX/Wan 2.2/LTX-2) o vía `gpu_lora_import` de Higgsfield.

### Gaps
- No se encontró benchmark independiente que compare Soul ID vs LoRA vs referencias nativas; casi todas las fuentes son de Higgsfield u otros vendedores.
- No se verificó cómo funcionan las "elements" de Kling 4.0 / Kling Image 4.0 fuera de Higgsfield.

---

## 6. Ruta local/open-source: ComfyUI + MCP, Wan/LTX/FLUX en local, GPU

### Takeaway
Comfy-Org publica MCP oficial (local `comfy-mcp` basado en comfy-cli y alojado `cloud.comfy.org/mcp` con API key). Los modelos de vídeo abiertos utilizables en 2026 son LTX-2/2.5 (gratis bajo 10 M$ de ingresos, ~16 GB VRAM + 64 GB RAM), Wan 2.2 (Apache 2.0; 24 GB para TI2V-5B, 80 GB para A14B según el desarrollador), FLUX 3 Klein (imagen) y MiniMax H3 (pesos excluidos de la UE). Wan 3.0 no tiene pesos.

### Cited Findings
- ComfyUI ofrece dos MCP (alojado en `cloud.comfy.org/mcp` con API key y local open-source `comfy-mcp`) para que Claude Desktop/Code, Cursor, etc. generen imagen, vídeo, audio y 3D; el local se añade con `claude mcp add comfy-mcp …`; `COMFY_API_KEY` opcional (solo para nodos de API de partners) — [Comfy docs: MCP](https://docs.comfy.org/development/mcp); [Comfy docs: Cloud MCP server](https://docs.comfy.org/development/cloud/mcp-server.md); [GitHub Comfy-Org/comfy-mcp](https://github.com/Comfy-Org/comfy-mcp); [PyPI comfy-mcp](https://pypi.org/project/comfy-mcp/).
- Alternativas comunitarias: `artokun/comfyui-mcp` (servidor MCP + plugin de Claude Code; listado como archivado el 9-oct-2026) y `shawnrushefsky/comfyui-mcp` (Docker) — [artokun README](https://raw.githubusercontent.com/artokun/comfyui-mcp/main/README.md); [shawnrushefsky/comfyui-mcp](https://github.com/shawnrushefsky/comfyui-mcp).
- GPU: LTX-2 (~22B parámetros) necesita 16 GB VRAM (RTX 5070 Ti o superior) + 64 GB RAM según guía de NVIDIA; Wan 2.2: 24 GB VRAM para TI2V-5B y 80 GB para A14B en una sola GPU (desarrollador); comunidad: Wan 2.2 14B ~16 GB a 720p con GGUF Q5_K_M, TI2V-5B ~8 GB — [SourceIT: RTX 5090 for AI video](https://sourceit.com.sg/blogs/news/rtx-5090-ai-video-generation-studio); [Atlas Cloud: Wan 3.0 VRAM](https://www.atlascloud.ai/blog/tips/wan-3.0-vram-requirements).
- Wan 3.0 sin pesos a nov-2026 — [Kenerate](https://kenerateai.com/blogs/is-wan-3-0-open-source).
- LTX-2 licencia: gratis bajo 10 M$ de ingresos anuales (agregando filiales) — [LTX license](https://ltx.io/model/license); [ScanCode: LTX-2 CLA 2026](https://scancode-licensedb.aboutcode.org/ltx-2-cla-2026.html).
- MiniMax H3 pesos con exclusión de UE y EE. UU. — [RITS NYU Shanghai](https://rits.shanghai.nyu.edu/ai/minimax-ships-h3-weights-with-the-us-and-eu-excluded/).
- Alternativa "local en la nube": Higgsfield expone alquiler de GPU (`gpu_rent`, `gpu_rental_exec`, `gpu_list_models`, `gpu_lora_import`) desde el mismo conector — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).

### Inferences
- Para un creador en España sin GPU de 24 GB+, la ruta local solo compensa para imagen (FLUX Klein/FLUX.2) o LTX-2 en una RTX 5080/5090; para vídeo de calidad punta (Seedance/Kling/Omni) no hay equivalente abierto utilizable legalmente en la UE (H3 excluye la UE).

### Gaps
- No se verificaron estrellas/actividad reciente de `Comfy-Org/comfy-mcp`.
- Requisitos de VRAM de LTX-2.5 y FLUX 3 Klein no encontrados.

---

## 7. Términos comerciales, marcas de agua (SynthID, C2PA), disponibilidad en la UE y AI Act

### Takeaway
La mayoría permite uso comercial en planes de pago, pero con trampas: Higgsfield se reserva una licencia perpetua para entrenar con entradas/salidas; Kling exige plan de pago y entrena con entradas salvo opt-out; Runway marca con agua el plan gratis. En la UE, desde el **2-ago-2026** el art. 50 del AI Act obliga a quien publica (deployer) a etiquetar deepfakes/contenido que parezca real; los proveedores con sistemas en el mercado antes de esa fecha tienen hasta el **2-dic-2026** para el marcado legible por máquina. Veo históricamente no estaba disponible en el EEE; los pesos de MiniMax H3 excluyen la UE.

### Cited Findings
- Higgsfield: los usuarios conservan la propiedad pero la empresa reclama una licencia perpetua, mundial e irrevocable para usar entradas y salidas para entrenamiento y marketing (24-jul-2026) — [StartupFortune](https://startupfortune.com/higgsfield-ai-tells-creators-they-own-their-videos-but-quietly-claims-a-perpetual-worldwide-license-to-train-on-them/). Otra fuente dice que no impone restricción comercial — [HackerNoon: commercial checklist tool by tool](https://hackernoon.com/can-you-use-ai-generated-video-commercially-heres-the-checklist-tool-by-tool).
- Kling: uso comercial y eliminación de marca de agua desde plan Standard; términos de abr-2026 permiten entrenar con entradas (revocable por email) — [LicenseOrg: AI video licensing 2026](https://licenseorg.com/blog/ai-video-licensing-2026); [HackerNoon](https://hackernoon.com/can-you-use-ai-generated-video-commercially-heres-the-checklist-tool-by-tool).
- Runway: exportaciones gratis con marca de agua; sus términos de oct-2026 no restringen uso comercial — [LicenseOrg](https://licenseorg.com/blog/ai-video-licensing-2026).
- En pipelines mixtos hay que cumplir los términos de cada herramienta; quitar una marca de agua no cambia la licencia — [Digital Applied: AI creative licensing landmines (9-ago-2026)](https://www.digitalapplied.com/blog/ai-creative-licensing-landmines-agency-client-work).
- SynthID (marca invisible de Google que persiste si se borra metadatos) vs C2PA (metadatos de procedencia); se recomiendan ambos; una guía afirma que Kling y Seedance no incluyen marcado obligatorio legible por máquina conforme al art. 50 (fuente única) — [AI Video Bootcamp: C2PA y EU AI Act](https://aivideobootcamp.com/blog/ai-disclosure-compliance-2026-c2pa-eu-ai-act/); [PPC Land: explaining SynthID](https://ppc.land/explaining-synthid/). ByteDance colabora con C2PA desde 2024 para etiquetar en TikTok y reforzó marcas de agua en Seedance 2.0 — [SCMP](https://www.scmp.com/tech/policy/article/3348290/bytedance-bolsters-seedance-20-watermarking-ip-safeguards-ahead-global-roll-out).
- AI Act art. 50: obligaciones de deployers (deepfakes) aplicables desde el 2-ago-2026; contenido que parezca o suene como persona real debe etiquetarse aunque no haya intención de engañar; para obras evidentemente artísticas/satíricas/ficticias basta con revelar su existencia; Directrices de la Comisión y Código de Prácticas publicados el 20-jul-2026; proveedores con sistemas comercializados antes del 2-ago-2026 tienen hasta el 2-dic-2026 (Digital Omnibus); sin obligación retroactiva — [Orrick (ago-2026)](https://www.orrick.com/en/Insights/2026/08/EU-AI-Act-Transparency-Obligations-for-AI-Generated-Content-Article-50); [Morgan Lewis](https://www.morganlewis.com/blogs/sourcingatmorganlewis/2026/08/eu-ai-acts-transparency-rules-what-went-into-effect-on-2-august); [DLA Piper (10-ago-2026)](https://www.dlapiper.com/en-pt/insights/publications/2026/08/the-eus-new-guidelines-on-ai-transparency); [artificialintelligenceact.eu: Article 50 guide](https://artificialintelligenceact.eu/transparency-rules-article-50/).
- España: AESIA publicó 16 guías (en español), no vinculantes y pendientes de actualizar tras el Digital Omnibus; coordinación con AEPD, consumo, publicidad y propiedad intelectual — [Pearl Cohen](https://www.pearlcohen.com/new-guidance-under-the-eu-ai-act-ahead-of-its-next-enforcement-date/); [Economist & Jurist](https://www.economistjurist.es/articulos-juridicos-destacados/ai-act-el-articulo-50-activa-la-transparencia-obligatoria-de-la-ia-el-2-de-agosto/); [Garrigues](https://www.garrigues.com/en_GB/garrigues-digital/how-combat-deepfakes-and-other-synthetic-content-i-ai-act-and-its-code-practice).
- Disponibilidad UE: la página de producto de Google indicaba que Veo "no está disponible en el EEE, Suiza ni Reino Unido" (blog feb-2026); un hilo del foro de Google reporta 404 para Veo 3.1 en todas las regiones europeas de Vertex AI — [DEV: geo-restricted AI video generators](https://dev.to/astro-official/geo-restricted-ai-video-generators-is-it-possible-to-use-googles-veo3-outside-the-us-2bkf); [Google AI forum: Veo 3.1 EU regions](https://discuss.ai.google.dev/t/request-veo-3-1-access-in-eu-regions-vertex-ai-project-moicro-ai-reception/181186). No se encontraron restricciones UE específicas para Gemini Omni Flash ni Nano Banana 2 Lite — [Google Cloud blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available). Seedance 2.0 a 100+ países excepto EE. UU. (UE no especificada) — [The Decoder](https://the-decoder.com/bytedance-rolls-out-seedance-2-0-to-100-countries-but-keeps-the-us-off-the-list/). Higgsfield factura en EUR a esta cuenta (opera para España) — [Higgsfield MCP (consulta en vivo)](https://mcp.higgsfield.ai/mcp).
- LTX-2 y MiniMax H3 tienen umbrales de ingresos en sus licencias; Wan 2.2 es Apache 2.0 — [LTX license](https://ltx.io/model/license); [DeepLearning.AI](https://www.deeplearning.ai/the-batch/minimaxs-state-of-the-art-video-model-is-only-minimally-open); [Wan 2.2 vs 3.0](https://wanvideogenerator.com/blog/wan-2-2-vs-wan-3-0-comparison-guide).

### Inferences
- Aggregadores como Higgsfield actúan como "puerta" para modelos que en la UE no se pueden contratar directamente (p. ej., Veo); esto es cómodo, pero la responsabilidad de etiquetado (art. 50) recae en el creador que publica: conviene etiquetar siempre los vídeos realistas con personas ("Contenido generado con IA") y conservar los metadatos C2PA/SynthID cuando existan.
- Para clientes/anuncios: preferir planes de pago, revisar términos de entrenamiento (Higgsfield, Kling) si el cliente exige confidencialidad de assets.

### Gaps
- No se leyeron directamente los términos de servicio de Higgsfield, Kling, Seedance/BytePlus, Runway ni Google (fuentes secundarias).
- No se confirmó si Higgsfield, Kling o Seedance aplican C2PA/SynthID a las salidas descargadas.
- Disponibilidad UE de Seedance 2.5 (BytePlus "mercados soportados") y de las funciones TikTok/Meta de Higgsfield sin confirmar.
- Otros conectores creativos observados en la sesión del usuario (Figma con modelos "Weave" y `generate_image`, Gamma `generate_image`, Descript para edición, Motion solo lectura; Adobe falló al conectar) no se investigaron en profundidad.
