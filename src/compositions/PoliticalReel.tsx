import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { z } from 'zod';
import { BRAND } from '../brand/brand';
import { DataStory, dataStorySchema, totalFrames } from './DataStory';
import { FootageWithOverlay, footageWithOverlaySchema } from './FootageWithOverlay';

// ─── Schema ──────────────────────────────────────────────────────────────────

export const politicalReelSchema = z.object({
  // Parte 1 — datos
  scenes: dataStorySchema.shape.scenes,
  background: z.string().optional().default(BRAND.colors.black),
  accentColor: z.string().optional().default(BRAND.colors.accent),

  // Parte 2 — footage
  videoSrc: z.string(),
  footageDurationFrames: z.number(),
  captions: footageWithOverlaySchema.shape.captions,
  lowerThird: footageWithOverlaySchema.shape.lowerThird,
  showCaptions: z.boolean().optional().default(false),
  captionPosition: z.enum(['bottom', 'top']).optional().default('bottom'),
});

type PoliticalReelProps = z.infer<typeof politicalReelSchema>;

export const PoliticalReel: React.FC<PoliticalReelProps> = ({
  scenes,
  background = BRAND.colors.black,
  accentColor = BRAND.colors.accent,
  videoSrc,
  footageDurationFrames,
  captions,
  lowerThird,
  showCaptions = false,
  captionPosition = 'bottom',
}) => {
  const dataDuration = totalFrames(scenes);

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <Series>
        {/* Parte 1: Datos animados */}
        <Series.Sequence durationInFrames={dataDuration}>
          <DataStory
            scenes={scenes}
            background={background}
            accentColor={accentColor}
          />
        </Series.Sequence>

        {/* Parte 2: Tu vídeo con overlay */}
        <Series.Sequence durationInFrames={footageDurationFrames}>
          <FootageWithOverlay
            videoSrc={videoSrc}
            durationFrames={footageDurationFrames}
            captions={captions}
            lowerThird={lowerThird}
            showCaptions={showCaptions}
            captionPosition={captionPosition}
            background={background}
            handle="@handle"
            ctaText="Sígueme para más →"
            introDurationFrames={0}
            ctaDurationFrames={40}
          />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

// ─── Helper: duración total del reel ─────────────────────────────────────────

export const reelTotalFrames = (
  scenes: PoliticalReelProps['scenes'],
  footageDurationFrames: number
): number => totalFrames(scenes) + footageDurationFrames;
