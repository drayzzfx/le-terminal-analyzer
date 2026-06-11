// api/cleanup-flash.js
// DELETE /api/cleanup-flash
// Supprime tous les articles zone=flash existants en Supabase
// À appeler une seule fois après le changement de filtre market_moving
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
    'Prefer': 'return=representation',
  };
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Use DELETE or POST' });
  }

  try {
    // Supprime tous les articles de la zone flash
    const r = await sbReq('DELETE', `/rest/v1/news_items?zone=eq.flash`, null);
    const deleted = Array.isArray(r.body) ? r.body.length : '?';
    return res.status(200).json({ ok: true, deleted, message: `Articles flash supprimés. Le prochain cron repopulera avec le filtre 50pts.` });
  } catch(err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
