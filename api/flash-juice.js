// api/flash-juice.js — Flash Info via le flux RSS public de Financial Juice.
// Ne garde que les annonces à FORT IMPACT (proxy du « rouge » de FJ, via
// mots-clés macro/breaking, car le RSS public n'expose pas la couleur),
// puis traduit les titres EN→FR (Google Translate gratuit). Cache CDN 60 s.
const https = require('https');

// Mots-clés « forte importance » — proxy des headlines rouges de Financial Juice.
const HOT = /(BREAKING|ALERT|JUST IN|URGENT|FLASH|HEADLINE|\*[^*]+\*|RATE (DECISION|CUT|HIKE|DECISIONS)|FOMC|\bFED\b|FEDERAL RESERVE|POWELL|\bECB\b|\bBCE\b|LAGARDE|\bBOE\b|\bBOJ\b|\bSNB\b|\bRBA\b|\bBOC\b|CENTRAL BANK|\bCPI\b|INFLATION|\bPPI\b|\bNFP\b|NON.?FARM|PAYROLLS?|UNEMPLOYMENT|JOBLESS|\bGDP\b|\bPMI\b|\bPCE\b|RETAIL SALES|OPEC|OPEP|\bWAR\b|GUERRE|SANCTION|TARIFF|TARIFS?|EMERGENCY|DEFAULT|DOWNGRADE|INTERVENTION|YIELD|TREASURY|\bWARN(S|ING)?\b)/i;

function httpGet(hostname, path, redirects) {
  redirects = redirects || 0;
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeTerminal/1.0)', 'Accept': 'application/rss+xml,application/xml,text/xml,*/*' }, timeout: 9000 }, (r) => {
      if (r.statusCode >= 301 && r.statusCode <= 308 && r.headers.location && redirects < 3) {
        try { const u = new URL(r.headers.location, `https://${hostname}`); return resolve(httpGet(u.hostname, u.pathname + u.search, redirects + 1)); }
        catch (e) { return reject(e); }
      }
      let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function tag(block, name) {
  const m = block.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>', 'i'));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim();
}

function parseRss(xml) {
  const items = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  for (const raw of blocks) {
    const b = raw.split(/<\/item>/i)[0];
    const title = tag(b, 'title');
    if (!title) continue;
    items.push({
      title,
      link: tag(b, 'link') || tag(b, 'guid'),
      guid: tag(b, 'guid') || tag(b, 'link') || title,
      pubDate: tag(b, 'pubDate') || tag(b, 'dc:date') || '',
      category: tag(b, 'category') || '',
    });
  }
  return items;
}

function translateFR(text) {
  return new Promise((resolve) => {
    const path = '/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=' + encodeURIComponent(text);
    const req = https.request({ hostname: 'translate.googleapis.com', path, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 7000 }, (r) => {
      let d = ''; r.on('data', (c) => (d += c));
      r.on('end', () => {
        try { const j = JSON.parse(d); resolve(j[0].map((s) => s[0]).join('')); }
        catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

// Filtre IA : ne garde que les titres réellement « market-moving » (équivalent des
// headlines rouges de Financial Juice). 1 seul appel Claude pour toute la liste.
// Renvoie un Set d'indices à garder, ou null si IA indisponible (repli mots-clés).
function aiKeep(items) {
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY || !items.length) return Promise.resolve(null);
  const list = items.map((it, i) => i + '. ' + it.title).join('\n');
  const prompt = `Tu es un trader institutionnel senior. Voici des titres d'actualité (Financial Juice), numérotés.

${list}

Garde UNIQUEMENT les titres à FORT IMPACT marché — ceux qui peuvent faire bouger immédiatement un indice, une devise ou une matière première (décisions/sentiers de taux des banques centrales, déclarations fortes de banquiers centraux, données macro qui surprennent : CPI/PCE/NFP/PIB/PMI/emploi, géopolitique majeure : guerre/escalade/sanctions/tarifs/OPEP, défaut souverain, intervention de change, gros titres de marché type accord/embargo). EXCLUS le bruit : donnée mineure ou attendue, opinion/analyse, redite, sujet sans impact direct, agenda à venir.

Réponds UNIQUEMENT par un JSON strict : {"keep":[<indices à garder>]}.`;
  const payload = JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 400, messages: [{ role: 'user', content: prompt }] });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), 'x-api-key': KEY, 'anthropic-version': '2023-06-01' }
    }, (r) => {
      let d = ''; r.on('data', (c) => (d += c));
      r.on('end', () => {
        try {
          const body = JSON.parse(d);
          const txt = body.content && body.content[0] && body.content[0].text;
          const m = txt && txt.match(/\{[\s\S]*\}/);
          const arr = m ? JSON.parse(m[0]).keep : null;
          resolve(Array.isArray(arr) ? new Set(arr.map(Number)) : null);
        } catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(payload); req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const showAll = req.query && (req.query.all === '1');
  try {
    const xml = await httpGet('www.financialjuice.com', '/feed.ashx?xy=rss');
    let items = parseRss(xml);
    if (!showAll) {
      const cand = items.slice(0, 45);
      const keep = await aiKeep(cand);
      if (keep) items = cand.filter((_, i) => keep.has(i));
      else items = items.filter((it) => HOT.test(it.title) || HOT.test(it.category)); // repli mots-clés si IA indisponible
    }
    items = items.slice(0, 40);
    const fr = await Promise.all(items.map((it) => translateFR(it.title).catch(() => null)));
    const out = items.map((it, i) => ({
      id: it.guid, url: it.link || 'https://www.financialjuice.com/home',
      title: fr[i] || it.title, title_en: it.title,
      published_at: it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString(),
      source: 'Financial Juice', importance: 'high',
    }));
    res.status(200).json({ ok: true, count: out.length, items: out });
  } catch (e) {
    res.status(502).json({ ok: false, error: String((e && e.message) || e), items: [] });
  }
};
