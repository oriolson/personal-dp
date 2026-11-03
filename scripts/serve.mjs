import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { portfolio } from '../src/content.js';

const prefix = '/personal-dp/';
const output = new URL('../dist/', import.meta.url);
const files = new Map([
  ['', 'index.html'], ['index.html', 'index.html'], ['404.html', '404.html'],
  ['assets/site.css', 'assets/site.css'], ['assets/site.js', 'assets/site.js'],
  ['editorial/', 'editorial/index.html'], ['editorial/index.html', 'editorial/index.html'],
  ['editorial/design/', 'editorial/design/index.html'], ['editorial/design/index.html', 'editorial/design/index.html'],
  ...['editorial.css', 'inter.woff2', 'Inter-LICENSE.txt', 'design-settings.js', 'design-preview.js', 'design-preview.css', 'design-workbench.js', 'design-workbench.css'].map(file => [`assets/${file}`, `assets/${file}`]),
  ...portfolio.flatMap(project => [
    [`projects/${project.id}/`, `projects/${project.id}/index.html`],
    [`projects/${project.id}/index.html`, `projects/${project.id}/index.html`],
    [`editorial/projects/${project.id}/`, `editorial/projects/${project.id}/index.html`],
    [`editorial/projects/${project.id}/index.html`, `editorial/projects/${project.id}/index.html`],
  ]),
]);
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/' || url.pathname === prefix.slice(0, -1)) {
    response.writeHead(302, { Location: prefix + url.search });
    response.end();
    return;
  }
  const file = url.pathname.startsWith(prefix) ? files.get(url.pathname.slice(prefix.length)) : undefined;
  try {
    const content = await readFile(new URL(file || '404.html', output));
    const type = file?.endsWith('.woff2') ? 'font/woff2' : file?.endsWith('.txt') ? 'text/plain' : file?.endsWith('.css') ? 'text/css' : file?.endsWith('.js') ? 'text/javascript' : 'text/html';
    response.writeHead(file ? 200 : 404, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(content);
  } catch (error) {
    console.error('Unable to serve built site:', error);
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end('Unable to read the built site. Run npm run build first.');
  }
});
server.listen(Number(process.env.PORT ?? 0), '127.0.0.1', () => {
  console.log(`Preview: http://127.0.0.1:${server.address().port}${prefix}`);
});
