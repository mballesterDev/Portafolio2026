import useReveal from '../hooks/useReveal.js';
import { skills } from '../data/profile.js';

export default function Skills() {
  const ref = useReveal();

  return (
    <ul ref={ref} className="reveal grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {skills.map(({ name, logo, level }, i) => (
        <li
          key={name}
          style={{ '--delay': `${i * 80}ms` }}
          className="glass group p-4 transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-brand/40"
        >
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt=""
              className="size-10 shrink-0 rounded-lg bg-white object-contain p-1.5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
            />
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="font-mono text-xs text-zinc-400">{level}%</p>
            </div>
          </div>
          <div className="skill-bar mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div style={{ width: `${level}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
