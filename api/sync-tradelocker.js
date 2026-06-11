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

const TL_HOST = 'ttlivewebapi.tradelocker.com';

async function tlAuth(email, password, server) {
  const r = await httpsReq('POST', TL_HOST, '/api/auth/jwt/token', {}, { email, password, server });
  if (r.status !== 200 || !r.body.accessToken) throw new Error('Auth TradeLocker échouée — vérifie email/mot de passe/serveur');
  return r.body.accessToken;
}

async function tlGetAccounts(token) {
  const r = await httpsReq('GET', TL_HOST, '/api/auth/jwt/all-accounts', { 'Authorization': `Bearer ${token}` });
  if (!Array.isArray(r.body)) throw new Error('Impossible de récupérer les comptes TradeLocker');
  return r.body; // [{id, accNum, currency, ...}]
}

async function tlGetFills(token, accountId, accNum, since) {
  const startTime = since ? new Date(since).getTime() : Date.now() - 90 * 24 * 3600 * 1000;
  const endTime = Date.now();
  const path = `/api/trade/accounts/${accountId}/fills?startTime=${startTime}&endTime=${endTime}`;
  const r = await httpsReq('GET', TL_HOST, path, {
    'Authorization': `Bearer ${token}`,
    'accNum': String(accNum)
  });
  const fills = r.body?.d?.fills || r.body?.fills || (Array.isArray(r.body) ? r.body : []);
  return fills;
}

function mapFillToTrade(fill, userId) {
  const side = (fill.side || fill.type || '').toUpperCase();
  const direction = side.includes('BUY') || side === 'LONG' ? 'long' : 'short';
  const pnl = parseFloat(fill.pnl ?? fill.profit ?? 0)
    + parseFloat(fill.commission ?? 0)
    + parseFloat(fill.swap ?? 0);
  const result = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
  const pair = (fill.symbol || fill.instrument || '').replace(/[._-]?(raw|ecn|pro|std|mini|sml|a|b|c)$/i, '').toUpperCase();
  const tradeDate = fill.time ? new Date(fill.time).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    user_id: userId,
    pair,
    direction,
    result,
    pnl: parseFloat(pnl.toFixed(2)),
    trade_date: tradeDate,
    external_id: `tl_${fill.id || fill.orderId || fill.positionId || Math.random()}`
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
    // Identify user
    const userRes = await supabaseReq('GET', '/auth/v1/user', null, ANON_KEY);
    // Use auth token for user identification
    const uRes = await httpsReq('GET', new URL(process.env.SUPABASE_URL).hostname, '/auth/v1/user',
      { 'apikey': ANON_KEY, 'Authorization': `Bearer ${token}` });
    const userId = uRes.body?.id;
    if (!userId) return res.status(401).json({ error: 'Token invalide' });

    // Load broker connection
    const connRes = await supabaseReq('GET',
      `/rest/v1/broker_connections?user_id=eq.${userId}&limit=1`, null, SERVICE_KEY);
    const conn = Array.isArray(connRes.body) && connRes.body[0];
    if (!conn || conn.platform !== 'tradelocker') return res.status(400).json({ error: 'Pas de connexion TradeLocker' });

    const { tl_email, tl_password, tl_server, tl_account_id, tl_acc_num, last_sync_at } = conn;

    // Auth to TradeLocker
    const tlToken = await tlAuth(tl_email, tl_password, tl_server);

    // If no account stored yet, discover and save
    let accountId = tl_account_id;
    let accNum = tl_acc_num;
    if (!accountId || !accNum) {
      const accounts = await tlGetAccounts(tlToken);
      if (!accounts.length) return res.status(400).json({ error: 'Aucun compte trouvé sur TradeLocker' });
      accountId = accounts[0].id;
      accNum = accounts[0].accNum;
      await supabaseReq('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`,
        { tl_account_id: accountId, tl_acc_num: accNum, account_name: accounts[0].currency || 'TradeLocker' },
        SERVICE_KEY);
    }

    const since = last_sync_at ? new Date(new Date(last_sync_at).getTime() - 3600000).toISOString() : null;
    const fills = await tlGetFills(tlToken, accountId, accNum, since);

    if (!fills.length) {
      await supabaseReq('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`,
        { last_sync_at: new Date().toISOString() }, SERVICE_KEY);
      return res.status(200).json({ ok: true, synced: 0 });
    }

    const trades = fills.map(f => mapFillToTrade(f, userId));
    const batchRes = await supabaseReq('POST', '/rest/v1/journal_trades', trades, SERVICE_KEY);
    const synced = Array.isArray(batchRes.body) ? batchRes.body.length : trades.length;

    await supabaseReq('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`,
      { last_sync_at: new Date().toISOString() }, SERVICE_KEY);

    return res.status(200).json({ ok: true, synced });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};
