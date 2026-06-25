import { cp, mkdir, rm } from 'node:fs/promises';

const routeDirs = ['news', 'dashboard'];
const shellFiles = ['index.html', 'app.js', 'data.js', 'styles.css'];

await rm('dist', { force: true, recursive: true });
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });
await cp('dist/index.html', 'dist/404.html');

for (const route of routeDirs) {
  await mkdir(`dist/${route}`, { recursive: true });
  for (const file of shellFiles) {
    await cp(`src/${file}`, `dist/${route}/${file}`);
  }
  await cp('src/generated', `dist/${route}/generated`, { recursive: true });
}

console.log('Built static app into dist/ with news/dashboard route shells and 404 fallback.');
