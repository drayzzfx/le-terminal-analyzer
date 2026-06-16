const https = require('https');

function supabaseRequest(method, path, body, key, authToken) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${authToken || key}`,
      'Prefer': (method === 'POST' || method === 'PATCH') ? 'return=representation' : undefined
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ANON_KEY;
  if (!ANON_KEY) return res.status(500).json({ error: 'Not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    if (!userRes.body.id) return res.status(401).json({ error: 'Invalid token' });
    const userId = userRes.body.id;
    const userEmail = userRes.body.email || '';

    if (req.method === 'GET') {
      const r = await supabaseRequest('GET', `/rest/v1/user_profiles?id=eq.${userId}&select=*`, null, SERVICE_KEY, SERVICE_KEY);
      const profile = Array.isArray(r.body) ? r.body[0] : null;
      return res.status(200).json(Object.assign({ email: userEmail }, profile || {}));
    }

    if (req.method === 'PATCH') {
      const b = req.body || {};
      const allowed = ['first_name', 'last_name', 'pseudo', 'avatar_url', 'trial_start'];
      const fields = {};
      allowed.forEach(k => { if (b[k] !== undefined) fields[k] = b[k]; });
      // Tente l'insertion (nouveau profil), sinon mise à jour
      const r = await supabaseRequest('POST', '/rest/v1/user_profiles',
        Object.assign({ id: userId, email: userEmail }, fields), SERVICE_KEY, SERVICE_KEY);
      if (r.status >= 400) {
        const u = await supabaseRequest('PATCH', `/rest/v1/user_profiles?id=eq.${userId}`, fields, SERVICE_KEY, SERVICE_KEY);
        return res.status(u.status >= 400 ? 500 : 200).json(Array.isArray(u.body) ? u.body[0] : (u.body || {}));
      }
      return res.status(200).json(Array.isArray(r.body) ? r.body[0] : {});
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
