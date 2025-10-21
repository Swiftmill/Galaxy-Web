const routes = {
  hero: document.getElementById('hero'),
  home: document.getElementById('hero'),
  about: document.getElementById('about'),
  skills: document.getElementById('skills'),
  projects: document.getElementById('projects'),
  contact: document.getElementById('contact'),
};

const order = ['home', 'about', 'skills', 'projects', 'contact'];

function scrollToRoute(id) {
  const element = routes[id];
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setActiveLink(hash) {
  const active = hash.replace('#/', '') || 'home';
  document
    .querySelectorAll('[data-route]')
    .forEach((el) => el.classList.toggle('active', el.getAttribute('data-route') === active));
}

export function initRouter() {
  function handleHashChange() {
    const hash = window.location.hash || '#/home';
    setActiveLink(hash);
    const id = hash.replace('#/', '');
    if (id === 'home') {
      scrollToRoute('hero');
    } else {
      scrollToRoute(id);
    }
  }

  window.addEventListener('hashchange', handleHashChange);
  requestAnimationFrame(handleHashChange);

  return {
    goTo(index) {
      const key = order[index] || 'home';
      window.location.hash = `#/${key}`;
    },
    current() {
      return (window.location.hash.replace('#/', '') || 'home').split('?')[0];
    },
  };
}
