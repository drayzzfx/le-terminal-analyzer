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

      // ── MetaApi (MT4 / MT5) — mode SIMPLE : login/mdp/serveur, provisionné côté serveur ──
      if ((platform === 'mt4' || platform === 'mt5') && body.login && body.password && body.server) {
        const SERVER_TOKEN = process.env.METAAPI_TOKEN;
        if (!SERVER_TOKEN)
          return res.status(400).json({ error: "La connexion simple n'est pas encore activée (token MetaApi serveur manquant). Utilise le mode avancé." });
        const provHost = 'mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';
        // Crée (provisionne) le compte chez MetaApi à partir des identifiants
        const createBody = JSON.stringify({
          login: String(body.login), password: String(body.password), server: String(body.server),
          platform: platform, name: (userEmail || 'LT') + ' · ' + body.server,
          magic: 0, application: 'MetaApi', type: 'cloud-g2', region: 'new-york',
          keywords: ['le-terminal']
        });
        const created = await new Promise((resolve) => {
          const r2 = https.request({ hostname: provHost, path: '/users/current/accounts', method: 'POST',
            headers: { 'auth-token': SERVER_TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(createBody) } },
            (rs) => { let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>{ try{ resolve({status:rs.statusCode, body:JSON.parse(d)});}catch(e){ resolve({status:rs.statusCode, body:d}); } }); });
          r2.on('error', () => resolve({ status: 0 }));
          r2.write(createBody); r2.end();
        });
        if (created.status === 401 || created.status === 403)
          return res.status(400).json({ error: 'Token MetaApi serveur invalide' });
        var newId = created.body && (created.body.id || created.body._id);
        if (!newId)
          return res.status(400).json({ error: "Connexion impossible — vérifie login, mot de passe et serveur." });
        record = { ...record, meta_api_token: SERVER_TOKEN, meta_api_account_id: newId, account_name: platform.toUpperCase() + ' · ' + body.server };
        const existingS = await supabaseRequest('GET', `/rest/v1/broker_connections?user_id=eq.${userId}&limit=1`, null, SERVICE_KEY, SERVICE_KEY);
        if (Array.isArray(existingS.body) && existingS.body[0]) await supabaseRequest('PATCH', `/rest/v1/broker_connections?user_id=eq.${userId}`, record, SERVICE_KEY, SERVICE_KEY);
        else await supabaseRequest('POST', '/rest/v1/broker_connections', record, SERVICE_KEY, SERVICE_KEY);
        return res.status(200).json({ ok: true, accountName: record.account_name });
      }

      // ── MetaApi (MT4 / MT5) — mode AVANCÉ : token + account id ──
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
        const domain = dxDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        // domaine "tenant" DXsca (souvent "default" pour les prop firms) — séparable via login@domain
        const tenant = (body.dxTenant || (dxLogin.indexOf('@') > -1 ? dxLogin.split('@')[1] : 'default'));
        const userOnly = dxLogin.indexOf('@') > -1 ? dxLogin.split('@')[0] : dxLogin;
        // Validation via l'endpoint de login DXsca
        try {
          const authRes = await new Promise((resolve) => {
            const payload = JSON.stringify({ username: userOnly, domain: tenant, password: dxPassword });
            const opts = { hostname: domain, path: '/dxsca-web/login', method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': Buffer.byteLength(payload) } };
            const req2 = require('https').request(opts, r => {
              let d = ''; r.on('data', c => d += c);
              r.on('end', () => { try { resolve({ status: r.statusCode, body: JSON.parse(d) }); } catch(e) { resolve({ status: r.statusCode, body: d }); } });
            });
            req2.on('error', () => resolve({ status: 0 }));
            req2.write(payload); req2.end();
          });
          if (authRes.status === 401 || authRes.status === 403 || (authRes.status === 200 && !authRes.body.sessionToken))
            return res.status(400).json({ error: 'Identifiants DXtrade invalides — vérifie l\'URL (ex. dxtrade.ftmo.com), le login et le mot de passe DXtrade.' });
          if (authRes.status === 404)
            return res.status(400).json({ error: 'URL DXtrade incorrecte — utilise le domaine de connexion (ex. dxtrade.ftmo.com).' });
        } catch(e) {
          // Domaine injoignable — on enregistre quand même, la sync gérera
        }
        accountName = `DXtrade · ${domain}`;
        record = { ...record, dx_domain: domain, dx_login: dxLogin, dx_password: dxPassword, account_name: accountName };
      }

      // ── ProjectX (Topstep / Tradeify / Lucid… — prop firms futures) ──
      else if (platform === 'projectx') {
        const { pxBase, pxUsername, pxApiKey } = body;
        if (!pxBase || !pxUsername || !pxApiKey)
          return res.status(400).json({ error: 'Firm, identifiant et clé API requis' });
        const host = String(pxBase).replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        // Valide la clé via loginKey
        try {
          const authBody = JSON.stringify({ userName: pxUsername, apiKey: pxApiKey });
          const authRes = await new Promise((resolve) => {
            const r2 = https.request({ hostname: host, path: '/api/Auth/loginKey', method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': Buffer.byteLength(authBody) } },
              rs => { let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>{ try{ resolve({status:rs.statusCode, body:JSON.parse(d)});}catch(e){ resolve({status:rs.statusCode, body:d}); } }); });
            r2.on('error', () => resolve({ status: 0 }));
            r2.write(authBody); r2.end();
          });
          const jwt = authRes.body && (authRes.body.token || authRes.body.accessToken);
          if (!jwt) return res.status(400).json({ error: 'Clé API ProjectX invalide — vérifie identifiant + clé + firm' });
        } catch(e) {
          return res.status(400).json({ error: 'Impossible de joindre ProjectX' });
        }
        accountName = 'ProjectX · ' + host.replace('api.', '').replace('.com', '');
        record = { ...record, px_base: host, px_username: pxUsername, px_apikey: pxApiKey, account_name: accountName };
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
