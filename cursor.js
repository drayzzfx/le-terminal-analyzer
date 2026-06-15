/* cursor.js — Curseur custom simple néon */
(function () {
  if (window._ltCursorInit) return;
  window._ltCursorInit = true;

  var style = document.createElement('style');
  style.textContent =
    '*, *::before, *::after { cursor: none !important; }' +
    '#lt-c {' +
    '  position: fixed; top: 0; left: 0; z-index: 999999;' +
    '  width: 10px; height: 10px; border-radius: 50%;' +
    '  background: #7FB8E8;' +
    '  box-shadow: 0 0 8px 2px #7FB8E8, 0 0 18px 4px rgba(127,184,232,.5);' +
    '  pointer-events: none; transform: translate(-50%,-50%);' +
    '  transition: opacity .2s, transform .1s, width .15s, height .15s, box-shadow .15s;' +
    '}' +
    '#lt-c.h { width: 14px; height: 14px; box-shadow: 0 0 12px 4px #7FB8E8, 0 0 28px 8px rgba(127,184,232,.5); }' +
    '#lt-c.off { opacity: 0; }';
  document.head.appendChild(style);

  var el = document.createElement('div');
  el.id = 'lt-c';
  document.body ? document.body.appendChild(el) : document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(el); });

  document.addEventListener('mousemove', function (e) {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
    el.classList.toggle('h', !!e.target.closest('a,button,[role="button"],[onclick]'));
  });
  document.addEventListener('mouseleave', function () { el.classList.add('off'); });
  document.addEventListener('mouseenter', function () { el.classList.remove('off'); });
})();
