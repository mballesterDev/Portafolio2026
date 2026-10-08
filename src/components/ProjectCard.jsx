import useReveal from '../hooks/useReveal.js';
import { asset } from '../asset.js';

// Mueve la luz de .spotlight a la posición del ratón
function trackPointer(e) {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - top}px`);
}

export default function ProjectCard({ project, index = 0 }) {
  const ref = useReveal();
  const { title, description, category, technologies, repoUrl, demoUrl, image, featured } = project;
  // Si hay demo, la imagen también enlaza a ella
  const Media = demoUrl ? 'a' : 'div';
  const mediaLink = demoUrl
    ? { href: demoUrl, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `Ver ${title}`, title: 'Ver proyecto' }
    : {};

  return (
    <article
      ref={ref}
      onMouseMove={trackPointer}
      style={{ '--delay': `${(index % 3) * 120}ms` }}
      className={`reveal spotlight glass group flex flex-col overflow-hidden transition-[translate,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand/10 ${featured ? 'border-glow' : ''}`}
    >
      <Media {...mediaLink} className={`relative block aspect-video overflow-hidden bg-black/40 ${demoUrl ? 'cursor-pointer' : ''}`}>
        {image ? (
          <img
            src={asset(image)}
            alt={title}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full place-items-center font-mono text-3xl text-zinc-600">{'</>'}</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/80 to-transparent" />
        {featured && (
          <span className="absolute left-3 top-3 rounded-full bg-linear-to-r from-brand to-brand-2 px-3 py-0.5 text-xs font-bold text-on-brand shadow-lg">
            ★ DESTACADO
          </span>
        )}
      </Media>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{category}</p>
        <h3 className="mt-1.5 text-xl font-bold transition-colors group-hover:text-brand">{title}</h3>
        {description && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>}

        {technologies.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {technologies.map((t) => (
              <li key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-zinc-300">
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-6">
          {demoUrl && (
            <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Ver proyecto ↗
            </a>
          )}
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Repositorio
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
