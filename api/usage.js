const https = require('https');

// Limites du plan GRATUIT, une fois par compte et par feature.
// Premium (is_pro) = illimité.
const FREE_LIMITS = { analyze: 1, eco: 1, journal: 3, patrimoine: 3 };
const COL = { analyze: 'used_analyze', eco: 'used_eco', journal: 'used_journal', patrimoine: 'used_patrimoine' };

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
    const reqx = https.request({ hostname: url.hostname, path, method, headers }, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: data ? JSON.parse(data) : null }); }
        catch (e) { resolve({ status: r.statusCode, body: data }); }
      });
    });
    reqx.on('error', reject);
    if (payload) reqx.write(payload);
    reqx.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const action = (req.body && req.body.action) || 'get';
  const feature = (req.body && req.body.feature) || null;

  try {
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    const userId = userRes.body && userRes.body.id;
    const userEmail = userRes.body && userRes.body.email;
    if (!userId) return res.status(401).json({ error: 'Invalid session' });

    const sel = 'used_analyze,used_eco,used_journal,used_patrimoine,is_pro,pro_until';
    let profRes = await supabaseRequest('GET', `/rest/v1/user_profiles?id=eq.${userId}&select=${sel}`, null, SERVICE_KEY);
    let profile = (profRes.body && profRes.body[0]) || null;
    if (!profile) {
      await supabaseRequest('POST', '/rest/v1/user_profiles',
        { id: userId, email: userEmail }, SERVICE_KEY, null, 'resolution=ignore-duplicates');
      profile = { used_analyze: 0, used_eco: 0, used_journal: 0, used_patrimoine: 0, is_pro: false };
    }

    const proActive = !profile.pro_until || new Date(profile.pro_until).getTime() > Date.now();
    const isPro = !!profile.is_pro && proActive;

    function usageObj() {
      const u = {};
      Object.keys(COL).forEach(f => { u[f] = { used: profile[COL[f]] || 0, limit: FREE_LIMITS[f], blocked: !isPro && (profile[COL[f]] || 0) >= FREE_LIMITS[f] }; });
      return u;
    }

    if (action === 'get') {
      return res.status(200).json({ is_pro: isPro, usage: usageObj() });
    }

    if (action === 'use') {
      if (!feature || !COL[feature]) return res.status(400).json({ error: 'Unknown feature' });
      if (isPro) return res.status(200).json({ ok: true, unlimited: true, is_pro: true });
      const col = COL[feature];
      const used = profile[col] || 0;
      const limit = FREE_LIMITS[feature];
      if (used >= limit) {
        return res.status(200).json({ ok: false, blocked: true, feature, used, limit, is_pro: false });
      }
      const patch = { updated_at: new Date().toISOString() };
      patch[col] = used + 1;
      await supabaseRequest('PATCH', `/rest/v1/user_profiles?id=eq.${userId}`, patch, SERVICE_KEY, null, 'return=minimal');
      return res.status(200).json({ ok: true, feature, used: used + 1, limit, remaining: limit - (used + 1), is_pro: false });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
