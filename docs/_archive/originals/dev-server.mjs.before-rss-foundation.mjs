import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const useDist = process.argv.includes('--dist');
const root = useDist ? 'dist' : 'src';
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function safePath(urlPath) {
  const normalized = normalize(urlPath).replace(/^\.\.(\/|\\|$)/, '');
  return join(root, normalized);
}

async function serveFile(pathname) {
  const filePath = pathname === '/' || pathname.startsWith('/news/')
    ? join(root, 'index.html')
    : safePath(pathname.slice(1));
  const body = await readFile(filePath);
  const type = contentTypes[extname(filePath)] || 'application/octet-stream';
  return { body, type };
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const { body, type } = await serveFile(url.pathname);
    response.writeHead(200, { 'Content-Type': type });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`AGATHON News Digest running at http://localhost:${port}`);
});
