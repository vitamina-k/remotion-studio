import React from 'react';
import {
  AbsoluteFill,
  Loop,
  Video,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { z } from 'zod';
import { BRAND } from '../brand/brand';
import { DataStory, dataStorySchema, totalFrames } from './DataStory';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ─── Schema ──────────────────────────────────────────────────────────────────

export const splitReelSchema = z.object({
  // Escenas de datos animados (misma estructura que DataStory)
  scenes: dataStorySchema.shape.scenes,
  accentColor: z.string().optional().default(BRAND.colors.accent),
  background: z.string().optional().default(BRAND.colors.black),

  // Vídeo del presentador
  videoSrc: z.string(),
  videoDurationFrames: z.number(),

  // Layout: top-bottom (arriba datos, abajo persona)
  // 0.45 = datos ocupan 45% de la altura, persona 55%
  splitRatio: z.number().optional().default(0.45),

  // Etiqueta del presentador (opcional)
  presenterName: z.string().optional(),
  presenterTitle: z.string().optional(),

  // Si true, las animaciones de datos hacen loop durante todo el vídeo
  loopDataAnimation: z.boolean().optional().default(true),
});

export type SplitReelProps = z.infer<typeof splitReelSchema>;

// ─── Divider animado ─────────────────────────────────────────────────────────

const AnimatedDivider: React.FC<{ frame: number; accentColor: string }> = ({ frame, accentColor }) => {
  const width = interpolate(frame, [0, 20], [0, 100], { extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: `${width}%`,
        height: 4,
        background: `linear-gradient(90deg, ${accentColor}, ${hexToRgba(accentColor, 0.4)})`,
        boxShadow: `0 0 20px ${hexToRgba(accentColor, 0.8)}, 0 0 40px ${hexToRgba(accentColor, 0.3)}`,
      }}
    />
  );
};

// ─── Nameplate centrado en el divisor ────────────────────────────────────────

const PresenterTag: React.FC<{
  name: string;
  title?: string;
  frame: number;
  fps: number;
  accentColor: string;
  dividerY: number; // posición Y del divisor en el canvas
}> = ({ name, title, frame, fps, accentColor, dividerY }) => {
  const showDelay = 18;
  const prog = spring({ frame: frame - showDelay, fps, config: { damping: 20, stiffness: 160, mass: 0.7 } });
  const scaleY = interpolate(prog, [0, 1], [0, 1]);
  const op = interpolate(prog, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: dividerY,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // Centra verticalmente sobre la línea divisoria
        transform: 'translateY(-50%)',
        opacity: op,
        pointerEvents: 'none',
      }}
    >
      {/* Línea izquierda */}
      <div style={{
        flex: 1,
        height: 2,
        background: `linear-gradient(to right, transparent, ${hexToRgba(accentColor, 0.4)})`,
        marginRight: 20,
      }} />

      {/* Badge central — todo el bloque se desplaza de lado a lado */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'rgba(8, 8, 8, 0.92)',
          border: `1px solid ${hexToRgba(accentColor, 0.5)}`,
          backdropFilter: 'blur(16px)',
          padding: '10px 32px',
          borderRadius: 4,
          // scaleY en la entrada + translateX continuo para el ticker
          transform: `scaleY(${scaleY}) translateX(${Math.sin(frame * 0.025) * 180}px)`,
          transformOrigin: 'center',
          boxShadow: `0 0 30px ${hexToRgba(accentColor, 0.25)}`,
        }}
      >
        <span
          style={{
            fontFamily: BRAND.fonts.heading,
            fontSize: 32,
            fontWeight: 800,
            color: BRAND.colors.white,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          {name}
        </span>
        {title && (
          <span
            style={{
              fontFamily: BRAND.fonts.heading,
              fontSize: 18,
              fontWeight: 600,
              color: accentColor,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Línea derecha */}
      <div style={{
        flex: 1,
        height: 2,
        background: `linear-gradient(to left, transparent, ${hexToRgba(accentColor, 0.4)})`,
        marginLeft: 20,
      }} />
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

export const SplitReel: React.FC<SplitReelProps> = ({
  scenes,
  accentColor = BRAND.colors.accent,
  background = BRAND.colors.black,
  videoSrc,
  videoDurationFrames,
  splitRatio = 0.45,
  presenterName,
  presenterTitle,
  loopDataAnimation = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const dataPanelH = Math.round(height * splitRatio);  // ej: 864px para 1920 * 0.45
  const personPanelH = height - dataPanelH;            // ej: 1056px

  const dataTotal = totalFrames(scenes);

  // Centrado horizontal del panel de datos
  const dataScale = dataPanelH / BRAND.height;
  const dataOffsetX = (width - BRAND.width * dataScale) / 2;

  // Barra de progreso: llena de 0→100% a lo largo de toda la duración del vídeo
  const progressPct = interpolate(frame, [0, videoDurationFrames - 1], [0, 100], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: 'hidden' }}>

      {/* ── Panel superior: datos animados ───────────────────────── */}
      {/*
        El wrapper tiene exactamente el tamaño del contenido escalado (864×864),
        centrado con left: 108px. Así overflow:hidden corta limpio en todos los bordes
        y el gradiente dinámico no se asoma por ningún lado.
      */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: dataOffsetX,
          width: BRAND.width * dataScale,    // 864px — tamaño exacto escalado
          height: BRAND.height * dataScale,  // 864px
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: BRAND.width,       // 1080 — tamaño real de DataStory
            height: BRAND.height,     // 1080
            transformOrigin: 'top left',
            transform: `scale(${dataScale})`,
          }}
        >
          {loopDataAnimation ? (
            <Loop durationInFrames={dataTotal}>
              <DataStory
                scenes={scenes}
                background={background}
                accentColor={accentColor}
              />
            </Loop>
          ) : (
            <DataStory
              scenes={scenes}
              background={background}
              accentColor={accentColor}
            />
          )}
        </div>
      </div>

      {/* ── Divisor animado ──────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: dataPanelH - 2, left: 0, right: 0 }}>
        <AnimatedDivider frame={frame} accentColor={accentColor} />
      </div>

      {/* ── Panel inferior: vídeo del presentador ─────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: dataPanelH,
          left: 0,
          width,
          height: personPanelH,
          overflow: 'hidden',
          backgroundColor: background,
        }}
      >
        <Video
          src={videoSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top', // foco en la cara
          }}
        />

        {/* Gradiente de integración: funde el panel de video con el divisor */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            background: `linear-gradient(to bottom, ${background}, transparent)`,
            pointerEvents: 'none',
          }}
        />

        {/* Gradiente inferior sutil */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: `linear-gradient(to top, ${hexToRgba(background, 0.6)}, transparent)`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Nameplate centrado en el divisor ─────────────────────── */}
      {presenterName && (
        <PresenterTag
          name={presenterName}
          title={presenterTitle}
          frame={frame}
          fps={fps}
          accentColor={accentColor}
          dividerY={dataPanelH}
        />
      )}

      {/* ── Barra de progreso de retención (top) ─────────────────── */}
      {/* Fondo de la barra */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 6,
          backgroundColor: hexToRgba('#ffffff', 0.1),
        }}
      />
      {/* Progreso activo */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${progressPct}%`,
          height: 6,
          background: `linear-gradient(90deg, ${accentColor}, ${hexToRgba(accentColor, 0.75)})`,
          boxShadow: `0 0 14px ${hexToRgba(accentColor, 0.9)}, 0 0 4px ${hexToRgba('#ffffff', 0.4)}`,
        }}
      />
      {/* Punto de cabeza de la barra */}
      <div
        style={{
          position: 'absolute',
          top: -3,
          left: `calc(${progressPct}% - 6px)`,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: `0 0 10px ${hexToRgba(accentColor, 1)}, 0 0 20px ${hexToRgba(accentColor, 0.6)}`,
          opacity: progressPct > 1 && progressPct < 99 ? 1 : 0,
        }}
      />

      {/* ── Indicador de esquinas ─────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          borderTop: `4px solid ${accentColor}`,
          borderRight: `4px solid ${accentColor}`,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          width: 40,
          height: 40,
          borderBottom: `4px solid ${accentColor}`,
          borderLeft: `4px solid ${accentColor}`,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Helper: duración total del reel ─────────────────────────────────────────

export const splitReelTotalFrames = (videoDurationFrames: number): number =>
  videoDurationFrames;
