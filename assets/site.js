const button = document.querySelector('.theme-toggle');
let theme = document.documentElement.dataset.theme;

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('a[data-theme-link]').forEach(link => {
    const url = new URL(link.href);
    if (theme === 'dark') url.searchParams.set('theme', 'dark');
    else url.searchParams.delete('theme');
    link.href = url.href;
  });
  if (button) {
    button.textContent = theme === 'light' ? 'Dark mode' : 'Light mode';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }
  const url = new URL(location.href);
  if (theme === 'dark') url.searchParams.set('theme', 'dark');
  else url.searchParams.delete('theme');
  history.replaceState(null, '', url);
}

if (button) {
  button.hidden = false;
  button.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme();
  });
}
applyTheme();
document.documentElement.dataset.ready = 'true';
