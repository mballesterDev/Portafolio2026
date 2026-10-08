import { asset } from '../asset.js';

// Datos fijos del portafolio (los proyectos se gestionan desde /admin)

export const traits = ['RESOLUTIVO', 'EFICIENTE', 'VERSÁTIL', 'CREATIVO', 'ENGLISH FRIENDLY', 'INNOVADOR', 'APASIONADO'];

export const skills = [
  { name: 'HTML', logo: asset('/logos/html.png'), level: 90 },
  { name: 'JavaScript', logo: asset('/logos/js.png'), level: 80 },
  { name: 'CSS', logo: asset('/logos/css.png'), level: 90 },
  { name: 'React', logo: asset('/logos/react.svg'), level: 70 },
  { name: 'Tailwind', logo: asset('/logos/tailwind.png'), level: 85 },
  { name: 'Java', logo: asset('/logos/java.svg'), level: 80 },
  { name: 'Bootstrap', logo: asset('/logos/bootstrap.png'), level: 80 },
  { name: 'Python', logo: asset('/logos/python.svg'), level: 80 },
  { name: 'Git', logo: asset('/logos/git.png'), level: 80 },
  { name: 'Django', logo: asset('/logos/django.svg'), level: 80 },
];

export const links = {
  github: 'https://github.com/mballesterDev',
};
