import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, CAT, SAFE, display, mono, text } from "../brand";
import { Grain, Label } from "../components/Bits";
import { Logo, Tachon } from "../components/Tachon";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

// ——— Reel 2 · «Tachar sienta así de bien» (bucle de 8 s) ———
const SITIOS: [string, string, string][] = [
  ["Bodega La Tachuela", "Tapas · Gràcia", CAT.comer],
  ["Café Borrador", "Especialidad · Gràcia", CAT.cafe],
  ["Vermutería Línea Recta", "Vermut · Poble-sec", CAT.vermut],
  ["Posdata", "Bar de vinilos · Raval", CAT.copas],
  ["Sala Fosforito", "Club · Poblenou", CAT.bailar],
  ["Punto y Aparte", "Librería · Gràcia", CAT.tiendas],
];
const STEP = 24;
const FIRST = 18;

const Fila: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [name, meta, color] = SITIOS[i];
  const at = FIRST + i * STEP;
  const done = f >= at;
  const pop = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 260 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, padding: "24px 0", borderBottom: `2px solid ${C.line}` }}>
      <div style={{ width: 60, height: 60, borderRadius: 60, border: `5px solid ${done ? C.ink : color}`, background: done ? C.ink : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        {done && (
          <svg width="32" height="32" viewBox="0 0 24 24" style={{ scale: `${pop}` }}>
            <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke={C.cream} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: text, fontWeight: 600, fontSize: 52, color: done ? C.ink2 : C.ink }}>{name}</div>
        <Tachon width={name.length * 30 + 30} height={38} stroke={10} variant={(i % 3) as 0 | 1 | 2} progress={interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) })} style={{ left: -12, top: 20 }} />
        <div style={{ fontFamily: text, fontSize: 32, color: C.ink3, marginTop: 2 }}>{meta}</div>
      </div>
    </div>
  );
};

export const REEL2_FRAMES = 240;
export const ReelTachar: React.FC = () => {
  const f = useCurrentFrame();
  const n = SITIOS.filter((_, i) => f >= FIRST + i * STEP).length;
  const end = interpolate(f, [178, 192], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side, opacity: 1 - end }}>
        <Label>Vuestra lista de pendientes</Label>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: 14 }}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 200, lineHeight: 0.85, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>{n}</div>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 60, color: C.ink3, paddingBottom: 14 }}>/ 6 tachados</div>
        </div>
        <div style={{ marginTop: 40 }}>
          {SITIOS.map((_, i) => (
            <Fila key={i} i={i} />
          ))}
        </div>
      </div>
      <AbsoluteFill style={{ background: C.ink, opacity: end, justifyContent: "center", padding: `0 ${SAFE.side}px` }}>
        {["Quedáis.", "Vais.", "Tacháis."].map((w, i) => (
          <div
            key={w}
            style={{
              fontFamily: display,
              fontWeight: 800,
              fontSize: 220,
              lineHeight: 0.92,
              letterSpacing: "-0.045em",
              color: i === 2 ? C.accent : C.cream,
              opacity: interpolate(f, [186 + i * 6, 190 + i * 6], [0, 1], clamp),
              translate: `0px ${interpolate(f, [186 + i * 6, 196 + i * 6], [40, 0], { ...clamp, easing: ease })}px`,
            }}
          >
            {w}
          </div>
        ))}
        <div style={{ marginTop: 50, opacity: interpolate(f, [206, 214], [0, 1], clamp) }}>
          <Logo size={70} font={display} color={C.cream} progress={interpolate(f, [208, 222], [0, 1], clamp)} />
        </div>
      </AbsoluteFill>
      <Grain id="r2" opacity={0.07} />
    </AbsoluteFill>
  );
};

// ——— Reel 3 · «5 retos para tu grupo» (13 s) ———
const RETOS: [string, string, string][] = [
  ["Las mejores bravas del barrio", "Diez bares, una lista, un veredicto.", CAT.comer],
  ["Un vermut en cada barrio", "De domingo en domingo.", CAT.vermut],
  ["Todas las salas pequeñas antes del verano", "Conciertos de aforo mini.", CAT.bailar],
  ["Brunch cada domingo de enero", "Cero excusas.", CAT.cafe],
  ["La ciudad entera antes de que acabe el año", "El reto grande.", CAT.copas],
];
const R3_INTRO = 60;
const R3_EACH = 54;
const R3_OUTRO = 72;
export const REEL3_FRAMES = R3_INTRO + RETOS.length * R3_EACH + R3_OUTRO;

const Reto: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const [t, s, c] = RETOS[i];
  const dark = i % 2 === 0;
  return (
    <AbsoluteFill style={{ background: dark ? C.ink : C.bg, color: dark ? C.cream : C.ink }}>
      <div style={{ position: "absolute", top: 560, left: SAFE.side, right: SAFE.side }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ width: 34, height: 34, borderRadius: 34, border: `6px solid ${c}` }} />
          <Label color={dark ? C.creamDim : C.ink2}>Reto {i + 1} de 5</Label>
        </div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 800,
            fontSize: 128,
            lineHeight: 0.94,
            letterSpacing: "-0.04em",
            marginTop: 34,
            textWrap: "balance",
            translate: `0px ${interpolate(f, [0, 12], [50, 0], { ...clamp, easing: ease })}px`,
            opacity: interpolate(f, [0, 5], [0, 1], clamp),
          }}
        >
          {t}
        </div>
        <div style={{ fontFamily: text, fontSize: 44, color: dark ? C.creamDim : C.ink2, marginTop: 30, opacity: interpolate(f, [10, 16], [0, 1], clamp) }}>{s}</div>
      </div>
      <Grain id={`r3-${i}`} opacity={dark ? 0.1 : 0.06} />
    </AbsoluteFill>
  );
};

export const ReelIdeas: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence name="Intro" durationInFrames={R3_INTRO}>
        <IdeasIntro />
      </Sequence>
      {RETOS.map((_, i) => (
        <Sequence key={i} name={`Reto ${i + 1}`} from={R3_INTRO + i * R3_EACH} durationInFrames={R3_EACH}>
          <Reto i={i} />
        </Sequence>
      ))}
      <Sequence name="Cierre" from={R3_INTRO + RETOS.length * R3_EACH} durationInFrames={R3_OUTRO}>
        <IdeasOutro />
      </Sequence>
    </AbsoluteFill>
  );
};

const IdeasIntro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: 520, left: SAFE.side, right: SAFE.side }}>
        <Label>Ideas para tu grupo</Label>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 170, lineHeight: 0.92, letterSpacing: "-0.045em", marginTop: 30 }}>
          5 retos para
          <br />
          <span style={{ position: "relative", display: "inline-block" }}>
            tu grupo.
            <Tachon width={560} height={60} stroke={16} progress={interpolate(f, [16, 34], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) })} style={{ left: -20, top: 150 }} />
          </span>
        </div>
      </div>
      <Grain id="r3i" />
    </AbsoluteFill>
  );
};

const IdeasOutro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
      <div style={{ position: "absolute", top: 520, left: SAFE.side, right: SAFE.side }}>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 150, lineHeight: 0.92, letterSpacing: "-0.045em", opacity: interpolate(f, [0, 6], [0, 1], clamp) }}>
          ¿Cuál es el <span style={{ color: C.accent }}>vuestro?</span>
        </div>
        <div style={{ fontFamily: text, fontSize: 44, lineHeight: 1.3, color: C.creamDim, marginTop: 40, opacity: interpolate(f, [12, 18], [0, 1], clamp) }}>
          Estamos en beta. Pide vuestro Tour: enlace en la bio.
        </div>
        <div style={{ marginTop: 60, opacity: interpolate(f, [20, 26], [0, 1], clamp) }}>
          <Logo size={80} font={display} color={C.cream} progress={interpolate(f, [22, 36], [0, 1], clamp)} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 28, letterSpacing: "0.1em", textTransform: "uppercase", color: C.creamDim, marginTop: 30, opacity: interpolate(f, [26, 32], [0, 1], clamp) }}>
          Listas de sitios con tu gente
        </div>
      </div>
      <Grain id="r3o" opacity={0.1} />
    </AbsoluteFill>
  );
};
