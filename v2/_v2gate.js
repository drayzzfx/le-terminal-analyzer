/* ============================================================
   Le Terminal — GATE d'accès à la version 2 (privée)
   Chargé en tout premier dans <head> de chaque page /v2/.
   Verrouille la page tant que le visiteur n'est pas connecté
   avec un compte autorisé (Romain + Adrien).
   Réutilise les comptes Supabase existants via /api/auth.
   ============================================================ */
(function () {
  // --- Comptes autorisés (en minuscules) -----------------------------------
  // ⚠️ Remplacer l'email d'Adrien par le vrai avant mise en production.
  var ALLOW = [
    'smk.romain@gmail.com',
    'obstetar.adrien@gmail.com'
  ].map(function (s) { return s.trim().toLowerCase(); });

  // --- Désactive le service worker sous /v2/ (évite le cache pendant l'itération)
  try {
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.getRegistrations) {
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          rs.forEach(function (r) {
            try { if (String(r.scope).indexOf('/v2') !== -1) r.unregister(); } catch (e) {}
          });
        }).catch(function () {});
      }
      try { navigator.serviceWorker.register = function () { return Promise.resolve(); }; } catch (e) {}
    }
  } catch (e) {}

  function allowed(e) { return ALLOW.indexOf(String(e || '').trim().toLowerCase()) >= 0; }

  // --- Verrou visuel immédiat (avant le rendu du <body>) --------------------
  var lockStyle = document.createElement('style');
  lockStyle.id = '_v2gate_style';
  lockStyle.textContent =
    'html._v2lock body{display:none!important}' +
    '#_v2gate{position:fixed;inset:0;z-index:2147483647;background:#0a0e14;color:#e6edf3;' +
    'display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px}' +
    '#_v2gate .box{width:100%;max-width:360px;text-align:center}' +
    '#_v2gate .logo{font-size:20px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}' +
    '#_v2gate .tag{display:inline-block;font-size:11px;font-weight:700;color:#4ADE9C;border:1px solid rgba(74,222,156,.35);' +
    'border-radius:999px;padding:3px 10px;margin-bottom:18px;text-transform:uppercase;letter-spacing:.08em}' +
    '#_v2gate .sub{font-size:13px;color:#8b98a9;margin-bottom:18px;line-height:1.5}' +
    '#_v2gate input{width:100%;box-sizing:border-box;background:#111722;border:1px solid #223044;color:#e6edf3;' +
    'border-radius:8px;padding:11px 13px;font-size:14px;margin-bottom:10px;outline:none}' +
    '#_v2gate input:focus{border-color:#4ADE9C}' +
    '#_v2gate button{width:100%;background:#4ADE9C;color:#06110b;border:0;border-radius:8px;padding:12px;' +
    'font-size:14px;font-weight:700;cursor:pointer;transition:filter .15s}' +
    '#_v2gate button:hover{filter:brightness(1.08)}' +
    '#_v2gate button:disabled{opacity:.6;cursor:default}' +
    '#_v2gate .err{min-height:16px;font-size:12.5px;margin-top:12px;color:#F0647A}' +
    '#_v2gate .load{font-size:13px;color:#8b98a9}';
  (document.head || document.documentElement).appendChild(lockStyle);
  document.documentElement.classList.add('_v2lock');

  var overlay = null;
  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = '_v2gate';
    document.documentElement.appendChild(overlay);
    return overlay;
  }
  function unlock() {
    document.documentElement.classList.remove('_v2lock');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }
  function showLoading() {
    ensureOverlay().innerHTML = '<div class="box"><div class="load">Vérification de l\'accès…</div></div>';
  }
  function showForm(msg, prefillEmail) {
    var o = ensureOverlay();
    o.innerHTML =
      '<div class="box">' +
        '<div class="logo">Le Terminal</div>' +
        '<div class="tag">Version 2 · Privé</div>' +
        '<div class="sub">' + (msg || 'Espace réservé. Connecte-toi avec ton compte autorisé.') + '</div>' +
        '<input id="_v2e" type="email" placeholder="Email" autocomplete="username" value="' + (prefillEmail || '') + '">' +
        '<input id="_v2p" type="password" placeholder="Mot de passe" autocomplete="current-password">' +
        '<button id="_v2btn">Accéder</button>' +
        '<div class="err" id="_v2err"></div>' +
      '</div>';
    var btn = o.querySelector('#_v2btn');
    var em = o.querySelector('#_v2e');
    var pw = o.querySelector('#_v2p');
    var err = o.querySelector('#_v2err');
    function submit() {
      var email = (em.value || '').trim();
      var pass = pw.value || '';
      if (!email || !pass) { err.textContent = 'Renseigne ton email et ton mot de passe.'; return; }
      if (!allowed(email)) { err.textContent = "Ce compte n'a pas accès à la version 2."; return; }
      btn.disabled = true; err.textContent = ''; btn.textContent = 'Connexion…';
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: email, password: pass })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.access_token) {
            var realEmail = (d.user && d.user.email) || email;
            if (!allowed(realEmail)) { err.textContent = "Ce compte n'a pas accès à la version 2."; reset(); return; }
            try {
              localStorage.setItem('ta_token', d.access_token);
              if (d.refresh_token) localStorage.setItem('ta_refresh', d.refresh_token);
              var ttl = parseInt(d.expires_in, 10); if (!ttl || isNaN(ttl)) ttl = 3600;
              localStorage.setItem('ta_exp', String(Date.now() + ttl * 1000));
              localStorage.setItem('ta_email', realEmail);
            } catch (e) {}
            unlock();
          } else {
            err.textContent = (d && (d.error_description || d.msg || d.message)) || 'Identifiants invalides.';
            reset();
          }
        })
        .catch(function () { err.textContent = 'Erreur réseau, réessaie.'; reset(); });
      function reset() { btn.disabled = false; btn.textContent = 'Accéder'; }
    }
    btn.onclick = submit;
    pw.onkeydown = function (e) { if (e.key === 'Enter') submit(); };
    em.onkeydown = function (e) { if (e.key === 'Enter') pw.focus(); };
    setTimeout(function () { (prefillEmail ? pw : em).focus(); }, 30);
  }

  // --- Décision -------------------------------------------------------------
  var email = '';
  try { email = localStorage.getItem('ta_email') || ''; } catch (e) {}

  if (allowed(email)) {
    // Session déjà autorisée → on ouvre immédiatement.
    unlock();
  } else {
    // Sinon, on affiche le formulaire dès que le DOM est prêt (l'overlay vit sur <html>).
    showLoading();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        showForm(email ? "Le compte connecté (" + email + ") n'a pas accès. Connecte-toi avec un compte autorisé." : null, allowed(email) ? email : '');
      });
    } else {
      showForm(email ? "Le compte connecté (" + email + ") n'a pas accès. Connecte-toi avec un compte autorisé." : null, '');
    }
  }
})();
