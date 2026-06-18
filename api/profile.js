const https = require('https');

function supabaseRequest(method, path, body, key, authToken) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${authToken || key}`,
      'Prefer': (method === 'POST') ? 'resolution=merge-duplicates,return=representation' : (method === 'PATCH' ? 'return=representation' : undefined)
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
      const r = await supabaseRequest('GET', `/rest/v1/user_profiles?id=eq.${userId}&select=first_name,last_name,pseudo,avatar_url,trial_start,is_pro`, null, SERVICE_KEY, SERVICE_KEY);
      const profile = Array.isArray(r.body) ? r.body[0] : null;
      return res.status(200).json(profile || {});
    }

    if (req.method === 'PATCH') {
      const { first_name, last_name, pseudo, avatar_url, trial_start } = req.body || {};
      const patch = {};
      if (first_name !== undefined) patch.first_name = first_name;
      if (last_name  !== undefined) patch.last_name  = last_name;
      if (pseudo     !== undefined) patch.pseudo     = pseudo;
      if (avatar_url !== undefined) patch.avatar_url = avatar_url;
      if (trial_start !== undefined) patch.trial_start = trial_start;

      // Upsert: insert or update on conflict (id)
      const upsertBody = { id: userId, email: userEmail, ...patch };
      const r = await supabaseRequest('POST', '/rest/v1/user_profiles', upsertBody, SERVICE_KEY, SERVICE_KEY);
      if (r.status >= 400) {
        // Fallback: plain PATCH
        const u = await supabaseRequest('PATCH', `/rest/v1/user_profiles?id=eq.${userId}`, patch, SERVICE_KEY, SERVICE_KEY);
        if (u.status >= 400) return res.status(500).json({ error: 'Save failed', detail: u.body });
        return res.status(200).json(Array.isArray(u.body) ? u.body[0] : {});
      }
      return res.status(200).json(Array.isArray(r.body) ? r.body[0] : {});
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
