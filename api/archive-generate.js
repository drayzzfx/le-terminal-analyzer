// api/archive-generate.js
// Génère (et stocke) le résumé quotidien IA par zone, pour la page Archive.
// Déclenché par le cron Vercel (~23h Paris) ou manuellement : GET /api/archive-generate?day=YYYY-MM-DD
// Pour chaque zone, récupère les annonces du jour dans news_items, demande à Claude
// une synthèse FR + EN, puis upsert dans la table daily_summaries.
const https = require('https');

const ZONES = ['europe', 'ameriques', 'asie', 'marches', 'institutions', 'international', 'crypto', 'flash'];
const ZONE_LABEL = {
  europe: 'Europe', ameriques: 'Amériques', asie: 'Asie', marches: 'Marchés',
  institutions: 'Institutions', international: 'International', crypto: 'Crypto', flash: 'Flash Info'
};

function sbReq(method, path, body) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  const url = new URL(SUPABASE_URL);
  const payload = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
    };
    if (method === 'POST') headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const r = https.request({ hostname: url.hostname, path, method, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
        catch (e) { resolve({ status: res.statusCode, body: null }); }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

// Bornes UTC d'une journée donnée en heure de Paris.
function parisDayBounds(dayStr) {
  const probe = new Date(dayStr + 'T12:00:00Z');
  const parisHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(probe));
  const offset = parisHour - 12; // +1 (hiver) ou +2 (été)
  const start = new Date(dayStr + 'T00:00:00Z').getTime() - offset * 3600000;
  const end = start + 24 * 3600000;
  return { startISO: new Date(start).toISOString(), endISO: new Date(end).toISOString() };
}

function todayParis() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date()); // YYYY-MM-DD
}

function dominantSentiment(items) {
  const c = {};
  items.forEach(i => { if (i.sentiment) c[i.sentiment] = (c[i.sentiment] || 0) + 1; });
  let best = null, n = 0;
  Object.keys(c).forEach(k => { if (c[k] > n) { n = c[k]; best = k; } });
  return best;
}

async function claudeSummary(zoneLabel, dayStr, items) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const lines = items.slice(0, 60).map((it, i) =>
    `${i + 1}. [${it.sentiment || 'Neutre'}] ${it.title}${it.summary ? ' — ' + it.summary : ''}`
  ).join('\n');

  const system = `Tu es l'éditorialiste macro de « Le Terminal ». Tu écris un bilan de fin de journée, factuel, dense et sans bla-bla, pour des traders. Ton direct, en français, tu tutoies le lecteur. Pas d'emoji. Tu réponds UNIQUEMENT par un objet JSON valide : {"fr": "...", "en": "...", "bias": "Positif|Négatif|Neutre"}.`;
  const user = `Zone : ${zoneLabel}. Journée du ${dayStr}.
Voici les annonces de la journée :
${lines}

Rédige une SYNTHÈSE de la journée pour cette zone : 2 à 4 phrases, ce qu'il faut retenir et l'orientation générale (haussier / baissier / prudence). Va à l'essentiel, relie les annonces entre elles plutôt que de les lister. Fournis : "fr" (synthèse FR), "en" (sa traduction anglaise) et "bias" = l'orientation marché globale de la zone ce jour — "Positif" (plutôt haussier / risk-on), "Négatif" (plutôt baissier / risk-off) ou "Neutre" (mitigé / sans direction nette), d'après le SENS des annonces et pas leur étiquette. Réponds uniquement par le JSON.`;

  const payload = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 700,
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
  try {
    const m = txt.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch (e) { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante' });
  if (!process.env.SUPABASE_URL) return res.status(500).json({ error: 'SUPABASE_URL manquante' });

  const day = (req.query && req.query.day) || todayParis();
  const { startISO, endISO } = parisDayBounds(day);

  const out = { day, zones: {} };

  // Les 8 zones sont traitées EN PARALLÈLE (sinon 8 appels Claude en série → timeout).
  await Promise.all(ZONES.map(async (zone) => {
    try {
      const path = `/rest/v1/news_items?zone=eq.${zone}`
        + `&published_at=gte.${encodeURIComponent(startISO)}`
        + `&published_at=lt.${encodeURIComponent(endISO)}`
        + `&order=published_at.desc&select=title,summary,sentiment,source,published_at&limit=80`;
      const r = await sbReq('GET', path);
      const items = Array.isArray(r.body) ? r.body : [];
      if (items.length === 0) { out.zones[zone] = 'skip (0)'; return; }

      const synth = await claudeSummary(ZONE_LABEL[zone], day, items);
      if (!synth || !synth.fr) { out.zones[zone] = 'no-synth'; return; }

      const row = {
        day,
        zone,
        summary: synth.fr,
        summary_en: synth.en || null,
        item_count: items.length,
        top_sentiment: (synth.bias && ['Positif','Négatif','Neutre'].indexOf(synth.bias) !== -1) ? synth.bias : dominantSentiment(items)
      };
      const up = await sbReq('POST', '/rest/v1/daily_summaries?on_conflict=day,zone', row);
      out.zones[zone] = up.status >= 400 ? ('err ' + up.status + ' ' + JSON.stringify(up.body).slice(0, 120)) : ('ok (' + items.length + ')');
    } catch (e) {
      out.zones[zone] = 'exception: ' + (e && e.message ? e.message : String(e)).slice(0, 120);
    }
  }));

  return res.status(200).json(out);
};
