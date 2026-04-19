import React from 'react';
import { AbsoluteFill, interpolate, Series, spring, useCurrentFrame, useVideoConfig } from 'remotion';
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

  // Transición
  transitionFrames: z.number().optional().default(20),

  // Stat de puente (dato clave que conecta las dos partes)
  bridgeStat: z.object({
    value: z.string(),
    label: z.string(),
  }).optional(),
});

type PoliticalReelProps = z.infer<typeof politicalReelSchema>;

// ─── Bridge Stat Overlay ──────────────────────────────────────────────────────
// Se muestra los primeros N frames del footage como overlay glassmorphism

const BridgeStat: React.FC<{
  value: string;
  label: string;
  frame: number;
  fps: number;
  accentColor: string;
  durationFrames: number;
}> = ({ value, label, frame, fps, accentColor, durationFrames }) => {
  const fadeOutStart = durationFrames - 15;

  const enterAnim = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
    durationInFrames: 20,
  });

  const exitOpacity =
    frame >= fadeOutStart
      ? interpolate(frame, [fadeOutStart, durationFrames], [1, 0], { extrapolateRight: 'clamp' })
      : 1;

  const opacity = Math.min(enterAnim, exitOpacity);
  const scale = interpolate(enterAnim, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        backgroundColor: 'rgba(8,8,8,0.82)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        padding: '36px 56px',
        borderTop: `4px solid ${accentColor}`,
        textAlign: 'center',
        minWidth: 320,
        boxShadow: `0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)`,
      }}
    >
      <div
        style={{
          fontFamily: BRAND.fonts.mono,
          fontSize: 96,
          fontWeight: 900,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          textShadow: `0 0 40px ${accentColor}88`,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: BRAND.fonts.heading,
          fontSize: 28,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.75)',
          marginTop: 12,
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ─── Composición principal ────────────────────────────────────────────────────

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
  transitionFrames = 20,
  bridgeStat,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dataDuration = totalFrames(scenes);

  // Fade overlay: negro que aparece al final de DataStory y desaparece al inicio del footage
  const fadeOpacity = interpolate(
    frame,
    [dataDuration - transitionFrames, dataDuration, dataDuration + transitionFrames],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Bridge stat: dura los primeros 60 frames del footage
  const bridgeDuration = 60;
  const footageFrame = frame - dataDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>

      {/* ── Parte 1: Datos animados ── */}
      <Series>
        <Series.Sequence durationInFrames={dataDuration}>
          <DataStory
            scenes={scenes}
            background={background}
            accentColor={accentColor}
          />
        </Series.Sequence>

        {/* ── Parte 2: Footage con top bar consistente ── */}
        <Series.Sequence durationInFrames={footageDurationFrames}>
          <FootageWithOverlay
            videoSrc={videoSrc}
            durationFrames={footageDurationFrames}
            captions={captions}
            lowerThird={lowerThird}
            showCaptions={showCaptions}
            captionPosition={captionPosition}
            captionPreset="hormozi"
            background={background}
            handle="@handle"
            ctaText="Sígueme para más →"
            introDurationFrames={0}
            ctaDurationFrames={40}
            showTopBar
            topBarColor={accentColor}
          />
        </Series.Sequence>
      </Series>

      {/* ── Fade a negro en la transición ── */}
      <AbsoluteFill
        style={{
          backgroundColor: '#000000',
          opacity: fadeOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* ── Bridge stat al inicio del footage ── */}
      {bridgeStat && footageFrame >= 0 && footageFrame < bridgeDuration && (
        <BridgeStat
          value={bridgeStat.value}
          label={bridgeStat.label}
          frame={footageFrame}
          fps={fps}
          accentColor={accentColor}
          durationFrames={bridgeDuration}
        />
      )}

    </AbsoluteFill>
  );
};

// ─── Helper: duración total del reel ─────────────────────────────────────────

export const reelTotalFrames = (
  scenes: PoliticalReelProps['scenes'],
  footageDurationFrames: number
): number => totalFrames(scenes) + footageDurationFrames;
