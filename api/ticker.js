// api/ticker.js — Cotations live pour le bandeau marchés de l'accueil.
// Récupère le prix + variation % (vs clôture précédente) via Yahoo v8 pour les
// symboles affichés dans le marquee. Cache CDN court pour un effet "live".
const https = require('https');

const SYMBOLS = [
  { sym: 'BTC/USD', y: 'BTC-USD',  dec: 0 },
  { sym: 'ETH/USD', y: 'ETH-USD',  dec: 0 },
  { sym: 'SOL/USD', y: 'SOL-USD',  dec: 1 },
  { sym: 'EUR/USD', y: 'EURUSD=X', dec: 4 },
  { sym: 'GBP/USD', y: 'GBPUSD=X', dec: 4 },
  { sym: 'USD/JPY', y: 'JPY=X',    dec: 2 },
  { sym: 'GOLD',    y: 'GC=F',     dec: 0 },
  { sym: 'US100',   y: '^NDX',     dec: 0 },
  { sym: 'US500',   y: '^GSPC',    dec: 0 },
  { sym: 'GER40',   y: '^GDAXI',   dec: 0 },
  { sym: 'WTI',     y: 'CL=F',     dec: 2 },
  { sym: 'AAPL',    y: 'AAPL',     dec: 2 },
  { sym: 'NVDA',    y: 'NVDA',     dec: 2 },
];

function fetchYahoo(sym) {
  return new Promise((resolve) => {
    const path = `/v8/finance/chart/${encodeURIComponent(sym)}?interval=5m&range=2d`;
    const req = https.request({ hostname: 'query1.finance.yahoo.com', path, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, (r) => {
      let d = ''; r.on('data', (c) => (d += c));
      r.on('end', () => {
        try {
          const m = JSON.parse(d).chart.result[0].meta;
          const price = m.regularMarketPrice;
          const prev = m.chartPreviousClose || m.previousClose || m.regularMarketPreviousClose;
          if (!price || !prev) return resolve(null);
          resolve({ price, change: ((price - prev) / prev) * 100 });
        } catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(6000, () => { req.destroy(); resolve(null); });
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=60');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  try {
    const quotes = await Promise.all(SYMBOLS.map((s) => fetchYahoo(s.y)));
    const items = SYMBOLS.map((s, i) => quotes[i]
      ? { sym: s.sym, price: +quotes[i].price, change: +quotes[i].change.toFixed(2), dec: s.dec }
      : null).filter(Boolean);
    res.status(200).json({ ok: true, count: items.length, items });
  } catch (e) {
    res.status(502).json({ ok: false, error: String((e && e.message) || e), items: [] });
  }
};
