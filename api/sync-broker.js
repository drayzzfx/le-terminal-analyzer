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
      'Prefer': method === 'POST' ? 'resolution=ignore-duplicates,return=representation' : undefined
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

// Nettoie le symbole MT5 (EURUSD.a → EURUSD, XAUUSD.sml → XAUUSD)
function cleanSymbol(sym) {
  return (sym || '').replace(/\.[a-z]+$/i, '').toUpperCase();
}

// Convertit un deal MT5 en trade journal
function dealsToTrades(deals, userId, userEmail) {
  // Groupe les deals par positionId
  const byPos = {};
  for (const d of deals) {
    const pid = d.positionId || d.id;
    if (!byPos[pid]) byPos[pid] = [];
    byPos[pid].push(d);
  }

  const trades = [];
  for (const [positionId, posDeals] of Object.entries(byPos)) {
    // Entry = DEAL_ENTRY_IN, Exit = DEAL_ENTRY_OUT
    const entryDeal = posDeals.find(d => d.entryType === 'DEAL_ENTRY_IN');
    const exitDeal = posDeals.find(d => d.entryType === 'DEAL_ENTRY_OUT');

    // On garde seulement les trades fermés (ont un exit)
    if (!exitDeal) continue;

    const refDeal = entryDeal || exitDeal;
    const symbol = cleanSymbol(refDeal.symbol);
    if (!symbol) continue;

    // Direction : DEAL_TYPE_BUY sur l'entrée = long, DEAL_TYPE_SELL = short
    const entryType = entryDeal ? entryDeal.type : null;
    let direction = 'long';
    if (entryType === 'DEAL_TYPE_SELL') direction = 'short';

    // P&L total : profit + commission + swap de tous les deals de ce trade
    const pnl = posDeals.reduce((sum, d) => sum + (d.profit || 0) + (d.commission || 0) + (d.swap || 0), 0);
    const fees = posDeals.reduce((sum, d) => sum + Math.abs(d.commission || 0) + Math.abs(d.swap || 0), 0);

    // Date du trade = date d'entrée (ou de sortie si pas d'entrée)
    const tradeTime = new Date((entryDeal || exitDeal).time);
    const tradeDate = tradeTime.toISOString().slice(0, 10);

    // Résultat
    let result = 'be';
    if (pnl > 0.01) result = 'win';
    else if (pnl < -0.01) result = 'loss';

    trades.push({
      user_id: userId,
      user_email: userEmail,
      external_id: positionId,
      pair: symbol,
      direction,
      trade_date: tradeDate,
      session: null,
      setup: null,
      result,
      pnl: Math.round(pnl * 100) / 100,
      rr: null,
      fees: Math.round(fees * 100) / 100,
      notes: null,
      img: null
    });
  }

  return trades;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ANON_KEY;
  if (!ANON_KEY) return res.status(500).json({ error: 'Not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // Vérifie l'utilisateur
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    if (!userRes.body.id) return res.status(401).json({ error: 'Invalid token' });
    const userId = userRes.body.id;
    const userEmail = userRes.body.email || '';

    // Récupère la connexion broker
    const connRes = await supabaseRequest(
      'GET',
      `/rest/v1/broker_connections?user_id=eq.${userId}&limit=1`,
      null, SERVICE_KEY, SERVICE_KEY
    );
    const conn = Array.isArray(connRes.body) && connRes.body[0] ? connRes.body[0] : null;
    if (!conn) return res.status(400).json({ error: 'Aucun compte broker connecté' });

    const { meta_api_token: apiToken, meta_api_account_id: accountId, last_sync_at } = conn;

    // Détermine la plage de dates (depuis last_sync - 1h pour éviter les manques, max 90j)
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
    let startTime = ninetyDaysAgo;
    if (last_sync_at) {
      const lastSync = new Date(last_sync_at);
      // Recule d'1h pour couvrir les trades qui auraient pu se fermer juste avant le dernier sync
      const withBuffer = new Date(lastSync.getTime() - 3600 * 1000);
      startTime = withBuffer > ninetyDaysAgo ? withBuffer : ninetyDaysAgo;
    }

    const startIso = startTime.toISOString();
    const endIso = now.toISOString();

    // Récupère la région du compte via provisioning API
    let region = 'new-york';
    try {
      const provRes = await httpsGet(
        `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${accountId}`,
        { 'auth-token': apiToken, 'Content-Type': 'application/json' }
      );
      if (provRes.status === 200 && provRes.body && provRes.body.region) {
        region = provRes.body.region;
      }
    } catch(e) { /* utilise la région par défaut */ }

    // Récupère les deals depuis MetaApi
    const dealsUrl = `https://mt-client-api-v1.${region}.agiliumtrade.ai/users/current/accounts/${accountId}/history-deals/time/${encodeURIComponent(startIso)}/${encodeURIComponent(endIso)}`;
    const dealsRes = await httpsGet(dealsUrl, {
      'auth-token': apiToken,
      'Content-Type': 'application/json'
    });

    if (dealsRes.status !== 200) {
      return res.status(400).json({
        error: `MetaApi erreur ${dealsRes.status}`,
        detail: typeof dealsRes.body === 'string' ? dealsRes.body : JSON.stringify(dealsRes.body)
      });
    }

    const deals = Array.isArray(dealsRes.body) ? dealsRes.body : [];

    // Convertit les deals en trades
    const tradesToInsert = dealsToTrades(deals, userId, userEmail);

    // Upsert en batch dans journal_trades (ignore les doublons via external_id unique index)
    let synced = 0;
    const BATCH = 50;
    for (let i = 0; i < tradesToInsert.length; i += BATCH) {
      const batch = tradesToInsert.slice(i, i + BATCH);
      const r = await supabaseRequest(
        'POST',
        '/rest/v1/journal_trades',
        batch,
        SERVICE_KEY, SERVICE_KEY
      );
      if (Array.isArray(r.body)) synced += r.body.length;
    }

    // Met à jour last_sync_at
    await supabaseRequest(
      'PATCH',
      `/rest/v1/broker_connections?user_id=eq.${userId}`,
      { last_sync_at: now.toISOString() },
      SERVICE_KEY, SERVICE_KEY
    );

    return res.status(200).json({
      ok: true,
      synced,
      total: tradesToInsert.length,
      dealsProcessed: deals.length,
      from: startIso,
      to: endIso
    });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};
