import { profile, portfolio } from './content.js';
import { documentPage, escape, profileFacts, renderProject, themeButton } from './render.js';

const excerpts = {
  'copilot-mobile': 'Making agent sessions easier to follow, with a flatter timeline, grouped activity, and clearer ways to get started.',
  'little-proof': 'A photo-booth prototype that connects a visual language, a real camera, and the handoff to guests.',
  freeze: 'Preserving fleeting interface states before reviewing and annotating them.',
  'tide-now': 'One day of tide information, with weather as useful context rather than a dependency.',
  'digital-expanse': 'An ongoing experiment in prose, numbered plates, and a place for unfinished work.',
};

export function editorialArtwork(item) {
  const drawings = {
    'copilot-mobile': '<div class="ed-thread"><div><i></i><span>The plan</span><b></b></div><div class="ed-thread-active"><i></i><span>Grouped activity</span><b></b></div><div><i></i><span>The next step</span><b></b></div></div>',
    'little-proof': '<div class="ed-directions"><div><span>CCTV</span><i></i></div><div><span>Booth</span><i></i></div><div class="ed-direction-selected"><span>Tape</span><i></i></div></div>',
    freeze: '<div class="ed-capture"><div class="ed-capture-menu"><span>A fleeting state</span><div class="ed-capture-selection">Keep this moment.</div><i></i></div><svg viewBox="0 0 24 30" aria-hidden="true"><path d="M2 2L22 18L13 19L9 28Z"/></svg></div>',
    'tide-now': '<div class="ed-water"><svg viewBox="0 0 400 150" aria-hidden="true"><path class="ed-axis" d="M0 125H400 M187.5 15V135"/><path class="ed-curve" d="M0 105C60 105 65 30 120 30S200 120 255 120S330 35 400 35"/><circle cx="187.5" cy="75" r="4"/></svg><span>One selected day</span></div>',
    'digital-expanse': '<div class="ed-manuscript"><span>01 / A working collection</span><p>Prose, plates,<br>and what comes next.</p><i></i><i></i></div>',
  };
  const drawing = drawings[item.id];
  if (typeof drawing !== 'string') throw new Error(`Missing editorial illustration for ${item.id}`);
  return `<div class="ed-art ed-art-${item.id}" role="img" aria-label="${escape(item.name)}: concept illustration, not a product screenshot">${drawing}<span class="ed-art-note">${item.id === 'tide-now' ? 'Schematic, not live data' : 'Concept illustration'}</span></div>`;
}

function card(item) {
  return `<article class="ed-card"><a class="ed-card-link" href="projects/${item.id}/" data-theme-link aria-labelledby="ed-name-${item.id} ed-title-${item.id}">
    <div class="ed-card-meta"><span id="ed-name-${item.id}">${escape(item.name)}</span><span>${escape(item.status)}</span></div>
    ${editorialArtwork(item)}
    <h2 id="ed-title-${item.id}">${escape(item.title)}<span class="ed-arrow" aria-hidden="true">&#8599;</span></h2>
    <p>${escape(excerpts[item.id])}</p>
  </a></article>`;
}

export function renderEditorialHome({ root = '../' } = {}) {
  return documentPage({
    title: 'Ori Olson / Work & experiments',
    description: profile.bio,
    root,
    editorial: true,
    body: `<div class="ed-shell">
      <header class="ed-masthead"><a class="ed-wordmark" href="#top">${profile.name}</a><nav aria-label="Page contents"><a href="#work">Work</a><a href="#about">About</a><a href="${profile.url}">GitHub</a><a class="ed-compare" href="${root}original/" data-theme-link data-default-theme="light">Original version</a></nav>${themeButton}</header>
      <section class="ed-intro" id="about">
        <div class="ed-intro-layout">
          <div class="ed-intro-copy"><h1>Product work and<br> other experiments.</h1><p>Work on Copilot for mobile, alongside personal tools and things made out of curiosity.</p></div>
          ${profileFacts('ed-facts', { location: 'Brooklyn, NY' })}
        </div>
      </section>
      <section id="work" aria-label="Selected work"><div class="ed-lead-grid">${portfolio.slice(0, 2).map(card).join('')}</div><div class="ed-support-grid">${portfolio.slice(2).map(card).join('')}</div></section>
      <footer class="ed-footer"><p>Ori Olson / Product designer</p><a href="#top">Back to top &#8593;</a></footer>
    </div>`,
  });
}

export function renderEditorialProject(item, { assetsRoot = '../../../' } = {}) {
  return renderProject(item, { editorial: true, illustration: editorialArtwork, assetsRoot });
}
