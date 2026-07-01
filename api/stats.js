const https = require('https');

function supabaseRequest(method, path, body, key, authToken) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${authToken || key}`,
      'Prefer': (method === 'POST') ? 'resolution=merge-duplicates,return=representation' : undefined
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    Object.keys(headers).forEach(k => headers[k] === undefined && delete headers[k]);
    const options = { hostname: url.hostname, path, method, headers };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Progression du joueur rattachée au compte (temps par outil, objectifs, etc.).
// GET  → renvoie l'objet stats du compte.
// POST → fusionne (usage = max par outil, jamais de régression) puis renvoie stats.
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ANON_KEY;
  if (!ANON_KEY) return res.status(500).json({ error: 'Not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    const userId = userRes.body && userRes.body.id;
    const userEmail = userRes.body && userRes.body.email;
    if (!userId) return res.status(401).json({ error: 'Invalid session' });

    // Stats actuelles (clé service → bypass RLS)
    const cur = await supabaseRequest('GET', `/rest/v1/user_profiles?id=eq.${userId}&select=stats`, null, SERVICE_KEY, SERVICE_KEY);
    let stats = (cur.body && cur.body[0] && cur.body[0].stats) || {};
    if (typeof stats !== 'object' || stats === null) stats = {};

    if (req.method === 'GET') {
      return res.status(200).json(stats);
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      // usage : fusion par MAX (ms + visits) → la progression ne redescend jamais
      const incU = (b.usage && typeof b.usage === 'object') ? b.usage : {};
      const outU = (stats.usage && typeof stats.usage === 'object') ? stats.usage : {};
      Object.keys(incU).forEach(function (k) {
        const a = outU[k] || { ms: 0, visits: 0 };
        const c = incU[k] || {};
        outU[k] = {
          ms: Math.max(Number(a.ms) || 0, Number(c.ms) || 0),
          visits: Math.max(Number(a.visits) || 0, Number(c.visits) || 0),
          last: c.last || a.last || null
        };
      });
      stats.usage = outU;
      // autres clés : valeurs opaques (stockées telles quelles) — on prend la valeur fournie si présente
      ['goals', 'notes', 'eco_unlocked', 'currency'].forEach(function (k) {
        if (b[k] !== undefined && b[k] !== null && b[k] !== '') stats[k] = b[k];
      });
      stats.updated_at = new Date().toISOString();

      const r = await supabaseRequest('POST', '/rest/v1/user_profiles',
        { id: userId, email: userEmail, stats: stats }, SERVICE_KEY, SERVICE_KEY);
      if (r.status >= 300) return res.status(r.status).json({ error: 'save_failed', detail: r.body });
      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
