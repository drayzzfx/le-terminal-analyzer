const https = require('https');

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch(e) { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function supabaseRequest(method, path, body, key, authKey) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${authKey || key}`,
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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

    // GET — récupère la connexion broker existante
    if (req.method === 'GET') {
      const r = await supabaseRequest(
        'GET',
        `/rest/v1/broker_connections?user_id=eq.${userId}&limit=1`,
        null, SERVICE_KEY, SERVICE_KEY
      );
      const conn = Array.isArray(r.body) && r.body[0] ? r.body[0] : null;
      if (!conn) return res.status(200).json({ connected: false });
      return res.status(200).json({
        connected: true,
        platform: conn.platform || 'mt5',
        accountId: conn.meta_api_account_id,
        accountName: conn.account_name,
        lastSyncAt: conn.last_sync_at
      });
    }

    // POST — connecte/met à jour un compte broker
    if (req.method === 'POST') {
      const body = req.body || {};
      const platform = body.platform || 'mt5';

      let record = { user_id: userId, user_email: userEmail, platform };
      let accountName = platform.toUpperCase();

      // ── MetaApi (MT4 / MT5) ──
      if (platform === 'mt4' || platform === 'mt5') {
        const { metaApiToken, metaApiAccountId } = body;
        if (!metaApiToken || !metaApiAccountId)
          return res.status(400).json({ error: 'metaApiToken et metaApiAccountId requis' });
        try {
          const provRes = await httpsGet(
            `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${metaApiAccountId}`,
            { 'auth-token': metaApiToken, 'Content-Type': 'application/json' }
          );
          if (provRes.status === 401 || provRes.status === 403)
            return res.status(400).json({ error: 'Token MetaApi invalide' });
          if (provRes.status === 404)
            return res.status(400).json({ error: 'Account ID introuvable' });
          if (provRes.status === 200 && provRes.body?.name) accountName = provRes.body.name;
        } catch(e) {
          return res.status(400).json({ error: 'Impossible de vérifier le compte MetaApi' });
        }
        record = { ...record, meta_api_token: metaApiToken, meta_api_account_id: metaApiAccountId, account_name: accountName };
      }

      // ── TradeLocker ──
      else if (platform === 'tradelocker') {
        const { tlEmail, tlPassword, tlServer } = body;
        if (!tlEmail || !tlPassword || !tlServer)
          return res.status(400).json({ error: 'Email, mot de passe et serveur requis' });
        // Validate credentials
        try {
          const authRes = await new Promise((resolve, reject) => {
            const payload = JSON.stringify({ email: tlEmail, password: tlPassword, server: tlServer });
            const opts = {
              hostname: 'ttlivewebapi.tradelocker.com', path: '/api/auth/jwt/token',
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            };
            const req2 = require('https').request(opts, r => {
              let d = ''; r.on('data', c => d += c);
              r.on('end', () => { try { resolve({ status: r.statusCode, body: JSON.parse(d) }); } catch(e) { resolve({ status: r.statusCode, body: d }); } });
            });
            req2.on('error', reject); req2.write(payload); req2.end();
          });
          if (authRes.status !== 200 || !authRes.body.accessToken)
            return res.status(400).json({ error: 'Identifiants TradeLocker invalides — vérifie email/mot de passe/serveur' });
        } catch(e) {
          return res.status(400).json({ error: 'Impossible de joindre TradeLocker' });
        }
        accountName = `TradeLocker · ${tlServer}`;
        record = { ...record, tl_email: tlEmail, tl_password: tlPassword, tl_server: tlServer, account_name: accountName };
      }

      // ── DXtrade ──
      else if (platform === 'dxtrade') {
        const { dxDomain, dxLogin, dxPassword } = body;
        if (!dxDomain || !dxLogin || !dxPassword)
          return res.status(400).json({ error: 'Domaine, login et mot de passe requis' });
        const domain = dxDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        // Quick validation ping
        try {
          const authRes = await new Promise((resolve, reject) => {
            const payload = JSON.stringify({ login: dxLogin, password: dxPassword, domain });
            const opts = {
              hostname: domain, path: '/dxsca-web/accounts',
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            };
            const req2 = require('https').request(opts, r => {
              let d = ''; r.on('data', c => d += c);
              r.on('end', () => { try { resolve({ status: r.statusCode, body: JSON.parse(d) }); } catch(e) { resolve({ status: r.statusCode }); } });
            });
            req2.on('error', reject); req2.write(payload); req2.end();
          });
          if (authRes.status === 401 || authRes.status === 403)
            return res.status(400).json({ error: 'Identifiants DXtrade invalides' });
        } catch(e) {
          // Domain may be unreachable — save anyway and let sync handle errors
        }
        accountName = `DXtrade · ${domain}`;
        record = { ...record, dx_domain: domain, dx_login: dxLogin, dx_password: dxPassword, account_name: accountName };
      }

      else {
        return res.status(400).json({ error: 'Plateforme non supportée' });
      }

      // Upsert
      const existing = await supabaseRequest('GET',
        `/rest/v1/broker_connections?user_id=eq.${userId}&limit=1`, null, SERVICE_KEY, SERVICE_KEY);
      if (Array.isArray(existing.body) && existing.body[0]) {
        await supabaseRequest('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`,
          record, SERVICE_KEY, SERVICE_KEY);
      } else {
        await supabaseRequest('POST', '/rest/v1/broker_connections', record, SERVICE_KEY, SERVICE_KEY);
      }

      return res.status(200).json({ ok: true, accountName });
    }

    // DELETE — supprime la connexion
    if (req.method === 'DELETE') {
      await supabaseRequest(
        'DELETE',
        `/rest/v1/broker_connections?user_id=eq.${userId}`,
        null, SERVICE_KEY, SERVICE_KEY
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};
