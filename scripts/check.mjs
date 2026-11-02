import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { portfolio } from '../src/content.js';

const output = new URL('../dist/', import.meta.url);
const paths = ['index.html', ...portfolio.map(project => `projects/${project.id}/index.html`), '404.html'];
for (const path of paths) {
  const file = new URL(path, output);
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(!/localhost|127\.0\.0\.1|\/Users\/|\.copilot\/|SITE-CONTENT|PROJECT-CONTENT|view\.html/.test(html));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${path}: duplicate IDs`);
  for (const [, attribute] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|data:)/.test(attribute)) continue;
    const href = attribute.replaceAll('&amp;', '&').replace(/^\/personal-dp\//, output.href);
    const target = new URL(href, file);
    assert.ok(target.href.startsWith(output.href), `${path}: link escapes site: ${attribute}`);
    const hash = target.hash.slice(1);
    target.hash = '';
    target.search = '';
    if (target.pathname.endsWith('/')) target.pathname += 'index.html';
    assert.ok((await stat(target)).isFile(), `${path}: missing ${attribute}`);
    if (hash) assert.ok((await readFile(target, 'utf8')).includes(`id="${hash}"`), `${path}: missing anchor ${attribute}`);
  }
}
const home = await readFile(new URL('index.html', output), 'utf8');
assert.equal((home.match(/<article>/g) || []).length, 5);
assert.ok(!home.includes('Inside the project') && !home.includes('Questions worth writing about'));
for (const project of portfolio) {
  assert.ok(home.includes(`projects/${project.id}/`));
  assert.ok(!home.includes(project.question));
  const html = await readFile(new URL(`projects/${project.id}/index.html`, output), 'utf8');
  assert.ok(html.includes('id="question"') && html.includes('id="inside"') && html.includes('id="sources"'));
  assert.ok(!portfolio.some(other => other.id !== project.id && html.includes(other.question)));
}
console.log('All 7 pages have valid local links, assets, landmarks, and project boundaries.');
