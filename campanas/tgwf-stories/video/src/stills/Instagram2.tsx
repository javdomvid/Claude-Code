import React from "react";
import { AbsoluteFill } from "remotion";
import { C, CAT, display, mono, text } from "../brand";
import { Grain, Label } from "../components/Bits";
import { Logo } from "../components/Tachon";

// Segunda tanda para Instagram: variaciones de la foto de perfil, posts
// sueltos en 3:4 (1080×1440) y series de 3 que forman un banner seguido.

const W = 1080;
const H = 1440;
const P = 96;

type Theme = { bg: string; ink: string; strike: string; dim: string };
const NEGRO: Theme = { bg: C.ink, ink: C.cream, strike: C.accent, dim: C.creamDim };
const CREMA: Theme = { bg: C.bg, ink: C.ink, strike: C.accent, dim: C.ink3 };
const ROJO: Theme = { bg: C.accent, ink: C.cream, strike: C.ink, dim: "rgba(243, 239, 230, 0.72)" };

const Fondo: React.FC<{ t: Theme; id: string; children: React.ReactNode }> = ({ t, id, children }) => (
  <AbsoluteFill style={{ background: t.bg, color: t.ink, overflow: "hidden" }}>
    {children}
    <Grain id={id} opacity={t === CREMA ? 0.06 : 0.1} />
  </AbsoluteFill>
);

// El icono de la app (gancho + tachón), con los colores que toquen
const Icono: React.FC<{ size: number; hook: string; wave: string; style?: React.CSSProperties }> = ({ size, hook, wave, style }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
    <path d="M45 20v42c0 10 5 15 14 15h7" fill="none" stroke={hook} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 46c13-5 25 3 38-2s17-6 25-4" fill="none" stroke={wave} strokeWidth={9} strokeLinecap="round" />
  </svg>
);

// Trazo ondulado que no se deforma al estirarlo
const Onda: React.FC<{ color: string; stroke: number; style?: React.CSSProperties; d?: string }> = ({ color, stroke, style, d = "M 0 70 C 160 30, 300 80, 500 52 S 800 18, 1000 40" }) => (
  <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ position: "absolute", overflow: "visible", ...style }}>
    <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>
);

// ——— Fotos de perfil (1080×1080; Instagram recorta un círculo) ———

const PerfilPalabra: React.FC<{ t: Theme; id: string }> = ({ t, id }) => (
  <Fondo t={t} id={id}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Logo size={300} font={display} progress={1} color={t.ink} strike={t.strike} style={{ marginTop: 20 }} />
    </AbsoluteFill>
  </Fondo>
);

const PerfilApilado: React.FC<{ t: Theme; id: string }> = ({ t, id }) => (
  <Fondo t={t} id={id}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", fontFamily: display, fontWeight: 800, fontSize: 380, lineHeight: 0.8, letterSpacing: "-0.05em", textAlign: "center", color: t.ink }}>
        TG
        <br />
        WF
        <Onda color={t.strike} stroke={48} style={{ left: -70, width: 700, top: 230, height: 120 }} />
      </div>
    </AbsoluteFill>
  </Fondo>
);

const PerfilIcono: React.FC<{ t: Theme; id: string }> = ({ t, id }) => (
  <Fondo t={t} id={id}>
    <Icono size={800} hook={t.ink} wave={t.strike} style={{ position: "absolute", left: 140, top: 140 }} />
  </Fondo>
);

// ——— Posts sueltos 3:4 ———

const LogoSuelto: React.FC<{ t: Theme; id: string }> = ({ t, id }) => (
  <Fondo t={t} id={id}>
    <div style={{ position: "absolute", top: P, left: P }}>
      <Label color={t.dim}>To go with friends…</Label>
    </div>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Logo size={340} font={display} progress={1} color={t.ink} strike={t.strike} />
    </AbsoluteFill>
    <div style={{ position: "absolute", right: P, bottom: P, fontFamily: display, fontWeight: 500, fontStyle: "italic", fontSize: 54, color: t.dim }}>…or somebody else.</div>
  </Fondo>
);

const IconoSuelto: React.FC = () => (
  <Fondo t={CREMA} id="s-ico">
    <Icono size={760} hook={C.ink} wave={C.accent} style={{ position: "absolute", left: 160, top: 250 }} />
    <div style={{ position: "absolute", left: P, right: P, bottom: P, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Logo size={64} font={display} progress={1} />
      <div style={{ fontFamily: mono, fontSize: 26, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink3 }}>Listas de sitios con tu gente</div>
    </div>
  </Fondo>
);

const Guardados: React.FC = () => (
  <Fondo t={CREMA} id="s-guard">
    <div style={{ position: "absolute", top: 260, left: P, right: P }}>
      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 168, lineHeight: 0.93, letterSpacing: "-0.04em" }}>
        Tus guardados <span style={{ color: C.accent }}>no son un plan.</span>
      </div>
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 64, letterSpacing: "-0.03em", color: C.ink2, marginTop: 60 }}>Una lista compartida, sí.</div>
    </div>
    <div style={{ position: "absolute", left: P, bottom: P }}>
      <Logo size={60} font={display} progress={1} />
    </div>
  </Fondo>
);

const TodoALaLista: React.FC = () => {
  const items: [string, string][] = [
    ["Bravas", CAT.comer],
    ["Vermut", CAT.vermut],
    ["Vinilos", CAT.copas],
    ["Brunch", CAT.cafe],
    ["Salas", CAT.bailar],
    ["Tiendas", CAT.tiendas],
  ];
  return (
    <Fondo t={NEGRO} id="s-todo">
      <div style={{ position: "absolute", top: P, left: P, right: P }}>
        <Label color={C.creamDim}>Lo que cabe en un Tour</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 50 }}>
          {items.map(([n, c]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <span style={{ width: 46, height: 46, borderRadius: 46, border: `7px solid ${c}`, flex: "none" }} />
              <span style={{ fontFamily: display, fontWeight: 800, fontSize: 128, lineHeight: 1.04, letterSpacing: "-0.04em" }}>{n}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: 60, letterSpacing: "-0.03em", color: C.accent, marginTop: 50 }}>Todo a la lista. Y a tachar.</div>
      </div>
    </Fondo>
  );
};

const CadaQuedada: React.FC = () => (
  <Fondo t={ROJO} id="s-cada">
    <div style={{ position: "absolute", top: 300, left: P, right: P }}>
      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 168, lineHeight: 0.95, letterSpacing: "-0.045em", color: C.cream, whiteSpace: "nowrap" }}>
        Cada
        <br />
        quedada,
        <br />
        un{" "}
        <span style={{ position: "relative", display: "inline-block" }}>
          tachón.
          <Onda color={C.ink} stroke={30} style={{ left: -24, width: "calc(100% + 48px)", top: 70, height: 80 }} />
        </span>
      </div>
    </div>
    <div style={{ position: "absolute", left: P, bottom: P }}>
      <Logo size={60} font={display} progress={1} color={C.cream} strike={C.ink} />
    </div>
  </Fondo>
);

const OrSomebody: React.FC = () => (
  <Fondo t={NEGRO} id="s-or">
    <div style={{ position: "absolute", top: 300, left: P, right: P }}>
      <div style={{ fontFamily: display, fontWeight: 700, fontStyle: "italic", fontSize: 150, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.cream }}>
        …or
        <br />
        somebody
        <br />
        <span style={{ color: C.accent }}>else.</span>
      </div>
      <div style={{ fontFamily: text, fontSize: 42, lineHeight: 1.35, color: C.creamDim, marginTop: 60 }}>
        TGWF también es para ir con quien tú quieras: tu pareja, tu compi de piso, tu cita del jueves.
      </div>
    </div>
    <div style={{ position: "absolute", left: P, bottom: P }}>
      <Logo size={60} font={display} progress={1} color={C.cream} />
    </div>
  </Fondo>
);

// ——— Series de 3 (banner seguido en la parrilla) ———
// Un lienzo de 3 posts de ancho que se corta en tres. Se publican de derecha
// a izquierda (primero la «derecha») para que en el perfil queden en orden.

const Tira: React.FC<{ part: number; t: Theme; id: string; children: React.ReactNode }> = ({ part, t, id, children }) => (
  <Fondo t={t} id={`${id}${part}`}>
    <div style={{ position: "absolute", top: 0, left: -part * W, width: W * 3, height: H }}>{children}</div>
  </Fondo>
);

const BannerLogo: React.FC<{ part: number; t: Theme; id: string }> = ({ part, t, id }) => (
  <Tira part={part} t={t} id={id}>
    <div style={{ position: "absolute", left: 160, top: 150 }}>
      <Label size={36} color={t.dim}>
        To go with friends…
      </Label>
    </div>
    <div style={{ position: "absolute", left: 190, top: 330 }}>
      <Logo size={1080} font={display} progress={1} color={t.ink} strike={t.strike} />
    </div>
    <div style={{ position: "absolute", right: 170, bottom: 140, fontFamily: display, fontWeight: 500, fontStyle: "italic", fontSize: 72, color: t.dim }}>…or somebody else.</div>
  </Tira>
);

const BannerLema: React.FC<{ part: number }> = ({ part }) => {
  const words: [string, string][] = [
    ["Quedáis.", C.cream],
    ["Vais.", C.cream],
    ["Tacháis.", C.accent],
  ];
  return (
    <Tira part={part} t={NEGRO} id="b-lema">
      {words.map(([w, c], i) => (
        <div key={w} style={{ position: "absolute", left: i * W, width: W, top: 520, textAlign: "center", fontFamily: display, fontWeight: 800, fontSize: 228, letterSpacing: "-0.045em", color: c }}>
          {w}
        </div>
      ))}
      {/* La línea que une las tres: pasa por debajo de las palabras */}
      <Onda color={C.accent} stroke={30} style={{ left: 120, width: W * 3 - 240, top: 820, height: 110 }} d="M 0 40 C 120 90, 260 10, 400 50 S 640 95, 760 45 S 920 10, 1000 60" />
      <div style={{ position: "absolute", left: 160, top: 150 }}>
        <Label size={36} color={C.creamDim}>
          TGWF · listas de sitios con tu gente
        </Label>
      </div>
    </Tira>
  );
};

const BannerFriends: React.FC<{ part: number }> = ({ part }) => {
  const words = ["To go", "with", "friends…"];
  return (
    <Tira part={part} t={ROJO} id="b-fr">
      {words.map((w, i) => (
        <div key={w} style={{ position: "absolute", left: i * W, width: W, top: 480, textAlign: "center", fontFamily: display, fontWeight: 800, fontSize: 220, letterSpacing: "-0.045em", color: C.cream }}>
          {w}
        </div>
      ))}
      {/* Entera dentro del tercer post, para que no la corte la separación */}
      <div style={{ position: "absolute", left: 2 * W, width: W, top: 880, textAlign: "center", fontFamily: display, fontWeight: 700, fontStyle: "italic", fontSize: 92, letterSpacing: "-0.03em", color: C.ink }}>…or somebody else.</div>
      <div style={{ position: "absolute", left: 160, bottom: 140 }}>
        <Logo size={90} font={display} progress={1} color={C.cream} strike={C.ink} />
      </div>
    </Tira>
  );
};

const tri = (base: string, make: (part: number) => React.ReactElement) =>
  [
    { id: `${base}-1-derecha`, part: 2 },
    { id: `${base}-2-centro`, part: 1 },
    { id: `${base}-3-izquierda`, part: 0 },
  ].map(({ id, part }) => ({ id, component: () => make(part), width: W, height: H }));

export const IG2_STILLS: { id: string; component: React.FC; width: number; height: number }[] = [
  { id: "IG-perfil-v1-negro", component: () => <PerfilPalabra t={NEGRO} id="pf1" />, width: 1080, height: 1080 },
  { id: "IG-perfil-v2-crema", component: () => <PerfilPalabra t={CREMA} id="pf2" />, width: 1080, height: 1080 },
  { id: "IG-perfil-v3-rojo", component: () => <PerfilPalabra t={ROJO} id="pf3" />, width: 1080, height: 1080 },
  { id: "IG-perfil-v4-apilado-negro", component: () => <PerfilApilado t={NEGRO} id="pf4" />, width: 1080, height: 1080 },
  { id: "IG-perfil-v5-apilado-crema", component: () => <PerfilApilado t={CREMA} id="pf5" />, width: 1080, height: 1080 },
  { id: "IG-perfil-v6-apilado-rojo", component: () => <PerfilApilado t={ROJO} id="pf6" />, width: 1080, height: 1080 },
  { id: "IG-perfil-v7-icono-crema", component: () => <PerfilIcono t={CREMA} id="pf7" />, width: 1080, height: 1080 },
  { id: "IG-perfil-v8-icono-rojo", component: () => <PerfilIcono t={ROJO} id="pf8" />, width: 1080, height: 1080 },
  { id: "IG-34-logo-negro", component: () => <LogoSuelto t={NEGRO} id="sl1" />, width: W, height: H },
  { id: "IG-34-logo-crema", component: () => <LogoSuelto t={CREMA} id="sl2" />, width: W, height: H },
  { id: "IG-34-logo-rojo", component: () => <LogoSuelto t={ROJO} id="sl3" />, width: W, height: H },
  { id: "IG-34-icono", component: IconoSuelto, width: W, height: H },
  { id: "IG-34-tus-guardados", component: Guardados, width: W, height: H },
  { id: "IG-34-todo-a-la-lista", component: TodoALaLista, width: W, height: H },
  { id: "IG-34-cada-quedada", component: CadaQuedada, width: W, height: H },
  { id: "IG-34-or-somebody-else", component: OrSomebody, width: W, height: H },
  ...tri("IG-banner-A-logo-crema", (p) => <BannerLogo part={p} t={CREMA} id="ba" />),
  ...tri("IG-banner-B-logo-negro", (p) => <BannerLogo part={p} t={NEGRO} id="bb" />),
  ...tri("IG-banner-C-quedais-vais-tachais", (p) => <BannerLema part={p} />),
  ...tri("IG-banner-D-to-go-with-friends", (p) => <BannerFriends part={p} />),
];
