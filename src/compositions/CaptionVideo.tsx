import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { BRAND, THEMES, ThemeName } from '../brand/brand';
import { getCaptionWindow, getWordState } from '../utils/captions';

export const captionVideoSchema = z.object({
  transcript: z.array(
    z.object({
      word: z.string(),
      start: z.number(), // seconds
      end: z.number(),   // seconds
    })
  ),
  fontSize: z.number().optional().default(72),
  color: z.string().optional().default(BRAND.colors.white),
  highlightColor: z.string().optional().default(BRAND.colors.accent),
  background: z.string().optional().default(BRAND.colors.black),
  theme: z.enum(['dark', 'light', 'alert']).optional(),
});

type CaptionVideoProps = z.infer<typeof captionVideoSchema>;

export const CaptionVideo: React.FC<CaptionVideoProps> = ({
  transcript,
  fontSize = 72,
  color = BRAND.colors.white,
  highlightColor = BRAND.colors.accent,
  background = BRAND.colors.black,
  theme,
}) => {
  const effectiveBg        = theme ? THEMES[theme as ThemeName].background : background;
  const effectiveColor     = theme ? THEMES[theme as ThemeName].text       : color;
  const effectiveHighlight = theme ? THEMES[theme as ThemeName].accent     : highlightColor;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTime = frame / fps;
  const { visibleWords, windowStart, activeIndex, lastPassedIndex } =
    getCaptionWindow(transcript, currentTime);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: effectiveBg,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        padding: '0 80px',
        gap: '0 20px',
        fontFamily: BRAND.fonts.heading,
        boxSizing: 'border-box',
      }}
    >
      {visibleWords.map((w, i) => {
        const globalIndex = windowStart + i;
        const { isActive, isPast } = getWordState(globalIndex, activeIndex, lastPassedIndex);

        return (
          <span
            key={`${globalIndex}-${w.word}`}
            style={{
              fontSize,
              fontWeight: 700,
              color: isActive ? effectiveHighlight : effectiveColor,
              opacity: isPast && !isActive ? 0.4 : 1,
              lineHeight: 1.3,
              transition: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            {w.word}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};
