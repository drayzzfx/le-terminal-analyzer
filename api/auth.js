const https = require('https');

function supabaseRequest(method, path, body, anonKey, authToken) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const url = new URL(SUPABASE_URL);
  
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': anonKey || process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${authToken || anonKey || process.env.SUPABASE_ANON_KEY}`,
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const options = {
      hostname: url.hostname,
      path: path,
      method: method,
      headers
    };

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  if (!ANON_KEY || !SUPABASE_URL) return res.status(500).json({ error: 'Supabase not configured' });

  const { action, email, password, token } = req.body;

  try {
    let result;

    if (action === 'signup') {
      result = await supabaseRequest('POST', '/auth/v1/signup', { email, password }, ANON_KEY);
    } else if (action === 'login') {
      result = await supabaseRequest('POST', '/auth/v1/token?grant_type=password', { email, password }, ANON_KEY);
    } else if (action === 'refresh') {
      const { refresh_token } = req.body;
      if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });
      result = await supabaseRequest('POST', '/auth/v1/token?grant_type=refresh_token', { refresh_token }, ANON_KEY);
    } else if (action === 'logout') {
      result = await supabaseRequest('POST', '/auth/v1/logout', {}, ANON_KEY, token);
    } else if (action === 'user') {
      result = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
