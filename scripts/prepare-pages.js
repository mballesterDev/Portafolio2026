// Prepara dist/ para GitHub Pages (que solo sirve archivos estáticos):
//  - copia los proyectos (server/data/projects.json) como dist/projects.json
//  - copia las imágenes de los proyectos (server/uploads) a dist/uploads
//  - duplica index.html como 404.html para que las rutas de React Router no den 404
//  - añade .nojekyll para que GitHub sirva todos los archivos tal cual
import { cp, copyFile, writeFile } from 'node:fs/promises';

await copyFile('server/data/projects.json', 'dist/projects.json');
await cp('server/uploads', 'dist/uploads', { recursive: true });
await copyFile('dist/index.html', 'dist/404.html');
await writeFile('dist/.nojekyll', '');
console.log('dist/ listo para GitHub Pages');
