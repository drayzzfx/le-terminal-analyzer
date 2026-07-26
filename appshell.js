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
    '  background: #3B7DFF;' +
    '  box-shadow: 0 0 8px 2px #3B7DFF, 0 0 18px 4px rgba(59, 125, 255,.5);' +
    '  pointer-events: none; transform: translate(-50%,-50%); will-change: transform;' +
    '  transition: opacity .2s, width .15s, height .15s, box-shadow .15s;' +
    '}' +
    '#lt-c.h { width: 14px; height: 14px; box-shadow: 0 0 12px 4px #3B7DFF, 0 0 28px 8px rgba(59, 125, 255,.5); }' +
    '#lt-c.off { opacity: 0; }';
  document.head.appendChild(style);

  var el = document.createElement('div'); el.id = 'lt-c';
  document.body ? document.body.appendChild(el) : document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(el); });

  var cx = 0, cy = 0, raf = null, hov = false;
  function drawCur() { raf = null; el.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)'; }
  document.addEventListener('mousemove', function (e) {
    cx = e.clientX; cy = e.clientY;
    var h = !!(e.target.closest && e.target.closest('a,button,[role="button"],[onclick]'));
    if (h !== hov) { hov = h; el.classList.toggle('h', h); }
    if (!raf) raf = requestAnimationFrame(drawCur);
  }, { passive: true });
  document.addEventListener('mouseleave', function () { el.classList.add('off'); });
  document.addEventListener('mouseenter', function () { el.classList.remove('off'); });
})();
/* ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  // URLs propres (cleanUrls) : /journal, /tarifs… n'ont plus de .html → on le
  // rétablit pour le matching interne (PAGES, item actif, traceur d'usage).
  if (path && path.indexOf('.') === -1) path += '.html';

  // ── Traceur d'usage local (privé, jamais envoyé) : alimente « Où vous passez
  // votre temps » dans l'Espace Compte. Compte les visites et le temps actif par outil.
  (function trackUsage(){
    try{
      var TOOLS = {
        'app.html':'Setup Analyzer','journal.html':'Journal','calendrier.html':'Calendrier Éco',
        'bubble.html':'Bubble Map','calculateur.html':'Calculateur de Pips','mur-des-trades.html':'Mur des Trades',
        'patrimoine.html':'Patrimoine','patrimoine-presentation.html':'Patrimoine','patrimoine-plan.html':'Patrimoine'
      };
      var tool = TOOLS[path] || (/^eco-/.test(path) ? 'Calendrier Éco' : null);
      if(!tool) return;
      var KEY='lt_usage';
      function read(){ try{ return JSON.parse(localStorage.getItem(KEY)||'{}')||{}; }catch(e){ return {}; } }
      var u=read(); if(!u[tool]) u[tool]={ms:0,visits:0};
      u[tool].visits++; u[tool].last=new Date().toISOString();
      try{ localStorage.setItem(KEY, JSON.stringify(u)); }catch(e){}
      var t0=Date.now(), active=true;
      function flush(){
        var dt = active ? (Date.now()-t0) : 0; t0=Date.now();
        if(dt<=0 || dt>1000*60*60) return; // ignore négatif / onglet laissé ouvert > 1 h
        var uu=read(); if(!uu[tool]) uu[tool]={ms:0,visits:0};
        uu[tool].ms=(uu[tool].ms||0)+dt;
        try{ localStorage.setItem(KEY, JSON.stringify(uu)); }catch(e){}
      }
      document.addEventListener('visibilitychange', function(){ if(document.hidden){ flush(); active=false; } else { t0=Date.now(); active=true; } });
      window.addEventListener('pagehide', flush);
    }catch(e){}
  })();

  var PAGES = {
    'journal.html':     { crumb: 'Journal de Trading',  key: 'journal' },
    'calendrier.html':  { crumb: 'Calendrier Éco',      key: 'calendrier' },
    'app.html':         { crumb: 'Setup Analyzer',      key: 'analyzer' },
    'bubble.html':      { crumb: 'Bubble Map',          key: 'bubble' },
    'calculateur.html': { crumb: 'Calculateur de Pips', key: 'calculateur' },
    'mur-des-trades.html': { crumb: 'Mur des Trades',   key: 'trades' },
    'patrimoine.html':            { crumb: 'Patrimoine · Portefeuille',   key: 'patrimoine' },
    'patrimoine-presentation.html': { crumb: 'Patrimoine · Présentation', key: 'patrimoine' },
    'journal-presentation.html':    { crumb: 'Journal · Présentation',       key: 'journal' },
    'calendrier-presentation.html': { crumb: 'Calendrier Éco · Présentation', key: 'calendrier' },
    'analyzer-presentation.html':   { crumb: 'Setup Analyzer · Présentation', key: 'analyzer' },
    'patrimoine-plan.html':       { crumb: 'Patrimoine · Plan',           key: 'patrimoine' },
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
    'profil.html':           { crumb: 'Mon compte',                     key: 'profil' },
    'compte.html':           { crumb: 'Mon compte',                     key: 'profil' },
    'eco-article.html':      { crumb: 'Calendrier Éco · Article',       key: 'calendrier' },
    // Pages « marketing » : pas de barre latérale ni de fil d'ariane (on préserve
    // leur mise en page). On n'y ajoute QUE la barre mobile (hamburger + nouveau
    // tiroir de navigation), pour remplacer l'ancien menu « Le Terminal Hub ».
    'index.html':            { crumb: 'Accueil', key: 'dashboard', chromeOnly: true },
    'tarifs.html':           { crumb: 'Tarifs',  key: 'dashboard', chromeOnly: true },
    'avis.html':             { crumb: 'Avis',    key: 'dashboard', chromeOnly: true }
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
    { key: 'journal', label: 'Journal de Trading', href: './journal-presentation.html', icon: I.journal, pro: true, children: [
      { label: 'Présentation', href: './journal-presentation.html', icon: I.pres },
      { label: 'Ouvrir le journal', href: './journal.html', icon: I.journal }
    ] },
    { key: 'analyzer', label: 'Setup Analyzer', href: './analyzer-presentation.html', icon: I.analyzer, pro: true, children: [
      { label: 'Présentation', href: './analyzer-presentation.html', icon: I.pres },
      { label: 'Historique', href: './app.html#historique', icon: I.hist },
      { label: 'Perfs', href: './app.html#perfs', icon: I.perf }
    ] },
    { key: 'patrimoine', label: 'Patrimoine', href: './patrimoine-presentation.html', pro: true, icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/></svg>', children: [
      { label: 'Présentation', href: './patrimoine-presentation.html', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>' },
      { label: 'Portefeuille', href: './patrimoine.html', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></svg>' }
    ] },
    { key: 'calendrier', label: 'Calendrier Éco', href: './calendrier-presentation.html', icon: I.calendrier, pro: true, children: [
      { label: 'Présentation', href: './calendrier-presentation.html', icon: I.pres },
      { label: 'Édition du jour', href: './eco-edition.html', icon: I.pres, children: [
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
    { key: 'bubble', label: 'Bubble Map', href: './bubble.html', icon: I.bubble },
    { key: 'calculateur', label: 'Calculateur de Pips', href: './calculateur.html', icon: I.calc },
    { key: 'trades', label: 'Mur des Trades', href: './mur-des-trades.html', icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M5 6H3v1.5A3 3 0 0 0 6 10.5M19 6h2v1.5a3 3 0 0 1-3 3"/></svg>' }
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
    var isPro = false, loggedIn = false, email = '', pseudo = '', avatar = '';
    try {
      isPro = localStorage.getItem('lt_pro') === '1';
      loggedIn = !!localStorage.getItem('ta_token');
      email = localStorage.getItem('ta_email') || '';
      pseudo = localStorage.getItem('lt_pseudo') || '';
      avatar = localStorage.getItem('lt_avatar') || '';
    } catch(e) {}
    if (loggedIn && isPro) {
      var displayName = pseudo || (email ? email.split('@')[0] : 'Mon compte');
      var initial = (displayName.charAt(0) || '?').toUpperCase();
      var av = avatar
        ? '<img src="' + avatar + '" alt="" style="width:34px;height:34px;border-radius:8px;object-fit:cover;flex-shrink:0">'
        : '<span style="width:34px;height:34px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0095FF,#38B6FF);color:#fff;font-family:var(--font-display,\'Anton\',sans-serif);font-size:15px">' + initial + '</span>';
      return '<div class="side__pro side__account" id="sideFooter">'
        + '<a class="side__acct" href="./compte.html" title="Mon compte">' + av
        + '<div class="side__acct-txt"><span class="side__acct-name">' + displayName + '</span>'
        + (email ? '<span class="side__acct-mail">' + email + '</span>' : '') + '</div></a>'
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

  // ── Contrôle Premium MUTUALISÉ + garde-fou NON DESTRUCTIF ──
  // Une seule requête /api/check-pro par chargement de page : la promesse est mise
  // en cache dans window._ltProPromise et partagée entre tous les appelants (pied
  // de la barre latérale appelé plusieurs fois, journal.html…), au lieu d'un appel
  // /api/check-pro dupliqué par script.
  // Garde-fou : seul un verdict serveur SAIN (HTTP 2xx) peut poser (is_pro=true) ou
  // retirer (is_pro=false) lt_pro. Sur erreur réseau/HTTP, on conserve le cache —
  // un aléa transitoire ne doit jamais « déclasser » un abonné Premium.
  function ltReadPro() { try { return localStorage.getItem('lt_pro') === '1'; } catch(e) { return false; } }
  window.ltRefreshPro = function () {
    if (window._ltProPromise) return window._ltProPromise;
    var token;
    try { token = localStorage.getItem('ta_token'); } catch(e) {}
    if (!token) return Promise.resolve(ltReadPro());
    window._ltProPromise = fetch('/api/check-pro', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } })
      .then(function(r){ if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function(d){
        if (d && d.is_pro) { try { localStorage.setItem('lt_pro', '1'); } catch(e) {} return true; }
        try { localStorage.removeItem('lt_pro'); } catch(e) {} // verdict serveur explicite : non-pro
        return false;
      })
      .catch(function(){ return ltReadPro(); }); // garde-fou : réseau/HTTP KO → on garde le cache
    return window._ltProPromise;
  };

  // Vérifie le statut PRO côté serveur via le contrôle mutualisé, puis rafraîchit
  // le pied de la barre latérale à partir du cache mis à jour.
  function refreshProFooter() {
    var token;
    try { token = localStorage.getItem('ta_token'); } catch(e) {}
    if (!token) return;
    window.ltRefreshPro().then(function(){
      var f = document.getElementById('sideFooter');
      if (f) {
        var tmp = document.createElement('div');
        tmp.innerHTML = buildFooter();
        f.replaceWith(tmp.firstChild);
      }
    }).catch(function(){});
  }

  // Reconstruit le pied de la barre latérale / du tiroir À PARTIR du cache local
  // (sans appel réseau). Appelé par menu.js après une synchro de compte pour
  // refléter immédiatement Premium / pseudo / avatar sans recharger la page.
  window.ltRebuildAppFooter = function () {
    var nodes = document.querySelectorAll('#sideFooter');
    Array.prototype.forEach.call(nodes, function (f) {
      var tmp = document.createElement('div');
      tmp.innerHTML = buildFooter();
      if (tmp.firstChild) f.replaceWith(tmp.firstChild);
    });
  };

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
      + '.side__acct{display:flex;align-items:center;gap:10px;margin-bottom:12px;min-width:0}'
      + '.side__acct-txt{display:flex;flex-direction:column;min-width:0}'
      + '.side__acct-name{font-family:var(--font-display,"Anton",sans-serif);text-transform:uppercase;letter-spacing:.02em;font-size:14px;color:var(--text-title,#F2F4F7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      + '.side__acct-mail{font-family:var(--font-text,"Inter",sans-serif);font-size:11px;color:var(--text-muted,#7E8794);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      // Force la police/interligne du design dans la barre latérale (eco.css impose
      // sinon sa propre police plus large → libellés sur 2 lignes sur les pages éco)
      + '.side, .side__label, .side__item, .side__subitem, .side__pro, .side__pro *{font-family:var(--font-text,"Inter",system-ui,sans-serif);line-height:1.2}'
      + '.side__item, .side__subitem{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      + '.side__item > *, .side__subitem > *{min-width:0}'
      + '.side__ic{flex-shrink:0;display:inline-flex;align-items:center}'
      + '.side__lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      + '.side__pro-tag{margin-left:auto;flex-shrink:0;white-space:nowrap;line-height:1.5;font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.04em;color:#E8C268;background:rgba(232,194,104,.12);border:1px solid rgba(232,194,104,.35);border-radius:50px;padding:3px 8px}'
      + '.side{overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(59, 125, 255,.35) transparent}'
      + '.side::-webkit-scrollbar{width:8px}'
      + '.side::-webkit-scrollbar-track{background:transparent}'
      + '.side::-webkit-scrollbar-thumb{background:rgba(59, 125, 255,.28);border-radius:8px;border:2px solid transparent;background-clip:padding-box}'
      + '.side::-webkit-scrollbar-thumb:hover{background:rgba(59, 125, 255,.5);background-clip:padding-box}'
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
      + '.top{background:var(--bg-base,#04060B);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}'
      // ── Mobile / iPad (≤880px) : hamburger + tiroir de navigation complet ──
      + '.lt-burger{display:none}.lt-mnav,.lt-mnav__bd{display:none}'
      + '@media (max-width:880px){'
      +   'body{overflow-x:hidden}'
      +   '.lt-burger{display:inline-flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;width:38px;height:38px;margin-right:10px;background:transparent;border:1px solid var(--border-subtle);border-radius:var(--r-md,6px);cursor:pointer;flex-shrink:0;padding:0}'
      +   '.lt-burger span{display:block;width:17px;height:1.6px;background:var(--text-body);border-radius:2px}'
      +   '.lt-mnav__bd{display:block;position:fixed;inset:0;z-index:1400;background:rgba(4, 6, 11,.6);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}'
      +   '.lt-mnav__bd.is-open{opacity:1;visibility:visible}'
      +   '.lt-mnav{display:block;position:fixed;top:0;left:0;bottom:0;z-index:1401;width:min(84vw,300px);background:linear-gradient(180deg,var(--bg-surface),var(--bg-base));border-right:1px solid var(--border-subtle);box-shadow:0 0 60px rgba(0,0,0,.6);transform:translateX(-100%);transition:transform .3s cubic-bezier(.16,1,.3,1);overflow-y:auto;-webkit-overflow-scrolling:touch}'
      +   '.lt-mnav.is-open{transform:none}'
      +   '.lt-mnav__inner{padding:16px 12px calc(24px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:8px}'
      + '}'
      // Pages marketing (.lt-nav--mobilebar) : sur mobile/iPad on ne garde QUE le
      // logo (la marque) centré — le mot « LE TERMINAL » est masqué. Compte/connexion
      // à droite.
      + '@media (max-width:860px){'
      +   '.lt-nav--mobilebar{position:relative}'
      +   '.lt-nav--mobilebar .lt-nav__brand{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);margin:0;z-index:1}'
      +   '.lt-nav--mobilebar .lt-nav__word{display:none!important}'
      +   '.lt-nav--mobilebar .lt-nav__mark svg{width:24px;height:24px}'
      +   '.lt-nav--mobilebar .lt-nav__actions{position:relative;z-index:2}'
      + '}';
    document.head.appendChild(st);
  }

  // ── Retire le ticker de prix (pricetape) des pages d'actus éco : non désiré,
  //    et il décalait l'AppShell vers le bas (mauvaise position de la barre latérale). ──
  Array.prototype.slice.call(document.querySelectorAll('.pricetape')).forEach(function (el) { el.remove(); });

  // ── Statut des marchés EN DIRECT (badge cliquable du fil d'ariane) ──
  function topRightHTML(){
    // Avatar/initiales du compte retirés volontairement du fil d'ariane.
    return '<div class="top__right">'
      + '<div class="mkt" id="mktWrap">'
      +   '<button class="top__status" id="mktStatus" type="button" aria-haspopup="true" aria-expanded="false">'
      +     '<span class="lt-dot" id="mktDot"></span><span id="mktLbl" data-en="Market open">Marché ouvert</span>'
      +     '<svg class="mkt__c" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
      +   '</button>'
      +   '<div class="mkt-pop" id="mktPop" hidden></div>'
      + '</div>'
      + '</div>';
  }
  function tzParts(tz){
    try{
      var p = new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
      var o={}; p.forEach(function(x){ o[x.type]=x.value; });
      var wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
      return { day:wd[o.weekday], min:(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10) };
    }catch(e){ return null; }
  }
  function inSess(p,oH,oM,cH,cM){ if(!p||p.day<1||p.day>5) return false; var t=p.min; return t>=oH*60+oM && t<cH*60+cM; }
  function computeMarkets(){
    var now=new Date(), uDay=now.getUTCDay(), uMin=now.getUTCHours()*60+now.getUTCMinutes();
    // Forex : ouvre dimanche 21:00 UTC, ferme vendredi 21:00 UTC
    var fx = (uDay===0 && uMin>=21*60) || (uDay>=1 && uDay<=4) || (uDay===5 && uMin<21*60);
    return {
      open: fx, // l'état « marché » de référence suit le Forex (marché phare du trading)
      list:[
        { n:'Forex',          en:'Forex',         open:fx,                                      h:'Dim. 21:00 → Ven. 21:00 UTC' },
        { n:'Actions US',     en:'US stocks',     open:inSess(tzParts('America/New_York'),9,30,16,0), h:'9:30–16:00 ET' },
        { n:'Actions Europe', en:'EU stocks',     open:inSess(tzParts('Europe/Paris'),9,0,17,30),     h:'9:00–17:30 CET' },
        { n:'Actions Asie',   en:'Asia stocks',   open:inSess(tzParts('Asia/Tokyo'),9,0,15,0),         h:'9:00–15:00 JST' },
        { n:'Crypto',         en:'Crypto',        open:true,                                    h:'24h/24 · 7j/7' }
      ]
    };
  }
  function refreshMkt(){
    var btn=document.getElementById('mktStatus'); if(!btn) return;
    var en=(localStorage.getItem('lt_lang')==='en'), m=computeMarkets();
    btn.classList.toggle('mkt--closed', !m.open);
    var lbl=document.getElementById('mktLbl');
    if(lbl){ lbl.setAttribute('data-en', m.open?'Market open':'Market closed'); lbl.textContent = en ? (m.open?'Market open':'Market closed') : (m.open?'Marché ouvert':'Marché fermé'); }
    var pop=document.getElementById('mktPop');
    if(pop){
      pop.innerHTML = '<div class="mkt-pop__h" data-en="Markets status">Statut des marchés</div>'
        + m.list.map(function(x){
            var st = x.open ? (en?'Open':'Ouvert') : (en?'Closed':'Fermé');
            return '<div class="mkt-row"><span class="mkt-row__dot '+(x.open?'on':'off')+'"></span>'
              + '<span class="mkt-row__txt"><span class="mkt-row__n">'+(en?x.en:x.n)+'</span><span class="mkt-row__h">'+x.h+'</span></span>'
              + '<span class="mkt-row__s '+(x.open?'on':'off')+'">'+st+'</span></div>';
          }).join('')
        + '<div class="mkt-pop__f" data-en="Local time · indicative">Heure locale · indicatif</div>';
    }
  }
  function injectMktCss(){
    if(document.getElementById('ltMktCss')) return;
    var s=document.createElement('style'); s.id='ltMktCss';
    s.textContent =
      '.top__status{display:inline-flex;align-items:center;gap:7px;cursor:pointer;background:transparent;border:1px solid var(--border-subtle,#1C212A);border-radius:50px;padding:5px 11px;color:var(--text-body,#C3CAD4);font-family:var(--font-text,"Inter",sans-serif);font-size:12px;font-weight:600;letter-spacing:.02em;transition:border-color .15s,color .15s}'
      + '.top__status:hover{border-color:var(--border,#3A414C);color:var(--text-title,#F2F4F7)}'
      + '.top__status .mkt__c{opacity:.55}'
      + '.top__status.mkt--closed{color:var(--text-muted,#7E8794)}'
      + '.top__status.mkt--closed .lt-dot{background:var(--bear,#F0647A);box-shadow:0 0 0 3px rgba(240,100,122,.18)}'
      + '.mkt{position:relative;display:inline-flex}'
      + '.mkt-pop{position:absolute;top:calc(100% + 8px);right:0;z-index:60;width:min(252px,82vw);background:var(--bg-elevated,#101724);border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-md,6px);box-shadow:0 18px 48px rgba(0,0,0,.55);padding:12px 13px;animation:mktPop .18s cubic-bezier(.16,1,.3,1)}'
      + '@keyframes mktPop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}'
      + '.mkt-pop__h{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted,#7E8794);margin-bottom:8px}'
      + '.mkt-row{display:flex;align-items:center;gap:9px;padding:8px 0;border-top:1px solid var(--border-subtle,#1C212A)}'
      + '.mkt-row:first-of-type{border-top:none}'
      + '.mkt-row__dot{width:8px;height:8px;border-radius:50%;flex:none}'
      + '.mkt-row__dot.on{background:var(--bull,#4ADE9C);box-shadow:0 0 7px rgba(74,222,156,.7)}'
      + '.mkt-row__dot.off{background:var(--bear,#F0647A)}'
      + '.mkt-row__txt{flex:1;min-width:0;display:flex;flex-direction:column}'
      + '.mkt-row__n{font-size:12.5px;color:var(--text-title,#F2F4F7);font-weight:600;line-height:1.2}'
      + '.mkt-row__h{font-size:10px;color:var(--text-muted,#7E8794);font-family:var(--font-mono,"JetBrains Mono",monospace);margin-top:2px}'
      + '.mkt-row__s{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}'
      + '.mkt-row__s.on{color:var(--bull,#4ADE9C)}.mkt-row__s.off{color:var(--bear,#F0647A)}'
      + '.mkt-pop__f{margin-top:9px;padding-top:9px;border-top:1px solid var(--border-subtle,#1C212A);font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted,#7E8794)}'
      + 'a.side__acct{cursor:pointer;text-decoration:none;border-radius:var(--r-md,8px);transition:background .15s}'
      + 'a.side__acct:hover{background:var(--bg-elevated,#101724)}';
    document.head.appendChild(s);
  }
  function initMarketStatus(){
    injectMktCss(); refreshMkt();
    if(window._ltMktWired) return; window._ltMktWired=true;
    var btn=document.getElementById('mktStatus'), pop=document.getElementById('mktPop'), wrap=document.getElementById('mktWrap');
    if(!btn||!pop) return;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var willOpen = pop.hasAttribute('hidden');
      if(willOpen){ refreshMkt(); pop.removeAttribute('hidden'); btn.setAttribute('aria-expanded','true'); }
      else { pop.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); }
    });
    document.addEventListener('click', function(e){ if(wrap && !wrap.contains(e.target)){ pop.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); } });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ pop.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); } });
    setInterval(refreshMkt, 30000);
  }

  // ── Tiroir de navigation mobile (hamburger + panneau « OUTILS » + carte compte) ──
  // Construit à partir de buildSideInner(). Utilisé tel quel sur les pages marketing
  // (chromeOnly) et — via le clone de la barre latérale — sur les pages outils.
  function buildMobileDrawer(navEl, innerHTML) {
    if (!navEl || document.querySelector('.lt-mnav')) return;
    var burger = document.createElement('button');
    burger.className = 'lt-burger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    burger.innerHTML = '<span></span><span></span><span></span>';
    navEl.insertBefore(burger, navEl.firstChild);
    navEl.classList.add('lt-nav--mobilebar');

    var bd = document.createElement('div'); bd.className = 'lt-mnav__bd';
    var drawer = document.createElement('aside'); drawer.className = 'lt-mnav';
    drawer.setAttribute('aria-label', 'Navigation');
    drawer.innerHTML = '<div class="lt-mnav__inner">' + innerHTML + '</div>';
    document.body.appendChild(bd);
    document.body.appendChild(drawer);

    var close = function () { drawer.classList.remove('is-open'); bd.classList.remove('is-open'); };
    burger.addEventListener('click', function () { drawer.classList.add('is-open'); bd.classList.add('is-open'); });
    bd.addEventListener('click', close);
    drawer.addEventListener('click', function (e) {
      var car = e.target.closest('.side__caret');
      if (car) {
        e.preventDefault();
        var sub = car.closest('.side__row').nextElementSibling;
        if (sub && sub.classList.contains('side__sub')) { sub.classList.toggle('is-open'); car.classList.toggle('is-open'); }
        return;
      }
      if (e.target.closest('a.side__item, a.side__subitem')) close();
    });
    return drawer;
  }

  // ── Pages marketing (accueil, tarifs, avis) : on NE touche PAS à la mise en page
  // (pas de barre latérale ni de fil d'ariane). On injecte uniquement la barre mobile
  // (hamburger + nouveau tiroir), qui remplace l'ancien menu « Le Terminal Hub ».
  if (cfg.chromeOnly) {
    injectMktCss(); // styles .side__acct (carte compte du pied)
    buildMobileDrawer(document.querySelector('.lt-nav'), buildSideInner());
    refreshProFooter(); // reflète le statut Premium dans le pied du tiroir
    return;
  }

  // ── PART 1 : enveloppe AppShell si absente (pages injectées) ──
  // Conteneur de contenu : .main (nouvelles pages) ou <main> (pages éco)
  var main = document.querySelector('.main') || document.querySelector('main');
  if (main && !document.querySelector('.app > .side') && !document.querySelector('aside.side')) {
    var initials = 'LT';
    try { var em = localStorage.getItem('ta_email') || ''; if (em) initials = em.slice(0, 2).toUpperCase(); } catch (e) {}
    var top = document.createElement('div');
    top.className = 'top';
    top.innerHTML = '<div class="top__crumb"><span>Le Terminal</span><span class="sep">/</span><b>' + cfg.crumb + '</b></div>' + topRightHTML(initials);

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
  }

  // Homogénéise le fil d'ariane sur TOUTES les pages : même structure + avatar
  // dynamique (initiales du compte). Corrige les pages à .top statique (ex.
  // calculateur affichait « TR » en dur au lieu des initiales réelles).
  var _topEl = document.querySelector('.top');
  if (_topEl) {
    var _em = ''; try { _em = localStorage.getItem('ta_email') || ''; } catch (e) {}
    var _ini = _em ? _em.slice(0, 2).toUpperCase() : 'LT';
    _topEl.innerHTML = '<div class="top__crumb"><span>Le Terminal</span><span class="sep">/</span><b>' + cfg.crumb + '</b></div>' + topRightHTML(_ini);
  }
  // Active le statut des marchés en direct (sur toute page dotée du fil d'ariane)
  if (document.querySelector('.top')) initMarketStatus();

  // Masque le dock d'icônes de l'accueil sur toute page à appshell (desktop),
  // y compris si la coquille .app est statique (ex. calculateur).
  var _dock = document.querySelector('nav.lt-dock:not(.lt-dock--mobile-only)');
  if (_dock) _dock.classList.add('lt-dock--mobile-only');
  // Si la page n'a pas de dock, on l'injecte (barre du bas mobile) pour que TOUTES
  // les pages aient l'accès rapide aux outils (Patrimoine, Calendrier éco, etc.).
  if (!document.querySelector('nav.lt-dock')) {
    var _shortLbl = { dashboard:'Accueil', journal:'Journal', analyzer:'Analyzer', patrimoine:'Patrim.', calendrier:'Éco', bubble:'Bubble', calculateur:'Pips', trades:'Trades' };
    var _dockHTML = '<nav class="lt-dock lt-dock--mobile-only" aria-label="Pages">' + NAV.map(function (p) {
      return '<a class="lt-dock__item' + (p.key === cfg.key ? ' is-active' : '') + '" href="' + p.href + '">' + p.icon + '<span class="lt-dock__lbl">' + (_shortLbl[p.key] || p.label) + '</span></a>';
    }).join('') + '</nav>';
    document.body.insertAdjacentHTML('beforeend', _dockHTML);
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

    // ── Mobile / iPad (≤880px) : tiroir de navigation complet ──
    // Le menu hiérarchique (barre Outils, sous-pages éco incluses) n'est pas
    // accessible sous 880px (sidebar masquée). On clone la navigation dans un
    // tiroir ouvert par un hamburger placé dans le fil d'ariane.
    var _nav = document.querySelector('.lt-nav');
    if (_nav && !document.querySelector('.lt-mnav')) {
      var burger = document.createElement('button');
      burger.className = 'lt-burger';
      burger.type = 'button';
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      burger.innerHTML = '<span></span><span></span><span></span>';
      _nav.insertBefore(burger, _nav.firstChild);

      var bd = document.createElement('div'); bd.className = 'lt-mnav__bd';
      var drawer = document.createElement('aside'); drawer.className = 'lt-mnav';
      drawer.setAttribute('aria-label', 'Navigation');
      drawer.innerHTML = '<div class="lt-mnav__inner">' + sideEl.innerHTML + '</div>';
      document.body.appendChild(bd);
      document.body.appendChild(drawer);

      var mnavClose = function () { drawer.classList.remove('is-open'); bd.classList.remove('is-open'); };
      burger.addEventListener('click', function () { drawer.classList.add('is-open'); bd.classList.add('is-open'); });
      bd.addEventListener('click', mnavClose);
      drawer.addEventListener('click', function (e) {
        var car = e.target.closest('.side__caret');
        if (car) {
          e.preventDefault();
          var sub = car.closest('.side__row').nextElementSibling;
          if (sub && sub.classList.contains('side__sub')) { sub.classList.toggle('is-open'); car.classList.toggle('is-open'); }
          return;
        }
        if (e.target.closest('a.side__item, a.side__subitem')) mnavClose();
      });
    }
  }
})();
