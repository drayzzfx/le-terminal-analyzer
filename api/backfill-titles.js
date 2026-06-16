// api/backfill-titles.js
// Rétro-traduction des titres déjà stockés : remplit title (FR) + title_en (EN)
// pour les news_items dont title_en est encore vide (anciennes lignes ingérées
// avant la traduction à l'ingestion). À lancer manuellement, plusieurs fois si
// besoin : GET /api/backfill-titles  (traite ~40 lignes par appel).
const https = require('https');

function sbReq(method, path, body) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  const url = new URL(SUPABASE_URL);
  const payload = body ? JSON.stringify(body) : null;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
  };
  if (method === 'PATCH') headers['Prefer'] = 'return=minimal';
  if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
  return new Promise((resolve, reject) => {
    const r = https.request({ hostname: url.hostname, path, method, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

// Traduit une liste de titres → renvoie un tableau [{fr, en}] aligné sur l'entrée.
async function translateTitles(titles) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return null;

  const list = titles.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const prompt = `Voici une liste de titres d'actualité économique (certains en anglais, d'autres déjà en français).

${list}

Pour CHAQUE titre, donne sa version française naturelle et fidèle (pas de mot-à-mot ; garde noms propres, tickers et sigles) et sa version anglaise.
Si le titre est déjà en français, recopie-le tel quel dans "fr" et traduis-le en anglais dans "en".
Réponds UNIQUEMENT par un tableau JSON strict, même longueur et même ordre que la liste, sans markdown :
[{"fr":"...","en":"..."}, ...]`;

  const payload = JSON.stringify({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const result = await new Promise((resolve) => {
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
    r.on('error', () => resolve(null));
    r.write(payload); r.end();
  });

  const txt = result && result.content && result.content[0] && result.content[0].text;
  if (!txt) return null;
  try {
    const m = txt.match(/\[[\s\S]*\]/);
    return m ? JSON.parse(m[0]) : null;
  } catch (e) { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante' });
  if (!process.env.SUPABASE_URL) return res.status(500).json({ error: 'SUPABASE_URL manquante' });

  const limit = Math.min(parseInt((req.query && req.query.limit) || '40', 10), 60);

  // Lignes dont le titre anglais n'est pas encore renseigné.
  const r = await sbReq('GET', `/rest/v1/news_items?title_en=is.null&order=published_at.desc&select=id,title&limit=${limit}`);
  const rows = Array.isArray(r.body) ? r.body : [];
  if (rows.length === 0) return res.status(200).json({ ok: true, remaining: 0, patched: 0, message: 'Rien à traiter.' });

  const tr = await translateTitles(rows.map(x => x.title || ''));
  if (!tr) return res.status(502).json({ ok: false, error: 'Traduction indisponible' });

  let patched = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const t = tr[i] || {};
    const fr = (t.fr || '').trim() || row.title;
    const en = (t.en || '').trim() || row.title;
    const up = await sbReq('PATCH', `/rest/v1/news_items?id=eq.${row.id}`, { title: fr, title_en: en });
    if (up.status < 400) patched++;
  }

  // Combien reste-t-il ?
  const left = await sbReq('GET', '/rest/v1/news_items?title_en=is.null&select=id&limit=1000');
  const remaining = Array.isArray(left.body) ? left.body.length : null;

  return res.status(200).json({ ok: true, patched, processed: rows.length, remaining });
};
