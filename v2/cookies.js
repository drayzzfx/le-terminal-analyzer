/* Le Terminal — bannière de consentement (RGPD / ePrivacy).
   Module isolé, chargé sur toutes les pages (avant lang.js).

   Modèle : le stockage strictement nécessaire (session, préférences, données
   applicatives locales) ne requiert PAS de consentement (exemption ePrivacy).
   En revanche, les services tiers OPTIONNELS qui peuvent déposer des cookies ou
   transmettre l'adresse IP (widget TradingView, etc.) ne sont chargés QUE si
   l'utilisateur a cliqué « Tout accepter ».

   API exposée :
     window.ltConsent()      -> 'all' | 'essential' | null  (choix courant)
     window.ltHasConsent(k)  -> bool  (k='tradingview' pour l'instant ⇒ 'all')
     window.ltOpenConsent()  -> ré-affiche la bannière (lien « Gérer les cookies »)
   Événement : 'lt-consent-change' (detail = 'all' | 'essential') sur document. */
(function () {
  'use strict';
  var KEY = 'lt_consent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var EN = (function () { try { return localStorage.getItem('lt_lang') === 'en'; } catch (e) { return false; } })();

  window.ltConsent = function () { return get(); };
  window.ltHasConsent = function (/* feature */) { return get() === 'all'; };

  function injectCSS() {
    if (document.getElementById('ltCookieCss')) return;
    var s = document.createElement('style');
    s.id = 'ltCookieCss';
    s.textContent =
      '.ltc{position:fixed;left:0;right:0;bottom:0;z-index:3000;display:flex;justify-content:center;padding:14px;pointer-events:none}'
      + '.ltc__box{pointer-events:auto;max-width:760px;width:100%;display:flex;gap:18px;align-items:center;flex-wrap:wrap;background:var(--bg-elevated,#161B24);border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-lg,10px);padding:16px 18px;box-shadow:0 18px 48px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.04);animation:ltcUp .35s cubic-bezier(.16,1,.3,1)}'
      + '@keyframes ltcUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'
      + '.ltc__txt{flex:1;min-width:240px}'
      + '.ltc__txt strong{display:block;font-family:var(--font-text,"Inter",sans-serif);font-size:13px;font-weight:700;color:var(--text-title,#F2F4F7);margin-bottom:5px;letter-spacing:.01em}'
      + '.ltc__txt p{margin:0;font-family:var(--font-text,"Inter",sans-serif);font-size:12px;line-height:1.6;color:var(--text-body,#C3CAD4)}'
      + '.ltc__txt a.ltc__more{color:var(--accent,#7FB8E8);text-decoration:none;font-weight:600}'
      + '.ltc__txt a.ltc__more:hover{color:var(--accent-bright,#BFDCF5)}'
      + '.ltc__btns{display:flex;gap:9px;align-items:center;flex-wrap:wrap}'
      + '.ltc__btn{font-family:var(--font-text,"Inter",sans-serif);font-size:12.5px;font-weight:600;letter-spacing:.02em;border-radius:var(--r-sm,4px);padding:9px 16px;cursor:pointer;transition:background .15s,border-color .15s,color .15s;white-space:nowrap}'
      + '.ltc__btn--ghost{background:transparent;border:1px solid var(--border,#3A414C);color:var(--text-body,#C3CAD4)}'
      + '.ltc__btn--ghost:hover{border-color:var(--accent,#7FB8E8);color:var(--text-title,#F2F4F7)}'
      + '.ltc__btn--primary{background:var(--accent,#7FB8E8);border:1px solid transparent;color:#07090C;box-shadow:0 0 0 1px var(--accent-glow,rgba(127,184,232,.35)),0 8px 24px var(--accent-glow,rgba(127,184,232,.3))}'
      + '.ltc__btn--primary:hover{background:var(--accent-bright,#BFDCF5)}'
      + '@media(max-width:560px){.ltc__btns{width:100%}.ltc__btn{flex:1;text-align:center}}';
    document.head.appendChild(s);
  }

  function render() {
    if (document.getElementById('ltCookie')) return;
    injectCSS();
    var t = EN ? {
      title: 'Cookies & privacy',
      body: 'Le Terminal uses no advertising or cross-site tracking cookies. We store only what is strictly necessary to run the service. Some optional content (TradingView charts) relies on third-party services that may set cookies. You can accept it or stick to essentials.',
      more: 'Learn more',
      ess: 'Essentials only',
      all: 'Accept all'
    } : {
      title: 'Cookies & confidentialité',
      body: "Le Terminal n'utilise aucun cookie publicitaire ni traceur intersites. Nous ne stockons que le strict nécessaire au fonctionnement du service. Certains contenus optionnels (graphiques TradingView) font appel à des services tiers susceptibles de déposer des cookies. Vous pouvez les accepter ou vous limiter à l'essentiel.",
      more: 'En savoir plus',
      ess: 'Essentiels uniquement',
      all: 'Tout accepter'
    };
    var wrap = document.createElement('div');
    wrap.className = 'ltc';
    wrap.id = 'ltCookie';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', t.title);
    wrap.innerHTML =
      '<div class="ltc__box">'
      + '<div class="ltc__txt"><strong data-en="Cookies &amp; privacy">' + t.title + '</strong>'
      + '<p>' + t.body + ' <a class="ltc__more" href="./legal.html#cookies" data-en="Learn more">' + t.more + '</a></p></div>'
      + '<div class="ltc__btns">'
      + '<button type="button" class="ltc__btn ltc__btn--ghost" id="ltcEssential" data-en="Essentials only">' + t.ess + '</button>'
      + '<button type="button" class="ltc__btn ltc__btn--primary" id="ltcAll" data-en="Accept all">' + t.all + '</button>'
      + '</div></div>';
    document.body.appendChild(wrap);
    document.getElementById('ltcAll').addEventListener('click', function () { choose('all'); });
    document.getElementById('ltcEssential').addEventListener('click', function () { choose('essential'); });
  }

  function choose(v) {
    set(v);
    var el = document.getElementById('ltCookie');
    if (el) el.parentNode.removeChild(el);
    try { document.dispatchEvent(new CustomEvent('lt-consent-change', { detail: v })); } catch (e) {}
  }

  window.ltOpenConsent = function () { render(); };

  // Rend le consentement révocable « aussi facilement qu'il a été donné » (RGPD art. 7-3) :
  //  - tout élément [data-cookie-settings] rouvre la bannière ;
  //  - un lien « Gérer les cookies » est ajouté à côté du lien Cookies des pieds de page.
  function wireManage() {
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
      if (t) { e.preventDefault(); render(); }
    });
    try {
      var sel = 'footer a[href*="legal.html#cookies"], .ltf a[href*="legal.html#cookies"], .lg-footer a[href*="legal.html#cookies"]';
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (a) {
        if (a.getAttribute('data-lt-mgr')) return;
        var m = document.createElement('a');
        m.href = '#'; m.className = a.className;
        m.setAttribute('data-en', 'Manage cookies');
        m.setAttribute('data-cookie-settings', '');
        m.textContent = EN ? 'Manage cookies' : 'Gérer les cookies';
        a.parentNode.insertBefore(m, a.nextSibling);
        a.setAttribute('data-lt-mgr', '1');
      });
    } catch (e) {}
  }

  function init() { wireManage(); if (!get()) render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
