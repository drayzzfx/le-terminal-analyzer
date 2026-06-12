// api/bubbles.js — Top cryptos en direct (façon CryptoBubbles) via l'API publique
// CoinGecko (gratuite, sans clé). Renvoie { assets: [{name, change, cap}] }.
// Cache CDN 60 s → un seul appel amont par minute pour tous les visiteurs.
const https = require('https');

function fetchJson(hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname,
      path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeTerminal/1.0)', 'Accept': 'application/json' },
      timeout: 8000,
    }, (r) => {
      let data = '';
      r.on('data', (c) => (data += c));
      r.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('bad_json')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// Stablecoins exclus (variation ~0, sans intérêt en bulle — comme CryptoBubbles)
const STABLES = new Set(['usdt','usdc','dai','usds','fdusd','tusd','usde','busd','pyusd','usdp','usdd','gusd','frax','wsteth','steth','weth','wbtc','weeth','cbbtc']);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  try {
    const data = await fetchJson('api.coingecko.com',
      '/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=70&page=1&price_change_percentage=24h');
    const assets = (Array.isArray(data) ? data : [])
      .filter((c) => c && c.symbol && !STABLES.has(String(c.symbol).toLowerCase()))
      .slice(0, 48)
      .map((c) => ({
        name: String(c.symbol).toUpperCase(),
        change: (typeof c.price_change_percentage_24h === 'number') ? +c.price_change_percentage_24h.toFixed(2) : 0,
        cap: c.market_cap || 0,
      }));
    if (!assets.length) throw new Error('empty');
    res.status(200).json({ ok: true, count: assets.length, assets });
  } catch (e) {
    res.status(502).json({ ok: false, error: String((e && e.message) || e), assets: [] });
  }
};
