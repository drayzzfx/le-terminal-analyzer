// api/archive.js
// Lecture des résumés quotidiens (page Archive).
//  - GET /api/archive            → liste des jours disponibles (récents) avec compteurs
//  - GET /api/archive?day=YYYY-MM-DD → tous les résumés (par zone) de ce jour
const https = require('https');

function sbReq(path) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_ANON_KEY;
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SUPABASE_URL) return res.status(500).json({ error: 'SUPABASE_URL manquante' });

  const day = req.query && req.query.day;

  try {
    if (day) {
      // Résumés du jour, par zone
      const path = `/rest/v1/daily_summaries?day=eq.${encodeURIComponent(day)}`
        + `&select=zone,summary,summary_en,item_count,top_sentiment,created_at`;
      const r = await sbReq(path);
      return res.status(200).json({ day, items: Array.isArray(r.body) ? r.body : [] });
    }

    // Liste des jours disponibles (90 derniers max), avec agrégats par jour
    const path = `/rest/v1/daily_summaries?select=day,zone,item_count&order=day.desc&limit=900`;
    const r = await sbReq(path);
    const rows = Array.isArray(r.body) ? r.body : [];
    const byDay = {};
    rows.forEach(row => {
      if (!byDay[row.day]) byDay[row.day] = { day: row.day, zones: 0, items: 0 };
      byDay[row.day].zones += 1;
      byDay[row.day].items += (row.item_count || 0);
    });
    const days = Object.values(byDay).sort((a, b) => (a.day < b.day ? 1 : -1)).slice(0, 90);
    return res.status(200).json({ days });
  } catch (e) {
    return res.status(500).json({ error: 'archive error', detail: String(e).slice(0, 200) });
  }
};
