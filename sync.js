/* sync.js — synchronisation des données par compte, entre appareils.
   ═══════════════════════════════════════════════════════════════════════════
   Problème résolu : le patrimoine (portefeuille, simulateur, projection), la
   devise du journal et les analyses masquées ne vivaient que dans le
   localStorage du navigateur. En se connectant depuis un autre appareil, tout
   repartait de zéro.

   Principe : ces clés sont miroitées dans public.user_state côté Supabase, via
   /api/state. À chaque chargement de page on récupère l'état du compte ; à
   chaque écriture locale on le renvoie, avec un léger différé.

   Arbitrage : dernière écriture gagnante, clé par clé, sur l'horodatage. Deux
   appareils modifiant la même clé en même temps, c'est la modification la plus
   récente qui reste — le grain est assez fin pour que ce soit sans douleur.

   Contraintes respectées :
   · aucune dépendance, aucun framework ;
   · strictement inoffensif si l'utilisateur n'est pas connecté, si le réseau
     est absent ou si l'API répond en erreur — on retombe simplement sur le
     comportement local d'avant ;
   · ne touche à aucune logique métier des pages : on n'intercepte que les
     écritures des clés déclarées ci-dessous.

   Le journal (trades) et le Setup Analyzer (analyses) ont déjà leur propre
   synchronisation serveur, via /api/journal et /api/history : ils ne sont pas
   repris ici, pour ne pas faire coexister deux mécanismes sur la même donnée.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  if (window._ltSyncInit) return;
  window._ltSyncInit = true;

  /* Clés miroitées sur le compte. Pour en ajouter une, il suffit de la
     déclarer ici — le reste suit tout seul. */
  var KEYS = [
    'lt_pf_state',    // Patrimoine : portefeuille, simulateur, projection
    'jnl_currency',   // Journal : devise d'affichage
    'lt_deleted',     // Setup Analyzer : analyses masquées
    'jnl_notes',      // Journal : notes libres
    'lt_cal_prefs'    // Calendrier éco : filtres et devises suivies
  ];

  var suspended = false;             // vrai le temps d'une déconnexion
  var TS_KEY = 'lt_sync_ts';        // horodatage local, par clé
  var RELOADED = 'lt_sync_reloaded'; // garde-fou anti-boucle de rechargement
  var PUSH_DELAY = 1200;             // ms — on laisse retomber les rafales

  function ls(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
  function token() { return ls(function () { return localStorage.getItem('ta_token'); }, null); }

  function stamps() {
    return ls(function () { return JSON.parse(localStorage.getItem(TS_KEY) || '{}'); }, {}) || {};
  }
  function setStamp(key, iso) {
    var s = stamps(); s[key] = iso;
    ls(function () { localStorage.setItem(TS_KEY, JSON.stringify(s)); });
  }

  /* ── Écriture vers le compte, différée et dédoublonnée ─────────────────── */
  var pending = {}, timer = null;

  function flush() {
    timer = null;
    if (suspended) return;
    var tok = token();
    var keys = Object.keys(pending);
    pending = {};
    if (!tok || !keys.length) return;
    keys.forEach(function (key) {
      var raw = ls(function () { return localStorage.getItem(key); }, null);
      if (raw === null) return;
      var value;
      try { value = JSON.parse(raw); } catch (e) { value = raw; }
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok },
        body: JSON.stringify({ key: key, value: value })
      }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.updated_at) setStamp(key, d.updated_at); })
        .catch(function () { /* hors ligne : la prochaine écriture réessaiera */ });
    });
  }

  function queue(key) {
    pending[key] = 1;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, PUSH_DELAY);
  }

  /* ── Interception des écritures locales sur les clés suivies ───────────── */
  var nativeSet = localStorage.setItem.bind(localStorage);

  localStorage.setItem = function (key, value) {
    nativeSet(key, value);
    if (!suspended && KEYS.indexOf(key) !== -1) queue(key);
  };

  /* Volontairement, une suppression locale n'est JAMAIS répercutée sur le
     compte : la déconnexion efface ces clés du navigateur, et propager la
     suppression reviendrait à effacer les données du compte en se
     déconnectant. Le serveur garde la dernière valeur connue ; une vraie
     remise à zéro par l'utilisateur repasse par une écriture. */

  /* ── Lecture de l'état du compte au chargement ─────────────────────────── */
  function pull() {
    if (suspended) return;
    var tok = token();
    if (!tok) return;
    fetch('/api/state', { headers: { 'Authorization': 'Bearer ' + tok } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (server) {
        if (!server) return;
        var local = stamps(), changed = [];
        KEYS.forEach(function (key) {
          var row = server[key];
          if (!row) {
            // Jamais synchronisée : si on a une valeur locale, on la publie.
            if (ls(function () { return localStorage.getItem(key); }, null) !== null) queue(key);
            return;
          }
          var srvTime = Date.parse(row.updated_at || 0) || 0;
          var locTime = Date.parse(local[key] || 0) || 0;
          if (srvTime <= locTime) {
            // Le local est au moins aussi frais : rien à faire.
            return;
          }
          var next = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
          var cur = ls(function () { return localStorage.getItem(key); }, null);
          if (cur === next) { setStamp(key, row.updated_at); return; }
          nativeSet(key, next);           // écriture directe : pas de renvoi
          setStamp(key, row.updated_at);
          changed.push(key);
        });
        if (!changed.length) return;

        // La page a déjà lu le localStorage au chargement. On prévient d'abord
        // ceux qui savent se rafraîchir ; à défaut, un rechargement unique par
        // session remet l'affichage en phase avec le compte.
        var evt;
        try {
          evt = new CustomEvent('lt:state-synced', { detail: { keys: changed }, cancelable: true });
        } catch (e) { evt = null; }
        var handled = evt ? !window.dispatchEvent(evt) : false;
        if (handled) return;
        if (!ls(function () { return sessionStorage.getItem(RELOADED); }, null)) {
          ls(function () { sessionStorage.setItem(RELOADED, '1'); });
          location.reload();
        }
      })
      .catch(function () { /* hors ligne : on garde l'état local */ });
  }

  /* Nettoyage à la déconnexion : les horodatages d'un compte ne doivent pas
     servir d'arbitrage pour le suivant sur le même navigateur. */
  window.ltSyncReset = function () {
    suspended = true;                 // plus aucune écriture vers le compte
    if (timer) { clearTimeout(timer); timer = null; }
    pending = {};
    ls(function () { localStorage.removeItem(TS_KEY); sessionStorage.removeItem(RELOADED); });
  };
  window.ltSyncPull = pull;
  window.ltSyncPush = function (key) { if (KEYS.indexOf(key) !== -1) queue(key); };

  // Dernière chance d'écrire avant de quitter la page.
  window.addEventListener('pagehide', function () { if (timer) { clearTimeout(timer); flush(); } });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pull);
  else pull();
})();
