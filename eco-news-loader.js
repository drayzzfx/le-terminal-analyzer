// eco-news-loader.js
// Chargement dynamique des news depuis /api/news?zone=X
// Inclus sur toutes les pages éco. La page doit définir window.ECO_ZONE avant ce script.
(function () {
  'use strict';

  const SENTIMENT_MAP = {
    'Risk-on':  { cls: 'bias--up',   label: 'Risk-on',  labelFr: 'Positif'  },
    'Risk-off': { cls: 'bias--down', label: 'Risk-off', labelFr: 'Négatif'  },
    'Hawkish':  { cls: 'bias--hawk', label: 'Hawkish',  labelFr: 'Hawkish'  },
    'Dovish':   { cls: 'bias--dove', label: 'Dovish',   labelFr: 'Dovish'   },
    'Neutre':   { cls: '',           label: 'Neutre',   labelFr: 'Neutre'   },
  };

  function timeLabel(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch(e) { return ''; }
  }

  function relativeTime(iso) {
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1)  return 'À l\'instant';
      if (m < 60) return `Il y a ${m} min`;
      const h = Math.floor(m / 60);
      if (h < 24) return `Il y a ${h}h`;
      return `Il y a ${Math.floor(h / 24)}j`;
    } catch(e) { return ''; }
  }

  function buildCard(item, idx, lang) {
    const s = SENTIMENT_MAP[item.sentiment] || SENTIMENT_MAP['Neutre'];
    const label = lang === 'en' ? (s.label || '') : (s.labelFr || '');
    const biasHtml = s.cls
      ? `<span class="bias ${s.cls} card__bias">${label}</span>`
      : '';
    const time = timeLabel(item.published_at);
    const relTime = relativeTime(item.published_at);
    const zone = (window.ECO_ZONE || 'eco').charAt(0).toUpperCase() + (window.ECO_ZONE || 'eco').slice(1);
    const title = item.title || '';
    const summary = item.summary || '';
    const source = item.source || '';
    const url = item.url || '#';

    return `<article class="card" style="--i:${idx}" data-eco-dynamic>
  <a class="card__hit" href="${url}" target="_blank" rel="noopener nofollow" aria-label="${title.replace(/"/g,'&quot;')}">
    <p class="card__kicker">
      <span class="card__cat js-term">${zone}</span>
      <span class="card__sep">·</span>
      <span class="card__source">${source}</span>
      <span class="card__time" title="${relTime}">${time}</span>
      ${biasHtml}
    </p>
    <h3 class="card__title">${title}</h3>
    <p class="card__summary">${summary}</p>
  </a>
  <a class="btn" href="${url}" target="_blank" rel="noopener nofollow">
    <span>${lang === 'en' ? 'Read article' : 'Lire l\'article'}</span>
    <span class="btn__arrow" aria-hidden="true">→</span>
  </a>
</article>`;
  }

  function buildSkeleton(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `<article class="card card--skeleton" style="--i:${i}" aria-hidden="true">
  <div class="card__skel-line card__skel-line--short"></div>
  <div class="card__skel-line"></div>
  <div class="card__skel-line card__skel-line--med"></div>
</article>`;
    }
    return html;
  }

  function buildEmpty(lang) {
    return `<div class="eco-empty" style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--text3)">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:32px;opacity:.4;margin-bottom:12px"><path d="M3 7h18M3 12h12M3 17h7"/></svg>
  <p style="font-size:13px">${lang === 'en' ? 'No news yet — the bot is collecting articles…' : 'Aucune news pour l\'instant — le bot est en train de collecter les articles…'}</p>
</div>`;
  }

  function buildError(lang) {
    return `<div class="eco-empty" style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--text3)">
  <p style="font-size:13px">${lang === 'en' ? 'Unable to load news. Retrying…' : 'Impossible de charger les news. Nouvelle tentative…'}</p>
</div>`;
  }

  async function loadNews() {
    const zone = window.ECO_ZONE;
    if (!zone) return;

    // Trouve le conteneur grid
    const grid = document.querySelector(`#r-${zone} .grid, .block .grid`);
    if (!grid) return;

    const lang = localStorage.getItem('lt_lang') || 'fr';

    // Affiche skeleton
    grid.innerHTML = buildSkeleton(6);

    try {
      const resp = await fetch(`/api/news?zone=${zone}&limit=15`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const items = data.items || [];

      if (items.length === 0) {
        grid.innerHTML = buildEmpty(lang);
      } else {
        grid.innerHTML = items.map((item, i) => buildCard(item, i, lang)).join('\n');
      }
    } catch(e) {
      console.warn('[eco-news-loader] Erreur:', e.message);
      grid.innerHTML = buildError(lang);
      // Retry après 30s
      setTimeout(loadNews, 30000);
    }
  }

  // Initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews);
  } else {
    loadNews();
  }

  // Refresh toutes les 5 minutes
  setInterval(loadNews, 5 * 60 * 1000);

  // Expose pour forcer un refresh depuis la console
  window.ecoReloadNews = loadNews;
})();
