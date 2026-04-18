import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { BRAND, THEMES, ThemeName } from '../brand/brand';

// ─── Schema ───────────────────────────────────────────────────────────────────

export const textRevealSchema = z.object({
  text: z.string(),
  fontSize: z.number().optional().default(120),
  theme: z.enum(['dark', 'light', 'alert']).optional(),
  durationFrames: z.number().optional().default(90),
});

export type TextRevealProps = z.infer<typeof textRevealSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ─── Composition ──────────────────────────────────────────────────────────────

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  fontSize = 120,
  theme,
  durationFrames = 90,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bg      = theme ? THEMES[theme as ThemeName].background : BRAND.colors.black;
  const color   = theme ? THEMES[theme as ThemeName].text       : BRAND.colors.white;
  const accent  = theme ? THEMES[theme as ThemeName].accent     : BRAND.colors.accent;

  const words = text.split(' ');
  const INTERVAL = 8; // frames entre palabras

  // Fade-out global en los últimos 10 frames
  const globalOp = interpolate(frame, [durationFrames - 10, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
        gap: '0 24px',
        opacity: globalOp,
      }}
    >
      {words.map((word, i) => {
        const delay = i * INTERVAL;
        const prog = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20, stiffness: 180, mass: 0.7 },
        });
        const translateY = interpolate(prog, [0, 1], [60, 0]);
        const opacity    = interpolate(prog, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
        // Last word gets accent color + glow for emphasis
        const isLast = i === words.length - 1;
        const wordColor = isLast ? accent : color;

        return (
          <span
            key={i}
            style={{
              fontFamily: BRAND.fonts.heading,
              fontSize,
              fontWeight: 900,
              color: wordColor,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              transform: `translateY(${translateY}px)`,
              opacity,
              display: 'inline-block',
              textShadow: isLast
                ? `0 0 60px ${hexToRgba(accent, 0.6)}`
                : 'none',
            }}
          >
            {word}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};
