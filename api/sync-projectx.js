// api/sync-projectx.js — Sync des trades depuis l'API ProjectX Gateway
// (Topstep / TopstepX, Tradeify, Lucid, et autres prop firms futures sur ProjectX).
// Auth par clé API (userName + apiKey). REST, donc compatible serverless.
const https = require('https');

function httpsReq(method, hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const h = { 'Content-Type': 'application/json', 'Accept': 'application/json', ...headers };
    if (payload) h['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request({ hostname, path, method, headers: h }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, body: d }); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function supabaseReq(method, path, body, key, prefer) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` };
    if (prefer) headers['Prefer'] = prefer;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request({ hostname: url.hostname, path, method, headers }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, body: d }); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function pxSymbol(contractId) {
  // "CON.F.US.MNQ.Z24" → "MNQ"
  if (!contractId) return '?';
  var parts = String(contractId).split('.');
  return (parts.length >= 4 ? parts[3] : contractId).toUpperCase();
}

function mapTrade(t, userId) {
  var pnl = parseFloat(t.profitAndLoss != null ? t.profitAndLoss : 0) - parseFloat(t.fees || 0);
  var result = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
  var direction = (t.side === 0 || t.side === 'Buy' || t.side === 'BUY') ? 'long' : 'short';
  var ts = t.creationTimestamp || t.createdAt || t.timestamp;
  var tradeDate = ts ? new Date(ts).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    user_id: userId,
    pair: pxSymbol(t.contractId || t.symbol),
    direction: direction,
    result: result,
    pnl: parseFloat(pnl.toFixed(2)),
    trade_date: tradeDate,
    external_id: 'px_' + (t.id || t.orderId || Math.random())
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
    const userId = uRes.body && uRes.body.id;
    if (!userId) return res.status(401).json({ error: 'Token invalide' });

    const connRes = await supabaseReq('GET', `/rest/v1/broker_connections?user_id=eq.${userId}&limit=1`, null, SERVICE_KEY);
    const conn = Array.isArray(connRes.body) && connRes.body[0];
    if (!conn || conn.platform !== 'projectx') return res.status(400).json({ error: 'Pas de connexion ProjectX' });

    const host = conn.px_base;            // ex. api.topstepx.com
    const userName = conn.px_username;
    const apiKey = conn.px_apikey;
    if (!host || !userName || !apiKey) return res.status(400).json({ error: 'Connexion ProjectX incomplète' });

    // 1) Auth
    const auth = await httpsReq('POST', host, '/api/Auth/loginKey', {}, { userName, apiKey });
    const jwt = auth.body && (auth.body.token || auth.body.accessToken);
    if (!jwt) return res.status(400).json({ error: 'Clé API ProjectX invalide' });
    const authH = { 'Authorization': 'Bearer ' + jwt };

    // 2) Compte (réutilise celui stocké, sinon le premier actif)
    let accountId = conn.px_account_id;
    if (!accountId) {
      const acc = await httpsReq('POST', host, '/api/Account/search', authH, { onlyActiveAccounts: true });
      const list = (acc.body && acc.body.accounts) || [];
      if (!list.length) return res.status(400).json({ error: 'Aucun compte ProjectX trouvé' });
      accountId = list[0].id;
      await supabaseReq('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`,
        { px_account_id: accountId, account_name: list[0].name || 'ProjectX' }, SERVICE_KEY);
    }

    // 3) Trades sur la période (depuis le dernier sync, sinon 90 jours)
    const startMs = conn.last_sync_at ? (new Date(conn.last_sync_at).getTime() - 3600000) : (Date.now() - 90 * 24 * 3600 * 1000);
    const body = {
      accountId: accountId,
      startTimestamp: new Date(startMs).toISOString(),
      endTimestamp: new Date().toISOString()
    };
    const tr = await httpsReq('POST', host, '/api/Trade/search', authH, body);
    const trades = (tr.body && tr.body.trades) || (Array.isArray(tr.body) ? tr.body : []);
    // Ne garde que les trades clôturés (profitAndLoss renseigné)
    const closed = trades.filter(t => t && t.profitAndLoss != null && !t.voided);

    if (!closed.length) {
      await supabaseReq('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`, { last_sync_at: new Date().toISOString() }, SERVICE_KEY);
      return res.status(200).json({ ok: true, synced: 0 });
    }

    const rows = closed.map(t => mapTrade(t, userId));
    const ins = await supabaseReq('POST', '/rest/v1/journal_trades', rows, SERVICE_KEY, 'resolution=ignore-duplicates,return=representation');
    const synced = Array.isArray(ins.body) ? ins.body.length : rows.length;

    await supabaseReq('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`, { last_sync_at: new Date().toISOString() }, SERVICE_KEY);
    return res.status(200).json({ ok: true, synced });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
