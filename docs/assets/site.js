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
    c.className = 'hero-field'; c.dataset.fade = 'soft'; c.setAttribute('aria-hidden', 'true');
    banner.prepend(c);
    banner.classList.add('has-field');
  });

  // Dot field behind a band (home hero, EconRadar hero, page titles).
  //  data-dot / data-hot: "r,g,b" colours (defaults suit a white band)
  //  data-fade="soft": dots stay visible behind text on the left
  //  data-sweep: selector of a rotating radar sweep; dots light up as it passes
  // The canvas is re-measured whenever the band changes size, so the dots always
  // line up with the cursor.
  document.querySelectorAll('.hero-field').forEach(canvas => {
    const band = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const DOT = canvas.dataset.dot || '150,156,166', HOT = canvas.dataset.hot || '31,63,255';
    const soft = canvas.dataset.fade === 'soft';
    const sweep = canvas.dataset.sweep ? band.querySelector(canvas.dataset.sweep) : null;
    const GAP = 22, R = 140;
    let w = 0, h = 0, dpr = 1, mx = -1e4, my = -1e4, tx = -1e4, ty = -1e4, t = 0, raf = 0, visible = true;

    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const fadeAt = x => soft ? Math.min(1, 0.55 + 0.45 * x / w) : Math.min(1, Math.max(0.18, (x / w - 0.25) / 0.45));
    const draw = () => {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const pointer = mx > -1e3;
      // Without a pointer (and without a radar), a soft highlight drifts across the band
      const drift = !pointer && !sweep;
      const cx = pointer ? mx : w * (0.72 + 0.12 * Math.sin(t / 5200));
      const cy = pointer ? my : h * (0.5 + 0.25 * Math.cos(t / 6800));
      // Radar: centre, reach and current angle of the sweep (clockwise from 12 o'clock)
      let sx = 0, sy = 0, sr = 0, sa = 0;
      if (sweep) {
        const b = canvas.getBoundingClientRect(), r = sweep.getBoundingClientRect();
        sx = r.left + r.width / 2 - b.left; sy = r.top + r.height / 2 - b.top;
        sr = sweep.offsetWidth / 2 * 0.62;
        sa = parseFloat(getComputedStyle(sweep).rotate) || 0;
      }
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const fade = fadeAt(x);
          let k = 0;
          if (pointer || drift) k = Math.max(0, 1 - Math.hypot(x - cx, y - cy) / (drift ? R * 1.3 : R)) * (drift ? 0.55 : 1);
          let base = 0.45;
          if (sweep) {
            const dx = x - sx, dy = y - sy, d = Math.hypot(dx, dy);
            if (d < sr) {
              base = 0.22;                                        // calmer dots inside the radar
              const phi = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
              const behind = ((sa - phi) % 360 + 360) % 360;       // degrees since the beam passed
              if (behind < 100) k = Math.max(k, Math.pow(1 - behind / 100, 2) * (1 - 0.55 * d / sr));
            }
          }
          const r = 0.9 + k * 1.8;
          ctx.fillStyle = k > 0.02 ? `rgba(${HOT}, ${(0.25 + 0.65 * k) * fade})` : `rgba(${DOT}, ${base * fade})`;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }
    };
    const loop = now => {
      t = now;
      mx += (tx - mx) * 0.35; my += (ty - my) * 0.35;
      draw();
      raf = visible && !still ? requestAnimationFrame(loop) : 0;
    };
    band.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const b = canvas.getBoundingClientRect();
      tx = e.clientX - b.left; ty = e.clientY - b.top;
      if (mx < -1e3) { mx = tx; my = ty; }
    });
    band.addEventListener('pointerleave', () => { tx = ty = mx = my = -1e4; });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !still && !raf) raf = requestAnimationFrame(loop);
    }).observe(band);
    new ResizeObserver(size).observe(canvas);
    size();
  });
})();
