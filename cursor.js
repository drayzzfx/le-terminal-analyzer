/* cursor.js — Crosshair néon blanc */
(function () {
  if (window._ltCursorInit) return;
  window._ltCursorInit = true;

  var style = document.createElement('style');
  style.textContent =
    '*, *::before, *::after { cursor: none !important; }' +
    '#lt-c {' +
    '  position: fixed; top: 0; left: 0; z-index: 999999;' +
    '  pointer-events: none;' +
    '  transform: translate(-50%,-50%);' +
    '  width: 28px; height: 28px;' +
    '  transition: opacity .2s;' +
    '}' +
    '#lt-c::before, #lt-c::after {' +
    '  content: ""; position: absolute; background: #fff;' +
    '  box-shadow: 0 0 6px 1px rgba(255,255,255,.8), 0 0 14px 3px rgba(255,255,255,.4);' +
    '  border-radius: 1px;' +
    '}' +
    '#lt-c::before { left: 50%; top: 0; transform: translateX(-50%); width: 1.5px; height: 100%; }' +
    '#lt-c::after  { top: 50%; left: 0; transform: translateY(-50%); height: 1.5px; width: 100%; }' +
    '#lt-c.off { opacity: 0; }';
  document.head.appendChild(style);

  var el = document.createElement('div'); el.id = 'lt-c';
  document.body ? document.body.appendChild(el) : document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(el); });

  document.addEventListener('mousemove', function (e) {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mouseleave', function () { el.classList.add('off'); });
  document.addEventListener('mouseenter', function () { el.classList.remove('off'); });
})();
