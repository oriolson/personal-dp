import { profile, portfolio, sketch } from './content.js';
import { controls, defaults, styleVariables } from '../assets/design-settings.js';

export const escape = text => String(text).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export const themeButton = '<button type="button" class="theme-toggle" aria-pressed="false" hidden>Dark mode</button>';
const footer = '<footer class="prof-footer"><p>Ori Olson / Brooklyn, NY</p><a href="#top">Back to top</a></footer>';
const projectURL = (project, root = './') => `${root}projects/${project.id}/`;

export function documentPage({ title, description, body, root = './', editorial = false }) {
  const designAttributes = editorial ? [
    'data-design-preview="true"',
    ...controls.filter(control => control.type === 'boolean').map(control => `data-design-${control.id}="${defaults[control.id]}"`),
    `style="${escape(Object.entries(styleVariables(defaults)).map(([key, value]) => `${key}:${value}`).join(';'))}"`,
  ].join(' ') : '';
  return `<!doctype html>
<html lang="en" data-theme="${editorial ? defaults.theme : 'light'}"${editorial ? ` data-default-theme="${defaults.theme}" ${designAttributes}` : ''}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)}</title>
  <link rel="icon" href="data:,">
  <script>const requestedTheme = new URLSearchParams(location.search).get('theme'); document.documentElement.dataset.theme = ['light', 'dark'].includes(requestedTheme) ? requestedTheme : document.documentElement.dataset.theme;</script>
  <link rel="stylesheet" href="${root}assets/site.css">
  ${editorial ? `<link rel="stylesheet" href="${root}assets/editorial.css"><link rel="stylesheet" href="${root}assets/design-preview.css"><script type="module" src="${root}assets/design-preview.js"></script>` : ''}
  <script type="module" src="${root}assets/site.js"></script>
</head>
<body${editorial ? ' class="editorial-page"' : ''}>
  <a class="skip" href="#top">Skip to content</a>
  <main id="top" tabindex="-1">${body}</main>
</body>
</html>
`;
}

export function profileFacts(className = 'home-facts', { location } = {}) {
  return `<table class="${className}" aria-label="Profile facts"><tbody>
    <tr><th scope="row">Practice</th><td>Product design</td></tr>
    <tr><th scope="row">Experience</th><td>10+ years</td></tr>
    ${location ? `<tr><th scope="row">Location</th><td>${escape(location)}</td></tr>` : ''}
    <tr><th scope="row">This page</th><td>A working collection</td></tr>
  </tbody></table>`;
}

export function renderHome() {
  return documentPage({
    title: 'Ori Olson / Product designer',
    description: profile.bio,
    body: `<div class="prof-site prof-home-gallery">
      <header class="home-heading" id="about">
        <div><h1>${profile.name}</h1><p>Product designer at GitHub<br>Brooklyn, NY</p><p><a href="${profile.url}">@oriolson on GitHub</a></p></div>
        ${profileFacts()}
      </header>
      <div class="home-contents"><nav class="prof-nav" aria-label="Page contents"><a href="#work">Projects</a><a href="#about">About</a><a href="${profile.url}">GitHub / @oriolson</a>${themeButton}</nav></div>
      <section id="work"><div class="prof-section-heading"><h2>Work &amp; experiments</h2><p class="prof-meta">Copilot on mobile, and things made alongside it.</p></div>
        <div class="prof-picture-grid">${portfolio.map(item => `<article>
          <figure class="prof-figure"><a href="${projectURL(item)}" data-theme-link aria-label="Read the ${escape(item.name)} project">${sketch(item)}</a><figcaption>Fig. ${item.number} / ${escape(item.kind)} / ${escape(item.status)}</figcaption></figure>
          <h3><a href="${projectURL(item)}" data-theme-link>${escape(item.name)}</a></h3>
          <p>${escape(item.summary)}</p>
          <p class="prof-meta"><a href="${projectURL(item)}" data-theme-link>Read the project<span class="visually-hidden">: ${escape(item.name)}</span></a></p>
        </article>`).join('')}</div>
      </section>
      ${footer}
    </div>`,
  });
}

export function renderProject(item, { editorial = false, illustration = sketch } = {}) {
  const root = '../../';
  return documentPage({
    title: `${item.name} / Ori Olson`,
    description: item.summary,
    root: editorial ? '../../../' : root,
    editorial,
    body: `<div class="prof-site prof-project">
      <nav class="prof-nav project-breadcrumb" aria-label="Project navigation"><a href="${root}#work" data-theme-link>All projects</a><a href="${profile.url}">Ori Olson / GitHub</a>${themeButton}</nav>
      <header class="project-intro"><p class="prof-meta">${escape(item.kind)} / ${escape(item.status)}</p><h1>${escape(item.name)}</h1><p class="project-deck">${escape(item.title)}</p><p>${escape(item.summary)}</p></header>
      <figure class="prof-figure project-hero">${illustration(item)}<figcaption>Explanatory process sketch, not a product screenshot.</figcaption></figure>
      <article class="project-reading" aria-label="Project story">
        <section id="question"><h2>The question</h2><p class="project-question">${escape(item.question)}</p></section>
        <section id="inside"><h2>Inside the project</h2><h3>The context</h3><p>${escape(item.context)}</p><h3>Recorded choices</h3><ul>${item.decisions.map(decision => `<li>${escape(decision)}</li>`).join('')}</ul></section>
        <section id="notes"><h2>Working notes</h2><p>${escape(item.angle)}</p><p class="prof-meta">A proposed case-study direction, not a claim about a shipped outcome.</p></section>
        <section id="sources"><h2>Sources &amp; status</h2><p>${escape(item.source)}</p>${item.url ? `<p><a href="${escape(item.url)}">Read the public source</a></p>` : '<p class="prof-meta">Public release or repository availability is not verified.</p>'}<p class="prof-meta">Project stories are in progress. Shipped scope, individual contributions, and outcomes are not yet documented here.</p></section>
      </article>
      <nav class="project-more" aria-label="Other projects"><h2>More projects</h2><ul>${portfolio.filter(project => project.id !== item.id).map(project => `<li><a href="${projectURL(project, root)}" data-theme-link>${escape(project.name)}</a></li>`).join('')}</ul><a href="${root}#work" data-theme-link>Back to all projects</a></nav>
      ${footer}
    </div>`,
  });
}

export function renderNotFound() {
  return documentPage({
    title: 'Page not found / Ori Olson',
    description: 'This page does not exist.',
    root: '/personal-dp/',
    body: '<div class="prof-site not-found"><h1>Page not found</h1><p>The page may have moved, or the address may be incorrect.</p><p><a href="/personal-dp/" data-theme-link>Return to all projects</a></p></div>',
  });
}
