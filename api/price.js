const https = require('https');

const SYMBOL_MAP = {
  'XAUUSD': 'XAUUSD=X', 'GOLD': 'XAUUSD=X', 'XAU': 'XAUUSD=X',
  'XAGUSD': 'XAGUSD=X', 'SILVER': 'XAGUSD=X', 'XAG': 'XAGUSD=X',
  'NAS100': 'NQ=F', 'US100': 'NQ=F', 'NASDAQ': 'NQ=F',
  'US30': 'YM=F', 'DJ30': 'YM=F', 'DOW': 'YM=F',
  'SP500': 'ES=F', 'US500': 'ES=F', 'SPX': 'ES=F',
  'DAX': '^GDAXI', 'GER40': '^GDAXI', 'DE40': '^GDAXI',
  'UK100': '^FTSE', 'FTSE': '^FTSE',
  'USOIL': 'CL=F', 'OIL': 'CL=F',
  'BRENT': 'BZ=F',
  'BTCUSD': 'BTC-USD', 'BTC': 'BTC-USD',
  'ETHUSD': 'ETH-USD', 'ETH': 'ETH-USD',
  'SOLUSD': 'SOL-USD', 'SOL': 'SOL-USD',
  'XRPUSD': 'XRP-USD', 'XRP': 'XRP-USD',
  'BNBUSD': 'BNB-USD', 'BNB': 'BNB-USD',
  'DOGEUSD': 'DOGE-USD', 'DOGE': 'DOGE-USD',
  'ADAUSD': 'ADA-USD', 'ADA': 'ADA-USD',
  'AVAXUSD': 'AVAX-USD', 'AVAX': 'AVAX-USD',
  'LINKUSD': 'LINK-USD', 'LINK': 'LINK-USD',
  'DOTUSD': 'DOT-USD', 'DOT': 'DOT-USD',
  'LTCUSD': 'LTC-USD', 'LTC': 'LTC-USD',
  'MATICUSD': 'MATIC-USD', 'MATIC': 'MATIC-USD',
  // Forex
  'EURUSD': 'EURUSD=X', 'GBPUSD': 'GBPUSD=X', 'USDJPY': 'JPY=X',
  'AUDUSD': 'AUDUSD=X', 'USDCAD': 'CAD=X', 'USDCHF': 'CHF=X', 'NZDUSD': 'NZDUSD=X',
  // Indices supplémentaires
  'JP225': '^N225', 'NIKKEI': '^N225', 'CAC40': '^FCHI', 'FR40': '^FCHI',
  'HK50': '^HSI', 'AUS200': '^AXJO',
};

function fetchYahoo(yahooSym) {
  return new Promise((resolve, reject) => {
    const path = `/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1m&range=1d&includePrePost=false`;
    const options = {
      hostname: 'query1.finance.yahoo.com',
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    };
    const req = https.request(options, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  const yahooSym = SYMBOL_MAP[symbol];
  if (!yahooSym) return res.status(404).json({ error: 'Unknown symbol' });

  try {
    const data = await fetchYahoo(yahooSym);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || !meta.regularMarketPrice) {
      return res.status(502).json({ error: 'No price data' });
    }
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose || meta.previousClose || meta.regularMarketPreviousClose;
    const change = prev ? ((price - prev) / prev * 100) : null;

    res.setHeader('Cache-Control', 'public, max-age=30');
    return res.status(200).json({ price, change, symbol: yahooSym });
  } catch(err) {
    return res.status(502).json({ error: err.message });
  }
};
