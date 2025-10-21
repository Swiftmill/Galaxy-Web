import { initRouter } from './router.js';
import { initUI } from './ui.js';
import { initTheme } from './theme.js';
import { initA11y } from './a11y.js';
import { initReveal } from './reveal.js';
import { initParallax } from './parallax.js';
import { initConstellations } from './constellations.js';
import { injectSVGIcons, renderProjectSVG } from './svgicons.js';
import { initOGGenerator } from './ogimage.js';
import { bootstrapScene } from './gl/scene.js';

const state = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  webglReady: false,
  quality: 1,
  isTouch: 'ontouchstart' in window,
};

function initYear() {
  const el = document.getElementById('year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

function initHeroTitle() {
  const spans = document.querySelectorAll('.hero__title span');
  spans.forEach((span, index) => {
    const delay = state.reducedMotion ? 0 : index * 80;
    setTimeout(() => {
      span.classList.add('visible');
    }, delay);
  });
}

function initHeroCTA() {
  const buttons = document.querySelectorAll('[data-scroll-target]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-scroll-target');
      if (target) {
        window.location.hash = target.replace('/#', '#');
      }
    });
  });
}

function initQualityScaling() {
  const prefered = window.devicePixelRatio > 1.5 ? 0.85 : 1;
  state.quality = state.reducedMotion ? 0.4 : prefered;
}

function initFallbackMessage(scene, reduced) {
  if (!scene) {
    const canvas = document.getElementById('fallback-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const randomStars = (w, h) =>
      Array.from({ length: 600 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * w,
      }));

    let stars = randomStars(canvas.width, canvas.height);

    window.addEventListener('resize', () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      stars = randomStars(canvas.width, canvas.height);
    });

    function renderFallback() {
      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(139,92,246,0.75)';
      stars.forEach((star) => {
        star.z -= 0.7;
        if (star.z <= 0) {
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.z = width;
        }
        const k = 128 / star.z;
        const px = (star.x - width / 2) * k + width / 2;
        const py = (star.y - height / 2) * k + height / 2;
        const size = Math.max(0.5, (1 - star.z / width) * 2.2);
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = 'rgba(34,211,238,0.8)';
      ctx.font = '20px system-ui';
      ctx.fillText('Galactic view in fallback mode', 32, height - 32);
      if (!reduced) {
        requestAnimationFrame(renderFallback);
      }
    }

    renderFallback();
  }
}

async function init() {
  initYear();
  initHeroTitle();
  initHeroCTA();
  initQualityScaling();
  injectSVGIcons();
  document.querySelectorAll('.project-thumb').forEach((svg) => renderProjectSVG(svg));
  initA11y();
  const router = initRouter();
  const ui = initUI(router, state);
  initTheme(state, ui);
  initReveal(state);
  initParallax(state);
  initConstellations(state);
  initOGGenerator();

  if (!state.reducedMotion) {
    try {
      const scene = await bootstrapScene(state);
      state.webglReady = !!scene;
      initFallbackMessage(scene, state.reducedMotion);
    } catch (err) {
      console.warn('Galaxy fallback', err);
      initFallbackMessage(null, state.reducedMotion);
    }
  } else {
    initFallbackMessage(null, state.reducedMotion);
  }
}

document.addEventListener('DOMContentLoaded', init);
