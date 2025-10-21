import { applyParallaxEffect } from './parallax.js';

function smoothScrollBy(delta) {
  window.scrollBy({ top: delta, behavior: 'smooth' });
}

function focusTrap(container) {
  const selectors = 'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(container.querySelectorAll(selectors));
  if (!focusable.length) return () => {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  function handle(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
  container.addEventListener('keydown', handle);
  return () => container.removeEventListener('keydown', handle);
}

function createProjectContent(id) {
  const content = {
    pulse: {
      title: 'Pulse Observatory',
      copy: 'Real-time aurora monitor blending photon trails with AI-assisted insights.',
    },
    lumen: {
      title: 'Lumen Trails',
      copy: 'Immersive trek planner mapping luminosity gradients across deep caves.',
    },
    atlas: {
      title: 'Atlas Drive',
      copy: 'Offline-first logistics cockpit with adaptive nebula visualisation.',
    },
    nexus: {
      title: 'Nexus Halo',
      copy: 'Spatial collaboration hub stitched together by holographic anchors.',
    },
  };
  return content[id] || content.pulse;
}

export function initUI(router, state) {
  const modal = document.getElementById('modal');
  const modalBody = modal.querySelector('.modal__body');
  const toast = document.getElementById('toast');
  const settings = document.getElementById('settings-panel');
  const toggle = document.querySelector('.settings-toggle');
  const closeSettings = settings.querySelector('.settings__close');
  const overlay = modal.querySelector('.modal__backdrop');
  const closeModal = modal.querySelector('.modal__close');
  const hero = document.querySelector('.hero__overlay');

  applyParallaxEffect(hero, 0.1);

  let releaseTrap = () => {};

  function openModal(content) {
    modal.setAttribute('aria-hidden', 'false');
    modalBody.innerHTML = content;
    releaseTrap = focusTrap(modal);
    modalBody.focus({ preventScroll: true });
  }

  function hideModal() {
    modal.setAttribute('aria-hidden', 'true');
    modalBody.innerHTML = '';
    releaseTrap();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2200);
  }

  function toggleSettings(force) {
    const isHidden = settings.getAttribute('aria-hidden') === 'true';
    let open = !isHidden;
    if (typeof force === 'boolean') {
      open = force;
    } else {
      open = isHidden;
    }
    settings.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      settings.querySelector('input').focus();
    }
  }

  toggle.addEventListener('click', () => toggleSettings());
  closeSettings.addEventListener('click', () => settings.setAttribute('aria-hidden', 'true'));

  overlay.addEventListener('click', hideModal);
  closeModal.addEventListener('click', hideModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideModal();
      settings.setAttribute('aria-hidden', 'true');
    }
    if (event.key === 'ArrowDown') {
      smoothScrollBy(window.innerHeight * 0.8);
    }
    if (event.key === 'ArrowUp') {
      smoothScrollBy(-window.innerHeight * 0.8);
    }
    if (event.key.toLowerCase() === 'g') {
      router.goTo(0);
    }
    if (event.key.toLowerCase() === 's') {
      toggleSettings(true);
    }
  });

  document.querySelectorAll('.project-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const data = createProjectContent(tile.dataset.project);
      openModal(`<h3>${data.title}</h3><p>${data.copy}</p>`);
    });
  });

  document.querySelectorAll('.card').forEach((card) => {
    applyParallaxEffect(card, 0.05);
  });

  window.addEventListener('toast', (event) => {
    if (event.detail) {
      showToast(event.detail);
    }
  });

  return {
    toast: showToast,
    toggleSettings,
    closeModal: hideModal,
    isModalOpen: () => modal.getAttribute('aria-hidden') === 'false',
    settings,
  };
}
