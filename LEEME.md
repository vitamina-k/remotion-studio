# remotion-project — Nota para el próximo Claude

Hola. Soy el Claude que trabajó en esto el 12/04/2026. Te dejo contexto completo para que no pierdas tiempo.

## Qué es esto

Un **estudio de grabación de vídeo** en el navegador construido sobre Node.js + Express + Socket.io + WebRTC. La idea es grabar vídeo desde la cámara del PC y/o desde la cámara del móvil (conectado por QR), mezclarlos, y descargar el resultado en .webm.

No tiene nada que ver con el framework Remotion (generación de vídeo con React) — el nombre viene de la plantilla base que se usó, pero la app es completamente custom.

## Cómo arrancarla

```bash
cd remotion-project
npm install        # solo la primera vez
node record-server.js
```

Abre en el navegador:
- `http://localhost:3001/studio.html` — interfaz principal del estudio (PC)
- `https://<IP_LOCAL>:3443/mobile.html` — para conectar el móvil (escanea el QR desde el studio)

El servidor genera un certificado SSL auto-firmado en cada arranque (necesario para que el móvil pueda acceder a la cámara vía HTTPS). En el móvil hay que aceptar el certificado manualmente (Avanzado → Continuar igualmente).

## Arquitectura

- `record-server.js` — Servidor Express con HTTP (puerto 3001) y HTTPS (puerto 3443). Genera cert SSL auto-firmado, sirve los archivos estáticos de `/recording/`, hace signaling WebRTC via Socket.io, y expone `/api/qr` para el código QR.
- `recording/studio.html` — Interfaz del estudio: selector de fuentes (cámara PC / móvil), preview en tiempo real, mezcla PiP, grabación con MediaRecorder, descarga del .webm.
- `recording/mobile.html` — Página para el móvil: accede a la cámara trasera/delantera, la transmite al studio vía WebRTC peer-to-peer.
- `src/` — Archivos del proyecto Remotion original (no relevantes para el recording studio).

## Estado al dejarlo

La funcionalidad está completa en código. El problema que había al dejarlo era que **la cámara no funcionaba** — ni en Chrome, ni en la app Cámara de Windows.

### Diagnóstico del problema de cámara

- El PC tenía **Windows 11 Pro N** instalado en hardware que idealmente iría con Windows 10
- La cámara es una **Angetube Live Camera** (USB, VID_1D6B — driver genérico Microsoft UVC)
- El Media Feature Pack estaba instalado (`Media.MediaFeaturePack~~~~0.0.1.0 = Installed`)
- Device Manager mostraba la cámara como `Status: OK`, sin errores de driver
- Pero la app Cámara de Windows fallaba con `0xA00F429F<WindowsShowFailed> (0x90004003)`
- Chrome también mostraba pantalla negra al intentar acceder a la cámara
- Se intentó: cambiar puerto USB, reinstalar driver via pnputil, instalar VC++ Redistributable 2015-2022, instalar software oficial de Angetube — ninguno funcionó

Kevin decidió **reinstalar Windows 10** para resolver el problema de raíz. Esta carpeta se guardó en el disco Element (D:\) antes del formateo.

### Cuando vuelvas con Windows 10

1. `npm install` para restaurar dependencias
2. La cámara debería funcionar directamente — si no, comprueba permisos de cámara en Chrome (barra de direcciones → icono cámara → Permitir)
3. El studio funciona en HTTP (`localhost`) sin necesitar HTTPS para la cámara del PC
4. Para el móvil sí necesitas el HTTPS — acepta el certificado auto-firmado en el navegador del móvil

## Diseño visual

El studio usa el mismo sistema de diseño que TradeVision-AI:
- Light mode, fondo `#F0EFEB`, superficie `#FFFFFF`
- Acento `#4E80EE` (azul), verde `#15803D`, rojo `#B91C1C`
- Fuentes: `Manrope` + `Space Mono`

Buena suerte. — Claude, 12/04/2026
