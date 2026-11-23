import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { Hook } from "./scenes/Hook";
import { Problema } from "./scenes/Problema";
import { Marca } from "./scenes/Marca";
import { PasoDado, PasoLista, PasoQuedada, PasoTachar } from "./scenes/Pasos";
import { CTA, Panel } from "./scenes/Cierre";

// Duraciones en fotogramas a 30 fps. Los cortes entre la parte 1, 2 y 3 caen
// en límites de escena para poder trocear el vídeo en tres stories.
export const D = {
  hook: 105,
  problema: 105,
  marca: 84,
  lista: 96,
  quedada: 96,
  tachar: 111,
  dado: 81,
  panel: 90,
  cta: 120,
  t: 9, // transición entre pasos
};

export const TOTAL =
  D.hook + D.problema + D.marca + D.lista + D.quedada + D.tachar + D.dado + D.panel + D.cta - 3 * D.t;

export const TGWFStories: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Gancho: el chat" durationInFrames={D.hook}>
      <Hook />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="Problema: la lista crece" durationInFrames={D.problema}>
      <Problema />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="Marca" durationInFrames={D.marca}>
      <Marca />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="Paso 1: lista" durationInFrames={D.lista}>
      <PasoLista />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: D.t })} />
    <TransitionSeries.Sequence name="Paso 2: quedada" durationInFrames={D.quedada}>
      <PasoQuedada />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: D.t })} />
    <TransitionSeries.Sequence name="Paso 3: tachar" durationInFrames={D.tachar}>
      <PasoTachar />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: D.t })} />
    <TransitionSeries.Sequence name="Extra: sitio al azar" durationInFrames={D.dado}>
      <PasoDado />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="Panel" durationInFrames={D.panel}>
      <Panel />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="Cierre" durationInFrames={D.cta}>
      <CTA />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
