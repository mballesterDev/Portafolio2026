import { useEffect, useRef } from 'react';

// Añade la clase .is-visible la primera vez que el elemento entra en pantalla
export default function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return ref;
}
