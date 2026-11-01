import { useEffect, useMemo, useState } from 'react';
import RotatingTraits from '../components/RotatingTraits.jsx';
import Skills from '../components/Skills.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import useReveal from '../hooks/useReveal.js';
import { api } from '../api.js';
import { links } from '../data/profile.js';
import { asset } from '../asset.js';

const ALL = 'Todos';
const external = { target: '_blank', rel: 'noopener noreferrer' };
const link = 'text-brand-2 underline decoration-brand-2/30 underline-offset-4 transition-colors hover:text-brand hover:decoration-brand';

function SectionTitle({ index, children }) {
  return (
    <div className="mb-10 text-center">
      <p className="eyebrow">{index}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{children}</h2>
    </div>
  );
}

export default function Home() {
  const [projects, setProjects] = useState(null); // null = cargando
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState(ALL);
  const aboutRef = useReveal();
  const contactRef = useReveal();

  useEffect(() => {
    api.getProjects().then(setProjects).catch(() => setError(true));
  }, []);

  const categories = useMemo(() => [ALL, ...new Set((projects ?? []).map((p) => p.category))], [projects]);
  const visible = (projects ?? []).filter((p) => filter === ALL || p.category === filter);

  return (
    <>
      <div className="scroll-progress" />

      <nav className="sticky top-0 z-50 border-b border-white/5 bg-ink/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-12">
          <a href="#" className="font-mono text-lg font-bold">
            <span className="text-brand">&lt;</span>ManelDev<span className="text-brand">/&gt;</span>
          </a>
          <div className="flex items-center gap-1 text-sm sm:gap-4">
            <a href="#sobre-mi" className="hidden px-2 text-zinc-400 transition-colors hover:text-white sm:block">
              Sobre mí
            </a>
            <a href="#proyectos" className="hidden px-2 text-zinc-400 transition-colors hover:text-white sm:block">
              Proyectos
            </a>
            <a href="#contacto" className="hidden px-2 text-zinc-400 transition-colors hover:text-white sm:block">
              Contacto
            </a>
            <a href={links.github} {...external} className="btn btn-ghost py-1.5">
              GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 md:px-12">
        <header className="grid min-h-[calc(100svh-4rem)] items-center gap-10 py-16 md:grid-cols-[3fr_2fr]">
          <div className="reveal is-visible text-center md:text-left">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-zinc-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              Desarrollador web FullStack
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
              Hola, soy <span className="text-gradient">Manel</span>
            </h1>
            <p className="mt-6 font-mono text-lg tracking-[0.2em] text-zinc-400 md:text-2xl">MANELDEV ES:</p>
            <p className="mt-2 h-10 text-2xl tracking-wider md:h-12 md:text-4xl">
              <RotatingTraits />
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 md:justify-start">
              <a href="#proyectos" className="btn btn-primary px-6 py-2.5">
                Ver proyectos ↓
              </a>
              <a href="#sobre-mi" className="btn btn-ghost px-6 py-2.5">
                Sobre mí
              </a>
            </div>
          </div>

          <div className="reveal is-visible mx-auto w-64 md:w-full md:max-w-sm" style={{ '--delay': '200ms' }}>
            <img
              src={asset('/manel3.png')}
              alt="Manel"
              className="animate-float w-full [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
            />
          </div>
        </header>

        <section id="sobre-mi" className="scroll-mt-24 py-16">
          <SectionTitle index="01 · Quién soy">Sobre mí</SectionTitle>
          <div ref={aboutRef} data-anim="right" className="reveal glass space-y-4 p-6 leading-relaxed text-zinc-300 md:p-10 md:text-lg">
            <p>
              Soy Manel, un desarrollador web FullStack con conocimientos sólidos, adquiridos tanto con la{' '}
              <strong className="text-brand">educación tradicional (DAW) como de forma autodidacta, completando varios cursos de Udemy</strong>.
              Tengo un <strong className="text-brand">nivel de inglés C1 certificado por Cambridge</strong> y buenas soft skills.
            </p>
            <p>
              Abajo os dejo algunas de
              mis especialidades y mis proyectos. Aquí mi{' '}
              <a href={links.github} {...external} className={link}>
                GitHub
              </a>
              .
            </p>
          </div>
          <div className="mt-6">
            <Skills />
          </div>
          <a
            href="#proyectos"
            className="mx-auto mt-16 block w-fit animate-bounce font-mono font-bold tracking-widest transition-colors hover:text-brand"
          >
            PROYECTOS ⭣
          </a>
        </section>

        <section id="proyectos" className="scroll-mt-24 py-16">
          <SectionTitle index="02 · Lo que he hecho">Proyectos</SectionTitle>

          {projects?.length > 0 && (
            <div className="glass mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full p-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                    filter === c
                      ? 'bg-linear-to-r from-brand to-brand-2 text-on-brand'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {error ? (
            <p className="mt-10 text-center text-red-400">No se pudieron cargar los proyectos.</p>
          ) : !projects ? (
            <p className="mt-10 animate-pulse text-center text-zinc-400">Cargando proyectos…</p>
          ) : (
            projects.length === 0 && <p className="mt-10 text-center text-zinc-400">Todavía no hay proyectos.</p>
          )}

          {/* key={filter} vuelve a montar las tarjetas para que se animen al filtrar */}
          <div key={filter} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </section>

        <section id="contacto" className="scroll-mt-24 py-16">
          <SectionTitle index="03 · Hablemos">Contacto</SectionTitle>
          <div ref={contactRef} className="reveal glass mx-auto max-w-2xl p-6 text-center md:p-10">
            <p className="leading-relaxed text-zinc-300 md:text-lg">
              ¿Tienes un proyecto en mente o una oferta de trabajo? Escríbeme y te responderé lo antes posible.
            </p>
            <a href={`mailto:${links.email}`} className={`${link} mt-6 inline-block font-mono text-lg md:text-xl`}>
              {links.email}
            </a>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={`mailto:${links.email}`} className="btn btn-primary px-6 py-2.5">
                Enviar email ✉
              </a>
              <a href={links.github} {...external} className="btn btn-ghost px-6 py-2.5">
                GitHub ↗
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} ManelDev ·{' '}
        <a href={links.github} {...external} className="transition-colors hover:text-brand">
          GitHub
        </a>{' '}
        ·{' '}
        <a href={`mailto:${links.email}`} className="transition-colors hover:text-brand">
          {links.email}
        </a>
      </footer>
    </>
  );
}
