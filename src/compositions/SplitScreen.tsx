import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { BRAND, THEMES, ThemeName } from '../brand/brand';

// ─── Schema ───────────────────────────────────────────────────────────────────

export const splitScreenSchema = z.object({
  left: z.object({
    label: z.string(),
    value: z.string(),
    sublabel: z.string().optional(),
  }),
  right: z.object({
    text: z.string(),
    subtext: z.string().optional(),
  }),
  theme: z.enum(['dark', 'light', 'alert']).optional(),
  durationFrames: z.number().optional().default(150),
});

export type SplitScreenProps = z.infer<typeof splitScreenSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getValueColor = (value: string, accent: string): string => {
  if (value.startsWith('+')) return BRAND.colors.positive;
  if (value.startsWith('-')) return BRAND.colors.negative;
  return accent;
};

// ─── Composition ──────────────────────────────────────────────────────────────

export const SplitScreen: React.FC<SplitScreenProps> = ({
  left,
  right,
  theme,
  durationFrames = 150,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bg     = theme ? THEMES[theme as ThemeName].background : BRAND.colors.black;
  const color  = theme ? THEMES[theme as ThemeName].text       : BRAND.colors.white;
  const accent = theme ? THEMES[theme as ThemeName].accent     : BRAND.colors.accent;

  const valueColor = getValueColor(left.value, accent);

  // Global fade-out at end
  const globalOp = interpolate(frame, [durationFrames - 10, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Left panel — slides from left
  const leftProg = spring({ frame, fps, config: { damping: 20, stiffness: 140 } });
  const leftX    = interpolate(leftProg, [0, 1], [-200, 0]);
  const leftOp   = interpolate(leftProg, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  // Right panel — slides from right, delayed 15f
  const rightProg = spring({ frame: frame - 15, fps, config: { damping: 22, stiffness: 120 } });
  const rightX    = interpolate(rightProg, [0, 1], [200, 0]);
  const rightOp   = interpolate(rightProg, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  // Divider — grows from center
  const divProg = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 130 } });
  const divH    = interpolate(divProg, [0, 1], [0, 500]);

  // Value label — animated counter if numeric
  const rawNum = parseFloat(left.value.replace(/[^0-9.-]/g, ''));
  const isNum = !isNaN(rawNum);
  const countDuration = Math.floor(durationFrames * 0.5);
  const animatedNum = isNum
    ? interpolate(frame, [0, countDuration], [0, Math.abs(rawNum)], { extrapolateRight: 'clamp' })
    : null;
  const sign = left.value.startsWith('-') ? '-' : left.value.startsWith('+') ? '+' : '';
  const suffix = left.value.replace(/[0-9\-\+\.]/g, '');
  const displayValue = isNum
    ? sign + (Number.isInteger(rawNum) ? Math.round(animatedNum!).toString() : animatedNum!.toFixed(1)) + suffix
    : left.value;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        opacity: globalOp,
      }}
    >
      {/* ── Left panel: big animated value ── */}
      <div
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          opacity: leftOp,
          transform: `translateX(${leftX}px)`,
          padding: '0 60px',
        }}
      >
        {/* Label */}
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 28,
            fontWeight: 600,
            color,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            opacity: 0.65,
          }}
        >
          {left.label}
        </span>

        {/* Value */}
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 140,
            fontWeight: 900,
            color: valueColor,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            filter: `drop-shadow(0 0 40px ${hexToRgba(valueColor, 0.5)})`,
          }}
        >
          {displayValue}
        </span>

        {/* Sublabel */}
        {left.sublabel && (
          <span
            style={{
              fontFamily: BRAND.fonts.heading,
              fontSize: 24,
              fontWeight: 400,
              color,
              opacity: 0.55,
              textAlign: 'center' as const,
            }}
          >
            {left.sublabel}
          </span>
        )}

        {/* Mini progress bar under value */}
        <div
          style={{
            width: 140,
            height: 4,
            backgroundColor: hexToRgba(valueColor, 0.2),
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (frame / countDuration) * 100)}%`,
              backgroundColor: valueColor,
              borderRadius: 2,
              boxShadow: `0 0 12px ${hexToRgba(valueColor, 0.8)}`,
            }}
          />
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          width: 2,
          height: divH,
          backgroundColor: accent,
          flexShrink: 0,
          borderRadius: 2,
          boxShadow: `0 0 20px ${hexToRgba(accent, 0.6)}`,
        }}
      />

      {/* ── Right panel: text + subtext ── */}
      <div
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          opacity: rightOp,
          transform: `translateX(${rightX}px)`,
          padding: '0 60px',
        }}
      >
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 52,
            fontWeight: 700,
            color,
            lineHeight: 1.25,
            letterSpacing: '-0.025em',
            textAlign: 'center' as const,
          }}
        >
          {right.text}
        </span>

        {right.subtext && (
          <span
            style={{
              fontFamily: BRAND.fonts.heading,
              fontSize: 26,
              fontWeight: 400,
              color,
              opacity: 0.55,
              textAlign: 'center' as const,
              lineHeight: 1.5,
            }}
          >
            {right.subtext}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};
