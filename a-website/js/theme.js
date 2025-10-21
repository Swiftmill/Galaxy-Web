const STORAGE_KEY = 'a-website-theme';

const defaults = {
  accentHue: 265,
  glow: 0.45,
  blur: 14,
  radius: 18,
  stars: 1,
};

function applyTheme(values) {
  const root = document.documentElement;
  const accent = `hsl(${values.accentHue}, 88%, 65%)`;
  const accent2 = `hsl(${(values.accentHue + 90) % 360}, 82%, 60%)`;
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent2', accent2);
  root.style.setProperty('--glow', `hsla(${values.accentHue}, 95%, 70%, ${values.glow})`);
  root.style.setProperty('--blur', `${values.blur}px`);
  root.style.setProperty('--radius', `${values.radius}px`);
  root.style.setProperty('--panel', `rgba(18, 20, 45, ${0.3 + values.glow * 0.6})`);
  root.style.setProperty('--panel-strong', `rgba(18, 20, 45, ${0.5 + values.glow * 0.5})`);
}

function loadTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...(saved || {}) };
  } catch (error) {
    console.warn('Theme load failed', error);
    return { ...defaults };
  }
}

function persistTheme(values) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch (error) {
    console.warn('Theme save failed', error);
  }
}

export function initTheme(state, ui) {
  const settings = ui.settings;
  const form = settings.querySelector('form');
  const values = loadTheme();
  applyTheme(values);

  Array.from(form.elements).forEach((input) => {
    if (input.name && values[input.name] !== undefined) {
      input.value = values[input.name];
    }
  });

  form.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const name = target.name;
    const value = Number(target.value);
    values[name] = value;
    applyTheme(values);
    persistTheme(values);
    if (name === 'stars') {
      window.dispatchEvent(new CustomEvent('theme:stars-density', { detail: value }));
    }
  });

  window.addEventListener('theme:refresh', () => applyTheme(values));

  state.theme = values;
}
