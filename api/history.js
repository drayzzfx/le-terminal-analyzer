const https = require('https');

function supabaseRequest(method, path, body, anonKey, authToken) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const url = new URL(SUPABASE_URL);
  
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${authToken || anonKey}`,
      'Prefer': method === 'POST' ? 'return=representation' : undefined
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    Object.keys(headers).forEach(k => headers[k] === undefined && delete headers[k]);

    const options = { hostname: url.hostname, path, method, headers };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!ANON_KEY) return res.status(500).json({ error: 'Not configured' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // Verify user
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    if (!userRes.body.id) return res.status(401).json({ error: 'Invalid token' });
    const userId = userRes.body.id;

    if (req.method === 'GET') {
      // Get history
      const r = await supabaseRequest('GET', `/rest/v1/analyses?user_id=eq.${userId}&order=created_at.desc&limit=50`, null, ANON_KEY, token);
      return res.status(200).json(r.body);
    }

    if (req.method === 'POST') {
      const { pair, direction, tf, score, verdict, scoreLabel, forces, faiblesses, recommandations, macro, scenarios, annotations, imgData } = req.body;
      const r = await supabaseRequest('POST', '/rest/v1/analyses', {
        user_id: userId,
        pair, direction, tf, score, verdict, score_label: scoreLabel,
        forces, faiblesses, recommandations, macro,
        scenarios: JSON.stringify(scenarios || []),
        annotations: JSON.stringify(annotations || []),
        img_data: imgData || null,
        created_at: new Date().toISOString()
      }, ANON_KEY, token);
      return res.status(200).json(r.body);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
