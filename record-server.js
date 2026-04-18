const express    = require('express');
const http       = require('http');
const https      = require('https');
const { Server } = require('socket.io');
const selfsigned = require('selfsigned');
const os         = require('os');
const path       = require('path');
const fs         = require('fs');
const { execFile, exec } = require('child_process');
const QRCode     = require('qrcode');
const multer     = require('multer');

// ── Multer — guardar uploads en src/data/recordings/ ─────────
const RECORDINGS_DIR = path.join(__dirname, 'src', 'data', 'recordings');
fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RECORDINGS_DIR),
  filename:    (_req, file, cb) => {
    const ts   = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const ext  = path.extname(file.originalname) || '.webm';
    cb(null, `rec_${ts}${ext}`);
  },
});
const upload = multer({ storage });

const HTTP_PORT  = 3001;   // studio (localhost, HTTP está OK)
const HTTPS_PORT = 3443;   // móvil (HTTPS obligatorio para cámara)

function getLocalIP() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

// ── Certificado auto-firmado ──────────────────────────────────
const ip   = getLocalIP();
const attrs = [{ name: 'commonName', value: ip }];
const opts  = {
  keySize: 2048,
  days: 365,
  extensions: [
    { name: 'subjectAltName', altNames: [
      { type: 7, ip },
      { type: 2, value: 'localhost' },
    ]},
  ],
};
console.log('Generando certificado SSL...');
const pems = selfsigned.generate(attrs, opts);
const sslCreds = { key: pems.private, cert: pems.cert };

// ── App Express ───────────────────────────────────────────────
const app = express();
let io; // declarado aquí, inicializado tras crear los servidores
app.use(express.static(path.join(__dirname, 'recording')));
app.use('/recordings', express.static(RECORDINGS_DIR));

// Redirige móvil de HTTP → HTTPS
app.get('/mobile.html', (req, res, next) => {
  const host = req.headers.host || '';
  if (!host.startsWith('localhost') && !req.secure) {
    return res.redirect(`https://${ip}:${HTTPS_PORT}/mobile.html`);
  }
  next();
});

// ── POST /api/upload ─────────────────────────────────────────
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  res.json({
    filePath: req.file.path,
    name:     req.file.filename,
  });
});

// ── POST /api/process ────────────────────────────────────────
app.post('/api/process', express.json(), async (req, res) => {
  const { filePath, name } = req.body;
  if (!filePath || !name) return res.status(400).json({ error: 'filePath and name required' });

  const baseName  = path.basename(name, path.extname(name));
  const dataDir   = path.join(__dirname, 'src', 'data');
  const planPath  = path.join(dataDir, `${baseName}-edit-plan.json`);
  const outputMp4 = path.join(RECORDINGS_DIR, `${baseName}-rendered.mp4`);

  // Responde inmediatamente — progreso via Socket.io
  res.json({ ok: true, baseName });

  // ── Whisper transcripción ────────────────────────────────
  const WHISPER    = 'C:\\Users\\kevin\\AppData\\Local\\Programs\\Python\\Python311\\Scripts\\whisper.exe';
  const FFMPEG_DIR = 'C:\\Users\\kevin\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin';

  io.emit('process-event', { stage: 'whisper-start', message: 'Transcribiendo con Whisper (modelo small)...' });

  const whisperOutDir = path.join(dataDir, 'whisper_tmp');
  fs.mkdirSync(whisperOutDir, { recursive: true });

  const captions = await new Promise((resolve) => {
    const whisperArgs = [
      filePath,
      '--model', 'small',
      '--language', 'es',
      '--output_format', 'json',
      '--output_dir', whisperOutDir,
      '--fp16', 'False',
      '--word_timestamps', 'True',
    ];
    const env = { ...process.env, PATH: `${FFMPEG_DIR};${process.env.PATH}` };
    execFile(WHISPER, whisperArgs, { timeout: 300000, env }, (err, _stdout, stderr) => {
      if (err) {
        io.emit('process-event', { stage: 'whisper-error', message: `Whisper error: ${err.message}` });
        return resolve([]);
      }
      try {
        const jsonFile = path.join(whisperOutDir, path.basename(filePath, path.extname(filePath)) + '.json');
        const raw = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        const words = raw.segments.flatMap(seg =>
          (seg.words || []).map(w => ({ word: w.word.trim(), start: w.start, end: w.end }))
        );
        io.emit('process-event', { stage: 'whisper-done', message: `${words.length} palabras transcritas.` });
        resolve(words);
      } catch (e) {
        io.emit('process-event', { stage: 'whisper-error', message: `Error parseando JSON: ${e.message}` });
        resolve([]);
      }
    });
  });

  // 3. Generar edit plan
  const durationFrames = 0; // Se calculará en el render desde el vídeo
  const editPlan = {
    source:    filePath,
    name:      baseName,
    cuts:      [],
    captions,
    highlights: captions.filter(w => /\d/.test(w.word)).map(w => ({ start: w.start, end: w.end, reason: 'número' })),
    estimatedDuration: durationFrames,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(planPath, JSON.stringify(editPlan, null, 2));
  io.emit('process-event', { stage: 'plan-ready', message: `Edit plan guardado: ${planPath}` });

  // 4. Render con Remotion
  io.emit('process-event', { stage: 'render-start', message: 'Lanzando Remotion render...' });

  const propsFile = path.join(dataDir, `${baseName}-props.json`);
  fs.writeFileSync(propsFile, JSON.stringify({
    videoSrc:       `http://localhost:${HTTP_PORT}/recordings/${path.basename(filePath)}`,
    durationFrames: 300,   // fallback; reemplazar con valor real si se conoce
    captions,
    showCaptions:   captions.length > 0,
    captionPosition: 'bottom',
  }));

  // Usar execFile con args array para evitar problemas de quoting en Windows
  const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const renderArgs = [
    'remotion', 'render', 'FootageWithOverlay',
    outputMp4,
    `--props=${propsFile}`,
  ];

  execFile(npxBin, renderArgs, { cwd: __dirname, timeout: 600000 }, (err, _stdout, stderr) => {
    if (err) {
      io.emit('process-event', { stage: 'render-error', message: `Render falló: ${stderr || err.message}` });
    } else {
      io.emit('process-event', {
        stage:   'render-done',
        message: `Vídeo listo: ${outputMp4}`,
        output:  outputMp4,
      });
    }
  });
});

// ── GET /api/current-scenes ──────────────────────────────────
const SCENES_FILE = path.join(__dirname, 'src', 'data', 'current-scenes.json');

app.get('/api/current-scenes', (_req, res) => {
  try {
    if (!fs.existsSync(SCENES_FILE)) return res.json({ scenes: [], title: '' });
    const data = JSON.parse(fs.readFileSync(SCENES_FILE, 'utf8'));
    res.json(data);
  } catch (e) {
    res.json({ scenes: [], title: '' });
  }
});

app.get('/api/qr', async (req, res) => {
  const url = `https://${ip}:${HTTPS_PORT}/mobile.html`;
  const qr  = await QRCode.toDataURL(url, {
    width: 220, margin: 1,
    color: { dark: '#1A1917', light: '#FFFFFF' },
  });
  res.json({ url, qr, ip });
});

// ── Servidores HTTP + HTTPS ───────────────────────────────────
const httpServer  = http.createServer(app);
const httpsServer = https.createServer(sslCreds, app);

// Socket.io en ambos servidores
io = new Server({ cors: { origin: '*' } });
io.attach(httpServer);
io.attach(httpsServer);

// ── WebRTC signaling ──────────────────────────────────────────
io.on('connection', (socket) => {
  const role = socket.handshake.query.role || 'unknown';
  socket.join('studio');
  socket.to('studio').emit('peer-joined', { role });

  socket.on('offer',         (d) => socket.to('studio').emit('offer', d));
  socket.on('answer',        (d) => socket.to('studio').emit('answer', d));
  socket.on('ice-candidate', (d) => socket.to('studio').emit('ice-candidate', d));
  socket.on('mobile-ready',  ()  => socket.to('studio').emit('mobile-ready'));
  socket.on('remote-cmd',    (d) => socket.to('studio').emit('remote-cmd', d));
  socket.on('rec-state',     (d) => socket.to('studio').emit('rec-state', d));
  socket.on('disconnect',    ()  => socket.to('studio').emit('peer-left', { role }));
});

// ── Inicio ────────────────────────────────────────────────────
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   🎬  Recording Studio                   ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Studio →  http://localhost:${HTTP_PORT}        ║`);
    console.log(`║  Móvil  →  https://${ip}:${HTTPS_PORT}  ║`);
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  ⚠️  En el móvil acepta el cert.          ║');
    console.log('║     (Avanzado → Continuar igualmente)    ║');
    console.log('╚══════════════════════════════════════════╝\n');
  });
});
