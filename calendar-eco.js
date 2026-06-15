/* calendar-eco.js — Calendrier Éco partagé (design « Calendrier Éco »).
   Récupère /api/calendar (flux ForexFactory côté serveur), mappe les champs,
   groupe par jour et rend les blocs .eco-group / .eco-row dans #ecoCalList.
   Filtres devise (#ecoCalFilters) + toggle impact fort (#ecoCalImpToggle), côté client.
   Bilingue : français par défaut, anglais si le site est en EN (lt_lang).
   Champs API par événement : { time, currency, title (EN), title_fr, impact (0-3), previous, forecast, actual, date }. */
(function () {
  'use strict';

  var STATE = { events: [], cur: 'all', hot: false };

  function EL(id) { return document.getElementById(id); }
  function isEN() { try { return (localStorage.getItem('lt_lang') || localStorage.getItem('lte_lang')) === 'en'; } catch (e) { return false; } }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function curClass(c) {
    c = (c || '').toUpperCase();
    return (c === 'USD' || c === 'EUR' || c === 'GBP' || c === 'JPY') ? c.toLowerCase() : '';
  }

  // Libellé jour à partir d'une date ISO (YYYY-MM-DD), relatif à aujourd'hui.
  function dayLabel(iso) {
    var en = isEN();
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso || '—';
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var diff = Math.round((d - today) / 86400000);
    var J = en ? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] : ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    var M = en ? ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
               : ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
    var lbl = J[d.getDay()] + ' ' + d.getDate() + ' ' + M[d.getMonth()];
    if (diff === 0) return (en ? 'TODAY · ' : "AUJOURD'HUI · ") + lbl;
    if (diff === 1) return (en ? 'TOMORROW · ' : 'DEMAIN · ') + lbl;
    return lbl;
  }

  // 3 points d'impact : 3 = baissier + lueur, 2 = neutre, 1 = atténué.
  function impDots(n) {
    n = +n || 0;
    var en = isEN();
    var color = n >= 3 ? 'var(--bear)' : n === 2 ? 'var(--neutral)' : 'var(--text-muted)';
    var s = '';
    for (var i = 1; i <= 3; i++) {
      var on = i <= n;
      var bg = on ? color : 'var(--border)';
      var glow = (on && n >= 3) ? ';box-shadow:0 0 6px ' + color : '';
      s += '<i style="background:' + bg + glow + '"></i>';
    }
    var title = n >= 3 ? (en ? 'High impact' : 'Impact fort')
              : n === 2 ? (en ? 'Medium impact' : 'Impact moyen')
              : (en ? 'Low impact' : 'Impact faible');
    return '<span class="eco-imp" title="' + title + '">' + s + '</span>';
  }

  function renderFilters() {
    var en = isEN();
    var fbar = EL('ecoCalFilters');
    if (fbar) {
      var curs = [{ key: 'all', label: en ? 'All' : 'Toutes' }, { key: 'USD', label: 'USD' }, { key: 'EUR', label: 'EUR' }, { key: 'GBP', label: 'GBP' }, { key: 'JPY', label: 'JPY' }];
      fbar.innerHTML = curs.map(function (c) {
        return '<button class="bm-filter' + (STATE.cur === c.key ? ' is-on' : '') +
          '" data-cur="' + c.key + '">' + esc(c.label) + '</button>';
      }).join('');
    }
    var tog = EL('ecoCalImpToggle');
    if (tog) {
      tog.className = 'eco-imptoggle' + (STATE.hot ? ' is-on' : '');
      tog.innerHTML = '<span class="eco-imptoggle__dot"></span> ' + (en ? 'High impact only' : 'Impact fort uniquement');
    }
  }

  function renderList() {
    var box = EL('ecoCalList');
    if (!box) return;
    var en = isEN();
    var LBL = en ? { p: 'Prev.', f: 'Cons.', a: 'Actual', empty: 'No events match these filters.' }
                 : { p: 'Préc.', f: 'Prév.', a: 'Réel', empty: 'Aucun événement pour ces filtres.' };

    var evs = STATE.events.filter(function (e) {
      if (STATE.cur !== 'all' && (e.currency || '').toUpperCase() !== STATE.cur) return false;
      if (STATE.hot && (+e.impact || 0) < 3) return false;
      return true;
    });

    if (!evs.length) {
      box.innerHTML = '<div class="panel eco-group"><div class="eco-state">' + esc(LBL.empty) + '</div></div>';
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
      html += '<div class="panel eco-group"><div class="eco-group__day">' + esc(dayLabel(k)) + '</div><div class="eco-rows">';
      groups[k].forEach(function (e) {
        var cc = curClass(e.currency);
        var hot = (+e.impact || 0) >= 3;
        var ttl = en ? (e.title || e.title_fr || '') : (e.title_fr || e.title || '');
        html += '<div class="eco-row' + (hot ? ' is-hot' : '') + '">' +
          '<span class="eco-row__t">' + esc(e.time || '—') + '</span>' +
          '<span class="eco-row__cur' + (cc ? ' eco-row__cur--' + cc : '') + '">' + esc(e.currency || '—') + '</span>' +
          '<span class="eco-row__ev" title="' + esc(ttl) + '">' + esc(ttl || '—') + '</span>' +
          impDots(e.impact) +
          '<span class="eco-row__val"><b>' + LBL.p + '</b>' + esc(e.previous || '—') + '</span>' +
          '<span class="eco-row__val"><b>' + LBL.f + '</b>' + esc(e.forecast || '—') + '</span>' +
          '<span class="eco-row__val eco-row__val--act"><b>' + LBL.a + '</b>' + esc(e.actual || '—') + '</span>' +
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
      esc(isEN() ? 'Loading calendar…' : 'Chargement du calendrier…') + '</div></div>';
    fetch('/api/calendar')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.events && d.events.length) {
          STATE.events = d.events;
          render();
        } else {
          render();
          errorState(isEN() ? 'Calendar unavailable right now — try again in a few minutes.' : 'Calendrier indisponible pour le moment — réessaie dans quelques minutes.');
        }
      })
      .catch(function () {
        render();
        errorState(isEN() ? 'Calendar unavailable right now — try again in a few minutes.' : 'Calendrier indisponible pour le moment — réessaie dans quelques minutes.');
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

  // Re-localise instantanément quand le site change de langue (appelé par menu.js).
  window.ecoCalRelang = function () { render(); };
  window.LeCalendrierEco = { init: init, reload: load };
})();
