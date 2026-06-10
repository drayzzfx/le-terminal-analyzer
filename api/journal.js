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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
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
      const r = await supabaseRequest(
        'GET',
        `/rest/v1/journal_trades?or=(user_id.eq.${userId},user_email.eq.${encodeURIComponent(userEmail)})&order=trade_date.desc,created_at.desc&limit=500`,
        null, SERVICE_KEY, SERVICE_KEY
      );
      return res.status(200).json(Array.isArray(r.body) ? r.body : []);
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      const tradeId = b.id && /^[0-9a-f-]{36}$/.test(b.id) ? b.id : undefined;
      const record = {
        user_id: userId,
        user_email: userEmail,
        pair: b.pair || null,
        direction: b.direction || null,
        trade_date: b.date || null,
        session: b.session || null,
        setup: b.setup || null,
        result: b.result || null,
        pnl: b.pnl != null ? parseFloat(b.pnl) : null,
        rr: b.rr != null ? parseFloat(b.rr) : null,
        fees: b.fees != null ? parseFloat(b.fees) : null,
        notes: b.notes || null,
        img: b.img || null
      };
      if (tradeId) record.id = tradeId;
      const r = await supabaseRequest('POST', '/rest/v1/journal_trades', record, ANON_KEY, token);
      return res.status(200).json(Array.isArray(r.body) ? r.body[0] : r.body);
    }

    if (req.method === 'PATCH') {
      const id = req.query && req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const b = req.body || {};
      const updates = {};
      if (b.result !== undefined) updates.result = b.result;
      if (b.pnl !== undefined) updates.pnl = parseFloat(b.pnl);
      if (b.rr !== undefined) updates.rr = parseFloat(b.rr);
      if (b.notes !== undefined) updates.notes = b.notes;
      if (b.fees !== undefined) updates.fees = parseFloat(b.fees);
      if (b.setup !== undefined) updates.setup = b.setup;
      const r = await supabaseRequest('PATCH', `/rest/v1/journal_trades?id=eq.${id}`, updates, ANON_KEY, token);
      return res.status(200).json(Array.isArray(r.body) ? r.body[0] : {});
    }

    if (req.method === 'DELETE') {
      const id = (req.query && req.query.id) || (req.url && new URL('http://x' + req.url).searchParams.get('id'));
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await supabaseRequest('DELETE', `/rest/v1/journal_trades?id=eq.${id}`, null, ANON_KEY, token);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
