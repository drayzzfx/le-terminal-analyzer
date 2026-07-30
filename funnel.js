/* ============================================================
   funnel.js — verrou « compte obligatoire » + paywall par feature.
   À inclure sur les pages outils. Expose window.funnelUse(feature).
   ============================================================ */
(function () {
  'use strict';
  if (window.__funnelLoaded) return; window.__funnelLoaded = true;

  var FEATURE_LABEL = {
    analyze: 'analyses de setup',
    eco: 'analyses d’annonce',
    journal: 'positions dans le journal',
    patrimoine: 'actifs dans le patrimoine'
  };
  var FREE_TEXT = {
    analyze: '1 analyse offerte', eco: '1 analyse offerte',
    journal: '3 positions offertes', patrimoine: '3 actifs offerts'
  };

  function tok() { return localStorage.getItem('ta_token'); }
  function isAuthed() { return !!tok(); }

  // ── CSS ──
  var css = ''
    + '.fnl-ov{position:fixed;inset:0;z-index:9000;display:none;align-items:center;justify-content:center;padding:20px;'
    + 'background:rgba(4,6,11,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}'
    + '.fnl-ov.show{display:flex;animation:fnlFade .28s cubic-bezier(.16,1,.3,1)}'
    + '@keyframes fnlFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}'
    + '.fnl-box{width:100%;max-width:430px;background:#0E1219;border:1px solid rgba(59,125,255,.22);border-radius:14px;'
    + 'padding:34px 30px;position:relative;text-align:center;font-family:Inter,system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.6)}'
    + '.fnl-box::before{content:"";position:absolute;top:0;left:28px;right:28px;height:1px;background:linear-gradient(90deg,transparent,rgba(59,125,255,.6),transparent)}'
    + '.fnl-logo{font-family:Anton,sans-serif;font-size:24px;text-transform:uppercase;letter-spacing:.06em;color:#F2F4F7;margin-bottom:6px}'
    + '.fnl-logo span{color:#7FB8E8}'
    + '.fnl-title{font-family:Anton,sans-serif;font-size:20px;text-transform:uppercase;letter-spacing:.02em;color:#F2F4F7;margin:10px 0 6px}'
    + '.fnl-sub{font-size:13.5px;line-height:1.55;color:#9BA3AF;margin-bottom:20px}'
    + '.fnl-sub b{color:#7FB8E8}'
    + '.fnl-gbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;background:#fff;color:#1a1a1a;'
    + 'border:none;border-radius:9px;font-family:Inter,sans-serif;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:14px;transition:opacity .15s}'
    + '.fnl-gbtn:hover{opacity:.9}'
    + '.fnl-or{display:flex;align-items:center;gap:12px;color:#5A616C;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:6px 0 14px}'
    + '.fnl-or::before,.fnl-or::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.08)}'
    + '.fnl-field{text-align:left;margin-bottom:11px}'
    + '.fnl-field label{display:block;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#7E8794;margin-bottom:6px}'
    + '.fnl-field input{width:100%;box-sizing:border-box;background:#101724;border:1px solid #1C212A;border-radius:8px;padding:11px 13px;color:#F2F4F7;font-family:Inter,sans-serif;font-size:14px;outline:none;transition:border-color .15s}'
    + '.fnl-field input:focus{border-color:#3B7DFF}'
    + '.fnl-submit{width:100%;padding:13px;background:#3B7DFF;border:none;border-radius:9px;color:#fff;font-family:Inter,sans-serif;'
    + 'font-size:14.5px;font-weight:700;cursor:pointer;margin-top:6px;transition:background .15s}'
    + '.fnl-submit:hover{background:#5A93FF}.fnl-submit:disabled{opacity:.6;cursor:not-allowed}'
    + '.fnl-err{font-size:12.5px;color:#F0647A;margin-top:10px;min-height:16px}'
    + '.fnl-switch{font-size:13px;color:#9BA3AF;margin-top:16px}'
    + '.fnl-switch a{color:#7FB8E8;cursor:pointer;text-decoration:none;font-weight:600}'
    + '.fnl-back{position:absolute;top:14px;left:16px;color:#5A616C;font-size:12px;text-decoration:none}'
    + '.fnl-back:hover{color:#9BA3AF}'
    + '.fnl-close{position:absolute;top:12px;right:14px;background:none;border:none;color:#5A616C;font-size:20px;cursor:pointer;line-height:1}'
    + '.fnl-close:hover{color:#C3CAD4}'
    + '.fnl-pill{display:inline-flex;align-items:center;gap:7px;font-family:"JetBrains Mono",monospace;font-size:11px;font-weight:700;'
    + 'letter-spacing:.06em;color:#E8C268;border:1px solid rgba(232,194,104,.35);background:rgba(232,194,104,.08);border-radius:999px;padding:4px 11px;margin-bottom:16px}'
    + '.fnl-price{display:flex;gap:10px;justify-content:center;margin:18px 0 4px;flex-wrap:wrap}'
    + '.fnl-plan{flex:1;min-width:120px;border:1px solid #1C212A;border-radius:10px;padding:14px 12px;background:#101724}'
    + '.fnl-plan b{display:block;font-family:"JetBrains Mono",monospace;font-size:20px;color:#F2F4F7}'
    + '.fnl-plan span{font-size:11px;color:#7E8794}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ── Overlays ──
  var GOOGLE_SVG = '<svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>';

  var acct = document.createElement('div');
  acct.className = 'fnl-ov'; acct.id = 'fnlAcct';
  acct.innerHTML = ''
    + '<div class="fnl-box">'
    + '<a class="fnl-back" href="/">← Accueil</a>'
    + '<div class="fnl-logo">LE <span>TERMINAL</span></div>'
    + '<div class="fnl-title" id="fnlAcctTitle">Crée ton compte gratuit</div>'
    + '<div class="fnl-sub" id="fnlAcctSub">Accès immédiat aux outils — <b>sans carte bancaire</b>.</div>'
    + '<button class="fnl-gbtn" id="fnlGoogle">' + GOOGLE_SVG + ' Continuer avec Google</button>'
    + '<div class="fnl-or">ou</div>'
    + '<div class="fnl-field"><label>E-mail</label><input type="email" id="fnlEmail" placeholder="vous@exemple.com" autocomplete="email"></div>'
    + '<div class="fnl-field"><label>Mot de passe</label><input type="password" id="fnlPass" placeholder="8 caractères minimum" autocomplete="new-password"></div>'
    + '<button class="fnl-submit" id="fnlSubmit">Créer mon compte</button>'
    + '<div class="fnl-err" id="fnlErr"></div>'
    + '<div class="fnl-switch" id="fnlSwitch">Déjà un compte ? <a id="fnlToggle">Se connecter</a></div>'
    + '</div>';

  var pay = document.createElement('div');
  pay.className = 'fnl-ov'; pay.id = 'fnlPay';
  pay.innerHTML = ''
    + '<div class="fnl-box">'
    + '<button class="fnl-close" id="fnlPayClose" aria-label="Fermer">✕</button>'
    + '<div class="fnl-pill">★ Essai gratuit terminé</div>'
    + '<div class="fnl-title">Passe au Premium</div>'
    + '<div class="fnl-sub" id="fnlPaySub">Tu as utilisé ton essai gratuit. Passe Premium pour un accès illimité à tous les outils.</div>'
    + '<div class="fnl-price">'
    + '<div class="fnl-plan"><b>29,99 €</b><span>par mois</span></div>'
    + '<div class="fnl-plan"><b>–</b><span>ou annuel, économise</span></div>'
    + '</div>'
    + '<a class="fnl-submit" id="fnlPayCta" href="/tarifs" style="display:block;text-decoration:none;margin-top:16px">Voir les offres Premium</a>'
    + '</div>';

  function mount() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', mount); return; }
    document.body.appendChild(acct); document.body.appendChild(pay);
    wire();
    if (!isAuthed()) showAcct();
  }

  // ── Show/hide ──
  function showAcct() { document.getElementById('fnlAcct').classList.add('show'); try { document.documentElement.style.overflow = 'hidden'; } catch (e) {} }
  function hideAcct() { document.getElementById('fnlAcct').classList.remove('show'); try { document.documentElement.style.overflow = ''; } catch (e) {} }
  function showPay(feature) {
    var sub = document.getElementById('fnlPaySub');
    if (sub && feature && FEATURE_LABEL[feature]) sub.innerHTML = 'Tu as utilisé ton essai gratuit pour les <b>' + FEATURE_LABEL[feature] + '</b>. Passe Premium pour un accès illimité.';
    document.getElementById('fnlPay').classList.add('show');
  }
  function hidePay() { document.getElementById('fnlPay').classList.remove('show'); }

  // ── Auth ──
  var mode = 'signup';
  function authApi(action, body) {
    return fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ action: action }, body)) }).then(function (r) { return r.json(); });
  }
  function onSuccess(d) {
    if (d && d.session && d.session.access_token) {
      localStorage.setItem('ta_token', d.session.access_token);
      if (d.session.refresh_token) localStorage.setItem('ta_refresh', d.session.refresh_token);
      if (d.session.expires_in) localStorage.setItem('ta_exp', String(Date.now() + (parseInt(d.session.expires_in, 10) || 3600) * 1000));
      if (d.user && d.user.email) localStorage.setItem('ta_email', d.user.email);
    }
    location.reload();
  }
  function submit() {
    var email = document.getElementById('fnlEmail').value.trim();
    var pass = document.getElementById('fnlPass').value;
    var err = document.getElementById('fnlErr');
    var btn = document.getElementById('fnlSubmit');
    err.style.color = ''; err.textContent = '';
    if (!email || !pass) { err.textContent = 'Renseigne ton e-mail et ton mot de passe.'; return; }
    if (mode === 'signup' && pass.length < 8) { err.textContent = 'Le mot de passe doit faire 8 caractères minimum.'; return; }
    btn.disabled = true; btn.textContent = (mode === 'signup' ? 'Création…' : 'Connexion…');
    authApi(mode, { email: email, password: pass })
      .then(function (d) {
        if (d && d.session) { onSuccess(d); }
        else if (mode === 'signup' && d && d.user && !d.session) { err.style.color = '#4ADE9C'; err.textContent = 'Compte créé ! Vérifie ton e-mail pour confirmer, puis connecte-toi.'; }
        else { err.textContent = (d && d.error) || (mode === 'signup' ? 'Erreur lors de la création.' : 'Identifiants incorrects.'); }
      })
      .catch(function () { err.textContent = 'Erreur réseau, réessaie.'; })
      .finally(function () { btn.disabled = false; btn.textContent = (mode === 'signup' ? 'Créer mon compte' : 'Se connecter'); });
  }
  function toggleMode() {
    mode = (mode === 'signup') ? 'login' : 'signup';
    document.getElementById('fnlAcctTitle').textContent = mode === 'signup' ? 'Crée ton compte gratuit' : 'Connexion';
    document.getElementById('fnlAcctSub').innerHTML = mode === 'signup' ? 'Accès immédiat aux outils — <b>sans carte bancaire</b>.' : 'Ravi de te revoir.';
    document.getElementById('fnlSubmit').textContent = mode === 'signup' ? 'Créer mon compte' : 'Se connecter';
    document.getElementById('fnlPass').setAttribute('autocomplete', mode === 'signup' ? 'new-password' : 'current-password');
    document.getElementById('fnlSwitch').innerHTML = mode === 'signup' ? 'Déjà un compte ? <a id="fnlToggle">Se connecter</a>' : 'Pas encore de compte ? <a id="fnlToggle">Créer un compte</a>';
    document.getElementById('fnlToggle').addEventListener('click', toggleMode);
    document.getElementById('fnlErr').textContent = '';
  }

  var _supabaseUrl = '';
  fetch('/api/config').then(function (r) { return r.json(); }).then(function (d) { _supabaseUrl = d.supabaseUrl || ''; }).catch(function () {});
  function doGoogle() {
    if (!_supabaseUrl) { setTimeout(doGoogle, 350); return; }
    var redirectTo = window.location.origin + window.location.pathname;
    window.location.href = _supabaseUrl + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(redirectTo);
  }
  // Callback OAuth Google (#access_token=… au retour)
  (function () {
    var hash = window.location.hash || '';
    if (hash.indexOf('access_token') === -1) return;
    var params = new URLSearchParams(hash.slice(1));
    var t = params.get('access_token');
    if (!t) return;
    localStorage.setItem('ta_token', t);
    var rt = params.get('refresh_token'); if (rt) localStorage.setItem('ta_refresh', rt);
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'user', token: t }) })
      .then(function (r) { return r.json(); })
      .then(function (u) { if (u && u.email) localStorage.setItem('ta_email', u.email); })
      .finally(function () { history.replaceState(null, '', window.location.pathname + window.location.search); });
  })();

  function wire() {
    document.getElementById('fnlSubmit').addEventListener('click', submit);
    document.getElementById('fnlPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    document.getElementById('fnlEmail').addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('fnlPass').focus(); });
    document.getElementById('fnlToggle').addEventListener('click', toggleMode);
    document.getElementById('fnlGoogle').addEventListener('click', doGoogle);
    document.getElementById('fnlPayClose').addEventListener('click', hidePay);
  }

  // ── API publique ──
  window.funnelUse = function (feature) {
    return new Promise(function (resolve) {
      if (!isAuthed()) { showAcct(); resolve({ ok: false, needAuth: true }); return; }
      fetch('/api/usage', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok() }, body: JSON.stringify({ action: 'use', feature: feature }) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.ok) { resolve({ ok: true, remaining: d.remaining, unlimited: d.unlimited }); }
          else if (d && d.blocked) { showPay(feature); resolve({ ok: false, blocked: true }); }
          else if (d && (d.error === 'Not authenticated' || d.error === 'Invalid session')) { localStorage.removeItem('ta_token'); showAcct(); resolve({ ok: false, needAuth: true }); }
          else { resolve({ ok: false, error: (d && d.error) || 'usage' }); }
        })
        .catch(function () { resolve({ ok: false, error: 'network' }); });
    });
  };
  window.funnelPaywall = showPay;
  window.funnelShowAccount = showAcct;
  window.funnelIsAuthed = isAuthed;

  mount();
})();
