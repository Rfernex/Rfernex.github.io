// Site-wide behaviour for the technical redesign (Nov 2026):
//  - a reading-progress line under the navbar (--progress on .navbar)
//  - a dot field behind the home and EconRadar banners that lights up around the cursor
//  - on the home page, the EconRadar paper count read live from the app's own index.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reading progress
  const nav = document.querySelector('.navbar');
  if (nav) {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      nav.style.setProperty('--progress', max > 40 ? Math.min(1, scrollY / max) : 0);
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  // EconRadar count (same origin on the live site; the static text stays otherwise)
  const count = document.querySelector('[data-radar-count]');
  if (count) {
    fetch('/Apps/radar/data/index.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        if (!d.total) return;
        count.textContent = d.total.toLocaleString('en-GB');
        const dot = document.createElement('span');
        dot.className = 'live-dot'; dot.title = 'Live from the EconRadar database'; dot.setAttribute('aria-hidden', 'true');
        count.before(dot);
      })
      .catch(() => {});
  }

  // Page title banners get a live dot field too (the static CSS pattern is the fallback)
  document.querySelectorAll('.quarto-title-banner').forEach(banner => {
    const c = document.createElement('canvas');
    c.className = 'hero-field'; c.setAttribute('aria-hidden', 'true');
    banner.prepend(c);
    banner.classList.add('has-field');
  });

  // Dot field behind a hero band (home page, EconRadar page). Colours come from
  // data-dot / data-hot on the canvas ("r,g,b"); defaults suit a white band.
  document.querySelectorAll('.hero-field').forEach(canvas => {
    const band = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const DOT = canvas.dataset.dot || '150,156,166', HOT = canvas.dataset.hot || '31,63,255';
    const GAP = 22, R = 150;
    let w = 0, h = 0, dpr = 1, mx = -1e4, my = -1e4, tx = -1e4, ty = -1e4, t = 0, raf = 0, visible = true;

    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = band.clientWidth; h = band.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // With no pointer, a soft highlight drifts slowly across the right half
      const idle = mx < -1e3;
      const cx = idle ? w * (0.72 + 0.12 * Math.sin(t / 5200)) : mx;
      const cy = idle ? h * (0.5 + 0.25 * Math.cos(t / 6800)) : my;
      const reach = idle ? R * 1.3 : R;
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const fade = Math.min(1, Math.max(0.18, (x / w - 0.25) / 0.45)); // quieter behind the text
          const d = Math.hypot(x - cx, y - cy);
          const k = Math.max(0, 1 - d / reach) * (idle ? 0.55 : 1);
          const r = 0.9 + k * 1.8;
          ctx.fillStyle = k > 0.02
            ? `rgba(${HOT}, ${(0.25 + 0.6 * k) * fade})`
            : `rgba(${DOT}, ${0.45 * fade})`;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }
    };
    const loop = now => {
      t = now;
      mx += (tx - mx) * 0.18; my += (ty - my) * 0.18;
      draw();
      raf = visible && !still ? requestAnimationFrame(loop) : 0;
    };
    band.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const b = band.getBoundingClientRect();
      tx = e.clientX - b.left; ty = e.clientY - b.top;
      if (mx < -1e3) { mx = tx; my = ty; }
    });
    band.addEventListener('pointerleave', () => { tx = ty = mx = my = -1e4; });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !still && !raf) raf = requestAnimationFrame(loop);
    }).observe(band);
    addEventListener('resize', size);
    size();
  });
})();
