/* Le Terminal — Onboarding (questionnaire d'accueil après inscription/connexion).
   Module isolé, chargé sur toutes les pages (avant lang.js).

   - Apparaît UNE fois pour un utilisateur connecté qui n'a pas encore répondu
     (flag localStorage lt_survey). Couvre l'inscription email ET Google OAuth.
   - Questionnaire en étapes (niveau, marché, objectif, acquisition), puis une
     étape « tarifs » avec une croix pour passer sans payer.
   - Réponses enregistrées en local + best-effort vers /api/onboarding.
   - Neutralise l'ancien tour (lt_onboarded) pour éviter le double-overlay. */
(function () {
  'use strict';
  if (window._ltOnbInit) return; window._ltOnbInit = true;

  function tok() { try { return localStorage.getItem('ta_token') || ''; } catch (e) { return ''; } }
  function isDone() { try { return !!(localStorage.getItem('lt_survey') || localStorage.getItem('lt_onboarded')); } catch (e) { return true; } }
  var EN = (function () { try { return localStorage.getItem('lt_lang') === 'en'; } catch (e) { return false; } })();

  // Pas connecté ou déjà répondu → rien à faire.
  if (!tok() || isDone()) return;

  var QUESTIONS = [
    { key: 'level', icon: bars(),
      q: EN ? "What's your trading level?" : 'Quel est votre niveau en trading ?',
      sub: EN ? 'No judgment — it tailors your experience.' : 'Sans jugement — cela personnalise votre expérience.',
      opts: EN ? ['Beginner', 'Intermediate', 'Advanced', 'Professional'] : ['Débutant', 'Intermédiaire', 'Avancé', 'Professionnel'] },
    { key: 'market', icon: globe(),
      q: EN ? 'What do you trade the most?' : 'Que tradez-vous le plus ?',
      opts: EN ? ['Forex', 'Crypto', 'Indices', 'Stocks / Commodities'] : ['Forex', 'Crypto', 'Indices', 'Actions / Matières'] },
    { key: 'goal', icon: target(),
      q: EN ? 'Your main goal?' : 'Votre objectif principal ?',
      opts: EN ? ['Learn the basics', 'Be more disciplined', 'Find better setups', 'Track my performance'] : ['Apprendre les bases', 'Gagner en discipline', 'Trouver de meilleurs setups', 'Suivre mes performances'] },
    { key: 'source', icon: compass(),
      q: EN ? 'How did you hear about us?' : 'Comment nous avez-vous connu ?',
      opts: EN ? ['YouTube', 'TikTok / Instagram', 'Google search', 'Discord / Telegram', 'A friend', 'Other'] : ['YouTube', 'TikTok / Instagram', 'Recherche Google', 'Discord / Telegram', 'Un ami', 'Autre'] }
  ];

  function bars() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'; }
  function globe() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>'; }
  function target() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>'; }
  function compass() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 10.5 10.5 8.5 15.5 13.5 13.5"/></svg>'; }

  var answers = {}, step = 0; // step 0..QUESTIONS.length ; dernier = tarifs

  function injectCSS() {
    if (document.getElementById('ltObCss')) return;
    var s = document.createElement('style'); s.id = 'ltObCss';
    s.textContent =
      '.ob{position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4, 6, 11,.86);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);animation:obFade .3s ease}'
      + '@keyframes obFade{from{opacity:0}to{opacity:1}}'
      + '.ob__box{position:relative;width:100%;max-width:520px;max-height:92vh;overflow:auto;background:var(--bg-elevated,#101724);border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-lg,12px);padding:30px 30px 26px;box-shadow:0 40px 90px rgba(0,0,0,.65);scrollbar-width:thin}'
      + '.ob__box::before{content:"";position:absolute;top:0;left:40px;right:40px;height:1px;background:linear-gradient(90deg,transparent,var(--accent-glow,rgba(59, 125, 255,.35)),transparent)}'
      + '.ob__top{display:flex;align-items:center;gap:12px;margin-bottom:22px}'
      + '.ob__back{background:transparent;border:none;color:var(--text-muted,#7E8794);cursor:pointer;padding:4px;display:none;align-items:center}'
      + '.ob__back.show{display:inline-flex}.ob__back:hover{color:var(--text-title,#F2F4F7)}'
      + '.ob__dots{display:flex;gap:6px;flex:1}'
      + '.ob__dot{height:6px;width:6px;border-radius:3px;background:rgba(255,255,255,.14);transition:all .35s var(--ease-out,cubic-bezier(.16,1,.3,1))}'
      + '.ob__dot.on{width:18px;background:var(--accent-bright,#8FBAFF)}'
      + '.ob__x{background:transparent;border:none;color:var(--text-muted,#7E8794);font-size:18px;cursor:pointer;line-height:1;padding:4px}'
      + '.ob__x:hover{color:var(--text-title,#F2F4F7)}'
      + '.ob__ic{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--accent-glow-soft,rgba(59, 125, 255,.12));color:var(--accent,#3B7DFF);margin-bottom:16px}'
      + '.ob__ic svg{width:24px;height:24px}'
      + '.ob__q{font-family:var(--font-display,"Anton",sans-serif);text-transform:uppercase;font-size:clamp(20px,3.4vw,26px);letter-spacing:.01em;color:var(--text-title,#F2F4F7);line-height:1.12;margin:0 0 6px}'
      + '.ob__sub{font-family:var(--font-text,"Inter",sans-serif);font-size:13px;color:var(--text-muted,#7E8794);margin:0 0 20px}'
      + '.ob__opts{display:flex;flex-direction:column;gap:9px}'
      + '.ob__opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:14px 16px;background:var(--bg-base,#04060B);border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-md,8px);color:var(--text-body,#C3CAD4);font-family:var(--font-text,"Inter",sans-serif);font-size:14px;font-weight:600;cursor:pointer;transition:border-color .15s,background .15s,color .15s,transform .15s}'
      + '.ob__opt:hover{border-color:var(--accent,#3B7DFF);color:var(--text-title,#F2F4F7);background:var(--accent-glow-soft,rgba(59, 125, 255,.08));transform:translateY(-1px)}'
      + '.ob__opt.sel{border-color:var(--accent,#3B7DFF);background:var(--accent-glow-soft,rgba(59, 125, 255,.14));color:var(--text-title,#F2F4F7)}'
      + '.ob__opt b{width:24px;height:24px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;background:var(--bg-surface,#0B1018);border:1px solid var(--border-subtle,#1C212A);font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:11px;color:var(--text-muted,#7E8794);flex:none}'
      // étape tarifs
      + '.ob__plans{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px}'
      + '@media(max-width:480px){.ob__plans{grid-template-columns:1fr}}'
      + '.ob__plan{position:relative;border:1px solid var(--border-subtle,#1C212A);border-radius:var(--r-md,8px);background:var(--bg-base,#04060B);padding:18px 16px;display:flex;flex-direction:column;gap:6px}'
      + '.ob__plan--reco{border-color:var(--accent,#3B7DFF);box-shadow:0 0 0 1px var(--accent-glow,rgba(59, 125, 255,.35)),0 0 28px var(--accent-glow-soft,rgba(59, 125, 255,.18))}'
      + '.ob__reco{position:absolute;top:-9px;left:50%;transform:translateX(-50%);font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:8.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#04060B;background:var(--accent,#3B7DFF);border-radius:50px;padding:3px 9px;white-space:nowrap}'
      + '.ob__plan__n{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted,#7E8794)}'
      + '.ob__plan__p{font-family:var(--font-display,"Anton",sans-serif);font-size:30px;color:var(--text-title,#F2F4F7);line-height:1}'
      + '.ob__plan__p small{font-family:var(--font-text,"Inter",sans-serif);font-size:12px;font-weight:400;color:var(--text-muted,#7E8794)}'
      + '.ob__plan__meta{font-size:11px;color:var(--text-muted,#7E8794);min-height:14px}'
      + '.ob__plan__cta{margin-top:8px;text-align:center;padding:11px;border-radius:var(--r-sm,4px);font-family:var(--font-text,"Inter",sans-serif);font-size:13px;font-weight:700;cursor:pointer;border:1px solid var(--border,#3A414C);background:transparent;color:var(--text-title,#F2F4F7);transition:all .15s}'
      + '.ob__plan__cta:hover{border-color:var(--accent,#3B7DFF)}'
      + '.ob__plan__cta--reco{background:var(--accent,#3B7DFF);border-color:transparent;color:#04060B}'
      + '.ob__plan__cta--reco:hover{background:var(--accent-bright,#8FBAFF)}'
      + '.ob__free{margin-top:16px;text-align:center}'
      + '.ob__free button{background:transparent;border:none;color:var(--text-muted,#7E8794);font-family:var(--font-text,"Inter",sans-serif);font-size:13px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'
      + '.ob__free button:hover{color:var(--text-body,#C3CAD4)}'
      + '.ob__note{margin-top:14px;text-align:center;font-size:11px;color:var(--text-muted,#7E8794)}';
    document.head.appendChild(s);
  }

  var root;
  function ensureRoot() {
    if (root) return;
    injectCSS();
    root = document.createElement('div');
    root.className = 'ob';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', EN ? 'Welcome' : 'Bienvenue');
    document.body.appendChild(root);
  }

  function dots() {
    var n = QUESTIONS.length + 1, h = '';
    for (var i = 0; i < n; i++) h += '<span class="ob__dot' + (i === step ? ' on' : '') + '"></span>';
    return h;
  }

  function render() {
    ensureRoot();
    var isPricing = step >= QUESTIONS.length;
    var head = '<div class="ob__top">'
      + '<button class="ob__back' + (step > 0 ? ' show' : '') + '" id="obBack" aria-label="Retour"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>'
      + '<div class="ob__dots">' + dots() + '</div>'
      + '<button class="ob__x" id="obX" aria-label="' + (EN ? 'Close' : 'Fermer') + '">✕</button>'
      + '</div>';

    if (!isPricing) {
      var Q = QUESTIONS[step];
      var opts = Q.opts.map(function (o, i) {
        var letter = String.fromCharCode(65 + i);
        var sel = answers[Q.key] === o ? ' sel' : '';
        return '<button class="ob__opt' + sel + '" data-opt="' + esc(o) + '"><b>' + letter + '</b>' + esc(o) + '</button>';
      }).join('');
      root.innerHTML = '<div class="ob__box">' + head
        + '<div class="ob__ic">' + Q.icon + '</div>'
        + '<h2 class="ob__q">' + esc(Q.q) + '</h2>'
        + (Q.sub ? '<p class="ob__sub">' + esc(Q.sub) + '</p>' : '')
        + '<div class="ob__opts">' + opts + '</div>'
        + '</div>';
      Array.prototype.forEach.call(root.querySelectorAll('.ob__opt'), function (b) {
        b.addEventListener('click', function () {
          answers[Q.key] = b.getAttribute('data-opt');
          b.classList.add('sel');
          setTimeout(next, 170);
        });
      });
    } else {
      root.innerHTML = '<div class="ob__box">' + head
        + '<div class="ob__ic">' + sparkle() + '</div>'
        + '<h2 class="ob__q">' + (EN ? 'Unlock everything' : 'Débloquez tout le cockpit') + '</h2>'
        + '<p class="ob__sub">' + (EN ? 'Every tool, no limits. Pick a plan — or start free.' : 'Tous les outils, sans limite. Choisissez une formule — ou commencez gratuitement.') + '</p>'
        + '<div class="ob__plans">'
        + '<div class="ob__plan"><span class="ob__plan__n">' + (EN ? 'Monthly' : 'Mensuel') + '</span>'
        + '<span class="ob__plan__p">29,99 €<small> / ' + (EN ? 'mo' : 'mois') + '</small></span>'
        + '<span class="ob__plan__meta">' + (EN ? 'Flexible, no commitment' : 'Flexible, sans engagement') + '</span>'
        + '<button class="ob__plan__cta" data-plan="monthly">' + (EN ? 'Choose' : 'Choisir') + '</button></div>'
        + '<div class="ob__plan ob__plan--reco"><span class="ob__reco">' + (EN ? 'Best price · −33%' : 'Meilleur prix · −33 %') + '</span>'
        + '<span class="ob__plan__n">' + (EN ? 'Yearly' : 'Annuel') + '</span>'
        + '<span class="ob__plan__p">19,99 €<small> / ' + (EN ? 'mo' : 'mois') + '</small></span>'
        + '<span class="ob__plan__meta">' + (EN ? 'Billed 239,88 € / year' : 'Facturé 239,88 € / an') + '</span>'
        + '<button class="ob__plan__cta ob__plan__cta--reco" data-plan="annual">' + (EN ? 'Choose' : 'Choisir') + '</button></div>'
        + '</div>'
        + '<div class="ob__free"><button id="obFree">' + (EN ? 'Maybe later — continue for free' : 'Plus tard — continuer gratuitement') + '</button></div>'
        + '<p class="ob__note">' + (EN ? '5 free tokens on sign-up · cancel anytime' : '5 tokens offerts à l\'inscription · annulable à tout moment') + '</p>'
        + '</div>';
      Array.prototype.forEach.call(root.querySelectorAll('[data-plan]'), function (b) {
        b.addEventListener('click', function () { finish(); checkout(b.getAttribute('data-plan')); });
      });
      var fb = document.getElementById('obFree'); if (fb) fb.addEventListener('click', close);
    }

    var bk = document.getElementById('obBack'); if (bk) bk.addEventListener('click', back);
    var xb = document.getElementById('obX'); if (xb) xb.addEventListener('click', close);
  }

  function sparkle() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><path d="M19 14l.7 1.9L21.5 17l-1.8.6L19 19.5l-.7-1.9L16.5 17l1.8-.6z"/></svg>'; }

  function next() {
    if (step < QUESTIONS.length) { step++; if (step >= QUESTIONS.length) save(); render(); }
  }
  function back() { if (step > 0) { step--; render(); } }

  function save() {
    try { localStorage.setItem('lt_survey', JSON.stringify({ answers: answers, at: Date.now() })); localStorage.setItem('lt_onboarded', '1'); } catch (e) {}
    try {
      fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok() },
        body: JSON.stringify(answers)
      }).catch(function () {});
    } catch (e) {}
  }
  function finish() { save(); destroy(); }
  function close() { save(); destroy(); } // ferme (croix / « plus tard ») en conservant les réponses
  function destroy() { if (root && root.parentNode) root.parentNode.removeChild(root); root = null; }

  function checkout(plan) {
    if (window.ltOpenCheckout) { try { window.ltOpenCheckout(plan); return; } catch (e) {} }
    window.location.href = './tarifs.html';
  }

  // S'assure que le checkout Whop est disponible pour l'étape tarifs.
  if (!window.ltOpenCheckout && !document.querySelector('script[src*="checkout.js"]')) {
    var cs = document.createElement('script'); cs.src = './checkout.js'; document.head.appendChild(cs);
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // Affiche après un court délai, mais UNIQUEMENT si le COMPTE n'a jamais répondu.
  // Source de vérité = user_profiles.onboarded_at (serveur), pas le localStorage :
  // ainsi on ne repose plus le questionnaire après un refresh ni sur un nouvel
  // appareil. Un questionnaire par compte, à vie.
  function start() {
    var t = tok();
    if (!t || isDone()) return;
    fetch('/api/profile', { headers: { 'Authorization': 'Bearer ' + t } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (p) {
        var done = !!(p && (p.onboarded_at || (p.survey && typeof p.survey === 'object' && Object.keys(p.survey).length)));
        if (done) { try { localStorage.setItem('lt_onboarded', '1'); } catch (e) {} return; }
        render(); // compte neuf, jamais répondu → on propose une seule fois
      })
      .catch(function () { /* réseau indisponible : on s'abstient pour ne pas reposer à tort */ });
  }
  setTimeout(function () {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 900); });
    else start();
  }, 900);
})();
