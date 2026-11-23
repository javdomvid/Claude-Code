import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, PERSON, SAFE, display, mono, text } from "../brand";
import { Avatar, Grain, Label } from "../components/Bits";

type Who = keyof typeof PERSON;
type Msg = { who: Who; body: string; at: number; link?: boolean };

// El chat del grupo: "tenemos que ir" y nadie va. El gancho de los primeros 3 s.
const MSGS: Msg[] = [
  { who: "NF", body: "mira este sitio", at: 0, link: true },
  { who: "VS", body: "TENEMOS QUE IR", at: 14 },
  { who: "LM", body: "apuntadísimo", at: 25 },
  { who: "NF", body: "¿este finde?", at: 33 },
  { who: "VS", body: "uf, este no puedo", at: 41 },
  { who: "LM", body: "¡el que viene!", at: 48 },
  { who: "AP", body: "¿al final fuimos?", at: 80 },
];

const Bubble: React.FC<{ m: Msg; dim: boolean }> = ({ m, dim }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const me = m.who === "LM";
  // El primer mensaje ya está en pantalla en el fotograma 0 (miniatura de la story)
  const pop = m.at === 0 ? 1 : spring({ frame: frame - m.at, fps, config: { damping: 14, stiffness: 220 } });
  if (frame < m.at) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: me ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 16,
        opacity: dim ? interpolate(frame, [62, 72], [1, 0.32], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
        scale: interpolate(pop, [0, 1], [0.82, 1]),
        translate: `0px ${interpolate(pop, [0, 1], [24, 0])}px`,
        transformOrigin: me ? "right bottom" : "left bottom",
      }}
    >
      {!me && <Avatar who={m.who} size={58} />}
      <div
        style={{
          maxWidth: 640,
          background: me ? C.ink : C.surface,
          color: me ? C.cream : C.ink,
          borderRadius: 34,
          borderBottomLeftRadius: me ? 34 : 8,
          borderBottomRightRadius: me ? 8 : 34,
          padding: m.link ? 14 : "20px 30px",
          fontFamily: text,
          fontSize: 40,
          fontWeight: m.body === m.body.toUpperCase() && m.body.length > 4 ? 600 : 400,
          lineHeight: 1.25,
          boxShadow: me ? "none" : "0 1px 0 rgba(21,19,15,.05), 0 10px 24px -14px rgba(21,19,15,.3)",
        }}
      >
        {!me && (
          <div style={{ fontSize: 26, fontWeight: 600, color: PERSON[m.who].color, padding: m.link ? "6px 16px 10px" : "0 0 4px" }}>
            {PERSON[m.who].name}
          </div>
        )}
        {m.link ? (
          <>
            <div
              style={{
                width: 520,
                borderRadius: 22,
                background: C.surface2,
                padding: "26px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: "0.1em", color: C.ink3, textTransform: "uppercase" }}>
                Tapas · Gràcia
              </div>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 46, letterSpacing: "-0.02em" }}>Bodega La Tachuela</div>
              <div style={{ fontSize: 28, color: C.ink2 }}>Las bravas se piden nada más sentarse.</div>
            </div>
            <div style={{ padding: "14px 16px 6px" }}>{m.body}</div>
          </>
        ) : (
          m.body
        )}
      </div>
    </div>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Titular visible desde el primer fotograma */}
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side }}>
        <Label>Grupo · Los de siempre</Label>
        <div
          style={{
            fontFamily: display,
            fontWeight: 800,
            fontSize: 132,
            lineHeight: 0.92,
            letterSpacing: "-0.035em",
            color: C.ink,
            marginTop: 18,
          }}
        >
          «Tenemos
          <br />
          que ir».
        </div>
      </div>

      {/* El chat crece desde abajo, como en el móvil: lo más viejo sube y se pierde */}
      <div
        style={{
          position: "absolute",
          top: 610,
          bottom: 1920 - SAFE.bottom,
          left: SAFE.side - 10,
          right: SAFE.side - 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 18,
          overflow: "hidden",
          maskImage: "linear-gradient(to bottom, transparent 0px, black 140px)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 140px)",
        }}
      >
        {MSGS.slice(0, 6).map((m, i) => (
          <Bubble key={i} m={m} dim />
        ))}
        {/* Sello "3 meses después" */}
        {frame >= 66 && (
          <div
            style={{
              alignSelf: "center",
              fontFamily: mono,
              fontSize: 30,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.cream,
              background: C.accent,
              padding: "12px 26px",
              borderRadius: 999,
              rotate: "-3deg",
              scale: interpolate(frame, [66, 72], [1.4, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                output: "perceptual-scale",
              }),
            }}
          >
            3 meses después
          </div>
        )}
        <Bubble m={MSGS[6]} dim={false} />
      </div>
      <Grain id="g-hook" />
    </AbsoluteFill>
  );
};
