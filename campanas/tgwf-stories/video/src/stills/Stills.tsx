import React from "react";
import { AbsoluteFill } from "remotion";
import { C, CAT, display, mono, text } from "../brand";
import { Avatar, Grain, Label, Phone } from "../components/Bits";
import { Logo } from "../components/Tachon";
import { BETA_URL } from "../scenes/Beta";

// Piezas estáticas de la campaña, con el mismo sistema que el vídeo.

const Big: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = C.ink, children, style }) => (
  <div style={{ fontFamily: display, fontWeight: 800, fontSize: size, lineHeight: 0.93, letterSpacing: "-0.04em", color, ...style }}>{children}</div>
);

// Tachón que se ajusta al ancho real del texto (el trazo no se deforma)
const Struck: React.FC<{ children: string; size: number; color?: string; variant?: 0 | 1 | 2 }> = ({ children, size, color = C.ink2, variant = 0 }) => {
  const d = [
    "M 0 74 C 160 40, 300 78, 500 56 S 800 22, 1000 40",
    "M 0 55 C 200 25, 380 80, 580 50 S 860 30, 1000 55",
    "M 0 62 C 250 82, 450 28, 660 46 S 900 62, 1000 36",
  ][variant];
  return (
    <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
      <span style={{ color }}>{children}</span>
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", left: -size * 0.1, width: `calc(100% + ${size * 0.2}px)`, top: size * 0.28, height: size * 0.6, overflow: "visible" }}
      >
        <path d={d} fill="none" stroke={C.accent} strokeWidth={size * 0.16} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
};

const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
    <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke={C.cream} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Foot: React.FC<{ dark?: boolean; pad: number }> = ({ dark, pad }) => (
  <div style={{ position: "absolute", left: pad, right: pad, bottom: pad * 0.8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Logo size={56} font={display} progress={1} color={dark ? C.cream : C.ink} />
    <div style={{ fontFamily: mono, fontSize: 26, letterSpacing: "0.08em", color: dark ? C.creamDim : C.ink3 }}>javdomvid.com/tgwfapp</div>
  </div>
);

// ——— Carrusel 4:5 (1080×1350) ———
const P = 92;

const Car1: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <Label>Pregunta seria</Label>
      <Big size={132} style={{ marginTop: 28 }}>
        ¿Cuántos «tenemos que ir» tenéis pendientes?
      </Big>
    </div>
    <div style={{ position: "absolute", left: P, right: P, top: 860, fontFamily: text, fontSize: 40, lineHeight: 1.35, color: C.ink2 }}>
      Esa bodega, ese brunch, esa sala. Todos en el grupo. Ninguno en el calendario.
    </div>
    <Foot pad={P} />
    <Grain id="c1" />
  </AbsoluteFill>
);

const Car2: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <Label color={C.creamDim}>Lo que pasa siempre</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 40 }}>
        {[
          ["VS", "TENEMOS QUE IR"],
          ["LM", "apuntadísimo"],
          ["NF", "¿este finde?"],
          ["VS", "uf, este no puedo"],
        ].map(([w, b], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, flexDirection: w === "LM" ? "row-reverse" : "row" }}>
            {w !== "LM" && <Avatar who={w as "VS" | "NF"} size={56} />}
            <div
              style={{
                background: w === "LM" ? C.accent : "rgba(243,239,230,.1)",
                color: C.cream,
                borderRadius: 30,
                padding: "18px 28px",
                fontFamily: text,
                fontSize: 38,
                fontWeight: b === "TENEMOS QUE IR" ? 600 : 400,
              }}
            >
              {b}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", left: P, right: P, top: 760 }}>
      <Big size={110} color={C.cream}>
        Tres meses después,
        <br />
        <span style={{ color: C.accent }}>nadie ha ido.</span>
      </Big>
    </div>
    <Foot pad={P} dark />
    <Grain id="c2" opacity={0.1} />
  </AbsoluteFill>
);

const Car3: React.FC = () => {
  const steps: [string, string, string][] = [
    ["1", "Hacéis una lista juntos.", "Bares, restaurantes, salas, tiendas: un Tour para vuestro grupo."],
    ["2", "Quedáis y lo apuntáis.", "Qué día fue y quién vino."],
    ["3", "Y lo tacháis.", "La lista, el mapa y el historial se actualizan para todos."],
  ];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: P, left: P, right: P }}>
        <Label>Cómo funciona TGWF</Label>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
          {steps.map(([n, t, s]) => (
            <div key={n} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 24, padding: "38px 0", borderTop: `3px solid ${C.ink}` }}>
              <div style={{ fontFamily: display, fontWeight: 800, fontSize: 120, lineHeight: 0.8, color: n === "3" ? C.accent : C.ink }}>{n}</div>
              <div>
                <div style={{ fontFamily: display, fontWeight: 800, fontSize: 66, letterSpacing: "-0.03em", lineHeight: 1 }}>{t}</div>
                <div style={{ fontFamily: text, fontSize: 34, color: C.ink2, marginTop: 12, lineHeight: 1.3 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Foot pad={P} />
      <Grain id="c3" />
    </AbsoluteFill>
  );
};

const Car4: React.FC = () => (
  <AbsoluteFill style={{ background: C.surface2, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: P, left: P, width: 470 }}>
      <Label>Así se ve</Label>
      <Big size={86} style={{ marginTop: 24 }}>
        Vuestra lista, vuestro mapa, vuestro historial.
      </Big>
      <div style={{ fontFamily: text, fontSize: 34, color: C.ink2, marginTop: 28, lineHeight: 1.35 }}>
        Y un panel que cuenta los días que lleváis sin quedar.
      </div>
    </div>
    <Phone src="capturas/05-tour.png" width={430} style={{ top: 130, right: 70, rotate: "4deg" }} />
    <Foot pad={P} />
    <Grain id="c4" />
  </AbsoluteFill>
);

const Car5: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <Big size={170} color={C.cream}>
        Quedáis.
        <br />
        Vais.
        <br />
        <span style={{ color: C.accent }}>Tacháis.</span>
      </Big>
      <div style={{ marginTop: 70 }}>
        <Label color={C.creamDim}>Estamos en beta · pide tu Tour</Label>
        <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 50, marginTop: 10 }}>{BETA_URL}</div>
        <div style={{ fontFamily: text, fontSize: 38, color: C.creamDim, marginTop: 30, lineHeight: 1.35 }}>
          Los creamos por orden de llegada. ¿Solo curiosear? <b style={{ color: C.cream }}>javdomvid.com/tgwfapp/?demo</b>
        </div>
      </div>
    </div>
    <Foot pad={P} dark />
    <Grain id="c5" opacity={0.1} />
  </AbsoluteFill>
);

// ——— Post cuadrado 1080×1080 ———
const PostLista: React.FC = () => {
  const rows: [string, string, boolean, 0 | 1 | 2][] = [
    ["Bodega La Tachuela", CAT.comer, true, 0],
    ["Café Borrador", CAT.cafe, true, 1],
    ["Sala Fosforito", CAT.bailar, true, 2],
    ["Casa Margen", CAT.comer, false, 0],
  ];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: 84, left: 84, right: 84 }}>
        <Label>Lola × Nico × Vera · Barcelona</Label>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(([name, color, done, v]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 54,
                  border: `5px solid ${done ? C.ink : color}`,
                  background: done ? C.ink : "transparent",
                  flex: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {done && <Check size={54} />}
              </div>
              <div style={{ fontFamily: display, fontWeight: 800, fontSize: 82, letterSpacing: "-0.04em", lineHeight: 1.18 }}>
                {done ? <Struck size={82} variant={v}>{name}</Struck> : name}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 84, right: 84, top: 720, fontFamily: text, fontSize: 40, color: C.ink2, lineHeight: 1.35 }}>
        Tres tachados. Uno pendiente.
        <br />
        <b style={{ color: C.ink }}>¿Este finde?</b>
      </div>
      <Foot pad={84} />
      <Grain id="pl" />
    </AbsoluteFill>
  );
};

// ——— Stories estáticas 1080×1920 (con hueco para stickers) ———
const StickerSlot: React.FC<{ top: number; label: string; dark?: boolean }> = ({ top, label, dark }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 140,
      right: 140,
      height: 300,
      border: `4px dashed ${dark ? C.creamDim : C.ink3}`,
      borderRadius: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: mono,
      fontSize: 28,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: dark ? C.creamDim : C.ink3,
      textAlign: "center",
      padding: 30,
    }}
  >
    {label}
  </div>
);

const StoryEncuesta: React.FC<{ guia?: boolean }> = ({ guia = true }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <div style={{ position: "absolute", top: 300, left: 84, right: 84 }}>
      <Label>Encuesta rápida</Label>
      <Big size={130} style={{ marginTop: 24 }}>
        ¿Cuántos sitios tenéis en «tenemos que ir»?
      </Big>
    </div>
    {guia && <StickerSlot top={1050} label="Aquí va el sticker de encuesta: «Menos de 5» / «He perdido la cuenta»" />}
    <div style={{ position: "absolute", left: 84, bottom: 380 }}>
      <Logo size={64} font={display} progress={1} />
    </div>
    <Grain id="se" />
  </AbsoluteFill>
);

const StoryEtiqueta: React.FC<{ guia?: boolean }> = ({ guia = true }) => (
  <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
    <div style={{ position: "absolute", top: 300, left: 84, right: 84 }}>
      <Label color={C.creamDim}>Sin nombrar a nadie</Label>
      <Big size={128} color={C.cream} style={{ marginTop: 24 }}>
        Etiqueta a tu grupo de <span style={{ color: C.accent }}>«a ver si quedamos».</span>
      </Big>
    </div>
    {guia && <StickerSlot dark top={1060} label="Aquí va el sticker de mención o «Añadir tuyo»" />}
    <div style={{ position: "absolute", left: 84, bottom: 380 }}>
      <Logo size={64} font={display} progress={1} color={C.cream} />
    </div>
    <Grain id="st" opacity={0.1} />
  </AbsoluteFill>
);

// ——— Banners ———
const BannerEnlace: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 70, top: 70 }}>
      <Logo size={150} font={display} progress={1} />
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 52, color: C.ink, letterSpacing: "-0.03em", marginTop: 50, lineHeight: 1.05 }}>
        Listas de sitios
        <br />
        con tu gente.
      </div>
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 52, color: C.accent, letterSpacing: "-0.03em", marginTop: 12 }}>Quedáis, vais, tacháis.</div>
      <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: "0.08em", color: C.ink3, marginTop: 40 }}>JAVDOMVID.COM/TGWFAPP</div>
    </div>
    <Phone src="capturas/04-inicio.png" width={330} style={{ top: 60, right: 80, rotate: "5deg" }} />
    <Grain id="be" />
  </AbsoluteFill>
);

const BannerCabecera: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink, color: C.cream, overflow: "hidden" }}>
    {/* Centrado: en X y LinkedIn la foto de perfil tapa la esquina inferior izquierda */}
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 70 }}>
      <Logo size={130} font={display} progress={1} color={C.cream} />
      <div>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 70, letterSpacing: "-0.035em", lineHeight: 1 }}>
          Quedáis. Vais. <span style={{ color: C.accent }}>Tacháis.</span>
        </div>
        <div style={{ fontFamily: text, fontSize: 32, color: C.creamDim, marginTop: 16 }}>Listas de sitios con tu gente · javdomvid.com/tgwfapp</div>
      </div>
    </div>
    <Grain id="bc" opacity={0.1} />
  </AbsoluteFill>
);

// ——— Beta: story estática e imagen para compartir el enlace ———
const StoryBeta: React.FC<{ guia?: boolean }> = ({ guia = true }) => (
  <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
    <div style={{ position: "absolute", top: 300, left: 84, right: 84 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Logo size={80} font={display} progress={1} color={C.cream} />
        <span style={{ fontFamily: mono, fontSize: 28, letterSpacing: "0.12em", textTransform: "uppercase", background: C.cream, color: C.ink, padding: "11px 21px", borderRadius: 999 }}>
          Beta
        </span>
      </div>
      <Big size={150} color={C.cream} style={{ marginTop: 60 }}>
        Pide tu <span style={{ color: C.accent }}>Tour.</span>
      </Big>
      <div style={{ fontFamily: text, fontSize: 42, lineHeight: 1.32, color: C.creamDim, marginTop: 34 }}>
        Rellena el formulario y lo creamos por orden de llegada. Te escribimos por Instagram.
      </div>
      <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 44, marginTop: 36 }}>{BETA_URL}</div>
    </div>
    {guia && <StickerSlot dark top={1180} label="Aquí va el sticker de enlace al formulario" />}
    <Grain id="sb" opacity={0.1} />
  </AbsoluteFill>
);

const OgBeta: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 96, top: 90 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Logo size={150} font={display} progress={1} />
        <span style={{ fontFamily: mono, fontSize: 26, letterSpacing: "0.12em", textTransform: "uppercase", background: C.ink, color: C.cream, padding: "10px 20px", borderRadius: 999 }}>
          Beta
        </span>
      </div>
      <Big size={92} style={{ marginTop: 60 }}>
        Estamos en beta. <span style={{ color: C.ink3 }}>Pide tu Tour.</span>
      </Big>
      <div style={{ fontFamily: text, fontSize: 32, color: C.ink2, marginTop: 26 }}>Listas de sitios con tu gente · por orden de llegada</div>
    </div>
    <Grain id="ogb" />
  </AbsoluteFill>
);

export const STILLS: { id: string; component: React.FC; width: number; height: number }[] = [
  { id: "Story-beta-guia", component: () => <StoryBeta guia />, width: 1080, height: 1920 },
  { id: "Story-beta", component: () => <StoryBeta guia={false} />, width: 1080, height: 1920 },
  { id: "OG-beta", component: OgBeta, width: 1200, height: 630 },
  { id: "Carrusel-1", component: Car1, width: 1080, height: 1350 },
  { id: "Carrusel-2", component: Car2, width: 1080, height: 1350 },
  { id: "Carrusel-3", component: Car3, width: 1080, height: 1350 },
  { id: "Carrusel-4", component: Car4, width: 1080, height: 1350 },
  { id: "Carrusel-5", component: Car5, width: 1080, height: 1350 },
  { id: "Post-lista", component: PostLista, width: 1080, height: 1080 },
  { id: "Story-encuesta-guia", component: () => <StoryEncuesta guia />, width: 1080, height: 1920 },
  { id: "Story-encuesta", component: () => <StoryEncuesta guia={false} />, width: 1080, height: 1920 },
  { id: "Story-etiqueta-guia", component: () => <StoryEtiqueta guia />, width: 1080, height: 1920 },
  { id: "Story-etiqueta", component: () => <StoryEtiqueta guia={false} />, width: 1080, height: 1920 },
  { id: "Banner-enlace", component: BannerEnlace, width: 1200, height: 628 },
  { id: "Banner-cabecera", component: BannerCabecera, width: 1500, height: 500 },
];
