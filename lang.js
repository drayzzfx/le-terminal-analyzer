/* ============================================================================
   lang.js — Bascule FR / EN, robuste et définitive.

   Objectif : que le bouton FR/EN fonctionne TOUJOURS, sur toutes les pages
   (présentes ou futures), et ne casse plus jamais — même si menu.js a un
   problème. Pour ça, ce module est :
     · ISOLÉ      : son propre IIFE, tout en try/catch, il ne peut pas planter
                    le reste du site ni être planté par lui ;
     · DÉLÉGUÉ    : un seul écouteur de clic sur document, qui capte n'importe
                    quelle pastille .lt-nav__pill / #ltLangPill / [data-lang-toggle].
                    => marche pour toute nouvelle pastille ajoutée plus tard,
                       sans modification ;
     · AUTONOME   : il sait traduire lui-même via le système « data-en » (le FR
                    d'origine est mémorisé dans data-fr). Donc si menu.js est
                    absent (ex. legal.html) ou cassé, la bascule marche quand même ;
     · COOPÉRATIF : si menu.js est sain, on lui délègue la traduction riche
                    (data-i18n, rechargement des actus éco, etc.).

   À charger sur CHAQUE page, en dernier (après menu.js).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__ltLangReady) return;          // anti-double-init
  window.__ltLangReady = true;

  function getLang() {
    try { return localStorage.getItem('lt_lang') === 'en' ? 'en' : 'fr'; }
    catch (e) { return 'fr'; }
  }
  function store(lang) {
    try { localStorage.setItem('lt_lang', lang); localStorage.setItem('lte_lang', lang); }
    catch (e) {}
  }

  // Met à jour le libellé des pastilles + l'attribut lang du document.
  function syncPills(lang) {
    var txt = lang === 'en' ? 'EN' : 'FR';
    try {
      var els = document.querySelectorAll('.lt-nav__pill, #ltLangPill');
      for (var i = 0; i < els.length; i++) { els[i].textContent = txt; els[i].style.cursor = 'pointer'; }
    } catch (e) {}
    try { document.documentElement.lang = lang === 'en' ? 'en' : 'fr'; } catch (e) {}
  }

  // Système « data-en » autonome : le FR d'origine est conservé dans data-fr.
  function ownDataEn(en) {
    try {
      var els = document.querySelectorAll('[data-en]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.getAttribute('data-fr') === null) el.setAttribute('data-fr', el.innerHTML);
        el.innerHTML = en ? el.getAttribute('data-en') : el.getAttribute('data-fr');
      }
    } catch (e) {}
  }

  // Repli complet, utilisé quand menu.js est absent/cassé.
  function fallbackApply(lang) {
    var en = lang === 'en';
    // Sur les pages éco, eco.js gère déjà data-en → on le laisse faire.
    if (typeof window.ecoApplyLang === 'function') {
      try { window.ecoApplyLang(en); } catch (e) { ownDataEn(en); }
    } else {
      ownDataEn(en);
    }
    try { if (typeof window.ecoReloadNews === 'function') window.ecoReloadNews(); } catch (e) {}
    try { if (typeof window.ecoCalRelang === 'function') window.ecoCalRelang(); } catch (e) {}
    syncPills(lang);
  }

  // Applique une langue : traduction riche via menu.js si dispo, sinon repli.
  function apply(lang) {
    if (typeof window.ltSetLang === 'function') {
      try { window.ltSetLang(lang); syncPills(lang); return; } catch (e) { /* menu.js a planté → repli */ }
    }
    fallbackApply(lang);
  }

  function toggle() {
    var next = getLang() === 'en' ? 'fr' : 'en';
    store(next);
    apply(next);
  }

  // ── Délégation globale : un seul écouteur pour toutes les pastilles ──
  document.addEventListener('click', function (e) {
    var t = e.target;
    var pill = (t && t.closest) ? t.closest('.lt-nav__pill, #ltLangPill, [data-lang-toggle]') : null;
    if (!pill) return;
    e.preventDefault();
    toggle();
  }, false);

  // API publique dédiée (n'écrase pas celle de menu.js).
  window.ltLangToggle = toggle;
  window.ltLangSet = function (lang) { lang = (lang === 'en') ? 'en' : 'fr'; store(lang); apply(lang); };

  // ── Application au chargement ──
  // Si menu.js est sain, c'est lui qui a (ou va) appliquer la langue → on se
  // contente de synchroniser les pastilles. Sinon on applique nous-mêmes.
  function init() {
    var lang = getLang();
    if (typeof window.ltSetLang === 'function') { syncPills(lang); }
    else { fallbackApply(lang); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  // Re-synchronise le libellé une fois le chrome dynamique injecté (userbar, drawer…).
  setTimeout(function () { try { syncPills(getLang()); } catch (e) {} }, 700);
})();
