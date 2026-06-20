const https = require('https');

function supabaseRequest(method, path, body) {
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
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=representation'
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — liste des partages
  if (req.method === 'GET') {
    const sort = req.query && req.query.sort;
    let order = 'created_at.desc';
    if (sort === 'likes') order = 'likes.desc,created_at.desc';
    if (sort === 'gain')  order = 'gain.desc,created_at.desc';
    const r = await supabaseRequest('GET', `trade_shares?order=${order}&limit=50`);
    return res.status(200).json(Array.isArray(r.body) ? r.body : []);
  }

  // POST — nouveau partage
  if (req.method === 'POST') {
    const b = req.body;
    if (!b || !b.pseudo || !b.pair || !b.side || b.entry == null || b.exit == null) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    // Sanitize pseudo: max 30 chars, alphanumeric + @ _ .
    const pseudo = String(b.pseudo).replace(/[^@\w.\- ]/g, '').slice(0, 30);
    const pair   = String(b.pair).replace(/[^A-Za-z0-9\/]/g,'').slice(0, 20);
    const side   = b.side === 'short' ? 'short' : 'long';
    const entry  = parseFloat(b.entry) || 0;
    const exit_v = parseFloat(b.exit)  || 0;
    const cap    = Math.min(parseFloat(b.cap) || 0, 1e8);
    const lev    = Math.min(parseInt(b.lev)   || 1, 1000);
    const move   = entry ? (exit_v - entry) / entry : 0;
    const adjMove= side === 'short' ? -move : move;
    const pct    = adjMove * lev * 100;
    const gain   = cap * adjMove * lev;
    const bg_id  = String(b.bg_id || '').slice(0, 50);

    const r = await supabaseRequest('POST', 'trade_shares', { pseudo, pair, side, entry, exit: exit_v, cap, lev, pct, gain, bg_id });
    if (r.status >= 300) return res.status(r.status).json({ error: 'Erreur Supabase' });
    const row = Array.isArray(r.body) ? r.body[0] : r.body;
    return res.status(201).json(row);
  }

  // PATCH — like
  if (req.method === 'PATCH') {
    const id = parseInt(req.query && req.query.id);
    if (!id) return res.status(400).json({ error: 'id manquant' });
    const r = await supabaseRequest('POST', `rpc/increment_trade_like`, { share_id: id });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
