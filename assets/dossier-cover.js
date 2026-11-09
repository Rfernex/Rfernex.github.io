/* Keep the link's hit area still while its cover tilts inside it. */
(() => {
  const cover = document.querySelector('.featured-cover');
  if (!cover) return;

  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let position;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    cover.classList.remove('is-tilting');
    ['--tilt-x', '--tilt-y', '--light-x', '--light-y', '--shadow-x'].forEach((name) => cover.style.removeProperty(name));
  }

  function update(event) {
    if (!pointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
    const rect = cover.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    position = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const { x, y } = position;
      cover.style.setProperty('--tilt-x', `${(0.5 - y) * 14}deg`);
      cover.style.setProperty('--tilt-y', `${(x - 0.5) * 16}deg`);
      cover.style.setProperty('--light-x', `${x * 100}%`);
      cover.style.setProperty('--light-y', `${y * 100}%`);
      cover.style.setProperty('--shadow-x', `${(0.5 - x) * 20}px`);
      cover.classList.add('is-tilting');
    });
  }

  cover.addEventListener('pointerenter', update);
  cover.addEventListener('pointermove', update);
  cover.addEventListener('pointerleave', reset);
  cover.addEventListener('pointercancel', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', reset, { passive: true });
  window.addEventListener('resize', reset);
  pointer.addEventListener('change', reset);
  reducedMotion.addEventListener('change', reset);
})();
