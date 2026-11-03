import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { portfolio } from '../src/content.js';
import { controls, defaults, normalizeSettings, parseConfig, serializeConfig, configURL, styleVariables } from '../assets/design-settings.js';

const output = new URL('../dist/', import.meta.url);
const paths = ['index.html', 'original/index.html', 'editorial/index.html', 'editorial/design/index.html', ...portfolio.flatMap(project => [`projects/${project.id}/index.html`, `editorial/projects/${project.id}/index.html`, `original/projects/${project.id}/index.html`]), '404.html'];
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
const home = await readFile(new URL('original/index.html', output), 'utf8');
assert.equal((home.match(/<article>/g) || []).length, 5);
assert.ok(!home.includes('Inside the project') && !home.includes('Questions worth writing about'));
for (const project of portfolio) {
  assert.ok(home.includes(`projects/${project.id}/`));
  assert.ok(!home.includes(project.question));
  const html = await readFile(new URL(`original/projects/${project.id}/index.html`, output), 'utf8');
  assert.ok(html.includes('id="question"') && html.includes('id="inside"') && html.includes('id="sources"'));
  assert.ok(!portfolio.some(other => other.id !== project.id && html.includes(other.question)));
}
const editorial = await readFile(new URL('editorial/index.html', output), 'utf8');
const publishedHome = await readFile(new URL('index.html', output), 'utf8');
assert.equal(publishedHome.replaceAll('./assets/', '../assets/').replaceAll('href="./original/"', 'href="../original/"'), editorial, 'Published homepage matches the selected editorial design');
assert.equal((editorial.match(/class="ed-card"/g) || []).length, 5);
assert.ok(editorial.includes('data-default-theme="light"'));
assert.deepEqual(defaults, {
  theme: 'light', navigation: false, grid: true, rules: true, artwork: true, facts: true,
  headingFont: 'helvetica', bodyFont: 'helvetica', headingWeight: 500, headingSize: 56,
  headingTracking: -.052, bodySize: 16, cardTitleSize: 24, pageWidth: 1088,
  introTop: 96, introBottom: 72, cellPadding: 24,
});
assert.ok(!home.includes('data-design-preview'), 'The original direction does not inherit editorial settings');
for (const path of ['index.html', 'editorial/index.html', ...portfolio.flatMap(project => [`projects/${project.id}/index.html`, `editorial/projects/${project.id}/index.html`])]) {
  const html = await readFile(new URL(path, output), 'utf8');
  const root = html.match(/<html\b[^>]*>/)[0];
  assert.ok(root.includes('data-theme="light"'), `${path}: light theme without JavaScript`);
  for (const control of controls.filter(control => control.type === 'boolean')) {
    assert.ok(root.includes(`data-design-${control.id}="${defaults[control.id]}"`), `${path}: saved ${control.id} default`);
  }
  for (const [key, value] of Object.entries(styleVariables(defaults))) {
    assert.ok(root.includes(`${key}:${value.replaceAll('"', '&quot;')}`), `${path}: saved ${key} default`);
  }
}
assert.ok(!editorial.includes('Inside the project') && !editorial.includes('Working notes'));
assert.ok(editorial.includes('<table class="ed-facts" aria-label="Profile facts">'));
assert.ok(!editorial.includes('ed-intro-meta'), 'The editorial eyebrow is removed');
assert.ok(editorial.includes('<th scope="row">Location</th><td>Brooklyn, NY</td>'));
assert.ok(!home.includes('<th scope="row">Location</th>'), 'The original direction is unchanged');
for (const [label, value] of [['Practice', 'Product design'], ['Experience', '10+ years'], ['This page', 'A working collection']]) {
  const row = `<th scope="row">${label}</th><td>${value}</td>`;
  assert.ok(home.includes(row) && editorial.includes(row), `Missing shared profile fact: ${label}`);
}
for (const project of portfolio) {
  assert.ok(editorial.includes(`projects/${project.id}/`));
  assert.ok(!editorial.includes(project.question));
  const html = await readFile(new URL(`editorial/projects/${project.id}/index.html`, output), 'utf8');
  const publishedProject = await readFile(new URL(`projects/${project.id}/index.html`, output), 'utf8');
  assert.equal(publishedProject.replaceAll('../../assets/', '../../../assets/'), html, 'Published project matches the editorial preview');
  assert.ok(html.includes('class="editorial-page"'));
  assert.ok(html.includes('id="question"') && html.includes('id="inside"') && html.includes('id="sources"'));
  assert.ok(html.includes('href="../../#work"'));
}
assert.deepEqual(parseConfig(''), defaults);
assert.equal(serializeConfig(defaults), '');
assert.equal(normalizeSettings({}).navigation, false, 'Settings use the selected navigation default');
const helvetica = styleVariables({ headingFont: 'helvetica', bodyFont: 'helvetica' });
assert.equal(helvetica['--design-heading-font'], 'Helvetica, "Helvetica Neue", Arial, sans-serif');
assert.equal(helvetica['--design-body-font'], helvetica['--design-heading-font']);
for (const control of controls) {
  const values = control.type === 'boolean' ? [true, false] : control.type === 'choice'
    ? control.options.map(option => option.value) : [control.min, control.max, control.default];
  for (const value of values) {
    const settings = normalizeSettings({ [control.id]: value });
    assert.deepEqual(parseConfig(serializeConfig(settings)), settings);
    assert.ok(Object.values(styleVariables(settings)).every(value => typeof value === 'string'));
  }
}
for (const input of [null, [], { grid: 'false' }, { navigation: 'false' }, { headingFont: 'url(evil)' }, { headingSize: 200 }, { cellPadding: 17 }, { bodySize: NaN }, { unknown: true }, JSON.parse('{"__proto__":{}}')]) {
  assert.throws(() => normalizeSettings(input), TypeError);
}
for (const raw of ['{', 'null', '{"version":2,"settings":{}}', '{"version":1,"settings":[]}', '{"version":1,"settings":{"theme":"system"}}']) {
  assert.throws(() => parseConfig(raw));
}
const configured = configURL('https://example.test/personal-dp/editorial/?design=1#work', { grid: false });
assert.equal(configured.hash, '#work');
assert.equal(configured.searchParams.get('design'), '1');
assert.equal(parseConfig(configured.searchParams.get('config')).grid, false);
assert.equal(configURL(configured, defaults).searchParams.has('config'), false);
const workbench = await readFile(new URL('editorial/design/index.html', output), 'utf8');
for (const control of controls) assert.ok(workbench.includes(`name="${control.id}"`));
console.log(`All ${paths.length} pages and ${controls.length} design controls passed.`);
