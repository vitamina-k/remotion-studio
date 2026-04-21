import React from "react";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { CaptionVideo, captionVideoSchema } from "./compositions/CaptionVideo";
import { DataStory, dataStorySchema, totalFrames } from "./compositions/DataStory";
import { FootageWithOverlay, footageWithOverlaySchema } from "./compositions/FootageWithOverlay";
import { PoliticalReel, politicalReelSchema, reelTotalFrames } from "./compositions/PoliticalReel";
import { SplitReel, splitReelSchema, splitReelTotalFrames } from "./compositions/SplitReel";
import { TextReveal, textRevealSchema } from "./compositions/TextReveal";
import { SplitScreen, splitScreenSchema } from "./compositions/SplitScreen";
import { HybridReel, hybridReelSchema } from "./compositions/HybridReel";
import { CaptionsStyled, captionsStyledSchema, demoWords } from "./compositions/CaptionsStyled";
import { BRAND } from "./brand/brand";

// ─── Alvise tenía razón — Los medios mintieron (2020 vs 2026) ────────────────

const alviseMediaScenes: React.ComponentProps<typeof DataStory>['scenes'] = [
  {
    type: 'hook',
    durationFrames: 210,
    bg: 'alert' as const,
    content: {
      text: 'El Plural, 2020:\n"El enésimo bulo\nde Alvise Pérez"',
      subtext: 'Así protegían al poder. Así funcionaba el sistema.',
    },
  },
  {
    type: 'keyword',
    durationFrames: 160,
    bg: 'grid' as const,
    content: {
      text: 'Acusaron a Alvise de mentir sobre Zapatero. Lo convirtieron en el bulero por defecto de España.',
      highlight: 'bulero por defecto',
    },
  },
  {
    type: 'title',
    durationFrames: 180,
    bg: 'alert' as const,
    content: {
      text: '6 años después.\nThe Objective, 2026.',
      subtext: 'Lo que los medios nunca quisieron investigar.',
      direction: 'up' as const,
      highlightWords: ['2026'],
    },
  },
  {
    type: 'stat',
    durationFrames: 130,
    content: {
      value: '458.000€',
      label: 'cobró el testaferro de Zapatero de Plus Ultra',
      trend: 'up' as const,
    },
  },
  {
    type: 'stat',
    durationFrames: 130,
    content: {
      value: '53M€',
      label: 'rescate público que el Gobierno dio a Plus Ultra',
      trend: 'down' as const,
    },
  },
  {
    type: 'keyword',
    durationFrames: 180,
    bg: 'alert' as const,
    content: {
      text: 'No mintió Alvise. Mintieron los que le llamaron mentiroso. ¿Dónde está la rectificación?',
      highlight: 'Mintieron los que le llamaron mentiroso',
    },
  },
  {
    type: 'quote',
    durationFrames: 180,
    content: {
      text: '"El enésimo bulo de Alvise Pérez."\nEl Plural · 2020',
      subtext: 'Confirmado por The Objective en 2026. Alvise tenía razón.',
    },
  },
];

// ─── SALF Andalucía — Eje 04: Seguridad ciudadana e inmigración ──────────────

const salfEje04Scenes: React.ComponentProps<typeof DataStory>['scenes'] = [
  {
    type: 'hook',
    durationFrames: 210,
    bg: 'alert' as const,
    content: {
      text: 'Eje 04\nSeguridad e Inmigración',
      subtext: 'SALF Andalucía 2026 · Ley, orden y prioridad para el ciudadano honrado',
    },
  },
  {
    type: 'stat',
    durationFrames: 120,
    content: {
      value: '10.000',
      label: 'chalecos antibalas para Policía Nacional y Guardia Civil',
      trend: 'up' as const,
    },
  },
  {
    type: 'comparison',
    durationFrames: 160,
    content: {
      title: 'Dietas policiales — sin actualizar desde 2002',
      left:  { label: 'Hoy (desde 2002)', value: '48,92€', sublabel: 'alojamiento · 28,21€ manutención', color: '#E63946' },
      right: { label: 'Con SALF',         value: '84,38€', sublabel: 'alojamiento · 48,66€ manutención', color: '#22C55E' },
    },
  },
  {
    type: 'keyword',
    durationFrames: 180,
    bg: 'grid' as const,
    content: {
      text: 'Las ayudas autonómicas van primero para españoles y residentes legales. Fin a los agravios comparativos.',
      highlight: 'españoles y residentes legales',
    },
  },
  {
    type: 'keyword',
    durationFrames: 180,
    bg: 'alert' as const,
    content: {
      text: 'En Andalucía el delincuente tendrá miedo, no el ciudadano honrado.',
      highlight: 'el delincuente tendrá miedo',
    },
  },
  {
    type: 'quote',
    durationFrames: 180,
    content: {
      text: '"El mayor plan de deportación\nde la historia de España."',
      subtext: 'SALF Andalucía · Contrato Electoral 2026',
    },
  },
];

// ─── Sánchez 609 asesores — TheObjective 18 abril 2026 ───────────────────────

const sanchez609Scenes: React.ComponentProps<typeof DataStory>['scenes'] = [
  {
    type: 'hook',
    durationFrames: 210,
    bg: 'alert' as const,
    content: {
      text: '609 asesores\nen Moncloa',
      subtext: 'Sánchez bate su propio récord — y nadie sabe cuánto cobra cada uno',
    },
  },
  {
    type: 'stat',
    durationFrames: 120,
    content: {
      value: '609',
      label: 'asesores y personal de confianza en la Presidencia',
        trend: 'up',
    },
  },
  {
    type: 'stat',
    durationFrames: 120,
    content: {
      value: '1264',
      label: 'cargos de confianza en todo el gobierno',
      trend: 'up',
    },
  },
  {
    type: 'comparison',
    durationFrames: 150,
    content: {
      title: 'Gasto en personal eventual',
      left:  { label: '2018', value: '40,4M €', sublabel: 'Presupuesto inicial', color: '#22C55E' },
      right: { label: '2025', value: '71,2M €', sublabel: '+76,5% de incremento',  color: '#E63946' },
    },
  },
  {
    type: 'keyword',
    durationFrames: 180,
    bg: 'grid' as const,
    content: {
      text: 'Sin nombres, sin funciones, sin salarios. Cero transparencia sobre quién cobra y por qué',
      highlight: 'Cero transparencia',
    },
  },
  {
    type: 'quote',
    durationFrames: 210,
    content: {
      text: '"El gasto real en eventuales\nha subido casi un 90%\ndesde 2018."',
      subtext: 'The Objective · 18 de abril de 2026',
    },
  },
];

// ─── Escenas de ejemplo — todas las escenas nuevas ────────────────────────────

const dataStoryExampleScenes: React.ComponentProps<typeof DataStory>['scenes'] = [
  // 1. Título — texto viene de abajo, "agosto" en rojo
  {
    type: 'title',
    durationFrames: 115,
    content: {
      text: 'Trabajas para el Estado\nhasta el 18 de agosto',
      subtext: 'Día de la Liberación Fiscal 2025 — España',
      direction: 'up',
      highlightWords: ['agosto'],
    },
  },
  // 2. Keyword — spotlight sobre las palabras clave, blur en el resto
  {
    type: 'keyword',
    durationFrames: 130,
    content: {
      text: 'El gobierno tomó 228 días de tu trabajo este año',
      highlight: '228 días',
    },
  },
  // 3. Stat — número negativo en rojo con flecha abajo
  {
    type: 'stat',
    durationFrames: 100,
    content: {
      value: '-62',
      suffix: '%',
      label: 'del año trabajas para el Estado',
      trend: 'down',
    },
  },
  // 4. Chart — barras que suben, rojo = negativo
  {
    type: 'chart',
    durationFrames: 130,
    content: {
      title: 'Presión fiscal — Evolución (% del año)',
      bars: [
        { label: '2021', value: -58, suffix: '%' },
        { label: '2022', value: -60, suffix: '%' },
        { label: '2023', value: -61, suffix: '%' },
        { label: '2024', value: -62, suffix: '%' },
      ],
    },
  },
  // 5. Comparison — España vs Media EU, con colores automáticos
  {
    type: 'comparison',
    durationFrames: 100,
    content: {
      title: 'Presión fiscal comparada',
      left: { label: 'España', value: '-62%', sublabel: '228 días al año' },
      right: { label: 'Media UE', value: '-43%', sublabel: '157 días al año' },
    },
  },
  // 6. Quote — cita final
  {
    type: 'quote',
    durationFrames: 145,
    content: {
      text: '"Solo a partir del 18 de agosto\nempiezas a trabajar para ti."',
      subtext: 'Fundación Civismo · Informe 2025',
    },
  },
];

// ─── Video 1 — Sincronizado con Whisper (38.7s = 1161 frames @ 30fps) ─────────
// Segmentos: 0-7.8s | 8.7-9s | 9.7-16s | 16.2-21.5s | 22.1-26s | 26-31.4s | 32.1-38.7s

const video1Captions = [{"word":"Después","start":0.0,"end":1.14},{"word":"de","start":1.14,"end":1.34},{"word":"leer","start":1.34,"end":1.44},{"word":"este","start":1.44,"end":1.62},{"word":"comentario,","start":1.62,"end":2.12},{"word":"me","start":2.6,"end":3.14},{"word":"hago","start":3.14,"end":3.24},{"word":"una","start":3.24,"end":3.38},{"word":"pregunta,","start":3.38,"end":3.68},{"word":"¿es","start":4.04,"end":4.16},{"word":"culpable","start":4.16,"end":4.58},{"word":"Alvise","start":4.58,"end":4.94},{"word":"de","start":5.88,"end":6.12},{"word":"haber","start":6.12,"end":6.26},{"word":"robado","start":6.26,"end":6.76},{"word":"votos","start":6.76,"end":7.3},{"word":"a","start":7.3,"end":7.62},{"word":"Vox?","start":7.62,"end":7.8},{"word":"No.","start":8.68,"end":8.98},{"word":"La","start":9.72,"end":10.22},{"word":"realidad","start":10.22,"end":10.54},{"word":"es","start":10.54,"end":10.9},{"word":"que","start":10.9,"end":11.02},{"word":"ha","start":11.02,"end":11.2},{"word":"habido","start":11.2,"end":11.32},{"word":"una","start":11.32,"end":11.46},{"word":"fuga","start":11.46,"end":11.82},{"word":"masiva","start":11.82,"end":12.4},{"word":"de","start":12.4,"end":12.56},{"word":"confianza,","start":12.56,"end":13.14},{"word":"una","start":13.22,"end":13.32},{"word":"pérdida","start":13.32,"end":13.76},{"word":"de","start":13.76,"end":14.3},{"word":"confianza","start":14.3,"end":15.06},{"word":"de","start":15.06,"end":15.22},{"word":"los","start":15.22,"end":15.36},{"word":"afiliados,","start":15.36,"end":16.06},{"word":"a","start":16.24,"end":16.38},{"word":"los","start":16.38,"end":16.56},{"word":"seguidores","start":16.56,"end":17.12},{"word":"o","start":17.12,"end":17.44},{"word":"votantes","start":17.44,"end":17.86},{"word":"de","start":17.86,"end":18.08},{"word":"Vox","start":18.08,"end":18.36},{"word":"por","start":18.36,"end":18.92},{"word":"culpa","start":18.92,"end":19.14},{"word":"de","start":19.14,"end":19.3},{"word":"la","start":19.3,"end":19.38},{"word":"purga","start":19.38,"end":19.68},{"word":"masiva","start":19.68,"end":20.02},{"word":"que","start":20.02,"end":20.16},{"word":"ha","start":20.16,"end":20.26},{"word":"estado","start":20.26,"end":20.42},{"word":"haciendo","start":20.42,"end":20.72},{"word":"Santiago","start":20.72,"end":21.06},{"word":"Abascal.","start":21.06,"end":21.46},{"word":"Porque","start":22.14,"end":22.62},{"word":"Ortega","start":22.62,"end":23.62},{"word":"Smith","start":23.62,"end":23.8},{"word":"era","start":23.8,"end":23.98},{"word":"el","start":23.98,"end":24.1},{"word":"bueno,","start":24.1,"end":24.24},{"word":"ahora","start":24.68,"end":25.02},{"word":"es","start":25.02,"end":25.5},{"word":"el","start":25.5,"end":25.64},{"word":"malo.","start":25.64,"end":26.06},{"word":"Todos","start":26.06,"end":26.58},{"word":"los","start":26.58,"end":26.78},{"word":"que","start":26.78,"end":26.94},{"word":"forman","start":26.94,"end":27.28},{"word":"parte","start":27.28,"end":27.58},{"word":"de","start":27.58,"end":27.96},{"word":"ese","start":27.96,"end":28.14},{"word":"grupo","start":28.14,"end":28.46},{"word":"de","start":28.46,"end":28.9},{"word":"Ortega","start":28.9,"end":29.26},{"word":"Smith,","start":29.26,"end":29.44},{"word":"todos","start":29.64,"end":29.84},{"word":"son","start":29.84,"end":30.14},{"word":"malos,","start":30.14,"end":30.56},{"word":"antes","start":30.62,"end":30.88},{"word":"eran","start":30.88,"end":31.16},{"word":"buenos.","start":31.16,"end":31.44},{"word":"Ahora","start":32.1,"end":32.42},{"word":"hay","start":32.42,"end":32.56},{"word":"algunos","start":32.56,"end":32.8},{"word":"comentarios:","start":32.8,"end":33.32},{"word":"vosotros","start":34.62,"end":35.16},{"word":"elegidos","start":35.48,"end":36.0},{"word":"a","start":36.34,"end":36.44},{"word":"dedos,","start":36.44,"end":36.74},{"word":"calladitos,","start":36.92,"end":37.54},{"word":"ahora","start":37.7,"end":37.84},{"word":"son","start":37.84,"end":38.02},{"word":"los","start":38.02,"end":38.14},{"word":"malos.","start":38.14,"end":38.72}];

// Escenas visuales sincronizadas con los timestamps de Whisper:
// 0-8s   → hook (pregunta)                          = 0-280f
// 8.6-9s → stat "NO"                                 = 258-280f (dentro del hook)
// 9.7-16s → keyword "fuga masiva confianza"          = 280-490f
// 16.2-21.5s → keyword "purga masiva Abascal"        = 490-650f  (alert bg)
// 22.1-26s → comparison Ortega bueno vs malo         = 650-782f
// 26-31.4s → keyword "todos malos antes buenos"      = 782-944f
// 32.1-38.7s → quote cierre                          = 963-1162f

const alviseSALFScenes: React.ComponentProps<typeof DataStory>['scenes'] = [
  {
    type: 'hook',
    durationFrames: 280,   // 0-9.3s — cubre la pregunta y el "No"
    bg: 'alert' as const,
    content: {
      text: '¿Es culpable Alvise\nde robar votos a VOX?',
      subtext: 'Respuesta: NO — aquí la verdad',
    },
  },
  {
    type: 'keyword',
    durationFrames: 210,   // 9.3-16.3s
    content: {
      text: 'Ha habido una fuga masiva de confianza y pérdida entre los afiliados',
      highlight: 'fuga masiva confianza',
    },
  },
  {
    type: 'keyword',
    durationFrames: 160,   // 16.3-21.6s
    bg: 'alert' as const,
    content: {
      text: 'Por culpa de la purga masiva que ha estado haciendo Santiago Abascal',
      highlight: 'purga masiva Abascal',
    },
  },
  {
    type: 'comparison',
    durationFrames: 132,   // 21.6-26s
    content: {
      title: 'Ortega Smith según Abascal',
      left: { label: 'Antes', value: 'BUENO', sublabel: 'Aliado de confianza', color: '#22C55E' },
      right: { label: 'Ahora', value: 'MALO', sublabel: 'Traidor — purga activa', color: '#E63946' },
    },
  },
  {
    type: 'keyword',
    durationFrames: 162,   // 26-31.4s
    bg: 'grid' as const,
    content: {
      text: 'Todos los que forman parte del grupo Ortega Smith son malos ahora antes eran buenos',
      highlight: 'malos buenos',
    },
  },
  {
    type: 'quote',
    durationFrames: 212,   // 32.1-38.7s
    content: {
      text: '"Elegidos a dedos, calladitos.\nAhora son los malos."',
      subtext: 'Video 1 · Análisis VOX interno',
    },
  },
];

void alviseSALFScenes;  // archivo histórico
void video1Captions;    // captions históricas
void sanchez609Scenes;  // archivo histórico

// ─── Composiciones ────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />

      <Composition
        id="CaptionVideo"
        component={CaptionVideo}
        durationInFrames={180}
        fps={BRAND.fps}
        width={BRAND.width}
        height={BRAND.height}
        schema={captionVideoSchema}
        defaultProps={{
          transcript: [
            { word: 'Esto',    start: 0.0, end: 1.0 },
            { word: 'es',      start: 1.0, end: 1.8 },
            { word: 'un',      start: 1.8, end: 2.4 },
            { word: 'caption', start: 2.4, end: 3.8 },
            { word: 'animado', start: 3.8, end: 5.0 },
            { word: 'con',     start: 5.0, end: 5.6 },
            { word: 'Remotion',start: 5.6, end: 6.0 },
          ],
          fontSize: 72,
          color: BRAND.colors.white,
          highlightColor: BRAND.colors.accent,
          background: BRAND.colors.black,
        }}
      />

      {/* ── Alvise tenía razón — paralelismo 2020 vs 2026 ── */}
      <Composition
        id="AlviseVsMedia"
        component={DataStory}
        durationInFrames={totalFrames(alviseMediaScenes)}
        fps={BRAND.fps}
        width={BRAND.widthVertical}
        height={BRAND.heightVertical}
        schema={dataStorySchema}
        defaultProps={{
          scenes: alviseMediaScenes,
          background: '#080808',
          accentColor: '#E63946',
        }}
      />

      <Composition
        id="DataStory"
        component={DataStory}
        durationInFrames={totalFrames(salfEje04Scenes)}
        fps={BRAND.fps}
        width={BRAND.width}
        height={BRAND.height}
        schema={dataStorySchema}
        defaultProps={{
          scenes: salfEje04Scenes,
          background: "#080808",
          accentColor: "#E63946",
        }}
      />

      <Composition
        id="FootageWithOverlay"
        component={FootageWithOverlay}
        durationInFrames={1162}
        fps={BRAND.fps}
        width={BRAND.widthVertical}
        height={BRAND.heightVertical}
        schema={footageWithOverlaySchema}
        defaultProps={{
          videoSrc: 'http://localhost:3001/recordings/rec_2026-04-18-18-18-47.webm',
          durationFrames: 500,
          showCaptions: true,
          captionPosition: 'center' as const,
          captionPreset: 'hormozi' as const,
          background: BRAND.colors.black,
          captions: [{"word":"Hola,","start":0.78,"end":1.46},{"word":"probando","start":1.62,"end":2.02},{"word":"uno,","start":2.02,"end":2.72},{"word":"dos,","start":2.84,"end":3.06},{"word":"tres,","start":3.32,"end":3.56},{"word":"cuatro,","start":3.68,"end":4.12},{"word":"probando,","start":4.34,"end":4.68},{"word":"probando,","start":4.76,"end":5.92},{"word":"haciendo","start":5.92,"end":6.26},{"word":"una","start":6.26,"end":6.5},{"word":"prueba","start":6.5,"end":6.7},{"word":"de","start":6.7,"end":6.9},{"word":"audio","start":6.9,"end":7.26},{"word":"para","start":7.26,"end":7.64},{"word":"una","start":7.64,"end":8.1},{"word":"grabación","start":8.1,"end":8.66},{"word":"de","start":8.66,"end":8.84},{"word":"asesores","start":8.84,"end":9.2},{"word":"y","start":9.2,"end":9.36},{"word":"personal","start":9.36,"end":9.68},{"word":"de","start":9.68,"end":9.84},{"word":"confianza","start":9.84,"end":10.32},{"word":"en","start":10.32,"end":10.4},{"word":"la","start":10.4,"end":10.46},{"word":"presidencia,","start":10.46,"end":11.06},{"word":"cargos","start":11.46,"end":11.8},{"word":"de","start":11.8,"end":11.9},{"word":"confianza","start":11.9,"end":12.62},{"word":"en","start":12.62,"end":12.9},{"word":"todo","start":12.9,"end":13.22},{"word":"el","start":13.22,"end":13.6},{"word":"gobierno","start":13.6,"end":14.2},{"word":"y","start":14.2,"end":15.02},{"word":"detenemos","start":15.02,"end":15.74},{"word":"y","start":15.74,"end":15.86},{"word":"procesamos.","start":15.86,"end":16.4}],
          handle: 'vitaminak.of',
          introTitle: '609 asesores en Moncloa',
          introDurationFrames: 45,
          ctaText: 'Sígueme para más →',
          ctaDurationFrames: 50,
          lowerThird: {
            name: 'Kevin Pérez',
            title: 'Análisis político',
            showAtFrame: 50,
            hideAtFrame: 460,
          },
          overlays: [
            { type: 'breaking', startFrame: 46,  endFrame: 130, text: 'Sánchez bate su récord de asesores' },
            { type: 'stat',     startFrame: 180, endFrame: 330, value: '609', text: ' asesores' },
            { type: 'warning',  startFrame: 360, endFrame: 450, text: 'SIN TRANSPARENCIA' },
            { type: 'countdown', startFrame: 430, endFrame: 500 },
          ],
          showTopBar: false,
        }}
      />

      <Composition
        id="PoliticalReel"
        component={PoliticalReel}
        durationInFrames={reelTotalFrames(dataStoryExampleScenes, 600)}
        fps={BRAND.fps}
        width={BRAND.widthVertical}
        height={BRAND.heightVertical}
        schema={politicalReelSchema}
        defaultProps={{
          scenes: dataStoryExampleScenes,
          background: BRAND.colors.black,
          accentColor: BRAND.colors.accent,
          videoSrc: 'http://localhost:3001/recordings/video-prueba.mp4',
          footageDurationFrames: 600,
          showCaptions: false,
          captionPosition: 'bottom' as const,
          captions: [],
          transitionFrames: 20,
          bridgeStat: {
            value: '-62%',
            label: '228 días trabajando para el Estado',
          },
          lowerThird: {
            name: 'Kevin García',
            title: 'Liberación Fiscal 2025',
            showAtFrame: 30,
            hideAtFrame: 570,
          },
        }}
      />
      {/* SplitReel: datos arriba, tú grabado abajo — formato vertical 1080×1920 */}
      <Composition
        id="SplitReel"
        component={SplitReel}
        durationInFrames={splitReelTotalFrames(300)}
        fps={BRAND.fps}
        width={BRAND.widthVertical}
        height={BRAND.heightVertical}
        schema={splitReelSchema}
        defaultProps={{
          scenes: [
            {
              type: "title" as const,
              durationFrames: 0,
              content: {
                text: "",
                subtext: "",
                direction: "up" as const,
                highlightWords: [""],
              },
            },
            {
              type: "keyword" as const,
              durationFrames: 130,
              content: {
                text: "El gobierno tomó 228 días de tu trabajo este año",
                highlight: "228 días",
              },
            },
            {
              type: "stat" as const,
              durationFrames: 100,
              content: {
                value: "-62",
                suffix: "%",
                label: "del año trabajas para el Estado",
                trend: "down" as const,
              },
            },
            {
              type: "chart" as const,
              durationFrames: 130,
              content: {
                title: "Presión fiscal — Evolución (% del año)",
                bars: [
                  { label: "2021", value: -58, suffix: "%" },
                  { label: "2022", value: -60, suffix: "%" },
                  { label: "2023", value: -61, suffix: "%" },
                  { label: "2024", value: -62, suffix: "%" },
                ],
              },
            },
            {
              type: "comparison" as const,
              durationFrames: 100,
              content: {
                title: "Presión fiscal comparada",
                left: {
                  label: "España",
                  value: "-62%",
                  sublabel: "228 días al año",
                },
                right: {
                  label: "Media UE",
                  value: "-43%",
                  sublabel: "157 días al año",
                },
              },
            },
            {
              type: "quote" as const,
              durationFrames: 145,
              content: {
                text: '"Solo a partir del 18 de agosto\nempiezas a trabajar para ti."',
                subtext: "Fundación Civismo · Informe 2025",
              },
            },
          ],
          accentColor: "#E63946",
          background: "#080808",
          videoSrc:
            "http://localhost:3001/recordings/rec_2026-04-15-17-48-36.webm",
          videoDurationFrames: 300,
          splitRatio: 0.6,
          presenterName: "Kevin Pérez",
          presenterTitle: "Vitamina K",
          loopDataAnimation: true,
        }}
      />
      {/* TextReveal: frase protagonista palabra por palabra — 1080×1080 */}
      <Composition
        id="TextReveal"
        component={TextReveal}
        durationInFrames={90}
        fps={BRAND.fps}
        width={BRAND.width}
        height={BRAND.height}
        schema={textRevealSchema}
        defaultProps={{
          text: 'La IA cambia todo',
          fontSize: 120,
          theme: 'dark' as const,
          durationFrames: 90,
        }}
      />

      {/* SplitScreen: dos columnas 50/50 con valor grande + texto — 1080×1080 */}
      <Composition
        id="SplitScreen"
        component={SplitScreen}
        durationInFrames={150}
        fps={BRAND.fps}
        width={BRAND.width}
        height={BRAND.height}
        schema={splitScreenSchema}
        defaultProps={{
          left: {
            label: 'España',
            value: '-62%',
            sublabel: '228 días trabajando para el Estado',
          },
          right: {
            text: 'Media UE solo dedica 157 días al año en impuestos',
            subtext: 'Fundación Civismo · Informe 2025',
          },
          theme: 'dark' as const,
          durationFrames: 150,
        }}
      />

      {/* ─── HybridReel — Alvise tenía razón (rec_2026-04-20-09-51-17, 78.96s) ─── */}
      <Composition
        id="HybridReel-Alvise"
        component={HybridReel}
        durationInFrames={2430}
        fps={BRAND.fps}
        width={BRAND.widthVertical}
        height={BRAND.heightVertical}
        schema={hybridReelSchema}
        defaultProps={{
          videoSrc: 'http://localhost:3001/recordings/rec_2026-04-20-09-51-17.webm',
          durationFrames: 2430,
          showCaptions: true,
          captionPreset: 'hormozi' as const,
          captionPosition: 'center' as const,
          captionMode: 'phrases' as const,
          handle: 'vitaminak.of',
          ctaText: 'Sígueme para más →',
          ctaDurationFrames: 90,
          accentColor: '#E63946',
          borderFlashes: [],
          captions: [
            {"word":"en","start":1.28,"end":1.8},{"word":"2020","start":1.8,"end":2.32},
            {"word":"los","start":2.32,"end":3.16},{"word":"medios","start":3.16,"end":3.52},
            {"word":"ya","start":3.52,"end":3.72},{"word":"tenían","start":3.72,"end":4.0},
            {"word":"un","start":4.0,"end":4.26},{"word":"plan","start":4.26,"end":4.5},
            {"word":"muy","start":4.5,"end":5.02},{"word":"sencillo","start":5.02,"end":5.96},
            {"word":"y","start":5.96,"end":6.24},{"word":"es","start":6.24,"end":6.34},
            {"word":"que","start":6.34,"end":6.42},{"word":"cada","start":6.42,"end":6.6},
            {"word":"vez","start":6.6,"end":6.74},{"word":"que","start":6.74,"end":6.9},
            {"word":"Alvise","start":6.9,"end":7.16},{"word":"se","start":7.16,"end":7.28},
            {"word":"decía","start":7.28,"end":7.48},{"word":"algo","start":7.48,"end":7.76},
            {"word":"incómodo","start":7.76,"end":8.38},{"word":"sobre","start":8.38,"end":8.76},
            {"word":"ellos","start":8.76,"end":8.92},{"word":"los","start":8.92,"end":9.06},
            {"word":"que","start":9.06,"end":9.16},{"word":"ya","start":9.16,"end":9.28},
            {"word":"sabéis","start":9.28,"end":9.76},{"word":"lo","start":9.76,"end":10.32},
            {"word":"llamaban","start":10.32,"end":10.66},{"word":"bulero","start":10.66,"end":11.14},
            {"word":"pero","start":11.14,"end":12.06},{"word":"los","start":12.06,"end":12.42},
            {"word":"años","start":12.42,"end":12.64},{"word":"han","start":12.64,"end":12.84},
            {"word":"dicho","start":12.84,"end":12.96},{"word":"lo","start":12.96,"end":13.1},
            {"word":"contrario","start":13.1,"end":13.44},{"word":"y","start":13.44,"end":13.7},
            {"word":"es","start":13.7,"end":13.8},{"word":"que","start":13.8,"end":13.9},
            {"word":"el","start":13.9,"end":14.0},{"word":"Plural","start":14.0,"end":14.26},
            {"word":"en","start":14.26,"end":14.52},{"word":"2020","start":14.52,"end":14.9},
            {"word":"publicó","start":14.9,"end":15.4},{"word":"un","start":15.4,"end":15.44},
            {"word":"titular","start":15.44,"end":15.74},{"word":"que","start":15.74,"end":15.96},
            {"word":"decía","start":15.96,"end":16.34},{"word":"el","start":16.34,"end":16.8},
            {"word":"enésimo","start":16.8,"end":17.32},{"word":"bulo","start":17.32,"end":17.76},
            {"word":"de","start":17.76,"end":17.86},{"word":"Alvise","start":17.86,"end":18.08},
            {"word":"Pérez","start":18.08,"end":18.62},{"word":"el","start":18.62,"end":19.64},
            {"word":"enésimo","start":19.64,"end":20.32},{"word":"como","start":20.32,"end":20.96},
            {"word":"diciendo","start":20.96,"end":21.32},{"word":"ya","start":21.32,"end":22.04},
            {"word":"estamos","start":22.04,"end":22.46},{"word":"otra","start":22.46,"end":22.76},
            {"word":"vez","start":22.76,"end":23.1},{"word":"con","start":23.1,"end":23.32},
            {"word":"este","start":23.32,"end":23.48},{"word":"mentiroso","start":23.48,"end":23.96},
            {"word":"que","start":23.96,"end":24.16},{"word":"no","start":24.16,"end":24.24},
            {"word":"hace","start":24.24,"end":24.34},{"word":"falta","start":24.34,"end":24.48},
            {"word":"ni","start":24.48,"end":24.78},{"word":"leer","start":24.78,"end":25.04},
            {"word":"el","start":25.04,"end":25.16},{"word":"artículo","start":25.16,"end":25.72},
            {"word":"pero","start":25.72,"end":26.72},{"word":"seis","start":26.72,"end":26.92},
            {"word":"años","start":26.92,"end":27.14},{"word":"después","start":27.14,"end":27.56},
            {"word":"ahora","start":27.56,"end":28.52},{"word":"The","start":28.52,"end":28.98},
            {"word":"Objective","start":28.98,"end":29.46},{"word":"publica","start":29.46,"end":29.82},
            {"word":"lo","start":29.82,"end":29.9},{"word":"siguiente","start":29.9,"end":30.14},
            {"word":"Zapatero","start":31.38,"end":32.98},{"word":"tenía","start":32.98,"end":33.2},
            {"word":"un","start":33.2,"end":33.38},{"word":"chalet","start":33.38,"end":33.6},
            {"word":"que","start":33.6,"end":33.82},{"word":"no","start":33.82,"end":34.0},
            {"word":"cuadraba","start":34.0,"end":34.9},{"word":"su","start":34.9,"end":35.54},
            {"word":"supuesto","start":35.54,"end":35.94},{"word":"testaferro","start":35.94,"end":36.7},
            {"word":"cobró","start":36.7,"end":36.98},{"word":"458.000","start":36.98,"end":38.22},
            {"word":"euros","start":38.22,"end":38.44},{"word":"de","start":38.44,"end":38.66},
            {"word":"Plus","start":38.66,"end":38.84},{"word":"Ultra","start":38.84,"end":39.34},
            {"word":"la","start":39.34,"end":39.74},{"word":"aerolínea","start":39.74,"end":40.22},
            {"word":"que","start":40.22,"end":40.44},{"word":"el","start":40.44,"end":40.52},
            {"word":"gobierno","start":40.52,"end":40.74},{"word":"rescató","start":40.74,"end":41.34},
            {"word":"con","start":41.34,"end":41.48},{"word":"53","start":41.48,"end":41.78},
            {"word":"millones","start":41.78,"end":42.06},{"word":"de","start":42.06,"end":42.24},
            {"word":"dinero","start":42.24,"end":42.4},{"word":"público","start":42.4,"end":42.82},
            {"word":"entonces","start":45.16,"end":45.86},{"word":"la","start":45.86,"end":46.06},
            {"word":"pregunta","start":46.06,"end":46.28},{"word":"muy","start":46.28,"end":46.52},
            {"word":"sencilla","start":46.52,"end":47.48},{"word":"muy","start":47.48,"end":47.68},
            {"word":"simple","start":47.68,"end":48.04},{"word":"los","start":48.04,"end":49.0},
            {"word":"que","start":49.0,"end":49.16},{"word":"escribieron","start":49.16,"end":49.66},
            {"word":"el","start":49.66,"end":50.14},{"word":"enésimo","start":50.14,"end":50.56},
            {"word":"bulo","start":50.56,"end":50.9},{"word":"los","start":50.9,"end":51.08},
            {"word":"que","start":51.08,"end":51.18},{"word":"le","start":51.18,"end":51.26},
            {"word":"llamaban","start":51.26,"end":51.48},{"word":"mentiroso","start":51.48,"end":51.98},
            {"word":"los","start":51.98,"end":52.16},{"word":"que","start":52.16,"end":52.3},
            {"word":"convirtieron","start":52.3,"end":52.76},{"word":"Alvise","start":52.76,"end":53.16},
            {"word":"en","start":53.16,"end":53.34},{"word":"un","start":53.34,"end":53.48},
            {"word":"mentiroso","start":53.48,"end":54.22},{"word":"de","start":54.22,"end":54.36},
            {"word":"España","start":54.36,"end":54.72},{"word":"qué","start":55.64,"end":56.28},
            {"word":"dicen","start":56.28,"end":56.52},{"word":"ahora","start":56.52,"end":56.78},
            {"word":"dónde","start":56.78,"end":57.9},{"word":"está","start":57.9,"end":58.26},
            {"word":"la","start":58.26,"end":58.66},{"word":"rectificación","start":58.66,"end":59.28},
            {"word":"no","start":61.06,"end":61.22},{"word":"ha","start":61.22,"end":61.26},
            {"word":"mentido","start":61.26,"end":61.64},{"word":"ha","start":61.64,"end":62.12},
            {"word":"mentido","start":62.12,"end":62.46},{"word":"los","start":62.46,"end":62.64},
            {"word":"que","start":62.64,"end":62.8},{"word":"le","start":62.8,"end":62.88},
            {"word":"llamaron","start":62.88,"end":63.16},{"word":"mentiroso","start":63.16,"end":63.76},
            {"word":"y","start":63.76,"end":64.3},{"word":"eso","start":64.3,"end":64.62},
            {"word":"en","start":64.62,"end":65.04},{"word":"un","start":65.04,"end":65.16},
            {"word":"país","start":65.16,"end":65.36},{"word":"normal","start":65.36,"end":65.86},
            {"word":"tendría","start":65.86,"end":66.48},{"word":"consecuencias","start":66.48,"end":67.34},
            {"word":"todos","start":73.58,"end":73.74},{"word":"estos","start":73.74,"end":74.04},
            {"word":"lo","start":74.04,"end":74.24},{"word":"que","start":74.24,"end":74.32},
            {"word":"intentaban","start":74.32,"end":74.7},{"word":"hacer","start":74.7,"end":74.92},
            {"word":"era","start":74.92,"end":75.14},{"word":"frenarle","start":75.14,"end":76.12},
            {"word":"pero","start":76.12,"end":77.18},{"word":"nos","start":77.44,"end":78.08},
            {"word":"están","start":78.08,"end":78.32},{"word":"dando","start":78.32,"end":78.54},
            {"word":"alas","start":78.54,"end":78.96},
          ],
          segments: [
            // ~10.66s "llamaban bulero" → keyword split-bottom — rojo: la mentira de los medios
            {
              mode: 'split-bottom' as const,
              tone: 'negative' as const,
              startFrame: 290,
              endFrame: 430,
              panel: {
                type: 'keyword' as const,
                headline: '"El enésimo bulo de Alvise Pérez"',
                highlight: 'bulo',
              },
            },
            // ~27s "The Objective publica" → split-top — rojo: corrupción confirmada
            {
              mode: 'split-top' as const,
              tone: 'negative' as const,
              startFrame: 820,
              endFrame: 1000,
              panel: {
                type: 'list' as const,
                title: 'The Objective · 2026',
                items: ['Chalet de Zapatero sin declarar', 'Testaferro cobra de Plus Ultra', '458.000€ en consultoría'],
              },
            },
            // ~36.98s "458.000 euros" → stat-pop — rojo: dinero público robado
            {
              mode: 'stat-pop' as const,
              tone: 'negative' as const,
              startFrame: 1110,
              endFrame: 1270,
              value: '458.000€',
              label: 'cobró el testaferro de Zapatero de Plus Ultra',
              subtext: 'Rescate gobierno: 53 millones de dinero público',
            },
            // ~55.64s "qué dicen ahora" → keyword — azul: pregunta directa, neutro
            {
              mode: 'split-bottom' as const,
              tone: 'neutral' as const,
              startFrame: 1670,
              endFrame: 1850,
              panel: {
                type: 'keyword' as const,
                headline: '¿Dónde está la rectificación?',
                highlight: 'rectificación',
              },
            },
            // ~61.26s "no mintió Alvise" → quote — verde: vindicación, Alvise tenía razón
            {
              mode: 'split-bottom' as const,
              tone: 'positive' as const,
              startFrame: 1840,
              endFrame: 2050,
              panel: {
                type: 'quote' as const,
                text: 'No mintió Alvise. Mintieron los que le llamaron mentiroso.',
                source: 'vitaminak.of',
              },
            },
          ],
        }}
      />

      {/* ─── HybridReel — SALF Vivienda (rec_2026-04-21-09-27-45, ~60s)
           Cortado en "preguntarte" (60.16s) — blooper final excluido
      ─────────────────────────────────────────────────────────────────────────── */}
      <Composition
        id="HybridReel"
        component={HybridReel}
        durationInFrames={1865}
        fps={BRAND.fps}
        width={BRAND.widthVertical}
        height={BRAND.heightVertical}
        schema={hybridReelSchema}
        defaultProps={{
          videoSrc: 'http://localhost:3001/recordings/rec_2026-04-21-09-27-45.webm',
          durationFrames: 1865,
          showCaptions: true,
          captionPreset: 'hormozi' as const,
          captionPosition: 'center' as const,
          captionMode: 'keyword-xl' as const,
          handle: 'vitaminak.of',
          ctaText: 'Vota SALF · 17 Mayo →',
          ctaDurationFrames: 90,
          accentColor: '#E63946',

          alertBadge: {
            text: '17 MAYO · VOTA SALF',
            tone: 'positive' as const,
            startFrame: 0,
            holdFrames: 120,
          },

          borderFlashes: [
            { frame: 502,  tone: 'positive' as const, duration: 20 },  // "Uno" — 16.74s
            { frame: 775,  tone: 'positive' as const, duration: 20 },  // "Dos" — 25.82s
            { frame: 1193, tone: 'positive' as const, duration: 20 },  // "Tres" — 39.76s
          ],

          dataCounter: { total: 3 },

          captions: [
            // Seg 0 — hook pregunta
            {"word":"porque","start":0.0,"end":0.78},{"word":"en","start":0.78,"end":1.1},
            {"word":"Andalucía","start":1.1,"end":1.52},{"word":"los","start":1.52,"end":1.7},
            {"word":"jóvenes","start":1.7,"end":1.94},{"word":"no","start":1.94,"end":2.22},
            {"word":"pueden","start":2.22,"end":2.44},{"word":"comprar","start":2.44,"end":2.74},
            {"word":"casas","start":2.74,"end":3.22},{"word":"y","start":3.22,"end":3.38},
            {"word":"los","start":3.38,"end":3.46},{"word":"okupas","start":3.46,"end":3.88},
            {"word":"duermen","start":3.88,"end":4.14},{"word":"tranquilos","start":4.14,"end":4.68},
            // Seg 1 — culpa
            {"word":"La","start":5.02,"end":5.52},{"word":"culpa","start":5.52,"end":5.64},
            {"word":"es","start":5.64,"end":5.8},{"word":"de","start":5.8,"end":5.86},
            {"word":"los","start":5.86,"end":5.92},{"word":"impuestos","start":5.92,"end":6.16},
            {"word":"abusivos","start":6.16,"end":6.64},{"word":"de","start":6.96,"end":7.14},
            {"word":"la","start":7.14,"end":7.22},{"word":"pasividad","start":7.22,"end":7.52},
            {"word":"cómplice","start":7.52,"end":7.94},{"word":"de","start":7.94,"end":8.06},
            {"word":"los","start":8.06,"end":8.16},{"word":"políticos","start":8.16,"end":8.72},
            // Seg 2 — SALF declaramos guerra
            {"word":"pero","start":9.46,"end":9.7},{"word":"con","start":9.7,"end":9.9},
            {"word":"SALF","start":9.9,"end":10.1},{"word":"declaramos","start":10.42,"end":10.82},
            {"word":"la","start":10.82,"end":10.98},{"word":"guerra","start":10.98,"end":11.14},
            {"word":"a","start":11.14,"end":11.28},{"word":"este","start":11.28,"end":11.3},
            {"word":"problema","start":11.3,"end":11.6},{"word":"Vamos","start":11.9,"end":12.04},
            {"word":"a","start":12.04,"end":12.18},{"word":"acabar","start":12.18,"end":12.3},
            {"word":"con","start":12.3,"end":12.46},{"word":"la","start":12.46,"end":12.54},
            {"word":"fiesta","start":12.54,"end":12.72},{"word":"de","start":12.72,"end":12.84},
            // Seg 3 — tres medidas + UNO
            {"word":"la","start":12.84,"end":12.9},{"word":"especulación","start":12.9,"end":13.48},
            {"word":"con","start":13.72,"end":13.86},{"word":"la","start":13.86,"end":13.94},
            {"word":"ocupación","start":13.94,"end":14.48},{"word":"solo","start":14.86,"end":15.1},
            {"word":"con","start":15.1,"end":15.36},{"word":"tres","start":15.36,"end":15.56},
            {"word":"medidas","start":15.56,"end":15.94},{"word":"UNO","start":16.74,"end":16.98},
            {"word":"convertir","start":17.48,"end":17.66},{"word":"Andalucía","start":17.72,"end":18.02},
            {"word":"en","start":18.02,"end":18.08},{"word":"un","start":18.08,"end":18.18},
            // Seg 4 — paraíso fiscal
            {"word":"paraíso","start":18.18,"end":18.5},{"word":"fiscal","start":18.5,"end":18.96},
            {"word":"primera","start":19.4,"end":19.8},{"word":"vivienda","start":19.8,"end":20.38},
            {"word":"eliminando","start":20.38,"end":20.98},{"word":"todos","start":20.98,"end":21.36},
            {"word":"los","start":21.36,"end":21.64},{"word":"impuestos","start":21.64,"end":22.0},
            {"word":"autonómicos","start":22.0,"end":22.58},{"word":"compra","start":22.8,"end":23.02},
            // Seg 5 — hogar habitual + DOS
            {"word":"de","start":23.02,"end":23.24},{"word":"tu","start":23.24,"end":23.48},
            {"word":"primer","start":23.48,"end":23.8},{"word":"hogar","start":23.8,"end":24.46},
            {"word":"habitual","start":24.46,"end":25.08},{"word":"DOS","start":25.82,"end":26.2},
            {"word":"desalojos","start":26.6,"end":26.92},{"word":"policiales","start":26.92,"end":27.44},
            {"word":"máximo","start":27.6,"end":27.8},{"word":"de","start":27.8,"end":28.0},
            {"word":"24","start":28.0,"end":28.42},{"word":"horas","start":28.42,"end":28.84},
            // Seg 6 — IRPF + retroactividad
            {"word":"te","start":30.54,"end":30.72},{"word":"deducirás","start":30.72,"end":31.18},
            {"word":"el","start":31.18,"end":31.32},{"word":"IRPF","start":31.32,"end":31.88},
            {"word":"echar","start":32.94,"end":33.1},{"word":"al","start":33.1,"end":33.2},
            {"word":"okupa","start":33.2,"end":33.46},{"word":"retroactividad","start":33.86,"end":34.44},
            {"word":"10","start":34.64,"end":34.88},{"word":"años","start":34.88,"end":35.18},
            // Seg 7 — Ningún okupa + TRES
            {"word":"Ningún","start":35.66,"end":36.1},{"word":"okupa","start":36.1,"end":36.58},
            {"word":"recibirá","start":36.58,"end":37.14},{"word":"ayuda","start":37.42,"end":37.6},
            {"word":"social","start":37.6,"end":37.98},{"word":"en","start":37.98,"end":38.4},
            {"word":"Andalucía","start":38.4,"end":39.04},{"word":"TRES","start":39.84,"end":40.06},
            {"word":"expulsión","start":40.62,"end":41.12},{"word":"exprés","start":41.12,"end":41.7},
            // Seg 8 — VPO
            {"word":"viviendas","start":42.16,"end":42.68},{"word":"protección","start":42.8,"end":43.16},
            {"word":"oficial","start":43.16,"end":43.58},{"word":"Quién","start":44.04,"end":44.38},
            {"word":"ocupe","start":44.38,"end":44.9},{"word":"vivienda","start":45.66,"end":46.18},
            {"word":"pública","start":46.18,"end":46.8},{"word":"para","start":46.8,"end":47.3},
            {"word":"delinquir","start":47.3,"end":47.92},
            // Seg 9 — Perderá + CTA
            {"word":"Perderá","start":48.66,"end":48.98},{"word":"el","start":48.98,"end":49.04},
            {"word":"derecho","start":49.04,"end":49.24},{"word":"inmediatamente","start":49.24,"end":49.86},
            {"word":"17","start":51.34,"end":51.68},{"word":"de","start":51.68,"end":51.88},
            {"word":"mayo","start":51.88,"end":52.14},{"word":"nosotros","start":52.56,"end":53.34},
            {"word":"protegemos","start":53.34,"end":53.88},
            // Seg 10 — propietario + Vota SALF
            {"word":"propietario","start":54.02,"end":54.46},{"word":"no","start":54.76,"end":55.06},
            {"word":"al","start":55.06,"end":55.2},{"word":"delincuente","start":55.2,"end":55.74},
            {"word":"Vota","start":56.22,"end":56.52},{"word":"SALF","start":56.52,"end":56.78},
            {"word":"recupera","start":56.94,"end":57.34},{"word":"tu","start":57.34,"end":57.44},
            {"word":"tierra","start":57.44,"end":57.7},
            // Seg 11 — loop trap (blooper excluido a partir de aquí)
            {"word":"que","start":59.18,"end":59.3},{"word":"volver","start":59.3,"end":59.46},
            {"word":"a","start":59.46,"end":59.6},{"word":"preguntarte","start":59.6,"end":60.16},
          ],

          segments: [
            // MEDIDA 1 — paraíso fiscal (Uno: 16.74s = frame 502 → habitual: 25.08s = frame 753)
            {
              mode: 'split-bottom' as const,
              tone: 'positive' as const,
              dataIndex: 1,
              startFrame: 502,
              endFrame: 753,
              panel: {
                type: 'stat' as const,
                value: '0%',
                label: 'impuestos autonómicos en tu primera vivienda',
                subtext: 'SALF Andalucía · Medida 1',
                trend: 'down' as const,
              },
            },
            // MEDIDA 2 — desalojos 24h (Dos: 25.82s = frame 775 → antes de "10": 34.44s = frame 1033)
            {
              mode: 'overlay-card' as const,
              tone: 'positive' as const,
              dataIndex: 2,
              startFrame: 775,
              endFrame: 1033,
              eyebrow: '⚡ MEDIDA 2 · DESALOJOS',
              value: '24h',
              label: 'máximo para desalojar al okupa',
              source: 'Deducción IRPF retroactiva · 10 años',
            },
            // Stat pop — 10 años retroactivos (34.64s = frame 1039 → antes de Tres: 39.5s = frame 1185)
            {
              mode: 'stat-pop' as const,
              tone: 'positive' as const,
              startFrame: 1039,
              endFrame: 1185,
              value: '10',
              label: 'años retroactivos de deducción IRPF',
              subtext: 'por gastos de desalojo de okupa',
            },
            // MEDIDA 3 — expulsión exprés VPO (Tres: 39.76s = frame 1193 → 47.92s = frame 1438)
            {
              mode: 'split-bottom' as const,
              tone: 'positive' as const,
              dataIndex: 3,
              startFrame: 1193,
              endFrame: 1438,
              panel: {
                type: 'keyword' as const,
                headline: 'Expulsión exprés en VPO',
                highlight: 'exprés',
                subtext: 'Quien delinca pierde el derecho inmediatamente',
              },
            },
            // Quote cierre (50.78s = frame 1523 → fin)
            {
              mode: 'split-bottom' as const,
              tone: 'neutral' as const,
              startFrame: 1523,
              endFrame: 1865,
              panel: {
                type: 'quote' as const,
                text: 'Protegemos al propietario, no al delincuente.',
                source: 'SALF · 17 Mayo 2026',
              },
            },
          ],
        }}
      />

      {/* ── CaptionsStyled — 7 presets en composiciones separadas para previsualizar ── */}
      {(['hormozi','bold','neon','box','outline','minimal','karaoke'] as const).map((preset) => (
        <Composition
          key={preset}
          id={`Captions-${preset}`}
          component={CaptionsStyled}
          durationInFrames={240}
          fps={BRAND.fps}
          width={BRAND.widthVertical}
          height={BRAND.heightVertical}
          schema={captionsStyledSchema}
          defaultProps={{
            words: demoWords,
            preset,
            accent: '#E63946',
            position: 'center' as const,
            maxWordsPerPhrase: 4,
            gapThreshold: 0.38,
            uppercase: preset === 'bold' || preset === 'outline',
            shadow: true,
          }}
        />
      ))}
    </>
  );
};
