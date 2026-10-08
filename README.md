# Portafolio ManelDev (React)

Portafolio en React + Vite + Tailwind con un pequeño servidor Express que guarda los proyectos
en `server/data/projects.json` y las imágenes en `server/uploads/`.

## Arrancar en local

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- Panel admin: http://localhost:5173/admin (usuario y contraseña en `.env`)

## Producción

```bash
npm run build
npm start        # sirve la web + la API en http://localhost:3001
```

Con panel admin hace falta un hosting con Node (Render, Railway, un VPS…).

## GitHub Pages (versión estática)

Demo: https://mballesterdev.github.io/Portafolio2026/

```bash
npm run deploy   # build en modo "pages" + publica dist/ en la rama gh-pages
```

- `vite.config.js` usa `base: '/Portafolio2026/'` solo en modo `pages`.
- `scripts/prepare-pages.js` copia `server/data/projects.json` y `server/uploads/` a `dist/`, así la web muestra los proyectos sin servidor.
- En Pages no existe `/admin`: edita los proyectos en local (`npm run dev`) y vuelve a hacer `npm run deploy`.
Las credenciales van en `.env` (copia `.env.example`). El `.env` no se sube a git.
