import { mkdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import { portfolio } from '../src/content.js';
import { renderHome, renderProject, renderNotFound } from '../src/render.js';
import { renderEditorialHome, renderEditorialProject } from '../src/editorial.js';
import { renderDesignWorkbench } from '../src/design-workbench.js';

const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('assets/', output), { recursive: true });
await writeFile(new URL('index.html', output), renderHome());
await mkdir(new URL('editorial/', output), { recursive: true });
await writeFile(new URL('editorial/index.html', output), renderEditorialHome());
await mkdir(new URL('editorial/design/', output), { recursive: true });
await writeFile(new URL('editorial/design/index.html', output), renderDesignWorkbench());
for (const project of portfolio) {
  const directory = new URL(`projects/${project.id}/`, output);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), renderProject(project));
  const editorialDirectory = new URL(`editorial/projects/${project.id}/`, output);
  await mkdir(editorialDirectory, { recursive: true });
  await writeFile(new URL('index.html', editorialDirectory), renderEditorialProject(project));
}
const styles = [];
for (const file of ['site.css', 'home-grid.css']) {
  styles.push(await readFile(new URL(`../assets/${file}`, import.meta.url), 'utf8'));
}
await writeFile(new URL('assets/site.css', output), styles.join('\n'));
await copyFile(new URL('../assets/site.js', import.meta.url), new URL('assets/site.js', output));
for (const file of ['editorial.css', 'inter.woff2', 'Inter-LICENSE.txt', 'design-settings.js', 'design-preview.js', 'design-preview.css', 'design-workbench.js', 'design-workbench.css']) {
  await copyFile(new URL(`../assets/${file}`, import.meta.url), new URL(`assets/${file}`, output));
}
await writeFile(new URL('404.html', output), renderNotFound());
await writeFile(new URL('.nojekyll', output), '');
console.log(`Built two directions, a design workbench, ${portfolio.length * 2} project pages, and 404 page.`);
