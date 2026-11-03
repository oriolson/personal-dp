const button = document.querySelector('.theme-toggle');
let theme = document.documentElement.dataset.theme;
const defaultTheme = document.documentElement.dataset.defaultTheme || 'light';

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('a[data-theme-link]').forEach(link => {
    const url = new URL(link.href);
    if (theme !== (link.dataset.defaultTheme || defaultTheme)) url.searchParams.set('theme', theme);
    else url.searchParams.delete('theme');
    link.href = url.href;
  });
  if (button) {
    button.textContent = theme === 'light' ? 'Dark mode' : 'Light mode';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }
  const url = new URL(location.href);
  if (theme !== defaultTheme) url.searchParams.set('theme', theme);
  else url.searchParams.delete('theme');
  history.replaceState(null, '', url);
}

export function setTheme(nextTheme) {
  if (!['light', 'dark'].includes(nextTheme)) throw new TypeError('Unknown theme.');
  theme = nextTheme;
  applyTheme();
  document.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme } }));
}

if (button) {
  button.hidden = false;
  button.addEventListener('click', () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  });
}
applyTheme();
document.documentElement.dataset.ready = 'true';
