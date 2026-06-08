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
      { icon: '📰', label: 'Édition du jour', href: './eco-edition.html', children: [
        { icon: '⭐', label: 'La sélection',  href: './eco-selection.html' },
        { icon: '🇪🇺', label: 'Europe',        href: './eco-europe.html' },
        { icon: '🌎', label: 'Amériques',     href: './eco-ameriques.html' },
        { icon: '🌏', label: 'Asie',          href: './eco-asie.html' },
        { icon: '📈', label: 'Marchés',       href: './eco-marches.html' },
        { icon: '🏛️', label: 'Institutions',  href: './eco-institutions.html' },
        { icon: '🌐', label: 'International',  href: './eco-international.html' },
      ] },
      { icon: '⚡', label: 'Flash Info',      href: './eco-flash.html' },
      { icon: '📅', label: 'Calendrier éco',  href: './eco-calendrier.html' },
      { icon: '🪙', label: 'Crypto',          href: './eco-crypto.html' },
    ] },
    { id: 'app.html',         icon: ICONS.analyzer,   label: 'Setup Analyzer',      href: './app.html' },
    { id: 'bubble.html',      icon: ICONS.bubble,     label: 'Bubble Map',          href: './bubble.html' },
    { id: 'calculateur.html', icon: ICONS.calc,       label: 'Calculateur de Pips', href: './calculateur.html' },
  ];

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent = `
    .lt-menu-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      z-index: 998; opacity: 0; pointer-events: none;
      transition: opacity .3s; backdrop-filter: blur(4px);
    }
    .lt-menu-overlay.open { opacity: 1; pointer-events: all; }

    .lt-side-menu {
      position: fixed; top: 0; left: 0; bottom: 0; width: 280px;
      background: #0D0D1A; border-right: 1px solid rgba(255,255,255,.08);
      z-index: 999; transform: translateX(-100%);
      transition: transform .35s cubic-bezier(.2,0,.1,1);
      display: flex; flex-direction: column; overflow: hidden;
    }
    .lt-side-menu.open { transform: translateX(0); box-shadow: 20px 0 60px rgba(0,0,0,.6); }

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
  `;
  document.head.appendChild(style);

  // ── HTML ──
  var CARET = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

  // Détection de l'item courant à partir du nom de fichier du href
  function fileOf(h) { return (h || '').split('/').pop().split('#')[0]; }
  function selfActive(node) { return fileOf(node.href) === page && page !== ''; }
  function treeActive(node) {
    if(selfActive(node)) return true;
    return !!(node.children && node.children.some(treeActive));
  }

  // Rendu récursif d'une sous-entrée (peut elle-même avoir des enfants → 3e niveau)
  function renderSub(c, depth) {
    var act = selfActive(c) ? ' active' : '';
    if(c.children && c.children.length) {
      var inner = c.children.map(function(cc) { return renderSub(cc, depth + 1); }).join('');
      return '<div class="lt-subnav-group">' +
               '<div class="lt-subnav-row">' +
                 '<a class="lt-subnav-item' + act + '" href="' + c.href + '"><span class="lt-subnav-ic">' + c.icon + '</span>' + c.label + '</a>' +
                 '<button class="lt-nav-caret lt-caret-sm open" type="button" aria-label="Déplier" onclick="ltToggleSub(event, this)">' + CARET + '</button>' +
               '</div>' +
               '<div class="lt-subnav lt-subnav--deep open"><div>' + inner + '</div></div>' +
             '</div>';
    }
    return '<a class="lt-subnav-item' + act + '" href="' + c.href + '"><span class="lt-subnav-ic">' + c.icon + '</span>' + c.label + '</a>';
  }

  var navItems = PAGES.map(function(p) {
    var isActive = page === p.id || (page === '' && p.id === 'index.html') || treeActive(p);
    var cls = 'lt-nav-item' + (isActive ? ' active' : '') + (p.soon ? ' soon' : '');
    var soon = p.soon ? '<span class="lt-nav-soon">Bientôt</span>' : '';
    if(p.children && p.children.length) {
      var subItems = p.children.map(function(c) { return renderSub(c, 1); }).join('');
      return '<div class="lt-nav-group">' +
               '<div class="lt-nav-row">' +
                 '<a class="' + cls + '" href="' + p.href + '"><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + '</a>' +
                 '<button class="lt-nav-caret open" type="button" aria-label="Déplier" onclick="ltToggleSub(event, this)">' + CARET + '</button>' +
               '</div>' +
               '<div class="lt-subnav open"><div>' + subItems + '</div></div>' +
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
      </div>
    </div>
  `;

  var container = document.createElement('div');
  container.innerHTML = menuHTML;
  document.body.appendChild(container);

  // ── FUNCTIONS ──
  window.ltOpenMenu = function() {
    document.getElementById('ltSideMenu').classList.add('open');
    document.getElementById('ltMenuOverlay').classList.add('open');
  };
  window.ltCloseMenu = function() {
    document.getElementById('ltSideMenu').classList.remove('open');
    document.getElementById('ltMenuOverlay').classList.remove('open');
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

  // Run sync after DOM is ready and after any checkSession finishes
  // Override updateUserUI on each page to also call ltSyncUser
  var _origUpdateUI = window.updateUserUI;
  window.updateUserUI = function() {
    if(typeof _origUpdateUI === 'function') _origUpdateUI();
    ltSyncUser();
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

  // Init - run immediately and after checkSession completes
  ltSyncUser();
  // Run again after 1s to catch async checkSession result
  setTimeout(ltSyncUser, 800);
  setTimeout(ltSyncUser, 2000);

  // Re-sync when localStorage changes (cross-tab)
  window.addEventListener('storage', ltSyncUser);

})();
