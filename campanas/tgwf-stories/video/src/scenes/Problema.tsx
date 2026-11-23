import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, CAT, SAFE, display, mono, text } from "../brand";
import { Grain, Label } from "../components/Bits";

// La lista de "tenemos que ir" crece; los planes, no.
const SITIOS: [string, string, string][] = [
  ["Casa Margen", "Arroces · Barceloneta", CAT.comer],
  ["La Grapa", "Pizza · Poblenou", CAT.comer],
  ["Miga y Tinta", "Brunch · Born", CAT.cafe],
  ["La Esquina Doblada", "Cañas y conservas · Gràcia", CAT.vermut],
  ["Clip", "Pub · Eixample", CAT.copas],
  ["Fuera de Margen", "Discoteca · Eixample", CAT.bailar],
  ["Doblez Vintage", "Ropa vintage · Raval", CAT.tiendas],
  ["El Pliego", "Asiático · Eixample", CAT.comer],
  ["Posdata", "Bar de vinilos · Raval", CAT.copas],
];

export const Problema: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.round(
    interpolate(frame, [4, 46], [0, 22], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
  );
  const phase2 = interpolate(frame, [54, 64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.ink, color: C.cream }}>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side }}>
        <Label color={C.creamDim}>Vuestra lista de «tenemos que ir»</Label>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 28, marginTop: 10 }}>
          <div
            style={{
              fontFamily: display,
              fontWeight: 800,
              fontSize: 300,
              lineHeight: 0.85,
              letterSpacing: "-0.05em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {count}
          </div>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 64, lineHeight: 1, paddingBottom: 26, color: C.creamDim }}>
            sitios
            <br />
            pendientes
          </div>
        </div>
      </div>

      {/* Lista que se apila */}
      <div
        style={{
          position: "absolute",
          top: 690,
          left: SAFE.side,
          right: SAFE.side,
          display: "flex",
          flexDirection: "column",
          opacity: interpolate(phase2, [0, 1], [1, 0.05]),
        }}
      >
        {SITIOS.map(([name, meta, color], i) => {
          const at = 6 + i * 4;
          return (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "16px 0",
                borderBottom: `1px solid ${C.creamFaint}`,
                opacity: interpolate(frame, [at, at + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                translate: `${interpolate(frame, [at, at + 8], [-40, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                })}px 0px`,
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 38, border: `4px solid ${color}`, flex: "none" }} />
              <div>
                <div style={{ fontFamily: text, fontWeight: 600, fontSize: 42, lineHeight: 1.15 }}>{name}</div>
                <div style={{ fontFamily: text, fontSize: 28, color: C.creamDim }}>{meta}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remate */}
      <div
        style={{
          position: "absolute",
          left: SAFE.side,
          right: SAFE.side,
          top: 860,
          opacity: phase2,
          translate: `0px ${interpolate(phase2, [0, 1], [40, 0])}px`,
        }}
      >
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 150, lineHeight: 0.92, letterSpacing: "-0.04em" }}>
          La lista
          <br />
          crece.
        </div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            color: C.accent,
            marginTop: 24,
            opacity: interpolate(frame, [70, 76], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          Los planes,
          <br />
          no.
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 32,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.creamDim,
            marginTop: 40,
            opacity: interpolate(frame, [80, 86], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          Quedadas este trimestre: 0
        </div>
      </div>
      <Grain id="g-prob" opacity={0.1} />
    </AbsoluteFill>
  );
};
