const https = require('https');

function supabaseRequest(method, path, body, apiKey, authToken) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': apiKey,
      'Authorization': `Bearer ${authToken || apiKey}`,
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
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

async function checkWhopDirect(email, apiKey) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.whop.com',
      path: `/v5/memberships?product_id=prod_aWllhBRr5c5yz&status=active&per=50`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const members = parsed.data || [];
          const match = members.find(m =>
            m.user?.email?.toLowerCase() === email.toLowerCase()
          );
          resolve(!!match);
        } catch(e) { resolve(false); }
      });
    });
    req.on('error', () => resolve(false));
    req.end();
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
  const WHOP_API_KEY = process.env.WHOP_API_KEY;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) return res.status(401).json({ is_pro: false });

  try {
    // Get user from Supabase using the user's JWT
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    const userId = userRes.body?.id;
    const userEmail = userRes.body?.email;

    if (!userId || !userEmail) return res.status(401).json({ is_pro: false, token_invalid: true });

    // Check user_profiles table using SERVICE_KEY to bypass RLS
    const profileRes = await supabaseRequest(
      'GET',
      `/rest/v1/user_profiles?id=eq.${userId}&select=is_pro,whop_status`,
      null,
      SERVICE_KEY
    );

    if (profileRes.body && profileRes.body.length > 0 && profileRes.body[0].is_pro) {
      return res.status(200).json({ is_pro: true, source: 'supabase' });
    }

    // Also check pending_activations (in case webhook came before registration)
    const pendingRes = await supabaseRequest(
      'GET',
      `/rest/v1/pending_activations?email=eq.${encodeURIComponent(userEmail.toLowerCase())}&is_pro=eq.true`,
      null,
      SERVICE_KEY
    );

    if (pendingRes.body && pendingRes.body.length > 0) {
      await supabaseRequest(
        'POST',
        '/rest/v1/user_profiles',
        { id: userId, email: userEmail, is_pro: true, whop_status: 'active' },
        SERVICE_KEY
      );
      return res.status(200).json({ is_pro: true, source: 'pending_activation' });
    }

    // Last resort: check Whop API directly
    if (WHOP_API_KEY) {
      const whopIsPro = await checkWhopDirect(userEmail, WHOP_API_KEY);
      if (whopIsPro) {
        await supabaseRequest(
          'POST',
          '/rest/v1/user_profiles',
          { id: userId, email: userEmail, is_pro: true, whop_status: 'active' },
          SERVICE_KEY
        );
        return res.status(200).json({ is_pro: true, source: 'whop_api' });
      }
    }

    return res.status(200).json({ is_pro: false });

  } catch(err) {
    return res.status(500).json({ is_pro: false, token_invalid: true });
  }
};
