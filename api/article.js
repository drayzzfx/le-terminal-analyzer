// api/article.js
// GET /api/article?id=UUID
// Retourne l'article + génère une analyse complète via Claude (mise en cache)
const https = require('https');

function sbReq(method, path, body) {
  const url = new URL(process.env.SUPABASE_URL);
  // Lecture  → anon key (compatible RLS public)
  // Écriture → service key (bypass RLS) si dispo, sinon anon
  const READ_KEY  = process.env.SUPABASE_ANON_KEY;
  const WRITE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  const KEY = (method === 'GET') ? READ_KEY : WRITE_KEY;
  const payload = body ? JSON.stringify(body) : null;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
  };
  if (method === 'PATCH') headers['Prefer'] = 'return=minimal';
  if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: url.hostname, path, method, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Récupère l'og:image de la page source (timeout 4s, suit 1 redirect)
function fetchOgImage(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 4000);
    const done = (val) => { clearTimeout(timer); resolve(val); };

    const tryFetch = (targetUrl, redirectsLeft) => {
      try {
        const parsed = new URL(targetUrl);
        const mod = parsed.protocol === 'https:' ? require('https') : require('http');
        const req = mod.request({ hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeTerminalBot/1.0)', 'Accept': 'text/html' } }, (res) => {
          if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && redirectsLeft > 0) {
            res.destroy();
            return tryFetch(res.headers.location.startsWith('http') ? res.headers.location : parsed.origin + res.headers.location, redirectsLeft - 1);
          }
          let html = '';
          res.on('data', c => { html += c; if (html.length > 30000) res.destroy(); });
          res.on('end', () => {
            const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
                   || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
            done(m ? m[1] : null);
          });
          res.on('error', () => done(null));
        });
        req.on('error', () => done(null));
        req.end();
      } catch(e) { done(null); }
    };
    tryFetch(url, 2);
  });
}

async function generateAnalysis(article) {
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return null;

  const prompt = `Tu es un analyste financier senior qui explique l'actualité économique à deux audiences différentes.

Article : ${article.title}
Source : ${article.source}
Zone : ${article.zone}
Résumé : ${article.summary || ''}
Sentiment marché : ${article.sentiment || 'Neutre'}

Génère une analyse complète en JSON strict (sans markdown). Structure exacte :
{
  "fr": {
    "titre_analyse": "<titre accrocheur en français, max 12 mots>",
    "pour_les_debutants": {
      "ce_qui_se_passe": "<explication simple, 2-3 phrases, comme si tu parlais à quelqu'un qui ne connaît pas la finance>",
      "pourquoi_cest_important": "<2-3 phrases : conséquences concrètes sur la vie quotidienne, les prix, l'emploi…>",
      "le_mot_cle": "<un terme financier clé de l'article + sa définition en 1 phrase simple>"
    },
    "pour_les_professionnels": {
      "analyse_macro": "<2-3 phrases : implications macro-économiques, politique monétaire, cycles>",
      "impact_marches": "<quels marchés sont affectés et comment : devises, taux, indices, matières premières>",
      "niveaux_cles": "<niveaux techniques ou fondamentaux à surveiller si applicables, sinon 'N/A'>",
      "biais_recommande": "<position macro recommandée : Risk-on / Risk-off / Attentisme + justification courte>"
    },
    "conclusion": "<1 phrase synthèse, ton professionnel>"
  },
  "en": {
    "titre_analyse": "<catchy English title, max 12 words>",
    "pour_les_debutants": {
      "ce_qui_se_passe": "<simple explanation, 2-3 sentences>",
      "pourquoi_cest_important": "<2-3 sentences: concrete consequences>",
      "le_mot_cle": "<one key financial term + simple 1-sentence definition>"
    },
    "pour_les_professionnels": {
      "analyse_macro": "<2-3 sentences: macro implications>",
      "impact_marches": "<which markets are affected and how>",
      "niveaux_cles": "<key technical or fundamental levels to watch, or 'N/A'>",
      "biais_recommande": "<recommended macro stance: Risk-on / Risk-off / Wait-and-see + short rationale>"
    },
    "conclusion": "<1 sentence synthesis, professional tone>"
  }
}`;

  const payload = JSON.stringify({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          const text = body.content?.[0]?.text || '{}';
          const match = text.match(/\{[\s\S]*\}/);
          resolve(match ? JSON.parse(match[0]) : null);
        } catch(e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(payload);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Pas de cache CDN global — on le pose seulement sur les 200 pour éviter que les 404 soient mis en cache
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = req.query?.id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  // Récupère l'article (colonnes explicites comme api/news.js)
  const r = await sbReq('GET', `/rest/v1/news_items?id=eq.${id}&select=id,guid,title,summary,summary_en,source,url,published_at,zone,sentiment,analysis&limit=1`);
  console.log('[article] Supabase status:', r.status, 'body type:', Array.isArray(r.body) ? 'array('+r.body.length+')' : typeof r.body);
  if (!Array.isArray(r.body) || r.body.length === 0) {
    return res.status(404).json({ error: 'Article introuvable' });
  }
  const article = r.body[0];

  // Tente de récupérer l'og:image de la source (timeout 3s)
  let image_url = null;
  if (article.url) {
    try {
      image_url = await fetchOgImage(article.url);
    } catch(e) { /* ignore */ }
  }

  // Analyse déjà en cache ? — CDN cache 1h pour les réponses 200 avec analyse
  if (article.analysis) {
    try {
      const cached = JSON.parse(article.analysis);
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=300');
      return res.status(200).json({ article, analysis: cached, cached: true, image_url });
    } catch(e) { /* recalcule si JSON corrompu */ }
  }

  // Génère l'analyse via Claude
  const analysis = await generateAnalysis(article);
  if (!analysis) {
    return res.status(200).json({ article, analysis: null, cached: false, image_url });
  }

  // Met en cache dans Supabase
  await sbReq('PATCH', `/rest/v1/news_items?id=eq.${id}`, { analysis: JSON.stringify(analysis) }).catch(() => {});

  return res.status(200).json({ article, analysis, cached: false, image_url });
};
