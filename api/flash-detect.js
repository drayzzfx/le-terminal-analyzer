// api/flash-detect.js
// GET /api/flash-detect — détecte les mouvements brusques via Twelve Data
// Appelé en polling toutes les 30 secondes côté client
const https = require('https');

// ── ACTIFS SURVEILLÉS ─────────────────────────────────────────────────────────
const ASSETS = [
  { symbol: 'EUR/USD',  type: 'forex',   threshold: 0.3  },
  { symbol: 'GBP/USD',  type: 'forex',   threshold: 0.3  },
  { symbol: 'USD/JPY',  type: 'forex',   threshold: 0.3  },
  { symbol: 'USD/CHF',  type: 'forex',   threshold: 0.3  },
  { symbol: 'AUD/USD',  type: 'forex',   threshold: 0.3  },
  { symbol: 'XAU/USD',  type: 'forex',   threshold: 0.4  },
  { symbol: 'XAG/USD',  type: 'forex',   threshold: 0.5  },
  { symbol: 'SPX500',   type: 'index',   threshold: 0.5  },
  { symbol: 'NASDAQ100',type: 'index',   threshold: 0.5  },
  { symbol: 'DAX40',    type: 'index',   threshold: 0.5  },
  { symbol: 'CAC40',    type: 'index',   threshold: 0.5  },
  { symbol: 'WTI/USD',  type: 'energy',  threshold: 0.6  },
  { symbol: 'BTC/USD',  type: 'crypto',  threshold: 1.0  },
  { symbol: 'ETH/USD',  type: 'crypto',  threshold: 1.0  },
];

// RSS sources pour cause potentielle
const FLASH_RSS = [
  'https://www.fxstreet.com/rss/news',
  'https://feeds.reuters.com/reuters/businessNews',
  'https://www.forexlive.com/feed/news',
];

// ── HTTP HELPERS ──────────────────────────────────────────────────────────────
function httpGet(url, timeout = 6000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : require('http');
    const timer = setTimeout(() => reject(new Error('timeout')), timeout);
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeTerminalBot/1.0)' }
    }, (res) => {
      if (res.statusCode >= 301 && res.statusCode <= 308 && res.headers.location) {
        clearTimeout(timer);
        return httpGet(res.headers.location, timeout).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { clearTimeout(timer); resolve(data); });
      res.on('error', e => { clearTimeout(timer); reject(e); });
    });
    req.on('error', e => { clearTimeout(timer); reject(e); });
  });
}

// ── SUPABASE ──────────────────────────────────────────────────────────────────
function sbReq(method, path, body) {
  const url = new URL(process.env.SUPABASE_URL);
  const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  const payload = body ? JSON.stringify(body) : null;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
  };
  if (method === 'POST') headers['Prefer'] = 'return=minimal';
  if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: url.hostname, path, method, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── TWELVE DATA — prix batch ──────────────────────────────────────────────────
async function fetchPrices() {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) return {};
  const symbols = ASSETS.map(a => a.symbol).join(',');
  try {
    const raw = await httpGet(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${key}`);
    return JSON.parse(raw);
  } catch(e) { return {}; }
}

// ── TWELVE DATA — bougie précédente ──────────────────────────────────────────
async function fetchPrevClose(symbol) {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) return null;
  try {
    const raw = await httpGet(
      `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=5min&outputsize=2&apikey=${key}`
    );
    const data = JSON.parse(raw);
    if (data.values && data.values.length >= 2) {
      return parseFloat(data.values[1].close);
    }
    return null;
  } catch(e) { return null; }
}

// ── RSS — cherche cause publiée dans les 15 dernières minutes ─────────────────
function parseRSSItems(xml) {
  const items = [];
  const rx = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = rx.exec(xml)) !== null) {
    const b = m[1];
    const get = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
      const match = r.exec(b);
      return match ? match[1].trim() : '';
    };
    const title   = get('title');
    const link    = get('link') || get('guid');
    const pubDate = get('pubDate') || get('dc:date') || '';
    if (title) items.push({ title, link, pubDate });
  }
  return items;
}

async function findCause(assetSymbol) {
  const cutoff = Date.now() - 15 * 60 * 1000; // 15 min
  for (const rssUrl of FLASH_RSS) {
    try {
      const xml = await httpGet(rssUrl, 5000);
      const items = parseRSSItems(xml);
      for (const item of items) {
        if (!item.pubDate) continue;
        const t = new Date(item.pubDate).getTime();
        if (isNaN(t) || t < cutoff) continue;
        // Match grossier : le titre contient le symbole de base (EUR, USD, BTC...)
        const base = assetSymbol.split('/')[0];
        if (item.title.toLowerCase().includes(base.toLowerCase()) ||
            item.title.toLowerCase().includes('fed') ||
            item.title.toLowerCase().includes('rate') ||
            item.title.toLowerCase().includes('central bank')) {
          return { title: item.title, url: item.link };
        }
      }
    } catch(e) { /* source indisponible, on continue */ }
  }
  return null;
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Mode GET sans param = retourne les 10 dernières alertes
  if (req.method === 'GET' && !req.query?.detect) {
    const r = await sbReq('GET', '/rest/v1/flash_alerts?order=detected_at.desc&limit=10');
    return res.status(200).json({ alerts: Array.isArray(r.body) ? r.body : [] });
  }

  // Mode détection (appelé par cron ou polling avec ?detect=1)
  const currentPrices = await fetchPrices();
  const alerts = [];

  for (const asset of ASSETS) {
    const current = parseFloat(currentPrices[asset.symbol]?.price);
    if (isNaN(current)) continue;

    const prev = await fetchPrevClose(asset.symbol);
    if (!prev) continue;

    const movePct = Math.abs((current - prev) / prev) * 100;
    if (movePct < asset.threshold) continue;

    const direction = current > prev ? 'up' : 'down';
    const cause = await findCause(asset.symbol);

    const alert = {
      asset: asset.symbol,
      move_pct: Math.round(movePct * 100) / 100,
      direction,
      cause_found: !!cause,
      source_title: cause?.title || null,
      source_url: cause?.url || null,
      summary: cause
        ? `Mouvement de ${movePct.toFixed(2)}% sur ${asset.symbol} — possible lien : ${cause.title.slice(0, 100)}`
        : `Mouvement de ${movePct.toFixed(2)}% sur ${asset.symbol} — Mouvement non expliqué — surveillance active`,
      detected_at: new Date().toISOString(),
    };

    await sbReq('POST', '/rest/v1/flash_alerts', alert).catch(() => {});
    alerts.push(alert);
  }

  // Nettoie les vieilles alertes (> 24h) pour garder la table légère
  const cutoff24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  await sbReq('DELETE', `/rest/v1/flash_alerts?detected_at=lt.${cutoff24h}`).catch(() => {});

  return res.status(200).json({ detected: alerts.length, alerts });
};
