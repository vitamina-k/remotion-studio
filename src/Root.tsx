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

void alviseSALFScenes; // archivo histórico
void video1Captions;   // captions históricas

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

      <Composition
        id="DataStory"
        component={DataStory}
        durationInFrames={totalFrames(sanchez609Scenes)}
        fps={BRAND.fps}
        width={BRAND.width}
        height={BRAND.height}
        schema={dataStorySchema}
        defaultProps={{
          scenes: sanchez609Scenes,
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

      {/* ─── HybridReel: footage + DataStory panels — formato vertical 1080×1920 ─── */}
      <Composition
        id="HybridReel"
        component={HybridReel}
        durationInFrames={1470}
        fps={BRAND.fps}
        width={BRAND.widthVertical}
        height={BRAND.heightVertical}
        schema={hybridReelSchema}
        defaultProps={{
          videoSrc: 'http://localhost:3001/recordings/rec_2026-04-18-19-44-49.webm',
          durationFrames: 1470,
          captions: [
            {"word":"¿Sabes","start":0,"end":1},{"word":"cuántos","start":1,"end":1.34},
            {"word":"asesores","start":1.34,"end":1.74},{"word":"tiene","start":1.74,"end":1.94},
            {"word":"Sánchez","start":1.94,"end":2.2},{"word":"en","start":2.2,"end":2.38},
            {"word":"Moncloa?","start":2.38,"end":2.76},{"word":"Pues","start":3.16,"end":3.26},
            {"word":"más","start":3.26,"end":3.46},{"word":"que","start":3.46,"end":3.62},
            {"word":"nunca,","start":3.62,"end":3.84},{"word":"más","start":4.04,"end":4.18},
            {"word":"que","start":4.18,"end":4.36},{"word":"nadie,","start":4.36,"end":4.58},
            {"word":"nadie","start":4.7,"end":4.84},{"word":"sabe","start":4.84,"end":5.04},
            {"word":"exactamente","start":5.04,"end":5.32},{"word":"cuánto","start":5.32,"end":5.98},
            {"word":"cobran,","start":5.98,"end":6.5},{"word":"pero","start":6.68,"end":6.82},
            {"word":"que","start":6.82,"end":6.92},{"word":"eso","start":6.92,"end":7.02},
            {"word":"no","start":7.02,"end":7.12},{"word":"lo","start":7.12,"end":7.2},
            {"word":"sabías.","start":7.2,"end":7.46},{"word":"609","start":8.1,"end":8.62},
            {"word":"asesores","start":8.62,"end":9.04},{"word":"solo","start":9.04,"end":9.42},
            {"word":"en","start":9.42,"end":9.78},{"word":"presidencia","start":9.78,"end":10.42},
            {"word":"es","start":10.42,"end":10.8},{"word":"el","start":10.8,"end":10.92},
            {"word":"máximo","start":10.92,"end":11.1},{"word":"histórico","start":11.1,"end":11.52},
            {"word":"y","start":11.52,"end":11.66},{"word":"en","start":11.66,"end":11.72},
            {"word":"todo","start":11.72,"end":11.82},{"word":"el","start":11.82,"end":11.94},
            {"word":"gobierno","start":11.94,"end":12.12},{"word":"suman","start":12.12,"end":12.5},
            {"word":"1","start":12.5,"end":12.66},{"word":".264.","start":12.66,"end":13.9},
            {"word":"El","start":14.4,"end":14.76},{"word":"63","start":14.76,"end":15.08},
            {"word":"%","start":15.08,"end":15.7},{"word":"están","start":15.7,"end":16.26},
            {"word":"en","start":16.26,"end":16.4},{"word":"los","start":16.4,"end":16.48},
            {"word":"rangos","start":16.48,"end":16.74},{"word":"más","start":16.74,"end":16.9},
            {"word":"altos,","start":16.9,"end":17.28},{"word":"453","start":17.64,"end":18.74},
            {"word":"en","start":18.74,"end":18.88},{"word":"el","start":18.88,"end":18.96},
            {"word":"nivel","start":18.96,"end":19.12},{"word":"30,","start":19.12,"end":19.54},
            {"word":"el","start":19.74,"end":19.94},{"word":"máximo","start":19.94,"end":20.24},
            {"word":"sin","start":20.24,"end":20.54},{"word":"oposición,","start":20.54,"end":21.06},
            {"word":"sin","start":21.24,"end":21.44},{"word":"concurso","start":21.44,"end":21.9},
            {"word":"público.","start":21.9,"end":22.28},{"word":"En","start":23.02,"end":23.28},
            {"word":"2018","start":23.28,"end":23.62},{"word":"el","start":23.62,"end":23.9},
            {"word":"gobierno","start":23.9,"end":24.1},{"word":"gastaba","start":24.1,"end":24.48},
            {"word":"40","start":24.48,"end":24.9},{"word":"millones","start":24.9,"end":25.36},
            {"word":"en","start":25.36,"end":25.66},{"word":"asesores","start":25.66,"end":26.08},
            {"word":"y","start":26.08,"end":26.56},{"word":"en","start":26.56,"end":26.7},
            {"word":"2025","start":26.7,"end":27.08},{"word":"71","start":27.08,"end":28.3},
            {"word":"millones,","start":28.3,"end":28.56},{"word":"un","start":29.22,"end":29.5},
            {"word":"aumento","start":29.5,"end":29.72},{"word":"del","start":29.72,"end":29.96},
            {"word":"76","start":29.96,"end":31.06},{"word":"%","start":31.06,"end":31.48},
            {"word":"en","start":31.48,"end":31.88},{"word":"solo","start":31.88,"end":32.1},
            {"word":"7","start":32.1,"end":32.44},{"word":"años.","start":32.44,"end":32.84},
            {"word":"Y","start":33.34,"end":33.58},{"word":"todo","start":33.58,"end":33.78},
            {"word":"esto","start":33.78,"end":34.12},{"word":"mientras","start":34.12,"end":34.54},
            {"word":"la","start":34.54,"end":35.76},{"word":"legislatura","start":35.76,"end":36.38},
            {"word":"está","start":36.38,"end":36.82},{"word":"encallada,","start":36.82,"end":37.46},
            {"word":"sin","start":37.96,"end":38.08},{"word":"presupuestos,","start":38.08,"end":38.74},
            {"word":"sin","start":39,"end":39.12},{"word":"mayoría,","start":39.12,"end":39.46},
            {"word":"sin","start":40.06,"end":40.2},{"word":"más","start":40.2,"end":40.64},
            {"word":"asesores","start":40.64,"end":41.08},{"word":"y","start":41.08,"end":41.58},
            {"word":"además","start":41.58,"end":41.76},{"word":"menos","start":41.76,"end":42.08},
            {"word":"leyes.","start":42.08,"end":42.48},{"word":"Si","start":43.26,"end":43.7},
            {"word":"crees","start":43.7,"end":43.94},{"word":"que","start":43.94,"end":44.12},
            {"word":"hay","start":44.12,"end":44.32},{"word":"que","start":44.32,"end":44.76},
            {"word":"contarlo","start":44.76,"end":45.36},{"word":"dale","start":45.36,"end":46.08},
            {"word":"a","start":46.08,"end":46.24},{"word":"seguir,","start":46.24,"end":46.48},
            {"word":"porque","start":46.88,"end":47.18},{"word":"esto","start":47.18,"end":47.44},
            {"word":"no","start":47.44,"end":47.96},{"word":"sale","start":47.96,"end":48.16},
            {"word":"en","start":48.16,"end":48.32},{"word":"el","start":48.32,"end":48.42},
            {"word":"televiario.","start":48.42,"end":48.96},
          ],
          showCaptions: true,
          captionPreset: 'hormozi' as const,
          captionPosition: 'center' as const,
          handle: 'vitaminak.of',
          ctaText: 'Sígueme para más →',
          ctaDurationFrames: 80,
          accentColor: '#E63946',
          segments: [
            // 8.1s "609 asesores" → panel split derecha  (f243–f420)
            {
              mode: 'split-bottom' as const,
              startFrame: 230,
              endFrame: 420,
              panel: {
                type: 'stat' as const,
                value: '609',
                label: 'asesores en Moncloa',
                subtext: 'Récord histórico · Sánchez 2026',
                trend: 'up' as const,
              },
            },
            // 12.5s "1.264 cargos" → panel split derecha  (f375–f500)
            {
              mode: 'split-bottom' as const,
              startFrame: 435,
              endFrame: 560,
              panel: {
                type: 'stat' as const,
                value: '1.264',
                label: 'cargos en todo el Gobierno',
                trend: 'up' as const,
              },
            },
            // 14.4s "63%…453 nivel 30" → lista split izquierda  (f432–f670)
            {
              mode: 'split-top' as const,
              startFrame: 580,
              endFrame: 690,
              panel: {
                type: 'list' as const,
                title: 'Sin concurso público',
                items: ['453 en nivel 30', 'El rango más alto', 'Sin oposición'],
              },
            },
            // 29.96s "76%" → stat-pop flotante  (f899–f1000)
            {
              mode: 'stat-pop' as const,
              startFrame: 870,
              endFrame: 1010,
              value: '+76%',
              label: 'más gasto en asesores',
              subtext: '40M€ (2018) → 71M€ (2025)',
            },
            // 43.26s CTA → keyword cierre  (f1298–f1420)
            {
              mode: 'split-bottom' as const,
              startFrame: 1300,
              endFrame: 1430,
              panel: {
                type: 'keyword' as const,
                headline: 'Esto no sale en el telediario',
                highlight: 'telediario',
              },
            },
          ],
        }}
      />

      {/* ── CaptionsStyled — 7 presets en composiciones separadas para previsualizar ── */}
      {(['hormozi','bold','neon','box','outline','minimal','karaoke'] as const).map((preset) => (
        <Composition
          key={preset}
          id={`Captions_${preset}`}
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
