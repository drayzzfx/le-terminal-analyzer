// api/article.js
// GET /api/article?id=UUID
const https = require('https');

// ── Même pattern que api/news.js (qui fonctionne) ────────────────────────────
function sbGet(path) {
  const url = new URL(process.env.SUPABASE_URL);
  const KEY = process.env.SUPABASE_ANON_KEY; // anon key comme api/news.js
  return new Promise((resolve, reject) => {
    https.request({
      hostname: url.hostname,
      path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`,
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: [] }); }
      });
    }).on('error', reject).end();
  });
}

function sbPatch(id, payload) {
  const url = new URL(process.env.SUPABASE_URL);
  const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  const data = JSON.stringify(payload);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: url.hostname,
      path: `/rest/v1/news_items?id=eq.${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`,
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(data),
      }
    }, (res) => { res.resume(); resolve(res.statusCode); });
    req.on('error', () => resolve(0));
    req.write(data);
    req.end();
  });
}

// ── Génère l'analyse via Claude ───────────────────────────────────────────────
async function generateAnalysis(article) {
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return null;

  const prompt = `Tu es un analyste financier senior qui explique l'actualité économique à deux audiences différentes.

Article : ${article.title}
Source : ${article.source || ''}
Zone : ${article.zone || ''}
Résumé : ${article.summary || ''}
Sentiment marché : ${article.sentiment || 'Neutre'}

Génère une analyse complète en JSON strict (sans markdown). Structure exacte :
{
  "fr": {
    "titre_analyse": "<titre accrocheur en français, max 12 mots>",
    "pour_les_debutants": {
      "ce_qui_se_passe": "<explication simple, 2-3 phrases>",
      "pourquoi_cest_important": "<2-3 phrases : conséquences concrètes>",
      "le_mot_cle": "<un terme financier clé + définition en 1 phrase>"
    },
    "pour_les_professionnels": {
      "analyse_macro": "<2-3 phrases : implications macro-économiques>",
      "impact_marches": "<quels marchés sont affectés et comment>",
      "niveaux_cles": "<niveaux à surveiller, sinon N/A>",
      "biais_recommande": "<Risk-on / Risk-off / Attentisme + justification>"
    },
    "conclusion": "<1 phrase synthèse>"
  },
  "en": {
    "titre_analyse": "<catchy English title, max 12 words>",
    "pour_les_debutants": {
      "ce_qui_se_passe": "<simple explanation, 2-3 sentences>",
      "pourquoi_cest_important": "<2-3 sentences: concrete consequences>",
      "le_mot_cle": "<one key financial term + simple definition>"
    },
    "pour_les_professionnels": {
      "analyse_macro": "<2-3 sentences: macro implications>",
      "impact_marches": "<which markets are affected and how>",
      "niveaux_cles": "<key levels to watch, or N/A>",
      "biais_recommande": "<Risk-on / Risk-off / Wait-and-see + rationale>"
    },
    "conclusion": "<1 sentence synthesis>"
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

// ── Handler principal ─────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = (req.query && req.query.id) || '';
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  // Récupère l'article — même style que api/news.js
  const path = `/rest/v1/news_items?id=eq.${id}&select=id,guid,title,summary,summary_en,source,url,published_at,zone,sentiment,analysis&limit=1`;
  const r = await sbGet(path);

  console.log('[article] status:', r.status, 'isArray:', Array.isArray(r.body), 'len:', Array.isArray(r.body) ? r.body.length : 'n/a');

  if (r.status >= 400 || !Array.isArray(r.body) || r.body.length === 0) {
    return res.status(404).json({ error: 'Article introuvable', sbStatus: r.status });
  }

  const article = r.body[0];

  // Analyse en cache ?
  if (article.analysis) {
    try {
      const cached = JSON.parse(article.analysis);
      res.setHeader('Cache-Control', 's-maxage=3600');
      return res.status(200).json({ article, analysis: cached, cached: true });
    } catch(e) { /* JSON corrompu, on régénère */ }
  }

  // Génère via Claude
  const analysis = await generateAnalysis(article);

  // Sauvegarde en cache Supabase (silencieux si erreur)
  if (analysis) {
    sbPatch(id, { analysis: JSON.stringify(analysis) }).catch(() => {});
  }

  return res.status(200).json({ article, analysis, cached: false });
};
