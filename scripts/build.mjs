import { cp, mkdir, rm } from 'node:fs/promises';

const routeDirs = ['voice-reception', 'admin'];
const shellFiles = ['index.html', 'app.js', 'voice-reception.js', 'styles.css'];

await rm('dist', { force: true, recursive: true });
await mkdir('dist', { recursive: true });

for (const file of shellFiles) {
  await cp(`src/${file}`, `dist/${file}`);
}
await cp('dist/index.html', 'dist/404.html');

for (const route of routeDirs) {
  await mkdir(`dist/${route}`, { recursive: true });
  for (const file of shellFiles) {
    await cp(`src/${file}`, `dist/${route}/${file}`);
  }
}

console.log('Built restaurant AI reception app into dist/ with voice-reception/admin route shells.');
