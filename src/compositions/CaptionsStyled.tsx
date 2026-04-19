/**
 * CaptionsStyled — Réplica élite del sistema de subtítulos de Captions App
 *
 * 7 presets profesionales:
 *  'hormozi'  — Amarillo sobre negro, el estilo más viral
 *  'bold'     — Mayúsculas masivas, palabra activa en accent
 *  'neon'     — Glow neón sobre fondo cristal
 *  'box'      — Cada palabra en su propio pill, activa llena de color
 *  'outline'  — Trazo vacío → relleno sólido al hablar
 *  'minimal'  — Línea fina, elegante, minimalista
 *  'karaoke'  — Relleno progresivo de izquierda a derecha
 *
 * Sistema de frases: agrupa palabras por pausas temporales (≤ 4 palabras por frase).
 * La frase se muestra junta; la palabra activa se diferencia visualmente.
 * Entre frases: slide-up + fade suave.
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { z } from 'zod';
import { BRAND } from '../brand/brand';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export const captionPresets = ['hormozi', 'bold', 'neon', 'box', 'outline', 'minimal', 'karaoke'] as const;
export type CaptionPreset = typeof captionPresets[number];

type Word = { word: string; start: number; end: number };
type Phrase = { words: Word[]; phraseStart: number; phraseEnd: number; phraseIdx: number };

export const captionsStyledSchema = z.object({
  words: z.array(z.object({ word: z.string(), start: z.number(), end: z.number() })),
  preset: z.enum(captionPresets).default('hormozi'),
  accent: z.string().default('#E63946'),
  position: z.enum(['top', 'center', 'bottom']).default('center'),
  maxWordsPerPhrase: z.number().default(4),
  gapThreshold: z.number().default(0.38),
  uppercase: z.boolean().default(false),
  shadow: z.boolean().default(true),
});
export type CaptionsStyledProps = z.infer<typeof captionsStyledSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// AGRUPACIÓN EN FRASES
// ─────────────────────────────────────────────────────────────────────────────

function buildPhrases(words: Word[], maxWords: number, gapSec: number): Phrase[] {
  const phrases: Phrase[] = [];
  let chunk: Word[] = [];

  const flush = () => {
    if (!chunk.length) return;
    phrases.push({
      words: chunk,
      phraseStart: chunk[0].start,
      phraseEnd: chunk[chunk.length - 1].end,
      phraseIdx: phrases.length,
    });
    chunk = [];
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = words[i - 1];
    const gap = prev ? w.start - prev.end : 0;

    if (chunk.length >= maxWords || (chunk.length > 0 && gap > gapSec)) flush();
    chunk.push(w);
  }
  flush();
  return phrases;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function isLightColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERERS POR PRESET
// ─────────────────────────────────────────────────────────────────────────────

type WordRendererProps = {
  word: string;
  isActive: boolean;
  isPast: boolean;      // spoken but no longer active
  isFuture: boolean;    // not yet spoken
  progress: number;     // 0→1 dentro de la palabra activa (para karaoke)
  entrySpring: number;  // spring de entrada de la frase
  wordSpring: number;   // spring individual de la palabra al activarse
  accent: string;
  preset: CaptionPreset;
  uppercase: boolean;
  shadow: boolean;
};

function WordRenderer(p: WordRendererProps) {
  const text = p.uppercase ? p.word.toUpperCase() : p.word;
  const FONT = BRAND.fonts.heading;
  const shadowBase = p.shadow ? '0 3px 16px rgba(0,0,0,0.95)' : 'none';
  const accentRgb = hexToRgb(p.accent);
  const onAccent = isLightColor(p.accent) ? '#000' : '#fff';

  switch (p.preset) {

    // ── HORMOZI ──────────────────────────────────────────────────────────────
    // Amarillo sobre pill negro, blanco para el resto
    case 'hormozi': {
      const scale = p.isActive ? 0.85 + p.wordSpring * 0.18 : 1;
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          fontSize: 62, fontWeight: 900, fontFamily: FONT,
          lineHeight: 1.15, letterSpacing: '-0.02em',
          margin: '0 4px',
          transform: `scale(${scale})`,
          transition: 'transform 0.05s',
          position: 'relative',
        }}>
          {p.isActive && (
            <span style={{
              position: 'absolute', inset: '-4px -14px',
              background: '#000',
              borderRadius: 10,
              zIndex: 0,
            }} />
          )}
          <span style={{
            position: 'relative', zIndex: 1,
            color: p.isActive ? '#FFD700' : 'rgba(255,255,255,0.95)',
            textShadow: p.isActive ? 'none' : shadowBase,
          }}>{text}</span>
        </span>
      );
    }

    // ── BOLD ─────────────────────────────────────────────────────────────────
    // Masivo, mayúsculas, activa en accent con glow
    case 'bold': {
      const scale = p.isActive ? 0.82 + p.wordSpring * 0.22 : 1;
      const opacity = p.isFuture ? 0.45 : 1;
      return (
        <span style={{
          display: 'inline-block',
          fontSize: 72, fontWeight: 900, fontFamily: FONT,
          lineHeight: 1.1, letterSpacing: '-0.03em',
          margin: '0 3px',
          color: p.isActive ? p.accent : 'rgba(255,255,255,0.92)',
          transform: `scale(${scale})`,
          opacity,
          textShadow: p.isActive
            ? `0 0 40px rgba(${accentRgb},0.7), ${shadowBase}`
            : shadowBase,
        }}>{text.toUpperCase()}</span>
      );
    }

    // ── NEON ─────────────────────────────────────────────────────────────────
    // Glow fluorescente sobre fondo cristal
    case 'neon': {
      const glow = p.isActive
        ? `drop-shadow(0 0 6px rgba(${accentRgb},1)) drop-shadow(0 0 18px rgba(${accentRgb},0.8)) drop-shadow(0 0 40px rgba(${accentRgb},0.4))`
        : 'none';
      const scale = p.isActive ? 0.88 + p.wordSpring * 0.16 : 1;
      const opacity = p.isFuture ? 0.3 : p.isPast ? 0.6 : 1;
      return (
        <span style={{
          display: 'inline-block',
          fontSize: 60, fontWeight: 800, fontFamily: FONT,
          lineHeight: 1.15, letterSpacing: '-0.02em',
          margin: '0 5px',
          color: p.isActive ? p.accent : '#ffffff',
          filter: glow,
          transform: `scale(${scale})`,
          opacity,
        }}>{text}</span>
      );
    }

    // ── BOX ───────────────────────────────────────────────────────────────────
    // Cada palabra en pill, activa: fondo lleno de accent
    case 'box': {
      const scale = p.isActive ? 0.88 + p.wordSpring * 0.14 : 1;
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          fontSize: 56, fontWeight: 800, fontFamily: FONT,
          lineHeight: 1.15, letterSpacing: '-0.01em',
          margin: '4px 5px',
          padding: '5px 18px',
          borderRadius: 12,
          backgroundColor: p.isActive ? p.accent : 'rgba(0,0,0,0.55)',
          color: p.isActive ? onAccent : 'rgba(255,255,255,0.82)',
          border: p.isActive ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
          transform: `scale(${scale})`,
          backdropFilter: 'blur(4px)',
        }}>{text}</span>
      );
    }

    // ── OUTLINE ───────────────────────────────────────────────────────────────
    // Trazo vacío → relleno al hablar
    case 'outline': {
      const scale = p.isActive ? 0.86 + p.wordSpring * 0.18 : 1;
      const strokeColor = p.isActive ? p.accent : 'rgba(255,255,255,0.7)';
      const fillColor = p.isActive ? p.accent : 'transparent';
      return (
        <span style={{
          display: 'inline-block',
          fontSize: 70, fontWeight: 900, fontFamily: FONT,
          lineHeight: 1.1, letterSpacing: '-0.03em',
          margin: '0 4px',
          color: fillColor,
          WebkitTextStroke: `2.5px ${strokeColor}`,
          transform: `scale(${scale})`,
          textShadow: p.isActive ? `0 0 30px rgba(${accentRgb},0.5)` : 'none',
        }}>{text.toUpperCase()}</span>
      );
    }

    // ── MINIMAL ───────────────────────────────────────────────────────────────
    // Elegante, fino, sutil
    case 'minimal': {
      const opacity = p.isActive ? 1 : p.isFuture ? 0.3 : 0.55;
      const scale = p.isActive ? 0.92 + p.wordSpring * 0.1 : 1;
      return (
        <span style={{
          display: 'inline-block',
          fontSize: 48, fontWeight: p.isActive ? 700 : 400, fontFamily: FONT,
          lineHeight: 1.2, letterSpacing: p.isActive ? '-0.02em' : '0.01em',
          margin: '0 6px',
          color: p.isActive ? p.accent : '#ffffff',
          opacity,
          transform: `scale(${scale})`,
          textDecoration: p.isActive ? 'underline' : 'none',
          textDecorationColor: p.accent,
          textDecorationThickness: '2px',
          textUnderlineOffset: '4px',
        }}>{text}</span>
      );
    }

    // ── KARAOKE ───────────────────────────────────────────────────────────────
    // Relleno progresivo de izquierda a derecha
    case 'karaoke': {
      const scale = p.isActive ? 0.92 + p.wordSpring * 0.1 : 1;
      const opacity = p.isFuture ? 0.35 : 1;
      const fillPct = p.isActive ? p.progress * 100 : p.isPast ? 100 : 0;
      return (
        <span style={{
          display: 'inline-block', position: 'relative',
          fontSize: 64, fontWeight: 900, fontFamily: FONT,
          lineHeight: 1.12, letterSpacing: '-0.025em',
          margin: '0 4px',
          transform: `scale(${scale})`,
          opacity,
        }}>
          {/* Base — blanco */}
          <span style={{ color: 'rgba(255,255,255,0.45)', position: 'relative', zIndex: 1 }}>{text}</span>
          {/* Fill — accent, clipeado */}
          <span style={{
            position: 'absolute', top: 0, left: 0,
            color: p.accent,
            clipPath: `inset(0 ${100 - fillPct}% 0 0)`,
            textShadow: `0 0 20px rgba(${accentRgb},0.6)`,
            whiteSpace: 'nowrap',
            zIndex: 2,
          }}>{text}</span>
        </span>
      );
    }

    default: return <span>{text}</span>;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PHRASE RENDERER — anima la frase completa de entrada/salida
// ─────────────────────────────────────────────────────────────────────────────

type PhraseRendererProps = {
  phrase: Phrase;
  currentTime: number;
  frame: number;
  fps: number;
  preset: CaptionPreset;
  accent: string;
  uppercase: boolean;
  shadow: boolean;
};

function PhraseRenderer({ phrase, currentTime, frame, fps, preset, accent, uppercase, shadow }: PhraseRendererProps) {
  const ENTRY_FRAMES = 14;
  const phraseFrameStart = Math.floor(phrase.phraseStart * fps);
  const entryFrame = Math.max(0, frame - phraseFrameStart);

  const entrySpring = spring({
    frame: Math.min(entryFrame, ENTRY_FRAMES * 3),
    fps,
    config: { damping: 22, stiffness: 180, mass: 0.7 },
  });

  const entryY   = interpolate(entrySpring, [0, 1], [28, 0]);
  const entryOp  = interpolate(entrySpring, [0, 1], [0, 1]);

  // Salida suave si el siguiente chunk va a entrar pronto
  const phraseEnd = phrase.phraseEnd;
  const timeToEnd = phraseEnd - currentTime;
  const exitOp = interpolate(timeToEnd, [0.05, 0.25], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const opacity = Math.min(entryOp, exitOp);

  // Fondo de frase (solo para algunos presets)
  const showPhraseBg = preset === 'neon';
  const bgPhrase: React.CSSProperties = showPhraseBg ? {
    background: 'rgba(0,0,0,0.52)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    padding: '12px 28px',
    margin: '0 -28px',
  } : {};

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap',
      justifyContent: 'center', alignItems: 'center',
      gap: preset === 'box' ? '0px' : '0px',
      transform: `translateY(${entryY}px)`,
      opacity,
      ...bgPhrase,
    }}>
      {phrase.words.map((w, i) => {
        const isActive = currentTime >= w.start && currentTime <= w.end;
        const isPast   = currentTime > w.end;
        const isFuture = currentTime < w.start;
        const progress = isActive
          ? interpolate(currentTime, [w.start, w.end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : 0;

        const wordActivationFrame = Math.max(0, frame - Math.floor(w.start * fps));
        const wordSpring = spring({
          frame: Math.min(wordActivationFrame, 20),
          fps,
          config: { damping: 8, stiffness: 280, mass: 0.6 },
        });

        return (
          <WordRenderer
            key={i}
            word={w.word}
            isActive={isActive}
            isPast={isPast}
            isFuture={isFuture}
            progress={progress}
            entrySpring={entrySpring}
            wordSpring={wordSpring}
            accent={accent}
            preset={preset}
            uppercase={uppercase}
            shadow={shadow}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const CaptionsStyled: React.FC<CaptionsStyledProps> = ({
  words,
  preset = 'hormozi',
  accent = BRAND.colors.accent,
  position = 'center',
  maxWordsPerPhrase = 4,
  gapThreshold = 0.38,
  uppercase = false,
  shadow = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Construir frases
  const phrases = React.useMemo(
    () => buildPhrases(words, maxWordsPerPhrase, gapThreshold),
    [words, maxWordsPerPhrase, gapThreshold],
  );

  // Frase activa: la que incluye el tiempo actual, o la última antes del tiempo actual
  const activePhrase = phrases.find(
    p => currentTime >= p.phraseStart - 0.1 && currentTime <= p.phraseEnd + 0.3,
  );

  if (!activePhrase) return null;

  // Posición vertical
  const posStyle: React.CSSProperties =
    position === 'bottom'
      ? { bottom: 120, top: 'auto' }
      : position === 'top'
      ? { top: 120, bottom: 'auto' }
      : { top: '50%', transform: 'translateY(-50%)' };

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '0 32px',
      ...posStyle,
      pointerEvents: 'none',
    }}>
      <PhraseRenderer
        phrase={activePhrase}
        currentTime={currentTime}
        frame={frame}
        fps={fps}
        preset={preset}
        accent={accent}
        uppercase={uppercase}
        shadow={shadow}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STANDALONE COMPOSITION (para previsualizar estilos directamente en Studio)
// ─────────────────────────────────────────────────────────────────────────────

const demoWords: Word[] = [
  { word: "609", start: 0.2, end: 0.7 },
  { word: "asesores", start: 0.8, end: 1.5 },
  { word: "en", start: 1.6, end: 1.8 },
  { word: "Moncloa,", start: 1.9, end: 2.5 },
  { word: "y", start: 3.0, end: 3.1 },
  { word: "nadie", start: 3.2, end: 3.6 },
  { word: "sabe", start: 3.7, end: 3.95 },
  { word: "cuánto", start: 4.0, end: 4.4 },
  { word: "cobran.", start: 4.5, end: 5.0 },
  { word: "Eso", start: 5.8, end: 6.0 },
  { word: "no", start: 6.1, end: 6.25 },
  { word: "sale", start: 6.3, end: 6.55 },
  { word: "en", start: 6.6, end: 6.7 },
  { word: "el", start: 6.75, end: 6.85 },
  { word: "telediario.", start: 6.9, end: 7.5 },
];

export const CaptionsStyledDemo: React.FC<{ preset: CaptionPreset; accent: string; position: 'top'|'center'|'bottom' }> = ({
  preset = 'hormozi',
  accent = '#E63946',
  position = 'center',
}) => {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#111' }}>
      <CaptionsStyled
        words={demoWords}
        preset={preset}
        accent={accent}
        position={position}
        maxWordsPerPhrase={4}
        gapThreshold={0.38}
        uppercase={preset === 'bold' || preset === 'outline'}
        shadow={true}
      />
    </div>
  );
};

export { demoWords };
