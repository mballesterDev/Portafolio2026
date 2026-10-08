import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DIST_DIR = path.join(__dirname, '..', 'dist');

const PORT = process.env.PORT || 3001;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
// Sin JWT_SECRET en el .env se genera uno aleatorio: las sesiones caducan al reiniciar el servidor
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

if (!ADMIN_USER || !ADMIN_PASSWORD) {
  console.warn('⚠ Falta ADMIN_USER / ADMIN_PASSWORD en el .env: el panel admin no podrá iniciar sesión.');
}

// ---------- Persistencia (JSON en disco) ----------

async function readProjects() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

let writing = Promise.resolve();
function writeProjects(projects) {
  // Encadena las escrituras para que no se pisen entre peticiones simultáneas
  writing = writing.then(() => fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2) + '\n'));
  return writing;
}

async function removeUpload(imagePath) {
  if (!imagePath?.startsWith('/uploads/')) return;
  const file = path.join(UPLOADS_DIR, path.basename(imagePath));
  await fs.unlink(file).catch(() => {});
}

// ---------- Validación ----------

function cleanUrl(value) {
  const url = String(value ?? '').trim();
  if (!url) return '';
  try {
    const { protocol } = new URL(url);
    if (protocol === 'http:' || protocol === 'https:') return url;
  } catch {}
  throw new Error(`URL no válida: ${url}`);
}

function parseProject(body) {
  const title = String(body.title ?? '').trim();
  if (!title) throw new Error('El título es obligatorio');

  const technologies = Array.isArray(body.technologies)
    ? body.technologies
    : String(body.technologies ?? '').split(',');

  return {
    title,
    description: String(body.description ?? '').trim(),
    category: String(body.category ?? '').trim() || 'Otros',
    technologies: technologies.map((t) => String(t).trim()).filter(Boolean),
    repoUrl: cleanUrl(body.repoUrl),
    demoUrl: cleanUrl(body.demoUrl),
    featured: body.featured === true || body.featured === 'true',
  };
}

function slugify(text) {
  const base = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base || 'proyecto'}-${crypto.randomBytes(3).toString('hex')}`;
}

// ---------- Subida de imágenes ----------

const ALLOWED_IMAGES = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' };

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ALLOWED_IMAGES[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGES[file.mimetype]) cb(null, true);
    else cb(new Error('Formato de imagen no permitido (usa PNG, JPG, WEBP o GIF)'));
  },
});

// ---------- Auth ----------

const loginAttempts = new Map();

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesión no válida o caducada' });
  }
}

// ---------- App ----------

const app = express();
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

app.post('/api/login', (req, res) => {
  const ip = req.ip;
  const attempt = loginAttempts.get(ip) ?? { count: 0, until: 0 };
  if (attempt.until > Date.now()) {
    return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
  }

  const { username, password } = req.body ?? {};
  const ok = ADMIN_USER && ADMIN_PASSWORD && safeEqual(username, ADMIN_USER) && safeEqual(password, ADMIN_PASSWORD);
  if (!ok) {
    attempt.count += 1;
    if (attempt.count >= 5) Object.assign(attempt, { count: 0, until: Date.now() + 5 * 60 * 1000 });
    loginAttempts.set(ip, attempt);
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  loginAttempts.delete(ip);
  const token = jwt.sign({ sub: ADMIN_USER }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

app.get('/api/session', requireAuth, (_req, res) => res.json({ ok: true }));

app.get('/api/projects', async (_req, res, next) => {
  try {
    res.json(await readProjects());
  } catch (err) {
    next(err);
  }
});

app.post('/api/projects', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const data = parseProject(req.body);
    const project = {
      id: slugify(data.title),
      ...data,
      image: req.file ? `/uploads/${req.file.filename}` : cleanUrl(req.body.imageUrl),
    };
    const projects = await readProjects();
    projects.unshift(project);
    await writeProjects(projects);
    res.status(201).json(project);
  } catch (err) {
    if (req.file) await removeUpload(`/uploads/${req.file.filename}`);
    next(err);
  }
});

app.put('/api/projects/:id', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const projects = await readProjects();
    const index = projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Proyecto no encontrado' });

    const current = projects[index];
    const data = parseProject(req.body);
    let image = current.image;
    if (req.file) image = `/uploads/${req.file.filename}`;
    else if (req.body.removeImage === 'true') image = '';
    else if (req.body.imageUrl !== undefined && req.body.imageUrl !== current.image) image = cleanUrl(req.body.imageUrl);

    if (image !== current.image) await removeUpload(current.image);

    projects[index] = { ...current, ...data, image };
    await writeProjects(projects);
    res.json(projects[index]);
  } catch (err) {
    if (req.file) await removeUpload(`/uploads/${req.file.filename}`);
    next(err);
  }
});

app.delete('/api/projects/:id', requireAuth, async (req, res, next) => {
  try {
    const projects = await readProjects();
    const project = projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    await writeProjects(projects.filter((p) => p.id !== project.id));
    await removeUpload(project.image);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Recibe la lista de ids en el nuevo orden
app.put('/api/projects-order', requireAuth, async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    const projects = await readProjects();
    if (!Array.isArray(ids) || ids.length !== projects.length) {
      return res.status(400).json({ error: 'Orden no válido' });
    }
    const byId = new Map(projects.map((p) => [p.id, p]));
    const sorted = ids.map((id) => byId.get(id));
    if (sorted.some((p) => !p)) return res.status(400).json({ error: 'Orden no válido' });
    await writeProjects(sorted);
    res.json(sorted);
  } catch (err) {
    next(err);
  }
});

// En producción el mismo servidor sirve la build de React
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

app.use((err, _req, res, _next) => {
  const clientError = err instanceof multer.MulterError || /obligatorio|no válida|no permitido/.test(err.message);
  if (!clientError) console.error(err);
  res.status(clientError ? 400 : 500).json({ error: clientError ? err.message : 'Error interno del servidor' });
});

app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
