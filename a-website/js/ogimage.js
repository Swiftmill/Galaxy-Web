function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#050510');
  gradient.addColorStop(1, 'rgba(139,92,246,0.85)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 900; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 2.2;
    ctx.fillStyle = `rgba(234, 240, 255, ${Math.random() * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawText(ctx, width) {
  ctx.fillStyle = '#EAF0FF';
  ctx.font = 'bold 96px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('A Website', 120, 240);
  ctx.font = '32px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(186,194,255,0.9)';
  ctx.fillText('Exploring the Cosmos of Experience', 120, 320);
  ctx.fillStyle = 'rgba(34,211,238,0.8)';
  ctx.fillRect(120, 360, 320, 4);
}

function drawNebula(ctx, width, height) {
  const gradient = ctx.createRadialGradient(width * 0.65, height * 0.5, 80, width * 0.65, height * 0.5, 320);
  gradient.addColorStop(0, 'rgba(34,211,238,0.65)');
  gradient.addColorStop(1, 'rgba(5,5,16,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(width * 0.65, height * 0.5, 280, 200, 0.6, 0, Math.PI * 2);
  ctx.fill();
}

export function initOGGenerator() {
  const button = document.getElementById('export-og');
  const faviconCanvas = document.createElement('canvas');
  faviconCanvas.width = 64;
  faviconCanvas.height = 64;
  const favCtx = faviconCanvas.getContext('2d');
  favCtx.fillStyle = '#050510';
  favCtx.fillRect(0, 0, 64, 64);
  favCtx.fillStyle = '#8B5CF6';
  favCtx.beginPath();
  favCtx.arc(32, 32, 20, 0, Math.PI * 2);
  favCtx.fill();
  favCtx.fillStyle = '#22D3EE';
  favCtx.beginPath();
  favCtx.arc(40, 26, 8, 0, Math.PI * 2);
  favCtx.fill();
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = faviconCanvas.toDataURL('image/png');
  document.head.appendChild(link);

  button.addEventListener('click', () => {
    const { canvas, ctx } = createCanvas(1200, 630);
    drawBackground(ctx, canvas.width, canvas.height);
    drawNebula(ctx, canvas.width, canvas.height);
    drawText(ctx, canvas.width);
    const url = canvas.toDataURL('image/png');
    const meta = document.getElementById('og-image-meta');
    if (meta) {
      meta.setAttribute('content', url);
    }
    const a = document.createElement('a');
    a.download = 'a-website-og.png';
    a.href = url;
    a.click();
    window.dispatchEvent(new CustomEvent('toast', { detail: 'OG image exported ✨' }));
  });
}
