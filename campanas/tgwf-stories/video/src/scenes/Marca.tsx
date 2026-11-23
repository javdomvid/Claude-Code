import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, SAFE, display } from "../brand";
import { Grain, Label } from "../components/Bits";
import { Logo } from "../components/Tachon";

// Aparece la marca y el tachón la cruza, igual que en og.png
export const Marca: React.FC = () => {
  const frame = useCurrentFrame();
  const full = "To go with friends…";
  const typed = Math.round(interpolate(frame, [28, 50], [0, full.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side }}>
        <Label>Os presentamos</Label>
      </div>
      <div
        style={{
          position: "absolute",
          top: 560,
          left: SAFE.side - 6,
          scale: interpolate(frame, [0, 10], [1.12, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
          transformOrigin: "left center",
          opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <Logo
          size={318}
          font={display}
          progress={interpolate(frame, [10, 26], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.65, 0, 0.35, 1),
          })}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1010,
          left: SAFE.side,
          right: SAFE.side,
          fontFamily: display,
          fontWeight: 700,
          fontSize: 92,
          letterSpacing: "-0.03em",
          color: C.ink2,
          lineHeight: 1,
        }}
      >
        {full.slice(0, typed)}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1130,
          left: SAFE.side + 150,
          fontFamily: display,
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: 64,
          letterSpacing: "-0.02em",
          color: C.ink3,
          opacity: interpolate(frame, [56, 64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: `${interpolate(frame, [56, 66], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px 0px`,
        }}
      >
        …or somebody else.
      </div>
      <div
        style={{
          position: "absolute",
          top: 1400,
          left: SAFE.side,
          right: SAFE.side,
          fontFamily: display,
          fontWeight: 700,
          fontSize: 58,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: C.ink,
          opacity: interpolate(frame, [44, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Listas de sitios con tu gente.
      </div>
      <Grain id="g-marca" />
    </AbsoluteFill>
  );
};
