/* cursor.js — Crosshair néon blanc propre */
(function () {
  if (window._ltCursorInit) return;
  window._ltCursorInit = true;

  /* Nettoie les anciens éléments curseur éventuellement présents dans le DOM */
  ['lt-cursor-dot','lt-cursor-ring','lt-c'].forEach(function(id){
    var old = document.getElementById(id);
    if (old) old.remove();
  });

  var style = document.createElement('style');
  style.textContent =
    'html, body, * { cursor: none !important; }' +
    '#lt-ch {' +
    '  position: fixed; z-index: 2147483647;' +
    '  pointer-events: none;' +
    '  width: 20px; height: 20px;' +
    '  transform: translate(-50%,-50%);' +
    '  transition: opacity .15s;' +
    '}' +
    '#lt-ch span {' +
    '  position: absolute; background: #fff;' +
    '  border-radius: 1px;' +
    '}' +
    /* haut */
    '#lt-ch span:nth-child(1){ width:1px; height:7px; left:50%; top:0;      margin-left:-.5px; }' +
    /* bas */
    '#lt-ch span:nth-child(2){ width:1px; height:7px; left:50%; bottom:0;   margin-left:-.5px; }' +
    /* gauche */
    '#lt-ch span:nth-child(3){ height:1px; width:7px; top:50%;  left:0;     margin-top:-.5px; }' +
    /* droite */
    '#lt-ch span:nth-child(4){ height:1px; width:7px; top:50%;  right:0;    margin-top:-.5px; }' +
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
