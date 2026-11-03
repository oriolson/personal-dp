import { setTheme } from './site.js';
import { defaults, normalizeSettings, parseConfig, configURL, styleVariables } from './design-settings.js';

const params = new URLSearchParams(location.search);
const workbenchURL = new URL('../editorial/design/', import.meta.url);
const editorialPath = new URL('../editorial/', import.meta.url).pathname;
const sitePath = new URL('../', import.meta.url).pathname;
const currentRoot = location.pathname.startsWith(editorialPath) ? editorialPath : sitePath;
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const projectMatch = location.pathname.slice(currentRoot.length).match(/^projects\/([^/]+)\//);
if (projectMatch) workbenchURL.searchParams.set('page', projectMatch[1]);

function launcher(url, label) {
  const link = document.createElement('a');
  link.className = 'design-launcher';
  link.href = url.href;
  link.textContent = label;
  document.body.append(link);
  return link;
}

if (params.get('design') !== '1') {
  if (isLocal && parent === window) {
    const url = () => configURL(workbenchURL, { ...defaults, theme: document.documentElement.dataset.theme });
    const link = launcher(url(), 'Design controls');
    document.addEventListener('portfolio-theme-change', () => { link.href = url().href; });
  }
} else {
  let settings = { ...defaults };
  let applying = false;
  let errorBanner;
  const showError = message => {
    if (!errorBanner) {
      errorBanner = document.createElement('p');
      errorBanner.className = 'design-preview-error';
      errorBanner.setAttribute('role', 'alert');
      document.body.prepend(errorBanner);
    }
    errorBanner.textContent = message;
  };
  const notify = type => {
    if (parent !== window) parent.postMessage({ type, settings, url: location.href }, location.origin);
  };
  function updateLinksAndURL() {
    const current = configURL(location.href, settings);
    current.searchParams.set('design', '1');
    history.replaceState(null, '', current);
    document.querySelectorAll('a').forEach(link => {
      if (link.classList.contains('design-launcher')) return;
      const path = link.pathname.slice(sitePath.length);
      if (link.origin === location.origin && link.pathname.startsWith(sitePath)
        && (path === '' || path === 'index.html' || path.startsWith('projects/') || path.startsWith('editorial/'))) {
        const url = configURL(link.href, settings);
        url.searchParams.set('design', '1');
        if (settings.theme !== defaults.theme) url.searchParams.set('theme', settings.theme);
        else url.searchParams.delete('theme');
        link.href = url.href;
      } else {
        link.target = '_blank';
        link.rel = 'noopener';
      }
    });
    const returnLink = document.querySelector('.design-launcher');
    if (returnLink) returnLink.href = configURL(workbenchURL, settings).href;
  }
  function apply(input) {
    settings = normalizeSettings(input);
    applying = true;
    setTheme(settings.theme);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(styleVariables(settings))) root.style.setProperty(key, value);
    root.dataset.designPreview = 'true';
    for (const key of ['navigation', 'grid', 'rules', 'artwork', 'facts']) {
      root.setAttribute(`data-design-${key}`, String(settings[key]));
    }
    updateLinksAndURL();
    root.dataset.designReady = 'true';
    applying = false;
  }
  try {
    settings = parseConfig(params.get('config'));
    if (!params.has('config') && ['dark', 'light'].includes(params.get('theme'))) settings.theme = params.get('theme');
  } catch (error) {
    if (!(error instanceof SyntaxError || error instanceof TypeError)) throw error;
    showError(`Could not load preview settings: ${error.message} Defaults are shown.`);
  }
  apply(settings);
  if (parent === window) launcher(configURL(workbenchURL, settings), 'Back to controls');
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent || parent === window || event.data?.type !== 'design:apply') return;
    try {
      apply(event.data.settings);
      errorBanner?.remove();
      errorBanner = undefined;
      notify('design:applied');
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      showError(error.message);
    }
  });
  document.addEventListener('portfolio-theme-change', event => {
    if (applying) return;
    settings = { ...settings, theme: event.detail.theme };
    updateLinksAndURL();
    notify('design:theme');
  });
  notify('design:ready');
}
