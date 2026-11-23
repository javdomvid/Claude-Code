// Renderiza todas las piezas estáticas con un solo empaquetado.
// Uso: node render-stills.mjs [ruta-al-chrome]
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import path from "node:path";

const browserExecutable = process.argv[2] || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = await getCompositions(serveUrl, { browserExecutable });
for (const c of comps.filter((c) => c.durationInFrames === 1)) {
  const out = path.resolve("../salida/estaticos", `${c.id}.png`);
  await renderStill({ composition: c, serveUrl, output: out, browserExecutable, scale: 1 });
  console.log("ok", c.id, `${c.width}x${c.height}`);
}
