/* cursor.js — Crosshair néon blanc, traits courts, centre vide */
(function () {
  if (window._ltCursorInit) return;
  window._ltCursorInit = true;

  var style = document.createElement('style');
  style.textContent =
    'html, body, *, *::before, *::after { cursor: none !important; }' +
    '#lt-c {' +
    '  position: fixed; top: 0; left: 0; z-index: 2147483647;' +
    '  pointer-events: none;' +
    '  transform: translate(-50%,-50%);' +
    '  width: 18px; height: 18px;' +
    '  transition: opacity .2s;' +
    '}' +
    /* trait vertical : deux segments, gap de 4px au centre */
    '#lt-c .v1, #lt-c .v2, #lt-c .h1, #lt-c .h2 {' +
    '  position: absolute; background: rgba(255,255,255,.95);' +
    '  box-shadow: 0 0 4px 1px rgba(255,255,255,.7);' +
    '  border-radius: 1px;' +
    '}' +
    '#lt-c .v1 { width: 1px; height: 6px; left: 50%; top: 0;    transform: translateX(-50%); }' +
    '#lt-c .v2 { width: 1px; height: 6px; left: 50%; bottom: 0; transform: translateX(-50%); }' +
    '#lt-c .h1 { height: 1px; width: 6px; top: 50%; left: 0;    transform: translateY(-50%); }' +
    '#lt-c .h2 { height: 1px; width: 6px; top: 50%; right: 0;   transform: translateY(-50%); }' +
    '#lt-c.off { opacity: 0; }';
  document.head.appendChild(style);

  var el = document.createElement('div'); el.id = 'lt-c';
  el.innerHTML = '<div class="v1"></div><div class="v2"></div><div class="h1"></div><div class="h2"></div>';

  function mount() { document.body.appendChild(el); }
  document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);

  document.addEventListener('mousemove', function (e) {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mouseleave', function () { el.classList.add('off'); });
  document.addEventListener('mouseenter', function () { el.classList.remove('off'); });
})();
