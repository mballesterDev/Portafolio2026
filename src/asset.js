// Ajusta las rutas absolutas ("/logos/x.png", "/uploads/x.png") a la "base" de Vite.
// En local BASE_URL es "/" y no cambia nada; en GitHub Pages es "/Portafolio2026/".
export const asset = (path) =>
  typeof path === 'string' && path.startsWith('/') ? import.meta.env.BASE_URL + path.slice(1) : path;

// true cuando se compila para GitHub Pages (npm run build:pages): no hay servidor Express
export const IS_STATIC = import.meta.env.MODE === 'pages';
