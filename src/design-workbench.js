import { portfolio } from './content.js';
import { escape } from './render.js';
import { controls, defaults } from '../assets/design-settings.js';

function field(control) {
  const id = `control-${control.id}`;
  if (control.type === 'boolean') {
    return `<label class="design-check" for="${id}"><span>${control.label}</span><input id="${id}" name="${control.id}" type="checkbox"${control.default ? ' checked' : ''}></label>`;
  }
  const input = control.type === 'choice'
    ? `<select id="${id}" name="${control.id}">${control.options.map(option => `<option value="${option.value}"${option.value === control.default ? ' selected' : ''}>${option.label}</option>`).join('')}</select>`
    : `<input id="${id}" name="${control.id}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${control.default}">`;
  return `<div class="design-field"><label for="${id}">${control.label}</label>${control.type === 'range' ? `<output for="${id}" data-output="${control.id}">${control.default}${control.unit}</output>` : ''}${input}</div>`;
}

export function renderDesignWorkbench() {
  return `<!doctype html>
<html lang="en" data-theme="${defaults.theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Design controls / Ori Olson</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="../../assets/site.css">
  <link rel="stylesheet" href="../../assets/design-workbench.css">
  <script type="module" src="../../assets/design-workbench.js"></script>
</head>
<body class="design-workbench">
  <header class="design-toolbar">
    <h1>Design controls</h1>
    <label class="design-page-picker">Page <select id="design-page"><option value="home" data-path="../">Landing page</option>${portfolio.map(project => `<option value="${project.id}" data-path="../projects/${project.id}/">${escape(project.name)}</option>`).join('')}</select></label>
    <label>Viewport <select id="design-viewport"><option value="fit">Fit</option><option value="desktop">Desktop / 1440</option><option value="tablet">Tablet / 768</option><option value="phone">Phone / 390</option></select></label>
    <a id="design-open" href="../?design=1" target="_blank" rel="noopener">Open preview &#8599;</a>
    <button id="design-toggle-panel" type="button" aria-expanded="true" aria-controls="design-panel">Hide controls</button>
  </header>
  <main class="design-layout">
    <section class="design-canvas" aria-label="Site preview">
      <div class="design-canvas-label"><span>Live preview</span><output id="design-width" aria-label="Preview width"></output></div>
      <div class="design-stage"><iframe id="design-frame" title="Live portfolio preview" src="../?design=1"></iframe></div>
    </section>
    <aside class="design-panel" id="design-panel" aria-label="Design adjustments">
      <p class="design-help">Preview only. Settings stay in this URL; site files are unchanged.</p>
      <p id="design-error" role="alert" hidden></p>
      <form id="design-form">
        ${['Appearance', 'Typography', 'Layout'].map(group => `<details open><summary>${group}</summary>${group === 'Layout' ? '<p class="design-help">Header spacing and profile facts affect the landing page. Type sizes adapt on smaller screens.</p>' : ''}${controls.filter(control => control.group === group).map(field).join('')}</details>`).join('')}
      </form>
      <div class="design-actions"><button type="button" id="design-reset">Reset</button><button type="button" id="design-copy">Copy settings</button></div>
      <p id="design-status" role="status" aria-live="polite"></p>
      <div id="design-copy-fallback" hidden><label for="design-settings-text">Select and copy these settings</label><textarea id="design-settings-text" readonly rows="8"></textarea></div>
    </aside>
  </main>
  <noscript><p>Interactive controls need JavaScript. <a href="../">Open the portfolio</a>.</p></noscript>
</body>
</html>`;
}
