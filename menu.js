// ── LE TERMINAL · MENU LATERAL GLOBAL ──
// Inclure ce fichier dans toutes les pages du site

(function() {

  // Détecte la page active
  var page = window.location.pathname.split('/').pop() || 'index.html';
  // URLs propres (cleanUrls) : on rétablit .html pour le matching interne.
  if (page && page.indexOf('.') === -1) page += '.html';

  var ICONS = {
    dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    journal:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    calendrier:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="14" r=".8" fill="currentColor"/><circle cx="12" cy="14" r=".8" fill="currentColor"/><circle cx="16" cy="14" r=".8" fill="currentColor"/></svg>`,
    analyzer:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    bubble:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="7" r="2"/><circle cx="19" cy="7" r="2.5"/><circle cx="6" cy="17" r="1.5"/><circle cx="18" cy="16" r="2"/></svg>`,
    calc:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/></svg>`,
    mur:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="5" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="3" y="10" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="5" rx="1"/><rect x="3" y="17" width="8" height="4" rx="1"/><rect x="13" y="17" width="8" height="4" rx="1"/></svg>`,
    profil:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
  };

  var PAGES = [
    { id: 'index.html',       icon: ICONS.dashboard,  label: 'Accueil',             href: './index.html' },
    { id: 'journal.html',     icon: ICONS.journal,    label: 'Journal de Trading',  href: './journal.html', pro: true },
    { id: 'calendrier.html',  icon: ICONS.calendrier, label: 'Actualité',            href: './eco-calendrier.html', pro: true, children: [
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`, label: 'Présentation', href: './eco-edition.html', pro: true, children: [
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, label: 'La sélection',  href: './eco-selection.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7.2a6.3 6.3 0 1 0 0 9.6"/><path d="M4.5 10.5h9M4.5 13.5h9"/></svg>`, label: 'Europe',        href: './eco-europe.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>`, label: 'Amériques',     href: './eco-ameriques.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5l5 7 5-7"/><path d="M12 11.5V20"/><path d="M8 13.5h8"/></svg>`, label: 'Asie',          href: './eco-asie.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label: 'Marchés',       href: './eco-marches.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5 12 4l8.5 5.5"/><path d="M5.5 10v8M9.5 10v8M14.5 10v8M18.5 10v8"/><path d="M3 20.5h18"/></svg>`, label: 'Institutions',  href: './eco-institutions.html' },
        { icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`, label: 'International',  href: './eco-international.html' },
      ] },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`, label: 'Flash Info',      href: './eco-flash.html', pro: true },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="14" r=".8" fill="currentColor"/><circle cx="12" cy="14" r=".8" fill="currentColor"/><circle cx="16" cy="14" r=".8" fill="currentColor"/></svg>`, label: 'Actualité',       href: './eco-calendrier.html' },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h4.2a2.4 2.4 0 0 1 0 4.8H9.5m0 0h4.6a2.4 2.4 0 0 1 0 4.7H9.5m0-9.5V17m1.8-9.5V6m0 12.5V17m2.4-9.5V6m0 12.5V17"/></svg>`, label: 'Crypto',          href: './eco-crypto.html', pro: true },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M9.5 12h5"/></svg>`, label: 'Archive',         href: './eco-archive.html', pro: true },
    ] },
    { id: 'app.html',         icon: ICONS.analyzer,   label: 'Setup Analyzer',      href: './app.html', pro: true, children: [
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`, label: 'Historique', href: './app.html#historique' },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label: 'Perfs', href: './app.html#perfs' },
    ] },
    { id: 'bubble.html',      icon: ICONS.bubble,     label: 'Bubble Map',          href: './bubble.html' },
    { id: 'patrimoine.html',  icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/></svg>`, label: 'Patrimoine', href: './patrimoine-presentation.html', pro: true, children: [
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>`, label: 'Présentation', href: './patrimoine-presentation.html' },
      { icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></svg>`, label: 'Portefeuille', href: './patrimoine.html' },
    ] },
    { id: 'calculateur.html', icon: ICONS.calc,       label: 'Calculateur de Pips', href: './calculateur.html' },
  ];

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent = `
    /* overlay supprimé — mode push */
    .lt-menu-overlay { display: none; }

    .lt-side-menu {
      position: fixed; top: 0; left: 0; bottom: 0; width: 280px;
      background: #0B0E13; border-right: 1px solid rgba(255,255,255,.08);
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
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 16px; font-weight: 800; color: #EEF2F7;
    }
    .lt-menu-brand span { color: #BFDCF5; }
    .lt-menu-close {
      background: transparent; border: none; color: #3A414C;
      font-size: 20px; cursor: pointer; line-height: 1;
      padding: 4px 6px; border-radius: 6px; transition: all .2s;
    }
    .lt-menu-close:hover { color: #EEF2F7; background: rgba(255,255,255,.06); }

    .lt-menu-nav { padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }

    .lt-nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 14px; border-radius: 10px;
      cursor: pointer; transition: all .2s;
      text-decoration: none; color: #7E8794;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 14px; font-weight: 600;
      border: none; background: transparent; width: 100%; text-align: left;
    }
    .lt-nav-item:hover { background: rgba(127,184,232,.1); color: #BFDCF5; }
    .lt-nav-item.active {
      background: rgba(127,184,232,.15); color: #BFDCF5;
      border: 1px solid rgba(127,184,232,.25);
    }
    .lt-nav-item.soon { opacity: .45; cursor: not-allowed; pointer-events: none; }
    .lt-nav-item.pro-locked { opacity: .35; cursor: not-allowed; pointer-events: none; }
    .lt-nav-item.pro-locked:hover { background: transparent; }
    .lt-nav-group.pro-locked-group { opacity: .35; pointer-events: none; }
    .lt-nav-group.pro-locked-group * { pointer-events: none; }
    .lt-nav-pro-badge {
      margin-left: auto; font-size: 9px; font-weight: 700;
      letter-spacing: .08em; color: #E8C268;
      background: rgba(255,180,0,.1); border: 1px solid rgba(255,180,0,.25);
      border-radius: 50px; padding: 3px 8px;
    }
    .lt-subnav-item.pro-locked { opacity: .35; cursor: not-allowed; pointer-events: none; }
    .lt-subnav-item.pro-locked:hover { color: inherit; }
    .lt-nav-icon { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; opacity: .7; }
    .lt-nav-item:hover .lt-nav-icon, .lt-nav-item.active .lt-nav-icon { opacity: 1; }
    .lt-nav-soon {
      margin-left: auto; font-size: 9px; font-weight: 700;
      letter-spacing: .1em; color: #3A414C;
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
      color: #7E8794; padding: 8px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      transition: all .2s; flex-shrink: 0;
    }
    .lt-nav-caret:hover { background: rgba(127,184,232,.1); color: #BFDCF5; }
    .lt-nav-caret svg { transition: transform .25s cubic-bezier(.2,0,.1,1); }
    .lt-nav-caret:hover svg { transform: rotate(-180deg); }
    .lt-nav-caret.open svg { transform: rotate(180deg); }
    .lt-nav-caret.open:hover svg { transform: rotate(180deg); }

    .lt-subnav {
      display: grid; grid-template-rows: 0fr;
      transition: grid-template-rows .3s cubic-bezier(.2,0,.1,1);
      margin-left: 14px; padding-left: 12px;
      border-left: 1px solid rgba(127,184,232,.18);
    }
    .lt-subnav > div { overflow: hidden; }
    .lt-subnav.open { grid-template-rows: 1fr; }
    .lt-subnav--deep {
      margin-left: 10px; padding-left: 10px;
      border-left: 1px solid rgba(127,184,232,.1);
    }
    .lt-subnav-group { display: flex; flex-direction: column; }
    .lt-subnav-row { display: flex; align-items: center; }
    .lt-subnav-row .lt-subnav-item { flex: 1; }
    .lt-nav-caret--sub { padding: 4px; min-width: 24px; }
    .lt-subnav-item--deep { padding: 7px 10px; font-size: 12px; opacity: .85; }

    /* ── USER BAR ── */
    #ltUserBar { display: flex; align-items: center; gap: 8px; position: relative; }
    .lt-ub-tokens { display: inline-flex; align-items: center; gap: 4px; padding: 4px 9px; background: rgba(127,184,232,.1); border: 1px solid rgba(127,184,232,.25); border-radius: 6px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; font-weight: 700; color: #7FB8E8; letter-spacing: .04em; white-space: nowrap; }
    .lt-ub-tokens--low { background: rgba(240,100,122,.1); border-color: rgba(240,100,122,.25); color: #F0647A; }
    .lt-ub-tokens--pro { background: rgba(232,194,104,.1); border-color: rgba(232,194,104,.25); color: #E8C268; }
    .lt-ub-chip { display: flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); cursor: pointer; transition: all .2s; }
    .lt-ub-chip:hover { border-color: rgba(127,184,232,.45); background: rgba(127,184,232,.08); }
    .lt-ub-avatar { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg,#7FB8E8,#BFDCF5); display: flex; align-items: center; justify-content: center; font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 12px; font-weight: 700; color: #07090C; flex-shrink: 0; }
    .lt-ub-name { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 600; color: #F2F4F7; }
    .lt-ub-caret { color: #7E8794; display: flex; transition: transform .2s; }
    .lt-ub-chip.open .lt-ub-caret { transform: rotate(180deg); }
    .lt-ub-menu { position: absolute; top: calc(100% + 8px); right: 0; min-width: 200px; background: rgba(16,20,27,.98); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,.12); border-radius: 10px; box-shadow: 0 24px 60px rgba(0,0,0,.6); padding: 8px; z-index: 100001; opacity: 0; visibility: hidden; transform: translateY(-6px); transition: all .18s ease; }
    .lt-ub-menu.show { opacity: 1; visibility: visible; transform: translateY(0); }
    .lt-ub-menu__mail { padding: 8px 10px 10px; font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 12px; color: #7E8794; word-break: break-all; border-bottom: 1px solid rgba(255,255,255,.08); margin-bottom: 6px; }
    .lt-ub-menu__badge { display: block; margin-top: 4px; font-size: 11px; font-weight: 700; letter-spacing: .04em; color: #7FB8E8; }
    .lt-ub-logout { width: 100%; text-align: left; padding: 9px 10px; background: transparent; border: none; border-radius: 6px; color: #F0647A; font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 8px; }
    .lt-ub-logout:hover { background: rgba(240,100,122,.12); }
    .lt-ub-link { width: 100%; text-align: left; padding: 9px 10px; background: transparent; border: none; border-radius: 6px; color: #F2F4F7; font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 8px; text-decoration: none; margin-bottom: 4px; }
    .lt-ub-link:hover { background: rgba(127,184,232,.12); color: #BFDCF5; }
    .lt-ub-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; display: block; }

    .lt-subnav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 8px;
      text-decoration: none; color: #7E8794;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 13px; font-weight: 600;
      transition: all .2s;
    }
    .lt-subnav-item:hover { background: rgba(127,184,232,.1); color: #BFDCF5; }
    .lt-subnav-item.active { background: rgba(127,184,232,.12); color: #BFDCF5; }
    .lt-subnav-item .lt-subnav-ic { font-size: 14px; line-height: 1; flex-shrink: 0; width: 18px; text-align: center; }

    /* ── 3e niveau (catégories d'Édition du jour) ── */
    .lt-subnav-group { display: flex; flex-direction: column; }
    .lt-subnav-row { display: flex; align-items: center; gap: 2px; }
    .lt-subnav-row .lt-subnav-item { flex: 1; }
    .lt-nav-caret.lt-caret-sm { padding: 6px; }
    .lt-nav-caret.lt-caret-sm svg { width: 12px; height: 12px; }
    .lt-subnav--deep {
      margin-left: 9px; padding-left: 10px;
      border-left: 1px solid rgba(127,184,232,.12);
    }
    .lt-subnav--deep .lt-subnav-item {
      font-size: 12.5px; font-weight: 500; padding: 7px 10px; color: #7E8794;
    }
    .lt-subnav--deep .lt-subnav-item:hover { color: #BFDCF5; }

    .lt-menu-footer {
      padding: 12px; border-top: 1px solid rgba(255,255,255,.06); flex-shrink: 0;
    }
    .lt-user-info {
      display: none; padding: 10px 14px; border-radius: 10px;
      background: rgba(127,184,232,.06); border: 1px solid rgba(127,184,232,.15);
      margin-bottom: 8px;
    }
    .lt-user-info.show { display: block; }
    .lt-user-email { font-size: 12px; font-weight: 600; color: #7E8794; margin-bottom: 6px; }
    .lt-user-label { font-size: 10px; color: #3A414C; letter-spacing: .1em; margin-bottom: 4px; }
    .lt-logout-btn {
      background: transparent; border: none; color: #F0647A;
      font-size: 11px; cursor: pointer; padding: 0;
      font-family: 'Inter', sans-serif; transition: opacity .2s;
    }
    .lt-logout-btn:hover { opacity: .7; }

    .lt-hamburger {
      display: flex; flex-direction: column; gap: 5px;
      background: transparent; border: none; cursor: pointer;
      padding: 6px; border-radius: 8px; transition: background .2s;
    }
    .lt-hamburger:hover { background: rgba(127,184,232,.1); }
    .lt-hamburger span {
      display: block; width: 20px; height: 2px;
      background: #7E8794; border-radius: 2px;
    }

    /* ── LANGUE TOGGLE ── */
    .lt-lang-toggle {
      display: flex; align-items: center; gap: 0;
      border: 1px solid rgba(255,255,255,.1); border-radius: 50px;
      overflow: hidden; margin-top: 8px;
    }
    .lt-lang-btn {
      flex: 1; background: transparent; border: none; cursor: pointer;
      padding: 6px 0; font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 11px; font-weight: 700; letter-spacing: .08em;
      color: #3A414C; transition: all .2s;
    }
    .lt-lang-btn:hover { color: #7E8794; }
    .lt-lang-btn.active {
      background: rgba(127,184,232,.2); color: #BFDCF5;
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
  function renderSub(c, depth, parentLocked) {
    var locked = parentLocked || (c.pro && !isUserPro) || false;
    var act = (!locked && selfActive(c)) ? ' active' : '';
    var lockCls = locked ? ' pro-locked' : '';
    var href = locked ? null : c.href;
    var tag = locked ? 'span' : 'a';
    var hrefAttr = href ? ' href="' + href + '"' : '';
    if(c.children && c.children.length) {
      var inner = c.children.map(function(cc) { return renderSub(cc, 0, locked); }).join('');
      return '<div class="lt-subnav-group">' +
               '<div class="lt-subnav-row">' +
                 '<' + tag + ' class="lt-subnav-item' + act + lockCls + '"' + hrefAttr + '><span class="lt-subnav-ic">' + c.icon + '</span>' + c.label + '</' + tag + '>' +
                 '<button class="lt-nav-caret lt-caret-sm open" type="button" aria-label="Déplier" onclick="ltToggleSub(event, this)">' + CARET + '</button>' +
               '</div>' +
               '<div class="lt-subnav lt-subnav--deep"><div>' + inner + '</div></div>' +
             '</div>';
    }
    return '<' + tag + ' class="lt-subnav-item' + act + lockCls + '"' + hrefAttr + '><span class="lt-subnav-ic">' + c.icon + '</span>' + c.label + '</' + tag + '>';
  }

  var isUserPro = localStorage.getItem('lt_pro') === '1';

  // ── SYNCHRONISATION COMPLÈTE DU COMPTE (sans rechargement) ──
  // Source de vérité unique : rafraîchit le token si besoin, puis récupère EN UNE
  // FOIS le statut Premium (autoritatif via /api/check-pro : Supabase → activations
  // en attente → Whop) ET le profil (pseudo, avatar, nom — avec repli sur les
  // métadonnées Google). Met à jour le cache + l'UI en place. Appelé à la connexion
  // (email + Google) et au chargement de chaque page → l'utilisateur est toujours à
  // jour sans devoir cliquer ni recharger.
  var _ltSyncing = false;
  function ltSyncAccount() {
    var tok = localStorage.getItem('ta_token');
    if (!tok || _ltSyncing) return Promise.resolve();
    _ltSyncing = true;
    return ltEnsureSession().then(function(token) {
      token = token || localStorage.getItem('ta_token');
      var authH = { 'Authorization': 'Bearer ' + token };
      var proP = fetch('/api/check-pro', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, authH) })
        .then(function(r){ return r.json(); }).catch(function(){ return null; });
      var profP = fetch('/api/profile', { method: 'GET', headers: authH })
        .then(function(r){ return r.json(); }).catch(function(){ return null; });
      return Promise.all([proP, profP]).then(function(res) {
        var d = res[0], p = res[1] || {};
        // Premium : check-pro fait autorité ; repli sur le profil si check-pro échoue.
        if (d && !d.token_invalid) {
          if (d.is_pro) localStorage.setItem('lt_pro', '1');
          else localStorage.removeItem('lt_pro');
        } else if (p && p.is_pro) {
          localStorage.setItem('lt_pro', '1');
        }
        // Profil : pseudo / avatar / nom (repli sur Google via auth_name / auth_avatar)
        var pseudo = p.pseudo || p.auth_name || '';
        var avatar = p.avatar_url || p.auth_avatar || '';
        if (pseudo) localStorage.setItem('lt_pseudo', pseudo);
        if (avatar) localStorage.setItem('lt_avatar', avatar);
        if (p.first_name) localStorage.setItem('lt_first_name', p.first_name);
        if (p.last_name)  localStorage.setItem('lt_last_name', p.last_name);
        if (p.email) localStorage.setItem('ta_email', p.email);
        // Questionnaire d'onboarding : le compte l'a déjà rempli (serveur) → on
        // mémorise pour ne plus jamais le reposer.
        if (p.onboarded_at) { try { localStorage.setItem('lt_onboarded', '1'); } catch(e){} }
        _ltProfileFetched = true;
        // UI en place — aucune rechargement de page.
        ltSyncUser(); ltRenderUserBar();
        if (window.ltRebuildAppFooter) { try { window.ltRebuildAppFooter(); } catch(e) {} }
        // Signale aux pages (compte.html…) qu'elles peuvent rafraîchir leur affichage.
        try {
          document.dispatchEvent(new CustomEvent('lt:account-synced', { detail: {
            is_pro: localStorage.getItem('lt_pro') === '1', pseudo: pseudo, avatar: avatar
          }}));
        } catch(e) {}
      });
    }).catch(function(){}).finally(function(){ _ltSyncing = false; });
  }
  window.ltSyncAccount = ltSyncAccount;

  // ── PROGRESSION DU JOUEUR RATTACHÉE AU COMPTE (dashboard/gamification) ──
  // Temps par outil, objectifs, notes, éco, devise : stockés côté serveur
  // (/api/stats) → la progression suit le compte, sur tous les appareils, et
  // ne se réinitialise plus à la déconnexion.
  function _ltMergeUsage(local, server) {
    var out = {}, k;
    for (k in (local || {})) out[k] = local[k];
    for (k in (server || {})) {
      var a = out[k] || { ms: 0, visits: 0 }, b = server[k] || {};
      out[k] = { ms: Math.max(+a.ms || 0, +b.ms || 0), visits: Math.max(+a.visits || 0, +b.visits || 0), last: b.last || a.last || null };
    }
    return out;
  }
  // Charge la progression du serveur et la fusionne dans le cache local.
  function ltSyncStats() {
    var tok = localStorage.getItem('ta_token'); if (!tok) return;
    fetch('/api/stats', { headers: { 'Authorization': 'Bearer ' + tok } })
      .then(function (r) { return r.json(); })
      .then(function (s) {
        if (!s || typeof s !== 'object') return;
        var localU = {}; try { localU = JSON.parse(localStorage.getItem('lt_usage') || '{}'); } catch (e) {}
        try { localStorage.setItem('lt_usage', JSON.stringify(_ltMergeUsage(localU, s.usage || {}))); } catch (e) {}
        // Clés opaques : si le cache local est vide, on restaure la valeur du compte.
        [['goals', 'lt_goals'], ['notes', 'jnl_notes'], ['eco_unlocked', 'eco_unlocked'], ['currency', 'jnl_currency']].forEach(function (p) {
          var sv = s[p[0]]; if (sv === undefined || sv === null) return;
          var loc = localStorage.getItem(p[1]);
          if (loc === null || loc === '') { try { localStorage.setItem(p[1], typeof sv === 'string' ? sv : JSON.stringify(sv)); } catch (e) {} }
        });
        try { document.dispatchEvent(new CustomEvent('lt:stats-synced')); } catch (e) {}
      }).catch(function () {});
  }
  window.ltSyncStats = ltSyncStats;
  // Envoie la progression locale au serveur (fusion MAX côté serveur). keepalive
  // pour que l'envoi aboutisse même au déchargement de la page / à la déconnexion.
  function ltFlushStats() {
    var tok = localStorage.getItem('ta_token'); if (!tok) return;
    var usage = {}; try { usage = JSON.parse(localStorage.getItem('lt_usage') || '{}'); } catch (e) {}
    var body = {
      usage: usage,
      goals: localStorage.getItem('lt_goals'),
      notes: localStorage.getItem('jnl_notes'),
      eco_unlocked: localStorage.getItem('eco_unlocked'),
      currency: localStorage.getItem('jnl_currency')
    };
    try {
      fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok }, body: JSON.stringify(body), keepalive: true })
        .then(function (r) { return r.json(); })
        .then(function (s) { if (s && s.usage) { try { localStorage.setItem('lt_usage', JSON.stringify(s.usage)); } catch (e) {} } })
        .catch(function () {});
    } catch (e) {}
  }
  window.ltFlushStats = ltFlushStats;
  // Sauvegarde en continu : au masquage/déchargement de la page + périodiquement.
  document.addEventListener('visibilitychange', function () { if (document.hidden) ltFlushStats(); });
  window.addEventListener('pagehide', ltFlushStats);
  setInterval(ltFlushStats, 60000);

  // Synchronisation serveur au chargement — Premium + profil + progression.
  var _verifyToken = localStorage.getItem('ta_token');
  if (_verifyToken) {
    ltSyncAccount();
    ltSyncStats();
  }

  var navItems = PAGES.map(function(p) {
    var isActive = page === p.id || (page === '' && p.id === 'index.html') || treeActive(p);
    var isLocked = p.pro && !isUserPro;
    var cls = 'lt-nav-item' + (isActive ? ' active' : '') + (p.soon ? ' soon' : '') + (isLocked ? ' pro-locked' : '');
    var soon = p.soon ? '<span class="lt-nav-soon">Bientôt</span>' : '';
    var proBadge = isLocked ? '<span class="lt-nav-pro-badge"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> PRO</span>' : '';
    var tag = isLocked ? 'span' : 'a';
    var hrefAttr = isLocked ? '' : ' href="' + p.href + '"';

    if(p.children && p.children.length) {
      var subItems = p.children.map(function(c) { return renderSub(c, 0, isLocked); }).join('');
      return '<div class="lt-nav-group' + (isLocked ? ' pro-locked-group' : '') + '">' +
               '<div class="lt-nav-row">' +
                 '<' + tag + ' class="' + cls + '"' + hrefAttr + '><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + proBadge + '</' + tag + '>' +
                 '<button class="lt-nav-caret" type="button" aria-label="Déplier" onclick="ltToggleSub(event,this)">' + CARET + '</button>' +
               '</div>' +
               '<div class="lt-subnav"><div>' + subItems + '</div></div>' +
             '</div>';
    }
    if(p.soon) {
      return '<div class="' + cls + '"><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + soon + '</div>';
    }
    return '<' + tag + ' class="' + cls + '"' + hrefAttr + '><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + soon + proBadge + '</' + tag + '>';
  }).join('');

  var menuHTML = `
    <div class="lt-menu-overlay" id="ltMenuOverlay" onclick="ltCloseMenu()"></div>
    <div class="lt-side-menu" id="ltSideMenu">
      <div class="lt-menu-header">
        <div class="lt-menu-brand"><img src="./logo-nav.webp" alt="Le Terminal" style="width:42px;height:42px;border-radius:8px;object-fit:cover;border:1px solid rgba(127,184,232,.3);margin-right:8px;vertical-align:middle;">Le Terminal <span>Hub</span></div>
        <button class="lt-menu-close" onclick="ltCloseMenu()">✕</button>
      </div>
      <nav class="lt-menu-nav">
        ${navItems}
      </nav>
      <div class="lt-menu-footer">
        <div class="lt-user-info" id="ltUserInfo">
          <div class="lt-user-label">CONNECTÉ</div>
          <div class="lt-user-email" id="ltUserEmail">—</div>
          <a href="./compte.html" style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:4px;border-radius:6px;color:#F2F4F7;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Mon compte
          </a>
          <button class="lt-logout-btn" onclick="ltLogout()">Se déconnecter</button>
        </div>
        <a class="lt-nav-item" id="ltLoginItem" href="#" onclick="ltOpenLogin();return false;">
          <span class="lt-nav-icon"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span> Connexion / Inscription
        </a>
        <div class="lt-lang-toggle">
          <button class="lt-lang-btn" id="ltLangFR" onclick="ltSetLang('fr')">FR</button>
          <button class="lt-lang-btn" id="ltLangEN" onclick="ltSetLang('en')">EN</button>
        </div>
      </div>
    </div>
  `;

  // L'ancien drawer « Le Terminal Hub » ne doit JAMAIS s'afficher sur les pages
  // dotées de la nouvelle barre latérale (appshell.js). On ne l'injecte que sur
  // les pages sans appshell (ex. index.html, legal.html) pour préserver leur nav.
  var _hasAppshell = !!document.querySelector('script[src*="appshell.js"]');
  if (!_hasAppshell) {
    var container = document.createElement('div');
    container.innerHTML = menuHTML;
    document.body.appendChild(container);
  }

  // ── FUNCTIONS ──
  // Le bouton FR/EN bascule la langue (pastilles .lt-nav__pill).
  window.ltToggleLang = function() {
    var cur = (localStorage.getItem('lt_lang') === 'en') ? 'en' : 'fr';
    var next = cur === 'en' ? 'fr' : 'en';
    ltSetLang(next);
    Array.prototype.forEach.call(document.querySelectorAll('.lt-nav__pill'), function(p){
      if(p.id !== 'langToggle') p.textContent = next.toUpperCase();
    });
  };
  // Le menu latéral (drawer « Le Terminal Hub ») s'ouvre via le bouton ☰ —
  // utile notamment sur les vues Historique/Perfs qui recouvrent la barre latérale.
  window.ltOpenMenu = function() {
    var menu = document.getElementById('ltSideMenu');
    if(!menu) { return; }
    if(menu.classList.contains('open')) { ltCloseMenu(); }
    else { menu.classList.add('open'); document.body.classList.add('lt-menu-open'); }
  };
  window.ltCloseMenu = function() {
    var m = document.getElementById('ltSideMenu');
    if(m) m.classList.remove('open');
    document.body.classList.remove('lt-menu-open');
  };

  // ── SESSION (persistance + rafraîchissement du token) ──
  // Stocke la session Supabase : token d'accès + refresh token + horodatage d'expiration.
  // Le refresh token permet de rester connecté au-delà de ~1h sans devoir se reconnecter,
  // quel que soit l'appareil.
  function ltStoreSession(data, email) {
    if(!data || !data.access_token) return;
    localStorage.setItem('ta_token', data.access_token);
    if(data.refresh_token) localStorage.setItem('ta_refresh', data.refresh_token);
    // expires_in en secondes (défaut Supabase : 3600). On mémorise l'instant d'expiration absolu.
    var ttl = parseInt(data.expires_in, 10);
    if(!ttl || isNaN(ttl)) ttl = 3600;
    localStorage.setItem('ta_exp', String(Date.now() + ttl * 1000));
    if(email) localStorage.setItem('ta_email', email);
    else if(data.user && data.user.email) localStorage.setItem('ta_email', data.user.email);
  }
  window.ltStoreSession = ltStoreSession;

  // Rafraîchit le token d'accès s'il est expiré (ou sur le point de l'être) via le refresh token.
  // Renvoie une promesse résolue avec le token courant (rafraîchi si possible).
  // En cas d'échec réseau, on conserve le token existant (pas de déconnexion brutale).
  var _ltRefreshing = null;
  function ltEnsureSession() {
    var token = localStorage.getItem('ta_token') || '';
    if(!token) return Promise.resolve('');
    // Refresh mutualisé global (single-flight) : si le garde-fou de app.html a
    // défini window.ltRefreshToken, on l'utilise pour qu'il n'y ait JAMAIS deux
    // refresh concurrents sur le même refresh token Supabase (usage unique).
    if(typeof window.ltRefreshToken === 'function') return window.ltRefreshToken(false);
    var refresh = localStorage.getItem('ta_refresh') || '';
    var exp = parseInt(localStorage.getItem('ta_exp') || '0', 10);
    // Marge de 60s : on rafraîchit un peu avant l'expiration réelle.
    if(!refresh || (exp && Date.now() < exp - 60000)) return Promise.resolve(token);
    if(_ltRefreshing) return _ltRefreshing;
    _ltRefreshing = fetch('/api/auth', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'refresh', refresh_token:refresh})})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d && d.access_token) { ltStoreSession(d); return d.access_token; }
        return token; // refresh refusé → on garde le token existant, le check-pro tranchera
      })
      .catch(function(){ return token; })
      .finally(function(){ _ltRefreshing = null; });
    return _ltRefreshing;
  }
  window.ltEnsureSession = ltEnsureSession;

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
      if(lb) lb.style.display = 'inline-flex';
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
    // Quand connecté : s'assurer que la barre est visible et masquer le bouton loginBtn
    bar.style.display = 'inline-flex';
    var lb = document.getElementById('loginBtn');
    if(lb) lb.style.display = 'none';
    var initial = email.charAt(0).toUpperCase();
    var username = email.split('@')[0];
    var pseudo = localStorage.getItem('lt_pseudo') || '';
    var avatar = localStorage.getItem('lt_avatar') || '';
    var displayName = pseudo || username;
    var avatarInner = avatar ? '<img src="' + avatar + '" alt="">' : initial;
    var caret = '<span class="lt-ub-caret"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>';
    // Chip rectangulaire (même DA que les boutons) + menu déroulant avec profil + déconnexion
    bar.innerHTML =
      '<span id="ltTokenBadge" style="display:none" class="lt-ub-tokens"></span>' +
      '<div class="lt-ub-chip" id="ltUbChip" title="' + email + '">' +
        '<div class="lt-ub-avatar">' + avatarInner + '</div>' +
        '<span class="lt-ub-name">' + displayName + '</span>' + caret +
      '</div>' +
      '<div class="lt-ub-menu" id="ltUbMenu">' +
        '<div class="lt-ub-menu__mail">' + email + '</div>' +
        '<div id="ltUbStatusBadge" style="margin:6px 10px 10px;padding:6px 10px;border-radius:6px;font-family:Inter,system-ui,sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center;gap:6px;' + (isPro ? 'background:rgba(232,194,104,.12);border:1px solid rgba(232,194,104,.3);color:#E8C268' : 'background:rgba(127,184,232,.07);border:1px solid rgba(127,184,232,.18);color:#7FB8E8') + '">' +
          (isPro
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Premium'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg> Version gratuite') +
        '</div>' +
        '<a class="lt-ub-link" href="./compte.html" style="display:flex;align-items:center;gap:8px;padding:9px 10px;color:#F2F4F7;text-decoration:none;border-radius:6px;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;margin-bottom:4px;">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
          '<span>Mon compte</span></a>' +
        '<button type="button" class="lt-ub-logout" onclick="ltGlobalLogout()">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
          'Se déconnecter</button>' +
      '</div>';

    var chip = document.getElementById('ltUbChip');
    var menu = document.getElementById('ltUbMenu');
    if(chip && menu) {
      chip.addEventListener('click', function(e){
        e.stopPropagation();
        menu.classList.toggle('show');
        chip.classList.toggle('open');
      });
      // Ferme le menu si on clique ailleurs
      document.addEventListener('click', function(){
        menu.classList.remove('show');
        chip.classList.remove('open');
      });
    }

  }

  function _ltClearAllAccountData() {
    // Sauvegarde la progression sur le compte AVANT d'effacer le token (sinon perdu).
    try { if (window.ltFlushStats) window.ltFlushStats(); } catch (e) {}
    localStorage.removeItem('ta_token');
    localStorage.removeItem('ta_refresh');
    localStorage.removeItem('ta_exp');
    localStorage.removeItem('ta_email');
    localStorage.removeItem('ta_user_id');
    localStorage.removeItem('lt_pro');
    localStorage.removeItem('lt_history');
    localStorage.removeItem('lt_deleted');
    localStorage.removeItem('jnl_trades');
    localStorage.removeItem('lt_pseudo');
    localStorage.removeItem('lt_avatar');
    // Flags d'onboarding : on les efface pour qu'un AUTRE compte soit réévalué
    // contre le serveur (un questionnaire par compte, pas par appareil).
    localStorage.removeItem('lt_survey');
    localStorage.removeItem('lt_onboarded');
    // Progression (temps par outil, objectifs…) : effacée en local car rattachée
    // au COMPTE (serveur) ; rechargée au prochain login. Évite le mélange entre
    // deux comptes sur le même navigateur.
    localStorage.removeItem('lt_usage');
    localStorage.removeItem('lt_goals');
    localStorage.removeItem('jnl_notes');
    localStorage.removeItem('eco_unlocked');
    localStorage.removeItem('jnl_currency');
  }

  window.ltGlobalLogout = function() {
    _ltClearAllAccountData();
    if(typeof doLogout === 'function') { doLogout(); } else { window.location.href = './index.html'; }
  };

  // Charge le profil (pseudo + avatar) depuis le serveur si absent du cache
  var _ltProfileFetched = false;
  function _ltFetchProfile() {
    if(_ltProfileFetched) return;
    var tok = localStorage.getItem('ta_token');
    if(!tok) return;
    // Ne refetch que si pseudo ou avatar manquant
    if(localStorage.getItem('lt_pseudo') && localStorage.getItem('lt_avatar')) return;
    _ltProfileFetched = true;
    fetch('/api/profile', { method: 'GET', headers: { 'Authorization': 'Bearer ' + tok } })
      .then(function(r){ return r.json(); })
      .then(function(p){
        if(p.pseudo){ localStorage.setItem('lt_pseudo', p.pseudo); }
        if(p.avatar_url){ localStorage.setItem('lt_avatar', p.avatar_url); }
        if(p.pseudo || p.avatar_url){ ltRenderUserBar(); ltSyncUser(); }
      })
      .catch(function(){});
  }

  // Run sync after DOM is ready and after any checkSession finishes
  // Override updateUserUI on each page to also call ltSyncUser
  var _origUpdateUI = window.updateUserUI;
  window.updateUserUI = function() {
    if(typeof _origUpdateUI === 'function') _origUpdateUI();
    ltSyncUser();
    ltRenderUserBar();
    _ltFetchProfile();
  };

  window.ltLogout = function() {
    _ltClearAllAccountData();
    ltSyncUser();
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

  // ── AUTH MODAL GLOBAL ──
  var _ltSbUrl = '';
  fetch('/api/config').then(function(r){return r.json();}).then(function(d){_ltSbUrl=d.supabaseUrl||'';}).catch(function(){});

  function ltInjectAuthModal() {
    if(document.getElementById('ltAuthOverlay')) return;
    var style = document.createElement('style');
    style.textContent = [
      '#ltAuthOverlay{display:none;position:fixed;inset:0;z-index:9000;background:rgba(7,9,12,.8);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);align-items:center;justify-content:center;padding:20px}',
      '#ltAuthOverlay.show{display:flex;animation:ltFadeUp .3s cubic-bezier(0.16,1,0.3,1)}',
      '@keyframes ltFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',
      '#ltAuthBox{max-width:400px;width:100%;background:var(--bg-elevated,#161B24);border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-lg,10px);padding:32px;position:relative;text-align:center;box-shadow:0 32px 64px rgba(0,0,0,.6),0 0 0 1px rgba(127,184,232,.06)}',
      '.lta-close{position:absolute;top:14px;right:16px;background:transparent;border:none;color:var(--text-muted,#7E8794);font-size:20px;cursor:pointer;line-height:1;transition:color .15s}',
      '.lta-close:hover{color:var(--text-title,#F2F4F7)}',
      '.lta-title{font-family:var(--font-display,"Anton"),sans-serif;font-size:26px;font-weight:400;letter-spacing:.02em;text-transform:uppercase;color:var(--text-title,#F2F4F7);margin-bottom:6px}',
      '.lta-sub{font-size:13px;color:var(--text-muted,#7E8794);margin-bottom:20px}',
      '.lta-tabs{display:flex;gap:4px;margin-bottom:20px;border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-md,6px);padding:3px}',
      '.lta-tab{flex:1;padding:9px;background:transparent;border:none;border-radius:var(--r-sm,4px);color:var(--text-muted,#7E8794);font-family:var(--font-text,"Inter"),sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}',
      '.lta-tab.on{background:var(--accent-glow-soft,rgba(127,184,232,.12));color:var(--accent-bright,#BFDCF5)}',
      '.lta-google{width:100%;padding:11px;background:var(--bg-base,#07090C);border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-sm,4px);color:var(--text-body,#C3CAD4);font-family:var(--font-text,"Inter"),sans-serif;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s;margin-bottom:14px}',
      '.lta-google:hover{border-color:var(--accent,#7FB8E8);color:var(--text-title,#F2F4F7)}',
      '.lta-sep{display:flex;align-items:center;gap:10px;color:var(--text-muted,#7E8794);font-size:11px;margin-bottom:14px;text-transform:uppercase;letter-spacing:.1em}',
      '.lta-sep::before,.lta-sep::after{content:"";flex:1;height:1px;background:var(--border-subtle,#1C212A)}',
      '.lta-field{text-align:left;margin-bottom:12px}',
      '.lta-field label{display:block;font-family:var(--font-mono,"JetBrains Mono"),monospace;font-size:9px;font-weight:700;letter-spacing:.12em;color:var(--text-muted,#7E8794);margin-bottom:6px}',
      '.lta-field input{width:100%;padding:11px 14px;background:var(--bg-base,#07090C);border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-sm,4px);color:var(--text-title,#F2F4F7);font-family:var(--font-text,"Inter"),sans-serif;font-size:14px;box-sizing:border-box;outline:none;transition:border-color .2s,background .2s}',
      '.lta-field input:focus{border-color:var(--accent,#7FB8E8);background:var(--accent-glow-soft,rgba(127,184,232,.12))}',
      '.lta-submit{width:100%;padding:13px;background:var(--accent,#7FB8E8);border:1px solid transparent;border-radius:var(--r-sm,4px);color:#07090C;font-family:var(--font-text,"Inter"),sans-serif;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;cursor:pointer;margin-top:4px;box-shadow:0 0 0 1px var(--accent-glow,rgba(127,184,232,.35)),0 8px 28px var(--accent-glow,rgba(127,184,232,.35));transition:background .15s,transform .15s}',
      '.lta-submit:hover{background:var(--accent-bright,#BFDCF5);transform:translateY(-1px)}',
      '.lta-submit:disabled{opacity:.5;cursor:not-allowed;transform:none}',
      '.lta-error{font-size:12px;color:var(--bear,#F0647A);margin-top:10px;min-height:18px}'
    ].join('');
    document.head.appendChild(style);

    var div = document.createElement('div');
    div.id = 'ltAuthOverlay';
    div.innerHTML = [
      '<div id="ltAuthBox">',
      '<button type="button" class="lta-close" onclick="ltCloseAuthModal()">✕</button>',
      '<div class="lta-title">Bienvenue</div>',
      '<div class="lta-sub">Connectez-vous pour accéder à tous les outils</div>',
      '<div class="lta-tabs">',
      '<button type="button" class="lta-tab on" id="ltTabLogin" onclick="ltSwitchAuthTab(\'login\')">Connexion</button>',
      '<button type="button" class="lta-tab" id="ltTabSignup" onclick="ltSwitchAuthTab(\'signup\')">Créer un compte</button>',
      '</div>',
      '<button type="button" class="lta-google" onclick="ltDoGoogleAuth()">',
      '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
      'Continuer avec Google',
      '</button>',
      '<div class="lta-sep">ou</div>',
      '<div class="lta-field"><label>EMAIL</label><input type="email" id="ltAuthEmail" placeholder="vous@email.com" autocomplete="username"></div>',
      '<div class="lta-field"><label>MOT DE PASSE</label><input type="password" id="ltAuthPassword" placeholder="••••••••" autocomplete="current-password"></div>',
      '<button type="button" class="lta-submit" id="ltAuthSubmit" onclick="ltDoAuth()"><span id="ltAuthTxt">Se connecter</span></button>',
      '<div class="lta-error" id="ltAuthError"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(div);
    div.addEventListener('click', function(e){ if(e.target === div) ltCloseAuthModal(); });
  }

  var _ltAuthMode = 'login';

  window.ltSwitchAuthTab = function(mode) {
    _ltAuthMode = mode;
    var tl = document.getElementById('ltTabLogin');
    var ts = document.getElementById('ltTabSignup');
    var txt = document.getElementById('ltAuthTxt');
    if(tl) tl.classList.toggle('on', mode === 'login');
    if(ts) ts.classList.toggle('on', mode === 'signup');
    if(txt) txt.textContent = mode === 'login' ? 'Se connecter' : 'Créer mon compte';
    var err = document.getElementById('ltAuthError');
    if(err) err.textContent = '';
  };

  window.ltCloseAuthModal = function() {
    var el = document.getElementById('ltAuthOverlay');
    if(el) el.classList.remove('show');
  };

  window.ltDoGoogleAuth = function() {
    if(!_ltSbUrl) { setTimeout(ltDoGoogleAuth, 500); return; }
    // Après Google → revient sur la page courante (ou la destination en attente)
    var dest = sessionStorage.getItem('lt_gate_redirect') || window.location.href.split('#')[0];
    window.location.href = _ltSbUrl + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(dest);
  };

  window.ltDoAuth = async function() {
    var email = (document.getElementById('ltAuthEmail') || {}).value || '';
    var password = (document.getElementById('ltAuthPassword') || {}).value || '';
    var errEl = document.getElementById('ltAuthError');
    var btn = document.getElementById('ltAuthSubmit');
    var txt = document.getElementById('ltAuthTxt');
    if(!email || !password) { if(errEl) errEl.textContent = 'Remplissez tous les champs'; return; }
    if(btn) btn.disabled = true;
    if(txt) txt.textContent = _ltAuthMode === 'login' ? 'Connexion…' : 'Création…';
    try {
      var res = await fetch('/api/auth', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:_ltAuthMode, email:email.trim(), password:password})});
      var data = await res.json();
      if(data.access_token) {
        ltStoreSession(data, (data.user && data.user.email) || email.trim());
        ltCloseAuthModal();
        ltSyncUser();
        // Synchronisation complète (Premium + profil) sans rechargement.
        ltSyncAccount().then(function(){ if(typeof updateUserUI === 'function') updateUserUI(); });
      } else if(data.id) {
        if(errEl) { errEl.style.color='#4ADE9C'; errEl.textContent='Compte créé ! Vérifiez votre email.'; }
      } else {
        if(errEl) { errEl.style.color='#F0647A'; errEl.textContent = data.error_description || data.msg || data.message || 'Erreur'; }
      }
    } catch(e) {
      if(errEl) { errEl.style.color='#F0647A'; errEl.textContent = 'Erreur réseau'; }
    }
    if(btn) btn.disabled = false;
    if(txt) txt.textContent = _ltAuthMode === 'login' ? 'Se connecter' : 'Créer mon compte';
  };

  window.ltOpenLogin = function() {
    ltCloseMenu();
    if(typeof openAuth === 'function' && !document.getElementById('ltAuthOverlay')) {
      openAuth();
      return;
    }
    ltInjectAuthModal();
    var el = document.getElementById('ltAuthOverlay');
    if(el) { el.classList.add('show'); ltSwitchAuthTab('login'); }
  };

  // ── SYSTÈME I18N GLOBAL ──
  var LT_TRANSLATIONS = {
    fr: {
      // index.html — hero
      'hero-pill':        'Plateforme active · Mis à jour quotidiennement',
      'hero-title-1':     'Votre hub trading',
      'hero-title-2':     'propulsé par l\'IA.',
      'hero-sub':         'Analysez vos setups en quelques secondes, tenez votre journal, consultez le calendrier économique et maîtrisez votre gestion du risque. Tout en un seul endroit.',
      'hero-cta':         'Voir les outils',
      'chip-1':           'Feedback instantané',
      'chip-2':           'Toutes stratégies',
      'chip-3':           'Objectif & précis',
      'chip-4':           '100% sécurisé · Données privées',
      // index.html — sections
      'tools-eyebrow':    'Arsenal complet',
      'tools-title':      'Tous les outils dont vous avez besoin',
      'tools-sub':        'Chaque outil est conçu pour un aspect précis de votre trading. Ensemble, ils forment un écosystème complet.',
      'strat-eyebrow':    'Suite complète',
      'strat-title':      'Tous les outils, une seule plateforme.',
      'strat-desc':       'Du Setup Analyzer à la gestion du risque, en passant par la veille macro et le journal de trading — chaque outil est conçu pour vous aider à performer, pas juste à vous informer.',
      'process-eyebrow':  'Comment ça marche',
      'process-title':    'Une analyse complète en 4 étapes',
      'step1-num':'Étape 01','step1-title':'Uploadez votre chart','step1-desc':'Capture d\'écran de votre setup depuis TradingView ou votre plateforme. Glissez-déposez ou collez directement.',
      'step2-num':'Étape 02','step2-title':'L\'IA analyse','step2-desc':'Claude Opus scanne la structure, les zones clés, le contexte macro et les confluences de votre stratégie.',
      'step3-num':'Étape 03','step3-title':'Score & feedback','step3-desc':'Score /100, forces, faiblesses, niveaux de prix précis et verdict GO / ATTENDRE / NO-GO.',
      'step4-num':'Étape 04','step4-title':'Sauvegarde & suivi','step4-desc':'Chaque analyse est archivée. Enregistrez le résultat du trade et analysez vos stats dans le journal.',
      'tg-title':         'Rejoindre la communauté Telegram',
      'tg-sub':           'Analyses quotidiennes, setups en live et entraide entre traders',
      'tg-cta':           'Rejoindre →',
      'stat-lbl-1':'Outils actifs','stat-lbl-2':'Claude Opus','stat-lbl-3':'Stratégies','stat-lbl-4':'Disponible',
      // tool cards
      'tool-analyzer-name':'Setup Analyzer','tool-analyzer-desc':'Score IA de votre setup, compatible avec toutes les stratégies (ICT, SMC, Price Action…). Feedback instantané et annotations sur votre graphique.',
      'tool-journal-name':'Journal de Trading','tool-journal-desc':'Calendrier de vos trades, suivi P&L, screenshots, notes et analyse IA de vos patterns de performance.',
      'tool-eco-name':'Calendrier Éco','tool-eco-desc':'Tous les événements macroéconomiques clés — NFP, CPI, FOMC — organisés par région et impact attendu.',
      'tool-bubble-name':'Bubble Map','tool-bubble-desc':'Visualisez les flux de capitaux entre actifs en temps réel — crypto, forex, indices et matières premières.',
      'tool-calc-name':'Calculateur de Pips','tool-calc-desc':'Taille de position, valeur du pip, risque en devise et R:R optimal. Long/Short avec validation automatique.',
      // calculateur.html
      'calc-title':       'Calculateur de Pips',
      'calc-sub':         'Calculez votre taille de position et votre risque en quelques secondes.',
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
      'strat-eyebrow':    'Complete suite',
      'strat-title':      'All tools, one platform.',
      'strat-desc':       'From the Setup Analyzer to risk management, live macro news and your trading journal — every tool is built to help you perform, not just stay informed.',
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

  // Système « data-en » universel (inline) : le FR reste dans le HTML, l'anglais
  // dans l'attribut data-en. Fonctionne sur TOUTE page incluant menu.js. Sur les
  // pages éco, eco.js gère déjà data-en → on évite le doublon via le garde.
  function ltApplyDataEn(en) {
    document.querySelectorAll('[data-en]').forEach(function(el) {
      if (el.getAttribute('data-fr') === null) el.setAttribute('data-fr', el.innerHTML);
      el.innerHTML = en ? el.getAttribute('data-en') : el.getAttribute('data-fr');
    });
  }

  function ltApplyI18n(l) {
    var t = LT_TRANSLATIONS[l] || LT_TRANSLATIONS['fr'];
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if(t[key] !== undefined) el.textContent = t[key];
    });
    if (typeof window.ecoApplyLang !== 'function') ltApplyDataEn(l === 'en');
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
    var en = (l === 'en');
    // ── Synchro des deux clés localStorage (lt_lang + lte_lang) ──
    localStorage.setItem('lt_lang',  l);
    localStorage.setItem('lte_lang', l);
    // ── Boutons sidebar ──
    ltUpdateLangBtns(l);
    // ── Système data-i18n (index, calculateur…) ──
    ltApplyI18n(l);
    // ── Système data-en (pages éco — eco.js) ──
    if (typeof window.ecoApplyLang === 'function') window.ecoApplyLang(en);
    // ── Système setLang (app.html) ──
    if (typeof window.setLang === 'function') window.setLang(l);
    // ── Met à jour le bouton topbar #langToggle si présent ──
    var topBtn = document.getElementById('langToggle');
    if (topBtn) {
      var lbl = topBtn.querySelector('.lang__label');
      if (lbl) lbl.textContent = en ? 'FR' : 'EN';
      document.documentElement.lang = en ? 'en' : 'fr';
    }
    // ── Recharge les cartes dynamiques éco si présentes ──
    if (typeof window.ecoReloadNews === 'function') window.ecoReloadNews();
    // ── Re-localise le calendrier éco (titres FR/EN) si présent ──
    if (typeof window.ecoCalRelang === 'function') window.ecoCalRelang();
  };

  var _currentLang = localStorage.getItem('lt_lang') || 'fr';
  ltUpdateLangBtns(_currentLang);
  // Applique les traductions après chargement du DOM
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ ltApplyI18n(_currentLang); });
  } else {
    ltApplyI18n(_currentLang);
  }

  // ── Sous-menus au survol dans le menu « Outils » (chrome desktop) ──
  // Au survol d'un outil (Journal, Setup Analyzer, Calendrier, Patrimoine), un
  // flyout propose « Présentation » + l'accès direct à l'outil. Injecté en JS pour
  // s'appliquer sur toutes les pages sans toucher au HTML dupliqué de la nav.
  function ltEnhanceToolsDropdown() {
    var menu = document.querySelector('.lt-nav__menu');
    if (!menu || menu.getAttribute('data-sub') === '1') return;
    // Clés par nom de page propre (sans .html) ; cibles des liens en URLs propres.
    var SUBS = {
      'journal-presentation':    [['Présentation','Overview','/journal-presentation'], ['Ouvrir le journal','Open the journal','/journal']],
      'analyzer-presentation':   [['Présentation','Overview','/analyzer-presentation'], ["Ouvrir l'analyseur",'Open the analyzer','/app']],
      'calendrier-presentation': [['Présentation','Overview','/calendrier-presentation'], ['Ouvrir le calendrier','Open the calendar','/calendrier'], ['Édition du jour','Daily edition','/eco-edition']],
      'patrimoine-presentation': [['Présentation','Overview','/patrimoine-presentation'], ['Portefeuille','Portfolio','/patrimoine']]
    };
    if (!document.getElementById('ltNavSubCss')) {
      var st = document.createElement('style'); st.id = 'ltNavSubCss';
      st.textContent =
        '.lt-nav__subwrap{position:relative}'
        + '.lt-nav__menuitem.has-sub .lt-nav__menutop::after{content:"\\203A";margin-left:8px;color:var(--text-muted);font-size:15px;line-height:1}'
        + '.lt-nav__submenu{position:absolute;top:-8px;left:100%;margin-left:6px;min-width:232px;padding:8px;background:rgba(12,15,20,0.98);border:1px solid var(--border-subtle);border-radius:var(--r-lg,12px);box-shadow:var(--shadow-lg,0 24px 60px rgba(0,0,0,.6));display:flex;flex-direction:column;gap:2px;opacity:0;visibility:hidden;transform:translateX(-6px);pointer-events:none;transition:opacity .18s var(--ease-out,ease),transform .18s var(--ease-out,ease),visibility 0s linear .18s;z-index:30}'
        + '.lt-nav__submenu::before{content:"";position:absolute;top:0;left:-12px;width:12px;height:100%}'
        + '.lt-nav__subwrap:hover .lt-nav__submenu{opacity:1;visibility:visible;transform:none;pointer-events:auto;transition:opacity .18s var(--ease-out,ease),transform .18s var(--ease-out,ease)}'
        + '.lt-nav__subitem2{display:block;padding:9px 11px;border-radius:var(--r-md,8px);color:var(--text-body);text-decoration:none;font-family:var(--font-text,"Inter",sans-serif);font-size:13.5px;font-weight:500;transition:background .15s,color .15s}'
        + '.lt-nav__subitem2:hover{background:var(--accent-glow-soft);color:var(--text-title)}';
      document.head.appendChild(st);
    }
    var items = menu.querySelectorAll('.lt-nav__menuitem');
    Array.prototype.forEach.call(items, function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop().replace(/\.html$/, '');
      var sub = SUBS[href];
      if (!sub) return;
      var wrap = document.createElement('div'); wrap.className = 'lt-nav__subwrap';
      a.parentNode.insertBefore(wrap, a);
      a.classList.add('has-sub');
      wrap.appendChild(a);
      var fly = document.createElement('div'); fly.className = 'lt-nav__submenu';
      fly.innerHTML = sub.map(function (s) {
        return '<a class="lt-nav__subitem2" href="' + s[2] + '" data-en="' + s[1] + '">' + s[0] + '</a>';
      }).join('');
      wrap.appendChild(fly);
    });
    menu.setAttribute('data-sub', '1');
  }
  ltEnhanceToolsDropdown();

  // Init - run immediately and after checkSession completes
  window.ltRenderUserBar = ltRenderUserBar;
  ltSyncUser();
  ltRenderUserBar();
  // La synchro complète (token + Premium + profil) est déjà lancée plus haut via
  // ltSyncAccount() si un token est présent — elle met l'UI à jour sans rechargement.
  // Re-render after page auth logic runs (e.g. checkSession async)
  setTimeout(ltRenderUserBar, 800);
  setTimeout(ltRenderUserBar, 2000);
  // Run again after 1s to catch async checkSession result
  setTimeout(ltSyncUser, 800);
  setTimeout(ltSyncUser, 2000);

  // Re-sync when localStorage changes (cross-tab)
  window.addEventListener('storage', ltSyncUser);

  // ── CURSEUR POINT DORÉ NÉON (toutes les pages) ──
  (function(){
    // Désactivé : un seul curseur optimisé (#lt-c, transform + rAF, dans cursor.js / appshell.js)
    // gère désormais tout le site. L'ancien curseur mix-blend-mode (lourd au repaint) est retiré.
    return;
    if(window.matchMedia('(pointer: coarse)').matches) return; // mobile : skip

    // CSS
    var cs = document.createElement('style');
    cs.textContent = [
      '* { cursor: none !important; }',
      // mix-blend-mode:difference → le curseur s'inverse par rapport au fond,
      // donc toujours parfaitement visible (sombre, clair, image, graphique…).
      '#lt-cur-dot {',
        'position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none;',
        'width:9px;height:9px;border-radius:50%;',
        'background:#ffffff;mix-blend-mode:difference;',
        'transform:translate(-50%,-50%);',
        'transition:width .15s,height .15s;',
        'will-change:transform;',
      '}',
      '#lt-cur-ring {',
        'position:fixed;top:0;left:0;z-index:2147483646;pointer-events:none;',
        'width:26px;height:26px;border-radius:50%;',
        'border:2px solid #ffffff;mix-blend-mode:difference;',
        'transform:translate(-50%,-50%);',
        'transition:width .25s,height .25s,border-color .25s;',
        'will-change:transform;',
      '}',
      'body.lt-cur-hover #lt-cur-dot {',
        'width:12px;height:12px;',
      '}',
      'body.lt-cur-hover #lt-cur-ring {',
        'width:36px;height:36px;border-width:2.5px;',
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
    var dotScale = 1, ringScale = 1;

    // Position + échelle composées en un seul transform (jamais left/top → pas de layout)
    function drawDot(){  dot.style.transform  = 'translate3d('+mx+'px,'+my+'px,0) translate(-50%,-50%) scale('+dotScale+')'; }
    function drawRing(){ ring.style.transform = 'translate3d('+rx+'px,'+ry+'px,0) translate(-50%,-50%) scale('+ringScale+')'; }
    drawDot(); drawRing();

    document.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      drawDot();
      wakeLoop();
    });

    var hoverSel = 'a,button,input,select,textarea,[onclick],[role="button"]';
    document.addEventListener('mouseover', function(e){
      if(e.target.closest(hoverSel)) document.body.classList.add('lt-cur-hover');
    });
    document.addEventListener('mouseout', function(e){
      if(e.target.closest(hoverSel)) document.body.classList.remove('lt-cur-hover');
    });

    document.addEventListener('mousedown', function(){
      dotScale = 0.6; ringScale = 0.85;
      drawDot(); drawRing();
    });
    document.addEventListener('mouseup', function(){
      dotScale = 1; ringScale = 1;
      drawDot(); drawRing();
    });

    // Quand la souris entre dans un iframe (ex: TradingView bubble map),
    // les mousemove s'arrêtent → on masque le curseur custom et on restaure le natif
    var iframeStyle = document.createElement('style');
    iframeStyle.textContent = 'body.lt-in-iframe * { cursor: auto !important; } body.lt-in-iframe #lt-cur-dot, body.lt-in-iframe #lt-cur-ring { opacity: 0 !important; }';
    document.head.appendChild(iframeStyle);

    function enterIframe(){ document.body.classList.add('lt-in-iframe'); }
    function leaveIframe(){ document.body.classList.remove('lt-in-iframe'); }

    // On masque le curseur custom UNIQUEMENT quand le pointeur quitte réellement
    // la fenêtre/le document (ex: entre dans un iframe TradingView) — jamais sur
    // simple immobilité. Détection via mouseleave document + blur de la fenêtre
    // (un iframe qui prend le focus déclenche un blur du parent).
    document.addEventListener('mouseleave', enterIframe);
    document.addEventListener('mouseenter', leaveIframe);
    document.addEventListener('mousemove', leaveIframe);
    window.addEventListener('blur', function(){
      // Si le focus part vers un iframe de la page → on masque le curseur custom.
      if(document.activeElement && document.activeElement.tagName === 'IFRAME') enterIframe();
    });
    var s=document.createElement('style');
    s.textContent=
      'html,body,*{cursor:none!important}'+
      '#lt-p{position:fixed;z-index:2147483647;pointer-events:none;'+
      'width:9px;height:9px;border-radius:50%;'+
      'background:#7FB8E8;'+
      'box-shadow:0 0 7px 2px rgba(127,184,232,.7),0 0 16px 4px rgba(127,184,232,.35);'+
      'transform:translate(-50%,-50%);transition:opacity .2s;}'+
      '#lt-p.off{opacity:0}';
    document.head.appendChild(s);
    var el=document.createElement('div'); el.id='lt-p';
    function mount(){ document.body.appendChild(el); }
    document.body ? mount() : document.addEventListener('DOMContentLoaded',mount);
    document.addEventListener('mousemove',function(e){ el.style.left=e.clientX+'px'; el.style.top=e.clientY+'px'; });
    document.addEventListener('mouseleave',function(){ el.classList.add('off'); });
    document.addEventListener('mouseenter',function(){ el.classList.remove('off'); });
  })();

  // ── BANNIÈRE COOKIES ──
  // Gérée exclusivement par le module isolé `cookies.js` (#ltCookie, clé `lt_consent`),
  // conforme RGPD/ePrivacy (consentement révocable, gating TradingView). Ne PAS
  // réintroduire de bannière ici : cela créerait un doublon à l'écran.

  // ── INTERCEPTEUR GLOBAL : pages protégées sans connexion ──
  (function(){
    // Pages accessibles sans compte
    var LT_FREE = {
      '': true, 'index.html': true, 'landing.html': true,
      'bubble.html': true, 'calculateur.html': true, 'mur-des-trades.html': true,
      'tarifs.html': true, 'legal.html': true, 'avis.html': true,
    };

    function ltIsLoggedIn(){ return !!localStorage.getItem('ta_token'); }

    function ltPageSeg(href){
      if(!href) return '';
      try {
        var u = new URL(href, location.href);
        if(u.origin !== location.origin) return null; // externe → ne pas bloquer
        return u.pathname.split('/').pop() || 'index.html';
      } catch(e){ return ''; }
    }

    // Récupère le token OAuth après retour Google (hash #access_token=...)
    (function handleOAuth(){
      var hash = window.location.hash;
      if(!hash || hash.indexOf('access_token') === -1) return;
      var params = new URLSearchParams(hash.slice(1));
      var token = params.get('access_token');
      if(!token || params.get('token_type') !== 'bearer') return;
      history.replaceState(null, '', window.location.pathname + window.location.search);
      ltStoreSession({ access_token: token, refresh_token: params.get('refresh_token'), expires_in: params.get('expires_in') });
      // Synchronisation COMPLÈTE avant toute redirection : Premium + photo + pseudo +
      // nom à jour dès le retour de Google, sans clic ni rechargement supplémentaire.
      ltSyncAccount().finally(function(){
        var dest = sessionStorage.getItem('lt_gate_redirect');
        sessionStorage.removeItem('lt_gate_redirect');
        if(dest) window.location.replace(dest);
        else { ltSyncUser(); ltRenderUserBar(); }
      });
    })();

    document.addEventListener('click', function(e){
      if(ltIsLoggedIn()) return;
      var a = e.target.closest('a[href]');
      if(!a) return;
      var href = a.getAttribute('href');
      if(!href || href.charAt(0) === '#') return; // ancre pure → libre
      var seg = ltPageSeg(href);
      if(seg === null) return; // lien externe
      if(LT_FREE[seg]) return; // page libre

      e.preventDefault();
      e.stopPropagation();

      // Mémorise la destination pour la redirection post-connexion
      try {
        var abs = new URL(href, location.href).href;
        sessionStorage.setItem('lt_gate_redirect', abs);
      } catch(err){}

      ltInjectAuthModal();
      var el = document.getElementById('ltAuthOverlay');
      if(el) { el.classList.add('show'); ltSwitchAuthTab('login'); }
    }, true);

    // Après connexion par e-mail, redirige si une destination était en attente
    var _origDoAuth = window.ltDoAuth;
    window.ltDoAuth = async function(){
      await _origDoAuth.apply(this, arguments);
      if(localStorage.getItem('ta_token')){
        var dest = sessionStorage.getItem('lt_gate_redirect');
        if(dest){ sessionStorage.removeItem('lt_gate_redirect'); window.location.href = dest; }
      }
    };
  })();

})();
