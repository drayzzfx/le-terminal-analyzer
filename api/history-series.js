const https = require('https');

// Univers de corrélation (app-key -> symbole Yahoo). Volontairement ciblé
// sur des marchés liquides à historique fiable.
const CORR_MAP = {
  // Forex
  'EURUSD':'EURUSD=X','GBPUSD':'GBPUSD=X','USDJPY':'JPY=X','AUDUSD':'AUDUSD=X',
  'USDCAD':'CAD=X','USDCHF':'CHF=X','NZDUSD':'NZDUSD=X','EURJPY':'EURJPY=X','GBPJPY':'GBPJPY=X',
  // Crypto
  'BTC':'BTC-USD','ETH':'ETH-USD','SOL':'SOL-USD','XRP':'XRP-USD','BNB':'BNB-USD',
  'ADA':'ADA-USD','DOGE':'DOGE-USD','AVAX':'AVAX-USD','LINK':'LINK-USD','DOT':'DOT-USD',
  // Indices
  'SP500':'ES=F','NAS100':'NQ=F','US30':'YM=F','DAX':'^GDAXI','CAC40':'^FCHI',
  'UK100':'^FTSE','JP225':'^N225','HK50':'^HSI',
  // Matières premières
  'GOLD':'GC=F','SILVER':'SI=F','USOIL':'CL=F','BRENT':'BZ=F','NATGAS':'NG=F',
  'COPPER':'HG=F','PLATINUM':'PL=F',
};

function fetchDaily(yahooSym, range) {
  return new Promise((resolve) => {
    const path = `/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=${range}`;
    const req = https.request({
      hostname: 'query1.finance.yahoo.com', path, method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    }, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try {
          const res = JSON.parse(data).chart.result[0];
          const ts = res.timestamp || [];
          const cl = (res.indicators.quote[0].close) || [];
          const map = {};
          for (let i = 0; i < ts.length; i++) {
            if (cl[i] != null) {
              const d = new Date(ts[i] * 1000).toISOString().slice(0, 10);
              map[d] = cl[i];
            }
          }
          resolve(map);
        } catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(7000, () => { req.destroy(); resolve(null); });
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const raw = (req.query.symbols || '').toUpperCase().trim();
  if (!raw) return res.status(400).json({ error: 'Missing symbols' });
  const keys = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 16);
  const days = Math.min(Math.max(parseInt(req.query.days || '90', 10) || 90, 20), 250);
  const range = days <= 35 ? '1mo' : (days <= 95 ? '3mo' : (days <= 190 ? '6mo' : '1y'));

  // Résout et fetch en parallèle
  const valid = keys.filter(k => CORR_MAP[k]);
  if (!valid.length) return res.status(404).json({ error: 'No known symbols' });
  const maps = await Promise.all(valid.map(k => fetchDaily(CORR_MAP[k], range)));

  // Dates communes à toutes les séries disponibles
  const perSym = {};
  const okKeys = [];
  valid.forEach((k, i) => { if (maps[i]) { perSym[k] = maps[i]; okKeys.push(k); } });
  if (okKeys.length < 2) return res.status(502).json({ error: 'Not enough data' });

  let common = Object.keys(perSym[okKeys[0]]);
  okKeys.slice(1).forEach(k => {
    const set = perSym[k];
    common = common.filter(d => set[d] != null);
  });
  common.sort();
  common = common.slice(-days);

  const series = {};
  okKeys.forEach(k => { series[k] = common.map(d => perSym[k][d]); });

  res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 min
  return res.status(200).json({ dates: common, series, days, symbols: okKeys });
};
