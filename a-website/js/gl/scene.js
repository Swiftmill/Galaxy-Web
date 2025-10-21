import { GLCore } from './core.js';
import { Stars } from './stars.js';
import { Nebula } from './nebula.js';
import { PostFX } from './postfx.js';

function perspectiveMatrix(fov, aspect, near, far) {
  const f = 1.0 / Math.tan(fov / 2);
  const rangeInv = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;

  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;

  out[8] = 0;
  out[9] = 0;
  out[10] = (near + far) * rangeInv;
  out[11] = -1;

  out[12] = 0;
  out[13] = 0;
  out[14] = near * far * rangeInv * 2;
  out[15] = 0;
  return out;
}

function parseColor(variableName) {
  const style = getComputedStyle(document.documentElement).getPropertyValue(variableName);
  const div = document.createElement('div');
  div.style.color = style.trim();
  document.body.appendChild(div);
  const computed = getComputedStyle(div).color;
  document.body.removeChild(div);
  const [r, g, b] = computed
    .replace(/rgba?\(/, '')
    .replace(')', '')
    .split(',')
    .map((v) => parseFloat(v) / 255);
  return new Float32Array([r, g, b]);
}

function createFallback(canvas) {
  const ctx = canvas.getContext('2d');
  const width = (canvas.width = canvas.clientWidth);
  const height = (canvas.height = canvas.clientHeight);
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 400; i += 1) {
    ctx.fillStyle = `rgba(139, 92, 246, ${Math.random()})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }
}

export async function bootstrapScene(state) {
  const canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return null;
  try {
    const core = new GLCore(canvas);
    const fallback = document.getElementById('fallback-canvas');
    if (fallback) {
      fallback.style.opacity = '0';
    }
    let starDensity = state.theme?.stars || state.quality;
    const stars = new Stars(core, starDensity);
    const nebula = new Nebula(core);
    const post = new PostFX(core);

    let pointerX = 0;
    let pointerY = 0;
    let targetZoom = 1;
    let zoom = 1;

    function handlePointer(event) {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    function handleScroll(event) {
      targetZoom += event.deltaY * -0.0006;
      targetZoom = Math.min(Math.max(targetZoom, 0.6), 1.4);
    }

    window.addEventListener('mousemove', handlePointer);
    window.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      handlePointer(touch);
    });
    window.addEventListener('wheel', handleScroll, { passive: true });

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
    });

    const projection = new Float32Array(16);

    let bloomStrength = 0.35;

    window.addEventListener('theme:stars-density', (event) => {
      starDensity = Number(event.detail) || 1;
      stars.updateDensity(starDensity);
    });

    let accent = parseColor('--accent');
    let accent2 = parseColor('--accent2');

    window.addEventListener('theme:refresh', () => {
      accent = parseColor('--accent');
      accent2 = parseColor('--accent2');
    });

    let lastTime = performance.now();
    let accumulator = 0;

    function loop(now) {
      if (!running) {
        requestAnimationFrame(loop);
        return;
      }
      const delta = Math.min(now - lastTime, 50);
      lastTime = now;
      accumulator += delta;

      const fps = core.updateFPS();
      if (fps < 50) {
        bloomStrength = Math.max(0.1, bloomStrength - 0.02);
        if (starDensity > 0.35) {
          starDensity = Math.max(0.35, starDensity - 0.05);
          stars.updateDensity(starDensity);
        }
      } else if (fps > 58) {
        bloomStrength = Math.min(0.45, bloomStrength + 0.01);
        const desired = state.theme?.stars || 1;
        if (starDensity < desired) {
          starDensity = Math.min(desired, starDensity + 0.02);
          stars.updateDensity(starDensity);
        }
      }

      zoom += (targetZoom - zoom) * 0.04;

      const width = canvas.width;
      const height = canvas.height;
      const aspect = width / height;
      const fov = (50 * Math.PI) / 180 * zoom;
      projection.set(perspectiveMatrix(fov, aspect, 50, 900));

      post.bind();
      const gl = core.gl;
      gl.clearColor(0.01, 0.01, 0.04, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      const time = accumulator * 0.001;
      nebula.draw(time, new Float32Array([width, height]), accent, accent2);

      const offsetX = pointerX * 0.35;
      const offsetY = pointerY * 0.25;
      projection[8] = offsetX * 0.15;
      projection[9] = offsetY * 0.15;

      stars.draw(projection, time, accent);

      post.draw(bloomStrength);
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return { core, stars, nebula, post };
  } catch (error) {
    console.warn('WebGL scene failed, falling back', error);
    createFallback(canvas);
    throw error;
  }
}
