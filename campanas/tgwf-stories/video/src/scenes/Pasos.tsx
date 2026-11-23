import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, CAT, SAFE, display, mono, text } from "../brand";
import { Avatar, Grain, Label, Phone } from "../components/Bits";
import { Tachon } from "../components/Tachon";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Cabecera de cada paso: número real de la secuencia, titular y una línea
const StepHead: React.FC<{ n: string; title: React.ReactNode; sub: string; dark?: boolean }> = ({ n, title, sub, dark }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side }}>
      <Label color={dark ? C.creamDim : C.ink2}>{n}</Label>
      <div
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: 112,
          lineHeight: 0.94,
          letterSpacing: "-0.035em",
          color: dark ? C.cream : C.ink,
          marginTop: 14,
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
          translate: `0px ${interpolate(frame, [0, 10], [30, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: text,
          fontSize: 42,
          lineHeight: 1.3,
          color: dark ? C.creamDim : C.ink2,
          marginTop: 22,
          maxWidth: 860,
          opacity: interpolate(frame, [8, 14], [0, 1], clamp),
        }}
      >
        {sub}
      </div>
    </div>
  );
};

const PhoneIn: React.FC<{ src: string; top: number }> = ({ src, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <Phone
      src={src}
      width={690}
      style={{
        top,
        left: (1080 - 690) / 2 - 19,
        translate: `0px ${interpolate(p, [0, 1], [500, 0])}px`,
        rotate: `${interpolate(p, [0, 1], [-5, 0])}deg`,
      }}
    />
  );
};

// Paso 1: la lista compartida (captura real del Tour del modo demo)
export const PasoLista: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
    <StepHead n="Cómo funciona · 1 de 3" title={<>Hacéis una lista juntos.</>} sub="Bares, restaurantes, salas, tiendas. Un Tour para vuestro grupo." />
    <PhoneIn src="capturas/05-tour.png" top={760} />
    <Grain id="g-p1" />
  </AbsoluteFill>
);

// Paso 2: apuntar la quedada (captura real de "Nueva quedada")
export const PasoQuedada: React.FC = () => (
  <AbsoluteFill style={{ background: C.surface2, overflow: "hidden" }}>
    <StepHead n="Cómo funciona · 2 de 3" title={<>Quedáis y lo apuntáis.</>} sub="Qué día fue, quién vino y qué sitios pisasteis." />
    <PhoneIn src="capturas/08-nueva-quedada.png" top={760} />
    <Grain id="g-p2" />
  </AbsoluteFill>
);

// Paso 3: el tachado, dibujado en código con las filas de la app
const ROWS: { name: string; meta: string; color: string; at: number; who: ("LM" | "NF" | "VS")[] }[] = [
  { name: "Casa Margen", meta: "Arroces · Barceloneta", color: CAT.comer, at: 18, who: ["LM", "NF", "VS"] },
  { name: "La Grapa", meta: "Pizza · Poblenou", color: CAT.comer, at: 40, who: ["LM", "VS"] },
  { name: "Miga y Tinta", meta: "Brunch · Born", color: CAT.cafe, at: 62, who: ["LM", "NF", "VS"] },
  { name: "Clip", meta: "Pub · Eixample", color: CAT.copas, at: 999, who: [] },
];

const Row: React.FC<(typeof ROWS)[number]> = ({ name, meta, color, at, who }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const done = frame >= at;
  const check = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 260 } });
  const strike = interpolate(frame, [at + 2, at + 14], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const nameWidth = Math.min(560, name.length * 34);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, padding: "30px 0", borderBottom: `2px solid ${C.line}` }}>
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: 62,
          border: `5px solid ${done ? C.ink : color}`,
          background: done ? C.ink : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        {done && (
          <svg width="34" height="34" viewBox="0 0 24 24" style={{ scale: `${check}` }}>
            <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke={C.cream} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ fontFamily: text, fontWeight: 600, fontSize: 56, color: done ? C.ink2 : C.ink }}>{name}</div>
          {at < 999 && <Tachon width={nameWidth + 20} height={40} stroke={11} progress={strike} variant={(name.length % 3) as 0 | 1 | 2} style={{ left: -10, top: 22 }} />}
        </div>
        <div style={{ fontFamily: text, fontSize: 34, color: C.ink3, marginTop: 4 }}>{meta}</div>
      </div>
      <div style={{ display: "flex", opacity: interpolate(frame, [at + 8, at + 14], [0, 1], clamp) }}>
        {who.map((w, i) => (
          <Avatar key={w} who={w} size={58} ring={C.bg} style={{ marginLeft: i ? -16 : 0 }} />
        ))}
      </div>
    </div>
  );
};

export const PasoTachar: React.FC = () => {
  const frame = useCurrentFrame();
  const tachados = frame >= 62 ? 11 : frame >= 40 ? 10 : frame >= 18 ? 9 : 8;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <StepHead n="Cómo funciona · 3 de 3" title={<>Y lo tacháis.</>} sub="La lista, el mapa y el historial se actualizan para todos." />
      <div style={{ position: "absolute", top: 760, left: SAFE.side, right: SAFE.side }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 120, lineHeight: 0.9, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
            {tachados}
            <span style={{ fontSize: 56, color: C.ink3, letterSpacing: 0 }}> / 18</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 26, letterSpacing: "0.1em", color: C.ink2, textAlign: "right", textTransform: "uppercase" }}>
            Tachados
            <br />
            Lola × Nico × Vera
          </div>
        </div>
        <div style={{ height: 14, borderRadius: 14, background: C.surface2, overflow: "hidden", marginBottom: 20 }}>
          <div
            style={{
              height: "100%",
              background: C.accent,
              width: `${interpolate(frame, [0, 18, 40, 62, 80], [44, 50, 55.5, 61, 61], clamp)}%`,
            }}
          />
        </div>
        {ROWS.map((r) => (
          <Row key={r.name} {...r} />
        ))}
      </div>
      <Grain id="g-p3" />
    </AbsoluteFill>
  );
};

// Extra: "¿No sabéis dónde ir? Que decida la app" (el botón de sitio al azar)
const DADO = ["Casa Margen", "Posdata", "Doblez Vintage", "La Grapa", "Fuera de Margen", "Miga y Tinta", "El Pliego", "Clip"];

export const PasoDado: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // La ruleta se frena: cambia cada vez más despacio y se para en "Clip"
  const steps = [0, 3, 6, 9, 13, 18, 24, 32];
  let idx = 0;
  steps.forEach((s, i) => {
    if (frame >= 8 + s) idx = i;
  });
  const landed = frame >= 8 + 32;
  const pop = spring({ frame: frame - 40, fps, config: { damping: 11, stiffness: 240 } });
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <StepHead dark n="Y si no os ponéis de acuerdo" title={<>Que decida la app.</>} sub="Un toque y os propone un sitio pendiente al azar." />
      <div
        style={{
          position: "absolute",
          top: 860,
          left: SAFE.side,
          right: SAFE.side,
          background: C.surface,
          borderRadius: 48,
          padding: "48px 52px 44px",
          scale: landed ? interpolate(pop, [0, 1], [1.04, 1]) : 1,
        }}
      >
        <Label size={28} color={C.ink3}>
          {landed ? "Copas · Pub" : "Buscando sitio…"}
        </Label>
        <div
          style={{
            fontFamily: display,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: C.ink,
            marginTop: 14,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {DADO[idx]}
        </div>
        <div style={{ fontFamily: text, fontSize: 40, color: C.ink2, marginTop: 6, opacity: landed ? 1 : 0 }}>Eixample · pendiente</div>
        <div style={{ display: "flex", gap: 20, marginTop: 40, opacity: landed ? 1 : 0.25 }}>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: text,
              fontWeight: 600,
              fontSize: 40,
              border: `3px solid ${C.ink}`,
              borderRadius: 999,
              padding: "24px 0",
            }}
          >
            Otro
          </div>
          <div
            style={{
              flex: 1.4,
              textAlign: "center",
              fontFamily: text,
              fontWeight: 600,
              fontSize: 40,
              color: "#fff",
              background: C.accent,
              borderRadius: 999,
              padding: "27px 0",
            }}
          >
            Tachar
          </div>
        </div>
      </div>
      <Grain id="g-p4" opacity={0.1} />
    </AbsoluteFill>
  );
};
