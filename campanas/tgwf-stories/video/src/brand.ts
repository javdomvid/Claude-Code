// Sistema de marca de TGWF para la campaña. Sale de public/tgwfapp/app.css e
// icon.svg del repositorio javdomvid/tgwf-app: mismos colores y tipografías
// que la app, para que el vídeo y la app se reconozcan como lo mismo.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONT_FILES } from "./fontFiles";

// Fuentes en local (public/fonts): el render no depende de la red.
FONT_FILES.forEach((f) => {
  loadFont({ family: f.family, url: staticFile(f.file), weight: f.weight, unicodeRange: f.unicodeRange, display: "block" });
});

export const display = "'Bricolage Grotesque', 'Inter', sans-serif";
export const mono = "'DM Mono', ui-monospace, monospace";
export const text = "'Inter', system-ui, sans-serif";

export const C = {
  bg: "#F3EFE6",
  surface: "#FBF9F3",
  surface2: "#E9E3D5",
  ink: "#15130F",
  ink2: "#5B5549",
  ink3: "#8F887A",
  accent: "#F2380F",
  cream: "#F3EFE6",
  creamDim: "rgba(243, 239, 230, 0.6)",
  creamFaint: "rgba(243, 239, 230, 0.16)",
  line: "rgba(21, 19, 15, 0.11)",
};

// Colores de las personas del modo demo (avatares de la app)
export const PERSON = {
  LM: { name: "Lola", color: "#1C8AA6" },
  NF: { name: "Nico", color: "#2F9A47" },
  VS: { name: "Vera", color: "#CF2E92" },
  AP: { name: "Álex", color: "#7A4BD6" },
} as const;

// Colores de categoría de la app (comer, café, vermut, copas, bailar…)
export const CAT = {
  comer: "#E8890C",
  cafe: "#8A6A4F",
  vermut: "#B0234A",
  copas: "#6B4FD8",
  bailar: "#D63C8F",
  cultura: "#1C8AA6",
  tiendas: "#2F9A47",
};

// Zona segura de Instagram Stories en un lienzo de 1080×1920:
// arriba ~250 px (perfil y barras) y abajo ~340 px (responder, enlace).
export const SAFE = { top: 260, bottom: 1580, side: 84 };

export const W = 1080;
export const H = 1920;
export const FPS = 30;
