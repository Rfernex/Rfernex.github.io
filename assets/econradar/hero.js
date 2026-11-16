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

// ---- Page body (v5) ----
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Showcase: build tabs from each .rx-tab heading and text; the screenshot shows on the right.
  // Tabs advance on their own every few seconds until the visitor clicks one or hovers the block.
  const show = document.querySelector('.rx-showcase');
  if (show) {
    const panes = [...show.querySelectorAll(':scope > .rx-tab')];
    if (panes.length) {
      const DWELL = 7000;
      const tabs = document.createElement('div');
      tabs.className = 'rx-tabs'; tabs.setAttribute('role', 'tablist');
      const stage = document.createElement('div');
      stage.className = 'rx-stage';
      const buttons = panes.map((pane, i) => {
        const h = pane.querySelector('h4'), desc = [...pane.querySelectorAll(':scope > p')].map(p => p.textContent).join(' ');
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.id = `rx-tab-${i}`;
        b.innerHTML = `<b></b><span class="rx-desc"></span><span class="rx-bar"></span>`;
        b.querySelector('b').textContent = h ? h.textContent.trim() : `Tab ${i + 1}`;
        b.querySelector('.rx-desc').textContent = desc;
        pane.setAttribute('role', 'tabpanel'); pane.setAttribute('aria-labelledby', b.id);
        stage.appendChild(pane);
        tabs.appendChild(b);
        return b;
      });
      show.append(tabs, stage);
      show.classList.add('is-ready');
      show.style.setProperty('--rx-dwell', `${DWELL}ms`);

      let current = 0, timer = 0, auto = !still, paused = false;
      const select = (i, byUser) => {
        current = (i + panes.length) % panes.length;
        buttons.forEach((b, k) => { b.setAttribute('aria-selected', String(k === current)); b.tabIndex = k === current ? 0 : -1; b.classList.toggle('no-auto', !auto); });
        panes.forEach((p, k) => p.classList.toggle('is-active', k === current));
        if (byUser) auto = false;
        // restart the progress bar
        const bar = buttons[current].querySelector('.rx-bar'); bar.style.transition = 'none'; bar.style.width = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = ''; bar.style.width = ''; }));
        clearTimeout(timer);
        if (auto && !paused) timer = setTimeout(() => select(current + 1), DWELL);
      };
      buttons.forEach((b, i) => {
        b.addEventListener('click', () => select(i, true));
        b.addEventListener('keydown', e => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(current + 1, true); buttons[current].focus(); }
          if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(current - 1, true); buttons[current].focus(); }
        });
      });
      show.addEventListener('pointerenter', () => { paused = true; show.classList.add('is-paused'); clearTimeout(timer); });
      show.addEventListener('pointerleave', () => { paused = false; show.classList.remove('is-paused'); if (auto) select(current); });
      select(0);
    }
  }

  // Reveal blocks as they scroll into view
  const items = document.querySelectorAll('.rx-reveal, .rx-features > .rx-feature');
  if (!still && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    items.forEach(el => { el.classList.add('will-reveal'); io.observe(el); });
  }
})();
