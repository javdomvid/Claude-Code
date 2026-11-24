import React from "react";
import { C } from "../brand";

// El tachón ondulado de TGWF: el mismo gesto que cruza el logo y el icono.
// progress va de 0 (sin trazo) a 1 (trazo completo).
export const Tachon: React.FC<{
  width: number;
  height?: number;
  progress: number;
  color?: string;
  stroke?: number;
  style?: React.CSSProperties;
  variant?: 0 | 1 | 2;
}> = ({ width, height = 70, progress, color = C.accent, stroke = 18, style, variant = 0 }) => {
  const w = width;
  const h = height;
  const s = stroke / 2;
  const paths = [
    `M ${s} ${h * 0.74} C ${w * 0.16} ${h * 0.4}, ${w * 0.3} ${h * 0.78}, ${w * 0.5} ${h * 0.56} S ${w * 0.8} ${h * 0.22}, ${w - s} ${h * 0.4}`,
    `M ${s} ${h * 0.55} C ${w * 0.2} ${h * 0.25}, ${w * 0.38} ${h * 0.8}, ${w * 0.58} ${h * 0.5} S ${w * 0.86} ${h * 0.3}, ${w - s} ${h * 0.55}`,
    `M ${s} ${h * 0.62} C ${w * 0.25} ${h * 0.82}, ${w * 0.45} ${h * 0.28}, ${w * 0.66} ${h * 0.46} S ${w * 0.9} ${h * 0.62}, ${w - s} ${h * 0.36}`,
  ];
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", overflow: "visible", pointerEvents: "none", ...style }}
    >
      <path
        d={paths[variant]}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.max(0, Math.min(1, progress))}
      />
    </svg>
  );
};

// Logo TGWF con su tachón, como en og.png
export const Logo: React.FC<{
  size: number;
  progress: number;
  color?: string;
  strike?: string;
  font: string;
  style?: React.CSSProperties;
}> = ({ size, progress, color = C.ink, strike = C.accent, font, style }) => {
  const width = size * 2.45;
  return (
    <div style={{ position: "relative", width, height: size * 0.95, ...style }}>
      <div
        style={{
          fontFamily: font,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 0.95,
          letterSpacing: "-0.045em",
          color,
        }}
      >
        TGWF
      </div>
      <Tachon
        width={width * 1.08}
        height={size * 0.42}
        stroke={size * 0.11}
        progress={progress}
        color={strike}
        style={{ left: -width * 0.06, top: size * 0.3 }}
      />
    </div>
  );
};
