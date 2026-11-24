import React from "react";
import { AbsoluteFill } from "remotion";
import { C, CAT, display, mono, text } from "../brand";
import { Grain, Label, Phone } from "../components/Bits";
import { Logo } from "../components/Tachon";
import { BETA_URL } from "../scenes/Beta";

// Kit de lanzamiento de la cuenta de Instagram de TGWF: foto de perfil,
// portadas de destacadas y la parrilla inicial (4:5, 1080×1350). Lo importante
// va dentro del 3:4 central (1012 px de ancho), que es lo que enseña la parrilla.

const W = 1080;
const H = 1350;
const P = 96;

const Big: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = C.ink, children, style }) => (
  <div style={{ fontFamily: display, fontWeight: 800, fontSize: size, lineHeight: 0.93, letterSpacing: "-0.04em", color, textWrap: "balance", ...style }}>{children}</div>
);

// Tachón que se ajusta al ancho del texto (el trazo no se deforma)
const Struck: React.FC<{ children: React.ReactNode; size: number; variant?: 0 | 1 | 2 }> = ({ children, size, variant = 0 }) => {
  const d = ["M 0 74 C 160 40, 300 78, 500 56 S 800 22, 1000 40", "M 0 55 C 200 25, 380 80, 580 50 S 860 30, 1000 55", "M 0 62 C 250 82, 450 28, 660 46 S 900 62, 1000 36"][variant];
  return (
    <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
      {children}
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ position: "absolute", left: -size * 0.08, width: `calc(100% + ${size * 0.16}px)`, top: size * 0.26, height: size * 0.6, overflow: "visible" }}>
        <path d={d} fill="none" stroke={C.accent} strokeWidth={size * 0.15} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
};

const Foot: React.FC<{ dark?: boolean; right?: string }> = ({ dark, right = "Listas de sitios con tu gente" }) => (
  <div style={{ position: "absolute", left: P, right: P, bottom: 80, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Logo size={52} font={display} progress={1} color={dark ? C.cream : C.ink} />
    <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: "0.06em", color: dark ? C.creamDim : C.ink3 }}>{right}</div>
  </div>
);

const Dark: React.FC<{ children: React.ReactNode; id: string }> = ({ children, id }) => (
  <AbsoluteFill style={{ background: C.ink, color: C.cream, overflow: "hidden" }}>
    {children}
    <Grain id={id} opacity={0.1} />
  </AbsoluteFill>
);
const Cream: React.FC<{ children: React.ReactNode; id: string; bg?: string }> = ({ children, id, bg = C.bg }) => (
  <AbsoluteFill style={{ background: bg, color: C.ink, overflow: "hidden" }}>
    {children}
    <Grain id={id} />
  </AbsoluteFill>
);

// ——— Perfil ———

const FotoPerfil: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    {/* El icono de la app, centrado para el recorte redondo de Instagram */}
    <svg viewBox="0 0 100 100" style={{ position: "absolute", left: 140, top: 140, width: 800, height: 800 }}>
      <path d="M45 20v42c0 10 5 15 14 15h7" fill="none" stroke={C.cream} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 46c13-5 25 3 38-2s17-6 25-4" fill="none" stroke={C.accent} strokeWidth={9} strokeLinecap="round" />
    </svg>
  </AbsoluteFill>
);

const Destacada: React.FC<{ label: string; dark?: boolean; mark?: "wave" | "pill" | "num" | "q" }> = ({ label, dark, mark = "wave" }) => {
  const ink = dark ? C.cream : C.ink;
  return (
    <AbsoluteFill style={{ background: dark ? C.ink : C.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        {mark === "pill" && (
          <span style={{ fontFamily: mono, fontSize: 64, letterSpacing: "0.12em", textTransform: "uppercase", background: dark ? C.cream : C.ink, color: dark ? C.ink : C.cream, padding: "22px 44px", borderRadius: 999 }}>
            Beta
          </span>
        )}
        {mark === "num" && <div style={{ fontFamily: display, fontWeight: 800, fontSize: 150, letterSpacing: "-0.04em", color: ink }}>1·2·3</div>}
        {mark === "q" && <div style={{ fontFamily: display, fontWeight: 800, fontSize: 230, lineHeight: 0.8, color: C.accent }}>¿?</div>}
        {mark === "wave" && (
          // Subrayado con el trazo de la marca (tachar el título se leería como «no»)
          <div style={{ position: "relative", fontFamily: display, fontWeight: 800, fontSize: 150, letterSpacing: "-0.04em", color: ink }}>
            {label}
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ position: "absolute", left: "-4%", width: "108%", top: 150, height: 60, overflow: "visible" }}>
              <path d="M 0 60 C 160 30, 300 75, 500 50 S 800 20, 1000 40" fill="none" stroke={C.accent} strokeWidth={22} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        )}
        {mark !== "wave" && <div style={{ fontFamily: display, fontWeight: 700, fontSize: 84, letterSpacing: "-0.03em", color: ink }}>{label}</div>}
      </div>
    </AbsoluteFill>
  );
};

// ——— Parrilla (orden de publicación: P1 el primero) ———

// P1 · Manifiesto
const P1: React.FC = () => (
  <Dark id="ig1">
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <Label color={C.creamDim}>Manifiesto</Label>
      <Big size={150} color={C.cream} style={{ marginTop: 60 }}>
        <Struck size={150}>Tenemos</Struck>
        <br />
        <Struck size={150} variant={1}>que ir.</Struck>
      </Big>
      <Big size={210} color={C.accent} style={{ marginTop: 70 }}>
        Fuimos.
      </Big>
      <div style={{ fontFamily: text, fontSize: 38, lineHeight: 1.35, color: C.creamDim, marginTop: 44, maxWidth: 820 }}>
        TGWF es la lista de sitios que compartes con tu gente. Lo que pisáis juntos, se tacha.
      </div>
    </div>
    <Foot dark />
  </Dark>
);

// P3 · Quedadas
const P3: React.FC = () => (
  <Dark id="ig3">
    <div style={{ position: "absolute", top: P, left: P, width: 470 }}>
      <Label color={C.creamDim}>Quedadas</Label>
      <Big size={92} color={C.cream} style={{ marginTop: 28 }}>
        Qué día, quién vino y qué tachasteis.
      </Big>
      <div style={{ fontFamily: text, fontSize: 34, lineHeight: 1.35, color: C.creamDim, marginTop: 28 }}>
        Cada vez que quedáis, se apunta. La lista, el mapa y el historial, al día para todos.
      </div>
    </div>
    <Phone src="capturas/08-nueva-quedada.png" width={400} style={{ top: 160, right: 44, rotate: "4deg" }} />
    <Foot dark />
  </Dark>
);

// P4 · Ideas de Tour (portada del carrusel + 6 láminas)
const RETOS: [string, string, string][] = [
  ["Las mejores bravas del barrio", "Diez bares, una lista y un veredicto.", CAT.comer],
  ["Un vermut en cada barrio", "De domingo en domingo hasta completar el mapa.", CAT.vermut],
  ["Todas las salas pequeñas antes del verano", "Conciertos de aforo mini, con quien se apunte.", CAT.bailar],
  ["Brunch cada domingo de enero", "Cuatro domingos, cuatro sitios, cero excusas.", CAT.cafe],
  ["La ciudad entera antes de que acabe el año", "El reto grande: todo lo que tenéis pendiente.", CAT.copas],
];

const P4: React.FC = () => (
  <Cream id="ig4">
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <Label>Ideas para tu grupo</Label>
      <Big size={128} style={{ marginTop: 28 }}>
        5 retos de quedadas para empezar.
      </Big>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 56 }}>
        {RETOS.map(([t, , c], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: text, fontSize: 34, color: C.ink2 }}>
            <span style={{ width: 22, height: 22, borderRadius: 22, border: `4px solid ${c}`, flex: "none" }} />
            <span style={{ fontFamily: mono, fontSize: 26, color: C.ink3 }}>{i + 1}</span>
            {t}
          </div>
        ))}
      </div>
    </div>
    <Foot right="Desliza" />
  </Cream>
);

const RetoSlide: React.FC<{ i: number }> = ({ i }) => {
  const [t, s, c] = RETOS[i];
  const dark = i % 2 === 0;
  const Wrap = dark ? Dark : Cream;
  return (
    <Wrap id={`igr${i}`}>
      <div style={{ position: "absolute", top: P, left: P, right: P }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 30, height: 30, borderRadius: 30, border: `5px solid ${c}` }} />
          <Label color={dark ? C.creamDim : C.ink2}>Reto {i + 1} de 5</Label>
        </div>
        <Big size={118} color={dark ? C.cream : C.ink} style={{ marginTop: 50 }}>
          {t}
        </Big>
        <div style={{ fontFamily: text, fontSize: 42, lineHeight: 1.3, color: dark ? C.creamDim : C.ink2, marginTop: 36 }}>{s}</div>
      </div>
      <Foot dark={dark} right={`${i + 1} / 5`} />
    </Wrap>
  );
};

const RetoFin: React.FC = () => (
  <Dark id="igrf">
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <Label color={C.creamDim}>Tu turno</Label>
      <Big size={140} color={C.cream} style={{ marginTop: 40 }}>
        ¿Cuál sería el <span style={{ color: C.accent }}>vuestro?</span>
      </Big>
      <div style={{ fontFamily: text, fontSize: 40, lineHeight: 1.35, color: C.creamDim, marginTop: 40 }}>
        Estamos en beta: pide vuestro Tour y lo creamos por orden de llegada.
      </div>
      <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 40, marginTop: 30 }}>{BETA_URL}</div>
    </div>
    <Foot dark right="Enlace en la bio" />
  </Dark>
);

// P5 · Sitio al azar
const P5: React.FC = () => (
  <Dark id="ig5">
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <Label color={C.creamDim}>Sitio al azar</Label>
      <Big size={120} color={C.cream} style={{ marginTop: 28 }}>
        ¿No os ponéis de acuerdo?
      </Big>
      <div style={{ background: C.surface, color: C.ink, borderRadius: 44, padding: "40px 44px", marginTop: 56 }}>
        <Label size={24} color={C.ink3}>
          Copas · Pub
        </Label>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 120, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 10 }}>Clip</div>
        <div style={{ fontFamily: text, fontSize: 32, color: C.ink2, marginTop: 4 }}>Eixample · pendiente</div>
        <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
          <div style={{ flex: 1, textAlign: "center", fontFamily: text, fontWeight: 600, fontSize: 32, border: `3px solid ${C.ink}`, borderRadius: 999, padding: "18px 0" }}>Otro</div>
          <div style={{ flex: 1.4, textAlign: "center", fontFamily: text, fontWeight: 600, fontSize: 32, color: "#fff", background: C.accent, borderRadius: 999, padding: "21px 0" }}>Tachar</div>
        </div>
      </div>
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 56, letterSpacing: "-0.03em", color: C.cream, marginTop: 44 }}>Que decida la app.</div>
    </div>
    <Foot dark />
  </Dark>
);

// P6 · Frase
const P6: React.FC = () => (
  <Cream id="ig6">
    <div style={{ position: "absolute", top: 230, left: P, right: P }}>
      <Big size={168}>
        «A ver si quedamos»
        <br />
        <span style={{ color: C.accent }}>no es un plan.</span>
      </Big>
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 64, letterSpacing: "-0.03em", color: C.ink2, marginTop: 60 }}>Un Tour, sí.</div>
    </div>
    <Foot />
  </Cream>
);

// P7 · Días sin quedar
const P7: React.FC = () => (
  <Dark id="ig7">
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <Label color={C.creamDim}>Tu panel</Label>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 40 }}>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 420, lineHeight: 0.8, letterSpacing: "-0.06em", color: C.accent }}>3</div>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.035em", paddingBottom: 18 }}>
          días
          <br />
          sin quedar
        </div>
      </div>
      <div style={{ fontFamily: text, fontSize: 40, lineHeight: 1.35, color: C.creamDim, marginTop: 60, maxWidth: 860 }}>
        TGWF lleva la cuenta: cuántos sitios lleváis tachados, cuántas quedadas y cuánto hace de la última. Para que no se os pase.
      </div>
    </div>
    <Foot dark />
  </Dark>
);

// P8 · Lista tachada
const P8: React.FC = () => {
  const rows: [string, string, boolean, 0 | 1 | 2][] = [
    ["Bodega La Tachuela", CAT.comer, true, 0],
    ["Café Borrador", CAT.cafe, true, 1],
    ["Sala Fosforito", CAT.bailar, true, 2],
    ["Casa Margen", CAT.comer, false, 0],
  ];
  return (
    <Cream id="ig8">
      <div style={{ position: "absolute", top: P, left: P, right: P }}>
        <Label>Lola × Nico × Vera</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 50 }}>
          {rows.map(([n, c, done, v]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 54, height: 54, borderRadius: 54, border: `5px solid ${done ? C.ink : c}`, background: done ? C.ink : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                {done && (
                  <svg width={30} height={30} viewBox="0 0 24 24">
                    <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke={C.cream} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div style={{ fontFamily: display, fontWeight: 800, fontSize: 78, letterSpacing: "-0.04em", lineHeight: 1.2, color: done ? C.ink2 : C.ink }}>
                {done ? (
                  <Struck size={78} variant={v}>
                    {n}
                  </Struck>
                ) : (
                  n
                )}
              </div>
            </div>
          ))}
        </div>
        <Big size={96} style={{ marginTop: 80 }}>
          Tres tachados. Uno pendiente. <span style={{ color: C.accent }}>¿Este finde?</span>
        </Big>
      </div>
      <Foot right="Datos de ejemplo" />
    </Cream>
  );
};

// P9 · Beta (para fijar arriba)
const P9: React.FC = () => (
  <Dark id="ig9">
    <div style={{ position: "absolute", top: P, left: P, right: P }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Logo size={78} font={display} progress={1} color={C.cream} />
        <span style={{ fontFamily: mono, fontSize: 28, letterSpacing: "0.12em", textTransform: "uppercase", background: C.cream, color: C.ink, padding: "11px 21px", borderRadius: 999 }}>Beta</span>
      </div>
      <Big size={176} color={C.cream} style={{ marginTop: 90 }}>
        Pide tu
        <br />
        <span style={{ color: C.accent }}>Tour.</span>
      </Big>
      <div style={{ fontFamily: text, fontSize: 42, lineHeight: 1.32, color: C.creamDim, marginTop: 44 }}>
        Estamos en beta y abrimos poco a poco. Rellena el formulario y lo creamos por orden de llegada.
      </div>
      <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 38, marginTop: 30 }}>{BETA_URL}</div>
    </div>
    <Foot dark right="Enlace en la bio" />
  </Dark>
);

// P10–P12 · Fila del logo: un lienzo de 3 posts de ancho que se corta en tres.
// Se publican de derecha a izquierda (P10 la derecha) para que queden en orden.
const LogoRow: React.FC<{ part: 0 | 1 | 2 }> = ({ part }) => (
  <Cream id={`igl${part}`}>
    <div style={{ position: "absolute", top: 0, left: -part * W, width: W * 3, height: H }}>
      <div style={{ position: "absolute", left: 150, top: 120 }}>
        <Label size={34}>To go with friends…</Label>
      </div>
      <div style={{ position: "absolute", left: 170, top: 300 }}>
        <Logo size={1040} font={display} progress={1} />
      </div>
      <div style={{ position: "absolute", right: 150, bottom: 110, fontFamily: display, fontWeight: 500, fontStyle: "italic", fontSize: 64, color: C.ink3 }}>…or somebody else.</div>
    </div>
  </Cream>
);

// ——— Portadas de reels (9:16; la parrilla enseña el 3:4 central) ———
const PortadaReel: React.FC<{ dark?: boolean; eyebrow: string; title: React.ReactNode }> = ({ dark, eyebrow, title }) => {
  const Wrap = dark ? Dark : Cream;
  return (
    <Wrap id={`pr${eyebrow.length}`}>
      <div style={{ position: "absolute", top: 520, left: 110, right: 110 }}>
        <Label color={dark ? C.creamDim : C.ink2}>{eyebrow}</Label>
        <Big size={150} color={dark ? C.cream : C.ink} style={{ marginTop: 30 }}>
          {title}
        </Big>
      </div>
      <div style={{ position: "absolute", left: 110, bottom: 520 }}>
        <Logo size={64} font={display} progress={1} color={dark ? C.cream : C.ink} />
      </div>
    </Wrap>
  );
};

export const IG_STILLS: { id: string; component: React.FC; width: number; height: number }[] = [
  { id: "IG-perfil", component: FotoPerfil, width: 1080, height: 1080 },
  { id: "IG-destacada-que-es", component: () => <Destacada label="Qué es" mark="wave" />, width: 1080, height: 1920 },
  { id: "IG-destacada-como-va", component: () => <Destacada label="Cómo va" mark="num" dark />, width: 1080, height: 1920 },
  { id: "IG-destacada-beta", component: () => <Destacada label="Pide tu Tour" mark="pill" />, width: 1080, height: 1920 },
  { id: "IG-destacada-ideas", component: () => <Destacada label="Ideas" mark="wave" dark />, width: 1080, height: 1920 },
  { id: "IG-destacada-dudas", component: () => <Destacada label="Dudas" mark="q" />, width: 1080, height: 1920 },
  { id: "IG-P01-manifiesto", component: P1, width: W, height: H },
  { id: "IG-P03-quedadas", component: P3, width: W, height: H },
  { id: "IG-P04-ideas-0-portada", component: P4, width: W, height: H },
  ...RETOS.map((_, i) => ({ id: `IG-P04-ideas-${i + 1}`, component: () => <RetoSlide i={i} />, width: W, height: H })),
  { id: "IG-P04-ideas-6-final", component: RetoFin, width: W, height: H },
  { id: "IG-P05-al-azar", component: P5, width: W, height: H },
  { id: "IG-P06-a-ver-si-quedamos", component: P6, width: W, height: H },
  { id: "IG-P07-dias-sin-quedar", component: P7, width: W, height: H },
  { id: "IG-P08-lista-tachada", component: P8, width: W, height: H },
  { id: "IG-P09-beta", component: P9, width: W, height: H },
  { id: "IG-P10-logo-derecha", component: () => <LogoRow part={2} />, width: W, height: H },
  { id: "IG-P11-logo-centro", component: () => <LogoRow part={1} />, width: W, height: H },
  { id: "IG-P12-logo-izquierda", component: () => <LogoRow part={0} />, width: W, height: H },
  { id: "IG-portada-reel-1", component: () => <PortadaReel eyebrow="Reel" title={<>«Tenemos que ir.»</>} />, width: 1080, height: 1920 },
  { id: "IG-portada-reel-2", component: () => <PortadaReel dark eyebrow="Reel" title={<>Tachar sienta <span style={{ color: C.accent }}>así</span> de bien.</>} />, width: 1080, height: 1920 },
  { id: "IG-portada-reel-3", component: () => <PortadaReel eyebrow="Reel" title={<>5 retos para tu grupo.</>} />, width: 1080, height: 1920 },
];
