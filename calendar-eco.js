/* calendar-eco.js — Calendrier Éco partagé (design « Calendrier Éco »).
   Récupère /api/calendar (flux ForexFactory côté serveur), mappe les champs,
   groupe par jour et rend les blocs .eco-group / .eco-row dans #ecoCalList.
   Filtres devise (#ecoCalFilters) + toggle impact fort (#ecoCalImpToggle), côté client.
   Champs API par événement : { time, currency, title, impact (0-3), previous, forecast, actual, date (YYYY-MM-DD) }. */
(function () {
  'use strict';

  var STATE = { events: [], cur: 'all', hot: false };
  var CURS = [
    { key: 'all', label: 'Toutes' },
    { key: 'USD', label: 'USD' },
    { key: 'EUR', label: 'EUR' },
    { key: 'GBP', label: 'GBP' },
    { key: 'JPY', label: 'JPY' }
  ];

  function EL(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function curClass(c) {
    c = (c || '').toUpperCase();
    return (c === 'USD' || c === 'EUR' || c === 'GBP' || c === 'JPY') ? c.toLowerCase() : '';
  }

  // Libellé jour FR à partir d'une date ISO (YYYY-MM-DD), relatif à aujourd'hui.
  function frDay(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso || '—';
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var diff = Math.round((d - today) / 86400000);
    var J = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    var M = ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
    var lbl = J[d.getDay()] + ' ' + d.getDate() + ' ' + M[d.getMonth()];
    if (diff === 0) return "AUJOURD'HUI · " + lbl;
    if (diff === 1) return 'DEMAIN · ' + lbl;
    return lbl;
  }

  // 3 points d'impact : 3 = baissier + lueur, 2 = neutre, 1 = atténué.
  function impDots(n) {
    n = +n || 0;
    var color = n >= 3 ? 'var(--bear)' : n === 2 ? 'var(--neutral)' : 'var(--text-muted)';
    var s = '';
    for (var i = 1; i <= 3; i++) {
      var on = i <= n;
      var bg = on ? color : 'var(--border)';
      var glow = (on && n >= 3) ? ';box-shadow:0 0 6px ' + color : '';
      s += '<i style="background:' + bg + glow + '"></i>';
    }
    var title = n >= 3 ? 'Impact fort' : n === 2 ? 'Impact moyen' : 'Impact faible';
    return '<span class="eco-imp" title="' + title + '">' + s + '</span>';
  }

  function renderFilters() {
    var fbar = EL('ecoCalFilters');
    if (fbar) {
      fbar.innerHTML = CURS.map(function (c) {
        return '<button class="bm-filter' + (STATE.cur === c.key ? ' is-on' : '') +
          '" data-cur="' + c.key + '">' + esc(c.label) + '</button>';
      }).join('');
    }
    var tog = EL('ecoCalImpToggle');
    if (tog) {
      tog.className = 'eco-imptoggle' + (STATE.hot ? ' is-on' : '');
      tog.innerHTML = '<span class="eco-imptoggle__dot"></span> ' +
        '<span data-en="High impact only">Impact fort uniquement</span>';
    }
  }

  function renderList() {
    var box = EL('ecoCalList');
    if (!box) return;

    var evs = STATE.events.filter(function (e) {
      if (STATE.cur !== 'all' && (e.currency || '').toUpperCase() !== STATE.cur) return false;
      if (STATE.hot && (+e.impact || 0) < 3) return false;
      return true;
    });

    if (!evs.length) {
      box.innerHTML = '<div class="panel eco-group"><div class="eco-state">' +
        '<span data-en="No events match these filters.">Aucun événement pour ces filtres.</span></div></div>';
      return;
    }

    var groups = {}, order = [];
    evs.forEach(function (e) {
      var k = e.date || '?';
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(e);
    });
    order.sort();

    var html = '';
    order.forEach(function (k) {
      html += '<div class="panel eco-group"><div class="eco-group__day">' + esc(frDay(k)) + '</div><div class="eco-rows">';
      groups[k].forEach(function (e) {
        var cc = curClass(e.currency);
        var hot = (+e.impact || 0) >= 3;
        html += '<div class="eco-row' + (hot ? ' is-hot' : '') + '">' +
          '<span class="eco-row__t">' + esc(e.time || '—') + '</span>' +
          '<span class="eco-row__cur' + (cc ? ' eco-row__cur--' + cc : '') + '">' + esc(e.currency || '—') + '</span>' +
          '<span class="eco-row__ev" title="' + esc(e.title) + '">' + esc(e.title || '—') + '</span>' +
          impDots(e.impact) +
          '<span class="eco-row__val"><b>Préc.</b>' + esc(e.previous || '—') + '</span>' +
          '<span class="eco-row__val"><b>Prév.</b>' + esc(e.forecast || '—') + '</span>' +
          '<span class="eco-row__val eco-row__val--act"><b>Réel</b>' + esc(e.actual || '—') + '</span>' +
          '</div>';
      });
      html += '</div></div>';
    });
    box.innerHTML = html;
  }

  function render() { renderFilters(); renderList(); }

  function bind() {
    var fbar = EL('ecoCalFilters');
    if (fbar) fbar.addEventListener('click', function (ev) {
      var b = ev.target.closest('.bm-filter');
      if (!b) return;
      STATE.cur = b.getAttribute('data-cur');
      render();
    });
    var tog = EL('ecoCalImpToggle');
    if (tog) tog.addEventListener('click', function () {
      STATE.hot = !STATE.hot;
      render();
    });
  }

  function errorState(msg) {
    var box = EL('ecoCalList');
    if (box) box.innerHTML = '<div class="panel eco-group"><div class="eco-state">' + esc(msg) + '</div></div>';
  }

  function load() {
    var box = EL('ecoCalList');
    if (box) box.innerHTML = '<div class="panel eco-group"><div class="eco-state">' +
      '<span data-en="Loading calendar…">Chargement du calendrier…</span></div></div>';
    fetch('/api/calendar')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.events && d.events.length) {
          STATE.events = d.events;
          render();
        } else {
          render();
          errorState('Calendrier indisponible pour le moment — réessaie dans quelques minutes.');
        }
      })
      .catch(function () {
        render();
        errorState('Calendrier indisponible pour le moment — réessaie dans quelques minutes.');
      });
  }

  function init() {
    if (!EL('ecoCalList')) return;
    bind();
    renderFilters();
    load();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  window.LeCalendrierEco = { init: init, reload: load };
})();
