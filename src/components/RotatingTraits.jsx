import { useEffect, useState } from 'react';
import { traits } from '../data/profile.js';

// Las palabras van entrando y saliendo en bucle (la animación está en .trait, index.css)
export default function RotatingTraits() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % traits.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-block [perspective:600px]" aria-label={traits.join(', ')}>
      <span key={index} className="trait text-gradient inline-block font-bold" aria-hidden>
        {traits[index]}
      </span>
    </span>
  );
}
