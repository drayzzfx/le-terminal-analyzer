// ── LE TERMINAL · MENU LATERAL GLOBAL ──
// Inclure ce fichier dans toutes les pages du site

(function() {

  // Détecte la page active
  var page = window.location.pathname.split('/').pop() || 'index.html';

  var ICONS = {
    dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    journal:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    calendrier:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="14" r=".8" fill="currentColor"/><circle cx="12" cy="14" r=".8" fill="currentColor"/><circle cx="16" cy="14" r=".8" fill="currentColor"/></svg>`,
    analyzer:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    bubble:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="7" r="2"/><circle cx="19" cy="7" r="2.5"/><circle cx="6" cy="17" r="1.5"/><circle cx="18" cy="16" r="2"/></svg>`,
    calc:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/></svg>`,
  };

  var PAGES = [
    { id: 'index.html',       icon: ICONS.dashboard,  label: 'Dashboard',           href: './index.html' },
    { id: 'journal.html',     icon: ICONS.journal,    label: 'Journal de Trading',  href: './journal.html' },
    { id: 'calendrier.html',  icon: ICONS.calendrier, label: 'Calendrier Éco',      href: './eco-edition.html', children: [
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`, label: 'Présentation', href: './eco-edition.html', children: [
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, label: 'La sélection',  href: './eco-selection.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7.2a6.3 6.3 0 1 0 0 9.6"/><path d="M4.5 10.5h9M4.5 13.5h9"/></svg>`, label: 'Europe',        href: './eco-europe.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>`, label: 'Amériques',     href: './eco-ameriques.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5l5 7 5-7"/><path d="M12 11.5V20"/><path d="M8 13.5h8"/></svg>`, label: 'Asie',          href: './eco-asie.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label: 'Marchés',       href: './eco-marches.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5 12 4l8.5 5.5"/><path d="M5.5 10v8M9.5 10v8M14.5 10v8M18.5 10v8"/><path d="M3 20.5h18"/></svg>`, label: 'Institutions',  href: './eco-institutions.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`, label: 'International',  href: './eco-international.html' },
      ] },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`, label: 'Flash Info',      href: './eco-flash.html' },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="14" r=".8" fill="currentColor"/><circle cx="12" cy="14" r=".8" fill="currentColor"/><circle cx="16" cy="14" r=".8" fill="currentColor"/></svg>`, label: 'Calendrier éco',  href: './eco-calendrier.html' },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h4.2a2.4 2.4 0 0 1 0 4.8H9.5m0 0h4.6a2.4 2.4 0 0 1 0 4.7H9.5m0-9.5V17m1.8-9.5V6m0 12.5V17m2.4-9.5V6m0 12.5V17"/></svg>`, label: 'Crypto',          href: './eco-crypto.html' },
    ] },
    { id: 'app.html',         icon: ICONS.analyzer,   label: 'Setup Analyzer',      href: './app.html', children: [
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`, label: 'Historique', href: './app.html#historique' },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label: 'Perfs', href: './app.html#perfs' },
    ] },
    { id: 'bubble.html',      icon: ICONS.bubble,     label: 'Bubble Map',          href: './bubble.html' },
    { id: 'calculateur.html', icon: ICONS.calc,       label: 'Calculateur de Pips', href: './calculateur.html' },
  ];

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent = `
    /* overlay supprimé — mode push */
    .lt-menu-overlay { display: none; }

    .lt-side-menu {
      position: fixed; top: 0; left: 0; bottom: 0; width: 280px;
      background: #0D0D1A; border-right: 1px solid rgba(255,255,255,.08);
      z-index: 999; transform: translateX(-100%);
      transition: transform .35s cubic-bezier(.2,0,.1,1);
      display: flex; flex-direction: column; overflow: hidden;
    }
    .lt-side-menu.open { transform: translateX(0); }

    /* Push : tout le contenu se décale, les topbars sticky suivent automatiquement */
    body {
      transition: margin-left .35s cubic-bezier(.2,0,.1,1);
    }
    body.lt-menu-open {
      margin-left: 280px;
    }

    .lt-menu-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px; border-bottom: 1px solid rgba(255,255,255,.08);
      flex-shrink: 0;
    }
    .lt-menu-brand {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-size: 16px; font-weight: 800; color: #F0EEFF;
    }
    .lt-menu-brand span { color: #38B6FF; }
    .lt-menu-close {
      background: transparent; border: none; color: #5A5570;
      font-size: 20px; cursor: pointer; line-height: 1;
      padding: 4px 6px; border-radius: 6px; transition: all .2s;
    }
    .lt-menu-close:hover { color: #F0EEFF; background: rgba(255,255,255,.06); }

    .lt-menu-nav { padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }

    .lt-nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 14px; border-radius: 10px;
      cursor: pointer; transition: all .2s;
      text-decoration: none; color: #9B96B8;
      font-family: 'Bricolage Grotesque', sans-serif;
      font-size: 14px; font-weight: 600;
      border: none; background: transparent; width: 100%; text-align: left;
    }
    .lt-nav-item:hover { background: rgba(0,149,255,.1); color: #38B6FF; }
    .lt-nav-item.active {
      background: rgba(0,149,255,.15); color: #38B6FF;
      border: 1px solid rgba(0,149,255,.25);
    }
    .lt-nav-item.soon { opacity: .45; cursor: not-allowed; pointer-events: none; }
    .lt-nav-icon { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; opacity: .7; }
    .lt-nav-item:hover .lt-nav-icon, .lt-nav-item.active .lt-nav-icon { opacity: 1; }
    .lt-nav-soon {
      margin-left: auto; font-size: 9px; font-weight: 700;
      letter-spacing: .1em; color: #5A5570;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06);
      border-radius: 50px; padding: 2px 8px;
    }
    .lt-menu-divider { height: 1px; background: rgba(255,255,255,.06); margin: 6px 0; }

    /* ── Menu déroulant (Calendrier Éco) ── */
    .lt-nav-group { display: flex; flex-direction: column; }
    .lt-nav-row { display: flex; align-items: center; gap: 4px; }
    .lt-nav-row .lt-nav-item { flex: 1; }
    .lt-nav-caret {
      background: transparent; border: none; cursor: pointer;
      color: #9B96B8; padding: 8px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      transition: all .2s; flex-shrink: 0;
    }
    .lt-nav-caret:hover { background: rgba(0,149,255,.1); color: #38B6FF; }
    .lt-nav-caret svg { transition: transform .25s cubic-bezier(.2,0,.1,1); }
    .lt-nav-caret:hover svg { transform: rotate(-180deg); }
    .lt-nav-caret.open svg { transform: rotate(180deg); }
    .lt-nav-caret.open:hover svg { transform: rotate(180deg); }

    .lt-subnav {
      display: grid; grid-template-rows: 0fr;
      transition: grid-template-rows .3s cubic-bezier(.2,0,.1,1);
      margin-left: 14px; padding-left: 12px;
      border-left: 1px solid rgba(0,149,255,.18);
    }
    .lt-subnav > div { overflow: hidden; }
    .lt-subnav.open { grid-template-rows: 1fr; }
    .lt-subnav--deep {
      margin-left: 10px; padding-left: 10px;
      border-left: 1px solid rgba(0,149,255,.1);
    }
    .lt-subnav-group { display: flex; flex-direction: column; }
    .lt-subnav-row { display: flex; align-items: center; }
    .lt-subnav-row .lt-subnav-item { flex: 1; }
    .lt-nav-caret--sub { padding: 4px; min-width: 24px; }
    .lt-subnav-item--deep { padding: 7px 10px; font-size: 12px; opacity: .85; }

    /* ── USER BAR ── */
    #ltUserBar { display: flex; align-items: center; gap: 8px; }
    .lt-ub-pro { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: rgba(250,204,21,.12); border: 1px solid rgba(250,204,21,.3); border-radius: 50px; color: #FACC15; font-family: 'Bricolage Grotesque', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .06em; }
    .lt-ub-chip { display: flex; align-items: center; gap: 6px; padding: 4px 12px 4px 4px; border-radius: 50px; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.04); }
    .lt-ub-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg,#0095FF,#38B6FF); display: flex; align-items: center; justify-content: center; font-family: 'Bricolage Grotesque', sans-serif; font-size: 12px; font-weight: 700; color: #fff; }
    .lt-ub-name { font-family: 'Bricolage Grotesque', sans-serif; font-size: 12px; font-weight: 600; color: #F0EEFF; }
    .lt-ub-logout { padding: 5px 13px; background: transparent; border: 1px solid rgba(248,113,113,.3); border-radius: 50px; color: #F87171; font-family: 'Bricolage Grotesque', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; }
    .lt-ub-logout:hover { background: rgba(248,113,113,.1); }

    .lt-subnav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 8px;
      text-decoration: none; color: #9B96B8;
      font-family: 'Bricolage Grotesque', sans-serif;
      font-size: 13px; font-weight: 600;
      transition: all .2s;
    }
    .lt-subnav-item:hover { background: rgba(0,149,255,.1); color: #38B6FF; }
    .lt-subnav-item.active { background: rgba(0,149,255,.12); color: #38B6FF; }
    .lt-subnav-item .lt-subnav-ic { font-size: 14px; line-height: 1; flex-shrink: 0; width: 18px; text-align: center; }

    /* ── 3e niveau (catégories d'Édition du jour) ── */
    .lt-subnav-group { display: flex; flex-direction: column; }
    .lt-subnav-row { display: flex; align-items: center; gap: 2px; }
    .lt-subnav-row .lt-subnav-item { flex: 1; }
    .lt-nav-caret.lt-caret-sm { padding: 6px; }
    .lt-nav-caret.lt-caret-sm svg { width: 12px; height: 12px; }
    .lt-subnav--deep {
      margin-left: 9px; padding-left: 10px;
      border-left: 1px solid rgba(0,149,255,.12);
    }
    .lt-subnav--deep .lt-subnav-item {
      font-size: 12.5px; font-weight: 500; padding: 7px 10px; color: #847FA0;
    }
    .lt-subnav--deep .lt-subnav-item:hover { color: #38B6FF; }

    .lt-menu-footer {
      padding: 12px; border-top: 1px solid rgba(255,255,255,.06); flex-shrink: 0;
    }
    .lt-user-info {
      display: none; padding: 10px 14px; border-radius: 10px;
      background: rgba(0,149,255,.06); border: 1px solid rgba(0,149,255,.15);
      margin-bottom: 8px;
    }
    .lt-user-info.show { display: block; }
    .lt-user-email { font-size: 12px; font-weight: 600; color: #9B96B8; margin-bottom: 6px; }
    .lt-user-label { font-size: 10px; color: #5A5570; letter-spacing: .1em; margin-bottom: 4px; }
    .lt-logout-btn {
      background: transparent; border: none; color: #F87171;
      font-size: 11px; cursor: pointer; padding: 0;
      font-family: 'Inter', sans-serif; transition: opacity .2s;
    }
    .lt-logout-btn:hover { opacity: .7; }

    .lt-hamburger {
      display: flex; flex-direction: column; gap: 5px;
      background: transparent; border: none; cursor: pointer;
      padding: 6px; border-radius: 8px; transition: background .2s;
    }
    .lt-hamburger:hover { background: rgba(0,149,255,.1); }
    .lt-hamburger span {
      display: block; width: 20px; height: 2px;
      background: #9B96B8; border-radius: 2px;
    }

    /* ── LANGUE TOGGLE ── */
    .lt-lang-toggle {
      display: flex; align-items: center; gap: 0;
      border: 1px solid rgba(255,255,255,.1); border-radius: 50px;
      overflow: hidden; margin-top: 8px;
    }
    .lt-lang-btn {
      flex: 1; background: transparent; border: none; cursor: pointer;
      padding: 6px 0; font-family: 'Bricolage Grotesque', sans-serif;
      font-size: 11px; font-weight: 700; letter-spacing: .08em;
      color: #5A5570; transition: all .2s;
    }
    .lt-lang-btn:hover { color: #9B96B8; }
    .lt-lang-btn.active {
      background: rgba(0,149,255,.2); color: #38B6FF;
    }
  `;
  document.head.appendChild(style);

  // ── HTML ──
  var CARET = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

  // Détection de l'item courant à partir du nom de fichier du href
  function fileOf(h) { return (h || '').split('/').pop().split('#')[0]; }
  // Un sous-item avec un # (ancre) n'est jamais marqué actif — on ne peut pas détecter la section courante côté statique
  function selfActive(node) { return fileOf(node.href) === page && page !== '' && !(node.href || '').includes('#'); }
  function treeActive(node) {
    if(selfActive(node)) return true;
    return !!(node.children && node.children.some(treeActive));
  }

  // Rendu récursif d'une sous-entrée (peut elle-même avoir des enfants → 3e niveau)
  function renderSub(c, depth) {
    var act = selfActive(c) ? ' active' : '';
    if(c.children && c.children.length) {
      var inner = c.children.map(function(cc) { return renderSub(cc); }).join('');
      return '<div class="lt-subnav-group">' +
               '<div class="lt-subnav-row">' +
                 '<a class="lt-subnav-item' + act + '" href="' + c.href + '"><span class="lt-subnav-ic">' + c.icon + '</span>' + c.label + '</a>' +
                 '<button class="lt-nav-caret lt-caret-sm open" type="button" aria-label="Déplier" onclick="ltToggleSub(event, this)">' + CARET + '</button>' +
               '</div>' +
               '<div class="lt-subnav lt-subnav--deep"><div>' + inner + '</div></div>' +
             '</div>';
    }
    return '<a class="lt-subnav-item' + act + '" href="' + c.href + '"><span class="lt-subnav-ic">' + c.icon + '</span>' + c.label + '</a>';
  }

  var navItems = PAGES.map(function(p) {
    var isActive = page === p.id || (page === '' && p.id === 'index.html') || treeActive(p);
    var cls = 'lt-nav-item' + (isActive ? ' active' : '') + (p.soon ? ' soon' : '');
    var soon = p.soon ? '<span class="lt-nav-soon">Bientôt</span>' : '';
    if(p.children && p.children.length) {
      var subItems = p.children.map(function(c) { return renderSub(c); }).join('');
      return '<div class="lt-nav-group">' +
               '<div class="lt-nav-row">' +
                 '<a class="' + cls + '" href="' + p.href + '"><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + '</a>' +
                 '<button class="lt-nav-caret" type="button" aria-label="Déplier" onclick="ltToggleSub(event,this)">' + CARET + '</button>' +
               '</div>' +
               '<div class="lt-subnav"><div>' + subItems + '</div></div>' +
             '</div>';
    }
    if(p.soon) {
      return '<div class="' + cls + '"><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + soon + '</div>';
    }
    return '<a class="' + cls + '" href="' + p.href + '"><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + soon + '</a>';
  }).join('');

  var menuHTML = `
    <div class="lt-menu-overlay" id="ltMenuOverlay" onclick="ltCloseMenu()"></div>
    <div class="lt-side-menu" id="ltSideMenu">
      <div class="lt-menu-header">
        <div class="lt-menu-brand"><img src="./logo.jpg.webp" alt="Le Terminal" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid rgba(56,182,255,.3);margin-right:8px;vertical-align:middle">Le Terminal <span>Hub</span></div>
        <button class="lt-menu-close" onclick="ltCloseMenu()">✕</button>
      </div>
      <nav class="lt-menu-nav">
        ${navItems}
      </nav>
      <div class="lt-menu-footer">
        <div class="lt-user-info" id="ltUserInfo">
          <div class="lt-user-label">CONNECTÉ</div>
          <div class="lt-user-email" id="ltUserEmail">—</div>
          <button class="lt-logout-btn" onclick="ltLogout()">Se déconnecter</button>
        </div>
        <a class="lt-nav-item" id="ltLoginItem" href="#" onclick="ltOpenLogin();return false;">
          <span class="lt-nav-icon">👤</span> Connexion / Inscription
        </a>
        <div class="lt-lang-toggle">
          <button class="lt-lang-btn" id="ltLangFR" onclick="ltSetLang('fr')">FR</button>
          <button class="lt-lang-btn" id="ltLangEN" onclick="ltSetLang('en')">EN</button>
        </div>
      </div>
    </div>
  `;

  var container = document.createElement('div');
  container.innerHTML = menuHTML;
  document.body.appendChild(container);

  // ── FUNCTIONS ──
  window.ltOpenMenu = function() {
    var menu = document.getElementById('ltSideMenu');
    if(menu.classList.contains('open')) {
      ltCloseMenu();
    } else {
      menu.classList.add('open');
      document.body.classList.add('lt-menu-open');
    }
  };
  window.ltCloseMenu = function() {
    document.getElementById('ltSideMenu').classList.remove('open');
    document.body.classList.remove('lt-menu-open');
  };

  // Sync user state from localStorage
  function ltSyncUser() {
    var email = localStorage.getItem('ta_email') || '';
    var token = localStorage.getItem('ta_token') || '';
    var info = document.getElementById('ltUserInfo');
    var loginItem = document.getElementById('ltLoginItem');
    var emailEl = document.getElementById('ltUserEmail');
    if(token && email) {
      if(info) { info.classList.add('show'); if(emailEl) emailEl.textContent = email; }
      if(loginItem) loginItem.style.display = 'none';
      // Sync page-level UI elements (loginBtn, userChip etc.)
      var lb = document.getElementById('loginBtn');
      var uc = document.getElementById('userChip');
      var av = document.getElementById('userAvatar');
      var un = document.getElementById('userName');
      if(lb) lb.style.display = 'none';
      if(uc) { uc.classList.add('show'); uc.style.display = 'flex'; }
      if(av) av.textContent = email.charAt(0).toUpperCase();
      if(un) un.textContent = email.split('@')[0];
      // logoutBtn on index
      var lo = document.getElementById('logoutBtn');
      if(lo) lo.style.display = '';
    } else {
      if(info) info.classList.remove('show');
      if(loginItem) loginItem.style.display = 'flex';
      var lb = document.getElementById('loginBtn');
      var uc = document.getElementById('userChip');
      if(lb) lb.style.display = '';
      if(uc) { uc.classList.remove('show'); uc.style.display = ''; }
      var lo = document.getElementById('logoutBtn');
      if(lo) lo.style.display = 'none';
    }
  }

  // ── USER BAR (injecté dans #ltUserBar sur toutes les pages) ──
  function ltRenderUserBar() {
    var bar = document.getElementById('ltUserBar');
    if(!bar) return;
    var email = localStorage.getItem('ta_email') || '';
    var token = localStorage.getItem('ta_token') || '';
    var isPro = localStorage.getItem('lt_pro') === '1';
    if(!token || !email) { bar.innerHTML = ''; return; }
    var initial = email.charAt(0).toUpperCase();
    var username = email.split('@')[0];
    bar.innerHTML =
      (isPro ? '<div class="lt-ub-pro"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> PRO</div>' : '') +
      '<div class="lt-ub-chip"><div class="lt-ub-avatar">' + initial + '</div><span class="lt-ub-name">' + username + '</span></div>' +
      '<button class="lt-ub-logout" onclick="ltGlobalLogout()">Déconnexion</button>';
  }

  window.ltGlobalLogout = function() {
    localStorage.removeItem('ta_token');
    localStorage.removeItem('ta_email');
    localStorage.removeItem('lt_pro');
    if(typeof doLogout === 'function') { doLogout(); } else { window.location.href = './index.html'; }
  };

  // Run sync after DOM is ready and after any checkSession finishes
  // Override updateUserUI on each page to also call ltSyncUser
  var _origUpdateUI = window.updateUserUI;
  window.updateUserUI = function() {
    if(typeof _origUpdateUI === 'function') _origUpdateUI();
    ltSyncUser();
    ltRenderUserBar();
  };

  window.ltLogout = function() {
    localStorage.removeItem('ta_token');
    localStorage.removeItem('ta_email');
    localStorage.removeItem('lt_pro');
    ltSyncUser();
    // If page has its own updateUserUI, call it
    if(typeof updateUserUI === 'function') updateUserUI();
    ltCloseMenu();
  };

  // Replier / déplier un sous-menu (gère le 2e et le 3e niveau)
  window.ltToggleSub = function(e, btn) {
    if(e) { e.preventDefault(); e.stopPropagation(); }
    var group = btn.closest('.lt-subnav-group') || btn.closest('.lt-nav-group');
    var sub = group ? group.querySelector('.lt-subnav') : null;
    if(sub) sub.classList.toggle('open');
    btn.classList.toggle('open');
  };

  // Les 4 onglets de calendrier.html
  var ECO_TABS = { edition: 1, flash: 1, calendrier: 1, crypto: 1 };

  // Ouvre le bon onglet de calendrier.html à partir du hash (#edition, #flash, ...)
  // et, pour une catégorie de l'édition (#r-europe, #selection...), scrolle jusqu'à la section.
  window.ltOpenEcoTabFromHash = function() {
    if(page !== 'calendrier.html') return;
    var id = (window.location.hash || '').replace('#', '');
    if(!id) return;
    // Une ancre de catégorie appartient à l'onglet "edition" ; sinon c'est un id d'onglet.
    var tabId = ECO_TABS[id] ? id : 'edition';
    var needle = "showTab('" + tabId + "')";
    var tabs = document.querySelectorAll('.eco-tab');
    for(var i = 0; i < tabs.length; i++) {
      var oc = tabs[i].getAttribute('onclick') || '';
      if(oc.indexOf(needle) !== -1) { tabs[i].click(); break; }
    }
    // Catégorie : on défile jusqu'à la section une fois l'onglet affiché.
    if(!ECO_TABS[id]) {
      var target = document.getElementById(id);
      if(target) {
        setTimeout(function() { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 140);
      }
    }
  };
  window.addEventListener('hashchange', window.ltOpenEcoTabFromHash);
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.ltOpenEcoTabFromHash);
  } else {
    window.ltOpenEcoTabFromHash();
  }
  setTimeout(window.ltOpenEcoTabFromHash, 300);

  window.ltOpenLogin = function() {
    ltCloseMenu();
    // If page has openAuth, use it; otherwise redirect to index
    if(typeof openAuth === 'function') {
      openAuth();
    } else {
      window.location.href = './index.html';
    }
  };

  // ── SYSTÈME I18N GLOBAL ──
  var LT_TRANSLATIONS = {
    fr: {
      // index.html — hero
      'hero-pill':        'Plateforme active · Mis à jour quotidiennement',
      'hero-title-1':     'Ton hub trading',
      'hero-title-2':     'propulsé par l\'IA.',
      'hero-sub':         'Analyse tes setups en quelques secondes, tiens ton journal, consulte le calendrier économique et maîtrise ta gestion du risque. Tout en un seul endroit.',
      'hero-cta':         'Voir les outils',
      'chip-1':           'Feedback instantané',
      'chip-2':           'Toutes stratégies',
      'chip-3':           'Objectif & précis',
      'chip-4':           '100% sécurisé · Données privées',
      // index.html — sections
      'tools-eyebrow':    'Arsenal complet',
      'tools-title':      'Tous les outils dont tu as besoin',
      'tools-sub':        'Chaque outil est conçu pour un aspect précis de ton trading. Ensemble, ils forment un écosystème complet.',
      'strat-eyebrow':    'Compatibilité universelle',
      'strat-title':      'Toutes les stratégies, un seul outil.',
      'strat-desc':       'Le Terminal Analyzer adapte son analyse à ta stratégie. Que tu trades l\'ICT, le SMC, le Price Action pur ou la structure de Wyckoff, l\'IA détecte les confluences qui correspondent à ta méthode.',
      'process-eyebrow':  'Comment ça marche',
      'process-title':    'Une analyse complète en 4 étapes',
      'step1-num':'Étape 01','step1-title':'Upload ton chart','step1-desc':'Capture d\'écran de ton setup depuis TradingView ou ta plateforme. Glisse-dépose ou colle directement.',
      'step2-num':'Étape 02','step2-title':'L\'IA analyse','step2-desc':'Claude Opus scanne la structure, les zones clés, le contexte macro et les confluences de ta stratégie.',
      'step3-num':'Étape 03','step3-title':'Score & feedback','step3-desc':'Score /100, forces, faiblesses, niveaux de prix précis et verdict GO / ATTENDRE / NO-GO.',
      'step4-num':'Étape 04','step4-title':'Sauvegarde & suivi','step4-desc':'Chaque analyse est archivée. Enregistre le résultat du trade et analyse tes stats dans le journal.',
      'tg-title':         'Rejoindre la communauté Telegram',
      'tg-sub':           'Analyses quotidiennes, setups en live et entraide entre traders',
      'tg-cta':           'Rejoindre →',
      'stat-lbl-1':'Outils actifs','stat-lbl-2':'Claude Opus','stat-lbl-3':'Stratégies','stat-lbl-4':'Disponible',
      // tool cards
      'tool-analyzer-name':'Setup Analyzer','tool-analyzer-desc':'Score IA de ton setup, compatible avec toutes les stratégies (ICT, SMC, Price Action…). Feedback instantané et annotations sur ton graphique.',
      'tool-journal-name':'Journal de Trading','tool-journal-desc':'Calendrier de tes trades, suivi P&L, screenshots, notes et analyse IA de tes patterns de performance.',
      'tool-eco-name':'Calendrier Éco','tool-eco-desc':'Tous les événements macroéconomiques clés — NFP, CPI, FOMC — organisés par région et impact attendu.',
      'tool-bubble-name':'Bubble Map','tool-bubble-desc':'Visualise les flux de capitaux entre actifs en temps réel — crypto, forex, indices et matières premières.',
      'tool-calc-name':'Calculateur de Pips','tool-calc-desc':'Taille de position, valeur du pip, risque en devise et R:R optimal. Long/Short avec validation automatique.',
      // calculateur.html
      'calc-title':       'Calculateur de Pips',
      'calc-sub':         'Calcule ta taille de position et ton risque en quelques secondes.',
      'calc-pair-label':  'Paire / Instrument',
      'calc-account-label':'Solde du compte',
      'calc-risk-label':  'Risque par trade',
      'calc-entry-label': 'Prix d\'entrée',
      'calc-sl-label':    'Stop Loss',
      'calc-tp-label':    'Take Profit',
      'calc-size-label':  'Taille de position',
      'calc-btn':         'Calculer',
      // auth / menu
      'login-btn':        'Connexion',
      'logout-btn':       'Déconnexion',
    },
    en: {
      // index.html — hero
      'hero-pill':        'Platform active · Updated daily',
      'hero-title-1':     'Your trading hub',
      'hero-title-2':     'powered by AI.',
      'hero-sub':         'Analyze your setups in seconds, keep your journal, check the economic calendar and master your risk management. All in one place.',
      'hero-cta':         'See tools',
      'chip-1':           'Instant feedback',
      'chip-2':           'All strategies',
      'chip-3':           'Objective & precise',
      'chip-4':           '100% secure · Private data',
      // index.html — sections
      'tools-eyebrow':    'Full arsenal',
      'tools-title':      'Every tool you need',
      'tools-sub':        'Each tool is designed for a precise aspect of your trading. Together, they form a complete ecosystem.',
      'strat-eyebrow':    'Universal compatibility',
      'strat-title':      'Every strategy, one tool.',
      'strat-desc':       'Le Terminal Analyzer adapts its analysis to your strategy. Whether you trade ICT, SMC, pure Price Action or Wyckoff structure, the AI detects the confluences that match your method.',
      'process-eyebrow':  'How it works',
      'process-title':    'A complete analysis in 4 steps',
      'step1-num':'Step 01','step1-title':'Upload your chart','step1-desc':'Screenshot your setup from TradingView or your platform. Drag & drop or paste directly.',
      'step2-num':'Step 02','step2-title':'AI analyzes','step2-desc':'Claude Opus scans the structure, key zones, macro context and your strategy\'s confluences.',
      'step3-num':'Step 03','step3-title':'Score & feedback','step3-desc':'Score /100, strengths, weaknesses, precise price levels and GO / WAIT / NO-GO verdict.',
      'step4-num':'Step 04','step4-title':'Save & track','step4-desc':'Every analysis is archived. Record the trade outcome and analyze your stats in the journal.',
      'tg-title':         'Join the Telegram community',
      'tg-sub':           'Daily analyses, live setups and peer support',
      'tg-cta':           'Join →',
      'stat-lbl-1':'Active tools','stat-lbl-2':'Claude Opus','stat-lbl-3':'Strategies','stat-lbl-4':'Available',
      // tool cards
      'tool-analyzer-name':'Setup Analyzer','tool-analyzer-desc':'AI score for your setup, compatible with all strategies (ICT, SMC, Price Action…). Instant feedback and chart annotations.',
      'tool-journal-name':'Trading Journal','tool-journal-desc':'Trade calendar, P&L tracking, screenshots, notes and AI analysis of your performance patterns.',
      'tool-eco-name':'Eco Calendar','tool-eco-desc':'All key macroeconomic events — NFP, CPI, FOMC — organized by region and expected impact.',
      'tool-bubble-name':'Bubble Map','tool-bubble-desc':'Visualize capital flows between assets in real time — crypto, forex, indices and commodities.',
      'tool-calc-name':'Pip Calculator','tool-calc-desc':'Position size, pip value, currency risk and optimal R:R. Long/Short with automatic validation.',
      // calculateur.html
      'calc-title':       'Pip Calculator',
      'calc-sub':         'Calculate your position size and risk in seconds.',
      'calc-pair-label':  'Pair / Instrument',
      'calc-account-label':'Account balance',
      'calc-risk-label':  'Risk per trade',
      'calc-entry-label': 'Entry price',
      'calc-sl-label':    'Stop Loss',
      'calc-tp-label':    'Take Profit',
      'calc-size-label':  'Position size',
      'calc-btn':         'Calculate',
      // auth / menu
      'login-btn':        'Login',
      'logout-btn':       'Logout',
    }
  };

  function ltApplyI18n(l) {
    var t = LT_TRANSLATIONS[l] || LT_TRANSLATIONS['fr'];
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if(t[key] !== undefined) el.textContent = t[key];
    });
    // Boutons login/logout dans topbar (sans data-i18n)
    var lb = document.getElementById('loginBtn');
    var lo = document.getElementById('logoutBtn');
    if(lb) lb.textContent = t['login-btn'];
    if(lo) lo.textContent = t['logout-btn'];
  }

  function ltUpdateLangBtns(l) {
    var fr = document.getElementById('ltLangFR');
    var en = document.getElementById('ltLangEN');
    if(!fr || !en) return;
    if(l === 'en') { fr.classList.remove('active'); en.classList.add('active'); }
    else           { fr.classList.add('active');    en.classList.remove('active'); }
  }

  window.ltSetLang = function(l) {
    localStorage.setItem('lt_lang', l);
    ltUpdateLangBtns(l);
    ltApplyI18n(l);
    // Appelle setLang de la page si elle a son propre système (app.html)
    if(typeof window.setLang === 'function') window.setLang(l);
  };

  var _currentLang = localStorage.getItem('lt_lang') || 'fr';
  ltUpdateLangBtns(_currentLang);
  // Applique les traductions après chargement du DOM
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ ltApplyI18n(_currentLang); });
  } else {
    ltApplyI18n(_currentLang);
  }

  // Init - run immediately and after checkSession completes
  ltSyncUser();
  ltRenderUserBar();
  // Re-render after page auth logic runs (e.g. checkSession async)
  setTimeout(ltRenderUserBar, 800);
  setTimeout(ltRenderUserBar, 2000);
  // Run again after 1s to catch async checkSession result
  setTimeout(ltSyncUser, 800);
  setTimeout(ltSyncUser, 2000);

  // Re-sync when localStorage changes (cross-tab)
  window.addEventListener('storage', ltSyncUser);

  // ── CURSEUR PERSONNALISÉ (toutes les pages) ──
  (function(){
    if(window.matchMedia('(pointer: coarse)').matches) return; // mobile : skip

    // CSS
    var cs = document.createElement('style');
    cs.textContent = [
      '* { cursor: none !important; }',
      '#lt-cur-dot {',
        'position:fixed;top:0;left:0;z-index:99999;pointer-events:none;',
        'width:4px;height:4px;border-radius:50%;',
        'background:#38B6FF;',
        'box-shadow:0 0 4px 1px #38B6FF,0 0 9px 2px rgba(56,182,255,.45);',
        'transform:translate(-50%,-50%);',
        'transition:transform .08s ease,width .2s,height .2s,background .2s;',
        'will-change:left,top;',
      '}',
      '#lt-cur-ring {',
        'position:fixed;top:0;left:0;z-index:99998;pointer-events:none;',
        'width:20px;height:20px;border-radius:50%;',
        'border:1px solid rgba(56,182,255,.5);',
        'box-shadow:0 0 5px 1px rgba(56,182,255,.15);',
        'transform:translate(-50%,-50%);',
        'transition:width .25s,height .25s,border-color .25s;',
        'will-change:left,top;',
      '}',
      'body.lt-cur-hover #lt-cur-dot {',
        'width:6px;height:6px;',
        'background:#A78BFA;',
        'box-shadow:0 0 7px 2px #A78BFA,0 0 14px 4px rgba(167,139,250,.4);',
      '}',
      'body.lt-cur-hover #lt-cur-ring {',
        'width:28px;height:28px;',
        'border-color:rgba(167,139,250,.55);',
        'box-shadow:0 0 8px 1px rgba(167,139,250,.2);',
      '}',
      '@media (pointer:coarse){#lt-cur-dot,#lt-cur-ring{display:none!important}*{cursor:auto!important}}'
    ].join('');
    document.head.appendChild(cs);

    // Éléments DOM
    var dot = document.createElement('div'); dot.id = 'lt-cur-dot';
    var ring = document.createElement('div'); ring.id = 'lt-cur-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = window.innerWidth/2, my = window.innerHeight/2;
    var rx = mx, ry = my;

    document.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    var hoverSel = 'a,button,input,select,textarea,[onclick],[role="button"]';
    document.addEventListener('mouseover', function(e){
      if(e.target.closest(hoverSel)) document.body.classList.add('lt-cur-hover');
    });
    document.addEventListener('mouseout', function(e){
      if(e.target.closest(hoverSel)) document.body.classList.remove('lt-cur-hover');
    });

    document.addEventListener('mousedown', function(){
      dot.style.transform = 'translate(-50%,-50%) scale(0.6)';
      ring.style.transform = 'translate(-50%,-50%) scale(0.85)';
    });
    document.addEventListener('mouseup', function(){
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
    });

    // Quand la souris entre dans un iframe (ex: TradingView bubble map),
    // les mousemove s'arrêtent → on masque le curseur custom et on restaure le natif
    var iframeStyle = document.createElement('style');
    iframeStyle.textContent = 'body.lt-in-iframe * { cursor: auto !important; } body.lt-in-iframe #lt-cur-dot, body.lt-in-iframe #lt-cur-ring { opacity: 0 !important; }';
    document.head.appendChild(iframeStyle);

    function enterIframe(){ document.body.classList.add('lt-in-iframe'); }
    function leaveIframe(){ document.body.classList.remove('lt-in-iframe'); }

    document.addEventListener('mouseleave', enterIframe);
    document.addEventListener('mouseenter', leaveIframe);
    // Fallback polling : si pas de mousemove pendant 200ms → dans un iframe
    var lastMove = Date.now();
    document.addEventListener('mousemove', function(){ lastMove = Date.now(); leaveIframe(); });
    setInterval(function(){ if(Date.now() - lastMove > 200) enterIframe(); }, 100);

    (function loop(){
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(loop);
    })();
  })();

})();
