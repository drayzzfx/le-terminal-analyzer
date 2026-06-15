/* cursor.js — Curseur custom Cinematic Luxury (pages sans appshell) */
(function initCursor() {
  if (window._ltCursorInit) return;
  window._ltCursorInit = true;

  var style = document.createElement('style');
  style.textContent = [
    '*, *::before, *::after { cursor: none !important; }',
    '#lt-cursor-dot, #lt-cursor-ring {',
    '  position: fixed; top: 0; left: 0;',
    '  pointer-events: none; z-index: 999999;',
    '  border-radius: 50%; transform: translate(-50%,-50%);',
    '  will-change: transform; backface-visibility: hidden;',
    '}',
    '#lt-cursor-dot {',
    '  width: 5px; height: 5px;',
    '  background: #7FB8E8;',
    '  box-shadow: 0 0 6px 1px rgba(127,184,232,.7);',
    '  transition: width .12s cubic-bezier(0.16,1,0.3,1),',
    '              height .12s cubic-bezier(0.16,1,0.3,1),',
    '              background .15s ease,',
    '              box-shadow .15s ease,',
    '              opacity .2s ease;',
    '}',
    '#lt-cursor-ring {',
    '  width: 32px; height: 32px;',
    '  border: 1px solid rgba(127,184,232,.45);',
    '  background: transparent;',
    '  transition: width .35s cubic-bezier(0.16,1,0.3,1),',
    '              height .35s cubic-bezier(0.16,1,0.3,1),',
    '              border-color .25s ease,',
    '              background .25s ease,',
    '              opacity .2s ease;',
    '}',
    '#lt-cursor-ring.is-hover {',
    '  width: 48px; height: 48px;',
    '  border-color: rgba(127,184,232,.8);',
    '  background: rgba(127,184,232,.06);',
    '}',
    '#lt-cursor-dot.is-hover {',
    '  width: 4px; height: 4px;',
    '  background: #BFDCF5;',
    '  box-shadow: 0 0 10px 3px rgba(127,184,232,.55);',
    '}',
    '#lt-cursor-ring.is-click {',
    '  width: 22px; height: 22px;',
    '  border-color: rgba(127,184,232,1);',
    '  background: rgba(127,184,232,.12);',
    '  transition-duration: .08s;',
    '}',
    '#lt-cursor-dot.is-click {',
    '  width: 3px; height: 3px;',
    '  box-shadow: 0 0 14px 4px rgba(127,184,232,.9);',
    '  transition-duration: .08s;',
    '}',
    '#lt-cursor-ring.is-text {',
    '  width: 3px; height: 38px; border-radius: 2px;',
    '  border-color: rgba(127,184,232,.7);',
    '  background: rgba(127,184,232,.18);',
    '}',
    '#lt-cursor-dot.is-hidden, #lt-cursor-ring.is-hidden { opacity: 0; }',
  ].join('\n');
  document.head.appendChild(style);

  var dot  = document.createElement('div'); dot.id  = 'lt-cursor-dot';
  var ring = document.createElement('div'); ring.id = 'lt-cursor-ring';
  document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);

  function mount() {
    document.body.appendChild(dot);
    document.body.appendChild(ring);
  }

  var mx = -200, my = -200;
  var rx = -200, ry = -200;
  var raf;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    if (!raf) raf = requestAnimationFrame(step);

    var t = e.target;
    var interactive = t.closest('a,button,[role="button"],[onclick],select,label,input[type="checkbox"],input[type="radio"],input[type="submit"],input[type="button"],[data-cursor-hover]');
    var textInput    = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;

    if (textInput) {
      ring.classList.add('is-text');
      ring.classList.remove('is-hover');
    } else if (interactive) {
      ring.classList.add('is-hover');
      ring.classList.remove('is-text');
      dot.classList.add('is-hover');
    } else {
      ring.classList.remove('is-hover', 'is-text');
      dot.classList.remove('is-hover');
    }
  });

  document.addEventListener('mousedown', function() {
    ring.classList.add('is-click'); dot.classList.add('is-click');
  });
  document.addEventListener('mouseup', function() {
    ring.classList.remove('is-click'); dot.classList.remove('is-click');
  });
  document.addEventListener('mouseleave', function() {
    dot.classList.add('is-hidden'); ring.classList.add('is-hidden');
  });
  document.addEventListener('mouseenter', function() {
    dot.classList.remove('is-hidden'); ring.classList.remove('is-hidden');
  });

  function step() {
    raf = null;
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) {
      raf = requestAnimationFrame(step);
    }
  }
})();
