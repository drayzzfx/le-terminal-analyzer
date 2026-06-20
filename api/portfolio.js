const https = require('https');

function supabaseRequest(method, path, body, token) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const host = url.replace('https://', '');
  const payload = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: host,
      path: '/rest/v1/' + path,
      method,
      headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + (token || key),
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    if (payload) opts.headers['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request(opts, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: r.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  // GET — charger les positions de l'utilisateur
  if (req.method === 'GET') {
    const r = await supabaseRequest('GET', 'portfolio_holdings?select=*&order=asset_type,asset_name', null, token);
    return res.status(200).json(Array.isArray(r.body) ? r.body : []);
  }

  // POST — sauvegarder (upsert) une liste de positions
  if (req.method === 'POST') {
    const rows = req.body;
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'Format invalide' });

    const sanitized = rows.map(r => ({
      asset_id: String(r.asset_id || '').slice(0, 50),
      asset_name: String(r.asset_name || '').slice(0, 100),
      asset_type: ['etf','action','crypto','obligation','liquidites'].includes(r.asset_type) ? r.asset_type : 'etf',
      amount: Math.max(0, Math.min(parseFloat(r.amount) || 0, 1e9)),
      updated_at: new Date().toISOString()
    }));

    const result = await supabaseRequest('POST',
      'portfolio_holdings?on_conflict=user_id,asset_id',
      sanitized, token
    );
    if (result.status >= 300) return res.status(result.status).json({ error: 'Erreur Supabase' });
    return res.status(200).json({ ok: true });
  }

  // DELETE — vider tout le portefeuille
  if (req.method === 'DELETE') {
    await supabaseRequest('DELETE', 'portfolio_holdings?amount=gte.0', null, token);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
