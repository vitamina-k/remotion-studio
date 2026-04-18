import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from 'remotion';
import { z } from 'zod';
import { BRAND, THEMES, ThemeName } from '../brand/brand';
import { getCaptionWindow, getWordState } from '../utils/captions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const overlayEventSchema = z.object({
  type: z.enum(['alert', 'warning', 'breaking', 'stat', 'chart-up', 'countdown']),
  startFrame: z.number(),
  endFrame: z.number(),
  text: z.string().optional(),
  value: z.string().optional(),
});

export const footageWithOverlaySchema = z.object({
  videoSrc: z.string(),
  durationFrames: z.number(),
  captions: z
    .array(z.object({ word: z.string(), start: z.number(), end: z.number() }))
    .optional(),
  lowerThird: z
    .object({
      name: z.string(),
      title: z.string().optional(),
      showAtFrame: z.number().optional(),
      hideAtFrame: z.number().optional(),
    })
    .optional(),
  showCaptions: z.boolean().optional().default(true),
  captionPosition: z.enum(['bottom', 'top', 'center']).optional().default('center'),
  background: z.string().optional().default(BRAND.colors.black),
  theme: z.enum(['dark', 'light', 'alert']).optional(),
  handle: z.string().optional().default('@handle'),
  introTitle: z.string().optional(),
  ctaText: z.string().optional().default('Sígueme para más →'),
  introDurationFrames: z.number().optional().default(45),
  ctaDurationFrames: z.number().optional().default(50),
  overlays: z.array(overlayEventSchema).optional(),
});

type FootageWithOverlayProps = z.infer<typeof footageWithOverlaySchema>;
type OverlayEvent = z.infer<typeof overlayEventSchema>;

// ─── Overlay Engine ───────────────────────────────────────────────────────────

function useOverlayAnim(frame: number, fps: number, startFrame: number, endFrame: number) {
  const localIn  = Math.max(0, frame - startFrame);
  const localOut = Math.max(0, frame - (endFrame - 12));
  const enter = spring({ frame: localIn,  fps, config: { damping: 12, stiffness: 180, mass: 0.7 }, durationInFrames: 16 });
  const exit  = localOut > 0 ? spring({ frame: localOut, fps, config: { damping: 14, stiffness: 200, mass: 0.6 }, durationInFrames: 12 }) : 0;
  const opacity = Math.max(0, Math.min(1, enter - exit));
  const scale   = interpolate(enter, [0, 1], [0.6, 1]) * interpolate(exit, [0, 1], [1, 0.8]);
  return { opacity, scale };
}

// ── ALERTA ────────────────────────────────────────────────────────────────────
const AlertOverlay: React.FC<{ frame: number; fps: number; ev: OverlayEvent }> = ({ frame, fps, ev }) => {
  const { opacity, scale } = useOverlayAnim(frame, fps, ev.startFrame, ev.endFrame);
  const pulse = 1 + 0.035 * Math.sin(frame * 0.22);
  if (frame < ev.startFrame || frame > ev.endFrame) return null;
  return (
    <div style={{
      position: 'absolute', top: 90, left: '50%',
      transform: `translateX(-50%) scale(${scale * pulse})`,
      opacity, display: 'flex', alignItems: 'center', gap: 10,
      backgroundColor: '#CC0000', borderRadius: 48,
      padding: '12px 32px',
      boxShadow: `0 0 0 4px rgba(204,0,0,0.3), 0 0 40px rgba(204,0,0,0.7)`,
    }}>
      <span style={{ fontSize: 26 }}>⚠️</span>
      <span style={{ fontFamily: BRAND.fonts.heading, fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '0.08em' }}>
        {ev.text ?? 'ALERTA'}
      </span>
    </div>
  );
};

// ── ADVERTENCIA ───────────────────────────────────────────────────────────────
const WarningOverlay: React.FC<{ frame: number; fps: number; ev: OverlayEvent }> = ({ frame, fps, ev }) => {
  const { opacity, scale } = useOverlayAnim(frame, fps, ev.startFrame, ev.endFrame);
  const pulse = 1 + 0.025 * Math.sin(frame * 0.18);
  if (frame < ev.startFrame || frame > ev.endFrame) return null;
  return (
    <div style={{
      position: 'absolute', top: 90, left: '50%',
      transform: `translateX(-50%) scale(${scale * pulse})`,
      opacity, display: 'flex', alignItems: 'center', gap: 10,
      backgroundColor: '#D97706', borderRadius: 48,
      padding: '12px 32px',
      boxShadow: `0 0 0 4px rgba(217,119,6,0.3), 0 0 40px rgba(217,119,6,0.6)`,
    }}>
      <span style={{ fontSize: 26 }}>⚡</span>
      <span style={{ fontFamily: BRAND.fonts.heading, fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '0.08em' }}>
        {ev.text ?? 'ADVERTENCIA'}
      </span>
    </div>
  );
};

// ── BREAKING ──────────────────────────────────────────────────────────────────
const BreakingOverlay: React.FC<{ frame: number; fps: number; ev: OverlayEvent }> = ({ frame, fps, ev }) => {
  const localIn  = Math.max(0, frame - ev.startFrame);
  const localOut = Math.max(0, frame - (ev.endFrame - 12));
  const slideIn  = spring({ frame: localIn,  fps, config: { damping: 14, stiffness: 160 }, durationInFrames: 18 });
  const slideOut = localOut > 0 ? spring({ frame: localOut, fps, config: { damping: 14, stiffness: 200 }, durationInFrames: 12 }) : 0;
  const translateY = interpolate(slideIn, [0, 1], [-80, 0]) + interpolate(slideOut, [0, 1], [0, -80]);
  const opacity = Math.max(0, slideIn - slideOut);
  if (frame < ev.startFrame || frame > ev.endFrame) return null;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      transform: `translateY(${translateY}px)`, opacity,
      display: 'flex', alignItems: 'stretch', height: 72,
    }}>
      <div style={{ width: 140, backgroundColor: '#CC0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: BRAND.fonts.heading, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '0.12em' }}>BREAKING</span>
      </div>
      <div style={{
        flex: 1, backgroundColor: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', padding: '0 24px',
      }}>
        <span style={{ fontFamily: BRAND.fonts.heading, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
          {ev.text ?? 'Última hora'}
        </span>
      </div>
    </div>
  );
};

// ── STAT POPUP ────────────────────────────────────────────────────────────────
const StatOverlay: React.FC<{ frame: number; fps: number; ev: OverlayEvent }> = ({ frame, fps, ev }) => {
  const { opacity, scale } = useOverlayAnim(frame, fps, ev.startFrame, ev.endFrame);
  if (frame < ev.startFrame || frame > ev.endFrame) return null;
  const duration = ev.endFrame - ev.startFrame;
  const progress = Math.min(1, (frame - ev.startFrame) / (duration * 0.6));
  const rawVal = parseFloat(ev.value ?? '0');
  const displayVal = rawVal * progress;
  const isFloat = (ev.value ?? '').includes('.');
  const formatted = isFloat ? displayVal.toFixed(1) : Math.round(displayVal).toString();
  const sign = rawVal > 0 ? '+' : '';
  const color = rawVal > 0 ? BRAND.colors.positive : rawVal < 0 ? BRAND.colors.negative : BRAND.colors.white;
  return (
    <div style={{
      position: 'absolute', bottom: 160, right: 40,
      transform: `scale(${scale})`, transformOrigin: 'bottom right',
      opacity,
      backgroundColor: 'rgba(8,8,8,0.88)',
      backdropFilter: 'blur(16px)',
      borderRadius: 16, padding: '20px 28px',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontFamily: BRAND.fonts.mono, fontSize: 56, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
        {sign}{formatted}{(ev.text ?? '').replace(ev.value ?? '', '')}
      </div>
      <div style={{ fontFamily: BRAND.fonts.heading, fontSize: 18, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
        {ev.text ?? ''}
      </div>
    </div>
  );
};

// ── CHART UP ──────────────────────────────────────────────────────────────────
const ChartUpOverlay: React.FC<{ frame: number; fps: number; ev: OverlayEvent }> = ({ frame, fps, ev }) => {
  const { opacity, scale } = useOverlayAnim(frame, fps, ev.startFrame, ev.endFrame);
  if (frame < ev.startFrame || frame > ev.endFrame) return null;
  const progress = Math.min(1, (frame - ev.startFrame) / ((ev.endFrame - ev.startFrame) * 0.7));
  const bars = [0.45, 0.6, 0.75, 1.0];
  const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const barColor = BRAND.colors.positive;
  return (
    <div style={{
      position: 'absolute', bottom: 160, left: 40,
      transform: `scale(${scale})`, transformOrigin: 'bottom left',
      opacity,
      backgroundColor: 'rgba(8,8,8,0.88)',
      backdropFilter: 'blur(16px)',
      borderRadius: 16, padding: '16px 20px',
    }}>
      <div style={{ fontFamily: BRAND.fonts.heading, fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {ev.text ?? 'Evolución'}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 32, height: Math.round(h * 80 * progress),
              backgroundColor: barColor,
              borderRadius: '4px 4px 0 0',
              boxShadow: `0 0 10px ${hexToRgba(barColor, 0.5)}`,
            }} />
            <span style={{ fontFamily: BRAND.fonts.mono, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── COUNTDOWN ─────────────────────────────────────────────────────────────────
const CountdownOverlay: React.FC<{ frame: number; fps: number; ev: OverlayEvent }> = ({ frame, fps, ev }) => {
  const { opacity, scale } = useOverlayAnim(frame, fps, ev.startFrame, ev.endFrame);
  if (frame < ev.startFrame || frame > ev.endFrame) return null;
  const totalSeconds = Math.ceil((ev.endFrame - ev.startFrame) / fps);
  const elapsed = (frame - ev.startFrame) / fps;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const pct = remaining / totalSeconds;
  const size = 80;
  const strokeW = 6;
  const radius = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const ringColor = pct > 0.5 ? BRAND.colors.positive : pct > 0.25 ? BRAND.colors.yellow : BRAND.colors.negative;
  return (
    <div style={{
      position: 'absolute', top: 90, right: 40,
      transform: `scale(${scale})`, transformOrigin: 'top right',
      opacity,
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="rgba(8,8,8,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeW} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={ringColor} strokeWidth={strokeW}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: BRAND.fonts.mono, fontWeight: 800, color: ringColor,
      }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{Math.ceil(remaining)}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>seg</span>
      </div>
    </div>
  );
};

// ── Overlay Engine ────────────────────────────────────────────────────────────
const OverlayEngine: React.FC<{ overlays: OverlayEvent[]; frame: number; fps: number }> = ({ overlays, frame, fps }) => (
  <>
    {overlays.map((ev, i) => {
      if (frame < ev.startFrame || frame > ev.endFrame) return null;
      if (ev.type === 'alert')     return <AlertOverlay    key={i} frame={frame} fps={fps} ev={ev} />;
      if (ev.type === 'warning')   return <WarningOverlay  key={i} frame={frame} fps={fps} ev={ev} />;
      if (ev.type === 'breaking')  return <BreakingOverlay key={i} frame={frame} fps={fps} ev={ev} />;
      if (ev.type === 'stat')      return <StatOverlay     key={i} frame={frame} fps={fps} ev={ev} />;
      if (ev.type === 'chart-up')  return <ChartUpOverlay  key={i} frame={frame} fps={fps} ev={ev} />;
      if (ev.type === 'countdown') return <CountdownOverlay key={i} frame={frame} fps={fps} ev={ev} />;
      return null;
    })}
  </>
);

// ─── Lower Third ──────────────────────────────────────────────────────────────

const SLIDE_FRAMES = 20;

const LowerThird: React.FC<{
  name: string; title?: string; showAtFrame: number; hideAtFrame: number; frame: number; fps: number;
}> = ({ name, title, showAtFrame, hideAtFrame, frame, fps }) => {
  const localShowFrame = frame - showAtFrame;
  const localHideFrame = frame - hideAtFrame;
  const slideIn = spring({ frame: localShowFrame, fps, config: { damping: 18, stiffness: 120, mass: 0.8 }, durationInFrames: SLIDE_FRAMES });
  const slideOut = localHideFrame >= 0
    ? spring({ frame: localHideFrame, fps, config: { damping: 18, stiffness: 120, mass: 0.8 }, durationInFrames: SLIDE_FRAMES })
    : 0;
  const translateX = interpolate(slideIn, [0, 1], [-320, 0]) + interpolate(slideOut, [0, 1], [0, -320]);
  const opacity = Math.max(0, slideIn - slideOut);
  if (frame < showAtFrame) return null;
  return (
    <div style={{ position: 'absolute', bottom: 140, left: 0, right: 0, transform: `translateX(${translateX}px)`, opacity, display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{ width: 6, backgroundColor: BRAND.colors.red, flexShrink: 0 }} />
      <div style={{ backgroundColor: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(12px)', padding: '14px 28px 14px 20px' }}>
        <div style={{ fontFamily: BRAND.fonts.heading, fontSize: 38, fontWeight: 800, color: BRAND.colors.white, lineHeight: 1.15, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{name}</div>
        {title && <div style={{ fontFamily: BRAND.fonts.heading, fontSize: 22, fontWeight: 500, color: BRAND.colors.red, marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{title}</div>}
      </div>
    </div>
  );
};

// ─── Captions (estilo CapCut + Bounce) ───────────────────────────────────────

const CaptionsOverlay: React.FC<{
  captions: Array<{ word: string; start: number; end: number }>;
  position: 'bottom' | 'top' | 'center';
  frame: number; fps: number; hasActiveWord: boolean;
}> = ({ captions, position, frame, fps, hasActiveWord }) => {
  const currentTime = frame / fps;
  const { visibleWords, windowStart, activeIndex, lastPassedIndex } = getCaptionWindow(captions, currentTime);
  const positionStyle: React.CSSProperties =
    position === 'center' ? { top: '50%', transform: 'translateY(-50%)' }
    : position === 'bottom' ? { bottom: 120 } : { top: 120 };

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, ...positionStyle, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', padding: '0 48px', gap: '0 14px', fontFamily: BRAND.fonts.heading }}>
      {visibleWords.map((w, i) => {
        const globalIndex = windowStart + i;
        const { isActive, isPast } = getWordState(globalIndex, activeIndex, lastPassedIndex);
        const entryFrame = Math.max(0, frame - Math.floor(w.start * fps));
        const bounce = spring({ frame: entryFrame, fps, config: { damping: 7, stiffness: 260, mass: 0.65 }, durationInFrames: 18 });
        const bounceScale   = 0.4 + bounce * 0.6;
        const bounceOpacity = Math.min(1, bounce * 2.5);
        const dimOpacity    = (hasActiveWord && !isActive ? 0.3 : isPast && !isActive ? 0.5 : 1) * bounceOpacity;
        const blurAmount    = hasActiveWord && !isActive ? 1.2 : 0;
        const activeScale   = isActive ? 1.08 : 1.0;
        return (
          <span key={`${globalIndex}-${w.word}`} style={{
            fontSize: 68, fontWeight: 900, lineHeight: 1.35, letterSpacing: '-0.02em', display: 'inline-block',
            opacity: dimOpacity, filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
            transform: `scale(${bounceScale * activeScale})`, transformOrigin: 'center bottom',
            color: isActive ? '#000000' : BRAND.colors.white,
            backgroundColor: isActive ? BRAND.colors.accent : 'transparent',
            borderRadius: isActive ? 10 : 0,
            padding: isActive ? '2px 16px' : '2px 0',
            textShadow: isActive ? 'none' : '0 2px 20px rgba(0,0,0,0.98), 0 0 40px rgba(0,0,0,0.8)',
          }}>{w.word}</span>
        );
      })}
    </div>
  );
};

// ─── Circular Progress ────────────────────────────────────────────────────────

const CircularProgress: React.FC<{ frame: number; durationFrames: number }> = ({ frame, durationFrames }) => {
  const pct = interpolate(frame, [0, durationFrames - 1], [0, 100], { extrapolateRight: 'clamp' });
  const ringColor = pct < 33 ? BRAND.colors.negative : pct < 66 ? BRAND.colors.yellow : BRAND.colors.positive;
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const size = 72, strokeW = 5, radius = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  return (
    <div style={{ position: 'absolute', top: 52, left: 36, width: size, height: size, opacity: fadeIn }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeW} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={ringColor} strokeWidth={strokeW}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BRAND.fonts.mono, fontSize: 18, fontWeight: 800, color: ringColor, letterSpacing: '-0.02em', textShadow: `0 0 10px ${hexToRgba(ringColor, 0.8)}` }}>
        {Math.round(pct)}
      </div>
    </div>
  );
};

// ─── Sound Wave ───────────────────────────────────────────────────────────────

const SoundWave: React.FC<{ frame: number; active: boolean }> = ({ frame, active }) => {
  const phases = [0, 0.65, 1.3, 0.4, 0.95, 1.7, 0.2];
  const speeds = [0.18, 0.23, 0.16, 0.27, 0.21, 0.19, 0.24];
  const maxH = 24, minH = 5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, height: maxH + 8, opacity: active ? 1 : 0.18 }}>
      {phases.map((phase, i) => {
        const height = active ? minH + (maxH - minH) * Math.abs(Math.sin(frame * speeds[i] + phase)) : minH;
        return <div key={i} style={{ width: 4, height, borderRadius: 3, backgroundColor: BRAND.colors.accent, boxShadow: active ? `0 0 8px ${hexToRgba(BRAND.colors.accent, 0.8)}` : 'none' }} />;
      })}
    </div>
  );
};

// ─── Watermark ────────────────────────────────────────────────────────────────

const Watermark: React.FC<{ handle: string; frame: number; fps: number }> = ({ handle, frame, fps }) => {
  const fadeIn = spring({ frame, fps, config: { damping: 20, stiffness: 80 }, durationInFrames: 20 });
  return (
    <div style={{ position: 'absolute', top: 52, right: 36, fontFamily: BRAND.fonts.heading, fontSize: 28, fontWeight: 700, color: BRAND.colors.white, letterSpacing: '0.04em', opacity: fadeIn * 0.65, textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>
      {handle}
    </div>
  );
};

// ─── Intro Overlay ────────────────────────────────────────────────────────────

const IntroOverlay: React.FC<{ title: string; frame: number; introDurationFrames: number; fps: number }> = ({ title, frame, introDurationFrames, fps }) => {
  const fadeInEnd    = Math.floor(introDurationFrames * 0.35);
  const fadeOutStart = Math.floor(introDurationFrames * 0.65);
  const bgOpacity  = interpolate(frame, [0, fadeInEnd, fadeOutStart, introDurationFrames], [1, 0.82, 0.82, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textScale  = spring({ frame, fps, config: { damping: 14, stiffness: 100, mass: 0.9 }, durationInFrames: fadeInEnd });
  const textOpacity = interpolate(frame, [0, fadeInEnd, fadeOutStart, introDurationFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (frame >= introDurationFrames) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${bgOpacity})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px' }}>
      <div style={{ fontFamily: BRAND.fonts.heading, fontSize: 72, fontWeight: 900, color: BRAND.colors.white, textAlign: 'center', lineHeight: 1.2, letterSpacing: '-0.03em', opacity: textOpacity, transform: `scale(${interpolate(textScale, [0, 1], [0.85, 1])})`, textShadow: `0 4px 40px rgba(0,0,0,0.8), 0 0 80px ${hexToRgba(BRAND.colors.accent, 0.3)}` }}>
        {title}
        <div style={{ width: 60, height: 4, backgroundColor: BRAND.colors.accent, borderRadius: 2, margin: '20px auto 0', boxShadow: `0 0 20px ${hexToRgba(BRAND.colors.accent, 0.8)}` }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── CTA Overlay ─────────────────────────────────────────────────────────────

const CTAOverlay: React.FC<{ text: string; frame: number; durationFrames: number; ctaDurationFrames: number; fps: number }> = ({ text, frame, durationFrames, ctaDurationFrames, fps }) => {
  const startFrame = durationFrames - ctaDurationFrames;
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;
  const fadeIn = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const pulse  = 1 + 0.025 * Math.sin((localFrame / fps) * Math.PI * 2.5);
  return (
    <div style={{ position: 'absolute', bottom: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: fadeIn }}>
      <div style={{ backgroundColor: BRAND.colors.accent, borderRadius: 48, paddingTop: 20, paddingBottom: 20, paddingLeft: 48, paddingRight: 48, transform: `scale(${pulse})`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontFamily: BRAND.fonts.heading, fontSize: 36, fontWeight: 900, color: '#000000', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{text}</div>
      </div>
    </div>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

export const FootageWithOverlay: React.FC<FootageWithOverlayProps> = ({
  videoSrc, durationFrames, captions, lowerThird,
  showCaptions = true, captionPosition = 'center',
  background = BRAND.colors.black, theme,
  handle = '@handle', introTitle,
  ctaText = 'Sígueme para más →',
  introDurationFrames = 45, ctaDurationFrames = 50,
  overlays = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const effectiveBg = theme ? THEMES[theme as ThemeName].background : background;
  const currentTime = frame / fps;
  const captionData = showCaptions && captions && captions.length > 0 ? captions : [];
  const { activeIndex, lastPassedIndex } = getCaptionWindow(captionData, currentTime);
  const hasActiveWord = activeIndex >= 0 && activeIndex !== lastPassedIndex;
  const vignetteOp   = hasActiveWord ? 0.5 : 0.22;
  const kenBurnsScale = interpolate(frame, [0, durationFrames], [1.0, 1.05], { extrapolateRight: 'clamp' });
  const showAt = lowerThird?.showAtFrame ?? 30;
  const hideAt = lowerThird?.hideAtFrame ?? durationFrames - 30;

  return (
    <AbsoluteFill style={{ backgroundColor: effectiveBg, overflow: 'hidden' }}>

      {/* ── Footage + Ken Burns ── */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${kenBurnsScale})`, transformOrigin: '50% 50%' }}>
        <Video src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(1.18) brightness(0.94)' }} />
      </div>

      {/* ── Gradiente top ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)', pointerEvents: 'none' }} />

      {/* ── Gradiente bottom ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 340, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', pointerEvents: 'none' }} />

      {/* ── Vignette ── */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,${vignetteOp}) 100%)`, pointerEvents: 'none' }} />

      {/* ── Darkening al hablar ── */}
      {hasActiveWord && <AbsoluteFill style={{ backgroundColor: 'rgba(0,0,0,0.25)', pointerEvents: 'none' }} />}

      {/* ── Overlays reactivos ── */}
      {overlays && overlays.length > 0 && <OverlayEngine overlays={overlays} frame={frame} fps={fps} />}

      {/* ── Watermark ── */}
      <Watermark handle={handle} frame={frame} fps={fps} />

      {/* ── Circular Progress ── */}
      <CircularProgress frame={frame} durationFrames={durationFrames} />

      {/* ── Captions ── */}
      {showCaptions && captions && captions.length > 0 && (
        <>
          <CaptionsOverlay captions={captions} position={captionPosition} frame={frame} fps={fps} hasActiveWord={hasActiveWord} />
          {captionPosition === 'center' && (
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, marginTop: 90, display: 'flex', justifyContent: 'center' }}>
              <SoundWave frame={frame} active={hasActiveWord} />
            </div>
          )}
        </>
      )}

      {/* ── Lower Third ── */}
      {lowerThird && <LowerThird name={lowerThird.name} title={lowerThird.title} showAtFrame={showAt} hideAtFrame={hideAt} frame={frame} fps={fps} />}

      {/* ── CTA ── */}
      <CTAOverlay text={ctaText} frame={frame} durationFrames={durationFrames} ctaDurationFrames={ctaDurationFrames} fps={fps} />

      {/* ── Intro ── */}
      {introTitle && <IntroOverlay title={introTitle} frame={frame} introDurationFrames={introDurationFrames} fps={fps} />}

    </AbsoluteFill>
  );
};
