const https = require('https');

function supabaseRequest(method, path, body, apiKey, authToken, prefer) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': apiKey,
      'Authorization': `Bearer ${authToken || apiKey}`,
    };
    if (prefer) headers['Prefer'] = prefer;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const options = { hostname: url.hostname, path, method, headers };
    const rq = https.request(options, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => { try { resolve({ status: r.statusCode, body: data ? JSON.parse(data) : null }); } catch (e) { resolve({ status: r.statusCode, body: data }); } });
    });
    rq.on('error', reject);
    if (payload) rq.write(payload);
    rq.end();
  });
}
function clip(s, n) { return String(s == null ? '' : s).slice(0, n); }

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ANON_KEY;
  if (!ANON_KEY) return res.status(500).json({ error: 'Not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    const userId = userRes.body && userRes.body.id;
    const userEmail = userRes.body && userRes.body.email;
    if (!userId) return res.status(401).json({ error: 'Invalid session' });

    const b = req.body || {};
    const survey = {
      level: clip(b.level, 40),
      market: clip(b.market, 40),
      goal: clip(b.goal, 60),
      source: clip(b.source, 40)
    };

    // Upsert sur user_profiles (clé service → bypass RLS). Crée la ligne si absente.
    const r = await supabaseRequest('POST', '/rest/v1/user_profiles',
      { id: userId, email: userEmail, survey, onboarded_at: new Date().toISOString() },
      SERVICE_KEY, null, 'resolution=merge-duplicates,return=minimal');

    if (r.status >= 300) return res.status(r.status).json({ error: 'save_failed' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[onboarding] EXCEPTION:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
