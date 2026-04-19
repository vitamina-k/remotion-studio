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

const segmentSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('split-bottom'),   // vídeo arriba | panel abajo
    startFrame: z.number(),
    endFrame: z.number(),
    panel: panelContentSchema,
  }),
  z.object({
    mode: z.literal('split-top'),      // panel arriba | vídeo abajo
    startFrame: z.number(),
    endFrame: z.number(),
    panel: panelContentSchema,
  }),
  z.object({
    mode: z.literal('stat-pop'),
    startFrame: z.number(),
    endFrame: z.number(),
    value: z.string(),
    label: z.string(),
    subtext: z.string().optional(),
  }),
]);

export const hybridReelSchema = z.object({
  videoSrc: z.string().default(''),
  durationFrames: z.number().default(300),
  captions: z.array(captionWordSchema).optional().default([]),
  showCaptions: z.boolean().optional().default(true),
  captionPreset: z.enum(captionPresets).optional().default('hormozi'),
  captionPosition: z.enum(['top', 'center', 'bottom']).optional().default('center'),
  handle: z.string().optional().default('vitaminak.of'),
  ctaText: z.string().optional().default('Sígueme para más →'),
  ctaDurationFrames: z.number().optional().default(50),
  accentColor: z.string().optional().default('#E63946'),
  segments: z.array(segmentSchema).optional().default([]),
});

export type HybridReelProps = z.infer<typeof hybridReelSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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
};

/* ── STAT PANEL ── */
function StatPanel({ content, frame, fps, accent }: PanelProps) {
  if (content.type !== 'stat') return null;
  const f = Math.min(frame, 80);
  const entryS = spring({ frame: f, fps, config: { damping: 18, stiffness: 100, mass: 0.8 } });
  const progress = interpolate(f, [0, 55], [0, 1], { extrapolateRight: 'clamp' });

  const raw = content.value.replace(/[^0-9.-]/g, '');
  const numVal = parseFloat(raw);
  const isNum = !isNaN(numVal);
  const prefix = content.value.startsWith('+') ? '+' : '';
  const suffix = isNum ? content.value.replace(/[+\-0-9.,]/g, '') : '';
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
          {prefix}{isNum ? displayNum : content.value}{suffix}
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
function KeywordPanel({ content, frame, fps, accent }: PanelProps) {
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
function QuotePanel({ content, frame, fps, accent }: PanelProps) {
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
function HookPanel({ content, frame, fps, accent }: PanelProps) {
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
function ListPanel({ content, frame, fps, accent }: PanelProps) {
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

function PanelContent({ content, frame, fps, accent }: PanelProps) {
  switch (content.type) {
    case 'stat':    return <StatPanel    content={content} frame={frame} fps={fps} accent={accent} />;
    case 'keyword': return <KeywordPanel content={content} frame={frame} fps={fps} accent={accent} />;
    case 'quote':   return <QuotePanel   content={content} frame={frame} fps={fps} accent={accent} />;
    case 'hook':    return <HookPanel    content={content} frame={frame} fps={fps} accent={accent} />;
    case 'list':    return <ListPanel    content={content} frame={frame} fps={fps} accent={accent} />;
  }
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

  const raw = parseFloat(value.replace(/[^0-9.-]/g, ''));
  const isNum = !isNaN(raw);
  const suffix = isNum ? value.replace(/[+\-0-9.,]/g, '') : '';
  const prefix = value.startsWith('+') ? '+' : '';
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
        {prefix}{isNum ? displayNum : value}{suffix}
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
// ─────────────────────────────────────────────────────────────────────────────

function CircularProgress({ frame, durationFrames, accent }: { frame: number; durationFrames: number; accent: string }) {
  const R = 44;
  const STROKE = 6;
  const SIZE = (R + STROKE) * 2 + 4;
  const circumference = 2 * Math.PI * R;
  const pct = Math.min(1, frame / durationFrames);
  const pctDisplay = Math.round(pct * 100);

  const progressColor = pct < 0.33 ? BRAND.colors.red : pct < 0.66 ? BRAND.colors.yellow : BRAND.colors.green;
  const offset = circumference * (1 - pct);

  const appear = spring({ frame: Math.min(frame, 20), fps: 30, config: { damping: 20, stiffness: 150 } });
  // Pulso suave cuando está por encima del 90%
  const pulse = pct > 0.9 ? 1 + Math.sin(frame * 0.25) * 0.08 : 1;

  return (
    <div style={{
      position: 'absolute', top: 36, left: 28,
      transform: `scale(${appear * pulse})`,
      transformOrigin: 'top left',
    }}>
      <svg width={SIZE} height={SIZE} style={{ filter: `drop-shadow(0 0 12px ${progressColor}88)` }}>
        {/* Track */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="rgba(0,0,0,0.5)"
          stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
        {/* Progress arc */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
          stroke={progressColor} strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        {/* Porcentaje centrado */}
        <text x={SIZE / 2} y={SIZE / 2 + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={pctDisplay >= 100 ? 20 : 22} fontWeight="800"
          fill={progressColor} fontFamily="Inter, sans-serif">
          {pctDisplay}%
        </text>
      </svg>
    </div>
  );
}

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
  handle = 'vitaminak.of',
  ctaText = 'Sígueme para más →',
  ctaDurationFrames = 50,
  accentColor = BRAND.colors.accent,
  segments = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── Segmento activo ──────────────────────────────────────────────────────
  const activeSeg = segments.find(s => frame >= s.startFrame && frame <= s.endFrame) ?? null;
  const splitSeg = activeSeg && (activeSeg.mode === 'split-bottom' || activeSeg.mode === 'split-top')
    ? activeSeg : null;
  const popSeg = activeSeg?.mode === 'stat-pop' ? activeSeg : null;

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
      {splitSeg && panelHeightPx > 0 && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          top: isPanelBottom ? videoHeightPx : 0,
          height: panelHeightPx,
          background: '#0A0A0A',
          overflow: 'hidden',
        }}>
          <PanelContent
            content={splitSeg.panel}
            frame={Math.max(0, frame - splitSeg.startFrame)}
            fps={fps}
            accent={accentColor}
          />
        </div>
      )}

      {/* ── DIVIDER HORIZONTAL ────────────────────────────────────────── */}
      {splitSeg && <SplitDivider splitAmt={splitAmt} accent={accentColor} width={width} />}

      {/* ── STAT POP ──────────────────────────────────────────────────── */}
      {popSeg && (
        <StatPopOverlay
          frame={frame} fps={fps}
          startFrame={popSeg.startFrame} endFrame={popSeg.endFrame}
          value={popSeg.value} label={popSeg.label} subtext={popSeg.subtext}
          accent={accentColor}
        />
      )}

      {/* ── CAPTIONS — solo cuando NO hay panel split activo ──────────── */}
      {showCaptions && captions.length > 0 && !splitSeg && (
        <CaptionsStyled
          words={captions}
          preset={captionPreset}
          accent={accentColor}
          position={captionPosition}
          maxWordsPerPhrase={4}
          gapThreshold={0.38}
          uppercase={captionPreset === 'bold' || captionPreset === 'outline'}
          shadow={true}
        />
      )}

      {/* ── CIRCULAR PROGRESS ─────────────────────────────────────────── */}
      <CircularProgress frame={frame} durationFrames={durationFrames} accent={accentColor} />

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
            backgroundColor: accentColor, color: '#fff',
            fontSize: 30, fontWeight: 800, fontFamily: BRAND.fonts.heading,
            padding: '18px 48px', borderRadius: 50, letterSpacing: '-0.01em',
            boxShadow: `0 8px 48px rgba(${hexToRgb(accentColor)},0.6), 0 2px 8px rgba(0,0,0,0.4)`,
          }}>{ctaText}</div>
        </div>
      )}

    </AbsoluteFill>
  );
};
