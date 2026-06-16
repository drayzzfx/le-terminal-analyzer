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
  const lines = items.slice(0, 80).map((it, i) =>
    `${i + 1}. [${it.sentiment || 'Neutre'}] ${it.title}${it.summary ? ' — ' + it.summary : ''}`
  ).join('\n');

  const system = `Tu es l'éditorialiste macro en chef de « Le Terminal ». Tu rédiges un rapport de journée approfondi pour une zone, destiné à des traders exigeants. Dense, factuel, structuré, sans bla-bla ni remplissage. Ton direct, en français, tu tutoies le lecteur. Pas d'emoji. Tu réponds UNIQUEMENT par un objet JSON valide : {"fr":"...","en":"...","bias":"Positif|Négatif|Neutre"}.`;
  const user = `Zone : ${zoneLabel}. Journée du ${dayStr}.
Voici TOUTES les annonces de la journée pour cette zone :
${lines}

Rédige un RAPPORT COMPLET ET APPROFONDI de cette journée pour cette zone — beaucoup plus détaillé qu'une simple synthèse. Structure ta réponse avec des sections, chacune introduite par une ligne « ## » suivie d'un titre court, puis un ou plusieurs paragraphes. Utilise EXACTEMENT ces sections, dans cet ordre :
## Vue d'ensemble
## Les faits marquants
## Analyse par thème
## Chiffres & niveaux clés
## Orientation & à surveiller

Consignes : relie les annonces entre elles plutôt que de les lister ; cite les chiffres, noms propres et niveaux quand ils figurent dans les annonces ; explique les implications concrètes pour les actifs de la zone ; sois précis et nuancé. Si la matière est pauvre, reste honnête et plus bref plutôt que de meubler.

Fournis : "fr" = le rapport en français (avec les sections « ## »), "en" = sa traduction anglaise (mêmes sections, titres traduits), "bias" = l'orientation marché globale de la zone ce jour ("Positif", "Négatif" ou "Neutre"). Réponds uniquement par le JSON.`;

  const payload = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 2600,
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!process.env.SUPABASE_URL) return res.status(500).json({ error: 'SUPABASE_URL manquante' });

  const day = req.query && req.query.day;
  const zone = req.query && req.query.zone;
  if (!day || !zone || !ZONE_LABEL[zone]) return res.status(400).json({ error: 'Paramètres day + zone requis', zones: Object.keys(ZONE_LABEL) });

  try {
    const { startISO, endISO } = parisDayBounds(day);
    const path = `/rest/v1/news_items?zone=eq.${zone}`
      + `&published_at=gte.${encodeURIComponent(startISO)}`
      + `&published_at=lt.${encodeURIComponent(endISO)}`
      + `&order=published_at.asc&select=id,title,title_en,summary,summary_en,source,url,published_at,sentiment&limit=200`;
    const r = await sbReq(path);
    const items = Array.isArray(r.body) ? r.body : [];

    if (items.length === 0) {
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
      return res.status(200).json({ ok: true, day, zone, label: ZONE_LABEL[zone], item_count: 0, report_fr: '', report_en: '', bias: 'Neutre', items: [] });
    }

    const rep = await claudeReport(ZONE_LABEL[zone], day, items);
    // Journée figée → cache CDN long (24 h) une fois généré.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({
      ok: true, day, zone, label: ZONE_LABEL[zone],
      item_count: items.length,
      report_fr: (rep && rep.fr) || '',
      report_en: (rep && rep.en) || '',
      bias: (rep && rep.bias) || 'Neutre',
      items
    });
  } catch (e) {
    return res.status(500).json({ error: 'archive-detail error', detail: String(e).slice(0, 200) });
  }
};
