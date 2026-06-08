// ── LE TERMINAL · MENU LATERAL GLOBAL ──
// Inclure ce fichier dans toutes les pages du site

(function() {

  // Détecte la page active
  var page = window.location.pathname.split('/').pop() || 'index.html';

  var PAGES = [
    { id: 'index.html',       icon: '🏠', label: 'Dashboard',           href: './index.html' },
    { id: 'journal.html',     icon: '📒', label: 'Journal de Trading',  href: './journal.html' },
    { id: 'calendrier.html',  icon: '📅', label: 'Calendrier Éco',      href: './calendrier.html', soon: true },
    { id: 'app.html',         icon: '⚡', label: 'Setup Analyzer',      href: './app.html' },
    { id: 'bubble.html',      icon: '🫧', label: 'Bubble Map',          href: './bubble.html', soon: true },
    { id: 'calculateur.html', icon: '🧮', label: 'Calculateur de Pips', href: './calculateur.html', soon: true },
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
    .lt-menu-brand span { color: #A78BFA; }
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
    .lt-nav-item:hover { background: rgba(139,92,246,.1); color: #A78BFA; }
    .lt-nav-item.active {
      background: rgba(139,92,246,.15); color: #A78BFA;
      border: 1px solid rgba(139,92,246,.25);
    }
    .lt-nav-item.soon { opacity: .45; cursor: not-allowed; pointer-events: none; }
    .lt-nav-icon { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
    .lt-nav-soon {
      margin-left: auto; font-size: 9px; font-weight: 700;
      letter-spacing: .1em; color: #5A5570;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06);
      border-radius: 50px; padding: 2px 8px;
    }
    .lt-menu-divider { height: 1px; background: rgba(255,255,255,.06); margin: 6px 0; }

    .lt-menu-footer {
      padding: 12px; border-top: 1px solid rgba(255,255,255,.06); flex-shrink: 0;
    }
    .lt-user-info {
      display: none; padding: 10px 14px; border-radius: 10px;
      background: rgba(139,92,246,.06); border: 1px solid rgba(139,92,246,.15);
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
    .lt-hamburger:hover { background: rgba(139,92,246,.1); }
    .lt-hamburger span {
      display: block; width: 20px; height: 2px;
      background: #9B96B8; border-radius: 2px;
    }
  `;
  document.head.appendChild(style);

  // ── HTML ──
  var navItems = PAGES.map(function(p) {
    var isActive = page === p.id || (page === '' && p.id === 'index.html');
    var cls = 'lt-nav-item' + (isActive ? ' active' : '') + (p.soon ? ' soon' : '');
    var soon = p.soon ? '<span class="lt-nav-soon">Bientôt</span>' : '';
    if(p.soon) {
      return '<div class="' + cls + '"><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + soon + '</div>';
    }
    return '<a class="' + cls + '" href="' + p.href + '"><span class="lt-nav-icon">' + p.icon + '</span>' + p.label + soon + '</a>';
  }).join('');

  var menuHTML = `
    <div class="lt-menu-overlay" id="ltMenuOverlay" onclick="ltCloseMenu()"></div>
    <div class="lt-side-menu" id="ltSideMenu">
      <div class="lt-menu-header">
        <div class="lt-menu-brand">Le Terminal <span>Hub</span></div>
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
