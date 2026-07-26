/* cursor.js — Curseur custom néon (optimisé : transform + requestAnimationFrame, zéro reflow) */
(function () {
  if (window._ltCursorInit) return;
  window._ltCursorInit = true;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return; // mobile : curseur natif

  var style = document.createElement('style');
  style.textContent =
    '*, *::before, *::after { cursor: none !important; }' +
    '#lt-c {' +
    '  position: fixed; top: 0; left: 0; z-index: 999999;' +
    '  width: 10px; height: 10px; border-radius: 50%;' +
    '  background: #3B7DFF;' +
    '  box-shadow: 0 0 8px 2px #3B7DFF, 0 0 18px 4px rgba(59, 125, 255,.5);' +
    '  pointer-events: none; will-change: transform;' +
    '  transition: opacity .2s, width .15s, height .15s, box-shadow .15s;' +
    '}' +
    '#lt-c.h { width: 14px; height: 14px; box-shadow: 0 0 12px 4px #3B7DFF, 0 0 28px 8px rgba(59, 125, 255,.5); }' +
    '#lt-c.off { opacity: 0; }';
  document.head.appendChild(style);

  var el = document.createElement('div');
  el.id = 'lt-c';
  var place = function () { document.body.appendChild(el); };
  document.body ? place() : document.addEventListener('DOMContentLoaded', place);

  // Position via transform (couche GPU) mise à jour une seule fois par frame (rAF) → pas de layout/reflow.
  var cx = 0, cy = 0, raf = null, hov = false;
  function draw() {
    raf = null;
    el.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)';
  }
  document.addEventListener('mousemove', function (e) {
    cx = e.clientX; cy = e.clientY;
    var h = !!(e.target.closest && e.target.closest('a,button,[role="button"],[onclick]'));
    if (h !== hov) { hov = h; el.classList.toggle('h', h); }
    if (!raf) raf = requestAnimationFrame(draw);
  }, { passive: true });
  document.addEventListener('mouseleave', function () { el.classList.add('off'); });
  document.addEventListener('mouseenter', function () { el.classList.remove('off'); });
})();
