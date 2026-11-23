import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, SAFE, display, mono, text } from "../brand";
import { Grain, Label } from "../components/Bits";
import { Logo, Tachon } from "../components/Tachon";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// El panel personal: "Hola, Lola. Te quedan 7 sitios por tachar." y el empujón
// de "días sin quedar", que es lo que hace que el grupo vuelva a quedar.
export const Panel: React.FC = () => {
  const frame = useCurrentFrame();
  const n = (to: number, a: number, b: number) => Math.round(interpolate(frame, [a, b], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const tiles: { big: React.ReactNode; label: string; hot?: boolean; at: number }[] = [
    { big: <>{n(15, 16, 34)}<span style={{ fontSize: 50, color: C.ink3 }}>/22</span></>, label: "Tachados", at: 16 },
    { big: n(8, 22, 38), label: "Quedadas", at: 22 },
    { big: <>{n(3, 28, 40)}<span style={{ fontSize: 50 }}> días</span></>, label: "Sin quedar", hot: true, at: 28 },
  ];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side }}>
        <Label>Tu panel</Label>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 128, lineHeight: 0.92, letterSpacing: "-0.04em", marginTop: 16 }}>Hola, Lola.</div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 800,
            fontSize: 112,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: C.ink3,
            marginTop: 10,
            opacity: interpolate(frame, [6, 12], [0, 1], clamp),
          }}
        >
          Te quedan{" "}
          <span style={{ color: C.ink, background: "rgba(242, 56, 15, 0.35)", padding: "0 10px" }}>7</span> sitios por tachar.
        </div>
      </div>
      <div style={{ position: "absolute", top: 900, left: SAFE.side, right: SAFE.side, display: "flex", flexDirection: "column", gap: 22 }}>
        {tiles.map((t) => (
          <div
            key={t.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: t.hot ? C.ink : C.surface,
              color: t.hot ? C.cream : C.ink,
              borderRadius: 40,
              padding: "30px 44px",
              opacity: interpolate(frame, [t.at - 4, t.at + 2], [0, 1], clamp),
              translate: `${interpolate(frame, [t.at - 4, t.at + 8], [60, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px 0px`,
            }}
          >
            <div style={{ fontFamily: display, fontWeight: 800, fontSize: 110, lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
              {t.big}
            </div>
            <div style={{ fontFamily: mono, fontSize: 30, letterSpacing: "0.12em", textTransform: "uppercase", color: t.hot ? C.accent : C.ink2 }}>{t.label}</div>
          </div>
        ))}
        <div style={{ fontFamily: text, fontSize: 40, color: C.ink2, marginTop: 10, opacity: interpolate(frame, [44, 52], [0, 1], clamp) }}>
          Sí: cuenta los días que lleváis sin quedar.
        </div>
      </div>
      <Grain id="g-panel" />
    </AbsoluteFill>
  );
};

// Cierre con la promesa y la llamada a la acción.
// Deja libre la franja 1240–1480 px para pegar el sticker de enlace de Instagram.
export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const words: [string, number, boolean][] = [
    ["Quedáis.", 0, false],
    ["Vais.", 7, false],
    ["Tacháis.", 14, true],
  ];
  return (
    <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
      <div style={{ position: "absolute", top: SAFE.top + 20, left: SAFE.side, right: SAFE.side }}>
        {words.map(([w, at, hot]) => (
          <div key={w} style={{ position: "relative", height: 196 }}>
            <div
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: 210,
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                color: hot ? C.accent : C.cream,
                opacity: interpolate(frame, [at, at + 4], [0, 1], clamp),
                translate: `0px ${interpolate(frame, [at, at + 10], [50, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
              }}
            >
              {w}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", top: 940, left: SAFE.side, right: SAFE.side, opacity: interpolate(frame, [28, 36], [0, 1], clamp) }}>
        <Label color={C.creamDim}>Estamos en beta · pide tu Tour</Label>
        <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 50, marginTop: 10 }}>javdomvid.com/tgwfapp/beta</div>
        <div style={{ fontFamily: text, fontSize: 40, lineHeight: 1.3, color: C.creamDim, marginTop: 34, maxWidth: 880 }}>
          Rellenad el formulario y os lo creamos <span style={{ color: C.cream, fontWeight: 600 }}>por orden de llegada</span>.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1500,
          left: SAFE.side,
          right: SAFE.side,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: interpolate(frame, [40, 48], [0, 1], clamp),
        }}
      >
        <Logo
          size={74}
          font={display}
          color={C.cream}
          progress={interpolate(frame, [44, 58], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) })}
        />
        <div style={{ fontFamily: display, fontWeight: 500, fontStyle: "italic", fontSize: 40, color: C.creamDim }}>…or somebody else.</div>
      </div>
      <Grain id="g-cta" opacity={0.1} />
    </AbsoluteFill>
  );
};

export { Tachon };
