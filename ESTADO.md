# Estado del proyecto — remotion-project

## Fecha: 2026-04-14

---

## Qué tenemos construido

### Composiciones
- **`DataStory`** — escenas en secuencia (`title`, `stat` con contador animado, `quote`). Fondo negro con grid sutil, acento rojo `#E63946`, animaciones por palabra (spring), barra de progreso en stat, top bar roja por escena.
- **`CaptionVideo`** — captions animados palabra por palabra, ventana deslizante de 5 palabras, highlight en rojo.
- **`FootageWithOverlay`** — vídeo real + captions overlay + lower third estilo noticiero (barra roja izquierda, nombre bold, título en rojo uppercase). Formato vertical 1080×1920.
- **`PoliticalReel`** — composición que encadena `DataStory` → `FootageWithOverlay` con `<Series>`. Funciona pero se nota el corte entre las dos partes.

### Infraestructura
- `src/brand/brand.ts` — paleta: negro, blanco, rojo (`#E63946`) como acento principal
- `src/utils/captions.ts` — lógica de ventana deslizante extraída y compartida
- `record-server.js` — servidor Express + WebRTC + upload + pipeline Whisper→render
- `recording/studio.html` — UI completa de grabación con panel de progreso del pipeline
- `.claude/skills/video-pipeline.md` — skill de orquestación del flujo

### Datos de prueba activos
- `src/data/liberacion-fiscal-props.json` — datos del informe Civismo 2025 (228 días, 62%, 18 agosto)
- `src/data/recordings/video-prueba.mp4` — vídeo de prueba grabado con móvil (23MB)

---

## Problema actual — PENDIENTE DE RESOLVER

**`PoliticalReel` se siente como dos vídeos pegados, no uno.**

El corte entre `DataStory` y `FootageWithOverlay` es abrupto. Necesita:

1. **Transición entre las dos partes** — opciones:
   - Fade a negro entre DataStory y footage (simple, efectivo)
   - Whip pan / zoom out / blur de salida
   - El último dato de DataStory se queda como overlay encima del primer frame del footage

2. **Coherencia visual** — el footage debería tener los mismos elementos de marca que DataStory:
   - Top bar roja también en el footage
   - Quizás mostrar el dato clave (`228`) como watermark sutil en la esquina durante el footage

3. **Continuidad narrativa** — considerar que DataStory termine con una "llamada a la acción" visual que conecte con que aparezca el presentador

---

## Próximos pasos

- [ ] Implementar transición fade/overlap entre DataStory y footage en `PoliticalReel`
- [ ] Añadir top bar roja consistente en `FootageWithOverlay`
- [ ] Añadir captions sincronizados (requiere Whisper o transcripción manual)
- [ ] Probar render final a MP4

---

## Flujo de trabajo actual

```
Contexto (texto/URL) → Claude extrae datos → genera props JSON → actualiza Root.tsx
→ preview en Remotion Studio (npm run dev) → render (npx remotion render)
```

**Windows:** usar siempre `--input-props="ruta/archivo.json"` — nunca JSON inline.

## Comandos clave

```bash
npm run dev          # Remotion Studio → http://localhost:3000
npm run record       # Record server → http://localhost:3001
npx remotion render PoliticalReel out/liberacion-fiscal-reel.mp4 --input-props="src/data/video-prueba-props.json"
```
