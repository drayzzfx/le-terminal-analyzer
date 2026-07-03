/* theme.js — Bascule thème clair / sombre pour tout le site.
   - Défaut : sombre (design « Cinematic Luxury »).
   - Persiste dans localStorage ('lt_theme' = 'light' | 'dark').
   - Pose data-theme sur <html> ; le CSS clair vit dans design-system.css
     sous :root[data-theme="light"].
   - Bouton = pastille .lt-theme-pill injectée dans .lt-nav__actions (à côté de FR/EN).
   - Délégation globale (robuste), sur le modèle de lang.js. Ne casse aucun JS. */
(function () {
  if (window._ltThemeInit) return; window._ltThemeInit = true;
  var KEY = 'lt_theme';
  function get() { try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; } }
  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    var pills = document.querySelectorAll('.lt-theme-pill');
    Array.prototype.forEach.call(pills, function (p) { p.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false'); });
  }
  function set(t) { try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); }
  window.ltSetTheme = set;
  window.ltToggleTheme = function () { set(get() === 'light' ? 'dark' : 'light'); };

  function injectBtn() {
    var actions = document.querySelector('.lt-nav__actions');
    if (actions && !actions.querySelector('.lt-theme-pill')) {
      var pill = document.createElement('button');
      pill.className = 'lt-theme-pill';
      pill.type = 'button';
      pill.setAttribute('title', 'Changer de thème');
      pill.setAttribute('aria-label', 'Changer de thème');
      pill.innerHTML =
        '<svg class="lt-theme-ic lt-theme-ic--moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
      + '<svg class="lt-theme-ic lt-theme-ic--sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
      var langPill = actions.querySelector('.lt-nav__pill, #ltLangPill');
      if (langPill) actions.insertBefore(pill, langPill); else actions.insertBefore(pill, actions.firstChild);
    }
    apply(get());
  }

  document.addEventListener('click', function (e) {
    var b = (e.target && e.target.closest) ? e.target.closest('.lt-theme-pill, [data-theme-toggle]') : null;
    if (b) { e.preventDefault(); window.ltToggleTheme(); }
  });

  apply(get()); // applique tôt (le pré-paint <head> évite le flash)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectBtn); else injectBtn();
})();
