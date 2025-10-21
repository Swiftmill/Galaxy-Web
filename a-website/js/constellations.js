const baseNodes = [
  { label: 'WebGL', x: 120, y: 120 },
  { label: 'Canvas 2D', x: 320, y: 180 },
  { label: 'Procedural Design', x: 520, y: 120 },
  { label: 'Accessibility', x: 240, y: 320 },
  { label: 'Performance', x: 440, y: 300 },
  { label: 'Offline-first', x: 640, y: 260 },
  { label: 'Animations', x: 380, y: 80 },
  { label: 'Quality Scaling', x: 560, y: 360 },
];

const edges = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [4, 5],
  [2, 6],
  [6, 0],
  [4, 7],
  [3, 7],
];

function drawNode(ctx, node, highlight = false) {
  const radius = highlight ? 10 : 7;
  const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3);
  gradient.addColorStop(0, highlight ? 'rgba(34,211,238,0.9)' : 'rgba(139,92,246,0.75)');
  gradient.addColorStop(1, 'rgba(5,5,16,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawEdge(ctx, from, to, opacity = 0.3) {
  ctx.strokeStyle = `rgba(186,194,255,${opacity})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function createTooltip() {
  const tooltip = document.getElementById('constellation-tooltip');
  return {
    show(x, y, label) {
      tooltip.style.left = `${x + 18}px`;
      tooltip.style.top = `${y + 18}px`;
      tooltip.textContent = label;
      tooltip.setAttribute('aria-hidden', 'false');
      tooltip.style.opacity = '1';
    },
    hide() {
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.style.opacity = '0';
    },
  };
}

export function initConstellations(state) {
  const canvas = document.getElementById('skills-canvas');
  const tooltip = createTooltip();
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const getScaledNodes = () => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / 800;
    const scaleY = rect.height / 500;
    return baseNodes.map((node) => ({
      ...node,
      x: node.x * scaleX,
      y: node.y * scaleY,
    }));
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    render();
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaled = getScaledNodes();
    edges.forEach(([a, b]) => drawEdge(ctx, scaled[a], scaled[b]));
    scaled.forEach((node) => drawNode(ctx, node));
  };

  resize();
  window.addEventListener('resize', resize);

  let hoverIndex = -1;

  function handlePointer(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const scaled = getScaledNodes();
    hoverIndex = scaled.findIndex((node) => Math.hypot(node.x - x, node.y - y) < 15);
    render();
    if (hoverIndex >= 0) {
      const scaledNodes = getScaledNodes();
      drawNode(ctx, scaledNodes[hoverIndex], true);
      edges
        .filter((edge) => edge.includes(hoverIndex))
        .forEach(([a, b]) => drawEdge(ctx, scaledNodes[a], scaledNodes[b], 0.65));
      scaledNodes
        .filter((_, index) => index !== hoverIndex)
        .forEach((node) => drawNode(ctx, node));
      tooltip.show(event.clientX, event.clientY, baseNodes[hoverIndex].label);
    } else {
      tooltip.hide();
    }
  }

  canvas.addEventListener('mousemove', handlePointer);
  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1;
    tooltip.hide();
    render();
  });

  canvas.addEventListener('click', (event) => {
    if (hoverIndex >= 0) {
      tooltip.show(event.clientX, event.clientY, `${baseNodes[hoverIndex].label} engaged`);
      setTimeout(() => tooltip.hide(), 1000);
    }
  });

  if (state.reducedMotion) {
    baseNodes.forEach((node) => {
      node.x += Math.random() * 12 - 6;
      node.y += Math.random() * 12 - 6;
    });
    render();
  }
}
