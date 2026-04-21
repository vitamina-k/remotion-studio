/**
 * HybridReel — Footage + DataStory fusion
 *
 * Modos por segmento:
 *   footage      → vídeo pantalla completa + captions CapCut
 *   split-bottom → vídeo arriba (50%), panel abajo (50%)
 *   split-top    → panel arriba (50%), vídeo abajo (50%)
 *   stat-pop     → vídeo completo + stat flotante encima
 */

import React from 'react';
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { z } from 'zod';
import { BRAND } from '../brand/brand';
import { CaptionsStyled, captionPresets } from './CaptionsStyled';

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const captionWordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});

const panelContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('stat'),
    value: z.string(),
    label: z.string(),
    subtext: z.string().optional(),
    trend: z.enum(['up', 'down', 'neutral']).optional(),
  }),
  z.object({
    type: z.literal('keyword'),
    headline: z.string(),
    highlight: z.string(),
    subtext: z.string().optional(),
  }),
  z.object({
    type: z.literal('quote'),
    text: z.string(),
    source: z.string().optional(),
  }),
  z.object({
    type: z.literal('hook'),
    text: z.string(),
    subtext: z.string().optional(),
  }),
  z.object({
    type: z.literal('list'),
    title: z.string().optional(),
    items: z.array(z.string()),
  }),
]);

const toneSchema = z.enum(['negative', 'positive', 'neutral']).optional().default('neutral');

const dataIndexField = z.number().optional(); // qué dato es (1, 2, 3…) para el contador

const segmentSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('split-bottom'),
    startFrame: z.number(),
    endFrame: z.number(),
    panel: panelContentSchema,
    tone: toneSchema,
    dataIndex: dataIndexField,
  }),
  z.object({
    mode: z.literal('split-top'),
    startFrame: z.number(),
    endFrame: z.number(),
    panel: panelContentSchema,
    tone: toneSchema,
    dataIndex: dataIndexField,
  }),
  z.object({
    mode: z.literal('stat-pop'),
    startFrame: z.number(),
    endFrame: z.number(),
    value: z.string(),
    label: z.string(),
    subtext: z.string().optional(),
    tone: toneSchema,
    dataIndex: dataIndexField,
  }),
  z.object({
    mode: z.literal('overlay-card'),
    startFrame: z.number(),
    endFrame: z.number(),
    eyebrow: z.string(),
    value: z.string(),
    label: z.string(),
    source: z.string().optional(),
    tone: toneSchema,
    dataIndex: dataIndexField,
  }),
]);

export const hybridReelSchema = z.object({
  videoSrc: z.string().default(''),
  durationFrames: z.number().default(300),
  captions: z.array(captionWordSchema).optional().default([]),
  showCaptions: z.boolean().optional().default(true),
  captionPreset: z.enum(captionPresets).optional().default('hormozi'),
  captionPosition: z.enum(['top', 'center', 'bottom']).optional().default('center'),
  // 'phrases' = subtítulos grupales (original) | 'keyword-xl' = 1-2 palabras grandes
  captionMode: z.enum(['phrases', 'keyword-xl']).optional().default('phrases'),
  handle: z.string().optional().default('vitaminak.of'),
  ctaText: z.string().optional().default('Sígueme para más →'),
  ctaDurationFrames: z.number().optional().default(50),
  accentColor: z.string().optional().default('#E63946'),
  segments: z.array(segmentSchema).optional().default([]),
  // Badge BREAKING/CONFIRMADO/EXCLUSIVA
  alertBadge: z.object({
    text: z.string(),
    tone: toneSchema,
    startFrame: z.number().optional().default(0),
    holdFrames: z.number().optional().default(90), // frames visibles tras el blink
  }).optional(),
  // Reacción de borde en frames específicos
  borderFlashes: z.array(z.object({
    frame: z.number(),
    tone: toneSchema,
    duration: z.number().optional().default(18),
  })).optional().default([]),
  // Contador de datos "● 1 / 3"
  dataCounter: z.object({
    total: z.number(),
  }).optional(),
});

export type HybridReelProps = z.infer<typeof hybridReelSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Parsea números en notación española: 458.000 → 458000, 1.264 → 1264
function parseSpanishNum(value: string): { num: number; isNum: boolean; prefix: string; suffix: string } {
  const prefix = value.startsWith('+') ? '+' : '';
  const cleaned = value.replace(/[^0-9.,]/g, '');
  // Detecta separador de miles español: dígitos + punto + exactamente 3 dígitos (repetible)
  const isThousands = /^\d{1,3}(\.\d{3})+$/.test(cleaned);
  const normalized = isThousands ? cleaned.replace(/\./g, '') : cleaned.replace(',', '.');
  const num = parseFloat(normalized);
  const isNum = !isNaN(num) && isFinite(num);
  const suffix = isNum ? value.replace(/[+\-0-9.,]/g, '') : '';
  return { num, isNum, prefix, suffix };
}

// ─── SISTEMA DE TONOS SEMÁNTICOS ────────────────────────────────────────────
// rojo = dato negativo / corrupción / pérdida
// verde = logro / propuesta buena / cifra positiva
// azul  = dato neutro / cita / contexto
const TONE_COLORS = {
  negative: '#E63946',
  positive: '#22C55E',
  neutral:  '#3B82F6',
} as const;

type Tone = 'negative' | 'positive' | 'neutral';

function resolveAccent(tone: Tone | null | undefined, fallback: string): string {
  if (tone && tone in TONE_COLORS) return TONE_COLORS[tone as keyof typeof TONE_COLORS];
  return fallback;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function useSplitAmt(frame: number, fps: number, startFrame: number, endFrame: number): number {
  if (frame < startFrame || frame > endFrame) return 0;
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;
  const TRANS = 20;
  const enter = spring({ frame: localFrame, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  const exitLocal = Math.max(0, localFrame - (totalFrames - TRANS));
  const exit = spring({ frame: exitLocal, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  return Math.max(0, Math.min(1, enter - exit));
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL COMPONENTS  (cada uno renderiza en 1080 × 960 — mitad inferior/superior)
// ─────────────────────────────────────────────────────────────────────────────

type PanelProps = {
  content: z.infer<typeof panelContentSchema>;
  frame: number;
  fps: number;
  accent: string;
  tone: Tone;
};

/* ── STAT PANEL ── */
function StatPanel({ content, frame, fps, accent, tone }: PanelProps) {
  if (content.type !== 'stat') return null;
  const f = Math.min(frame, 80);
  const entryS = spring({ frame: f, fps, config: { damping: 18, stiffness: 100, mass: 0.8 } });
  const progress = interpolate(f, [0, 55], [0, 1], { extrapolateRight: 'clamp' });

  const { num: numVal, isNum, prefix, suffix } = parseSpanishNum(content.value);
  const displayNum = isNum ? Math.round(numVal * progress) : 0;

  const trendColor = content.trend === 'up' ? BRAND.colors.green : content.trend === 'down' ? BRAND.colors.red : accent;
  const trendArrow = content.trend === 'up' ? '↑' : content.trend === 'down' ? '↓' : '';

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 48 }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 80% at 50% 50%, rgba(${hexToRgb(accent)},0.16) 0%, transparent 70%)` }} />

      {trendArrow && (
        <div style={{ fontSize: 80, color: trendColor, fontWeight: 900, fontFamily: BRAND.fonts.heading, transform: `scale(${entryS})`, textShadow: `0 0 40px ${trendColor}` }}>{trendArrow}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {/* Número grande */}
        <div style={{
          fontSize: isNum && numVal >= 1000 ? 110 : 130,
          fontWeight: 900, color: accent,
          fontFamily: BRAND.fonts.heading, lineHeight: 1,
          transform: `scale(${entryS})`,
          textShadow: `0 0 70px rgba(${hexToRgb(accent)},0.6)`,
          letterSpacing: '-0.03em',
        }}>
          {prefix}{isNum ? displayNum.toLocaleString('es-ES') : content.value}{suffix}
        </div>

        {/* Label */}
        <div style={{
          fontSize: 34, color: 'rgba(255,255,255,0.85)',
          fontFamily: BRAND.fonts.heading, fontWeight: 700,
          textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.07em',
          opacity: entryS, transform: `translateY(${interpolate(entryS, [0, 1], [16, 0])}px)`,
          maxWidth: 600,
        }}>{content.label}</div>

        {content.subtext && (
          <div style={{
            fontSize: 24, color: 'rgba(255,255,255,0.4)',
            fontFamily: BRAND.fonts.heading, textAlign: 'center',
            opacity: interpolate(f, [20, 50], [0, 0.4], { extrapolateRight: 'clamp' }),
          }}>{content.subtext}</div>
        )}
      </div>

      {/* Línea accent inferior */}
      <div style={{
        position: 'absolute', bottom: 40,
        width: `${interpolate(entryS, [0, 1], [0, 60])}%`,
        height: 3, backgroundColor: accent, borderRadius: 2,
        boxShadow: `0 0 20px rgba(${hexToRgb(accent)},0.7)`,
      }} />
    </AbsoluteFill>
  );
}

/* ── KEYWORD PANEL ── */
function KeywordPanel({ content, frame, fps, accent, tone: _tone }: PanelProps) {
  if (content.type !== 'keyword') return null;
  const words = content.headline.split(' ');
  const DELAY = 5;
  const entryS = spring({ frame: Math.min(frame, 60), fps, config: { damping: 20, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: '0 60px' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(${hexToRgb(accent)},0.12) 0%, transparent 70%)` }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 12px', justifyContent: 'center', alignItems: 'center' }}>
        {words.map((w, i) => {
          const localF = Math.max(0, frame - i * DELAY);
          const s = spring({ frame: Math.min(localF, 40), fps, config: { damping: 18, stiffness: 130 } });
          const isHL = content.highlight.toLowerCase().includes(w.toLowerCase().replace(/[^a-zñáéíóú]/gi, ''));
          return (
            <div key={i} style={{
              fontSize: isHL ? 72 : 54,
              fontWeight: 900,
              color: isHL ? accent : 'rgba(255,255,255,0.9)',
              fontFamily: BRAND.fonts.heading,
              textShadow: isHL ? `0 0 50px rgba(${hexToRgb(accent)},0.7)` : 'none',
              transform: `scale(${s}) translateY(${interpolate(s, [0, 1], [18, 0])}px)`,
              opacity: s, lineHeight: 1.15, letterSpacing: '-0.02em',
            }}>{w}</div>
          );
        })}
      </div>
      {content.subtext && (
        <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.45)', fontFamily: BRAND.fonts.heading, textAlign: 'center', opacity: interpolate(frame, [20, 45], [0, 0.45], { extrapolateRight: 'clamp' }) }}>{content.subtext}</div>
      )}
      <div style={{ position: 'absolute', bottom: 36, width: `${interpolate(entryS, [0, 1], [0, 55])}%`, height: 3, backgroundColor: accent, borderRadius: 2, boxShadow: `0 0 18px rgba(${hexToRgb(accent)},0.65)` }} />
    </AbsoluteFill>
  );
}

/* ── QUOTE PANEL ── */
function QuotePanel({ content, frame, fps, accent, tone: _tone }: PanelProps) {
  if (content.type !== 'quote') return null;
  const qS = spring({ frame: Math.min(frame, 30), fps, config: { damping: 16, stiffness: 80 } });
  const textS = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 20, stiffness: 100 } });
  const srcS = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 20, stiffness: 100 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 40, padding: '0 60px' }}>
      <div style={{ fontSize: 120, color: accent, lineHeight: 0.8, fontFamily: 'Georgia, serif', transform: `scale(${qS})`, textShadow: `0 0 40px rgba(${hexToRgb(accent)},0.5)`, alignSelf: 'flex-start', flexShrink: 0, paddingTop: 20 }}>"</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.93)', fontFamily: BRAND.fonts.heading, fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.01em', opacity: textS, transform: `translateY(${interpolate(textS, [0, 1], [14, 0])}px)` }}>{content.text}</div>
        {content.source && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: srcS }}>
            <div style={{ width: 32, height: 2, backgroundColor: accent, borderRadius: 1 }} />
            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.45)', fontFamily: BRAND.fonts.heading, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{content.source}</div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* ── HOOK PANEL ── */
function HookPanel({ content, frame, fps, accent, tone: _tone }: PanelProps) {
  if (content.type !== 'hook') return null;
  const CHARS_PER_FRAME = 0.6;
  const charsVisible = Math.floor(frame * CHARS_PER_FRAME);
  const done = charsVisible >= content.text.length;
  const showCursor = !done || Math.floor(frame / 15) % 2 === 0;
  const subS = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 20, stiffness: 100 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28, padding: '0 60px' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(${hexToRgb(accent)},0.1) 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: `${interpolate(Math.min(frame, 18), [0, 18], [0, 100])}%`, height: 3, backgroundColor: accent, boxShadow: `0 0 20px ${accent}` }} />
      <div style={{ fontSize: 50, fontWeight: 900, color: BRAND.colors.white, fontFamily: BRAND.fonts.heading, textAlign: 'center', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
        {content.text.slice(0, charsVisible)}{showCursor && <span style={{ color: accent, marginLeft: 2 }}>|</span>}
      </div>
      {content.subtext && (
        <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.45)', fontFamily: BRAND.fonts.heading, textAlign: 'center', opacity: subS, transform: `translateY(${interpolate(subS, [0, 1], [14, 0])}px)` }}>{content.subtext}</div>
      )}
    </AbsoluteFill>
  );
}

/* ── LIST PANEL ── */
function ListPanel({ content, frame, fps, accent, tone: _tone }: PanelProps) {
  if (content.type !== 'list') return null;
  const ITEM_DELAY = 16;
  const titleS = spring({ frame: Math.min(frame, 30), fps, config: { damping: 20, stiffness: 110 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: '0 80px' }}>
      {content.title && (
        <div style={{ fontSize: 30, fontWeight: 800, color: accent, fontFamily: BRAND.fonts.heading, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: titleS, transform: `translateY(${interpolate(titleS, [0, 1], [-14, 0])}px)`, marginBottom: 8 }}>{content.title}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px 32px', justifyContent: 'center' }}>
        {content.items.map((item, i) => {
          const localF = Math.max(0, frame - i * ITEM_DELAY - 10);
          const s = spring({ frame: Math.min(localF, 30), fps, config: { damping: 20, stiffness: 120 } });
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: s, transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)` }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: accent, flexShrink: 0, boxShadow: `0 0 14px ${accent}` }} />
              <div style={{ fontSize: 38, fontWeight: 700, color: BRAND.colors.white, fontFamily: BRAND.fonts.heading, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{item}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function PanelContent({ content, frame, fps, accent, tone }: PanelProps) {
  switch (content.type) {
    case 'stat':    return <StatPanel    content={content} frame={frame} fps={fps} accent={accent} tone={tone} />;
    case 'keyword': return <KeywordPanel content={content} frame={frame} fps={fps} accent={accent} tone={tone} />;
    case 'quote':   return <QuotePanel   content={content} frame={frame} fps={fps} accent={accent} tone={tone} />;
    case 'hook':    return <HookPanel    content={content} frame={frame} fps={fps} accent={accent} tone={tone} />;
    case 'list':    return <ListPanel    content={content} frame={frame} fps={fps} accent={accent} tone={tone} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TOP PROGRESS BAR — reemplaza el círculo, fino y limpio como Stories
// ─────────────────────────────────────────────────────────────────────────────

function TopProgressBar({ frame, durationFrames }: { frame: number; durationFrames: number; accentColor: string }) {
  const pct = Math.min(1, frame / durationFrames);
  const appear = spring({ frame: Math.min(frame, 8), fps: 30, config: { damping: 20, stiffness: 200 } });

  // Transición suave: rojo → amarillo → verde según progreso
  const r = Math.round(interpolate(pct, [0, 0.5, 1], [230, 250, 34],  { extrapolateRight: 'clamp' }));
  const g = Math.round(interpolate(pct, [0, 0.5, 1], [57,  204, 197], { extrapolateRight: 'clamp' }));
  const b = Math.round(interpolate(pct, [0, 0.5, 1], [70,  21,  94],  { extrapolateRight: 'clamp' }));
  const color = `rgb(${r},${g},${b})`;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.07)', zIndex: 100 }}>
      <div style={{
        height: '100%',
        width: `${pct * 100}%`,
        background: `linear-gradient(90deg, #E63946 0%, #FACC15 50%, ${color} 100%)`,
        boxShadow: `0 0 12px ${color}cc`,
        borderRadius: '0 2px 2px 0',
        opacity: appear,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ALERT BADGE — etiqueta BREAKING/CONFIRMADO que cae y parpadea
// ─────────────────────────────────────────────────────────────────────────────

function AlertBadge({ frame, fps, text, tone, startFrame, holdFrames }: {
  frame: number; fps: number;
  text: string; tone: Tone;
  startFrame: number; holdFrames: number;
}) {
  const localF = frame - startFrame;
  if (localF < 0) return null;

  const accent = TONE_COLORS[tone] ?? TONE_COLORS.negative;
  const rgb = hexToRgb(accent);

  // Entrada con spring
  const enter = spring({ frame: Math.min(localF, 20), fps, config: { damping: 20, stiffness: 160 } });
  // Parpadeo × 3 en frames 0-45
  const blinkCycle = localF < 45 ? Math.floor(localF / 8) % 2 : 1;
  const visible = enter * blinkCycle;

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      transform: `translateY(${interpolate(enter, [0, 1], [-40, 0])}px)`,
      opacity: visible,
      zIndex: 110,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: accent,
        color: '#fff',
        fontSize: 22, fontWeight: 900,
        fontFamily: BRAND.fonts.heading,
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        padding: '8px 28px',
        borderRadius: 6,
        boxShadow: `0 0 30px rgba(${rgb},0.7), 0 4px 16px rgba(0,0,0,0.5)`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 14, opacity: 0.8 }}>●</span>
        {text}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CAPTIONS KEYWORD XL — 1-2 palabras grandes, sin fondo, impacto directo
// ─────────────────────────────────────────────────────────────────────────────

function CaptionsKeywordXL({ words, frame, fps, accent }: {
  words: { word: string; start: number; end: number }[];
  frame: number; fps: number; accent: string;
}) {
  const currentTime = frame / fps;
  // Busca la palabra activa
  const active = words.find(w => currentTime >= w.start && currentTime <= w.end);
  if (!active) return null;

  // Qué palabras forman el grupo actual (agrupa por gap < 0.5s)
  const idx = words.indexOf(active);
  const group: typeof words = [active];
  // máximo 2 palabras por grupo
  const next = words[idx + 1];
  if (next && next.start - active.end < 0.4 && group.length < 2) group.push(next);

  const wordKey = group.map(w => w.word).join('-');
  const entryF = Math.round(active.start * fps);
  const localF = frame - entryF;
  const s = spring({ frame: Math.min(localF, 12), fps, config: { damping: 16, stiffness: 160, mass: 0.7 } });

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0,
      top: '50%', transform: `translateY(-50%) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: 16, padding: '0 60px',
      opacity: s,
      pointerEvents: 'none',
    }}>
      {group.map((w, i) => {
        const isActive = currentTime >= w.start && currentTime <= w.end;
        return (
          <div key={`${wordKey}-${i}`} style={{
            fontSize: 88, fontWeight: 900,
            fontFamily: BRAND.fonts.heading,
            lineHeight: 1.1, letterSpacing: '-0.03em',
            color: isActive ? accent : BRAND.colors.white,
            textShadow: isActive
              ? `0 0 60px rgba(${hexToRgb(accent)},0.8), 0 2px 30px rgba(0,0,0,0.95)`
              : '0 2px 30px rgba(0,0,0,0.95)',
            transition: 'color 0.05s',
          }}>{w.word}</div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BORDER FLASH — bordes de pantalla pulsan con el color del tono
// ─────────────────────────────────────────────────────────────────────────────

function BorderFlash({ frame, flashes, accentColor }: {
  frame: number;
  flashes: { frame: number; tone?: Tone; duration?: number }[];
  accentColor: string;
}) {
  // Busca el flash más cercano activo
  const active = flashes.find(f => frame >= f.frame && frame <= f.frame + (f.duration ?? 18));
  if (!active) return null;

  const localF = frame - active.frame;
  const dur = active.duration ?? 18;
  const accent = resolveAccent(active.tone, accentColor);
  const rgb = hexToRgb(accent);

  // Pulso: sube rápido, baja despacio
  const intensity = interpolate(localF, [0, 3, dur * 0.4, dur], [0, 1, 0.7, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 200,
      boxShadow: `inset 0 0 ${80 * intensity}px rgba(${rgb},${0.75 * intensity}), inset 0 0 ${160 * intensity}px rgba(${rgb},${0.35 * intensity})`,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DATA COUNTER — "● 1 / 3" indicador de dato activo
// ─────────────────────────────────────────────────────────────────────────────

function DataCounter({ current, total, frame, fps, accent }: {
  current: number; total: number;
  frame: number; fps: number; accent: string;
}) {
  const appear = spring({ frame: Math.min(frame, 15), fps, config: { damping: 20, stiffness: 160 } });
  const rgb = hexToRgb(accent);
  return (
    <div style={{
      position: 'absolute', bottom: 140, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
      opacity: appear,
      transform: `translateY(${interpolate(appear, [0, 1], [12, 0])}px)`,
      zIndex: 90,
    }}>
      {/* Dots */}
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i < current;
        const isCurrent = i === current - 1;
        return (
          <div key={i} style={{
            width: isCurrent ? 28 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isActive ? accent : 'rgba(255,255,255,0.2)',
            boxShadow: isCurrent ? `0 0 12px rgba(${rgb},0.8)` : 'none',
            transition: 'all 0.3s ease',
          }} />
        );
      })}
      <div style={{
        fontSize: 20, fontWeight: 800,
        color: 'rgba(255,255,255,0.5)',
        fontFamily: BRAND.fonts.heading,
        letterSpacing: '0.04em',
        marginLeft: 6,
      }}>{current}<span style={{ color: 'rgba(255,255,255,0.25)' }}> / {total}</span></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERLAY CARD — tarjeta glassmorphism flotante sobre el vídeo completo
// ─────────────────────────────────────────────────────────────────────────────

function OverlayCard({ frame, fps, startFrame, endFrame, eyebrow, value, label, source, accent }: {
  frame: number; fps: number; startFrame: number; endFrame: number;
  eyebrow: string; value: string; label: string; source?: string; accent: string;
}) {
  if (frame < startFrame || frame > endFrame) return null;
  const localF = frame - startFrame;
  const totalF = endFrame - startFrame;
  const TRANS = 20;

  const enter = spring({ frame: Math.min(localF, TRANS * 3), fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  const exitLocal = Math.max(0, localF - (totalF - TRANS));
  const exitS = spring({ frame: exitLocal, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  const amt = Math.max(0, Math.min(1, enter - exitS));

  // Número animado contando
  const { num: raw, isNum, prefix, suffix } = parseSpanishNum(value);
  const progress = interpolate(Math.min(localF, 55), [0, 55], [0, 1], { extrapolateRight: 'clamp' });
  const displayNum = isNum ? Math.round(raw * progress) : 0;
  const displayValue = isNum ? `${prefix}${displayNum.toLocaleString('es-ES')}` : value;

  // Separar el sufijo del resto para colorear solo el símbolo (€, %, etc.)
  const hasSuffix = isNum && suffix.length > 0;

  return (
    <div style={{
      position: 'absolute',
      bottom: 220,
      left: 32, right: 32,
      background: 'rgba(8,8,8,0.84)',
      backdropFilter: 'blur(28px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 28,
      padding: '28px 32px 24px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transform: `translateY(${interpolate(amt, [0, 1], [40, 0])}px) scale(${interpolate(amt, [0, 1], [0.96, 1])})`,
      opacity: amt,
      boxShadow: `0 32px 72px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)`,
      overflow: 'hidden',
    }}>
      {/* Línea de acento superior con tono */}
      <div style={{
        position: 'absolute',
        top: 0, left: 40, right: 40, height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: 0.9,
      }} />

      {/* Eyebrow tag */}
      <div style={{
        fontSize: 20, fontWeight: 800,
        color: accent,
        fontFamily: BRAND.fonts.heading,
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        opacity: interpolate(localF, [5, 20], [0, 1], { extrapolateRight: 'clamp' }),
      }}>{eyebrow}</div>

      {/* Número grande */}
      <div style={{
        fontSize: 96, fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        fontFamily: BRAND.fonts.heading,
        fontVariantNumeric: 'tabular-nums',
        color: BRAND.colors.white,
      }}>
        {displayValue}
        {hasSuffix && (
          <span style={{ color: accent, fontSize: 64 }}>{suffix}</span>
        )}
      </div>

      {/* Label */}
      <div style={{
        fontSize: 28, fontWeight: 500,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: BRAND.fonts.heading,
        lineHeight: 1.35,
        opacity: interpolate(localF, [12, 30], [0, 1], { extrapolateRight: 'clamp' }),
      }}>{label}</div>

      {/* Source */}
      {source && (
        <div style={{
          fontSize: 20, fontWeight: 600,
          color: 'rgba(255,255,255,0.22)',
          fontFamily: BRAND.fonts.heading,
          letterSpacing: '0.05em',
          textTransform: 'uppercase' as const,
          marginTop: 4,
          opacity: interpolate(localF, [20, 40], [0, 1], { extrapolateRight: 'clamp' }),
        }}>{source}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIVIDER HORIZONTAL
// ─────────────────────────────────────────────────────────────────────────────

function SplitDivider({ splitAmt, accent, width }: { splitAmt: number; accent: string; width: number }) {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: 0,
      width: `${splitAmt * 100}%`, height: 3,
      backgroundColor: accent,
      boxShadow: `0 0 24px ${accent}, 0 0 48px rgba(${hexToRgb(accent)},0.4)`,
      transform: 'translateY(-50%)',
      borderRadius: 2,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT POP OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

function StatPopOverlay({ frame, fps, startFrame, endFrame, value, label, subtext, accent }: {
  frame: number; fps: number; startFrame: number; endFrame: number;
  value: string; label: string; subtext?: string; accent: string;
}) {
  if (frame < startFrame || frame > endFrame) return null;
  const localF = frame - startFrame;
  const totalF = endFrame - startFrame;
  const TRANS = 18;
  const enter = spring({ frame: Math.min(localF, TRANS * 3), fps, config: { damping: 18, stiffness: 130 } });
  const exitLocal = Math.max(0, localF - (totalF - TRANS));
  const exitS = spring({ frame: exitLocal, fps, config: { damping: 18, stiffness: 130 } });
  const amt = Math.max(0, Math.min(1, enter - exitS));

  const { num: raw, isNum, prefix, suffix } = parseSpanishNum(value);
  const progress = interpolate(Math.min(localF, 55), [0, 55], [0, 1], { extrapolateRight: 'clamp' });
  const displayNum = isNum ? Math.round(raw * progress) : 0;

  return (
    <div style={{
      position: 'absolute', bottom: 220, right: 48,
      background: 'rgba(8,8,8,0.90)', backdropFilter: 'blur(20px)',
      border: `2px solid rgba(${hexToRgb(accent)},0.5)`,
      borderRadius: 24, padding: '36px 52px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      transform: `scale(${amt}) translateX(${interpolate(amt, [0, 1], [100, 0])}px)`,
      opacity: amt,
      boxShadow: `0 0 80px rgba(${hexToRgb(accent)},0.35), inset 0 1px 0 rgba(255,255,255,0.06)`,
      minWidth: 240,
    }}>
      <div style={{ fontSize: 80, fontWeight: 900, color: accent, fontFamily: BRAND.fonts.heading, lineHeight: 1, letterSpacing: '-0.03em', textShadow: `0 0 50px rgba(${hexToRgb(accent)},0.65)` }}>
        {prefix}{isNum ? displayNum.toLocaleString('es-ES') : value}{suffix}
      </div>
      <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', fontFamily: BRAND.fonts.heading, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>{label}</div>
      {subtext && <div style={{ fontSize: 19, color: 'rgba(255,255,255,0.38)', fontFamily: BRAND.fonts.heading, textAlign: 'center' }}>{subtext}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPTIONS
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// CIRCULAR PROGRESS — grande y llamativo con número dentro
// CircularProgress eliminado — reemplazado por TopProgressBar

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const HybridReel: React.FC<HybridReelProps> = ({
  videoSrc,
  durationFrames,
  captions = [],
  showCaptions = true,
  captionPreset = 'hormozi',
  captionPosition = 'center',
  captionMode = 'phrases',
  handle = 'vitaminak.of',
  ctaText = 'Sígueme para más →',
  ctaDurationFrames = 50,
  accentColor = BRAND.colors.accent,
  segments = [],
  alertBadge,
  borderFlashes = [],
  dataCounter,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── Segmento activo ──────────────────────────────────────────────────────
  const activeSeg = segments.find(s => frame >= s.startFrame && frame <= s.endFrame) ?? null;
  const splitSeg = activeSeg && (activeSeg.mode === 'split-bottom' || activeSeg.mode === 'split-top')
    ? activeSeg : null;
  const popSeg = activeSeg?.mode === 'stat-pop' ? activeSeg : null;
  const cardSeg = activeSeg?.mode === 'overlay-card' ? activeSeg : null;

  // ── Contador de datos activo ──────────────────────────────────────────────
  type SegWithIndex = { dataIndex?: number };
  const activeDataIndex = activeSeg ? (activeSeg as unknown as SegWithIndex).dataIndex ?? null : null;

  const splitAmt = splitSeg ? useSplitAmt(frame, fps, splitSeg.startFrame, splitSeg.endFrame) : 0;
  const isPanelBottom = splitSeg?.mode === 'split-bottom'; // vídeo arriba, panel abajo

  // Altura del bloque de vídeo (px): 100% → 50% durante split
  const videoHeightPct = interpolate(splitAmt, [0, 1], [100, 50]);
  const videoHeightPx = (videoHeightPct / 100) * height;
  const panelHeightPx = height - videoHeightPx;

  // ── CTA ──────────────────────────────────────────────────────────────────
  const ctaStart = durationFrames - ctaDurationFrames;
  const ctaLocal = Math.max(0, frame - ctaStart);
  const ctaS = spring({ frame: Math.min(ctaLocal, 20), fps, config: { damping: 18, stiffness: 120 } });
  const showCta = frame >= ctaStart && !splitSeg;

  // ── Vignette ─────────────────────────────────────────────────────────────
  const currentTime = frame / fps;
  const hasActiveWord = captions.some(w => currentTime >= w.start && currentTime <= w.end);
  const vignetteOpacity = hasActiveWord ? 0.5 : 0.2;

  // ── Watermark ─────────────────────────────────────────────────────────────
  const wmS = spring({ frame: Math.min(frame, 20), fps, config: { damping: 20, stiffness: 140 } });

  return (
    <AbsoluteFill style={{ background: '#080808' }}>

      {/* ── BLOQUE VÍDEO ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: isPanelBottom || !splitSeg ? 0 : undefined,
        bottom: !isPanelBottom && splitSeg ? 0 : undefined,
        height: videoHeightPx,
        overflow: 'hidden',
      }}>
        {videoSrc ? (
          <div style={{
            position: 'absolute', inset: 0,
            transform: `scale(${interpolate(frame, [0, durationFrames], [1, 1.04])})`,
            transformOrigin: 'center center',
          }}>
            <Video src={videoSrc} style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              filter: 'contrast(1.06) saturate(1.12) brightness(0.96)',
            }} />
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a1a2e,#0f3460)' }} />
        )}

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)',
          opacity: vignetteOpacity, transition: 'opacity 0.12s',
        }} />
        {hasActiveWord && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} />}
      </div>

      {/* ── BLOQUE PANEL ──────────────────────────────────────────────── */}
      {splitSeg && panelHeightPx > 0 && (() => {
        const segTone = (splitSeg as { tone?: Tone }).tone ?? 'neutral';
        const segAccent = resolveAccent(segTone, accentColor);
        return (
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            top: isPanelBottom ? videoHeightPx : 0,
            height: panelHeightPx,
            background: '#0A0A0A',
            overflow: 'hidden',
          }}>
            {/* Tinte sutil de tono en el fondo */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse 60% 70% at 50% 60%, rgba(${hexToRgb(segAccent)},0.07) 0%, transparent 75%)`,
            }} />
            {/* Barra lateral de tono (izquierda) */}
            <div style={{
              position: 'absolute', left: 0, top: 24, bottom: 24,
              width: 4, borderRadius: '0 3px 3px 0',
              backgroundColor: segAccent,
              boxShadow: `0 0 20px rgba(${hexToRgb(segAccent)},0.6)`,
              opacity: splitAmt,
            }} />
            <PanelContent
              content={splitSeg.panel}
              frame={Math.max(0, frame - splitSeg.startFrame)}
              fps={fps}
              accent={segAccent}
              tone={segTone}
            />
          </div>
        );
      })()}

      {/* ── DIVIDER HORIZONTAL ────────────────────────────────────────── */}
      {splitSeg && <SplitDivider splitAmt={splitAmt} accent={resolveAccent((splitSeg as { tone?: Tone }).tone, accentColor)} width={width} />}

      {/* ── STAT POP ──────────────────────────────────────────────────── */}
      {popSeg && (
        <StatPopOverlay
          frame={frame} fps={fps}
          startFrame={popSeg.startFrame} endFrame={popSeg.endFrame}
          value={popSeg.value} label={popSeg.label} subtext={popSeg.subtext}
          accent={resolveAccent((popSeg as { tone?: Tone }).tone, accentColor)}
        />
      )}

      {/* ── OVERLAY CARD ──────────────────────────────────────────────── */}
      {cardSeg && (
        <OverlayCard
          frame={frame} fps={fps}
          startFrame={cardSeg.startFrame} endFrame={cardSeg.endFrame}
          eyebrow={cardSeg.eyebrow} value={cardSeg.value}
          label={cardSeg.label} source={cardSeg.source}
          accent={resolveAccent((cardSeg as { tone?: Tone }).tone, accentColor)}
        />
      )}

      {/* ── CAPTIONS ──────────────────────────────────────────────────── */}
      {showCaptions && captions.length > 0 && !splitSeg && (
        captionMode === 'keyword-xl'
          ? <CaptionsKeywordXL words={captions} frame={frame} fps={fps} accent={accentColor} />
          : <CaptionsStyled
              words={captions}
              preset={captionPreset}
              accent={accentColor}
              position={cardSeg ? 'top' : captionPosition}
              maxWordsPerPhrase={4}
              gapThreshold={0.38}
              uppercase={captionPreset === 'bold' || captionPreset === 'outline'}
              shadow={true}
            />
      )}

      {/* ── TOP PROGRESS BAR (reemplaza círculo) ──────────────────────── */}
      <TopProgressBar frame={frame} durationFrames={durationFrames} accentColor={accentColor} />

      {/* ── ALERT BADGE ───────────────────────────────────────────────── */}
      {alertBadge && (
        <AlertBadge
          frame={frame} fps={fps}
          text={alertBadge.text}
          tone={(alertBadge.tone ?? 'negative') as Tone}
          startFrame={alertBadge.startFrame ?? 0}
          holdFrames={alertBadge.holdFrames ?? 90}
        />
      )}

      {/* ── BORDER FLASH ──────────────────────────────────────────────── */}
      {borderFlashes.length > 0 && (
        <BorderFlash frame={frame} flashes={borderFlashes} accentColor={accentColor} />
      )}

      {/* ── DATA COUNTER ──────────────────────────────────────────────── */}
      {dataCounter && activeDataIndex != null && (
        <DataCounter
          current={activeDataIndex}
          total={dataCounter.total}
          frame={Math.max(0, frame - (activeSeg?.startFrame ?? 0))}
          fps={fps}
          accent={resolveAccent((activeSeg as unknown as { tone?: Tone }).tone, accentColor)}
        />
      )}

      {/* ── HANDLE ────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 42, right: 32,
        fontSize: 24, fontWeight: 800,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: BRAND.fonts.heading, letterSpacing: '-0.01em',
        transform: `scale(${wmS})`,
        textShadow: '0 2px 14px rgba(0,0,0,0.85)',
      }}>{handle}</div>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      {showCta && (
        <div style={{
          position: 'absolute', bottom: 70, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          transform: `scale(${ctaS}) translateY(${interpolate(ctaS, [0, 1], [20, 0])}px)`,
          opacity: ctaS,
        }}>
          <div style={{
            backgroundColor: 'rgba(245,245,240,0.96)',
            color: '#080808',
            fontSize: 30, fontWeight: 800, fontFamily: BRAND.fonts.heading,
            padding: '18px 48px', borderRadius: 50, letterSpacing: '-0.01em',
            boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: accentColor, fontSize: 18 }}>●</span>
            {ctaText}
          </div>
        </div>
      )}

    </AbsoluteFill>
  );
};
