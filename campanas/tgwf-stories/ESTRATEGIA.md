# TGWF · Mini campaña «Tenemos que ir»

**En una frase:** la campaña coge la frase que todos los grupos dicen y nunca cumplen («tenemos que ir») y enseña que con TGWF por fin se cumple, porque lo que pisáis juntos se tacha.

**En detalle:**
- **Qué hay hecho:**
  - un vídeo de 28,7 s para stories, también troceado en tres;
  - un carrusel de 5 piezas, un post cuadrado y dos stories estáticas para stickers;
  - dos banners.
- **Cómo está hecho:** todo con código (Remotion) y con capturas reales del modo demo de la app.
- **Qué falta y cómo publicarlo:** este documento explica las decisiones, cómo publicarlo, cómo medirlo y qué queda por confirmar.

---

## 1. Lo que vende la campaña (sale de la app, no inventado)

Esto es lo que la app hace hoy, sacado del repositorio `javdomvid/tgwf-app` y de su modo demo (`javdomvid.com/tgwfapp/?demo`):

| Función real | Cómo lo dice la app | Cómo lo usa la campaña |
|---|---|---|
| Un **Tour** es una lista de sitios pendientes que compartes con tus amigos | «Bares, restaurantes, salas, tiendas» | Paso 1 del vídeo y del carrusel |
| Cada **quedada** se apunta: qué día fue y quién vino | «Nueva quedada: ¿Cuándo? ¿Quién vino? ¿Qué tachamos?» | Paso 2, con la captura real |
| Lo pisado **se tacha**, y la lista, el mapa y el historial se actualizan para todos | «Quedáis, vais, tacháis» | Paso 3, el momento más satisfactorio del vídeo |
| **Sitio al azar** con «Otro» o «Tachar» | Botón de dado en el Tour | «Y si no os ponéis de acuerdo: que decida la app» |
| **Panel** con tachados, quedadas y **días sin quedar** | «Hola, Lola. Te quedan 7 sitios por tachar.» | El empujón: «Sí: cuenta los días que lleváis sin quedar» |
| **Tarjeta para compartir** en Instagram o WhatsApp | «Comparte tu resumen» | Contenido de seguimiento (UGC), ver el calendario |
| Acceso **por invitación**: tu DNI es tu Instagram | «¿No sales? Escríbele a @javdomvid» | La llamada a la acción: DM con la palabra TOUR |

Todos los datos que salen en las piezas son los inventados del modo demo (Lola, Nico, Vera, Álex y los sitios de Barcelona). No aparece ningún dato real de nadie.

## 2. La idea de marketing

**Verdad del público.** En cada grupo de amigos hay una lista invisible de sitios de «tenemos que ir»: un enlace en el chat, un guardado de Instagram, un «apuntadísimo». Casi nunca se convierte en una fecha. Esa distancia entre la intención y el plan es el problema que TGWF resuelve.

**Posicionamiento.**
- **Para quién:** grupos de amigos que acumulan sitios pendientes y no quedan.
- **Qué es TGWF:** la lista compartida que convierte «tenemos que ir» en «fuimos».
- **Por qué funciona:** cada quedada tacha sitios para todos y el panel os recuerda cuánto lleváis sin veros.
- **Frente a qué:** una lista de Google Maps o los guardados de Instagram son de una sola persona y no empujan a nada.

**Jerarquía del mensaje** (en este orden, nunca todo a la vez):
1. **Gancho:** «Tenemos que ir.» → «¿al final fuimos?». Reconocimiento inmediato y con humor.
2. **Problema:** «La lista crece. Los planes, no.»
3. **Producto:** TGWF, «listas de sitios con tu gente».
4. **Cómo funciona,** en tres pasos y con la app real: lista, quedada, tachado.
5. **Empujón:** «cuenta los días que lleváis sin quedar».
6. **Promesa y acción:** «Quedáis. Vais. Tacháis.» + demo + DM «TOUR».

**Tono:** el del grupo de WhatsApp. Habla de vosotros (quedáis, vais, tacháis), con frases cortas y humor de reconocimiento, sin vender. La coletilla «…or somebody else» abre la puerta a usarla en pareja o con quien sea, sin explicarlo.

## 3. Decisiones de diseño, y por qué

**En una frase:** se parece a la app a propósito, pero con decisiones que lo alejan del aspecto típico de diseño hecho con IA.

**Detalle:**
- **Mismo sistema que la app:** fondo `#F3EFE6`, tinta `#15130F`, rojo `#F2380F`, Bricolage Grotesque para titulares, DM Mono para etiquetas e Inter para texto. Están sacados de `app.css`, así que quien abra la app después de ver la story reconoce lo mismo.
- **El tachón ondulado es la firma.** Es el gesto del producto (tachar) y ya está en el logo y en `og.png`. Aparece en el logo, en el paso 3 y en el post de la lista. Ninguna otra marca lo tiene.
- **El riesgo de parecer «hecho con IA».** El crema con un acento cálido está cerca de un cliché que la propia Anthropic nombra en su skill frontend-design. Se compensa con:
  - grotesca enorme y apretada (nunca serif);
  - cortes bruscos de crema a negro;
  - capturas reales en vez de ilustraciones genéricas;
  - el trazo dibujado;
  - copys en el idioma del grupo de amigos;
  - nada de degradados, emojis ni tarjetas flotantes idénticas.
- **Pensado para stories.** Todo se entiende sin sonido. Los titulares van de 110 a 210 px y el texto de lectura nunca baja de 40 px. Se respeta la zona segura: arriba quedan 260 px libres (barra de perfil) y abajo, 340 px (responder y enlace). El primer fotograma ya cuenta la historia, porque es la miniatura que se ve al pasar.
- **Ritmo.**
  - Un mensaje por pantalla, de 2,5 a 3,5 s cada escena.
  - El negro marca los momentos de tensión: el problema, el dado y el cierre.
  - Los tres pasos entran deslizando, como quien pasa pantallas en la app.

## 4. El vídeo, escena a escena

| Tiempo | Escena | Objetivo |
|---|---|---|
| 0,0–3,5 s | Chat del grupo: «TENEMOS QUE IR», «¿este finde?», «uf, este no puedo», sello «3 meses después» y «¿al final fuimos?» | Gancho y reconocimiento |
| 3,5–7,0 s | «22 sitios pendientes» que se apilan; «La lista crece. Los planes, no.» | Nombrar el problema |
| 7,0–9,8 s | TGWF y el tachón que lo cruza; «To go with friends… …or somebody else.» | Marca |
| 9,8–13,0 s | Paso 1 con la captura del Tour | Cómo funciona |
| 13,0–16,0 s | Paso 2 con la captura de «Nueva quedada» | Cómo funciona |
| 16,0–19,4 s | Paso 3: se tachan tres sitios y el contador sube de 8/18 a 11/18 | El momento satisfactorio |
| 19,4–21,7 s | Sitio al azar: la ruleta se para en «Clip» con «Otro» y «Tachar» | Función diferencial |
| 21,7–24,7 s | Panel: «Hola, Lola. Te quedan 7 sitios por tachar.» y «3 días sin quedar» | Empujón |
| 24,7–28,7 s | «Quedáis. Vais. Tacháis.», demo y DM «TOUR» | Acción |

**Archivos** (en `salida/`):
- `tgwf-stories.mp4`: vídeo completo, 1080×1920, 30 fps, sin audio.
- `story-1-gancho.mp4` (9,8 s), `story-2-como-funciona.mp4` (11,9 s) y `story-3-cierre.mp4` (7 s): el mismo vídeo cortado por escenas. Se suben como tres stories seguidas.

**¿Una story larga o tres cortas?** Voto por las **tres cortas**.
- **Por qué:** cada toque pasa a la siguiente idea, la gente no se salta el final y en la tercera puedes poner el sticker de enlace justo donde está la llamada a la acción.
- **Tiene vuelta atrás:** el vídeo completo sirve tal cual como story única o como Reel.

**Música.** Va sin audio a propósito.
- **Qué hacer:** añade una canción con el sticker de música de Instagram al subir cada story.
- **Por qué:** así está licenciada, y el audio de moda ayuda al alcance.
- **Si es un Reel:** el mismo vídeo funciona con un audio en tendencia.

## 5. Piezas extra

| Pieza | Archivo | Uso |
|---|---|---|
| Carrusel de 5 (4:5, 1080×1350) | `estaticos/Carrusel-1…5.png` | Post principal del feed: pregunta, problema, cómo funciona, captura y cierre |
| Post de la lista (1:1) | `estaticos/Post-lista.png` | Segundo post o story: tres sitios tachados y «¿Este finde?» |
| Story con encuesta | `estaticos/Story-encuesta.png` | Día anterior al lanzamiento; la versión `-guia` marca dónde va el sticker |
| Story para etiquetar | `estaticos/Story-etiqueta.png` | «Etiqueta a tu grupo de "a ver si quedamos"»; la versión `-guia` marca el sticker |
| Banner de enlace (1200×628) | `estaticos/Banner-enlace.png` | WhatsApp, web o vista previa de enlaces |
| Cabecera (1500×500) | `estaticos/Banner-cabecera.png` | Cabecera de X o LinkedIn, con el contenido centrado para que no lo tape la foto de perfil |

## 6. Calendario de publicación (7 días)

| Día | Qué | Dónde | Detalle |
|---|---|---|---|
| 0 (víspera) | Story con encuesta + story para etiquetar | Stories | Encuesta: «Menos de 5» / «He perdido la cuenta». Calienta y te dice cuánta gente tiene el problema |
| 1 | Las 3 stories del vídeo seguidas | Stories | Sticker de enlace a la demo en la tercera, en la franja libre del centro |
| 1 (tarde) | Carrusel | Feed | Pie de foto abajo. Primera hora de la tarde o noche, según tus mejores horas |
| 2 | Comparte respuestas de la encuesta y de los DM (con permiso) | Stories | La prueba social de que el problema es común |
| 3 | Post de la lista | Feed o story | Recordatorio corto con «¿Este finde?» |
| 4–7 | Quedadas reales de un grupo piloto con la tarjeta «Comparte tu resumen» | Stories | Lo más creíble es ver a gente real tachando |
| 7 | Destacada «TGWF» en el perfil con todo lo anterior | Perfil | Para quien llegue más tarde |

**La mejor hora**, en dos pasos:
1. Tienes el conector de **Metricool**. Su herramienta de mejores horas por red te da la hora exacta según tu público.
2. Programa desde ahí con la marca de contenido IA **desactivada**: estas piezas no usan imágenes generadas, son código y capturas reales.

## 7. Textos listos para pegar

**Pie del carrusel:**
> ¿Cuántos «tenemos que ir» tenéis pendientes en el grupo? 🙃
> TGWF es una lista de sitios que compartes con tus amigos. Quedáis, lo apuntáis y lo tacháis. La lista, el mapa y el historial, al día para todos (y sí, cuenta los días que lleváis sin quedar).
> Pruébala en modo demo: javdomvid.com/tgwfapp
> ¿Queréis el vuestro? Escribidme TOUR por DM.

**Respuesta al DM «TOUR»:**
> ¡Hecho! Pásame los @ de tu grupo (y la ciudad) y os creo el Tour. Mientras, podéis curiosear la demo: javdomvid.com/tgwfapp/?demo

**Texto encima del sticker de enlace** (story 3): «Pruébala aquí».

**Nombre de la destacada:** «TGWF» o «Tacháis».

**Hashtags:** como mucho tres y de ciudad. Por ejemplo #planesbarcelona, #quedadas o #planesconamigos. En stories no hacen falta.

## 8. Cómo saber si ha funcionado

| Qué medir | Dónde | Señal de que funciona (orientativa) |
|---|---|---|
| Salidas en la story 1 | Estadísticas de la story | Menos del 15 % de salidas: el gancho funciona |
| Toques en el sticker de enlace | Estadísticas de la story 3 | Más del 3 % de quien la ve |
| Respuestas a la encuesta | Story del día 0 | Cuantas más, mejor: es audiencia que se identifica |
| DM con «TOUR» | Bandeja de Instagram | Cada uno es un grupo potencial |
| Tours nuevos creados | La propia app | El resultado de verdad |
| Guardados y compartidos del carrusel | Estadísticas del post | Si se comparte entre amigos, el mensaje ha calado |

PENDIENTE: confirmar si la app registra de alguna forma las visitas a la demo. Si no, el sticker de enlace de Instagram es la única medida de clics.

## 9. Qué probar después (variantes)

- **Tres ganchos.** Hay que comparar a la vez:
  - (A) «Tenemos que ir.», el actual;
  - (B) abrir con «¿al final fuimos?»;
  - (C) abrir con «22 sitios pendientes».

  Cambiar el gancho es tocar una línea de código y volver a renderizar.
- **Llamada a la acción:** solo la demo, solo el DM o las dos (como ahora). Voto por las dos: la demo es para curiosos y el DM, para grupos que ya quieren el suyo.
- **Cuenta:** publicar desde `@javdomvid` o abrir una cuenta propia de la app. Voto por **@javdomvid** de momento, por dos razones: ahí está ya el público, y el acceso por invitación pasa por ti. Tiene vuelta atrás: más adelante se puede abrir una cuenta y reutilizar todas las piezas.

## 10. Lo que haría un equipo profesional además de esto

- **Un grupo piloto real** que use TGWF durante dos semanas y deje grabar dos o tres quedadas (con su permiso). Eso es el contenido más creíble y alimenta los días 4–7.
- **Nada de personas generadas con IA.** En una app que va de quedar con gente real, restan confianza. Si algún día se usan y son realistas, el AI Act obliga a etiquetarlas. Estas piezas no lo necesitan: son código y capturas.
- **Versión Reel** del vídeo completo con audio en tendencia, y un Reel de 6–8 s solo con el paso 3 (el tachado) como anzuelo.
- **La tarjeta «Comparte tu resumen»** de la app es el mejor canal gratis. Conviene que cada grupo la publique al cumplir un Tour.

## 11. Pendiente de confirmar

- PENDIENTE: confirmar que `javdomvid.com/tgwfapp/?demo` está abierto al público y funciona en móvil, sin entrar.
- PENDIENTE: confirmar que quieres recibir peticiones por DM con la palabra «TOUR» (o elegir otra).
- PENDIENTE: el nombre de la app es provisional según `config.js`. Si cambia, se edita `video/src/brand.ts` y los textos, y se vuelve a renderizar todo.
- PENDIENTE: en el vídeo, el botón de la ruleta dice «Tachar», como en la app. Si cambias ese texto en la app, se cambia aquí también.

## 12. Cómo cambiar algo

**En una frase:** dime qué quieres cambiar y lo regenero. No tienes que tocar código.

**Detalle técnico,** por si lo hace otra persona:
- **Dónde está cada cosa:** el proyecto vive en `video/`. Los textos están en `src/scenes/*.tsx` y `src/stills/Stills.tsx`; los colores y las fuentes, en `src/brand.ts`.
- **Vista previa:** `npm run dev` abre Remotion Studio.
- **Renderizar el vídeo y las estáticas:**
  - En esta sesión en la nube hace falta indicar el Chrome que ya está instalado:
    ```bash
    npx remotion render TGWFStories ../salida/tgwf-stories.mp4 --browser-executable=<ruta de chrome-headless-shell>
    node render-stills.mjs <ruta de chrome-headless-shell>
    ```
  - En un ordenador normal basta con `npx remotion render TGWFStories` y `node render-stills.mjs`.
- **Fuentes:** están en `video/public/fonts`, descargadas de Google Fonts con licencia OFL, para que el render no dependa de internet.
- **Licencia de Remotion:** es gratis para particulares y equipos de hasta 3 personas.
