# Video Pipeline Skill

Cuando el usuario proporcione contexto (texto, URL, noticia, documento) y quiera producir un vídeo, sigue este proceso en orden.

## Flujo por defecto: Contexto → Vídeo

### Paso 1 — Leer y extraer

Lee el contexto que aporta el usuario. Extrae:
- Cifras y estadísticas destacadas (máximo 5)
- Frases potentes o citas directas
- Puntos principales del mensaje
- Tono: informativo, emocional, urgente, aspiracional

### Paso 2 — Elegir composición

| Contenido | Composición |
|-----------|-------------|
| Datos, cifras, estadísticas | `DataStory` |
| Frases, citas, captions | `CaptionVideo` |
| Footage real + overlays | `FootageWithOverlay` (solo si el usuario aporta un archivo de vídeo) |
| Mezcla datos + frases | `DataStory` (escenas tipo `title` + `stat` + `quote`) |

### Paso 3 — Generar props

Crea el archivo de props en `src/data/<nombre>-props.json` con el contenido extraído.

Para `DataStory`:
```json
{
  "scenes": [
    { "type": "title", "durationFrames": 75, "content": { "text": "...", "subtext": "..." } },
    { "type": "stat",  "durationFrames": 90, "content": { "value": "...", "label": "..." } },
    { "type": "quote", "durationFrames": 90, "content": { "text": "...", "subtext": "..." } }
  ]
}
```

Para `CaptionVideo`:
```json
{
  "transcript": [
    { "word": "Palabra", "start": 0.0, "end": 0.6 },
    ...
  ],
  "fontSize": 72
}
```

### Paso 4 — Actualizar Root.tsx

Actualiza los `defaultProps` de la composición correspondiente en `src/Root.tsx` con el contenido generado.

### Paso 5 — Confirmar preview

Indica al usuario:
- Qué composición se actualizó
- Que puede previsualizarla con `npm run dev` → Remotion Studio
- Qué ajustes puede hacer antes del render (duración, colores, fuente)

### Paso 6 — Render (cuando el usuario apruebe)

```bash
npx remotion render <ComposiciónId> out/<nombre>.mp4 --input-props="src/data/<nombre>-props.json"
```

En Windows usar **siempre** `--input-props` con ruta a archivo JSON. Nunca pasar JSON inline.

---

## Flujo alternativo: Si el usuario aporta footage real

Solo activar si el usuario proporciona un archivo de vídeo grabado.

### Paso 1 — Transcripción (opcional, requiere Whisper)
```bash
python -m whisper <archivo> --output_format json --language es --output_dir src/data/
```
Si Whisper no está instalado: `pip install openai-whisper`. Continuar sin captions si falla.

### Paso 2 — Edit plan
Genera `src/data/<nombre>-edit-plan.json`:
```json
{
  "cuts": [],
  "captions": [],
  "highlights": [],
  "estimatedDuration": 0
}
```

### Paso 3 — Render con FootageWithOverlay
Composición vertical 1080x1920 para Reels.

---

## Notas

- Props files → `src/data/`
- Renders finales → `out/`
- Formato por defecto: 1080x1080. Reels/vertical: 1080x1920 (`FootageWithOverlay`)
- Brand en `src/brand/brand.ts`
