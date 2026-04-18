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
   - Footage + DataStory panels en split horizontal → `HybridReel` ← **PRINCIPAL**
   - Frase de impacto animada → `TextReveal`
   - Comparativa dos columnas → `SplitScreen`
4. Generar los props con el contenido extraído
5. Actualizar `Root.tsx` con los nuevos defaultProps
6. El usuario previsualiza en `npm run dev` → `localhost:3000`
7. Render manual: `npx remotion render <Composición> out/<nombre>.mp4 --input-props="src/data/<nombre>-props.json"`

---

## Composiciones disponibles

### `HybridReel` ← COMPOSICIÓN PRINCIPAL (1080×1920)
Footage real + paneles de datos en split horizontal animado.

**Modos de segmento:**
- `split-bottom` — vídeo arriba (50%), panel de datos abajo (50%)
- `split-top`    — panel arriba (50%), vídeo abajo (50%)
- `stat-pop`     — vídeo pantalla completa + stat flotante con cristal esmerilado

**Tipos de panel** (`panel.type`):
- `stat`     — número grande contando con tendencia ↑↓, subtext
- `keyword`  — palabras con spotlight, highlight en accent color
- `quote`    — cita elegante con comillas y fuente
- `hook`     — typewriter en directo con cursor parpadeante
- `list`     — puntos que aparecen uno a uno en fila

**Props principales:**
```ts
{
  videoSrc: string,             // URL del webm/mp4
  durationFrames: number,       // total frames (segundos × 30)
  captions: [{word, start, end}], // palabras Whisper en segundos
  showCaptions: boolean,        // default true
  handle: string,               // default 'vitaminak.of'
  ctaText: string,
  ctaDurationFrames: number,
  accentColor: string,          // default '#E63946'
  segments: Segment[],
}
```

**Comportamiento:**
- Captions CapCut-style con bounce animation — se OCULTAN automáticamente cuando hay panel activo
- Ken Burns sutil (scale 1→1.04 a lo largo del vídeo)
- Vignette dinámica (se intensifica al hablar)
- Círculo de progreso top-left: grande (R=44), número % dentro, glow, pulsa al 90%+
- Handle top-right (vitaminak.of)
- CTA rojo redondeado en los últimos `ctaDurationFrames` frames
- Divider horizontal luminoso entre vídeo y panel durante split

**Ejemplo de segmento:**
```ts
{ mode: 'split-bottom', startFrame: 230, endFrame: 420, panel: { type: 'stat', value: '609', label: 'asesores en Moncloa', trend: 'up' } }
{ mode: 'stat-pop', startFrame: 870, endFrame: 1010, value: '+76%', label: 'más gasto en asesores', subtext: '40M€ → 71M€' }
```

---

### `DataStory` (1080×1080)
Escenas en secuencia con fondo dinámico.

**Tipos de escena:** `hook`, `title`, `stat`, `quote`, `chart`, `keyword`, `comparison`
**Props globales:** `scenes`, `accentColor`, `background`, `theme?: 'dark'|'light'|'alert'`

### `FootageWithOverlay` (1080×1920)
Vídeo real con subtítulos CapCut, overlays reactivos (breaking/stat/warning/countdown), lower third.

**Props clave:** `videoSrc`, `captions`, `captionPosition`, `handle`, `introDurationFrames`, `ctaDurationFrames`, `overlays`, `lowerThird`

**Overlay types:** `alert`, `warning`, `breaking`, `stat`, `chart-up`, `countdown`

### `TextReveal` (1080×1080)
Frase de impacto, palabras con spring una a una. Props: `text`, `fontSize`, `durationFrames`

### `SplitScreen` (1080×1080)
Dos columnas: contador animado izquierda + texto derecha. Props: `left`, `right`, `durationFrames`

### `CaptionVideo` (1080×1080)
Ventana deslizante de palabras con highlight.

### `SplitReel` (1080×1920)
DataStory arriba + vídeo abajo. Props: `scenes`, `videoSrc`, `videoDurationFrames`, `splitRatio`

---

## Brand (`src/brand/brand.ts`)

```ts
BRAND.colors: { black:'#080808', white:'#F5F5F0', accent:'#E63946', positive:'#22C55E',
                negative:'#E63946', yellow:'#FACC15', blue:'#3B82F6', red:'#E63946', green:'#22C55E' }
BRAND.fonts:  { heading: 'Inter', mono: 'JetBrains Mono' }
BRAND.fps: 30
BRAND.width: 1080 | BRAND.height: 1080       ← cuadrado
BRAND.widthVertical: 1080 | BRAND.heightVertical: 1920  ← Reels
```

---

## Pipeline de grabación

### Iniciar todo (doble clic)
```
start.bat  →  node record-server.js (puerto 3001/3443)
           →  npm run dev (Remotion Studio puerto 3000)
           →  abre localhost:3000 y localhost:3001/studio.html
```

### Flujo completo
1. `localhost:3001/studio.html` → activar cámara PC o conectar móvil por QR
2. **📖 Guión** → teleprompter centrado sobre la cámara (texto 2.6rem, centrado vertically)
   - Navegar escenas con ← → teclado
   - El guión viene de `src/data/current-scenes.json` (formato: `{title, scenes:[{type, text, note, durationFrames}]}`)
3. Grabar → subir → Whisper transcribe automáticamente
4. Server guarda `src/data/<baseName>-props.json` con captions
5. Abrir `localhost:3000` → **HybridReel** → cargar props → previsualizar

### Preparar guión para nueva noticia
1. Leer URL del artículo con WebFetch
2. Extraer datos clave
3. Escribir 5-6 escenas en lenguaje hablado (no formal)
4. Guardar en `src/data/current-scenes.json`
5. El teleprompter lo carga automáticamente al hacer F5 en studio.html

### Actualizar HybridReel con nueva grabación
1. Leer `src/data/<baseName>-props.json` generado por el server
2. Calcular `durationFrames = Math.ceil(lastWordEnd * 30) + 60`
3. Mapear timestamps Whisper a frames (segundos × 30) para alinear segmentos
4. Actualizar `src/Root.tsx` → defaultProps del HybridReel
5. TypeScript check → `npx tsc --noEmit`
6. Push a GitHub → Render redespliega

---

## Archivos clave

| Archivo | Función |
|---------|---------|
| `src/Root.tsx` | Registro de composiciones + defaultProps |
| `src/compositions/HybridReel.tsx` | Composición principal |
| `src/compositions/FootageWithOverlay.tsx` | Footage con overlays reactivos |
| `src/compositions/DataStory.tsx` | Escenas de datos |
| `src/data/current-scenes.json` | Guión activo del teleprompter |
| `src/data/<name>-props.json` | Props generados por Whisper para cada grabación |
| `record-server.js` | Servidor grabación (WebRTC + Whisper + props) |
| `recording/studio.html` | Studio PC (cámara + teleprompter + pipeline) |
| `recording/mobile.html` | App móvil (cámara + teleprompter táctil) |
| `src/brand/brand.ts` | Colores, fuentes, dimensiones |
| `start.bat` | Arranca todo de un doble clic |

---

## Whisper / Transcripción

- POST `/api/process` → Whisper model `small`, lang `es`, `--word_timestamps True`
- Output JSON en `src/data/whisper_tmp/<baseName>.json`
- Whisper bin: `C:\Users\kevin\AppData\Local\Programs\Python\Python311\Scripts\whisper.exe`
- FFmpeg bin: `C:\...\Gyan.FFmpeg_Microsoft...\ffmpeg-8.1-full_build\bin`

---

## GitHub / Render

- Repo: `https://github.com/vitamina-k/remotion-studio`
- Deploy: Render.com free tier (Frankfurt), `npx remotion studio --ipv4 --port $PORT`
- Token: classic PAT con scope `repo` — el usuario lo pega en `token.txt`, se usa y se borra
- Push: `git push "https://vitamina-k:<TOKEN>@github.com/vitamina-k/remotion-studio.git" main`

---

## Pendiente para próximas sesiones

- [ ] **Recorte de silencios** — FFmpeg detecta silencios y los corta antes de Whisper
  - `ffmpeg -i input.webm -af silenceremove=...` o con `silencedetect` + script de corte
  - Guardar timestamps de corte en edit-plan.json para sincronizar captions
- [ ] **Render automático** — cuando el usuario apruebe en Studio, renderizar a MP4
  - Solución Windows: spawn en proceso separado sin conflicto con `npm run dev`
  - O botón manual en studio.html que llame a `npx remotion render` via API
- [ ] **Vista previa en móvil** del resultado antes de publicar

---

## Notas importantes

- En Windows usar siempre `--input-props` con ruta JSON, nunca JSON inline en CLI
- El `record-server.js` NO renderiza automáticamente (conflicto con Studio en Windows)
- Los vídeos `.webm` se sirven desde `localhost:3001/recordings/` — NO funcionan en Render
- En Render.com el `videoSrc` debe estar vacío o ser una URL pública
- `durationInFrames` en `<Composition>` y `durationFrames` en `defaultProps` deben coincidir
