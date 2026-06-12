// appshell.js — applique l'AppShell du design (barre latérale « Outils » + fil
// d'ariane) sur les pages outils qui ne l'ont pas encore, en enveloppant le
// contenu existant. Idempotent : ne fait rien si l'AppShell est déjà présent
// (ex. calculateur.html, déjà structuré en .app > .side + .main).
(function () {
  'use strict';
  if (document.querySelector('.app > .side')) return; // déjà en AppShell

  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var PAGES = {
    'journal.html':     { crumb: 'Journal de Trading',  key: 'journal' },
    'calendrier.html':  { crumb: 'Calendrier Éco',      key: 'calendrier' },
    'app.html':         { crumb: 'Setup Analyzer',      key: 'analyzer' },
    'bubble.html':      { crumb: 'Bubble Map',          key: 'bubble' },
    'calculateur.html': { crumb: 'Calculateur de Pips', key: 'calculateur' }
  };
  var cfg = PAGES[path];
  if (!cfg) return;

  var main = document.querySelector('.main');
  if (!main) return; // pages sans conteneur .main : gérées séparément

  var I = {
    journal:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 3v18M13 8h3M13 12h3"/></svg>',
    calendrier: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="1.5"/><path d="M4 9h16M8 3v4M16 3v4M9 14h2"/></svg>',
    analyzer:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 14l3-3 2 2 4-4"/></svg>',
    bubble:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="4"/><circle cx="17" cy="15" r="3"/><circle cx="16" cy="6" r="2"/></svg>',
    calculateur:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M8 18h6"/></svg>'
  };
  var ITEMS = [
    { key: 'journal',    label: 'Journal',        href: './journal.html' },
    { key: 'calendrier', label: 'Calendrier Éco', href: './calendrier.html' },
    { key: 'analyzer',   label: 'Setup Analyzer', href: './app.html' },
    { key: 'bubble',     label: 'Bubble Map',     href: './bubble.html' },
    { key: 'calculateur',label: 'Calculateur',    href: './calculateur.html' }
  ];

  // ── barre latérale ──
  var side = document.createElement('aside');
  side.className = 'side';
  var sh = '<span class="side__label">Outils</span>';
  ITEMS.forEach(function (it) {
    sh += '<a class="side__item' + (it.key === cfg.key ? ' is-active' : '') + '" href="' + it.href + '">'
        + '<span class="side__ic">' + I[it.key] + '</span>' + it.label + '</a>';
  });
  sh += '<div class="side__spacer"></div>'
      + '<div class="side__pro"><h4>Accès PRO</h4>'
      + '<p>Analyses illimitées, journal complet et alertes macro en direct.</p>'
      + '<button class="lt-btn lt-btn--primary lt-btn--sm" style="width:100%" onclick="location.href=\'./tarifs.html\'">Passer PRO</button></div>';
  side.innerHTML = sh;

  // ── fil d'ariane ──
  var initials = 'LT';
  try { var em = localStorage.getItem('ta_email') || ''; if (em) initials = em.slice(0, 2).toUpperCase(); } catch (e) {}
  var top = document.createElement('div');
  top.className = 'top';
  top.innerHTML = '<div class="top__crumb"><span>Le Terminal</span><span class="sep">/</span><b>' + cfg.crumb + '</b></div>'
      + '<div class="top__right"><span class="top__status"><span class="lt-dot"></span> Marché ouvert</span>'
      + '<span class="top__avatar">' + initials + '</span></div>';

  // ── enveloppe : .app > .side + .main(.top + contenu) ──
  var app = document.createElement('div');
  app.className = 'app';
  main.parentNode.insertBefore(app, main);
  app.appendChild(side);
  app.appendChild(main);
  main.insertBefore(top, main.firstChild);

  // ── dock icônes → mobile uniquement (la barre latérale prend le relais sur desktop) ──
  var dock = document.querySelector('nav.lt-dock:not(.lt-dock--mobile-only)');
  if (dock) dock.classList.add('lt-dock--mobile-only');
})();
