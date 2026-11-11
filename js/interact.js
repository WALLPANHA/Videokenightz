/* Page-level life: a soft light that follows the pointer, and a gentle tilt of the machine (mouse or trackpad only).
   Touch screens get the tap ripples and sparkles on the screen itself (see visuals.js). */
(() => {
  const root = document.documentElement, m = document.querySelector(".machine");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches, calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0, ev = null;
  const reset = () => { root.classList.remove("glow"); if (m) { m.style.setProperty("--rx", "0deg"); m.style.setProperty("--ry", "0deg"); } };
  addEventListener("pointermove", e => {
    if (e.pointerType === "touch" || calm) return;
    if (!S.set.fxi) { reset(); return; }
    ev = e; if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0; root.style.setProperty("--mx", ev.clientX + "px"); root.style.setProperty("--my", ev.clientY + "px"); root.classList.add("glow");
      if (fine && m) { const r = m.getBoundingClientRect(), dx = (ev.clientX - (r.left + r.width / 2)) / innerWidth, dy = (ev.clientY - (r.top + r.height / 2)) / innerHeight;
        m.style.setProperty("--ry", (dx * 3).toFixed(2) + "deg"); m.style.setProperty("--rx", (-dy * 2.4).toFixed(2) + "deg"); }
    });
  });
  document.addEventListener("mouseleave", reset);
})();
