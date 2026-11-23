# Skills, plugins y servidores MCP para Claude (vídeo, motion graphics, diseño, branding, pósters, redes y anuncios): cómo encontrarlos, instalarlos y gestionarlos (estado a 23-nov-2026)

> Notas de investigación. Los comandos, rutas, URL y etiquetas de la interfaz están copiados tal cual (en inglés) de la fuente. Las etiquetas de la interfaz van en **negrita**.
> Limitación de red en esta sesión: no se pudieron abrir `skills.sh`, `snyk.io` ni `modelcontextprotocol.io` (DNS bloqueado). Lo que se dice de ellos sale de fragmentos de búsqueda o de fuentes secundarias, y así se indica.

---

## 1. ¿Qué es exactamente una Agent Skill (formato SKILL.md, carpetas, scripts y assets)? ¿Dónde se guardan? ¿Es un estándar abierto?

### Takeaway
Una skill es una carpeta con un archivo `SKILL.md` obligatorio (frontmatter YAML con `name` y `description`, más instrucciones en Markdown). Puede incluir además `references/`, `assets/` y `scripts/`, que Claude carga solo cuando le hacen falta (lo que Anthropic llama "progressive disclosure"). En Claude Code las skills viven en `~/.claude/skills/` (personales), `.claude/skills/` (del proyecto), dentro de plugins o en settings gestionados de empresa. "Agent Skills" es un estándar abierto (agentskills.io). Anthropic lo publicó en dic-2025 y el 22-oct-2026 lo donó a la Agentic AI Foundation (Linux Foundation). Lo han integrado más de 70 plataformas.

### Cited Findings
**Definición y anatomía**
- Una skill es una carpeta con un archivo `SKILL.md` de instrucciones. Claude la usa cuando la tarea encaja con ella, o la invocas tú con `/skill-name`. El cuerpo solo se carga al usarla. Los comandos de `.claude/commands/` se han fusionado con las skills y los archivos antiguos siguen funcionando. — [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)
- Estructura recomendada por Anthropic, con un ejemplo de marca (`brand-guidelines`): `SKILL.md` (obligatorio), `references/` (documentación que Claude lee cuando un paso lo pide), `assets/` (plantillas, imágenes, tablas, archivos que Claude copia o rellena) y `scripts/` (código que Claude ejecuta). "The directory name must match the `name` field". — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- Campos obligatorios para claude.ai y la especificación: `name`, solo minúsculas, números y guiones, hasta 64 caracteres e igual al nombre de la carpeta; `description`, hasta 1.024 caracteres, que es el límite de la especificación. Recomendación: `SKILL.md` de menos de 500 líneas, con el material largo en archivos aparte. — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- En los scripts hay que usar `${CLAUDE_SKILL_DIR}` (p. ej. `python3 ${CLAUDE_SKILL_DIR}/scripts/render.py`). En el chat de claude.ai la carpeta entera se copia al sandbox de ejecución de código, así que conviene que la ruta también se pueda leer como relativa (`scripts/render.py`). No hay que meter API keys ni credenciales en una skill. Para servicios externos se usa un conector. — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- Progressive disclosure en 3 niveles: (1) `name` + `description` en el system prompt al arrancar; (2) el cuerpo de `SKILL.md` si la tarea parece relevante; (3) los archivos enlazados solo cuando se necesitan. Los scripts se pueden ejecutar sin cargarlos en el contexto. Artículo publicado el 16-oct-2025. — [Anthropic Engineering: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

**Frontmatter extendido de Claude Code (no portable)**
- Claude Code acepta campos extra: `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `background`, `hooks`, `paths`, `shell`. También admite sustituciones (`$ARGUMENTS`, `$0`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_PROJECT_DIR}`…) e inyección dinámica con `` !`comando` ``. — [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)
- **Ojo para portar skills:** fuera de Claude Code (subida a claude.ai, Skills API, `package_skill.py` de anthropics/skills) solo se aceptan `name`, `description`, `license`, `compatibility`, `metadata` y `allowed-tools`. "Other fields cause a hard error at packaging or upload." — [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)

**Dónde viven las skills (Claude Code)**
- Tabla oficial:
  - Enterprise: `.claude/skills/<skill-name>/SKILL.md` en el directorio de managed settings.
  - Personal: `~/.claude/skills/<skill-name>/SKILL.md`.
  - Project: `.claude/skills/<skill-name>/SKILL.md`.
  - Nested: `<subdir>/.claude/skills/...`.
  - `--add-dir`.
  - Plugin: `<plugin>/skills/<skill-name>/SKILL.md`, invocada como `/plugin-name:skill-name`.
  - Precedencia: enterprise > personal > project. Las de plugin no chocan porque llevan namespace. — [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)
- Los nombres `anthropic-skills` y `anthropic-skills:*` están reservados para las skills sincronizadas desde claude.ai. Las skills de claude.ai sincronizadas en sesiones de terminal requieren v2.1.273+. — [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)
- Prueba rápida: `mkdir -p ~/.claude/skills/summarize-changes`, se escribe `SKILL.md` y se invoca con `/summarize-changes`. — [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)

**Estándar abierto**
- "Claude Code skills follow the open Agent Skills standard (agentskills.io), which works across multiple AI tools", y Claude Code lo amplía con más funciones. — [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)
- 22-oct-2026: Anthropic dona Agent Skills (especificación, nombre, logo, organización de GitHub y dominio agentskills.io) a la Agentic AI Foundation (AAIF, Linux Foundation). Mantenedores de Anthropic, Google, OpenAI y otras empresas. Más de 70 plataformas integradas; 1 millón de skills publicadas y casi 280 millones de instalaciones. Adoptantes citados: ChatGPT, Cursor, GitHub Copilot, VS Code. Cronología: skills lanzadas en oct-2025 y estándar abierto en dic-2025. — [Anthropic: Donating Agent Skills to the AAIF](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation)
- Rutas de otros agentes (fuentes secundarias): Codex lee `.agents/skills/` — [SSOJet](https://ssojet.com/blog/skill-md-playbooks.md); Gemini CLI escanea `~/.gemini/skills` — [Firecrawl](https://firecrawl.dev/blog/agent-skills); Cursor también carga `.claude/skills/` — [tosin2013 research page](https://tosin2013.github.io/rhel-devops-skills-cli/research/agent-skills-open-standard.html).
- Recuentos de adopción que no coinciden: 16+ herramientas (mar-2026) según [DEV Community](https://dev.to/serenitiesai/ai-agent-skills-guide-2026-build-skills-for-16-ai-tools-1jea); 32+ a mediados de 2026 según [Security Boulevard](https://securityboulevard.com/2026/06/15-skill-md-playbooks-that-work-across-cursor-codex-and-antigravity/); 70+ según [Anthropic](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation), que es la fuente con más autoridad.
- Validación: `skills-ref validate ./my-skill`, de [agentskills/agentskills](https://github.com/agentskills/agentskills/tree/main/skills-ref). Si pasa, imprime `Valid skill: ./my-skill`. Para plugins: `claude plugin validate ./my-plugin`. — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)

### Inferences
- Para un creador, la misma carpeta de skill sirve en Claude Code, claude.ai, Cowork, Cursor, Codex y otros, siempre que el frontmatter se quede en los 6 campos portables. Si la skill personal de marca usa `disable-model-invocation` o `context: fork`, fallará al subirla a claude.ai.
- `assets/` es el sitio natural para logos, fuentes, plantillas Remotion/HyperFrames y paletas. `references/` sirve para el "brand book" detallado por formato.

### Gaps
- No pude abrir agentskills.io directamente para listar los campos opcionales exactos de la especificación (`license`, `compatibility`, `metadata`). Se infieren de la lista de campos aceptados que da Claude Code Docs.
- Las rutas exactas de Codex, Gemini CLI y Cursor salen solo de blogs de terceros.

---

## 2. Plugins de Claude Code: marketplaces, instalación, actualización, desinstalación y distribución a equipos (CLI, desktop, VS Code, web)

### Takeaway
Un plugin empaqueta skills, agentes, hooks y servidores MCP/LSP. Se instala desde un "marketplace", que es un repo con `.claude-plugin/marketplace.json`. El marketplace oficial `claude-plugins-official` viene añadido por defecto. Cualquier otro se añade con `/plugin marketplace add owner/repo` y luego `/plugin install plugin@marketplace`. Hay tres scopes (user, project, local). El marketplace antiguo `claude-code-plugins` de `anthropics/claude-code` está **deprecado**.

### Cited Findings
**Instalar (terminal / CLI)**
- En una sesión: `/plugin install commit-commands@claude-plugins-official`. El comando abre el panel `/plugin` con los detalles: **Will install**, **Last updated** y **Context cost**. Luego eliges el scope: **Install for you (user scope)**, **Install for all collaborators on this repository (project scope)** o **Install for you, in this repo only (local scope)**. Si no quedó activo, `/reload-plugins` (o `/reload-plugins --force`). — [Claude Code Docs: Install and manage plugins](https://code.claude.com/docs/en/discover-plugins)
- `/plugin` sin argumentos abre la pestaña **Discover** para buscar. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Desde la shell, sin abrir sesión: `claude plugin install <name>@<marketplace>` (scope user por defecto; `--scope project` o `--scope local`). En una máquina nueva hay que ejecutar antes `claude plugin marketplace add anthropics/claude-plugins-official`. Para scripts, `--yes`. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Añadir marketplace e instalar en un solo paso: `/plugin install deploy-helper --marketplace your-org/plugins` (v2.1.275+), o desde la shell `claude plugin install deploy-helper --marketplace your-org/plugins` (v2.1.292+). — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Fuentes válidas para `/plugin marketplace add`:
  - `owner/repo`, con `#ref` opcional para fijar rama o tag.
  - URL git completa con `https://` (o `git@host:path`).
  - Ruta local que empiece por `./` o `../`.
  - URL `https://.../marketplace.json`.
  - Atajo: `/plugin market`. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Verificación: escribe `/` y busca `/<plugin>:<skill>`, o ejecuta `claude plugin list` (muestra Version, Scope y Status). — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)

**Desktop app (pestaña Code) y VS Code**
- Desktop, pestaña **Code**: botón **+** junto al prompt → **Add plugins** (o **Plugins** → **Browse plugins** / **Manage plugins**) → elegir el plugin → elegir el scope. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- VS Code: escribe `/plugins` → **Manage plugins** → pestaña **Plugins** → **Install**. Si la lista está vacía, añade `anthropics/claude-plugins-official` en **Marketplaces**. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- La terminal, las sesiones locales de la desktop app y VS Code comparten los mismos archivos de settings. Un plugin instalado a scope user en uno de ellos aparece en los otros. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- JetBrains: usa los pasos de terminal. `claude -p` (no interactivo): `/plugin` no funciona, pero los plugins ya instalados sí cargan. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)

**Claude Code en la web (claude.ai/code, sesiones cloud)**
- "A cloud session, including the browser at claude.ai/code, has no plugin browser and doesn't load the plugins you installed at user or local scope." Para plugins de organización se usan managed settings. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Los plugins activados en tu cuenta de claude.ai se sincronizan como `<name>@synced` en sesiones de terminal (v2.1.273+) y en Cowork. Lo que instalas con `/plugin` no sube a claude.ai. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)

**Scopes y archivos**
- User: `enabledPlugins` en `~/.claude/settings.json`. Project: `.claude/settings.json`, que se commitea; cada colaborador ejecuta además `claude plugin install <name>@<marketplace> --scope project` una vez por clon. Local: `.claude/settings.local.json`. Precedencia: local > project > user. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)

**Gestionar, actualizar y quitar**
- Pestaña **Installed** de `/plugin`: Space activa o desactiva, `f` marca como favorito, Enter abre los detalles (**Disable plugin**, **Update now**, **Uninstall**, **Configure options**, **Configure**). Desde la shell: `claude plugin disable|enable|uninstall <plugin>@<mkt> [--scope …]`. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Auto-update: **activado por defecto** en `claude-plugins-official` y en los demás marketplaces oficiales, salvo `knowledge-work-plugins` y `first-party-plugins`. **Desactivado por defecto** en la comunidad, en terceros y en los locales. Se cambia en `/plugin` → **Marketplaces**. Actualizar un plugin: **Update now** o `claude plugin update <plugin>@<marketplace>`. No existe un comando que actualice todo. `claude plugin marketplace update` sin nombre refresca los listados pero no los plugins. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Gestión de marketplaces: `claude plugin marketplace list|update <name>|remove <name>` (o `/plugin marketplace ...`). Quitar un marketplace desinstala todos sus plugins. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Coste de contexto: `claude plugin details <name>` (línea `Always-on`). La pestaña Installed agrupa lo **Not used recently**. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)

**Marketplaces de Anthropic**
- Oficial: repo `anthropics/claude-plugins-official`, nombre `claude-plugins-official`. Se añade solo en la primera sesión interactiva. Incluye plugins de Anthropic y de partners. Comunidad: repo `anthropics/claude-plugins-community`, nombre **`claude-community`**. Hay que añadirlo con `/plugin marketplace add anthropics/claude-plugins-community`. — [Claude Code Docs: Anthropic's marketplaces](https://code.claude.com/docs/en/plugins/anthropic-marketplaces.md)
- Marketplaces temáticos: `anthropics/skills` y `anthropics/knowledge-work-plugins`, que se añaden con `/plugin marketplace add <owner>/<repo>`. — [Claude Code Docs: Anthropic's marketplaces](https://code.claude.com/docs/en/plugins/anthropic-marketplaces.md)
- **Deprecado:** "The `claude-code-plugins` marketplace in `anthropics/claude-code` is deprecated… skip any tutorial step that runs `/plugin marketplace add anthropics/claude-code`." `ralph-wiggum` → `ralph-loop`. — [Claude Code Docs: Anthropic's marketplaces](https://code.claude.com/docs/en/plugins/anthropic-marketplaces.md)
- Catálogo web: [claude.com/marketplace/plugins](https://claude.com/marketplace/plugins), con número de instalaciones y sello **Anthropic verified**. Su botón **Claude Code** copia `claude plugin install <name>@claude-plugins-official`. — [Claude Code Docs](https://code.claude.com/docs/en/plugins/anthropic-marketplaces.md); [Install plugins](https://code.claude.com/docs/en/discover-plugins)
- Marketplace de `anthropics/skills`: nombre `anthropic-agent-skills`. Instalación: `/plugin marketplace add anthropics/skills` → `/plugin install document-skills@anthropic-agent-skills` y `/plugin install example-skills@anthropic-agent-skills`. — [GitHub anthropics/skills](https://github.com/anthropics/skills); [marketplace.json](https://raw.githubusercontent.com/anthropics/skills/main/.claude-plugin/marketplace.json)

**Equipos y empresa**
- Con managed settings, el admin puede poner en lista blanca o negra fuentes de marketplace, forzar plugins activos, desactivar `--plugin-dir`/`--plugin-url`, limitar hooks y bloquear la sincronización desde claude.ai (`syncClaudeAiPlugins`). También puede añadir texto al aviso con `pluginTrustMessage`. — [Claude Code Docs: Plugin security](https://code.claude.com/docs/en/plugins/security.md)
- Marketplaces privados: usan las credenciales git locales (gh auth, Keychain o SSH sin passphrase). `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` fuerza HTTPS. — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- Marketplaces de claude.ai (biblioteca de la organización): `claude plugin marketplace add --claudeai claudeai-organization-library` (v2.1.273+). — [Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)

### Inferences
- Para un creador con uso individual, el flujo mínimo es: (1) `/plugin` → Discover; (2) añadir marketplaces de terceros de confianza (p. ej. `heygen-com/hyperframes`, `canva-sdks/canva-skills`); (3) instalar a scope user.
- En claude.ai/code (web) lo más fiable es commitear las skills en `.claude/skills/` del repo, o usar plugins sincronizados desde la cuenta de claude.ai. En esta misma sesión cloud se ven skills `anthropic-skills:*` sincronizadas, lo que respalda esa vía (observación directa del entorno, no documentada en una URL).

### Gaps
- No verifiqué en esta sesión la sintaxis de `extraKnownMarketplaces`/`enabledPlugins` para preconfigurar marketplaces en `.claude/settings.json` del repo. Está en [Manage plugins for your organization](https://code.claude.com/docs/en/plugins/org.md), que no abrí.

---

## 3. claude.ai (web, desktop, móvil) y Claude Cowork: activar y subir skills, instalar plugins, skills de la organización, planes, relación con conectores

### Takeaway
En nov-2026 todo se gestiona desde **Customize** (claude.ai/customize): **Customize > Skills** para skills, **Customize > Plugins** para plugins y **Customize > Connectors** para conectores MCP. Las skills necesitan **Code execution and file creation** activado en **Settings > Capabilities**. Una skill propia se sube como ZIP que contenga la carpeta. Los plugins se añaden desde **Discover**, **Add > Add marketplace** (repo GitHub `owner/repo`) o **Add > Upload plugin** (`.zip`/`.plugin`), y se sincronizan con Cowork y Claude Code. Cowork existe: agente de escritorio, en research preview, con plugins desde ene-2026.

### Cited Findings
**Skills en claude.ai**
- Activar: en planes individuales Free, Pro y Max, ir a **Settings > Capabilities** y activar **Code execution and file creation**, porque las skills necesitan el entorno de ejecución de código. Subir: **Customize > Skills** → botón **+** → **+ Create skill** → **Upload a skill** → ZIP con la carpeta de la skill. Las skills subidas son privadas de tu cuenta. Los fallos típicos son el tamaño del ZIP o una carpeta cuyo nombre no coincide con `name`. — [Claude Help Center: Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude) (contenido tomado del resumen de búsqueda; el artículo no se abrió completo)
- Conflicto de rutas: un documento antiguo de desarrolladores menciona **Settings > Features** para subir skills. El Help Center actual usa **Customize > Skills**. — [Claude Help Center](https://support.claude.com/en/articles/12512180-use-skills-in-claude); [Claude Docs (agent-skills)](https://docs.claude.com/en/docs/agents-and-tools/agent-skills)
- Empaquetado: `zip -r my-skill.zip my-skill/` desde la carpeta padre. Comprobar con `unzip -l my-skill.zip` que todas las entradas empiezan por `my-skill/`. Después: **Customize > Skills** → activar la skill → probar prompts que deberían dispararla. — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- `skill-creator` está disponible en **Customize > Skills** "listed as from Anthropic". En el chat va prompt a prompt. En Cowork y Claude Code ejecuta además una línea base sin la skill, en paralelo, con tasas de acierto, tiempos y tokens. — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- Compartir: en Team y Enterprise, **Customize > Skills** → **Share** / **Publish to org**. — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- Las skills de ejemplo de Anthropic "are available to paid plans" (según el README del repo). — [GitHub anthropics/skills](https://github.com/anthropics/skills). *Posible conflicto con el Help Center, que habla de activar skills también en Free.*

**Plugins en claude.ai, desktop y Cowork**
- "You add plugins from **Customize > Plugins** in claude.ai or the Claude desktop app." Cada plugin se guarda en la cuenta y queda disponible en Cowork y Claude Code sin reinstalarlo. — [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)
- Tres vías:
  - **Discover**: el directorio aparece en Pro, Max, Ultra, Team y Enterprise.
  - **Add > Add marketplace**: URL `https://github.com/your-org/your-plugins` o `owner/repo`. Valen GitHub, GitHub Enterprise y GitLab/Bitbucket públicos. Para un repo privado hay que instalar la Claude GitHub App.
  - **Add > Upload plugin**: `.zip` o `.plugin` con un único `.claude-plugin/plugin.json`. — [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)
- Dónde funciona cada componente: Skills y Commands en Chat (web, desktop y **móvil**), Cowork y Claude Code. MCP connectors, en los tres. Agents, solo en Cowork y Claude Code. Un conector **Runs in each session** (local) funciona en Claude Code y en Cowork local, no en el chat. — [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)
- Usar en el chat: escribe `/`, filtra por `plugin-name:skill-name` y selecciona. En Cowork: `/plugin-name:command`. — [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)
- Gestionar: interruptor **Disable plugin**, menú → **Remove**, **Check for updates**, **Sync automatically** (marketplaces de github.com). — [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)
- Organización (Team/Enterprise): plugins **Installed by default** (el usuario puede apagarlos) o **Required** ("This plugin is required by your organization"). El Owner decide qué fuentes ven los miembros. — [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)
- Revisión: Anthropic revisa los plugins del directorio (validación automática, escaneo de seguridad en cada versión y revisión humana del listado nuevo). "That review doesn't cover a plugin you add from a marketplace URL or upload yourself." — [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)

**Skills ↔ conectores**
- Añadir un plugin no conecta sus conectores. En la pestaña **Connectors** del plugin cada uno aparece como **Connected**, **Not connected** o **Not added**. Las skills cargan igual, pero no llegan al servicio hasta que el conector está **Connected**. — [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)
- "A skill can tell Claude how to use a connector, but it can't reach the service itself." — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)

**Cowork**
- Cowork está en el desktop app (pestaña "Cowork"). Plugins de Cowork desde finales de ene-2026, cuando Cowork estaba en research preview; Anthropic abrió 11 plugins de inicio — [TechCrunch 30-ene-2026](https://www.techcrunch.com/2026/01/30/anthropic-brings-agentic-plugins-to-cowork/); [Axios](https://www.axios.com/2026/01/30/ai-anthropic-enterprise-claude).
- Ampliación el 24-feb-2026: marketplaces privados para empresas y plugins por departamento. Incluye un plugin de diseño (critique, UX copy, accesibilidad, research) y un "brand voice" hecho con Tribe AI que "analyzes your existing documents, marketing materials, and conversations to distill your brand's voice into clear, enforceable guidelines". — [Claude Blog: Cowork and plugins across the enterprise](https://claude.com/blog/cowork-plugins-across-enterprise)

**Productos creativos relacionados**
- **Claude Design** (Anthropic Labs) se lanzó el 17-abr-2026 en research preview para Pro, Max, Team y Enterprise. Hace prototipos, slides, one-pagers y material de marketing, y puede pasar el trabajo a Claude Code. En Enterprise lo activa el admin. Hay colaboración con Canva para editar en Canva. — [TechCrunch](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/); [MacRumors](https://www.macrumors.com/2026/04/17/anthropic-claude-design/); [Digit](https://www.digit.in/news/general/anthropic-releases-claude-design-to-help-create-visuals-here-is-how-it-works.html)

### Inferences
- Las rutas antiguas ("Settings > Capabilities > Skills", "Settings > Connectors", "Settings > Features") aparecen todavía en tutoriales y en algunas guías de proveedores (p. ej. Higgsfield). En nov-2026 la ruta canónica es **Customize > …**. **Settings > Capabilities** sigue siendo el sitio del interruptor de ejecución de código.
- El móvil sirve para *usar* skills, plugins y conectores ya instalados. No encontré documentación que permita subir skills o plugins desde el móvil.

### Gaps
- No encontré la fecha exacta de lanzamiento general (GA) de Cowork ni si sigue en "research preview" en nov-2026.
- Límites exactos de tamaño de ZIP y de número de skills: la página [Plugin feature support across platforms](https://claude.com/docs/plugins/platform-support.md) los recoge, pero no la abrí.
- Disponibilidad exacta de las skills en el plan Free: hay un posible conflicto (Help Center vs README de anthropics/skills).

---

## 4. Instaladores y registros de terceros: `npx skills` (skills.sh / Vercel), `gh skill` (GitHub CLI), SkillsMP, claudemarketplaces, listas "awesome"

### Takeaway
Hay dos instaladores multi-agente serios: el CLI `skills` de Vercel Labs (`npx skills add owner/repo`, directorio skills.sh, licencia MIT, unas 40,5k estrellas) y `gh skill install` de GitHub CLI (v2.90.0+, desde abr-2026, en preview). SkillsMP, claudemarketplaces.com, claude-plugins.dev y similares son **índices** que rastrean GitHub, no registros revisados. Sirven para descubrir, pero cada skill hay que auditarla.

### Cited Findings
**Vercel `skills` CLI / skills.sh**
- "CLI for the open agent skills ecosystem". Comandos: `npx skills add owner/repo` (Node.js 22.20+), `--skill <name>`, `-a <agent>` (p. ej. `-a claude-code`), `-g` (global; por defecto instala en el proyecto), `npx skills use <source>@<skill>` (usar sin instalar), `find`, `list`, `check`, `update`, `remove` e `init`. Soporta OpenCode, Claude Code, Codex, Cursor y "75 more" (`docs/agents.md`). — [GitHub vercel-labs/skills](https://github.com/vercel-labs/skills)
- `skills-lock.json` (v2) guarda un `computedHash` por skill y el `commit` git, y admite `install --frozen-lockfile`. Hay telemetría anónima, que se desactiva con `DISABLE_TELEMETRY=1` o `DO_NOT_TRACK=1`; esas variables también desactivan las "security-audit requests". Licencia MIT; ~40,5k estrellas. — [GitHub vercel-labs/skills](https://github.com/vercel-labs/skills)
- skills.sh tiene páginas de auditoría de seguridad por skill, como `/security/agent-trust-hub` y `/security/snyk` (visto en las URL de los resultados de búsqueda, p. ej. [skills.sh … /security/agent-trust-hub](https://skills.sh/cityfish91159/maihouses/skill-marketplace/security/agent-trust-hub)). *No pude abrir skills.sh: el DNS está bloqueado en esta sesión.*

**GitHub CLI `gh skill`**
- Anunciado en abr-2026. Requiere GitHub CLI v2.90.0+. Instala skills desde un repo o un directorio local, de forma interactiva o todas a la vez. Flags `--agent claude-code` y `--scope user`. Se puede fijar versión por tag o commit (`documentation-writer@v1.2.0`). Subcomandos search, preview, publish y update. Hosts: Copilot, Claude Code, Cursor, Codex, Gemini CLI. "In preview and subject to change". — [GitHub Changelog 2026-04-16](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/); [gh skill install manual](https://cli.github.com/manual/gh_skill_install)
- Ejemplo real: Remotion documenta `gh skill install remotion-dev/skills`. — [GitHub remotion-dev/skills](https://github.com/remotion-dev/skills)

**SkillsMP y otros índices**
- SkillsMP: índice comunitario independiente (no afiliado a Anthropic ni a OpenAI) de archivos SKILL.md públicos. Se sincroniza con GitHub, filtra repos con menos de 2 estrellas, aplica "basic quality indicators" y pide revisar el código antes de instalar. Una reseña habla de más de 1,6 millones de SKILL.md indexados. — [skillsmp.com](https://skillsmp.com); [SmartScope review](https://smartscope.blog/en/blog/skillsmp-marketplace-guide/)
- Las auditorías de terceros que publica skills.sh sobre skills relacionadas con SkillsMP encontraron riesgo alto (`CREDENTIALS_UNSAFE`), una API key hardcodeada en un script de instalación y riesgo medio por descargas externas. — resumen de búsqueda con enlaces a [skills.sh audit (SkillsMP API)](https://www.skills.sh/kevintsai1202/skillmp-api/skillsmp-api/security/agent-trust-hub) y [skills.sh audit (skill-installer)](https://www.skills.sh/rebyteai/rebyte-skills/skill-installer/security/agent-trust-hub)
- Otros directorios que aparecen al buscar skills de Figma, ElevenLabs, etc.: [claudemarketplaces.com](https://claudemarketplaces.com/skills/figma/mcp-server-guide/figma-use), [claude-plugins.dev](https://claude-plugins.dev/skills/@openai/skills/figma-use), [claudepluginhub.com](https://www.claudepluginhub.com/plugins/elevenlabs-elevenlabs-skills), [tessl.io registry](https://tessl.io/registry/skills/github/jezweb/claude-skills/elevenlabs-agents) y [cursor.com/marketplace](https://cursor.com/marketplace/heygen/hyperframes). Son agregadores. La fuente de verdad sigue siendo el repo del autor.

### Inferences
- Jerarquía de confianza que recomiendo: (1) directorio de claude.ai, `claude-plugins-official` o marketplaces oficiales de Anthropic (revisados); (2) repos oficiales del propio proveedor (adobe/skills, canva-sdks/canva-skills, figma/mcp-server-guide, heygen-com/hyperframes, remotion-dev/skills, elevenlabs/skills, runwayml/skills); (3) `claude-community` (envíos revisados por Anthropic y fijados a SHA); (4) índices como SkillsMP o claudemarketplaces, que solo sirven para descubrir.
- `npx skills` y `gh skill` instalan *skills sueltas*, sin hooks ni MCP. `/plugin install` instala *plugins*, que además pueden traer MCP y hooks. Para un creador, las skills sueltas tienen menos superficie de ataque, aunque pueden traer scripts.

### Gaps
- No pude verificar en skills.sh el ranking actual ni las cifras de instalación de las skills creativas (dominio bloqueado).
- No hay documentación técnica independiente sobre cómo verifica SkillsMP lo que indexa.
- No revisé listas "awesome-claude-skills" concretas (p. ej. de ComposioHQ o travisvn), así que no puedo atestiguar su mantenimiento.

---

## 5. Skills creativas de Anthropic: frontend-design, canvas-design, algorithmic-art, theme-factory, brand-guidelines, slack-gif-creator, web-artifacts-builder, pptx/docx/pdf

### Takeaway
El repo `anthropics/skills` (unas 199k estrellas) contiene 19 skills. Las creativas están en el plugin `example-skills`: algorithmic-art, brand-guidelines, canvas-design, frontend-design, slack-gif-creator, theme-factory y web-artifacts-builder. Las de documentos (docx, pdf, pptx, xlsx) están en `document-skills`. `frontend-design` es la skill "anti-AI slop", que enumera los clichés visuales que hay que evitar. Existe también como plugin independiente en `claude-plugins-official`. En claude.ai varias vienen ya disponibles en **Customize > Skills** como "from Anthropic".

### Cited Findings
- Carpetas de `anthropics/skills/skills`: academy-guide, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx. — [GitHub anthropics/skills/skills](https://github.com/anthropics/skills/tree/main/skills)
- Marketplace `anthropic-agent-skills`:
  - `document-skills`: xlsx, docx, pptx, pdf.
  - `example-skills`: algorithmic-art, brand-guidelines, canvas-design, doc-coauthoring, frontend-design, internal-comms, mcp-builder, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing. Descripción: "…skill creation, MCP building, visual design, algorithmic art… Slack GIFs, and theme styling".
  - También `claude-api`, `academy-guide` y `discernment-nudge`. — [anthropics/skills marketplace.json](https://raw.githubusercontent.com/anthropics/skills/main/.claude-plugin/marketplace.json)
- Repo: ~199k estrellas, 23,3k forks. Licencia Apache 2.0 en muchas skills (incluidas docx, pdf, pptx y xlsx). Aviso: "for demonstration and educational purposes". — [GitHub anthropics/skills](https://github.com/anthropics/skills)
- **frontend-design** (SKILL.md actual): "distinctive, intentional visual design… making choices that don't read as templated defaults". Pide derivar las decisiones del sector, los materiales y el vernáculo del sujeto. Tipografía con 1–2 familias claramente distintas y una escala basada en *The Elements of Typographic Style*. Paleta base de 4–6 colores en hex con nombre. Movimiento escaso: "one orchestrated page-load" mejor que fade-up en cada sección. Lista de "tells" que hay que evitar como default: una palabra resaltada en el titular, labels en MAYÚSCULAS con tracking, numeración 01/02/03, fondo crema con acento terracota (~#D97757), negro con un único acento verde ácido o bermellón, tarjetas redondeadas idénticas con sombra gris uniforme, gradientes, flechas añadidas a los enlaces. Proceso: Plan (tokens + wireframes ASCII) → Review → Build → Critique, quitando un elemento antes de terminar ("like a Chanel accessory"). No nombra fuentes prohibidas como Inter o Roboto. — [SKILL.md frontend-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)
- `frontend-design` es también un plugin de `claude-plugins-official` (autor: Anthropic): "production-grade frontend interfaces with high design quality, avoiding generic AI aesthetics". — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
- `brand-guidelines` es una skill hecha solo de `SKILL.md`, sin scripts. Anthropic la propone como modelo para "a style or formatting rule". El ejemplo de la documentación (Acme) usa colores hex, tipografías, tamaños y reglas de logo. — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- Otros plugins oficiales útiles: `playground` (Anthropic), que crea exploradores HTML de un solo archivo con controles visuales y preview en vivo "for design, data, concept maps", y `theme-examples`, con fondos animados en el desktop app. — [claude-plugins-official marketplace.json (parte 2)](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)

### Inferences
- Descripciones de las demás skills creativas, **según conocimiento previo y sin verificar en esta sesión** (conviene leer cada `SKILL.md` en `https://github.com/anthropics/skills/tree/main/skills/<nombre>`):
  - `canvas-design`: arte visual o pósters estáticos en PNG/PDF a partir de una "filosofía de diseño".
  - `algorithmic-art`: arte generativo con p5.js y aleatoriedad con semilla.
  - `theme-factory`: aplicar o crear temas de color y tipografía a slides, documentos y artefactos.
  - `slack-gif-creator`: GIF animados optimizados para Slack.
  - `web-artifacts-builder`: artefactos HTML complejos con React, Tailwind y shadcn/ui.
  - `pptx`/`docx`/`pdf`: generar y editar documentos de Office y PDF.
- Uso para pósters y campañas: `canvas-design` (póster estático) + `theme-factory` o una skill de marca propia (coherencia) + `frontend-design` (landing o anuncios HTML) + `pptx` (presentación de la campaña). Para vídeo, ninguna skill de Anthropic renderiza vídeo. Hay que combinarlas con Remotion o HyperFrames (sección 6).

### Gaps
- No abrí los `SKILL.md` de canvas-design, algorithmic-art, theme-factory, slack-gif-creator ni web-artifacts-builder, así que sus descripciones exactas de nov-2026 no están verificadas.
- No pude ver la fecha del último commit del repo.

---

## 6. Skills, plugins y MCP de terceros para vídeo, motion, diseño, marca, redes y anuncios: lista curada

### Takeaway
Lo más sólido en nov-2026 son los repos **oficiales de cada proveedor**, muchos de ellos también listados en `claude-plugins-official`:
- **Vídeo:** HeyGen HyperFrames (vídeo desde HTML; ~88k estrellas; Apache-2.0) y Remotion Skills (vídeo en React; ~7,8k estrellas).
- **Diseño:** Figma (plugin oficial + MCP remoto), Canva (8 skills, entre ellas brand-check y resize para redes), Adobe for Creativity (solo desktop o Cowork) y Superdesign.
- **IA generativa:** Runway (API de vídeo, imagen y audio), Higgsfield (MCP oficial + skills) y ElevenLabs (skills oficiales de voz).
- **Media y redes:** Cloudinary (gestión de media) y Postiz (programar posts en más de 28 redes).

### Cited Findings
**VÍDEO / MOTION**
- **HyperFrames (HeyGen)**, [github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes). Editor de vídeo IA de código abierto: HTML/CSS/JS/animación → MP4. Requiere Node.js 22+ y FFmpeg; el render usa Chrome headless. Licencia Apache 2.0, ~88,3k estrellas, ~7.859 commits.
  - Claude Code: `claude plugin marketplace add heygen-com/hyperframes` → `claude plugin install hyperframes@hyperframes`. Alternativas: `npx skills add heygen-com/hyperframes` o `npx hyperframes skills update`.
  - 9 skills: `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`, `/reverse-any-video`, `/style-sampling` y, bajo demanda, `/figma`, `/slideshow`, `/remotion-to-hyperframes`.
  - Conector "HyperFrames by HeyGen" para Claude, ChatGPT y Grok (beta). — [GitHub heygen-com/hyperframes](https://github.com/heygen-com/hyperframes); [Claude connector HyperFrames](https://claude.com/connectors/hyperframes-heygen)
  - También está en `claude-plugins-official` (autor HeyGen): "HTML and renders video, with compositions, GSAP animations, captions, voiceovers, audio-reactive visuals, and website-to-video capture". — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
  - Conflicto de licencia: un fork afirma que hay una licencia tipo Remotion; el repo oficial dice Apache 2.0. Fuente: resultados de búsqueda; hay que revisar el LICENSE del repo oficial. — [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- **Remotion Skills**, [github.com/remotion-dev/skills](https://github.com/remotion-dev/skills). Las mantiene el equipo de Remotion. ~7,8k estrellas, 864 forks.
  - Instalación: `npx remotion skills add` (dentro de un proyecto Remotion), `npx skills add remotion-dev/skills`, `gh skill install remotion-dev/skills` o `npx create-video@latest --skills`.
  - Skills: `/remotion-best-practices`, `/remotion-create`, `/remotion-markup` (animación, layout, tipografía, media, efectos, audio, fuentes, timing), `/remotion-studio`, `/remotion-render`, `/remotion-maps`, `/remotion-captions`, `/remotion-saas`, `/remotion-interactivity`, `/remotion-docs`, `/remotion-license`, `/remotion-upgrade`, `/remotion-multimedia`. — [GitHub remotion-dev/skills](https://github.com/remotion-dev/skills)
- **Runway** (`runway-api`, "Runway Dev"), en `claude-plugins-official`. Fuente `https://github.com/runwayml/skills.git` (path `claude`). Guía para integrar generación de vídeo, imagen y audio con la API y los SDK de Runway, más gestión de modelos y avatares. Autor: Runway. — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
- **Higgsfield** (vídeo, imagen y anuncios con IA):
  - Conector oficial: añadir un custom connector con la URL `https://mcp.higgsfield.ai/mcp` (la guía del proveedor usa la ruta antigua "Settings → Connectors"). Login en el navegador, sin API key. — [Higgsfield Help Center](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent); [Higgsfield MCP](https://higgsfield.ai/mcp)
  - Skills: `npx skills add higgsfield-ai/skills` (generate, soul, product-photoshoot), con `higgsfield auth login` antes. — [Higgsfield Enterprise: MCP, CLI & Plugins](https://higgsfield.ai/enterprise-help-center/platform/integrations); [Higgsfield Skills](https://higgsfield.ai/skills)
  - Hay una vía plugin no oficial (`/plugin marketplace add higgsfield-ai/skills` → `/plugin install higgsfield@higgsfield`) recogida solo en un resumen de terceros. — [resultados de búsqueda sobre INSTALL.md]
  - Cada generación vía MCP gasta créditos. — [Higgsfield Help Center](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent)
  - Hay repos comunitarios (robonuggets/higgsfield-skill, EthanMcDonnell/claude-higgsfield) que no son oficiales. — [robonuggets/higgsfield-skill](https://github.com/robonuggets/higgsfield-skill)
- **ElevenLabs** (voz, TTS, agentes de voz). Repo oficial `elevenlabs/skills`: `npx skills add elevenlabs/skills`. Siguen la especificación Agent Skills. Incluyen TTS, Speech Engine y agents. Un directorio dice que son 18 skills (sin verificar). — [ElevenLabs Blog: Agent Skills](https://elevenlabs.io/blog/elevenlabs-agent-skills); [ElevenLabs docs: agent tooling](https://elevenlabs.io/docs/eleven-api/resources/agent-tooling.md). *No confirmé que haya skills de efectos de sonido o música.*
- **Spotify `save-to-spotify`** (oficial): episodios narrados con TTS, línea de tiempo y portada, guardados en Spotify. — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)

**DISEÑO GRÁFICO / BRANDING**
- **Figma** (oficial):
  - Plugin: `claude plugin install figma@claude-plugins-official`.
  - MCP manual: `claude mcp add --transport http figma https://mcp.figma.com/mcp`.
  - Gemini CLI: `gemini extensions install https://github.com/figma/mcp-server-guide`.
  - Repo: ~2,2k estrellas. Incluye skills de flujo como `video-interaction-mapper` (grabación de UI → storyboard anotado en Figma). — [GitHub figma/mcp-server-guide](https://github.com/figma/mcp-server-guide)
  - Skills: `figma-use`, la base y obligatoria antes de `use_figma`; `figma-generate-design`, para crear diseños con componentes y variables existentes. — [UX Planet: Figma skills for Claude Code](https://uxplanet.org/figma-skills-for-claude-code-bb05a21984fd); [camoa dev guide](https://camoa.github.io/dev-guides/ai-tooling/figma-mcp/claude-code-plugin)
  - Ruta alternativa no oficial: `npx -y skills add figma/mcp-server-guide --skill figma-use --agent claude-code`. — [claudemarketplaces](https://claudemarketplaces.com/skills/figma/mcp-server-guide/figma-use)
- **Canva** (oficial), [github.com/canva-sdks/canva-skills](https://github.com/canva-sdks/canva-skills). Apache 2.0, ~168 estrellas.
  - 8 skills: `canva-resize-for-social-media` (FB, IG, LinkedIn de una vez), `canva-instagram-post` (posts, stories, carruseles), `canva-bulk-create` (una pieza por fila de CSV o JSON con plantilla de marca), `canva-autofill`, `canva-implement-feedback`, `canva-edit-design`, `canva-design-feedback` (crítica de jerarquía, copy y accesibilidad) y `canva-brand-check` (on-brand / off-brand / can't verify frente al brand kit).
  - Claude Code: `/plugin marketplace add canva-sdks/canva-skills` → `/plugin install canva@canva-skills`.
  - MCP: `https://mcp.canva.com/mcp`. — [GitHub canva-sdks/canva-skills](https://github.com/canva-sdks/canva-skills)
  - También aparece en `claude-plugins-official` como `canva` (autor Canva, fuente canva-sdks/canva-skills, `plugins/canva`), así que debería instalarse con `canva@claude-plugins-official`. — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
- **Adobe for Creativity** (oficial, autor Adobe). Edición de imagen y automatización de diseño: quitar fondos, vectorizar, retoque. Está en `claude-plugins-official` (fuente `adobe/skills`, `plugins/creative-cloud/adobe-for-creativity`). — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
  - Importante: el MCP `https://adobe-creativity.adobe.io/mcp` **solo funciona en el desktop app de Claude o en Cowork**. La CLI de Claude Code recibe un 403 y Adobe no piensa darle soporte. El plugin se instala desde el directorio de plugins del desktop app. Para otros plugins de Adobe: `/plugin marketplace add adobe/skills` → `/plugin install <plugin>@adobe-skills`. Firefly (`run-workflow`) requiere una cuenta enterprise con derechos de Firefly Services. Repo: ~336 estrellas, Apache-2.0. — [GitHub adobe/skills](https://github.com/adobe/skills)
- **Superdesign** (`superdesign`), en `claude-plugins-official`: diseña o rediseña UI y "marketing graphics on an infinite canvas, with branchable drafts". Autor: Superdesign dev, Inc. Fuente `superdesigndev/superdesign-skill`. — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
- **Miro** (oficial, `miroapp/miro-ai`): moodboards y diagramas en pizarras. — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)

**MEDIA, REDES Y ANUNCIOS**
- **Cloudinary** (`cloudinary-devs/cloudinary-plugin`): gestionar assets, aplicar transformaciones y optimizar media. — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
- **Postiz** (`gitroomhq/postiz-agent`): CLI de redes para programar posts, subir media y ver analítica en más de 28 plataformas. — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
- **Spotify Ads API**, **ActiveCampaign** y **Windsor.ai** (datos de más de 325 fuentes de anuncios y marketing) también están en `claude-plugins-official`. — [claude-plugins-official marketplace.json](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json)
- Plugins de marketing y diseño de Anthropic para Cowork (knowledge-work): plugin de diseño (critique, UX copy, accesibilidad) y "brand voice" (con Tribe AI). — [Claude Blog: Cowork plugins across enterprise](https://claude.com/blog/cowork-plugins-across-enterprise)

### Inferences
- **Observación directa del entorno de esta sesión (sin URL):** el plugin Figma instalado aquí expone las skills `figma-use`, `figma-use-motion`, `figma-implement-motion`, `figma-generate-design`, `figma-generate-library`, `figma-shaders`, `figma-3d-transforms`, `figma-use-slides`, `figma-generative-plugins`, entre otras. El plugin `adobe-for-creativity` expone `adobe-create-social-variations`, `adobe-resize-photos-and-videos`, `adobe-edit-quick-cut`, `adobe-retouch-portraits`, `adobe-design-from-template`, `adobe-batch-edit-photos` y `adobe-fonts`. Esto confirma que existen `figma-use-motion` y las skills de Adobe que no se pudieron verificar en GitHub. En el directorio de conectores de claude.ai también hay conectores de Descript, Gamma, Higgsfield, Metricool, Motion y Lucid (sus herramientas aparecen en esta sesión).
- Recomendación de "stack" para un creador:
  - Vídeo programático: HyperFrames (si se prefiere HTML/GSAP; muy activo) o Remotion (si se prefiere React; ecosistema maduro, pero con licencia comercial de Remotion para empresas grandes; hay que confirmarlo en `/remotion-license`).
  - Clips generativos: Higgsfield o Runway.
  - Voz: ElevenLabs.
  - Piezas estáticas y redes: Canva (brand-check + resize + bulk-create) o Adobe (social variations, resize), además de Figma para sistemas de diseño.
  - Programación: Postiz o Metricool.
- Mantenimiento y confianza (orientativo): las mejores señales son estar en `claude-plugins-official` con el autor = proveedor (Adobe, Canva, HeyGen, Runway) y tener muchas estrellas. Repos comunitarios como robonuggets/higgsfield-skill o los envoltorios de ElevenLabs de jezweb o sanjay3290 merecen una auditoría completa antes de usarlos.

### Gaps
- No pude confirmar las fechas del último commit (las páginas de GitHub no las mostraban en la captura).
- No verifiqué "figma-use-motion" en documentación pública de Figma, solo en el entorno instalado.
- Licencia exacta de HyperFrames: el repo dice Apache 2.0 y un fork dice otra cosa.
- No encontré skills oficiales de DaVinci Resolve, Premiere, After Effects, Blender ni CapCut en esta pasada. Tampoco verifiqué MCP comunitarios de esas herramientas.
- "Claude Motion": hay herramientas de terceros (p. ej. el conector de Descript, con la herramienta `import-claude-motion-from-url`) que lo mencionan, pero no encontré ningún anuncio oficial de Anthropic. No se puede afirmar que exista como producto.

---

## 7. Cómo escribir una skill propia que codifique un estilo visual o brand book coherente para pósters, posts y vídeos

### Takeaway
Anthropic recomienda partir de una frase que describa la tarea y lo que sería un buen resultado (eso será la `description`). El `SKILL.md` debe ser corto (menos de 500 líneas), con los detalles en `references/`, las plantillas y logos en `assets/` y los scripts de comprobación (p. ej. contraste) en `scripts/`. Las skills deben ser enfocadas (mejor varias pequeñas que una enorme), con ejemplos de entrada y salida. Para medir si mejoran el resultado frente a no usarlas se usa `skill-creator`. El ejemplo oficial de `brand-guidelines` (Acme) es la plantilla directa.

### Cited Findings
- Ejemplo oficial completo de skill de marca: colores hex (Primary #FF6B35, etc.), tipografías y tamaños (H1 32pt…), reglas de logo (versión a color sobre fondos claros, blanca sobre oscuros, margen de 0,5"), cuándo aplicarla y `assets/` con logos y fuentes. Su `SKILL.md` remite a `references/voice-and-tone.md`, `assets/slide-template.md` y `python3 ${CLAUDE_SKILL_DIR}/scripts/check_contrast.py` (comprobación WCAG 4.5:1). — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- Buenas prácticas oficiales: "Keep it focused", "Write a specific description" (con las palabras que usaría la petición), "Start with instructions" (añadir scripts solo si hacen falta), "Show the output you expect", "Test after each change". Más detalle en [agentskills.io best practices](https://agentskills.io/skill-creation/best-practices) y [optimizing descriptions](https://agentskills.io/skill-creation/optimizing-descriptions). — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- Cuándo **no** usar una skill: tareas puntuales, datos vivos (para eso está un conector) o instrucciones que deben aplicarse en todas las conversaciones (para eso están las preferencias o las instrucciones de proyecto). — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md)
- Engineering blog: empezar evaluando dónde falla el agente; dividir en archivos cuando `SKILL.md` crezca; vigilar `name` y `description`; iterar con Claude para que capture aciertos y errores en la skill. — [Anthropic Engineering](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- `skill-creator` ejecuta tu skill con prompts de prueba y, en Cowork o Claude Code, la compara con una línea base sin skill. — [Claude Docs: Create custom skills](https://claude.com/docs/skills/how-to.md); [anthropics/skills skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
- La filosofía de `frontend-design` es un modelo para la sección de "anti-clichés" de una skill de marca: paleta de 4–6 colores con nombre, 1–2 familias tipográficas, movimiento orquestado y no disperso, y una lista explícita de "tells" que hay que evitar. — [SKILL.md frontend-design](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)
- Hay herramientas externas que complementan una skill de marca: `canva-brand-check` contrasta las piezas con el brand kit de Canva. El plugin "brand voice" de Cowork destila la voz de marca a partir de documentos existentes. HyperFrames incluye `/style-sampling`. — [canva-sdks/canva-skills](https://github.com/canva-sdks/canva-skills); [Claude Blog](https://claude.com/blog/cowork-plugins-across-enterprise); [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)

### Inferences
- Estructura que propongo (deducida del ejemplo oficial) para la skill de un creador:
  ```
  mi-marca/
  ├── SKILL.md                 # name: mi-marca; description: "Aplica el estilo visual de <Nombre> a pósters, posts (IG/TikTok/LinkedIn), miniaturas, anuncios y vídeos (Remotion/HyperFrames)…"
  ├── references/
  │   ├── paleta-y-tipografia.md   # hex con nombre, pares permitidos, escalas
  │   ├── composicion-poster.md    # retícula, jerarquía, márgenes, formatos (A3, 4:5, 9:16, 16:9)
  │   ├── redes-sociales.md        # tamaños por red, safe zones, reglas de texto
  │   ├── motion-y-video.md        # curvas de easing, duraciones, transiciones, lower thirds, subtítulos
  │   ├── voz-y-copy.md
  │   └── anti-clichés.md          # lo que NUNCA hacer (estilo frontend-design)
  ├── assets/
  │   ├── logos/ (SVG claro/oscuro)
  │   ├── fuentes/ (con licencia)
  │   ├── plantillas/ (HTML de póster, composición Remotion/HyperFrames base, tokens.json/CSS variables)
  │   └── ejemplos-aprobados/ (PNG de referencia)
  └── scripts/
      └── check_contrast.py
  ```
- Para que funcione tanto en claude.ai como en Claude Code, conviene limitar el frontmatter a `name` y `description` (y como mucho `license`, `metadata`). También es mejor separar en skills enfocadas (p. ej. `mi-marca-poster`, `mi-marca-video`) que se refieran a un `references/` común, o empaquetarlas como plugin para instalarlas juntas.
- Un archivo de *design tokens* (JSON o CSS variables) en `assets/` sirve de puente entre HTML (pósters, anuncios), Remotion/HyperFrames (vídeo) y Figma o Canva. Mantiene la coherencia entre formatos.

### Gaps
- No encontré un artículo oficial de Anthropic dedicado a "brand skills" para vídeo. Las recomendaciones de motion son una inferencia.
- No abrí las páginas de best practices de agentskills.io.

---

## 8. Seguridad: riesgos de instalar skills, plugins o MCP no fiables, cómo revisarlos e incidentes de 2026

### Takeaway
Un plugin de Claude Code "can execute arbitrary code on your machine with your user privileges" (hooks, monitors, MCP stdio, `bin/`). Una skill puede llevar scripts e instrucciones de prompt injection. En 2026 hubo campañas reales de skills maliciosas en ClawHub (el marketplace de OpenClaw): reverse shells, stagers y robo de credenciales. Snyk encontró 76 skills con payloads maliciosos en una auditoría de 3.984. También hubo CVE en Claude Code relacionadas con configuración de proyecto o hooks (CVE-2025-59536, CVE-2026-21852, CVE-2026-25725), ya parcheadas. La defensa es usar fuentes oficiales, leer `SKILL.md`, `scripts/`, `hooks/hooks.json`, `.mcp.json` y `bin/` antes de instalar, y desactivar el auto-update en marketplaces de terceros.

### Cited Findings
**Qué puede hacer un plugin o una skill**
- Hooks (shell en eventos del ciclo de vida), monitors (comandos en segundo plano), mods (JavaScript dentro de Claude Code), servidores MCP y LSP (procesos locales), `bin/` en el PATH, y skills o agentes como instrucciones. Los hooks, monitors y servidores se ejecutan **fuera del sandbox** con todos tus permisos. El auto-update puede cambiar en disco los archivos que ya habías revisado. — [Claude Code Docs: Plugin security and trust](https://code.claude.com/docs/en/plugins/security.md)
- Nombres de marketplace oficiales reservados (solo se aceptan si la fuente está en `github.com/anthropics/`): `claude-plugins-official`, `claude-code-marketplace`, `claude-code-plugins`, `anthropic-marketplace`, `anthropic-plugins`, `agent-skills`, `anthropic-agent-skills`, `life-sciences`, `knowledge-work-plugins`, `claude-for-legal`, `claude-for-financial-services`, `financial-services-plugins`, `first-party-plugins`, `claude-tag-plugins`. Comunidad: `claude-community`, `claude-plugins-community`, `healthcare`. Si alguien usa estos nombres desde otra fuente, Claude Code lo rechaza con "Marketplace is registered from an untrusted source". `claude-community` fija casi todos sus plugins a un commit SHA. — [Claude Code Docs: Plugin security](https://code.claude.com/docs/en/plugins/security.md)
- Checklist oficial:
  1. `claude plugin marketplace list` para ver la fuente.
  2. Panel `/plugin` → **Will install**.
  3. **Open homepage** / **View on GitHub** y leer `hooks/hooks.json`, `.mcp.json` y `bin/`.
  4. Clonar y ejecutar `claude --plugin-dir <dir> plugin details <name>` (inventario de componentes).
  - Para quitarlo: `claude plugin uninstall <plugin> --scope …`. La caché queda 14 días en `~/.claude/plugins/cache/`. — [Claude Code Docs: Plugin security](https://code.claude.com/docs/en/plugins/security.md)
- Engineering blog de Anthropic: "We recommend installing skills only from trusted sources". Auditar los archivos, las dependencias, las imágenes y los scripts, y vigilar las instrucciones que conectan con redes externas no fiables, porque una skill puede exfiltrar datos. — [Anthropic Engineering](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- MCP en Claude Code: "Verify each server before connecting". Los servidores que traen contenido externo exponen a prompt injection. Los servidores de `.mcp.json` del proyecto piden aprobación en modo interactivo, pero **no** en `-p` ni en el Agent SDK. Para bloquear uno: `disabledMcpjsonServers`. Los stdio ejecutan procesos locales. — [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)
- Conectores en claude.ai: "Custom connectors allow connections to unverified services". Conectar solo a organizaciones de confianza, revisar los scopes de OAuth, usar **Always allow** solo con servidores de confianza y poner en **Blocked** las herramientas que no se necesiten. Los servidores maliciosos se reportan en el Bug Bounty de Anthropic. — [Claude Docs: Add unlisted connector](https://claude.com/docs/connectors/custom/add-unlisted.md)
- La hoja de ruta del estándar Agent Skills (oct-2026) incluye "security guidance for people who write and install skills". Todavía no está publicada. — [Anthropic news](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation)

**Incidentes y estudios de 2026 (fuentes de seguridad; los detalles vienen de resúmenes de búsqueda porque snyk.io estaba bloqueado)**
- Campaña "clawdhub" en ClawHub (OpenClaw), 27–29 ene-2026: skills que soltaban reverse shells. Se calcula que miles de usuarios las instalaron antes de que entraran los controles de auto-ocultado. — [Snyk: clawdhub malicious campaign](https://snyk.io/articles/clawdhub-malicious-campaign-ai-agent-skills/)
- Snyk "ToxicSkills": en una auditoría de 3.984 skills, 76 tenían payloads maliciosos en las instrucciones Markdown. — [Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)
- Snyk: skill maliciosa con temática de Google que usaba un "prerequisite" falso y un script stager (ingeniería social). Se publicaba con solo un SKILL.md y una cuenta de GitHub de una semana. — [Snyk: clawhub malicious google skill](https://snyk.io/blog/clawhub-malicious-google-skill-openclaw-malware)
- Palo Alto Unit 42 (análisis de feb a may-2026): skills maliciosas persistentes y evasivas en ClawHub; encontró 5 sin bloquear, que se retiraron después. "Installation results in complete control over the agent's identity". — [Unit 42: OpenClaw AI supply chain](https://unit42.paloaltonetworks.com/openclaw-ai-supply-chain/)
- Informe técnico de arXiv sobre amenazas del ecosistema de skills (ClawHub y skills.sh) — [arXiv 2605.28588](https://arxiv.org/html/2605.28588). Otro paper describe el secuestro de skills alojadas en repos de GitHub abandonados y la fragilidad de depender de URL de GitHub que pueden cambiar — [arXiv 2603.16572](https://arxiv.org/html/2603.16572v1).
- Una cifra de "1.184 skills maliciosas" viene de un solo investigador y no está verificada. — [Cybersecurity News](https://cybersecuritynews.com/openclaws-top-skill-malware/)
- Medidas de ClawHub: escaneo con VirusTotal y ClawScan, y antigüedad mínima de cuenta de 1 semana para publicar. — resumen de búsqueda sobre [Snyk](https://snyk.io/articles/clawdhub-malicious-campaign-ai-agent-skills/)
- CVE de Claude Code (configuración de proyecto, hooks y sandbox):
  - CVE-2025-59536 (Check Point, CVSS 8,7): un `.claude/settings.json` del repo ejecutaba comandos antes del diálogo de confianza. — [Check Point Research](https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/); [The Hacker News](https://thehackernews.com/2026/02/claude-code-flaws-allow-remote-code.html)
  - CVE-2026-21852: exfiltración de la API key cambiando la base URL; corregido en 2.0.65. — [The Hacker News](https://thehackernews.com/2026/02/claude-code-flaws-allow-remote-code.html)
  - CVE-2026-25725: escape del sandbox bubblewrap instalando hooks; divulgado el 6-feb-2026 y corregido en 2.1.2. — [Wiz](https://www.wiz.io/vulnerability-database/cve/cve-2026-25725); [Tenable](https://www.tenable.com/cve/CVE-2026-25725)

### Inferences
- Los incidentes documentados de malware en skills se concentran en **ClawHub/OpenClaw** y en índices abiertos, no en `claude-plugins-official` ni en el directorio de claude.ai, que tienen revisión. No encontré ningún incidente público de un plugin malicioso en los marketplaces oficiales de Anthropic.
- Checklist práctico para un creador:
  1. Preferir el directorio de claude.ai o `claude-plugins-official`, o el repo oficial del proveedor.
  2. Leer `SKILL.md` buscando `curl | bash`, base64, "prerequisites" que piden ejecutar binarios, URL externas o peticiones de tokens.
  3. Revisar `scripts/`, `hooks/hooks.json`, `.mcp.json` y `bin/`.
  4. Fijar versiones (`owner/repo#tag`, `skills-lock.json`, `gh skill … @v1.2.0`).
  5. Mantener el auto-update apagado en marketplaces de terceros.
  6. No dar API keys a skills; usar conectores con OAuth.
  7. Bloquear en el conector las herramientas que publican o borran contenido (p. ej. publicar en redes) hasta confiar en ellas.
  8. Mantener Claude Code actualizado.

### Gaps
- No pude leer completos los informes de Snyk ni de Unit 42 (dominio bloqueado o sin abrir). Las cifras salen de fragmentos.
- No verifiqué los avisos de seguridad oficiales de Anthropic (GHSA) de abril a junio de 2026.
- No encontré incidentes públicos concretos de plugins maliciosos para Claude Code en marketplaces de terceros con nombre y fecha.

---

## 9. Conectar servidores MCP propios: claude.ai custom connectors (URL remota), Claude Desktop (`claude_desktop_config.json` / `.mcpb`), Claude Code (`claude mcp add`, `.mcp.json`); local stdio frente a remoto

### Takeaway
- **claude.ai, desktop, móvil y Cowork:** **Customize > Connectors** → **Add** → **Add custom connector** → URL HTTPS del servidor MCP remoto → autenticación (OAuth "Detected", o **No sign-in** con **Request headers**). En Free se permite 1 conector. En Team y Enterprise lo añade el Owner desde **Organization settings > Connectors**.
- **Desktop (servidores locales):** **Settings > Extensions** arrastrando un `.mcpb`, o el método clásico `claude_desktop_config.json` (**Settings > Developer > Edit Config**).
- **Claude Code:** `claude mcp add --transport http <name> <url>` (remoto) o `claude mcp add <name> -- <command>` (stdio). Scopes local, project (`.mcp.json`) y user. SSE está deprecado.

### Cited Findings
**claude.ai / Desktop / Cowork: conector remoto por URL**
- Disponible en Free, Pro, Max, Ultra, Team y Enterprise. En Free, 1 conector personalizado. — [Claude Docs: Add unlisted connector](https://claude.com/docs/connectors/custom/add-unlisted.md); [Help Center 11175166](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- Pasos en Free, Pro, Max y Ultra:
  1. [Connectors directory](https://claude.ai/customize/connectors).
  2. **Add** → **Add custom connector**.
  3. Nombre + URL → **Continue**.
  4. Autenticación: dejar lo marcado como **Detected**.
  5. **Add**.
  6. **Connect** e iniciar sesión.
  - En Team y Enterprise: **Organization settings > Connectors** → **Add** → **Custom** → **Web**, y cada miembro pulsa **Connect** en sus conectores. — [Claude Docs: Add unlisted connector](https://claude.com/docs/connectors/custom/add-unlisted.md)
- Autenticación:
  - **Sign in now** / **Sign in when needed** / **No sign-in** (para API key, que va en **Request headers**; está en beta y no la tienen todas las organizaciones; máximo 4 headers; el nombre de cada header lo aprueba Anthropic; el valor se escribe completo, p. ej. `Bearer your-token`).
  - OAuth client: **Use Claude's published identity** (recomendado), **Register automatically** (DCR) o **Use your own OAuth client**. Callback: `https://claude.ai/api/mcp/auth_callback`.
  - Una URL que termina en `/sse` selecciona el transporte SSE antiguo.
  - La autenticación no se puede editar: para cambiarla hay que borrar el conector y volver a añadirlo. — [Claude Docs: Add unlisted connector](https://claude.com/docs/connectors/custom/add-unlisted.md)
- No se puede conectar a una URL con otro puerto. — [Help Center 11175166](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) (resumen de búsqueda)
- En cada chat: botón **+** → **Connectors** o **Plugins** → activar o desactivar por conversación. — [Claude Docs: Add unlisted connector](https://claude.com/docs/connectors/custom/add-unlisted.md)
- URL de MCP remotos creativos verificadas: Figma `https://mcp.figma.com/mcp` ([figma/mcp-server-guide](https://github.com/figma/mcp-server-guide)); Canva `https://mcp.canva.com/mcp` ([canva-sdks/canva-skills](https://github.com/canva-sdks/canva-skills)); Higgsfield `https://mcp.higgsfield.ai/mcp` ([Higgsfield Help](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent)); Adobe `https://adobe-creativity.adobe.io/mcp`, solo desktop o Cowork ([adobe/skills](https://github.com/adobe/skills)).

**Claude Desktop: servidores locales**
- Desktop extension (`.mcpb`, MCP Bundles): **Settings > Extensions** → arrastrar el `.mcpb` → **Install**. Corre en local con los permisos del usuario. Las organizaciones pueden desactivar o limitar las extensiones. — [Claude Docs: Add unlisted connector](https://claude.com/docs/connectors/custom/add-unlisted.md); [MCPB](https://github.com/modelcontextprotocol/mcpb)
- Método clásico con `claude_desktop_config.json`: en macOS `~/Library/Application Support/Claude/claude_desktop_config.json` y en Windows `%APPDATA%\Claude\claude_desktop_config.json`. Se abre con **Settings > Developer > Edit Config** (lo crea si no existe). Hay que reiniciar Claude Desktop por completo después de cambiarlo. Se recomienda usar rutas absolutas de `npx` o `docker`. — [Playwright MCP: Claude Desktop](https://playwright.dev/mcp/clients/claude-desktop); [DEV: Claude Desktop MCP 2026 guide](https://dev.to/dennis-ddev/how-to-set-up-claude-desktop-with-mcp-servers-2026-guide-2fc7). *La documentación oficial (modelcontextprotocol.io/docs/develop/connect-local-servers) no se pudo abrir.*
- Posible problema en Windows (MSIX): **Edit Config** abre el archivo de `%APPDATA%`, pero la app podría leer otra ruta. Es un caso reportado en feb-2026 por un solo blog. — resumen de búsqueda ([mcpplaygroundonline](https://mcpplaygroundonline.com/blog/how-to-setup-mcp-claude-desktop))

**Claude Code**
- Remoto: `claude mcp add --transport http <name> <url>`. Ejemplo: `claude mcp add --transport http notion https://mcp.notion.com/mcp`. Con token: `--header "Authorization: Bearer your-token"`. — [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)
- **SSE deprecado:** `--transport sse` sigue existiendo, pero desde v2.1.265 `--transport http` cae a SSE automáticamente si el servidor solo ofrece SSE. — [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)
- Local stdio: `claude mcp add [options] <name> -- <command> [args...]`. Ejemplo: `claude mcp add --env AIRTABLE_API_KEY=YOUR_KEY --transport stdio airtable -- npx -y airtable-mcp-server`. WebSocket solo con `add-json` (`"type":"ws"`). — [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)
- Scopes: `--scope local` (por defecto; `~/.claude.json` por proyecto), `--scope project` (`.mcp.json` en la raíz del proyecto, que se commitea) y `--scope user` (`~/.claude.json`). Formato de `.mcp.json`: `{"mcpServers":{"name":{"type":"http","url":"https://…"}}}`, con expansión `${VAR}` y `${VAR:-default}`. — [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)
- `claude mcp add-json <name> '<json>'` sirve para copiar entradas de otros clientes. Una entrada con `url` pero sin `type` se rechaza. — [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)
- Gestión: `claude mcp list|get|remove|login|logout|reset-project-choices`. Dentro de una sesión, `/mcp` hace el OAuth. Para OAuth sin DCR: `--client-id … --client-secret --callback-port 8080`. Variables: `MCP_TIMEOUT` y `MCP_TOOL_TIMEOUT`. — [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)
- Claude Code no lee `claude_desktop_config.json`. Usa su propia configuración. — [DEV guide](https://dev.to/dennis-ddev/how-to-set-up-claude-desktop-with-mcp-servers-2026-guide-2fc7) (fuente secundaria)

**Local frente a remoto**
- URL remota: para servicios en internet y API públicas; funciona en todos los planes y superficies, móvil incluido. Desktop extension o stdio: para archivos y herramientas locales, datos sensibles o trabajo sin conexión; solo en desktop app, Claude Code y Cowork local. — [Claude Docs: Add unlisted connector](https://claude.com/docs/connectors/custom/add-unlisted.md); [Claude Docs: Plugins overview](https://claude.com/docs/plugins/overview)

### Inferences
- Para un creador: los servicios SaaS (Figma, Canva, Higgsfield, HyperFrames hosted, Descript, Gamma) se conectan mejor como conectores remotos en **Customize > Connectors**. Así funcionan también en el móvil y en Cowork, y se sincronizan con Claude Code mediante plugins. Las herramientas que tocan archivos locales de vídeo (FFmpeg, render de Remotion o HyperFrames) van mejor en Claude Code o en Cowork local.
- El plan Free (1 conector) limita a quien quiera combinar Figma, Canva, Higgsfield y otros servicios.

### Gaps
- No confirmé si `claude mcp add-from-claude-desktop` sigue existiendo en nov-2026. La parte de la página de MCP que lo trataría quedó truncada.
- No pude abrir la documentación oficial de modelcontextprotocol.io sobre los servidores locales en Claude Desktop (dominio bloqueado). Las rutas de `claude_desktop_config.json` vienen de fuentes secundarias coincidentes.
