// eco-news-loader.js
// Chargement dynamique des news depuis /api/news?zone=X
// Sections : Top (priorité) → Actuel (< 4h) → Précédentes (4h-48h)
(function () {
  'use strict';

  var FOUR_HOURS = 4 * 60 * 60 * 1000;

  // 3 sentiments uniquement
  var SENTIMENT_MAP = {
    'Positif': { cls: 'bias--up',   labelFr: 'Positif',  labelEn: 'Positive' },
    'Négatif': { cls: 'bias--down', labelFr: 'Négatif',  labelEn: 'Negative' },
    'Neutre':  { cls: 'bias--flat', labelFr: 'Neutre',   labelEn: 'Neutral'  },
    // Rétrocompatibilité avec anciens sentiments stockés en DB
    'Risk-on':  { cls: 'bias--up',   labelFr: 'Positif',  labelEn: 'Positive' },
    'Risk-off': { cls: 'bias--down', labelFr: 'Négatif',  labelEn: 'Negative' },
    'Hawkish':  { cls: 'bias--up',   labelFr: 'Positif',  labelEn: 'Positive' },
    'Dovish':   { cls: 'bias--down', labelFr: 'Négatif',  labelEn: 'Negative' },
  };

  function getLang() { return localStorage.getItem('lt_lang') || 'fr'; }

  var I18N = {
    fr: {
      topTitle:    'À lire en priorité',
      topSub:      'Sélection automatique — articles à fort impact marché',
      topEmpty:    'Aucun article à fort impact détecté pour l\'instant.',
      currentEmpty:'Les dernières annonces sont dans « Annonces précédentes » ci-dessous.',
      noNews:      'Aucune news pour l\'instant — le bot collecte les articles toutes les 30 min.',
      loadError:   'Impossible de charger les news. Nouvelle tentative dans 30s…',
      readBtn:     'Lire l\'article',
      toRead:      '⚡ À lire',
      archNone:    'Les annonces publiées il y a plus de 4 heures apparaîtront ici automatiquement.',
      archCount:   function(n) { return n + ' annonce' + (n > 1 ? 's' : '') + ' · dernières 48h'; },
      archNoneCount:'Aucune archive pour l\'instant',
    },
    en: {
      topTitle:    'Must-read',
      topSub:      'Auto-selected — high market-impact articles',
      topEmpty:    'No high-impact article detected yet.',
      currentEmpty:'Latest announcements are in "Earlier announcements" below.',
      noNews:      'No news yet — the bot collects articles every 30 min.',
      loadError:   'Unable to load news. Retrying in 30s…',
      readBtn:     'Read article',
      toRead:      '⚡ Must read',
      archNone:    'Announcements older than 4 hours will appear here automatically.',
      archCount:   function(n) { return n + ' announcement' + (n > 1 ? 's' : '') + ' · last 48h'; },
      archNoneCount:'No archives yet',
    },
  };

  function t(key) { var l = getLang(); return (I18N[l] || I18N['fr'])[key] || I18N['fr'][key]; }

  function timeLabel(iso) {
    try { return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
    catch(e) { return ''; }
  }

  function dateLabel(iso) {
    try {
      var d = new Date(iso);
      var now = new Date();
      var isToday = d.toDateString() === now.toDateString();
      if (isToday) return 'Aujourd\'hui ' + timeLabel(iso);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + timeLabel(iso);
    } catch(e) { return ''; }
  }

  function relTime(iso) {
    try {
      var diff = Date.now() - new Date(iso).getTime(), m = Math.floor(diff / 60000);
      if (m < 1)  return 'À l\'instant';
      if (m < 60) return 'Il y a ' + m + ' min';
      var h = Math.floor(m / 60);
      if (h < 24) return 'Il y a ' + h + 'h';
      return 'Il y a ' + Math.floor(h/24) + 'j';
    } catch(e) { return ''; }
  }

  function getSentiment(item) { return SENTIMENT_MAP[item.sentiment] || SENTIMENT_MAP['Neutre']; }

  function biasTag(item) {
    var s = getSentiment(item);
    if (!s.cls) return '';
    var label = getLang() === 'en' ? s.labelEn : s.labelFr;
    return '<span class="bias ' + s.cls + ' card__bias">' + label + '</span>';
  }

  function getSummary(item) {
    var lang = getLang();
    if (lang === 'en' && item.summary_en) return item.summary_en;
    return item.summary || item.summary_en || '';
  }

  // ── URL interne vers la page d'analyse dédiée ───────────────────────────
  function articleUrl(item) {
    if (!item.id) return item.url || '#';
    var u = '/eco-article.html?id=' + encodeURIComponent(item.id);
    if (item.url) u += '&src=' + encodeURIComponent(item.url);
    return u;
  }

  // ── Card normale (section actuel) ────────────────────────────────────────
  function buildCard(item, idx) {
    var zone = (window.ECO_ZONE || 'eco');
    var zoneLabel = zone.charAt(0).toUpperCase() + zone.slice(1);
    var title   = (item.title || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var summary = getSummary(item).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var source  = (item.source || '').replace(/</g,'&lt;');
    var url     = articleUrl(item);

    return '<article class="card" style="--i:' + idx + '" data-eco-dynamic>'
      + '<a class="card__hit" href="' + url + '">'
      + '<p class="card__kicker">'
      + '<span class="card__cat js-term">' + zoneLabel + '</span>'
      + '<span class="card__sep">·</span>'
      + '<span class="card__source">' + source + '</span>'
      + '<span class="card__time" title="' + relTime(item.published_at) + '">' + timeLabel(item.published_at) + '</span>'
      + biasTag(item)
      + '</p>'
      + '<h3 class="card__title">' + title + '</h3>'
      + '<p class="card__summary">' + summary + '</p>'
      + '</a>'
      + '<a class="btn" href="' + url + '">'
      + '<span>' + t('readBtn') + '</span>'
      + '<span class="btn__arrow" aria-hidden="true">→</span>'
      + '</a>'
      + '</article>';
  }

  // ── Card Top — même structure que la carte normale, juste un badge ⚡ ──────
  function buildTopCard(item, idx) {
    var zone = (window.ECO_ZONE || 'eco');
    var zoneLabel = zone.charAt(0).toUpperCase() + zone.slice(1);
    var title   = (item.title || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var summary = getSummary(item).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var source  = (item.source || '').replace(/</g,'&lt;');
    var url     = articleUrl(item);

    return '<article class="card card--featured" style="--i:' + idx + '" data-eco-dynamic>'
      + '<a class="card__hit" href="' + url + '">'
      + '<p class="card__kicker">'
      + '<span class="card__cat js-term">' + zoneLabel + '</span>'
      + '<span class="card__sep">·</span>'
      + '<span class="card__source">' + source + '</span>'
      + '<span class="card__time" title="' + relTime(item.published_at) + '">' + timeLabel(item.published_at) + '</span>'
      + biasTag(item)
      + '</p>'
      + '<h3 class="card__title">' + title + '</h3>'
      + '<p class="card__summary">' + summary + '</p>'
      + '</a>'
      + '<a class="btn" href="' + url + '">'
      + '<span>' + t('readBtn') + '</span>'
      + '<span class="btn__arrow" aria-hidden="true">→</span>'
      + '</a>'
      + '</article>';
  }

  // ── Archive item (liste compacte) ────────────────────────────────────────
  function buildArchiveItem(item, idx) {
    var s = getSentiment(item);
    var biasLabel = getLang() === 'en' ? s.labelEn : s.labelFr;
    var biasHtml = s.cls
      ? '<span class="bias ' + s.cls + '" style="font-size:10px;padding:2px 8px">' + biasLabel + '</span>'
      : '';
    var title  = (item.title  || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var source = (item.source || '').replace(/</g,'&lt;');
    var url    = articleUrl(item);

    return '<a class="eco-arch-item" href="' + url + '" style="--i:' + idx + '">'
      + '<div class="eco-arch-item__meta">'
      + '<span class="eco-arch-item__time">' + dateLabel(item.published_at) + '</span>'
      + '<span class="eco-arch-item__src">' + source + '</span>'
      + biasHtml
      + '</div>'
      + '<p class="eco-arch-item__title">' + title + '</p>'
      + '</a>';
  }

  // ── Skeleton ─────────────────────────────────────────────────────────────
  function buildSkeleton(count) {
    var html = '';
    for (var i = 0; i < count; i++) {
      html += '<article class="card card--skeleton" style="--i:' + i + '" aria-hidden="true">'
        + '<div class="card__skel-line card__skel-line--short"></div>'
        + '<div class="card__skel-line"></div>'
        + '<div class="card__skel-line card__skel-line--med"></div>'
        + '</article>';
    }
    return html;
  }

  function emptyMsg(txt) {
    return '<div class="eco-empty" style="grid-column:1/-1;text-align:center;padding:32px 16px;color:var(--text3);font-size:13px">' + txt + '</div>';
  }

  // ── Sélection automatique des articles clés ──────────────────────────────
  // Critère : sentiment non-Neutre = article market-moving → à lire en priorité
  // On prend les 3 meilleurs des dernières 24h, classés par ordre chronologique inverse
  // Sélection automatique : Positif ou Négatif des dernières 24h
  // Les articles "Neutre" ne font pas bouger les marchés → exclus du Top
  function selectTop(items) {
    var PRIORITY = {
      'Positif': 3, 'Négatif': 3,
      'Risk-on': 3, 'Risk-off': 3, 'Hawkish': 3, 'Dovish': 3,
      'Neutre': 0,
    };
    var cutoff24h = Date.now() - 24 * 3600 * 1000;
    return items
      .filter(function(item) {
        var age = Date.now() - new Date(item.published_at).getTime();
        return age < cutoff24h * 2 &&
               (PRIORITY[item.sentiment] || 0) >= 3;
      })
      .sort(function(a, b) {
        return new Date(b.published_at) - new Date(a.published_at);
      })
      .slice(0, 3);
  }

  // ── Rendu principal ───────────────────────────────────────────────────────
  async function loadNews() {
    var zone = window.ECO_ZONE;
    if (!zone) return;

    // Conteneurs
    var grid     = document.querySelector('#r-' + zone + ' .grid');
    var archBody = document.querySelector('.eco-archives');

    if (!grid) return;

    // Skeleton pendant le chargement
    grid.innerHTML = buildSkeleton(6);

    try {
      var resp = await fetch('/api/news?zone=' + zone + '&limit=40');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      var items = data.items || [];

      // ── Tri : actuel < 4h / archives 4h–48h ──────────────────────────────
      var now     = Date.now();
      var current = items.filter(function(i) { return (now - new Date(i.published_at).getTime()) < FOUR_HOURS; });
      var archive = items.filter(function(i) { return (now - new Date(i.published_at).getTime()) >= FOUR_HOURS; });

      // ── Sélection Top (tri automatique par importance) ────────────────────
      var top = selectTop(items);
      var topGuids = top.map(function(i) { return i.guid || i.id; });

      // Retire les top des sections courantes pour éviter doublons
      current = current.filter(function(i) { return topGuids.indexOf(i.guid || i.id) === -1; });

      // ── Section Top ───────────────────────────────────────────────────────
      var topSection = document.querySelector('.eco-top');
      if (!topSection && top.length > 0) {
        var block = document.querySelector('#r-' + zone);
        if (block) {
          var ts = document.createElement('section');
          ts.className = 'block eco-top';
          ts.setAttribute('aria-label', t('topTitle'));
          ts.innerHTML = '<header class="block__head">'
            + '<h2 class="block__title"><span class="block__ico">⚡</span> <span>' + t('topTitle') + '</span></h2>'
            + '<span class="block__sub">' + t('topSub') + '</span>'
            + '</header>'
            + '<div class="grid eco-top__grid" id="eco-top-grid"></div>';
          block.parentNode.insertBefore(ts, block);
          topSection = ts;
        }
      }

      if (topSection) {
        var topGrid = topSection.querySelector('#eco-top-grid') || topSection.querySelector('.grid');
        if (topGrid) {
          topGrid.innerHTML = top.length > 0
            ? top.map(function(item, i) { return buildTopCard(item, i); }).join('')
            : emptyMsg(t('topEmpty'));
        }
      }

      // ── Section Actuel ────────────────────────────────────────────────────
      if (current.length > 0) {
        grid.innerHTML = current.map(function(item, i) { return buildCard(item, i); }).join('');
      } else if (archive.length > 0) {
        grid.innerHTML = emptyMsg(t('currentEmpty'));
      } else {
        grid.innerHTML = emptyMsg(t('noNews'));
      }

      // Mise à jour header de la section actuel
      var blockCount = document.querySelector('#r-' + zone + ' .block__count');
      if (blockCount) blockCount.textContent = current.length;

      // ── Section Annonces précédentes ──────────────────────────────────────
      if (archBody) {
        var archHeader = archBody.querySelector('.block__head');
        var archContent = archBody.querySelector('.eco-archives__list, .eco-empty, div:not(.block__head)');

        // Remplace ou crée le contenu de l'archive
        var existingList = archBody.querySelector('.eco-archives__list');
        if (!existingList) {
          existingList = document.createElement('div');
          existingList.className = 'eco-archives__list';
          archBody.appendChild(existingList);
          // Retire l'ancien placeholder
          var oldEmpty = archBody.querySelector('.eco-empty');
          if (oldEmpty) oldEmpty.remove();
        }

        // Met à jour le sous-titre
        if (archHeader) {
          var sub = archHeader.querySelector('.block__sub');
          if (sub) {
            sub.textContent = archive.length > 0 ? t('archCount')(archive.length) : t('archNoneCount');
            sub.removeAttribute('data-en');
          }
        }

        if (archive.length > 0) {
          existingList.innerHTML = archive.map(function(item, i) { return buildArchiveItem(item, i); }).join('');
        } else {
          existingList.innerHTML = '<p style="font-size:13px;color:var(--text3);padding:20px 0">' + t('archNone') + '</p>';
        }
      }

    } catch(e) {
      console.warn('[eco-news-loader]', e.message);
      grid.innerHTML = '<div class="eco-empty" style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text3);font-size:13px">' + t('loadError') + '</div>';
      setTimeout(loadNews, 30000);
    }
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews);
  } else {
    loadNews();
  }

  // Refresh toutes les 5 minutes
  setInterval(loadNews, 5 * 60 * 1000);
  window.ecoReloadNews = loadNews;
})();
