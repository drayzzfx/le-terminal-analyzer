// api/archive-detail.js
// Rapport approfondi d'une journée pour UNE zone (page de détail d'archive).
// GET /api/archive-detail?day=YYYY-MM-DD&zone=europe
// Récupère toutes les annonces du jour pour la zone, puis demande à Claude un
// rapport structuré (sections « ## Titre ») bien plus poussé que la synthèse
// de la page Archive. Renvoie aussi la liste des annonces.
// Les journées passées étant figées, on cache fortement côté CDN.
const https = require('https');

const ZONE_LABEL = {
  europe: 'Europe', ameriques: 'Amériques', asie: 'Asie', marches: 'Marchés',
  institutions: 'Institutions', international: 'International', crypto: 'Crypto', flash: 'Flash Info'
};

function sbReq(path) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  const url = new URL(SUPABASE_URL);
  return new Promise((resolve, reject) => {
    https.request({
      hostname: url.hostname, path, method: 'GET',
      headers: { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch (e) { resolve({ status: res.statusCode, body: [] }); } });
    }).on('error', reject).end();
  });
}

// Bornes UTC d'une journée donnée en heure de Paris.
function parisDayBounds(dayStr) {
  const probe = new Date(dayStr + 'T12:00:00Z');
  const parisHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(probe));
  const offset = parisHour - 12;
  const start = new Date(dayStr + 'T00:00:00Z').getTime() - offset * 3600000;
  const end = start + 24 * 3600000;
  return { startISO: new Date(start).toISOString(), endISO: new Date(end).toISOString() };
}

async function claudeReport(zoneLabel, dayStr, items) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return null;
  const lines = items.slice(0, 120).map((it, i) =>
    `${i + 1}. [${it.sentiment || 'Neutre'}] (${it.source || '?'}) ${it.title}${it.summary ? ' — ' + it.summary : ''}`
  ).join('\n');

  const system = `Tu es l'éditorialiste macro en chef de « Le Terminal ». Tu rédiges le rapport de journée d'une zone : approfondi et exigeant, mais clair et accessible à TOUT LECTEUR (pas seulement aux pros). Tu expliques simplement les termes techniques quand tu les emploies. Dense et concret, jamais creux. Ton direct, en français, tu tutoies le lecteur. Pas d'emoji. Tu réponds UNIQUEMENT par un objet JSON valide : {"fr":"...","en":"...","bias":"Positif|Négatif|Neutre"}.`;
  const user = `Zone : ${zoneLabel}. Journée du ${dayStr}.
Voici TOUTES les annonces de la journée pour cette zone (utilise-les TOUTES dans ton analyse, relie-les entre elles) :
${lines}

Rédige un RAPPORT COMPLET, DÉTAILLÉ ET APPROFONDI de cette journée pour cette zone. Pas une synthèse expéditive : développe chaque section sur plusieurs phrases. Structure ta réponse avec des sections, chacune introduite par une ligne « ## » suivie d'un titre court, puis un ou plusieurs paragraphes. Utilise EXACTEMENT ces sections, dans cet ordre :
## Vue d'ensemble
## Les faits marquants
## Décryptage
## Chiffres & niveaux clés
## Impact sur les marchés
## Ce qu'il faut surveiller
## À retenir

Consignes :
- Prends en compte TOUTES les annonces ci-dessus ; relie-les, dégage les tendances, ne te limite pas aux plus visibles.
- Explique le POURQUOI et les implications concrètes (sur les actions, taux, devises, matières premières de la zone), pas seulement le QUOI.
- Reste compréhensible par tous : quand tu emploies un terme technique (ex. « spread », « hawkish », « PMI »), explique-le en quelques mots.
- Cite les chiffres, niveaux et noms propres présents dans les annonces.
- « ## À retenir » = 3 à 5 puces commençant par « - », chacune une idée clé courte.
- Si la matière est vraiment pauvre, reste honnête et plus bref plutôt que de meubler.

Fournis : "fr" = le rapport en français (avec les sections « ## » et les puces « - »), "en" = sa traduction anglaise (même structure), "bias" = l'orientation marché globale de la zone ce jour ("Positif", "Négatif" ou "Neutre"). Réponds uniquement par le JSON.`;

  const payload = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system,
    messages: [{ role: 'user', content: user }]
  });

  const result = await new Promise((resolve, reject) => {
    const r = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(null); } });
    });
    r.on('error', reject);
    r.write(payload); r.end();
  });

  const txt = result && result.content && result.content[0] && result.content[0].text;
  if (!txt) return null;
  try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch (e) { return null; }
}

// Développe un bilan court déjà rédigé en rapport structuré et aéré, SANS
// inventer de faits (utilisé quand les annonces brutes ont été purgées).
async function claudeExpand(zoneLabel, dayStr, summaryText) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY || !summaryText) return null;

  const system = `Tu es l'éditorialiste macro en chef de « Le Terminal ». Tu développes un bilan déjà rédigé en un rapport clair, structuré et pédagogique, accessible à tout lecteur (tu expliques simplement les termes techniques). Ton direct, en français, tu tutoies le lecteur. Pas d'emoji. Tu réponds UNIQUEMENT par un objet JSON valide : {"fr":"...","en":"...","bias":"Positif|Négatif|Neutre"}.`;
  const user = `Zone : ${zoneLabel}. Journée du ${dayStr}.
Voici le bilan synthétique déjà rédigé pour cette zone ce jour-là :
"""
${summaryText}
"""

Développe ce bilan en un RAPPORT structuré, détaillé et AÉRÉ. Structure ta réponse avec des sections, chacune introduite par une ligne « ## » suivie d'un titre court, puis un ou plusieurs paragraphes. Utilise EXACTEMENT ces sections, dans cet ordre :
## Vue d'ensemble
## Les faits marquants
## Décryptage
## Chiffres & niveaux clés
## Impact sur les marchés
## Ce qu'il faut surveiller
## À retenir

IMPORTANT : appuie-toi UNIQUEMENT sur le contenu du bilan ci-dessus. Tu peux expliquer, contextualiser, clarifier les termes techniques et développer le raisonnement, mais n'invente AUCUN chiffre, niveau, nom ou fait qui n'y figure pas. « ## À retenir » = 3 à 5 puces commençant par « - ».

Fournis : "fr" = le rapport en français (avec « ## » et puces « - »), "en" = sa traduction anglaise (même structure), "bias" = "Positif", "Négatif" ou "Neutre". Réponds uniquement par le JSON.`;

  const payload = JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] });
  const result = await new Promise((resolve) => {
    const r = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }
    }, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve(null); } }); });
    r.on('error', () => resolve(null));
    r.write(payload); r.end();
  });
  const txt = result && result.content && result.content[0] && result.content[0].text;
  if (!txt) return null;
  try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch (e) { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!process.env.SUPABASE_URL) return res.status(500).json({ error: 'SUPABASE_URL manquante' });

  const day = req.query && req.query.day;
  const zone = req.query && req.query.zone;
  const deep = req.query && req.query.deep === '1';
  if (!day || !zone || !ZONE_LABEL[zone]) return res.status(400).json({ error: 'Paramètres day + zone requis', zones: Object.keys(ZONE_LABEL) });

  try {
    const { startISO, endISO } = parisDayBounds(day);
    const itemsPath = `/rest/v1/news_items?zone=eq.${zone}`
      + `&published_at=gte.${encodeURIComponent(startISO)}`
      + `&published_at=lt.${encodeURIComponent(endISO)}`
      + `&order=published_at.asc&select=id,title,title_en,summary,summary_en,source,url,published_at,sentiment&limit=200`;
    const sumPath = `/rest/v1/daily_summaries?day=eq.${encodeURIComponent(day)}&zone=eq.${zone}`
      + `&select=summary,summary_en,item_count,top_sentiment&limit=1`;
    // Rapport long stocké (colonnes report/report_en) — requête séparée pour
    // rester compatible si la migration n'a pas encore été appliquée.
    const repPath = `/rest/v1/daily_summaries?day=eq.${encodeURIComponent(day)}&zone=eq.${zone}`
      + `&select=report,report_en&limit=1`;

    const [ri, rs, rr] = await Promise.all([sbReq(itemsPath), sbReq(sumPath), sbReq(repPath)]);
    const items = Array.isArray(ri.body) ? ri.body : [];
    const sumRow = Array.isArray(rs.body) && rs.body[0] ? rs.body[0] : null;
    const repRow = Array.isArray(rr.body) && rr.body[0] ? rr.body[0] : null; // null si colonnes absentes
    const stored = repRow && repRow.report;

    // Rien du tout (ni annonces, ni bilan) → message « aucune annonce ».
    if (items.length === 0 && !sumRow && !stored) {
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
      return res.status(200).json({ ok: true, day, zone, label: ZONE_LABEL[zone], item_count: 0, report_fr: '', report_en: '', bias: 'Neutre', items: [] });
    }

    const bias = (sumRow && sumRow.top_sentiment) || 'Neutre';
    const item_count = items.length || (sumRow && sumRow.item_count) || 0;

    // ── Réponse RAPIDE (par défaut) : on ne bloque JAMAIS sur Claude.
    // On renvoie le rapport déjà stocké, sinon le résumé court, immédiatement.
    if (!deep) {
      const fast_fr = stored || (sumRow && sumRow.summary) || '';
      const fast_en = (repRow && repRow.report_en) || (sumRow && sumRow.summary_en) || '';
      // deepenable = un rapport approfondi peut encore être produit à la demande
      const deepenable = !stored && (items.length > 0 || !!(sumRow && sumRow.summary));
      res.setHeader('Cache-Control', stored ? 's-maxage=86400, stale-while-revalidate=604800' : 's-maxage=120, stale-while-revalidate=300');
      return res.status(200).json({ ok: true, day, zone, label: ZONE_LABEL[zone], item_count, report_fr: fast_fr, report_en: fast_en, bias, deepenable, deep: !!stored, items });
    }

    // ── Réponse APPROFONDIE (?deep=1) : génération via Claude, mise en cache CDN.
    let rep = null;
    if (!stored) {
      if (items.length > 0) rep = await claudeReport(ZONE_LABEL[zone], day, items);
      else if (sumRow && sumRow.summary) rep = await claudeExpand(ZONE_LABEL[zone], day, sumRow.summary);
    }
    const report_fr = stored || (rep && rep.fr) || (sumRow && sumRow.summary) || '';
    const report_en = (repRow && repRow.report_en) || (rep && rep.en) || (sumRow && sumRow.summary_en) || '';
    const dbias = (rep && rep.bias) || bias;

    // Si la génération a réussi (rep) ou qu'un rapport est stocké → cache long ;
    // sinon (repli résumé) cache court pour réessayer plus tard.
    res.setHeader('Cache-Control', (stored || rep) ? 's-maxage=86400, stale-while-revalidate=604800' : 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({
      ok: true, day, zone, label: ZONE_LABEL[zone],
      item_count, report_fr, report_en, bias: dbias, deep: true, items
    });
  } catch (e) {
    return res.status(500).json({ error: 'archive-detail error', detail: String(e).slice(0, 200) });
  }
};
