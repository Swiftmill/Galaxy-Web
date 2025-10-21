const targets = new Map();
let ticking = false;
let mouseX = 0;
let mouseY = 0;
let scrollY = 0;

function update() {
  ticking = false;
  targets.forEach((intensity, element) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const offsetX = ((mouseX - (rect.left + centerX)) / centerX) * intensity;
    const offsetY = ((mouseY - (rect.top + centerY)) / centerY) * intensity;
    const scrollOffset = (scrollY / window.innerHeight) * intensity * 12;
    element.style.transform = `rotateX(${offsetY * -6}deg) rotateY(${offsetX * 6}deg) translateY(${scrollOffset}px)`;
  });
}

function requestUpdate() {
  if (!ticking) {
    requestAnimationFrame(update);
    ticking = true;
  }
}

export function applyParallaxEffect(element, intensity = 0.08) {
  targets.set(element, intensity * 100);
}

export function initParallax(state) {
  if (state.reducedMotion) return;
  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    requestUpdate();
  });
  document.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    requestUpdate();
  });
  window.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    requestUpdate();
  });
}
