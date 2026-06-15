// appshell.js — AppShell du design (barre latérale « Outils » hiérarchique + fil
// d'ariane) appliqué à toutes les pages outils. La barre latérale reprend le STYLE
// du design actuel (.side__item) avec l'arborescence complète (sous-menus dépliables).

/* ─── CURSEUR CUSTOM SIMPLE NÉON ──────────────────────────────────────────── */
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
    '  transition: opacity .2s, width .15s, height .15s, box-shadow .15s;' +
    '}' +
    '#lt-c.h { width: 14px; height: 14px; box-shadow: 0 0 12px 4px #7FB8E8, 0 0 28px 8px rgba(127,184,232,.5); }' +
    '#lt-c.off { opacity: 0; }';
  document.head.appendChild(style);

  var el = document.createElement('div'); el.id = 'lt-c';
  document.body ? document.body.appendChild(el) : document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(el); });

  document.addEventListener('mousemove', function (e) {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
    el.classList.toggle('h', !!e.target.closest('a,button,[role="button"],[onclick]'));
  });
  document.addEventListener('mouseleave', function () { el.classList.add('off'); });
  document.addEventListener('mouseenter', function () { el.classList.remove('off'); });
})();
/* ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var PAGES = {
    'journal.html':     { crumb: 'Journal de Trading',  key: 'journal' },
    'calendrier.html':  { crumb: 'Calendrier Éco',      key: 'calendrier' },
    'app.html':         { crumb: 'Setup Analyzer',      key: 'analyzer' },
    'bubble.html':      { crumb: 'Bubble Map',          key: 'bubble' },
    'calculateur.html': { crumb: 'Calculateur de Pips', key: 'calculateur' },
    // Pages Éco (anciennes pages d'actus) — rattachées à la branche Calendrier
    'eco-edition.html':      { crumb: 'Calendrier Éco · Présentation', key: 'calendrier' },
    'eco-selection.html':    { crumb: 'Calendrier Éco · La sélection',  key: 'calendrier' },
    'eco-europe.html':       { crumb: 'Calendrier Éco · Europe',        key: 'calendrier' },
    'eco-ameriques.html':    { crumb: 'Calendrier Éco · Amériques',     key: 'calendrier' },
    'eco-asie.html':         { crumb: 'Calendrier Éco · Asie',          key: 'calendrier' },
    'eco-marches.html':      { crumb: 'Calendrier Éco · Marchés',       key: 'calendrier' },
    'eco-institutions.html': { crumb: 'Calendrier Éco · Institutions',  key: 'calendrier' },
    'eco-international.html': { crumb: 'Calendrier Éco · International',  key: 'calendrier' },
    'eco-flash.html':        { crumb: 'Calendrier Éco · Flash Info',    key: 'calendrier' },
    'eco-calendrier.html':   { crumb: 'Calendrier Éco · Calendrier',    key: 'calendrier' },
    'eco-crypto.html':       { crumb: 'Calendrier Éco · Crypto',        key: 'calendrier' },
    'eco-archive.html':      { crumb: 'Calendrier Éco · Archive',       key: 'calendrier' },
    'eco-article.html':      { crumb: 'Calendrier Éco · Article',       key: 'calendrier' }
  };
  var cfg = PAGES[path];
  // Repli : toute page éco non listée (eco-*.html) reçoit quand même l'AppShell,
  // rattachée à la branche Calendrier — la barre latérale ne disparaît jamais.
  if (!cfg && /^eco-/.test(path)) cfg = { crumb: 'Calendrier Éco', key: 'calendrier' };
  if (!cfg) return;

  var I = {
    dashboard:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>',
    journal:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 3v18M13 8h3M13 12h3"/></svg>',
    calendrier: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="1.5"/><path d="M4 9h16M8 3v4M16 3v4M9 14h2"/></svg>',
    analyzer:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 14l3-3 2 2 4-4"/></svg>',
    bubble:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="4"/><circle cx="17" cy="15" r="3"/><circle cx="16" cy="6" r="2"/></svg>',
    calc:       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M8 18h6"/></svg>',
    pres:       '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    flash:      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    crypto:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h4.2a2.4 2.4 0 0 1 0 4.8H9.5m0 0h4.6a2.4 2.4 0 0 1 0 4.7H9.5m0-9.5V17m1.8-9.5V6m0 12.5V17m2.4-9.5V6m0 12.5V17"/></svg>',
    hist:       '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    perf:       '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    dot:        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/></svg>'
  };
  var CARET = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  var PRO = '<span class="side__pro-tag">PREMIUM</span>';

  var NAV = [
    { key: 'dashboard', label: 'Accueil', href: './index.html', icon: I.dashboard },
    { key: 'journal', label: 'Journal de Trading', href: './journal.html', icon: I.journal, pro: true },
    { key: 'calendrier', label: 'Calendrier Éco', href: './calendrier.html', icon: I.calendrier, pro: true, children: [
      { label: 'Présentation', href: './eco-edition.html', icon: I.pres, children: [
        { label: 'La sélection', href: './eco-selection.html' },
        { label: 'Europe', href: './eco-europe.html' },
        { label: 'Amériques', href: './eco-ameriques.html' },
        { label: 'Asie', href: './eco-asie.html' },
        { label: 'Marchés', href: './eco-marches.html' },
        { label: 'Institutions', href: './eco-institutions.html' },
        { label: 'International', href: './eco-international.html' }
      ] },
      { label: 'Flash Info', href: './eco-flash.html', icon: I.flash },
      { label: 'Calendrier éco', href: './eco-calendrier.html', icon: I.calendrier },
      { label: 'Crypto', href: './eco-crypto.html', icon: I.crypto },
      { label: 'Archive', href: './eco-archive.html', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M9.5 12h5"/></svg>' }
    ] },
    { key: 'analyzer', label: 'Setup Analyzer', href: './app.html', icon: I.analyzer, pro: true, children: [
      { label: 'Historique', href: './app.html#historique', icon: I.hist },
      { label: 'Perfs', href: './app.html#perfs', icon: I.perf }
    ] },
    { key: 'bubble', label: 'Bubble Map', href: './bubble.html', icon: I.bubble },
    { key: 'calculateur', label: 'Calculateur de Pips', href: './calculateur.html', icon: I.calc }
  ];

  function subTree(items, deep) {
    return '<div class="side__sub' + (deep ? ' side__sub--deep' : '') + '">' + items.map(function (c) {
      if (c.children && c.children.length) {
        return '<div class="side__group">'
          + '<div class="side__row"><a class="side__subitem" href="' + c.href + '"><span class="side__ic">' + (c.icon || I.dot) + '</span>' + c.label + '</a>'
          + '<button class="side__caret" type="button" aria-label="Déplier" data-toggle="1">' + CARET + '</button></div>'
          + subTree(c.children, true) + '</div>';
      }
      return '<a class="side__subitem' + (deep ? ' side__subitem--deep' : '') + '" href="' + c.href + '"><span class="side__ic">' + (c.icon || I.dot) + '</span>' + c.label + '</a>';
    }).join('') + '</div>';
  }

  function buildNav() {
    return NAV.map(function (p) {
      var active = (p.key === cfg.key) ? ' is-active' : '';
      var tag = p.pro ? PRO : '';
      if (p.children && p.children.length) {
        return '<div class="side__group" data-key="' + p.key + '">'
          + '<div class="side__row"><a class="side__item' + active + '" href="' + p.href + '"><span class="side__ic">' + p.icon + '</span><span class="side__lbl">' + p.label + '</span>' + tag + '</a>'
          + '<button class="side__caret" type="button" aria-label="Déplier" data-toggle="1">' + CARET + '</button></div>'
          + subTree(p.children, false) + '</div>';
      }
      return '<a class="side__item' + active + '" href="' + p.href + '"><span class="side__ic">' + p.icon + '</span><span class="side__lbl">' + p.label + '</span>' + tag + '</a>';
    }).join('');
  }

  function buildFooter() {
    var isPro = false, loggedIn = false, email = '';
    try {
      isPro = localStorage.getItem('lt_pro') === '1';
      loggedIn = !!localStorage.getItem('ta_token');
      email = localStorage.getItem('ta_email') || '';
    } catch(e) {}
    // Connecté (et a fortiori PRO) → on remplace la pub PRO par email + déconnexion
    if (loggedIn && isPro) {
      return '<div class="side__pro side__account" id="sideFooter">'
        + (email ? '<p class="side__account-mail" style="font-size:12px;color:var(--text2,#7E8794);word-break:break-all;margin:0 0 10px">' + email + '</p>' : '')
        + '<button class="lt-btn lt-btn--ghost lt-btn--sm" style="width:100%" onclick="(window.ltGlobalLogout?ltGlobalLogout():(window.ltLogout?ltLogout():(localStorage.clear(),location.href=\'./index.html\')))">Déconnexion</button></div>';
    }
    return '<div class="side__pro" id="sideFooter"><h4>Accès Premium</h4><p>Analyses illimitées, journal complet et alertes macro en direct.</p>'
      + '<button class="lt-btn lt-btn--primary lt-btn--sm" style="width:100%" onclick="location.href=\'./tarifs.html\'">Passer Premium</button></div>';
  }

  function buildSideInner() {
    return '<span class="side__label">Outils</span>'
      + buildNav()
      + '<div class="side__spacer"></div>'
      + buildFooter();
  }

  // Vérifie le statut PRO côté serveur (les pages hors analyseur ne le font pas),
  // met à jour lt_pro puis rafraîchit le pied de la barre latérale.
  function refreshProFooter() {
    var token;
    try { token = localStorage.getItem('ta_token'); } catch(e) {}
    if (!token) return;
    fetch('/api/check-pro', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d && d.is_pro) { try { localStorage.setItem('lt_pro', '1'); } catch(e) {} }
        var f = document.getElementById('sideFooter');
        if (f) {
          var tmp = document.createElement('div');
          tmp.innerHTML = buildFooter();
          f.replaceWith(tmp.firstChild);
        }
      }).catch(function(){});
  }

  // ── CSS additionnel (sous-menus au style du design) ──
  if (!document.getElementById('appshell-css')) {
    var st = document.createElement('style');
    st.id = 'appshell-css';
    st.textContent =
      '.side__group{display:flex;flex-direction:column;gap:2px}'
      + '.side__row{display:flex;align-items:center;gap:2px}'
      + '.side__row .side__item,.side__row .side__subitem{flex:1;min-width:0}'
      + '.side__caret{background:transparent;border:none;color:var(--text-muted);cursor:pointer;padding:6px;display:flex;align-items:center;border-radius:8px;transition:transform .25s var(--ease-out),color .15s}'
      + '.side__caret:hover{color:var(--text-title)}'
      + '.side__caret.is-open{transform:rotate(180deg)}'
      + '.side__sub{display:none;flex-direction:column;gap:2px;margin:2px 0 4px 16px;padding-left:8px;border-left:1px solid var(--border-subtle)}'
      + '.side__sub.is-open{display:flex}'
      + '.side__subitem{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r-md,10px);color:var(--text-muted);font-size:13px;border:1px solid transparent;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}'
      + '.side__subitem:hover{background:var(--bg-elevated);color:var(--text-title)}'
      + '.side__subitem.is-active{color:var(--accent)}'
      + '.side__subitem .side__ic{color:var(--text-muted)}'
      + '.side__subitem:hover .side__ic{color:var(--accent)}'
      + '.side__sub--deep{margin-left:12px}'
      + '.side__subitem--deep{font-size:12.5px;padding:6px 10px}'
      // Force la police/interligne du design dans la barre latérale (eco.css impose
      // sinon sa propre police plus large → libellés sur 2 lignes sur les pages éco)
      + '.side, .side__label, .side__item, .side__subitem, .side__pro, .side__pro *{font-family:var(--font-text,"Inter",system-ui,sans-serif);line-height:1.2}'
      + '.side__item, .side__subitem{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      + '.side__item > *, .side__subitem > *{min-width:0}'
      + '.side__ic{flex-shrink:0;display:inline-flex;align-items:center}'
      + '.side__lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      + '.side__pro-tag{margin-left:auto;flex-shrink:0;white-space:nowrap;line-height:1.5;font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.04em;color:#E8C268;background:rgba(232,194,104,.12);border:1px solid rgba(232,194,104,.35);border-radius:50px;padding:3px 8px}'
      + '.side{overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(127,184,232,.35) transparent}'
      + '.side::-webkit-scrollbar{width:8px}'
      + '.side::-webkit-scrollbar-track{background:transparent}'
      + '.side::-webkit-scrollbar-thumb{background:rgba(127,184,232,.28);border-radius:8px;border:2px solid transparent;background-clip:padding-box}'
      + '.side::-webkit-scrollbar-thumb:hover{background:rgba(127,184,232,.5);background-clip:padding-box}'
      // Pages éco : <main class="wrap"> est centré + étroit via eco.css. Une fois
      // intégré dans .app, on le fait se comporter comme .main (pleine largeur,
      // aligné à gauche) pour que le fil d'ariane (.top) couvre toute la largeur
      // comme sur le Journal, et que le contenu reste limité à 1200px à gauche.
      + 'body.eco-page .app > main.wrap{max-width:none;width:auto;margin:0;padding:0 0 56px;display:flex;flex-direction:column;gap:40px;min-width:0}'
      + 'body.eco-page .app > main.wrap > .top{margin:0;width:auto;align-self:stretch}'
      + 'body.eco-page .app > main.wrap > :not(.top){max-width:1200px;width:auto;margin:0 32px;box-sizing:border-box}'
      + 'body.eco-page .app > main.wrap > .pagehead{padding-top:32px}'
      // Le calendrier Investing.com (.calcard) doit s'aligner sur le texte : son
      // fond blanc ne doit pas coller au menu. On retire le padding hérité et on
      // le décale de 32px à gauche (comme le titre/le fil d'ariane).
      + 'body.eco-page .app > main.wrap > .calcard{padding-left:0;padding-right:0;margin-left:32px;margin-right:32px;max-width:1200px;width:auto;box-sizing:border-box}'
      + 'body.eco-page .calcard__frame{width:100%}'
      // Le fil d'ariane est « sticky » : son fond doit être opaque + flouté, sinon
      // le contenu qui défile dessous transparaît (effet de chevauchement).
      + '.top{background:var(--bg-base,#07090C);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}';
    document.head.appendChild(st);
  }

  // ── Retire le ticker de prix (pricetape) des pages d'actus éco : non désiré,
  //    et il décalait l'AppShell vers le bas (mauvaise position de la barre latérale). ──
  Array.prototype.slice.call(document.querySelectorAll('.pricetape')).forEach(function (el) { el.remove(); });

  // ── PART 1 : enveloppe AppShell si absente (pages injectées) ──
  // Conteneur de contenu : .main (nouvelles pages) ou <main> (pages éco)
  var main = document.querySelector('.main') || document.querySelector('main');
  if (main && !document.querySelector('.app > .side') && !document.querySelector('aside.side')) {
    var initials = 'LT';
    try { var em = localStorage.getItem('ta_email') || ''; if (em) initials = em.slice(0, 2).toUpperCase(); } catch (e) {}
    var top = document.createElement('div');
    top.className = 'top';
    top.innerHTML = '<div class="top__crumb"><span>Le Terminal</span><span class="sep">/</span><b>' + cfg.crumb + '</b></div>'
      + '<div class="top__right"><span class="top__status"><span class="lt-dot"></span> Marché ouvert</span>'
      + '<span class="top__avatar">' + initials + '</span></div>';

    var side = document.createElement('aside');
    side.className = 'side';

    var app = document.createElement('div');
    app.className = 'app';
    main.parentNode.insertBefore(app, main);
    app.appendChild(side);
    app.appendChild(main);
    main.insertBefore(top, main.firstChild);

    document.body.style.setProperty('padding-top', '0', 'important');

    // La barre d'onglets Historique/Perfs est désormais redondante avec la barre
    // latérale (Setup Analyzer ▸ Historique / Perfs) → on la masque.
    Array.prototype.slice.call(app.parentNode.children).forEach(function (el) {
      if (el !== app && el.classList && el.classList.contains('analyzer-tabs')) {
        el.style.display = 'none';
      }
    });

    var dock = document.querySelector('nav.lt-dock:not(.lt-dock--mobile-only)');
    if (dock) dock.classList.add('lt-dock--mobile-only');
  }

  // ── PART 2 : remplit la barre latérale (toutes les pages) ──
  var sideEl = document.querySelector('.app > .side, aside.side');
  if (sideEl) {
    sideEl.innerHTML = buildSideInner();
    // déplie la branche de la page courante
    var activeGroup = sideEl.querySelector('.side__group[data-key="' + cfg.key + '"]');
    if (activeGroup) {
      var c0 = activeGroup.querySelector(':scope > .side__row > .side__caret');
      var s0 = activeGroup.querySelector(':scope > .side__sub');
      if (c0) c0.classList.add('is-open');
      if (s0) s0.classList.add('is-open');
    }
    // Déplie toute la chaîne jusqu'à la page active + surligne l'item courant,
    // pour que le menu reste ouvert après navigation (ex: Calendrier ▸ Présentation ▸ Amériques)
    var navLinks = sideEl.querySelectorAll('a.side__item, a.side__subitem');
    Array.prototype.forEach.call(navLinks, function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0].split('/').pop().toLowerCase();
      if (href && href === path) {
        a.classList.add('is-active');
        var el = a.parentElement;
        while (el && el !== sideEl) {
          if (el.classList && el.classList.contains('side__sub')) {
            el.classList.add('is-open');
            var row = el.previousElementSibling;
            if (row) { var car = row.querySelector('.side__caret'); if (car) car.classList.add('is-open'); }
          }
          el = el.parentElement;
        }
      }
    });
    // toggles
    sideEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.side__caret');
      if (!btn) return;
      e.preventDefault();
      var sub = btn.closest('.side__row').nextElementSibling;
      if (sub && sub.classList.contains('side__sub')) {
        sub.classList.toggle('is-open');
        btn.classList.toggle('is-open');
      }
    });
    // Vérifie le PRO côté serveur et met à jour le pied (email + déconnexion)
    refreshProFooter();
  }
})();
