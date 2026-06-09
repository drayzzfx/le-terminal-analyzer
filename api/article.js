// api/article.js
// GET /api/article?id=UUID
// Retourne l'article + génère une analyse complète via Claude (mise en cache)
const https = require('https');

function sbReq(method, path, body) {
  const url = new URL(process.env.SUPABASE_URL);
  const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
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
  res.setHeader('Cache-Control', 's-maxage=3600');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = req.query?.id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  // Récupère l'article
  const r = await sbReq('GET', `/rest/v1/news_items?id=eq.${id}&select=*&limit=1`);
  if (!Array.isArray(r.body) || r.body.length === 0) {
    return res.status(404).json({ error: 'Article introuvable' });
  }
  const article = r.body[0];

  // Analyse déjà en cache ?
  if (article.analysis) {
    try {
      const cached = JSON.parse(article.analysis);
      return res.status(200).json({ article, analysis: cached, cached: true });
    } catch(e) { /* recalcule si JSON corrompu */ }
  }

  // Génère l'analyse via Claude
  const analysis = await generateAnalysis(article);
  if (!analysis) {
    return res.status(200).json({ article, analysis: null, cached: false });
  }

  // Met en cache dans Supabase
  await sbReq('PATCH', `/rest/v1/news_items?id=eq.${id}`, { analysis: JSON.stringify(analysis) }).catch(() => {});

  return res.status(200).json({ article, analysis, cached: false });
};
