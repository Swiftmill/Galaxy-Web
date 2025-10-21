function createObserver(state) {
  const prefersReduced = state.reducedMotion;
  if (prefersReduced) {
    document.querySelectorAll('.reveal-in').forEach((el) => el.classList.add('is-visible'));
    return { disconnect() {} };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.reveal-in').forEach((el) => observer.observe(el));
  return observer;
}

export function initReveal(state) {
  const observer = createObserver(state);
  window.addEventListener('beforeunload', () => observer.disconnect());
}
