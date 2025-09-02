(() => {
  const sections = Array.from(document.querySelectorAll('.pop-section'));
  if (!sections.length) return;

  let viewportH = window.innerHeight;
  let ticking = false;

  function update() {
    const centerY = viewportH / 2;

    sections.forEach((el) => {
      const r = el.getBoundingClientRect();
      const sectionCenter = r.top + r.height / 2;

      // distance from viewport center (0 = perfectly centered)
      const dist = Math.abs(sectionCenter - centerY);

      // map distance -> 0..1 (1 when centered, 0 when far)
      const maxDist = viewportH / 2; // feel free to tweak
      const t = Math.max(0, 1 - dist / maxDist);

      // scale between 1.00 and 1.06 (tweak 0.06 to taste)
      const scale = 1 + t * 0.06;

      // soft shadow intensity
      const shadowAlpha = 0.12 * t;

      el.style.transform = `scale(${scale})`;
      el.style.boxShadow = `0 18px 40px rgba(0,0,0,${shadowAlpha})`;
      el.style.zIndex = String(Math.round(100 * t)); // keep top-most
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    viewportH = window.innerHeight;
    update();
  }, { passive: true });

  // initial paint
  update();
})();
