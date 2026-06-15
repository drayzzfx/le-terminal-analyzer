/* cursor.js — Crosshair blanc, curseur natif masqué via SVG transparent */
(function () {
  if (window._ltCursorInit) return;
  window._ltCursorInit = true;

  /* Supprime tout ancien élément curseur */
  ['lt-cursor-dot','lt-cursor-ring','lt-c','lt-ch'].forEach(function(id){
    var el = document.getElementById(id); if (el) el.remove();
  });

  /* SVG 1x1 transparent = curseur natif invisible même sur les éléments avec inline cursor:pointer */
  var BLANK = "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/>\")" ;

  var style = document.createElement('style');
  style.textContent =
    'html, body, * { cursor: ' + BLANK + ' 0 0, none !important; }' +
    '#lt-ch {' +
    '  position: fixed; z-index: 2147483647; pointer-events: none;' +
    '  width: 20px; height: 20px; transform: translate(-50%,-50%);' +
    '  transition: opacity .15s;' +
    '}' +
    '#lt-ch span {' +
    '  position: absolute; background: #fff; border-radius: 1px;' +
    '}' +
    '#lt-ch span:nth-child(1){ width:1.5px; height:7px; left:calc(50% - .75px); top:0; }' +
    '#lt-ch span:nth-child(2){ width:1.5px; height:7px; left:calc(50% - .75px); bottom:0; }' +
    '#lt-ch span:nth-child(3){ height:1.5px; width:7px; top:calc(50% - .75px); left:0; }' +
    '#lt-ch span:nth-child(4){ height:1.5px; width:7px; top:calc(50% - .75px); right:0; }' +
    '#lt-ch.off { opacity: 0; }';
  document.head.appendChild(style);

  var el = document.createElement('div'); el.id = 'lt-ch';
  el.innerHTML = '<span></span><span></span><span></span><span></span>';

  function mount(){ document.body.appendChild(el); }
  document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);

  document.addEventListener('mousemove', function(e){
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mouseleave', function(){ el.classList.add('off'); });
  document.addEventListener('mouseenter', function(){ el.classList.remove('off'); });
})();
