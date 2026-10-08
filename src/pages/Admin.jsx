import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm.jsx';
import { api, clearToken, getToken, setToken } from '../api.js';

export default function Admin() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    if (!getToken()) return setAuthed(false);
    api
      .checkSession()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return <p className="animate-pulse p-10 text-center text-zinc-400">Cargando…</p>;
  return authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <Login onLogin={() => setAuthed(true)} />;
}

function Brand() {
  return (
    <div>
      <p className="font-mono text-xl font-bold">
        <span className="text-brand">&lt;</span>ManelDev<span className="text-brand">/&gt;</span>
      </p>
      <p className="eyebrow mt-1">Panel admin</p>
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.login(username, password);
      setToken(token);
      onLogin();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <form onSubmit={handleSubmit} className="toast glass w-full max-w-sm space-y-5 p-8 shadow-2xl shadow-brand/5">
        <div className="text-center">
          <Brand />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Usuario</span>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required autoFocus />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Contraseña</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="toast text-sm text-red-400">{error}</p>}
        <button disabled={loading} className="btn btn-primary w-full py-2.5">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <Link to="/" className="block text-center text-sm text-zinc-400 transition-colors hover:text-brand">
          ← Volver al portafolio
        </Link>
      </form>
    </main>
  );
}

function Dashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(undefined); // undefined = cerrado, null = nuevo, objeto = editar
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const categories = useMemo(() => [...new Set(projects.map((p) => p.category))], [projects]);

  useEffect(() => {
    api.getProjects().then(setProjects).catch((err) => setError(err.message));
  }, []);

  function handleAuthError(err) {
    if (err.status === 401) onLogout();
    else setError(err.message);
  }

  function flash(text) {
    setMessage(text);
    setError('');
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleSubmit(formData) {
    try {
      if (editing) {
        const updated = await api.updateProject(editing.id, formData);
        setProjects((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
        flash('Proyecto actualizado');
      } else {
        const created = await api.createProject(formData);
        setProjects((ps) => [created, ...ps]);
        flash('Proyecto creado');
      }
      setEditing(undefined);
    } catch (err) {
      if (err.status === 401) return onLogout();
      throw err; // el formulario muestra el error
    }
  }

  async function handleDelete(project) {
    if (!confirm(`¿Borrar "${project.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteProject(project.id);
      setProjects((ps) => ps.filter((p) => p.id !== project.id));
      if (editing?.id === project.id) setEditing(undefined);
      flash('Proyecto borrado');
    } catch (err) {
      handleAuthError(err);
    }
  }

  async function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    const previous = projects;
    setProjects(next);
    try {
      await api.reorderProjects(next.map((p) => p.id));
    } catch (err) {
      setProjects(previous);
      handleAuthError(err);
    }
  }

  function logout() {
    clearToken();
    onLogout();
  }

  const openForm = (project) => {
    setEditing(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <Brand />
        <div className="flex items-center gap-3">
          <Link to="/" className="btn btn-ghost">
            Ver portafolio
          </Link>
          <button onClick={logout} className="btn btn-danger">
            Cerrar sesión
          </button>
        </div>
      </header>

      {message && (
        <p className="toast glass fixed bottom-6 right-6 z-50 border-brand/40 px-5 py-3 text-brand shadow-2xl">✓ {message}</p>
      )}
      {error && <p className="toast mt-6 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2 text-red-400">{error}</p>}

      <section className="mt-8">
        {editing === undefined ? (
          <button onClick={() => openForm(null)} className="btn btn-primary px-6 py-2.5">
            + Nuevo proyecto
          </button>
        ) : (
          <ProjectForm project={editing} categories={categories} onSubmit={handleSubmit} onCancel={() => setEditing(undefined)} />
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-extrabold tracking-tight">
          Proyectos <span className="text-zinc-500">({projects.length})</span>
        </h2>
        <p className="mb-5 mt-1 text-sm text-zinc-400">El orden de esta lista es el orden en que aparecen en el portafolio.</p>

        <ul className="space-y-3">
          {projects.map((p, i) => (
            <li
              key={p.id}
              className={`glass flex items-center gap-4 p-3 transition-colors hover:border-white/20 ${editing?.id === p.id ? 'border-brand/60' : ''}`}
            >
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-2 text-zinc-400 transition-colors hover:text-brand disabled:opacity-20" aria-label="Subir">
                  ▲
                </button>
                <button onClick={() => move(i, 1)} disabled={i === projects.length - 1} className="rounded px-2 text-zinc-400 transition-colors hover:text-brand disabled:opacity-20" aria-label="Bajar">
                  ▼
                </button>
              </div>
              <div className="hidden h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-black/40 sm:block">
                {p.image && <img src={p.image} alt="" className="h-full w-full object-contain" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {p.title} {p.featured && <span className="text-xs text-brand">★ destacado</span>}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">{p.category}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 text-sm sm:flex-row">
                <button onClick={() => openForm(p)} className="btn btn-ghost px-4 py-1">
                  Editar
                </button>
                <button onClick={() => handleDelete(p)} className="btn btn-danger px-4 py-1">
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
