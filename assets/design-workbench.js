import { controls, defaults, normalizeSettings, parseConfig, configURL } from './design-settings.js';

const frame = document.querySelector('#design-frame');
const form = document.querySelector('#design-form');
const pagePicker = document.querySelector('#design-page');
const viewportPicker = document.querySelector('#design-viewport');
const panel = document.querySelector('#design-panel');
const errorBox = document.querySelector('#design-error');
const status = document.querySelector('#design-status');
const openLink = document.querySelector('#design-open');
const widths = { fit: 'calc(100% - 2px)', desktop: '1440px', tablet: '768px', phone: '390px' };
const pages = new Map([...pagePicker.options].map(option => [option.value, new URL(option.dataset.path, location.href)]));
const params = new URLSearchParams(location.search);
let settings = { ...defaults };
let page = 'home';
let viewport = 'fit';
let currentURL = pages.get(page);
let pendingPagePath;
let loadTimeout;

function showError(message, kind = 'settings') {
  errorBox.hidden = false;
  errorBox.textContent = message;
  errorBox.dataset.kind = kind;
}
try {
  settings = parseConfig(params.get('config'));
  if (params.has('page') && !pages.has(params.get('page'))) throw new TypeError('Unknown preview page.');
  if (params.has('viewport') && !Object.hasOwn(widths, params.get('viewport'))) throw new TypeError('Unknown viewport.');
  page = params.get('page') || 'home';
  viewport = params.get('viewport') || 'fit';
} catch (error) {
  if (!(error instanceof SyntaxError || error instanceof TypeError)) throw error;
  showError(`${error.message} Use the controls or Reset to replace the invalid setting.`);
}

function previewURL(input = currentURL) {
  const url = configURL(input, settings);
  url.searchParams.set('design', '1');
  if (settings.theme !== defaults.theme) url.searchParams.set('theme', settings.theme);
  else url.searchParams.delete('theme');
  return url;
}
function updateURL() {
  const url = configURL(location.href, settings);
  if (page === 'home') url.searchParams.delete('page');
  else url.searchParams.set('page', page);
  if (viewport === 'fit') url.searchParams.delete('viewport');
  else url.searchParams.set('viewport', viewport);
  history.replaceState(null, '', url);
  openLink.href = previewURL().href;
}
function reflectControls() {
  for (const control of controls) {
    const input = form.elements.namedItem(control.id);
    if (control.type === 'boolean') input.checked = settings[control.id];
    else input.value = settings[control.id];
    if (control.type === 'range') {
      const text = `${settings[control.id]}${control.unit}`;
      document.querySelector(`[data-output="${control.id}"]`).textContent = text;
      input.setAttribute('aria-valuetext', text);
    }
  }
  document.documentElement.dataset.theme = settings.theme;
}
function sendSettings() {
  frame.contentWindow.postMessage({ type: 'design:apply', settings }, location.origin);
}
function showPage() {
  currentURL = pages.get(page);
  pendingPagePath = currentURL.pathname;
  document.documentElement.dataset.previewReady = 'false';
  frame.setAttribute('aria-busy', 'true');
  status.textContent = 'Loading preview...';
  clearTimeout(loadTimeout);
  loadTimeout = setTimeout(() => {
    showError('The preview has not responded. Check the preview server, then choose a page again or reload.', 'loading');
  }, 10000);
  pagePicker.value = page;
  frame.src = previewURL(currentURL).href;
  updateURL();
}
function applyViewport() {
  viewportPicker.value = viewport;
  frame.style.setProperty('--preview-width', widths[viewport]);
  updateURL();
}
function clearError() { errorBox.hidden = true; errorBox.textContent = ''; delete errorBox.dataset.kind; }

form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('input', event => {
  const control = controls.find(item => item.id === event.target.name);
  if (!control) return;
  const value = control.type === 'boolean' ? event.target.checked
    : typeof control.default === 'number' ? Number(event.target.value) : event.target.value;
  settings = normalizeSettings({ ...settings, [control.id]: value });
  clearError();
  reflectControls();
  updateURL();
  sendSettings();
  if (status.textContent !== 'Settings are saved in this URL.') status.textContent = 'Settings are saved in this URL.';
});
pagePicker.addEventListener('change', () => { page = pagePicker.value; clearError(); showPage(); });
viewportPicker.addEventListener('change', () => { viewport = viewportPicker.value; clearError(); applyViewport(); });
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow || !['design:ready', 'design:applied', 'design:theme'].includes(event.data?.type)) return;
  if (typeof event.data.url !== 'string' || !URL.canParse(event.data.url)) return;
  const url = new URL(event.data.url);
  if (url.origin !== location.origin) return;
  const match = [...pages].find(([, candidate]) => candidate.pathname === url.pathname.replace(/index\.html$/, ''));
  if (!match) return;
  if (pendingPagePath && pendingPagePath !== url.pathname.replace(/index\.html$/, '')) return;
  try {
    const received = normalizeSettings(event.data.settings);
    page = match[0];
    pagePicker.value = page;
    currentURL = url;
    pendingPagePath = undefined;
    if (event.data.type === 'design:ready') {
      clearTimeout(loadTimeout);
      if (errorBox.dataset.kind === 'loading') clearError();
      sendSettings();
      frame.removeAttribute('aria-busy');
      status.textContent = 'Preview ready.';
    }
    else if (event.data.type === 'design:theme') {
      settings = { ...settings, theme: received.theme };
      reflectControls();
      sendSettings();
    }
    updateURL();
    document.documentElement.dataset.previewReady = 'true';
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    showError(error.message);
  }
});
new ResizeObserver(() => {
  document.querySelector('#design-width').textContent = `${frame.clientWidth}px`;
}).observe(frame);
document.querySelector('#design-toggle-panel').addEventListener('click', event => {
  panel.hidden = !panel.hidden;
  document.body.toggleAttribute('data-panel-hidden', panel.hidden);
  event.currentTarget.textContent = panel.hidden ? 'Show controls' : 'Hide controls';
  event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
});
document.querySelector('#design-reset').addEventListener('click', () => {
  settings = { ...defaults };
  viewport = 'fit';
  clearError();
  document.querySelector('#design-copy-fallback').hidden = true;
  reflectControls();
  applyViewport();
  sendSettings();
  status.textContent = 'Default design restored.';
});
document.querySelector('#design-copy').addEventListener('click', async () => {
  const text = JSON.stringify({ version: 1, settings, viewport, page }, null, 2);
  const fallback = () => {
    document.querySelector('#design-copy-fallback').hidden = false;
    const textarea = document.querySelector('#design-settings-text');
    textarea.value = text;
    textarea.focus();
    textarea.select();
    status.textContent = 'Clipboard unavailable. Select and copy the settings below.';
  };
  if (!navigator.clipboard?.writeText) return fallback();
  try {
    await navigator.clipboard.writeText(text);
    document.querySelector('#design-copy-fallback').hidden = true;
    status.textContent = 'Settings copied.';
  } catch (error) {
    if (!(error instanceof DOMException) || !['NotAllowedError', 'SecurityError'].includes(error.name)) throw error;
    fallback();
  }
});
reflectControls();
showPage();
applyViewport();
document.documentElement.dataset.ready = 'true';
