// api/news.js
// GET /api/news?zone=europe&limit=15
// Retourne les news depuis Supabase, filtrées par zone
const https = require('https');

function sbReq(path) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_ANON_KEY;
  const url = new URL(SUPABASE_URL);
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const zone  = req.query?.zone  || 'europe';
  const limit = Math.min(parseInt(req.query?.limit || '15'), 60);

  const VALID_ZONES = ['europe','ameriques','asie','institutions','marches','crypto','international'];
  if (!VALID_ZONES.includes(zone)) {
    return res.status(400).json({ error: 'Zone invalide', valid: VALID_ZONES });
  }

  const path = `/rest/v1/news_items?zone=eq.${zone}&order=published_at.desc&limit=${limit}&select=id,guid,title,summary,summary_en,source,url,published_at,sentiment`;
  const r = await sbReq(path);

  if (r.status >= 400) {
    return res.status(500).json({ error: 'Supabase error', detail: r.body });
  }

  return res.status(200).json({ zone, items: Array.isArray(r.body) ? r.body : [] });
};
