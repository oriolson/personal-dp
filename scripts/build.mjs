import { mkdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import { portfolio } from '../src/content.js';
import { renderHome, renderProject, renderNotFound } from '../src/render.js';

const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('assets/', output), { recursive: true });
await writeFile(new URL('index.html', output), renderHome());
for (const project of portfolio) {
  const directory = new URL(`projects/${project.id}/`, output);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), renderProject(project));
}
const styles = [];
for (const file of ['site.css', 'home-grid.css']) {
  styles.push(await readFile(new URL(`../assets/${file}`, import.meta.url), 'utf8'));
}
await writeFile(new URL('assets/site.css', output), styles.join('\n'));
await copyFile(new URL('../assets/site.js', import.meta.url), new URL('assets/site.js', output));
await writeFile(new URL('404.html', output), renderNotFound());
await writeFile(new URL('.nojekyll', output), '');
console.log(`Built home, ${portfolio.length} project pages, and 404 page.`);
