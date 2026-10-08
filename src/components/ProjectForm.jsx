import { useEffect, useState } from 'react';

const EMPTY = {
  title: '',
  description: '',
  category: '',
  technologies: '',
  repoUrl: '',
  demoUrl: '',
  imageUrl: '',
  featured: false,
};

const TEXT_FIELDS = ['title', 'description', 'category', 'technologies', 'repoUrl', 'demoUrl', 'imageUrl'];

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export default function ProjectForm({ project, categories, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setValues(
      project
        ? { ...EMPTY, ...project, technologies: project.technologies.join(', '), imageUrl: project.image }
        : EMPTY,
    );
    setFile(null);
    setError('');
  }, [project]);

  useEffect(() => {
    if (!file) {
      setPreview(values.imageUrl);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, values.imageUrl]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const data = new FormData();
    TEXT_FIELDS.forEach((key) => data.append(key, values[key]));
    data.append('featured', values.featured);
    if (file) data.append('image', file);
    if (project && !file && !values.imageUrl) data.append('removeImage', 'true');

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="toast glass space-y-5 p-6 md:p-8">
      <h2 className="text-2xl font-extrabold tracking-tight">{project ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>

      <Field label="Título *">
        <input className="input" value={values.title} onChange={set('title')} required maxLength={100} />
      </Field>

      <Field label="Descripción">
        <textarea className="input min-h-24" value={values.description} onChange={set('description')} maxLength={600} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Categoría" hint="Elige una existente o escribe una nueva">
          <input className="input" list="categories" value={values.category} onChange={set('category')} placeholder="React" />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Tecnologías" hint="Separadas por comas">
          <input className="input" value={values.technologies} onChange={set('technologies')} placeholder="React, Tailwind, API REST" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Link al repositorio">
          <input className="input" type="url" value={values.repoUrl} onChange={set('repoUrl')} placeholder="https://github.com/mballesterDev/…" />
        </Field>
        <Field label="Link a la demo">
          <input className="input" type="url" value={values.demoUrl} onChange={set('demoUrl')} placeholder="https://mballesterdev.github.io/…" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
        <div className="space-y-4">
          <Field label="Imagen (subir archivo)" hint="PNG, JPG, WEBP o GIF · máx. 5 MB">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => setFile(e.target.files[0] ?? null)}
              className="block w-full text-sm text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-white/15 file:bg-white/5 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-white file:transition-colors hover:file:border-brand/60 hover:file:text-brand"
            />
          </Field>
          {!file && (
            <Field label="…o URL de la imagen">
              <input className="input" value={values.imageUrl} onChange={set('imageUrl')} placeholder="https://…" />
            </Field>
          )}
          {(file || values.imageUrl) && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setValues((v) => ({ ...v, imageUrl: '' }));
              }}
              className="text-sm text-red-400 underline-offset-4 hover:underline"
            >
              Quitar imagen
            </button>
          )}
        </div>
        <div className="grid aspect-video place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/30 text-xs text-zinc-500">
          {preview ? <img src={preview} alt="Vista previa" className="h-full w-full object-contain" /> : 'Sin imagen'}
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3">
        <input type="checkbox" checked={values.featured} onChange={set('featured')} className="size-4 accent-brand" />
        <span>Proyecto destacado</span>
      </label>

      {error && <p className="toast rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2 text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Guardando…' : project ? 'Guardar cambios' : 'Crear proyecto'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
}
