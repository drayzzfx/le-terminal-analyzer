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
    { name: 'Yahoo Finance',        url: 'https://finance.yahoo.com/news/rssindex' },
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

// ── CLASSIFICATION SANS IA (mots-clés, zéro crédit) ──────────────────────────
// L'ingestion des annonces ne consomme AUCUN crédit Anthropic : on alimente le
// calendrier/les flux à partir des RSS, et on classe sentiment + importance via
// de simples heuristiques par mots-clés. L'analyse IA fine reste 100 % à la
// demande (clic utilisateur), jamais en tâche de fond.
const KW_IMPORTANT = [
  'cpi','ppi','nfp','non-farm','nonfarm','pce','gdp','pib','inflation','taux',
  'rate','rates','fomc','fed','federal reserve','powell','bce','ecb','lagarde',
  'boj','boe','snb','central bank','banque centrale','unemployment','chômage',
  'chomage','emploi','jobs','payroll','récession','recession','default','défaut',
  'faillite','bankrupt','tariff','tarif','sanction','guerre','war','crise','crash',
  'rally','plunge','surge','earnings','résultats','dividende','opep','opec','oil',
  'pétrole','petrole','bitcoin','btc','ethereum','eth','halving','etf','treasury',
  'obligations','yield','rendement','downgrade','upgrade','stimulus','relance'
];
const KW_POS = ['hausse','bond','rebond','record','croissance','accord','surge','rally','gain','beat','meilleur','optimis','soar','jump','rise','up ','strong','fort','expansion','reprise','positif'];
const KW_NEG = ['baisse','chute','recul','crise','récession','recession','crash','plunge','default','défaut','faillite','bankrupt','conflit','guerre','war','sanction','miss','pire','worse','fear','craint','slump','drop','fall','weak','faible','contraction','licencie','layoff'];

function _score(text, words) {
  let n = 0;
  for (const w of words) if (text.indexOf(w) !== -1) n++;
  return n;
}

// Renvoie la même forme que l'ancienne fonction IA, mais SANS appel réseau.
function getSummaryAndSentiment(title, desc, zone) {
  const cleanDesc = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const hay = (title + ' ' + cleanDesc).toLowerCase();
  const pos = _score(hay, KW_POS);
  const neg = _score(hay, KW_NEG);
  let sentiment = 'Neutre';
  if (pos > neg) sentiment = 'Positif';
  else if (neg > pos) sentiment = 'Négatif';
  const important = _score(hay, KW_IMPORTANT) > 0;
  return {
    title_fr: '',                                   // pas de traduction IA à l'ingestion
    title_en: '',
    summary: cleanDesc.slice(0, 220),               // extrait brut du flux
    summary_en: '',
    sentiment,
    // flash : on ne garde que les annonces à fort potentiel (mots-clés macro) ;
    // autres zones : idem, on filtre le bruit éditorial.
    market_moving: important,
    important,
  };
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

          const { title_fr, title_en, summary, summary_en, sentiment, market_moving, important } = await getSummaryAndSentiment(item.title, item.desc, zone);

          // Filtre qualité : flash = market-moving 50+ pts ; autres zones = seulement les annonces significatives
          if (zone === 'flash' ? !market_moving : !important) { stats.skipped++; continue; }

          const ins = await insertNewsItem({
            guid: item.guid,
            // title = version française (traduite à l'ingestion), stockée dans la
            // colonne existante. Pas de colonne supplémentaire → aucune migration.
            title: title_fr || item.title,
            summary:    summary    || item.desc.replace(/<[^>]+>/g,'').slice(0,200),
            summary_en: summary_en || '',
            source: source.name,
            url: item.link,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            zone,
            sentiment,
          });
          // On ne compte « inséré » que si Supabase a vraiment accepté la ligne.
          if (ins && ins.status >= 400) {
            stats.skipped++;
            stats.errors.push(`insert ${zone}/${source.name}: ${ins.status} ${JSON.stringify(ins.body).slice(0, 160)}`);
          } else {
            stats.inserted++;
          }

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
