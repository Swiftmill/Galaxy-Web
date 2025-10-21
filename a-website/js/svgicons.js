const icons = {
  github: `M10 1a9 9 0 0 0-2.84 17.54c.45.08.62-.19.62-.42v-1.47c-2.52.55-3.05-1.1-3.05-1.1-.41-1.03-1-1.3-1-1.3-.82-.55.06-.54.06-.54.9.06 1.37.94 1.37.94.81 1.37 2.14.97 2.66.74.08-.58.32-.97.58-1.19-2.01-.23-4.13-1-4.13-4.49 0-.99.35-1.79.94-2.42-.09-.23-.41-1.16.09-2.41 0 0 .76-.24 2.49.93a8.67 8.67 0 0 1 4.54 0c1.73-1.17 2.49-.93 2.49-.93.5 1.25.18 2.18.09 2.41.59.63.94 1.43.94 2.42 0 3.5-2.13 4.25-4.16 4.48.33.29.62.86.62 1.74v2.58c0 .23.17.51.62.42A9 9 0 0 0 10 1Z`,
  mail: `M2 4.5C2 3.67 2.67 3 3.5 3h9c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5v-7Zm10.65-.5H3.35L8 8.07 12.65 4Z`,
  x: `M3.55 2h2.08l2.42 3.37L10.83 2h2.17L9.52 6.94 13 12h-2.09L7.6 8.26 5.21 12H3.04l3.38-4.94L3.55 2Z`,
};

function createIcon(name) {
  const path = icons[name];
  if (!path) {
    const fallback = document.createElement('span');
    fallback.textContent = '•';
    return fallback;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<path d="${path}" fill="currentColor"/>`;
  return svg;
}

export function injectSVGIcons() {
  const orbit = document.querySelector('.social-orbit');
  const socials = [
    { href: 'https://github.com/a-website', label: 'GitHub', key: 'github' },
    { href: 'mailto:hello@a-website.space', label: 'Email', key: 'mail' },
    { href: 'https://x.com/a-website', label: 'X', key: 'x' },
  ];
  socials.forEach((item) => {
    const link = document.createElement('a');
    link.href = item.href;
    link.setAttribute('aria-label', item.label);
    link.appendChild(createIcon(item.key));
    orbit.appendChild(link);
  });
}

export function renderProjectSVG(svg, seed = Math.random()) {
  const width = 200;
  const height = 140;
  const gradientId = `grad-${seed.toString(36).slice(2, 8)}`;
  const noise = Array.from({ length: 12 }, () => `${Math.random() * width},${Math.random() * height}`).join(' ');
  svg.innerHTML = `
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="var(--accent)" />
        <stop offset="100%" stop-color="var(--accent2)" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#${gradientId})" rx="16"/>
    <polyline points="${noise}" fill="none" stroke="rgba(234,240,255,0.25)" stroke-width="1.5" stroke-linecap="round"/>
  `;
}
