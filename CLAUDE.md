# remotion-project

## Modo de trabajo principal

El usuario proporciona contexto (noticia, URL, texto, documento, vídeo).
Tu trabajo es convertirlo en un vídeo con Remotion.

## Flujo estándar

1. Leer el contexto que da el usuario
2. Extraer datos clave: cifras, frases potentes, puntos principales (máximo 5)
3. Elegir composición(es):
   - Datos / estadísticas → `DataStory`
   - Frases / citas / captions → `CaptionVideo`
   - Footage real + subtítulos + overlay → `FootageWithOverlay`
   - Frase de impacto animada → `TextReveal`
   - Comparativa dos columnas → `SplitScreen`
4. Generar los props con el contenido extraído
5. Actualizar `Root.tsx` con los nuevos defaultProps
6. Confirmar al usuario que puede previsualizar en `npm run dev`
7. Cuando el usuario apruebe: `npx remotion render <Composición> out/<nombre>.mp4 --input-props="src/data/<nombre>-props.json"`

## Composiciones disponibles

### `DataStory`
Escenas en secuencia con fondo dinámico y barra de progreso roja→amarilla→verde.

**Tipos de escena** (`type` en discriminatedUnion):
- `title` — título grande + subtítulo opcional
- `stat` — contador animado con etiqueta + sublabel
- `quote` — cita con fuente
- `comparison` — dos columnas con valores, color por partido/categoría, campo `color` opcional
- `keyword` — palabras clave con highlight spotlight
- `hook` — retenedor de audiencia: typewriter + glitch + badge pulsante

**Props de escena comunes:**
- `bg?: 'gradient' | 'grid' | 'alert'` — background por escena
- `durationFrames?: number` — duración en frames (default varía por tipo)

**Props globales:**
- `scenes`, `accentColor`, `background`, `theme?: 'dark'|'light'|'alert'`

### `FootageWithOverlay`
Vídeo real (mp4/webm) con subtítulos sincronizados, efectos de foco y barra de progreso.

**Features:**
- Subtítulos centrados (o top/bottom) con spotlight: la palabra activa escala, resalta y brilla
- Palabras inactivas: opacity 0.25 + blur cuando hay palabra activa
- Vignette dinámica: se intensifica al hablar (0.55 vs 0.25 opacity)
- Overlay oscuro extra (rgba 0,0,0,0.28) solo al hablar
- Barra de progreso roja→amarilla→verde con dot y porcentaje en movimiento
- Lower third con slide-in/slide-out animado

**Props clave:**
- `videoSrc` — URL del vídeo (relativa o http://localhost:3001/recordings/...)
- `captions` — array `{word, start, end}` en segundos (de Whisper)
- `captionPosition: 'center' | 'bottom' | 'top'` (default: 'center')
- `showCaptions`, `lowerThird`, `theme`
- `durationFrames` — total de frames del vídeo

### `TextReveal`
Frase de impacto: palabras aparecen una a una con spring, última palabra en color acento.

**Props:** `text`, `fontSize` (default 120), `theme?`, `durationFrames` (default 90)

### `SplitScreen`
Comparativa dos columnas: izquierda con contador animado, derecha con texto.

**Props:**
- `left: { label, value, sublabel? }` — valor numérico animado, color auto-detectado por signo
- `right: { text, subtext? }` — texto descriptivo
- `theme?`, `durationFrames` (default 150)

### `CaptionVideo`
Palabras animadas con highlight, ventana deslizante de 5 palabras.

## Brand (`src/brand/brand.ts`)

```ts
BRAND.colors: { black, white, red, yellow, green, accent, negative, positive, mono }
BRAND.fonts:  { heading, mono }
THEMES: { dark, light, alert } → { background, text, accent }
```

Formato por defecto: 1080×1080. Reels/vertical: 1080×1920.

## Whisper / Transcripción

- Servidor en `record-server.js` — graba desde móvil vía WebRTC
- POST `/api/process` → Whisper (model small, lang es, word_timestamps) → JSON en `src/data/whisper_tmp/`
- Captions se guardan en `src/data/<baseName>-edit-plan.json` y en props para render
- Whisper bin: `C:\Users\kevin\AppData\Local\Programs\Python\Python311\Scripts\whisper.exe`
- FFmpeg bin: `C:\...\Gyan.FFmpeg...\ffmpeg-8.1-full_build\bin`

## Notas importantes

- En Windows usar siempre `--input-props` con ruta a archivo JSON, nunca `--props` con JSON inline
- Los props files se guardan en `src/data/`
- La carpeta `out/` es para los MP4 renderizados
- El record-server corre en puerto 3001 (HTTP) y 3443 (HTTPS para móvil con cámara)
- Studio Remotion: `npm run dev` → http://localhost:3000
- Iniciar servidores: `node record-server.js` en una terminal separada
