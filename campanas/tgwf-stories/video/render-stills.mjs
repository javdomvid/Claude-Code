// Renderiza las piezas estáticas con un solo empaquetado.
// Uso: node render-stills.mjs [ruta-al-chrome] [prefijo]
//   prefijo opcional: solo las que empiezan así (p. ej. IG- para Instagram).
// Las de Instagram (IG-) van a ../salida/instagram/; el resto, a ../salida/estaticos/.
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import path from "node:path";

const browserExecutable = process.argv[2] || null;
const only = process.argv[3] || "";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = await getCompositions(serveUrl, { browserExecutable });
for (const c of comps.filter((c) => c.durationInFrames === 1 && c.id.startsWith(only))) {
  const dir = c.id.startsWith("IG-") ? "../salida/instagram" : "../salida/estaticos";
  const out = path.resolve(dir, `${c.id}.png`);
  await renderStill({ composition: c, serveUrl, output: out, browserExecutable, scale: 1 });
  console.log("ok", c.id, `${c.width}x${c.height}`);
}
