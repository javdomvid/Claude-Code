import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, PERSON, SAFE, display, mono, text } from "../brand";
import { Avatar, Grain, Label } from "../components/Bits";
import { Logo } from "../components/Tachon";

// Story especial: "estamos en beta, pide tu Tour en el formulario y lo
// creamos por orden de llegada". Cuatro escenas, 13 s.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const BETA_URL = "javdomvid.com/tgwfapp/beta";

const In: React.FC<{ at: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties }> = ({ at, children, dy = 40, style }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(f, [at, at + 6], [0, 1], clamp),
        translate: `0px ${interpolate(f, [at, at + 12], [dy, 0], { ...clamp, easing: ease })}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Pill: React.FC<{ dark?: boolean; size?: number }> = ({ dark, size = 34 }) => (
  <span
    style={{
      fontFamily: mono,
      fontSize: size,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      background: dark ? C.cream : C.ink,
      color: dark ? C.ink : C.cream,
      padding: `${size * 0.4}px ${size * 0.75}px`,
      borderRadius: 999,
    }}
  >
    Beta
  </span>
);

// 1 · TGWF está en beta
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - 16, fps, config: { damping: 11, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side }}>
        <Label>Aviso para grupos con planes pendientes</Label>
      </div>
      <div style={{ position: "absolute", top: 560, left: SAFE.side - 6 }}>
        <Logo size={300} font={display} progress={interpolate(f, [4, 18], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) })} />
      </div>
      <div style={{ position: "absolute", top: 940, left: SAFE.side, right: SAFE.side, display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 132, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.ink }}>
          está en
        </div>
        {/* Visible desde el fotograma 0 (miniatura): solo da un respingo cuando el tachón termina */}
        <div style={{ scale: interpolate(pop, [0, 0.5, 1], [1, 1.12, 1]), rotate: "-4deg" }}>
          <Pill size={52} />
        </div>
      </div>
      <In at={30} style={{ position: "absolute", top: 1170, left: SAFE.side, right: SAFE.side }}>
        <div style={{ fontFamily: text, fontSize: 44, lineHeight: 1.3, color: C.ink2 }}>
          Listas de sitios con tu gente.
          <br />
          La abrimos poco a poco.
        </div>
      </In>
      <Grain id="b1" />
    </AbsoluteFill>
  );
};

// 2 · ¿Quieres un Tour con tus amigos? (tarjeta de Tour que se monta)
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame: f - 22, fps, config: { damping: 16, stiffness: 140 } });
  const who: (keyof typeof PERSON)[] = ["LM", "NF", "VS", "AP"];
  const names = ["Tú", "Nico", "Vera", "Álex"];
  const shown = Math.min(4, Math.max(1, Math.floor(interpolate(f, [30, 66], [1, 4.99], clamp))));
  return (
    <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side }}>
        <Label color={C.creamDim}>Un Tour es un reto de quedadas</Label>
        <In at={0}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 124, lineHeight: 0.93, letterSpacing: "-0.04em", marginTop: 16 }}>
            ¿Quieres uno con tus amigos?
          </div>
        </In>
        <In at={10}>
          <div style={{ fontFamily: text, fontSize: 42, lineHeight: 1.3, color: C.creamDim, marginTop: 24 }}>
            Vuestra lista de sitios pendientes. Quedáis, vais y tacháis.
          </div>
        </In>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1000,
          left: SAFE.side,
          right: SAFE.side,
          background: C.cream,
          color: C.ink,
          borderRadius: 64,
          padding: "46px 50px",
          translate: `0px ${interpolate(card, [0, 1], [380, 0])}px`,
          opacity: interpolate(card, [0, 0.2], [0, 1], clamp),
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Label size={26} color={C.ink3}>
            Tour · en lista de espera
          </Label>
          <div style={{ display: "flex" }}>
            {who.slice(0, shown).map((w, i) => (
              <Avatar key={w} who={w} size={62} ring={C.cream} style={{ marginLeft: i ? -16 : 0 }} />
            ))}
          </div>
        </div>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: 92, lineHeight: 1, letterSpacing: "-0.035em", marginTop: 34 }}>
          {names.slice(0, shown).join(" × ")}
        </div>
        <div style={{ fontFamily: text, fontSize: 34, color: C.ink2, marginTop: 14 }}>La ciudad entera antes del verano.</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 40 }}>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 120, lineHeight: 0.86, letterSpacing: "-0.05em" }}>0</div>
          <div style={{ fontFamily: display, fontWeight: 600, fontSize: 44, color: C.ink3, paddingBottom: 8 }}>/ 20</div>
        </div>
        <div style={{ height: 12, borderRadius: 12, background: C.surface2, marginTop: 24 }} />
      </div>
      <Grain id="b2" opacity={0.1} />
    </AbsoluteFill>
  );
};

// 3 · Rellena el formulario → por orden de llegada
const Field: React.FC<{ label: string; value: string; at: number; width?: number | string }> = ({ label, value, at, width = "100%" }) => {
  const f = useCurrentFrame();
  const typed = Math.round(interpolate(f, [at, at + 14], [0, value.length], clamp));
  return (
    <div style={{ width }}>
      <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink2, marginBottom: 10 }}>{label}</div>
      <div
        style={{
          background: C.surface,
          border: `2px solid ${f >= at && f < at + 18 ? C.ink : C.line}`,
          borderRadius: 30,
          padding: "26px 30px",
          fontFamily: text,
          fontSize: 40,
          color: C.ink,
          minHeight: 100,
        }}
      >
        {value.slice(0, typed)}
        {f >= at && f < at + 18 ? <span style={{ color: C.accent }}>|</span> : null}
      </div>
    </div>
  );
};

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const queue = spring({ frame: f - 60, fps, config: { damping: 15, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side }}>
        <Label>Así se pide</Label>
        <In at={0}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 124, lineHeight: 0.93, letterSpacing: "-0.04em", marginTop: 16 }}>
            Rellena el formulario.
          </div>
        </In>
      </div>
      <div style={{ position: "absolute", top: 620, left: SAFE.side, right: SAFE.side, display: "flex", flexDirection: "column", gap: 26 }}>
        <Field label="Tu Instagram" value="@tú" at={8} />
        <Field label="Tus amigos" value="@nico · @vera · @alex" at={22} />
        <Field label="Ciudad" value="Barcelona" at={38} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1230,
          left: SAFE.side,
          right: SAFE.side,
          opacity: interpolate(queue, [0, 0.3], [0, 1], clamp),
          translate: `0px ${interpolate(queue, [0, 1], [60, 0])}px`,
        }}
      >
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 76, lineHeight: 1, letterSpacing: "-0.035em", color: C.ink }}>
          Y lo creamos <span style={{ color: C.accent }}>por orden de llegada.</span>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
          {["nº 1", "nº 2", "nº 3", "tú"].map((t, i) => (
            <div
              key={t}
              style={{
                fontFamily: mono,
                fontSize: 30,
                letterSpacing: "0.06em",
                padding: "16px 26px",
                borderRadius: 999,
                background: i === 3 ? C.accent : C.surface2,
                color: i === 3 ? "#fff" : C.ink2,
                opacity: interpolate(f, [64 + i * 5, 68 + i * 5], [0, 1], clamp),
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
      <Grain id="b3" />
    </AbsoluteFill>
  );
};

// 4 · Llamada a la acción (franja 1240–1480 libre para el sticker de enlace)
const S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Logo size={84} font={display} color={C.cream} progress={interpolate(f, [2, 14], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) })} />
          <Pill dark size={28} />
        </div>
        <In at={4}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 190, lineHeight: 0.9, letterSpacing: "-0.045em", marginTop: 60 }}>
            Pide tu
            <br />
            <span style={{ color: C.accent }}>Tour.</span>
          </div>
        </In>
      </div>
      <In at={14} style={{ position: "absolute", top: 960, left: SAFE.side, right: SAFE.side }}>
        <Label color={C.creamDim}>Formulario de la beta</Label>
        <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 50, marginTop: 12 }}>{BETA_URL}</div>
        <div style={{ fontFamily: text, fontSize: 38, lineHeight: 1.3, color: C.creamDim, marginTop: 26 }}>Plazas por orden de llegada. Te escribimos por Instagram.</div>
      </In>
      <In at={22} style={{ position: "absolute", top: 1520, left: SAFE.side, right: SAFE.side }}>
        <div style={{ fontFamily: display, fontWeight: 500, fontStyle: "italic", fontSize: 40, color: C.creamDim }}>To go with friends… …or somebody else.</div>
      </In>
      <Grain id="b4" opacity={0.1} />
    </AbsoluteFill>
  );
};

export const BETA_D = { s1: 90, s2: 108, s3: 105, s4: 105 };
export const BETA_TOTAL = BETA_D.s1 + BETA_D.s2 + BETA_D.s3 + BETA_D.s4;

export const TGWFBeta: React.FC = () => (
  <AbsoluteFill>
    <Sequence name="Está en beta" durationInFrames={BETA_D.s1}>
      <S1 />
    </Sequence>
    <Sequence name="¿Quieres un Tour?" from={BETA_D.s1} durationInFrames={BETA_D.s2}>
      <S2 />
    </Sequence>
    <Sequence name="Rellena el formulario" from={BETA_D.s1 + BETA_D.s2} durationInFrames={BETA_D.s3}>
      <S3 />
    </Sequence>
    <Sequence name="Pide tu Tour" from={BETA_D.s1 + BETA_D.s2 + BETA_D.s3} durationInFrames={BETA_D.s4}>
      <S4 />
    </Sequence>
  </AbsoluteFill>
);
