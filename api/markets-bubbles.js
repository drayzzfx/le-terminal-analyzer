// api/markets-bubbles.js — Bubble Map data across asset classes.
// Crypto via CoinGecko (live market cap + 24h change). Forex / indices /
// commodities via Yahoo Finance v8 chart (live price + 24h change, no key).
// Returns { assets: [{ name, cat, change, w, price, cap? }] }. Cached 60s.
const https = require('https');

const STABLES = new Set(['usdt','usdc','dai','usds','fdusd','tusd','usde','busd','pyusd','usdp','usdd','gusd','frax','wsteth','steth','weth','wbtc','weeth','cbbtc']);

// Forex / indices / commodities — Yahoo symbol + relative weight w (≈ market
// prominence, in 1e11 units so it's comparable to crypto caps/1e11) + decimals.
const NONCRYPTO = [
  // Forex — majors
  { name: 'EUR/USD', cat: 'forex', y: 'EURUSD=X', w: 6.5, dec: 4 },
  { name: 'USD/JPY', cat: 'forex', y: 'JPY=X',    w: 4.8, dec: 2 },
  { name: 'GBP/USD', cat: 'forex', y: 'GBPUSD=X', w: 3.4, dec: 4 },
  { name: 'AUD/USD', cat: 'forex', y: 'AUDUSD=X', w: 1.8, dec: 4 },
  { name: 'USD/CAD', cat: 'forex', y: 'CAD=X',    w: 1.8, dec: 4 },
  { name: 'USD/CHF', cat: 'forex', y: 'CHF=X',    w: 1.6, dec: 4 },
  { name: 'NZD/USD', cat: 'forex', y: 'NZDUSD=X', w: 1.1, dec: 4 },
  // Forex — crosses JPY
  { name: 'EUR/JPY', cat: 'forex', y: 'EURJPY=X', w: 1.6, dec: 2 },
  { name: 'GBP/JPY', cat: 'forex', y: 'GBPJPY=X', w: 1.4, dec: 2 },
  { name: 'AUD/JPY', cat: 'forex', y: 'AUDJPY=X', w: 1.0, dec: 2 },
  { name: 'CHF/JPY', cat: 'forex', y: 'CHFJPY=X', w: 0.9, dec: 2 },
  { name: 'CAD/JPY', cat: 'forex', y: 'CADJPY=X', w: 0.8, dec: 2 },
  { name: 'NZD/JPY', cat: 'forex', y: 'NZDJPY=X', w: 0.7, dec: 2 },
  // Forex — crosses EUR
  { name: 'EUR/GBP', cat: 'forex', y: 'EURGBP=X', w: 1.3, dec: 4 },
  { name: 'EUR/CHF', cat: 'forex', y: 'EURCHF=X', w: 1.1, dec: 4 },
  { name: 'EUR/AUD', cat: 'forex', y: 'EURAUD=X', w: 0.9, dec: 4 },
  { name: 'EUR/CAD', cat: 'forex', y: 'EURCAD=X', w: 0.8, dec: 4 },
  { name: 'EUR/NZD', cat: 'forex', y: 'EURNZD=X', w: 0.7, dec: 4 },
  // Forex — crosses GBP
  { name: 'GBP/CHF', cat: 'forex', y: 'GBPCHF=X', w: 0.8, dec: 4 },
  { name: 'GBP/AUD', cat: 'forex', y: 'GBPAUD=X', w: 0.7, dec: 4 },
  { name: 'GBP/CAD', cat: 'forex', y: 'GBPCAD=X', w: 0.7, dec: 4 },
  // Forex — émergents / exotiques
  { name: 'USD/MXN', cat: 'forex', y: 'MXN=X',    w: 0.9, dec: 3 },
  { name: 'USD/SGD', cat: 'forex', y: 'SGD=X',    w: 0.8, dec: 4 },
  { name: 'USD/TRY', cat: 'forex', y: 'TRY=X',    w: 0.7, dec: 3 },
  { name: 'USD/ZAR', cat: 'forex', y: 'ZAR=X',    w: 0.6, dec: 3 },
  { name: 'USD/CNH', cat: 'forex', y: 'CNH=X',    w: 1.0, dec: 4 },
  { name: 'USD/HKD', cat: 'forex', y: 'HKD=X',    w: 0.6, dec: 4 },
  { name: 'USD/NOK', cat: 'forex', y: 'NOK=X',    w: 0.6, dec: 3 },
  { name: 'USD/SEK', cat: 'forex', y: 'SEK=X',    w: 0.6, dec: 3 },
  { name: 'AUD/NZD', cat: 'forex', y: 'AUDNZD=X', w: 0.6, dec: 4 },
  // Indices — USA
  { name: 'S&P 500',    cat: 'indices', y: '^GSPC',  w: 6.0, dec: 0 },
  { name: 'Nasdaq 100', cat: 'indices', y: '^NDX',   w: 5.0, dec: 0 },
  { name: 'Dow Jones',  cat: 'indices', y: '^DJI',   w: 4.0, dec: 0 },
  { name: 'Russell 2k', cat: 'indices', y: '^RUT',   w: 1.8, dec: 0 },
  // Indices — Europe
  { name: 'DAX',        cat: 'indices', y: '^GDAXI', w: 2.6, dec: 0 },
  { name: 'CAC 40',     cat: 'indices', y: '^FCHI',  w: 2.1, dec: 0 },
  { name: 'FTSE 100',   cat: 'indices', y: '^FTSE',  w: 2.2, dec: 0 },
  { name: 'IBEX 35',    cat: 'indices', y: '^IBEX',  w: 1.2, dec: 0 },
  { name: 'AEX',        cat: 'indices', y: '^AEX',   w: 1.1, dec: 2 },
  // Indices — Asie / Pacifique
  { name: 'Nikkei',     cat: 'indices', y: '^N225',  w: 2.5, dec: 0 },
  { name: 'Hang Seng',  cat: 'indices', y: '^HSI',   w: 2.0, dec: 0 },
  { name: 'ASX 200',    cat: 'indices', y: '^AXJO',  w: 1.4, dec: 0 },
  { name: 'CSI 300',    cat: 'indices', y: '000300.SS', w: 1.8, dec: 2 },
  // Matières premières — métaux
  { name: 'Or',         cat: 'matieres', y: 'GC=F', w: 4.2, dec: 1 },
  { name: 'Argent',     cat: 'matieres', y: 'SI=F', w: 1.6, dec: 2 },
  { name: 'Platine',    cat: 'matieres', y: 'PL=F', w: 1.2, dec: 1 },
  { name: 'Palladium',  cat: 'matieres', y: 'PA=F', w: 1.0, dec: 1 },
  { name: 'Cuivre',     cat: 'matieres', y: 'HG=F', w: 1.5, dec: 3 },
  // Matières premières — énergie
  { name: 'Pétrole WTI', cat: 'matieres', y: 'CL=F', w: 3.0, dec: 2 },
  { name: 'Brent',       cat: 'matieres', y: 'BZ=F', w: 3.0, dec: 2 },
  { name: 'Gaz nat.',    cat: 'matieres', y: 'NG=F', w: 1.3, dec: 2 },
  // Matières premières — agri
  { name: 'Maïs',       cat: 'matieres', y: 'ZC=F', w: 0.9, dec: 2 },
  { name: 'Blé',        cat: 'matieres', y: 'ZW=F', w: 0.8, dec: 2 },
  { name: 'Soja',       cat: 'matieres', y: 'ZS=F', w: 0.9, dec: 2 },
  { name: 'Sucre',      cat: 'matieres', y: 'SB=F', w: 0.5, dec: 2 },
  { name: 'Café',       cat: 'matieres', y: 'KC=F', w: 0.5, dec: 2 },
];

function fetchJson(hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeTerminal/1.0)', 'Accept': 'application/json' }, timeout: 8000 }, (r) => {
      let d = ''; r.on('data', (c) => (d += c));
      r.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error('bad_json')); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function fetchYahoo(sym) {
  return new Promise((resolve) => {
    const path = `/v8/finance/chart/${encodeURIComponent(sym)}?interval=15m&range=2d`;
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
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const assets = [];
  const results = await Promise.all([
    fetchJson('api.coingecko.com', '/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=60&page=1&price_change_percentage=24h').catch(() => []),
    ...NONCRYPTO.map((a) => fetchYahoo(a.y)),
  ]);

  const cg = results[0];
  (Array.isArray(cg) ? cg : [])
    .filter((c) => c && c.symbol && !STABLES.has(String(c.symbol).toLowerCase()) && c.market_cap)
    .slice(0, 30)
    .forEach((c) => assets.push({
      name: String(c.symbol).toUpperCase(), cat: 'crypto',
      change: +(c.price_change_percentage_24h || 0).toFixed(2),
      w: (c.market_cap || 0) / 1e11, cap: c.market_cap || 0, price: c.current_price || 0,
    }));

  NONCRYPTO.forEach((a, i) => {
    const q = results[i + 1];
    if (q && typeof q.price === 'number') {
      assets.push({ name: a.name, cat: a.cat, change: +q.change.toFixed(2), w: a.w, price: +q.price.toFixed(a.dec) });
    }
  });

  if (!assets.length) { res.status(502).json({ ok: false, assets: [] }); return; }
  res.status(200).json({ ok: true, count: assets.length, assets });
};
