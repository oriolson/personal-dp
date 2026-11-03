const fonts = [
  { value: 'inter', label: 'Inter' },
  { value: 'system', label: 'System sans' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'serif', label: 'Times serif' },
];

export const controls = [
  { id: 'theme', group: 'Appearance', label: 'Theme', type: 'choice', default: 'light', options: [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }] },
  { id: 'navigation', group: 'Appearance', label: 'Top navigation', type: 'boolean', default: false },
  { id: 'grid', group: 'Appearance', label: 'Grid guides', type: 'boolean', default: false },
  { id: 'rules', group: 'Appearance', label: 'Section rules', type: 'boolean', default: true },
  { id: 'artwork', group: 'Appearance', label: 'Project illustrations', type: 'boolean', default: true },
  { id: 'facts', group: 'Appearance', label: 'Profile facts', type: 'boolean', default: true },
  { id: 'headingFont', group: 'Typography', label: 'Heading typeface', type: 'choice', default: 'helvetica', options: fonts },
  { id: 'bodyFont', group: 'Typography', label: 'Body typeface', type: 'choice', default: 'helvetica', options: fonts },
  { id: 'headingWeight', group: 'Typography', label: 'Heading weight', type: 'choice', default: 500, options: [{ value: 400, label: 'Regular / 400' }, { value: 500, label: 'Medium / 500' }, { value: 600, label: 'Semibold / 600' }] },
  { id: 'headingSize', group: 'Typography', label: 'Headline size', type: 'range', default: 56, min: 40, max: 72, step: 2, unit: 'px' },
  { id: 'headingTracking', group: 'Typography', label: 'Headline letter spacing', type: 'range', default: -.052, min: -.08, max: 0, step: .002, unit: 'em' },
  { id: 'bodySize', group: 'Typography', label: 'Body size', type: 'range', default: 16, min: 14, max: 20, step: 1, unit: 'px' },
  { id: 'cardTitleSize', group: 'Typography', label: 'Project title size', type: 'range', default: 24, min: 20, max: 32, step: 1, unit: 'px' },
  { id: 'pageWidth', group: 'Layout', label: 'Maximum page width', type: 'range', default: 1088, min: 880, max: 1440, step: 16, unit: 'px' },
  { id: 'introTop', group: 'Layout', label: 'Header space above', type: 'range', default: 96, min: 32, max: 144, step: 8, unit: 'px' },
  { id: 'introBottom', group: 'Layout', label: 'Header space below', type: 'range', default: 72, min: 24, max: 112, step: 8, unit: 'px' },
  { id: 'cellPadding', group: 'Layout', label: 'Cell padding', type: 'range', default: 24, min: 16, max: 40, step: 4, unit: 'px' },
];

export const defaults = Object.freeze(Object.fromEntries(controls.map(control => [control.id, control.default])));
const definitions = new Map(controls.map(control => [control.id, control]));

export function normalizeSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Settings must be an object.');
  const result = { ...defaults };
  for (const [key, value] of Object.entries(input)) {
    const control = definitions.get(key);
    if (!control) throw new TypeError(`Unknown design control: ${key}`);
    const valid = control.type === 'boolean' ? typeof value === 'boolean'
      : control.type === 'choice' ? control.options.some(option => option.value === value)
      : typeof value === 'number' && Number.isFinite(value) && value >= control.min && value <= control.max
        && Math.abs((value - control.min) / control.step - Math.round((value - control.min) / control.step)) < 0.000001;
    if (!valid) throw new TypeError(`Invalid value for ${control.label}.`);
    result[key] = value;
  }
  return result;
}

export function parseConfig(raw) {
  if (!raw) return { ...defaults };
  if (raw.length > 10000) throw new TypeError('Design settings are too long.');
  const config = JSON.parse(raw);
  if (!config || config.version !== 1 || Object.keys(config).some(key => !['version', 'settings'].includes(key))) {
    throw new TypeError('Unsupported design settings format.');
  }
  return normalizeSettings(config.settings);
}

export function serializeConfig(input) {
  const settings = normalizeSettings(input);
  const changes = Object.fromEntries(Object.entries(settings).filter(([key, value]) => value !== defaults[key]));
  return Object.keys(changes).length ? JSON.stringify({ version: 1, settings: changes }) : '';
}

export function configURL(inputURL, settings) {
  const url = new URL(inputURL);
  const config = serializeConfig(settings);
  if (config) url.searchParams.set('config', config);
  else url.searchParams.delete('config');
  return url;
}

export function styleVariables(input) {
  const settings = normalizeSettings(input);
  const stacks = {
    inter: '"Portfolio Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    helvetica: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
    serif: '"Times New Roman", Times, serif',
  };
  return {
    '--design-heading-font': stacks[settings.headingFont],
    '--design-body-font': stacks[settings.bodyFont],
    '--design-heading-weight': String(settings.headingWeight),
    '--design-heading-size': `${settings.headingSize}px`,
    '--design-heading-scale': String(settings.headingSize / 56),
    '--design-heading-tracking': `${settings.headingTracking}em`,
    '--design-body-size': `${settings.bodySize}px`,
    '--design-card-title-size': `${settings.cardTitleSize}px`,
    '--design-page-width': `${settings.pageWidth}px`,
    '--design-intro-top': `${settings.introTop}px`,
    '--design-intro-bottom': `${settings.introBottom}px`,
    '--design-cell-padding': `${settings.cellPadding}px`,
    '--design-mobile-padding': `${Math.max(12, settings.cellPadding - 8)}px`,
  };
}
