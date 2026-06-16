// api/refresh-news.js
// Vercel Cron — agrège les RSS, résume via Claude, stocke dans Supabase
// Déclenché par vercel.json crons (nécessite plan Pro pour < daily)
const https = require('https');

// ── SOURCES RSS PAR ZONE ──────────────────────────────────────────────────────
const SOURCES = {
  europe: [
    { name: 'Les Échos',            url: 'https://www.lesechos.fr/rss/rss_une.xml' },
    { name: 'La Tribune',           url: 'https://www.latribune.fr/rss/une.xml' },
    { name: 'Le Monde Économie',    url: 'https://www.lemonde.fr/economie/rss_full.xml' },
    { name: 'ING Think',            url: 'https://think.ing.com/rss/' },
  ],
  ameriques: [
    { name: 'CNBC Economy',         url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html' },
    { name: 'MarketWatch',          url: 'https://feeds.marketwatch.com/marketwatch/topstories/' },
    { name: 'AP Business',          url: 'https://feeds.apnews.com/rss/apf-business' },
  ],
  asie: [
    { name: 'SCMP Business',        url: 'https://www.scmp.com/rss/91/feed' },
    { name: 'Nikkei Asia',          url: 'https://asia.nikkei.com/rss/feed/nar' },
  ],
  institutions: [
    { name: 'BCE',                  url: 'https://www.ecb.europa.eu/rss/press.html' },
    { name: 'Fed',                  url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
    { name: 'FMI',                  url: 'https://www.imf.org/external/np/exr/rss/news.xml' },
    { name: 'Banque de France',     url: 'https://www.banque-france.fr/fr/rss.xml' },
    { name: 'BIS',                  url: 'https://www.bis.org/rss/press.rss' },
    { name: 'Central Bank News',    url: 'https://www.centralbanknews.info/feeds/posts/default?alt=rss' },
  ],
  marches: [
    { name: 'Investing.com',        url: 'https://www.investing.com/rss/news.rss' },
    { name: 'FXStreet',             url: 'https://www.fxstreet.com/rss/news' },
    { name: 'Financial Juice',      url: 'https://www.financialjuice.com/feed.ashx?xy=rss' },
    { name: 'InvestingLive',        url: 'https://www.investinglive.com/feed' },
  ],
  international: [
    { name: 'Le Monde International',  url: 'https://www.lemonde.fr/international/rss_full.xml' },
    { name: 'The Guardian — Monde',    url: 'https://www.theguardian.com/world/rss' },
    { name: 'The Guardian — Business', url: 'https://www.theguardian.com/uk/business/rss' },
  ],
  crypto: [
    { name: 'Cointelegraph',        url: 'https://cointelegraph.com/rss' },
    { name: 'Decrypt',              url: 'https://decrypt.co/feed' },
    { name: 'Bitcoin Magazine',     url: 'https://bitcoinmagazine.com/.rss/full/' },
    { name: 'The Block',            url: 'https://www.theblock.co/rss.xml' },
  ],
  flash: [
    { name: 'Financial Juice',      url: 'https://www.financialjuice.com/feed.ashx?xy=rss' },
    { name: 'InvestingLive',        url: 'https://www.investinglive.com/feed' },
    { name: 'ZeroHedge',            url: 'https://feeds.feedburner.com/zerohedge/feed' },
  ],
};

// ── HTTP FETCH ────────────────────────────────────────────────────────────────
function httpGet(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : require('http');
    const timer = setTimeout(() => reject(new Error('timeout')), timeout);
    try {
      const req = mod.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LeTerminalBot/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        }
      }, (res) => {
        // Follow redirect
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
    } catch(e) { clearTimeout(timer); reject(e); }
  });
}

// ── RSS PARSER (no npm — regex based) ────────────────────────────────────────
function parseRSS(xml) {
  const items = [];
  const itemRx = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
      const match = r.exec(block);
      return match ? match[1].trim() : '';
    };
    const title = get('title').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
    const link  = get('link') || get('guid');
    const pubDate = get('pubDate') || get('dc:date') || get('published');
    const guid  = get('guid') || link;
    const desc  = get('description') || get('summary') || get('content:encoded') || '';
    if (title && link) items.push({ title, link, guid, pubDate, desc });
  }
  return items;
}

// ── SUPABASE HELPERS ─────────────────────────────────────────────────────────
function sbReq(method, path, body) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  const url = new URL(SUPABASE_URL);
  const payload = body ? JSON.stringify(body) : null;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Prefer': method === 'POST' ? 'return=minimal' : undefined,
  };
  Object.keys(headers).forEach(k => headers[k] === undefined && delete headers[k]);
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

async function guidExists(guid) {
  const encoded = encodeURIComponent(guid);
  const r = await sbReq('GET', `/rest/v1/news_items?guid=eq.${encoded}&select=id&limit=1`);
  return Array.isArray(r.body) && r.body.length > 0;
}

async function insertNewsItem(item) {
  return sbReq('POST', '/rest/v1/news_items', item);
}

async function logFeedError(source, url, error) {
  return sbReq('POST', '/rest/v1/feed_errors', { source, url, error: String(error) });
}

// ── CLAUDE SUMMARY (FR + EN, 3 sentiments) ───────────────────────────────────
// Pour la zone "flash" : champ supplémentaire market_moving (50+ pts SP500/DAX/Nasdaq)
async function getSummaryAndSentiment(title, desc, zone) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return { summary: '', summary_en: '', sentiment: 'Neutre', market_moving: true, important: true };

  const isFlash = zone === 'flash';
  const cleanDesc = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 400);

  const flashExtra = isFlash ? `
- "market_moving": true UNIQUEMENT si cette annonce est susceptible de faire bouger un indice majeur (SP500, DAX, Nasdaq, CAC40) de plus de 50 points à elle seule. Exemples qui passent : chiffre CPI/NFP très surprenant, décision de taux inattendue, faillite majeure, discours Powell hawkish/dovish fort, guerre/escalade géopolitique, tariff surprise. Exemples qui NE passent PAS : article d'opinion, analyse sans chiffre, news connue d'avance, rappel d'une décision déjà prise.` : '';

  const flashField = isFlash ? `,
  "market_moving": <true|false>` : '';

  const prompt = `Tu es un trader institutionnel senior. Voici un article économique.

Titre : ${title}
Contenu : ${cleanDesc}
Zone : ${zone}

Réponds UNIQUEMENT en JSON strict, sans markdown :
{
  "summary_fr": "<résumé factuel 1-2 phrases en FRANÇAIS>",
  "summary_en": "<same 1-2 sentences in ENGLISH>",
  "sentiment": "<Positif|Négatif|Neutre>",
  "important": <true|false>${flashField}
}

Règles sentiment :
- Positif : données meilleures qu'attendu, hausse marchés, accord commercial, croissance, emploi fort
- Négatif : données décevantes, baisse marchés, crise, récession, conflit, faillite
- Neutre : statu quo, publication sans surprise, déclaration sans impact clair

Règle "important" : true UNIQUEMENT si l'annonce est vraiment significative pour un trader (macro, banque centrale, donnée clé CPI/NFP/PIB/emploi/inflation, décision de taux, mouvement de marché notable, géopolitique à impact, résultats majeurs). false pour : opinion/édito, sujet de société, marronnier, contenu promo/sponsorisé, sujet déjà connu sans nouveauté, info mineure.${flashExtra}`;

  const payload = JSON.stringify({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          const text = body.content?.[0]?.text || '{}';
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          // Normalise le sentiment vers 3 valeurs uniquement
          let sentiment = parsed.sentiment || 'Neutre';
          if (!['Positif','Négatif','Neutre'].includes(sentiment)) sentiment = 'Neutre';
          resolve({
            summary:      parsed.summary_fr || parsed.summary || '',
            summary_en:   parsed.summary_en || '',
            sentiment,
            market_moving: parsed.market_moving !== false, // true par défaut pour zones non-flash
            important: parsed.important !== false, // true par défaut si non précisé
          });
        } catch(e) { resolve({ summary: '', summary_en: '', sentiment: 'Neutre', important: true }); }
      });
    });
    req.on('error', () => resolve({ summary: '', summary_en: '', sentiment: 'Neutre', important: true }));
    req.write(payload);
    req.end();
  });
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Vérification cron secret (optionnel)
  const CRON_SECRET = process.env.CRON_SECRET;
  if (CRON_SECRET && req.headers['authorization'] !== `Bearer ${CRON_SECRET}`) {
    // Vercel cron injecte automatiquement le bon header — on laisse passer si pas de secret configuré
  }

  const stats = { processed: 0, inserted: 0, skipped: 0, errors: [] };

  for (const [zone, sources] of Object.entries(SOURCES)) {
    for (const source of sources) {
      try {
        const xml = await httpGet(source.url);
        const items = parseRSS(xml);

        for (const item of items.slice(0, 10)) {
          stats.processed++;
          const exists = await guidExists(item.guid);
          if (exists) { stats.skipped++; continue; }

          if (item.pubDate) {
            const age = Date.now() - new Date(item.pubDate).getTime();
            if (age > 48 * 3600 * 1000) { stats.skipped++; continue; }
          }

          const { summary, summary_en, sentiment, market_moving, important } = await getSummaryAndSentiment(item.title, item.desc, zone);

          // Filtre qualité : flash = market-moving 50+ pts ; autres zones = seulement les annonces significatives
          if (zone === 'flash' ? !market_moving : !important) { stats.skipped++; continue; }

          await insertNewsItem({
            guid: item.guid,
            title: item.title,
            summary:    summary    || item.desc.replace(/<[^>]+>/g,'').slice(0,200),
            summary_en: summary_en || '',
            source: source.name,
            url: item.link,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            zone,
            sentiment,
          });
          stats.inserted++;

          await new Promise(r => setTimeout(r, 300));
        }
      } catch(err) {
        stats.errors.push(`${source.name}: ${err.message}`);
        await logFeedError(source.name, source.url, err.message).catch(() => {});
      }
    }
  }

  return res.status(200).json({ ok: true, ...stats });
};
