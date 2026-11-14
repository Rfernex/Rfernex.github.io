// EconRadar page hero: cursor spotlight on the dimmed screenshot, a burst of light
// when the launch button is clicked, and the live paper count from the app's index.
(() => {
  const hero = document.querySelector('.radar-hero');
  if (!hero) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  // The spotlight follows the pointer over the network and fades when it leaves.
  const art = hero.querySelector('.rh-art');
  hero.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = art.getBoundingClientRect();
    art.style.setProperty('--ax', `${e.clientX - r.left}px`);
    art.style.setProperty('--ay', `${e.clientY - r.top}px`);
    hero.classList.add('is-lit');
  });
  hero.addEventListener('pointerleave', () => hero.classList.remove('is-lit'));

  // Clicking turns the lights on: a ring of light spreads from the click, the
  // screenshot brightens, then the app opens. New-tab clicks keep their default.
  const btn = hero.querySelector('.radar-launch');
  btn.addEventListener('click', e => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || still.matches) return;
    e.preventDefault();
    const r = hero.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const x = e.clientX || b.left + b.width / 2, y = e.clientY || b.top + b.height / 2;
    const ring = document.createElement('span');
    ring.className = 'rh-burst';
    ring.style.left = `${x - r.left}px`;
    ring.style.top = `${y - r.top}px`;
    hero.style.setProperty('--bx', `${x - r.left}px`);
    hero.style.setProperty('--by', `${y - r.top}px`);
    ring.addEventListener('animationend', () => ring.remove());
    hero.appendChild(ring);
    hero.classList.add('is-launching');
    setTimeout(() => { location.href = btn.href; }, 620);
  });
  // Coming back with the browser's back button restores the page from cache: reset it.
  addEventListener('pageshow', () => {
    hero.classList.remove('is-launching');
    hero.querySelectorAll('.rh-burst').forEach(n => n.remove());
  });

  // Live figures from the app itself (same origin); the static text stays if this fails.
  fetch('/Apps/radar/data/index.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(d => {
      if (d.total) hero.querySelector('[data-radar-total]').textContent = d.total.toLocaleString('en-GB');
      if (d.generatedAt) {
        const day = new Date(d.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        hero.querySelector('[data-radar-updated]').textContent = `last updated ${day}`;
      }
    })
    .catch(() => {});
})();
