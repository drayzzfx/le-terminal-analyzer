const https = require('https');

function supabaseRequest(method, path, body, key, token) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${token || key}`
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request({ hostname: url.hostname, path, method, headers }, (res) => {
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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ANON_KEY;
  if (!ANON_KEY) return res.status(500).json({ error: 'Not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  // Extract ID from URL: /api/history/UUID
  const id = req.url.split('/').filter(Boolean).pop();
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    // Verify user owns this analysis
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    if (!userRes.body.id) return res.status(401).json({ error: 'Invalid token' });
    const userId = userRes.body.id;
    const userEmail = userRes.body.email || '';

    // Supprime par id ET (user_id OU user_email) — couvre les comptes Google/email
    // partageant le même email (sinon le DELETE ne matche rien et l'analyse réapparaît).
    const owner = userEmail
      ? `or=(user_id.eq.${userId},user_email.eq.${encodeURIComponent(userEmail)})`
      : `user_id=eq.${userId}`;
    const r = await supabaseRequest(
      'DELETE',
      `/rest/v1/analyses?id=eq.${id}&${owner}`,
      null, SERVICE_KEY, SERVICE_KEY
    );
    return res.status(200).json({ ok: true, status: r.status });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
