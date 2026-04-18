import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { BRAND, THEMES, ThemeName } from '../brand/brand';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getValueColor = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) return BRAND.colors.positive;
  if (trimmed.startsWith('-')) return BRAND.colors.negative;
  return BRAND.colors.white;
};

const getBarColor = (value: number): string => {
  if (value > 0) return BRAND.colors.positive;
  if (value < 0) return BRAND.colors.negative;
  return BRAND.colors.accentAlt;
};

// ─── Schema ──────────────────────────────────────────────────────────────────

export const dataStorySchema = z.object({
  scenes: z.array(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('hook'),
        durationFrames: z.number(),
        bg: z.enum(['gradient', 'grid', 'alert']).optional(),
        content: z.object({
          text: z.string(),
          subtext: z.string().optional(),
        }),
      }),
      z.object({
        type: z.literal('title'),
        durationFrames: z.number(),
        bg: z.enum(['gradient', 'grid', 'alert']).optional(),
        content: z.object({
          text: z.string(),
          subtext: z.string().optional(),
          direction: z.enum(['up', 'down']).optional(),
          highlightWords: z.array(z.string()).optional(),
        }),
      }),
      z.object({
        type: z.literal('stat'),
        durationFrames: z.number(),
        bg: z.enum(['gradient', 'grid', 'alert']).optional(),
        content: z.object({
          value: z.string(),
          label: z.string().optional(),
          suffix: z.string().optional(),
          prefix: z.string().optional(),
          trend: z.enum(['up', 'down', 'neutral']).optional(),
        }),
      }),
      z.object({
        type: z.literal('quote'),
        durationFrames: z.number(),
        bg: z.enum(['gradient', 'grid', 'alert']).optional(),
        content: z.object({
          text: z.string(),
          subtext: z.string().optional(),
        }),
      }),
      z.object({
        type: z.literal('chart'),
        durationFrames: z.number(),
        bg: z.enum(['gradient', 'grid', 'alert']).optional(),
        content: z.object({
          title: z.string().optional(),
          bars: z.array(
            z.object({
              label: z.string(),
              value: z.number(),
              suffix: z.string().optional(),
            })
          ),
        }),
      }),
      z.object({
        type: z.literal('keyword'),
        durationFrames: z.number(),
        bg: z.enum(['gradient', 'grid', 'alert']).optional(),
        content: z.object({
          text: z.string(),
          highlight: z.string(),
          color: z.string().optional(),
        }),
      }),
      z.object({
        type: z.literal('comparison'),
        durationFrames: z.number(),
        bg: z.enum(['gradient', 'grid', 'alert']).optional(),
        content: z.object({
          title: z.string().optional(),
          left: z.object({
            label: z.string(),
            value: z.string(),
            sublabel: z.string().optional(),
            color: z.string().optional(),
          }),
          right: z.object({
            label: z.string(),
            value: z.string(),
            sublabel: z.string().optional(),
            color: z.string().optional(),
          }),
        }),
      }),
    ])
  ),
  background: z.string().optional().default(BRAND.colors.black),
  accentColor: z.string().optional().default(BRAND.colors.accent),
  theme: z.enum(['dark', 'light', 'alert']).optional(),
});

type DataStoryProps = z.infer<typeof dataStorySchema>;
type Scene = DataStoryProps['scenes'][number];

// ─── Backgrounds ─────────────────────────────────────────────────────────────

type BgStyle = 'gradient' | 'grid' | 'alert';

const DynamicBackground: React.FC<{ frame: number; accent: string; style?: BgStyle }> = ({ frame, accent, style = 'gradient' }) => {
  const t = frame / 30;

  if (style === 'alert') {
    // Fondo rojo pulsante con vignette
    const pulse = 0.18 + Math.sin(t * 2.8) * 0.07;
    const pulse2 = 0.1 + Math.cos(t * 1.9) * 0.05;
    return (
      <>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${hexToRgba('#FF0000', pulse)} 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 75% 70%, ${hexToRgba('#CC0000', pulse2)} 0%, transparent 50%)`, pointerEvents: 'none' }} />
        {/* Scanlines */}
        <AbsoluteFill style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${hexToRgba('#000000', 0.06)} 0px, ${hexToRgba('#000000', 0.06)} 1px, transparent 1px, transparent 4px)`,
          pointerEvents: 'none',
        }} />
      </>
    );
  }

  if (style === 'grid') {
    // Grid limpio sin gradientes móviles
    return (
      <AbsoluteFill style={{
        backgroundImage: `
          linear-gradient(${hexToRgba(accent, 0.06)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba(accent, 0.06)} 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />
    );
  }

  // gradient (default)
  const x1 = 50 + 38 * Math.sin(t * 0.11);
  const y1 = 45 + 32 * Math.cos(t * 0.09);
  const x2 = 52 + 36 * Math.cos(t * 0.13);
  const y2 = 55 + 28 * Math.sin(t * 0.15);
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${x1}% ${y1}%, ${hexToRgba(accent, 0.13)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${x2}% ${y2}%, ${hexToRgba(BRAND.colors.blue, 0.07)} 0%, transparent 50%)`, pointerEvents: 'none' }} />
      <AbsoluteFill style={{
        backgroundImage: `
          linear-gradient(${hexToRgba('#ffffff', 0.025)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba('#ffffff', 0.025)} 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />
    </>
  );
};

// ─── Top Bar ─────────────────────────────────────────────────────────────────

const TopBar: React.FC<{ accentColor: string; localFrame: number }> = ({ accentColor, localFrame }) => {
  const width = interpolate(localFrame, [0, 18], [0, 100], { extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${width}%`,
        height: 5,
        background: `linear-gradient(90deg, ${accentColor}, ${hexToRgba(accentColor, 0.6)})`,
        boxShadow: `0 0 20px ${hexToRgba(accentColor, 0.6)}`,
      }}
    />
  );
};

// ─── Scene fade wrapper (fade-in 10f + fade-out 10f) ─────────────────────────

const SceneFade: React.FC<{ localFrame: number; durationFrames: number; children: React.ReactNode }> = ({
  localFrame,
  durationFrames,
  children,
}) => {
  const fadeIn  = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const fadeOut = interpolate(localFrame, [durationFrames - 10, durationFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);
  return <div style={{ position: 'absolute', inset: 0, opacity }}>{children}</div>;
};

// ─── HookScene ────────────────────────────────────────────────────────────────

const HookScene: React.FC<{
  scene: Extract<Scene, { type: 'hook' }>;
  localFrame: number;
  accentColor: string;
  fps: number;
  durationFrames: number;
}> = ({ scene, localFrame, accentColor, fps, durationFrames }) => {
  // Línea de corte horizontal que barre de izq a der
  const lineW = interpolate(localFrame, [0, 12], [0, 100], { extrapolateRight: 'clamp' });

  // Glitch offset — tiembla los primeros 20 frames
  const glitchActive = localFrame < 22;
  const glitchX = glitchActive ? (Math.sin(localFrame * 7.3) * 6) : 0;
  const glitchY = glitchActive ? (Math.cos(localFrame * 5.1) * 3) : 0;
  const glitchOp = glitchActive ? (localFrame % 3 === 0 ? 0.6 : 1) : 1;

  // Texto principal — aparece letra a letra (efecto máquina de escribir)
  const chars = scene.content.text.split('');
  const CHAR_DELAY = 2; // frames por caracter
  const textStartFrame = 8;

  // Badge "▶ SIGUE VIENDO" — pulsa en los últimos 35 frames
  const badgeStart = durationFrames - 38;
  const badgeOp = interpolate(localFrame, [badgeStart, badgeStart + 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const badgePulse = localFrame > badgeStart
    ? 1 + Math.sin(((localFrame - badgeStart) / 10) * Math.PI) * 0.06
    : 1;

  // Subtext fade in tras el texto
  const subtextStart = textStartFrame + chars.length * CHAR_DELAY + 5;
  const subtextOp = interpolate(localFrame, [subtextStart, subtextStart + 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Overlay de ruido estático que desaparece
  const noiseOp = interpolate(localFrame, [0, 18], [0.18, 0], { extrapolateRight: 'clamp' });

  // Fade out global
  const fadeOut = interpolate(localFrame, [durationFrames - 10, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
        gap: 36,
        opacity: fadeOut,
      }}
    >
      {/* Ruido estático overlay */}
      {noiseOp > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
            opacity: noiseOp,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
          }}
        />
      )}

      {/* Línea de corte */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: `${lineW}%`,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          boxShadow: `0 0 24px ${hexToRgba(accentColor, 0.9)}`,
          opacity: interpolate(localFrame, [0, 6, 20, 30], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
        }}
      />

      {/* Texto principal con glitch */}
      <div
        style={{
          transform: `translate(${glitchX}px, ${glitchY}px)`,
          opacity: glitchOp,
          textAlign: 'center',
          lineHeight: 1.15,
        }}
      >
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 88,
            fontWeight: 900,
            color: BRAND.colors.white,
            letterSpacing: '-0.035em',
          }}
        >
          {chars.map((char, i) => {
            const visible = localFrame >= textStartFrame + i * CHAR_DELAY;
            return (
              <span key={i} style={{ opacity: visible ? 1 : 0 }}>
                {char}
              </span>
            );
          })}
          {/* Cursor parpadeante */}
          {localFrame < textStartFrame + chars.length * CHAR_DELAY + 10 && (
            <span
              style={{
                opacity: Math.floor(localFrame / 6) % 2 === 0 ? 1 : 0,
                color: accentColor,
                marginLeft: 4,
              }}
            >
              |
            </span>
          )}
        </span>
      </div>

      {/* Subtext */}
      {scene.content.subtext && (
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 26,
            fontWeight: 500,
            color: hexToRgba(BRAND.colors.white, 0.55),
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            opacity: subtextOp,
            textAlign: 'center',
          }}
        >
          {scene.content.subtext}
        </span>
      )}

      {/* Badge ▶ SIGUE VIENDO */}
      <div
        style={{
          position: 'absolute',
          bottom: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: accentColor,
          padding: '10px 28px',
          borderRadius: 4,
          opacity: badgeOp,
          transform: `scale(${badgePulse})`,
          boxShadow: `0 0 30px ${hexToRgba(accentColor, 0.6)}`,
        }}
      >
        <span style={{ fontSize: 18, color: BRAND.colors.white }}>▶</span>
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 20,
            fontWeight: 800,
            color: BRAND.colors.white,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Sigue viendo
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── TitleScene ───────────────────────────────────────────────────────────────

const TitleScene: React.FC<{
  scene: Extract<Scene, { type: 'title' }>;
  localFrame: number;
  accentColor: string;
  fps: number;
}> = ({ scene, localFrame, accentColor, fps }) => {
  const direction = scene.content.direction ?? 'up';
  const lines = scene.content.text.split('\n');
  const highlightSet = new Set(
    (scene.content.highlightWords ?? []).map((w) => w.toLowerCase())
  );
  const totalWords = lines.join(' ').split(' ').filter(Boolean).length;
  const allAppearedFrame = totalWords * 5 + 15;

  // Shimmer sweep — barre de izquierda a derecha tras aparecer todo el texto
  const shimmerProgress = interpolate(localFrame - allAppearedFrame, [0, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shimmerX = interpolate(shimmerProgress, [0, 1], [-15, 115]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 96px',
        gap: 32,
      }}
    >
      {/* Shimmer sweep overlay */}
      {shimmerProgress > 0 && shimmerProgress < 1 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg,
              transparent ${shimmerX - 10}%,
              ${hexToRgba('#ffffff', 0.06)} ${shimmerX}%,
              ${hexToRgba('#ffffff', 0.13)} ${shimmerX + 3}%,
              ${hexToRgba('#ffffff', 0.06)} ${shimmerX + 6}%,
              transparent ${shimmerX + 16}%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {lines.map((line, lineIdx) => {
          const words = line.split(' ');
          const prevWordCount = lines.slice(0, lineIdx).join(' ').split(' ').filter(Boolean).length;
          return (
            <div key={lineIdx} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 16px' }}>
              {words.map((word, wordIdx) => {
                const globalIdx = prevWordCount + wordIdx;
                const delay = globalIdx * 5;
                const isHighlight = highlightSet.has(word.toLowerCase().replace(/[^a-záéíóúüñ]/g, ''));
                const progress = spring({
                  frame: localFrame - delay,
                  fps,
                  config: { damping: 22, stiffness: 200, mass: 0.6 },
                });
                const fromY = direction === 'down' ? -50 : 50;
                const translateY = interpolate(progress, [0, 1], [fromY, 0]);
                const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
                return (
                  <span
                    key={wordIdx}
                    style={{
                      fontFamily: BRAND.fonts.heading,
                      fontSize: 84,
                      fontWeight: 800,
                      color: isHighlight ? accentColor : BRAND.colors.white,
                      lineHeight: 1.1,
                      letterSpacing: '-0.03em',
                      transform: `translateY(${translateY}px)`,
                      opacity,
                      display: 'inline-block',
                      textShadow: isHighlight
                        ? `0 0 48px ${hexToRgba(accentColor, 0.55)}`
                        : 'none',
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {scene.content.subtext && (() => {
        const delay = totalWords * 5 + 10;
        const op = interpolate(localFrame - delay, [0, 15], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              opacity: op,
              backgroundColor: hexToRgba(accentColor, 0.12),
              border: `1px solid ${hexToRgba(accentColor, 0.3)}`,
              borderRadius: 4,
              padding: '8px 20px',
            }}
          >
            <span
              style={{
                fontFamily: BRAND.fonts.heading,
                fontSize: 22,
                fontWeight: 600,
                color: accentColor,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {scene.content.subtext}
            </span>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ─── StatScene ────────────────────────────────────────────────────────────────

const StatScene: React.FC<{
  scene: Extract<Scene, { type: 'stat' }>;
  localFrame: number;
  durationFrames: number;
  accentColor: string;
  fps: number;
}> = ({ scene, localFrame, durationFrames, accentColor, fps }) => {
  const rawValue = parseFloat(scene.content.value.replace(/[^0-9.-]/g, ''));
  const isNumeric = !isNaN(rawValue);
  const valueColor = getValueColor(scene.content.value);
  const trend = scene.content.trend;

  const countDuration = Math.floor(durationFrames * 0.55);
  const animated = isNumeric
    ? interpolate(localFrame, [0, countDuration], [0, Math.abs(rawValue)], { extrapolateRight: 'clamp' })
    : null;

  const sign = scene.content.value.startsWith('-') ? '-' : scene.content.value.startsWith('+') ? '+' : '';
  const displayNum =
    animated !== null
      ? Number.isInteger(rawValue)
        ? Math.round(animated).toLocaleString()
        : animated.toFixed(1)
      : scene.content.value;
  const displayValue = sign + (scene.content.prefix ?? '') + displayNum + (scene.content.suffix ?? '');

  const flashProgress = spring({
    frame: localFrame - countDuration,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });
  const scale = interpolate(flashProgress, [0, 0.4, 1], [1, 1.07, 1]);
  const isFinished = localFrame >= countDuration;
  const fadeIn = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  const labelProgress = spring({ frame: localFrame - 8, fps, config: { damping: 18, stiffness: 160 } });
  const labelY = interpolate(labelProgress, [0, 1], [20, 0]);
  const labelOp = interpolate(labelProgress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  const arrowProgress = spring({
    frame: localFrame - countDuration - 5,
    fps,
    config: { damping: 15, stiffness: 220 },
  });
  const arrowOp = interpolate(arrowProgress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
  const arrowY = interpolate(arrowProgress, [0, 1], [20, 0]);

  const activeColor = isFinished && valueColor !== BRAND.colors.white ? valueColor : accentColor;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        opacity: fadeIn,
      }}
    >
      {/* Main value + trend arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 168,
            fontWeight: 900,
            color: isFinished ? (valueColor !== BRAND.colors.white ? valueColor : BRAND.colors.white) : BRAND.colors.white,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            transform: `scale(${scale})`,
            display: 'inline-block',
            filter:
              isFinished && valueColor !== BRAND.colors.white
                ? `drop-shadow(0 0 48px ${hexToRgba(valueColor, 0.5)})`
                : 'none',
          }}
        >
          {displayValue}
        </span>

        {trend && isFinished && (
          <span
            style={{
              fontSize: 72,
              opacity: arrowOp,
              transform: `translateY(${arrowY}px)`,
              display: 'inline-block',
              color:
                trend === 'up'
                  ? BRAND.colors.positive
                  : trend === 'down'
                  ? BRAND.colors.negative
                  : BRAND.colors.yellow,
              lineHeight: 1,
            }}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>

      {scene.content.label && (
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 30,
            fontWeight: 600,
            color: BRAND.colors.grayLight,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            transform: `translateY(${labelY}px)`,
            opacity: labelOp,
          }}
        >
          {scene.content.label}
        </span>
      )}

      {/* Animated progress bar */}
      <div
        style={{
          width: 140,
          height: 4,
          backgroundColor: BRAND.colors.grayMid,
          borderRadius: 2,
          overflow: 'hidden',
          opacity: labelOp,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, (localFrame / countDuration) * 100)}%`,
            backgroundColor: activeColor,
            borderRadius: 2,
            boxShadow: `0 0 12px ${hexToRgba(activeColor, 0.8)}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── QuoteScene ───────────────────────────────────────────────────────────────

const QuoteScene: React.FC<{
  scene: Extract<Scene, { type: 'quote' }>;
  localFrame: number;
  accentColor: string;
  fps: number;
}> = ({ scene, localFrame, accentColor, fps }) => {
  const words = scene.content.text.split(' ');
  const subtextDelay = words.length * 4 + 28;
  const subtextOp = interpolate(localFrame - subtextDelay, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Comilla decorativa gigante entra con scale spring
  const quoteMarkProgress = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 120, mass: 1.1 } });
  const quoteMarkScale = interpolate(quoteMarkProgress, [0, 1], [0.4, 1]);
  const quoteMarkOp = interpolate(quoteMarkProgress, [0, 0.5], [0, 0.18], { extrapolateRight: 'clamp' });

  // Respiración suave del bloque de texto tras aparecer todo
  const allAppearedFrame = 20 + words.length * 4 + 10;
  const breathe = Math.sin(((localFrame - allAppearedFrame) / 30) * Math.PI);
  const breatheScale = localFrame > allAppearedFrame ? 1 + breathe * 0.012 : 1;

  // Línea acento lateral — crece hacia abajo
  const lineHeight = interpolate(localFrame, [0, 25], [0, 220], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 96px',
        gap: 40,
      }}
    >
      {/* Comilla decorativa de fondo */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          left: 60,
          fontFamily: BRAND.fonts.heading,
          fontSize: 480,
          fontWeight: 900,
          color: accentColor,
          opacity: quoteMarkOp,
          transform: `scale(${quoteMarkScale})`,
          transformOrigin: 'top left',
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        "
      </div>

      {/* Línea vertical de acento a la izquierda */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 5,
          height: lineHeight,
          backgroundColor: accentColor,
          borderRadius: 3,
          boxShadow: `0 0 18px ${hexToRgba(accentColor, 0.7)}`,
        }}
      />

      {/* Bloque de texto con respiración */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px 16px',
          transform: `scale(${breatheScale})`,
        }}
      >
        {words.map((word, i) => {
          const delay = 20 + i * 4;
          const prog = spring({ frame: localFrame - delay, fps, config: { damping: 22, stiffness: 160, mass: 0.7 } });
          const op = interpolate(prog, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
          const y = interpolate(prog, [0, 1], [28, 0]);
          return (
            <span
              key={i}
              style={{
                fontFamily: BRAND.fonts.heading,
                fontSize: 58,
                fontWeight: 700,
                color: BRAND.colors.white,
                lineHeight: 1.3,
                letterSpacing: '-0.025em',
                opacity: op,
                transform: `translateY(${y}px)`,
                display: 'inline-block',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Badge de fuente */}
      {scene.content.subtext && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: subtextOp,
            backgroundColor: hexToRgba(accentColor, 0.15),
            border: `1px solid ${hexToRgba(accentColor, 0.4)}`,
            borderRadius: 4,
            padding: '8px 20px',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accentColor }} />
          <span
            style={{
              fontFamily: BRAND.fonts.heading,
              fontSize: 22,
              fontWeight: 600,
              color: accentColor,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {scene.content.subtext}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── ChartScene ───────────────────────────────────────────────────────────────

const ChartScene: React.FC<{
  scene: Extract<Scene, { type: 'chart' }>;
  localFrame: number;
  accentColor: string;
  fps: number;
}> = ({ scene, localFrame, accentColor, fps }) => {
  const bars = scene.content.bars;
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.value)));
  const MAX_BAR_HEIGHT = 520;
  const barWidth = Math.max(60, Math.floor(760 / bars.length) - 28);

  const titleOp = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(localFrame, [0, 15], [-20, 0], { extrapolateRight: 'clamp' });
  const baselineOp = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', padding: '72px 80px 96px' }}>
      {/* Title */}
      {scene.content.title && (
        <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, marginBottom: 40 }}>
          <span
            style={{
              fontFamily: BRAND.fonts.heading,
              fontSize: 34,
              fontWeight: 700,
              color: BRAND.colors.grayLight,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {scene.content.title}
          </span>
        </div>
      )}

      {/* Bars */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 28 }}>
        {bars.map((bar, i) => {
          const delay = i * 9;
          const progress = spring({
            frame: localFrame - delay,
            fps,
            config: { damping: 22, stiffness: 130, mass: 0.9 },
          });
          const barHeight = interpolate(progress, [0, 1], [0, (Math.abs(bar.value) / maxAbs) * MAX_BAR_HEIGHT]);
          const barColor = getBarColor(bar.value);
          const valueOp = interpolate(progress, [0.65, 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const sign = bar.value > 0 ? '+' : '';
          const displayVal = sign + bar.value + (bar.suffix ?? '');

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: barWidth }}>
              {/* Value label */}
              <span
                style={{
                  fontFamily: BRAND.fonts.heading,
                  fontSize: 26,
                  fontWeight: 800,
                  color: barColor,
                  opacity: valueOp,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  filter: `drop-shadow(0 0 8px ${hexToRgba(barColor, 0.6)})`,
                }}
              >
                {displayVal}
              </span>

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: barHeight,
                  backgroundColor: barColor,
                  borderRadius: '6px 6px 0 0',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 0 28px ${hexToRgba(barColor, 0.45)}`,
                }}
              >
                {/* Shine overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 60%)',
                    borderRadius: '6px 6px 0 0',
                  }}
                />
              </div>

              {/* X-axis label */}
              <span
                style={{
                  fontFamily: BRAND.fonts.heading,
                  fontSize: 21,
                  fontWeight: 600,
                  color: BRAND.colors.grayLight,
                  textAlign: 'center',
                  opacity: valueOp,
                  whiteSpace: 'nowrap',
                }}
              >
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Baseline */}
      <div
        style={{
          height: 2,
          backgroundColor: BRAND.colors.grayMid,
          marginTop: 4,
          opacity: baselineOp,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── KeywordScene ─────────────────────────────────────────────────────────────

const KeywordScene: React.FC<{
  scene: Extract<Scene, { type: 'keyword' }>;
  localFrame: number;
  accentColor: string;
  fps: number;
}> = ({ scene, localFrame, accentColor, fps }) => {
  const words = scene.content.text.split(' ');
  const highlights = new Set(
    scene.content.highlight
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-záéíóúüñ0-9]/g, ''))
  );
  const highlightColor = scene.content.color ?? accentColor;

  // After all words appear, spotlight kicks in
  const allDelay = words.length * 4 + 10;
  const spotlightProgress = interpolate(localFrame - allDelay, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulso continuo en highlights tras el spotlight
  const pulsePhase = (localFrame - allDelay - 20) / 22;
  const pulse = spotlightProgress > 0.9 ? Math.sin(pulsePhase * Math.PI) * 0.5 + 0.5 : 0;
  const pulseGlowAlpha = 0.35 + pulse * 0.4;
  const pulseScale = 1 + pulse * 0.03;

  // Línea subrayado bajo palabras highlight — aparece con el spotlight
  const underlineWidth = interpolate(spotlightProgress, [0.4, 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        padding: '0 80px',
        gap: 20,
      }}
    >
      {/* Palabras */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px 26px' }}>
        {words.map((word, i) => {
          const cleanWord = word.toLowerCase().replace(/[^a-záéíóúüñ0-9]/g, '');
          const isHighlight = highlights.has(cleanWord);

          const delay = i * 4;
          const progress = spring({
            frame: localFrame - delay,
            fps,
            config: { damping: 22, stiffness: 190, mass: 0.6 },
          });

          const y = interpolate(progress, [0, 1], [-44, 0]); // desde arriba
          const opacity = interpolate(progress, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' });

          const finalOpacity = isHighlight
            ? opacity
            : opacity * (1 - spotlightProgress * 0.78);
          const blurAmount = isHighlight ? 0 : spotlightProgress * 3.5;
          const finalScale = isHighlight
            ? 1 + pulseScale * 0.015
            : 1;

          return (
            <span
              key={i}
              style={{
                fontFamily: BRAND.fonts.heading,
                fontSize: isHighlight ? 92 : 72,
                fontWeight: isHighlight ? 900 : 700,
                color: isHighlight ? highlightColor : BRAND.colors.white,
                opacity: finalOpacity,
                transform: `translateY(${y}px) scale(${finalScale})`,
                display: 'inline-block',
                filter: blurAmount > 0.1 ? `blur(${blurAmount}px)` : 'none',
                textShadow: isHighlight
                  ? `0 0 70px ${hexToRgba(highlightColor, pulseGlowAlpha)}`
                  : 'none',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                transition: 'none',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Subrayado bajo el grupo highlight */}
      <div
        style={{
          width: `${underlineWidth}%`,
          maxWidth: 600,
          height: 4,
          backgroundColor: highlightColor,
          borderRadius: 3,
          boxShadow: `0 0 18px ${hexToRgba(highlightColor, 0.7)}`,
          opacity: spotlightProgress,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── ComparisonScene ──────────────────────────────────────────────────────────

const ComparisonScene: React.FC<{
  scene: Extract<Scene, { type: 'comparison' }>;
  localFrame: number;
  accentColor: string;
  fps: number;
}> = ({ scene, localFrame, accentColor, fps }) => {
  const { left, right, title } = scene.content;
  const leftColor  = left.color  ?? getValueColor(left.value);
  const rightColor = right.color ?? getValueColor(right.value);

  const titleOp = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const leftProgress = spring({ frame: localFrame - 8, fps, config: { damping: 20, stiffness: 160 } });
  const rightProgress = spring({ frame: localFrame - 18, fps, config: { damping: 20, stiffness: 160 } });

  const leftX = interpolate(leftProgress, [0, 1], [-120, 0]);
  const rightX = interpolate(rightProgress, [0, 1], [120, 0]);
  const leftOp = interpolate(leftProgress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const rightOp = interpolate(rightProgress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  const dividerProgress = spring({ frame: localFrame - 5, fps, config: { damping: 18, stiffness: 140 } });
  const dividerHeight = interpolate(dividerProgress, [0, 1], [0, 320]);

  const renderSide = (
    label: string,
    value: string,
    sublabel: string | undefined,
    color: string,
    op: number,
    x: number
  ) => {
    const isPos = value.startsWith('+');
    const isNeg = value.startsWith('-');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          opacity: op,
          transform: `translateX(${x}px)`,
          flex: 1,
        }}
      >
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 28,
            fontWeight: 600,
            color: BRAND.colors.grayLight,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {label}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(isPos || isNeg) && (
            <span
              style={{
                fontSize: 56,
                fontWeight: 900,
                color,
                fontFamily: BRAND.fonts.heading,
                lineHeight: 1,
              }}
            >
              {isPos ? '↑' : '↓'}
            </span>
          )}
          <span
            style={{
              fontFamily: BRAND.fonts.heading,
              fontSize: 100,
              fontWeight: 900,
              color,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              filter: color !== BRAND.colors.white ? `drop-shadow(0 0 32px ${hexToRgba(color, 0.45)})` : 'none',
            }}
          >
            {value}
          </span>
        </div>

        {sublabel && (
          <span
            style={{
              fontFamily: BRAND.fonts.heading,
              fontSize: 22,
              fontWeight: 400,
              color: BRAND.colors.grayLight,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 52,
        padding: '80px',
      }}
    >
      {title && (
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 32,
            fontWeight: 600,
            color: BRAND.colors.grayLight,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            opacity: titleOp,
          }}
        >
          {title}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 60, width: '100%' }}>
        {renderSide(left.label, left.value, left.sublabel, leftColor, leftOp, leftX)}

        {/* Divider */}
        <div
          style={{
            width: 2,
            height: dividerHeight,
            backgroundColor: BRAND.colors.grayMid,
            flexShrink: 0,
            borderRadius: 2,
          }}
        />

        {renderSide(right.label, right.value, right.sublabel, rightColor, rightOp, rightX)}
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

export const DataStory: React.FC<DataStoryProps> = ({
  scenes,
  background = BRAND.colors.black,
  accentColor = BRAND.colors.accent,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Theme overrides individual color props when provided
  const effectiveBg     = theme ? THEMES[theme as ThemeName].background : background;
  const effectiveAccent = theme ? THEMES[theme as ThemeName].accent     : accentColor;

  const offsets = scenes.reduce<number[]>((acc, scene, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + scenes[i - 1].durationFrames);
    return acc;
  }, []);

  const activeIndex = offsets.reduce((acc, offset, i) => (frame >= offset ? i : acc), 0);
  const activeScene = scenes[activeIndex];
  const localFrame = frame - offsets[activeIndex];

  const sceneBg = (activeScene as { bg?: BgStyle }).bg ?? 'gradient';
  const canvasBg = sceneBg === 'alert' ? '#0D0000' : effectiveBg;

  return (
    <AbsoluteFill style={{ backgroundColor: canvasBg, overflow: 'hidden' }}>
      <DynamicBackground frame={frame} accent={effectiveAccent} style={sceneBg} />
      <TopBar accentColor={sceneBg === 'alert' ? '#FF0000' : effectiveAccent} localFrame={localFrame} />

      {/* ── Barra de progreso — cambia de color rojo→amarillo→verde ── */}
      {(() => {
        const pct = interpolate(frame, [0, durationInFrames - 1], [0, 100], { extrapolateRight: 'clamp' });
        // Color: 0%→33% rojo, 33%→66% amarillo, 66%→100% verde
        const barColor = pct < 33
          ? BRAND.colors.negative
          : pct < 66
          ? BRAND.colors.yellow
          : BRAND.colors.positive;
        return (
          <>
            {/* Track */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 7, backgroundColor: hexToRgba('#ffffff', 0.08) }} />
            {/* Fill */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              width: `${pct}%`, height: 7,
              backgroundColor: barColor,
              boxShadow: `0 0 14px ${hexToRgba(barColor, 0.85)}`,
              transition: 'background-color 0.3s',
            }} />
            {/* Dot */}
            {pct > 0.5 && pct < 99.5 && (
              <div style={{
                position: 'absolute', bottom: -3,
                left: `calc(${pct}% - 7px)`,
                width: 14, height: 14, borderRadius: '50%',
                backgroundColor: barColor,
                boxShadow: `0 0 12px ${hexToRgba(barColor, 1)}, 0 0 24px ${hexToRgba(barColor, 0.5)}`,
              }} />
            )}
            {/* Porcentaje — sigue al dot */}
            <div style={{
              position: 'absolute', bottom: 18,
              left: `calc(${pct}% - 22px)`,
              fontFamily: BRAND.fonts.mono, fontSize: 18, fontWeight: 700,
              color: barColor,
              opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
              letterSpacing: '0.05em',
              textShadow: `0 0 12px ${hexToRgba(barColor, 0.7)}`,
              whiteSpace: 'nowrap',
            }}>
              {Math.round(pct)}%
            </div>
          </>
        );
      })()}

      <SceneFade localFrame={localFrame} durationFrames={activeScene.durationFrames}>
        {activeScene.type === 'hook' && (
          <HookScene scene={activeScene} localFrame={localFrame} accentColor={effectiveAccent} fps={fps} durationFrames={activeScene.durationFrames} />
        )}
        {activeScene.type === 'title' && (
          <TitleScene scene={activeScene} localFrame={localFrame} accentColor={effectiveAccent} fps={fps} />
        )}
        {activeScene.type === 'stat' && (
          <StatScene
            scene={activeScene}
            localFrame={localFrame}
            durationFrames={activeScene.durationFrames}
            accentColor={effectiveAccent}
            fps={fps}
          />
        )}
        {activeScene.type === 'quote' && (
          <QuoteScene scene={activeScene} localFrame={localFrame} accentColor={effectiveAccent} fps={fps} />
        )}
        {activeScene.type === 'chart' && (
          <ChartScene scene={activeScene} localFrame={localFrame} accentColor={effectiveAccent} fps={fps} />
        )}
        {activeScene.type === 'keyword' && (
          <KeywordScene scene={activeScene} localFrame={localFrame} accentColor={effectiveAccent} fps={fps} />
        )}
        {activeScene.type === 'comparison' && (
          <ComparisonScene scene={activeScene} localFrame={localFrame} accentColor={effectiveAccent} fps={fps} />
        )}
      </SceneFade>
    </AbsoluteFill>
  );
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export const totalFrames = (scenes: DataStoryProps['scenes']): number =>
  scenes.reduce((sum, s) => sum + s.durationFrames, 0);
