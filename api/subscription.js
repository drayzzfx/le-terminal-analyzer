// api/subscription.js — Infos d'abonnement Whop de l'utilisateur connecté +
// résiliation (à la fin de la période). Identifie l'utilisateur via son JWT Supabase,
// retrouve sa souscription Whop par e-mail sur le produit.
const https = require('https');

const PRODUCT = 'prod_aWllhBRr5c5yz';

function req(hostname, path, method, headers, body) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const h = Object.assign({}, headers);
    if (payload) h['Content-Length'] = Buffer.byteLength(payload);
    const r = https.request({ hostname, path, method, headers: h }, (rs) => {
      let d = ''; rs.on('data', c => d += c);
      rs.on('end', () => { try { resolve({ status: rs.statusCode, body: d ? JSON.parse(d) : null }); } catch (e) { resolve({ status: rs.statusCode, body: d }); } });
    });
    r.on('error', () => resolve({ status: 0, body: null }));
    if (payload) r.write(payload);
    r.end();
  });
}

async function getUserEmail(token, anonKey, supaUrl) {
  const u = new URL(supaUrl);
  const out = await req(u.hostname, '/auth/v1/user', 'GET', { 'apikey': anonKey, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' });
  return out.body && out.body.email ? out.body.email : null;
}

async function findMembership(email, key) {
  // Liste les memberships du produit et matche par e-mail
  const out = await req('api.whop.com', '/v5/memberships?product_id=' + PRODUCT + '&per=100', 'GET',
    { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' });
  const arr = (out.body && out.body.data) || [];
  const el = email.toLowerCase();
  return arr.find(m => (m.user && m.user.email && m.user.email.toLowerCase() === el)) || null;
}

module.exports = async function handler(req2, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req2.method === 'OPTIONS') return res.status(200).end();

  const KEY = process.env.WHOP_API_KEY;
  const ANON = process.env.SUPABASE_ANON_KEY;
  const SUPA = process.env.SUPABASE_URL;
  const token = (req2.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  if (!KEY) return res.status(500).json({ error: 'WHOP_API_KEY missing' });

  const email = await getUserEmail(token, ANON, SUPA);
  if (!email) return res.status(401).json({ error: 'Invalid session' });

  const m = await findMembership(email, KEY);

  if (req2.method === 'POST' && (req2.body && req2.body.action) === 'cancel') {
    if (!m) return res.status(404).json({ ok: false, error: 'no_membership' });
    // Tente la résiliation à la fin de la période (plusieurs routes possibles selon version API)
    let done = null;
    const tries = [
      ['POST', '/v5/memberships/' + m.id + '/cancel'],
      ['POST', '/v2/memberships/' + m.id + '/cancel']
    ];
    for (const [meth, path] of tries) {
      const out = await req('api.whop.com', path, meth, { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' }, {});
      if (out.status >= 200 && out.status < 300) { done = out.body; break; }
    }
    if (!done) return res.status(502).json({ ok: false, error: 'cancel_failed' });
    return res.status(200).json({ ok: true, canceled: true });
  }

  // GET : statut courant
  if (!m) return res.status(200).json({ ok: true, active: false });
  const end = m.renewal_period_end || m.expires_at || null; // unix seconds
  return res.status(200).json({
    ok: true,
    active: m.status === 'active' || m.valid === true,
    status: m.status || null,
    valid: m.valid === true,
    cancel_at_period_end: !!(m.cancel_at_period_end),
    renews_at: end,                          // timestamp unix (s)
    plan_id: m.plan || m.plan_id || null,
    membership_id: m.id || null
  });
};
