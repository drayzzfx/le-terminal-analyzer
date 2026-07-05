/* theme.js — Bascule thème clair / sombre pour tout le site.
   - Défaut : sombre (design « Cinematic Luxury »).
   - Persiste dans localStorage ('lt_theme' = 'light' | 'dark').
   - Pose data-theme sur <html> ; le CSS clair vit dans design-system.css
     (tokens) + theme-light.css (surcharges des couleurs codées en dur).
   - Bouton nav = pastille .lt-theme-pill injectée dans .lt-nav__actions.
   - Bouton outils = rangée .lt-side-theme injectée EN BAS de la barre
     latérale gauche (.side) remplie par appshell.js — avec retries car
     appshell peut (re)construire la barre après nous.
   - Délégation globale (robuste), sur le modèle de lang.js. Ne casse aucun JS. */
(function () {
  if (window._ltThemeInit) return; window._ltThemeInit = true;
  var KEY = 'lt_theme';
  function get() { try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; } }
  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btns = document.querySelectorAll('.lt-theme-pill, .lt-side-theme');
    Array.prototype.forEach.call(btns, function (p) { p.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false'); });
  }
  function set(t) { try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); }
  window.ltSetTheme = set;
  window.ltToggleTheme = function () { set(get() === 'light' ? 'dark' : 'light'); };

  var IC_MOON = '<svg class="lt-theme-ic lt-theme-ic--moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var IC_SUN = '<svg class="lt-theme-ic lt-theme-ic--sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  /* Pastille dans la nav du haut (toutes les pages qui ont .lt-nav__actions) */
  function injectNavPill() {
    var actions = document.querySelector('.lt-nav__actions');
    if (actions && !actions.querySelector('.lt-theme-pill')) {
      var pill = document.createElement('button');
      pill.className = 'lt-theme-pill';
      pill.type = 'button';
      pill.setAttribute('title', 'Changer de thème');
      pill.setAttribute('aria-label', 'Changer de thème');
      pill.innerHTML = IC_MOON + IC_SUN;
      var langPill = actions.querySelector('.lt-nav__pill, #ltLangPill');
      if (langPill) actions.insertBefore(pill, langPill); else actions.insertBefore(pill, actions.firstChild);
    }
  }

  /* Item en bas du dock vertical gauche des outils (.lt-dock) */
  function injectDockItem() {
    var docks = document.querySelectorAll('nav.lt-dock, .lt-dock');
    Array.prototype.forEach.call(docks, function (dock) {
      if (dock.querySelector('[data-theme-toggle]')) return;
      var it = document.createElement('button');
      it.className = 'lt-dock__item';
      it.type = 'button';
      it.setAttribute('data-theme-toggle', '');
      it.setAttribute('aria-label', 'Changer de thème');
      it.innerHTML = IC_MOON + IC_SUN
        + '<span class="lt-dock__lbl" data-en="Theme">Thème</span>'
        + '<span class="lt-dock__tip"><span class="lt-theme-lbl lt-theme-lbl--light" data-en="Light theme">Thème clair</span><span class="lt-theme-lbl lt-theme-lbl--dark" data-en="Dark theme">Thème sombre</span></span>';
      dock.appendChild(it);
    });
  }

  /* Rangée en bas de la barre latérale gauche des outils (.side) */
  function injectSideRow() {
    var side = document.querySelector('.app > .side, aside.side');
    if (!side || side.querySelector('.lt-side-theme')) return;
    var row = document.createElement('button');
    row.className = 'lt-side-theme';
    row.type = 'button';
    row.setAttribute('title', 'Changer de thème');
    row.setAttribute('aria-label', 'Changer de thème');
    row.innerHTML = IC_MOON + IC_SUN
      + '<span class="lt-theme-lbl lt-theme-lbl--light" data-en="Light theme">Thème clair</span>'
      + '<span class="lt-theme-lbl lt-theme-lbl--dark" data-en="Dark theme">Thème sombre</span>';
    side.appendChild(row);
  }

  function injectAll() { injectNavPill(); injectDockItem(); injectSideRow(); apply(get()); }

  /* appshell.js peut reconstruire la barre latérale (innerHTML) après nous :
     on retente quelques fois, sans observer coûteux. */
  function boot() {
    injectAll();
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      injectAll();
      if (tries >= 8) clearInterval(iv);
    }, 600);
  }

  document.addEventListener('click', function (e) {
    var b = (e.target && e.target.closest) ? e.target.closest('.lt-theme-pill, .lt-side-theme, [data-theme-toggle]') : null;
    if (b) { e.preventDefault(); window.ltToggleTheme(); }
  });

  apply(get()); // applique tôt (le pré-paint <head> évite le flash)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
