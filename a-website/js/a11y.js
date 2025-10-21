export function initA11y() {
  const skip = document.querySelector('.skip-link');
  const hero = document.getElementById('hero');
  if (skip && hero) {
    skip.addEventListener('click', () => hero.focus({ preventScroll: true }));
  }

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Tab') {
      document.body.classList.add('show-focus');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('show-focus');
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReduced.addEventListener('change', () => {
    window.dispatchEvent(new CustomEvent('theme:refresh'));
  });
}
