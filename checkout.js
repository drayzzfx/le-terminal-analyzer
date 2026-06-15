// checkout.js — Checkout Whop intégré au site (paiement inline, sans redirection).
// Inclure sur toutes les pages avec des boutons de paiement (index, tarifs, landing...).
(function () {
  'use strict';

  // ⚠️ À RENSEIGNER : les ID de plans Whop (format plan_XXXXXXXX).
  //    Whop → ton produit → Pricing → chaque plan → bouton « Copy plan ID ».
  var LT_WHOP = {
    plans: {
      monthly: 'PLAN_ID_MENSUEL',   // ← plan mensuel (29,99 €)
      annual:  'PLAN_ID_ANNUEL'     // ← plan annuel (19,99 €/mois)
    },
    fallbackUrl: 'https://whop.com/terminal-analyzer/terminal-analyzer-pro'
  };

  var _loaded = false;
  function _loadWhop(){
    if(_loaded) return;
    _loaded = true;
    var s = document.createElement('script');
    s.async = true; s.defer = true;
    s.src = 'https://js.whop.com/static/checkout/loader.js';
    document.head.appendChild(s);
  }

  function _injectModal(){
    if(document.getElementById('ltCoOverlay')) return;
    var st = document.createElement('style');
    st.textContent = [
      '#ltCoOverlay{position:fixed;inset:0;z-index:100002;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(7,9,12,.85);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}',
      '#ltCoOverlay.show{display:flex}',
      '#ltCoBox{position:relative;width:100%;max-width:480px;max-height:92vh;overflow:auto;background:#10141B;border:1px solid rgba(127,184,232,.25);border-radius:16px;box-shadow:0 40px 90px rgba(0,0,0,.7)}',
      '#ltCoClose{position:absolute;top:10px;right:12px;z-index:2;background:rgba(8,8,15,.6);border:1px solid rgba(255,255,255,.15);color:#C3CAD4;width:30px;height:30px;border-radius:8px;font-size:16px;cursor:pointer;line-height:1}',
      '#ltCoClose:hover{color:#fff;border-color:rgba(127,184,232,.5)}',
      '#ltCoMount{min-height:540px}',
      '#ltCoMount .lt-co-loading{display:flex;align-items:center;justify-content:center;height:540px;color:#7E8794;font-family:Inter,system-ui,sans-serif;font-size:13px}'
    ].join('');
    document.head.appendChild(st);
    var ov = document.createElement('div');
    ov.id = 'ltCoOverlay';
    ov.innerHTML = '<div id="ltCoBox"><button type="button" id="ltCoClose" aria-label="Fermer">✕</button><div id="ltCoMount"></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){ if(e.target === ov) window.ltCloseCheckout(); });
    document.getElementById('ltCoClose').addEventListener('click', window.ltCloseCheckout);
  }

  window.ltCloseCheckout = function(){
    var ov = document.getElementById('ltCoOverlay');
    if(ov){ ov.classList.remove('show'); var m=document.getElementById('ltCoMount'); if(m) m.innerHTML=''; }
  };

  // planKey: 'monthly' | 'annual' (défaut: annual)
  window.ltOpenCheckout = function(planKey){
    var planId = LT_WHOP.plans[planKey] || LT_WHOP.plans.annual;
    // Plan non encore configuré → repli sur la page Whop (ne bloque pas le paiement)
    if(!planId || planId.indexOf('plan_') !== 0){
      window.open(LT_WHOP.fallbackUrl, '_blank', 'noopener');
      return;
    }
    _injectModal();
    _loadWhop();
    var mount = document.getElementById('ltCoMount');
    var ret = window.location.origin + '/app.html';
    mount.innerHTML = '<div class="lt-co-loading">Chargement du paiement sécurisé…</div>'
      + '<div data-whop-checkout-plan-id="' + planId + '" data-whop-checkout-theme="dark" data-whop-checkout-return-url="' + ret + '"></div>';
    document.getElementById('ltCoOverlay').classList.add('show');
  };
})();
