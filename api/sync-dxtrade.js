const https = require('https');

function httpsReq(method, hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const h = { 'Content-Type': 'application/json', ...headers };
    if (payload) h['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request({ hostname, path, method, headers: h }, (res) => {
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

function supabaseReq(method, path, body, key) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'resolution=ignore-duplicates'
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

async function dxLogin(domain, login, password) {
  // DXtrade uses domain-specific auth endpoint
  const r = await httpsReq('POST', domain, '/dxsca-web/accounts', {},
    { login, password, domain });
  if (r.status === 200 && r.body.sessionToken) return r.body.sessionToken;
  // Fallback: try /api/auth
  const r2 = await httpsReq('POST', domain, '/api/auth/login', {},
    { username: login, password });
  if (r2.status === 200 && (r2.body.token || r2.body.accessToken || r2.body.sessionToken)) {
    return r2.body.token || r2.body.accessToken || r2.body.sessionToken;
  }
  throw new Error('Auth DXtrade échouée — vérifie le domaine, login et mot de passe');
}

async function dxGetPositions(domain, sessionToken, since) {
  const sinceParam = since ? `&from=${new Date(since).toISOString()}` : '';
  const r = await httpsReq('GET', domain,
    `/dxsca-web/positions?status=CLOSED${sinceParam}`,
    { 'Authorization': `Bearer ${sessionToken}`, 'DXAPI-SESSION': sessionToken });
  if (Array.isArray(r.body)) return r.body;
  if (r.body?.positions) return r.body.positions;
  // try alternate endpoint
  const r2 = await httpsReq('GET', domain, '/dxsca-web/accounts/0/positions/history',
    { 'Authorization': `Bearer ${sessionToken}` });
  if (Array.isArray(r2.body)) return r2.body;
  return [];
}

function mapPositionToTrade(pos, userId) {
  const side = (pos.side || pos.type || pos.direction || '').toUpperCase();
  const direction = side.includes('BUY') || side === 'LONG' ? 'long' : 'short';
  const pnl = parseFloat(pos.pnl ?? pos.profit ?? pos.realizedPnl ?? 0)
    + parseFloat(pos.commission ?? 0)
    + parseFloat(pos.swap ?? 0);
  const result = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
  const pair = (pos.symbol || pos.instrument || '').replace(/[._-]?(raw|ecn|pro|std|mini|sml|a|b|c)$/i, '').toUpperCase();
  const closeTime = pos.closeTime || pos.closedAt || pos.time || pos.timestamp;
  const tradeDate = closeTime ? new Date(closeTime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const extId = pos.id || pos.positionId || pos.orderId || `${pair}_${tradeDate}_${Math.random()}`;
  return {
    user_id: userId,
    pair,
    direction,
    result,
    pnl: parseFloat(pnl.toFixed(2)),
    trade_date: tradeDate,
    external_id: `dx_${extId}`
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  try {
    const uRes = await httpsReq('GET', new URL(process.env.SUPABASE_URL).hostname, '/auth/v1/user',
      { 'apikey': ANON_KEY, 'Authorization': `Bearer ${token}` });
    const userId = uRes.body?.id;
    if (!userId) return res.status(401).json({ error: 'Token invalide' });

    const connRes = await supabaseReq('GET',
      `/rest/v1/broker_connections?user_id=eq.${userId}&limit=1`, null, SERVICE_KEY);
    const conn = Array.isArray(connRes.body) && connRes.body[0];
    if (!conn || conn.platform !== 'dxtrade') return res.status(400).json({ error: 'Pas de connexion DXtrade' });

    const { dx_domain, dx_login, dx_password, last_sync_at } = conn;

    const sessionToken = await dxLogin(dx_domain, dx_login, dx_password);
    const since = last_sync_at ? new Date(new Date(last_sync_at).getTime() - 3600000).toISOString() : null;
    const positions = await dxGetPositions(dx_domain, sessionToken, since);

    if (!positions.length) {
      await supabaseReq('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`,
        { last_sync_at: new Date().toISOString() }, SERVICE_KEY);
      return res.status(200).json({ ok: true, synced: 0 });
    }

    const trades = positions.map(p => mapPositionToTrade(p, userId));
    await supabaseReq('POST', '/rest/v1/journal_trades', trades, SERVICE_KEY);

    await supabaseReq('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`,
      { last_sync_at: new Date().toISOString() }, SERVICE_KEY);

    return res.status(200).json({ ok: true, synced: trades.length });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};
