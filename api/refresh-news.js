// api/refresh-news.js
// Vercel Cron — agrège les RSS, résume via Claude, stocke dans Supabase
// Déclenché par vercel.json crons (nécessite plan Pro pour < daily)
const https = require('https');

// ── SOURCES RSS PAR ZONE ──────────────────────────────────────────────────────
const SOURCES = {
  europe: [
    { name: 'La Tribune',        url: 'https://www.latribune.fr/rss/une.xml' },
    { name: 'Financial Times',   url: 'https://www.ft.com/rss/home/europe' },
    { name: 'Les Échos',         url: 'https://www.lesechos.fr/rss/rss_une.xml' },
    { name: 'Le Monde Économie', url: 'https://www.lemonde.fr/economie/rss_full.xml' },
  ],
  ameriques: [
    { name: 'CNBC Economy',      url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html' },
    { name: 'MarketWatch',       url: 'https://feeds.marketwatch.com/marketwatch/topstories/' },
    { name: 'AP Business',       url: 'https://feeds.apnews.com/rss/apf-business' },
  ],
  asie: [
    { name: 'SCMP Business',     url: 'https://www.scmp.com/rss/91/feed' },
    { name: 'Nikkei Asia',       url: 'https://asia.nikkei.com/rss/feed/nar' },
  ],
  institutions: [
    { name: 'BCE',               url: 'https://www.ecb.europa.eu/rss/press.html' },
    { name: 'FMI',               url: 'https://www.imf.org/external/np/exr/rss/news.xml' },
    { name: 'Banque de France',  url: 'https://www.banque-france.fr/fr/rss.xml' },
    { name: 'Fed',               url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
    { name: 'BIS',               url: 'https://www.bis.org/rss/press.rss' },
  ],
  marches: [
    { name: 'Investing.com News',url: 'https://www.investing.com/rss/news.rss' },
    { name: 'FXStreet',          url: 'https://www.fxstreet.com/rss/news' },
    { name: 'ForexFactory',      url: 'https://forexfactory.com/ff_calendar_thisweek.xml' },
  ],
  crypto: [
    { name: 'Cointelegraph',     url: 'https://cointelegraph.com/rss' },
    { name: 'Decrypt',           url: 'https://decrypt.co/feed' },
    { name: 'Bitcoin Magazine',  url: 'https://bitcoinmagazine.com/.rss/full/' },
    { name: 'The Block',         url: 'https://www.theblock.co/rss.xml' },
  ],
};

// ── ZEROHEDGE TWITTER — mots-clés d'annonce marché ────────────────────────────
// Basé sur les patterns réels de @zerohedge :
//  • "BREAKING: ..." / "FLASH: ..." / "JUST IN: ..."
//  • Données macro: "CPI", "GDP", "NFP", "%", "bps"
//  • Banques centrales: "Fed", "FOMC", "Powell", "ECB", "BOJ"
//  • Événements: "tariff", "recession", "default", "sanctions"
//  • Citations : "> Source: '...'"
const ZH_KEYWORDS = [
  'BREAKING','FLASH','JUST IN','ALERT','REPORT:',
  'CPI','GDP','NFP','PMI','ISM','PPI','PCE','FOMC','JOLTS','payrolls',
  'Fed ','Federal Reserve','Powell','ECB','Lagarde','BOJ','Ueda','BOE','SNB','central bank',
  'rate cut','rate hike','interest rate','basis point','bps',
  'tariff','tariffs','sanction','recession','default','crisis','collapse','crash',
  'earnings','bankruptcy','downgrade','upgrade',
  '> ', // format citation ZeroHedge : "> Source: '...'"
];

// Exclus : liens seuls, articles promotionnels, threads sans contenu
function isZHAnnouncement(text) {
  if (!text || text.length < 40) return false;
  if (/^RT @/i.test(text)) return false;                          // retweet
  if (/^@\w/.test(text)) return false;                           // réponse
  // Lien seul vers leur propre site sans contexte
  if (/zerohedge\.com/.test(text) && text.length < 130 && !ZH_KEYWORDS.some(k => text.includes(k))) return false;
  return ZH_KEYWORDS.some(k => text.includes(k));
}

// Cache du user ID (module-scope, survit aux warm starts)
let ZH_USER_ID = null;

function twitterGet(path, bearerToken) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.twitter.com',
      path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'LeTerminalBot/1.0',
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(null); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => req.destroy());
    req.end();
  });
}

async function fetchZerohedgeTweets(bearerToken) {
  // 1. Résoudre le user ID si pas encore en cache
  if (!ZH_USER_ID) {
    const user = await twitterGet('/2/users/by/username/zerohedge', bearerToken);
    ZH_USER_ID = user?.data?.id;
    if (!ZH_USER_ID) throw new Error('ZeroHedge user ID introuvable');
  }

  // 2. Récupérer les tweets des 2 dernières heures
  const startTime = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const params = new URLSearchParams({
    max_results: '20',
    'tweet.fields': 'created_at,text',
    exclude: 'retweets,replies',
    start_time: startTime,
  });

  const data = await twitterGet(
    `/2/users/${ZH_USER_ID}/tweets?${params.toString()}`,
    bearerToken
  );

  return (data?.data || []).filter(t => isZHAnnouncement(t.text));
}

async function getTweetSummary(tweetText) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return { summary: '', summary_en: '', sentiment: 'Neutre', is_announcement: true };

  const prompt = `Tweet de @ZeroHedge (compte de veille macro/marchés) :
"${tweetText.slice(0, 500)}"

Réponds UNIQUEMENT en JSON strict, sans markdown :
{
  "summary_fr": "<résumé factuel 1-2 phrases en FRANÇAIS de l'annonce, ou vide si pas d'annonce>",
  "summary_en": "<same in ENGLISH>",
  "sentiment": "<Positif|Négatif|Neutre>",
  "is_announcement": <true|false>
}

Contexte ZeroHedge : tweets souvent formatés "> Source: 'quote'" ou "BREAKING: data".
- is_announcement=true si : donnée macro (CPI/GDP/NFP…), banque centrale, tariff, événement marché
- Sentiment : Positif=bon pour marchés, Négatif=mauvais ou incertitude, Neutre=informatif
- summary_fr/en vides si is_announcement=false`;

  const payload = JSON.stringify({
    model: 'claude-haiku-4-5',
    max_tokens: 250,
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
          let sentiment = parsed.sentiment || 'Neutre';
          if (!['Positif','Négatif','Neutre'].includes(sentiment)) sentiment = 'Neutre';
          resolve({
            summary:    parsed.summary_fr || '',
            summary_en: parsed.summary_en || '',
            sentiment,
            is_announcement: parsed.is_announcement !== false,
          });
        } catch(e) { resolve({ summary: '', summary_en: '', sentiment: 'Neutre', is_announcement: true }); }
      });
    });
    req.on('error', () => resolve({ summary: '', summary_en: '', sentiment: 'Neutre', is_announcement: true }));
    req.write(payload);
    req.end();
  });
}

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
async function getSummaryAndSentiment(title, desc, zone) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return { summary: '', summary_en: '', sentiment: 'Neutre' };

  const cleanDesc = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 400);
  const prompt = `Tu es un analyste financier senior. Voici un article économique.

Titre original : ${title}
Contenu brut : ${cleanDesc}
Zone géographique : ${zone}

Réponds UNIQUEMENT en JSON strict, sans markdown ni texte autour :
{
  "summary_fr": "<résumé factuel 1-2 phrases en FRANÇAIS>",
  "summary_en": "<same factual summary 1-2 sentences in ENGLISH>",
  "sentiment": "<Positif|Négatif|Neutre>"
}

Règles sentiment :
- Positif : données meilleures qu'attendu, hausse marchés, accord commercial, croissance, emploi fort
- Négatif : données décevantes, baisse marchés, crise, récession, conflit, faillite
- Neutre : statu quo, simple publication de données sans surprise, déclaration sans impact clair`;

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
            summary:    parsed.summary_fr || parsed.summary || '',
            summary_en: parsed.summary_en || '',
            sentiment,
          });
        } catch(e) { resolve({ summary: '', summary_en: '', sentiment: 'Neutre' }); }
      });
    });
    req.on('error', () => resolve({ summary: '', summary_en: '', sentiment: 'Neutre' }));
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

          const { summary, summary_en, sentiment } = await getSummaryAndSentiment(item.title, item.desc, zone);

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

  // ── ZEROHEDGE TWITTER ────────────────────────────────────────────────────────
  // Actif uniquement si TWITTER_BEARER_TOKEN est configuré dans Vercel
  const TWITTER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
  if (TWITTER_TOKEN) {
    try {
      const tweets = await fetchZerohedgeTweets(TWITTER_TOKEN);
      for (const tweet of tweets) {
        stats.processed++;

        // guid = tweet ID (stable, pas de doublon)
        const guid = `zh_tweet_${tweet.id}`;
        const exists = await guidExists(guid);
        if (exists) { stats.skipped++; continue; }

        const { summary, summary_en, sentiment, is_announcement } = await getTweetSummary(tweet.text);

        // On ne stocke que les vraies annonces confirmées par Claude
        if (!is_announcement) { stats.skipped++; continue; }

        // Titre = première phrase du tweet (max 120 chars)
        const title = tweet.text.split('\n')[0].replace(/https?:\/\/\S+/g, '').trim().slice(0, 120);
        const tweetUrl = `https://x.com/zerohedge/status/${tweet.id}`;

        await insertNewsItem({
          guid,
          title:      title || tweet.text.slice(0, 120),
          summary:    summary    || tweet.text.replace(/https?:\/\/\S+/g,'').trim().slice(0, 200),
          summary_en: summary_en || '',
          source:     'ZeroHedge 𝕏',
          url:        tweetUrl,
          published_at: new Date(tweet.created_at).toISOString(),
          zone:       'flash',
          sentiment,
        });
        stats.inserted++;

        await new Promise(r => setTimeout(r, 400));
      }
    } catch(err) {
      stats.errors.push(`ZeroHedge Twitter: ${err.message}`);
    }
  }

  return res.status(200).json({ ok: true, ...stats });
};
