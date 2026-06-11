// api/calendar.js — Calendrier économique structuré (événements) à partir du
// flux hebdomadaire ForexFactory / faireconomy (gratuit, sans clé API).
// Renvoie un JSON { events: [...] } consommé par le tableau custom de calendrier.html.
const https = require('https');

const FEEDS = [
  { hostname: 'nfs.faireconomy.media', path: '/ff_calendar_thisweek.xml' },
  { hostname: 'cdn-nfs.faireconomy.media', path: '/ff_calendar_thisweek.xml' },
];

function fetchXml(feed, redirects = 0) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: feed.hostname,
      path: feed.path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeTerminal/1.0)', 'Accept': 'application/xml,text/xml,*/*' },
      timeout: 8000,
    };
    const req = https.request(options, (r) => {
      if (r.statusCode >= 301 && r.statusCode <= 308 && r.headers.location && redirects < 3) {
        try {
          const u = new URL(r.headers.location, `https://${feed.hostname}`);
          return resolve(fetchXml({ hostname: u.hostname, path: u.pathname + u.search }, redirects + 1));
        } catch (e) { return reject(e); }
      }
      let data = '';
      r.on('data', (c) => (data += c));
      r.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function tag(block, name) {
  const m = block.match(new RegExp('<' + name + '>([\\s\\S]*?)</' + name + '>', 'i'));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function impactLevel(s) {
  s = (s || '').toLowerCase();
  if (s.indexOf('high') >= 0) return 3;
  if (s.indexOf('medium') >= 0) return 2;
  if (s.indexOf('low') >= 0) return 1;
  return 0; // holiday / none
}

// ForexFactory date format : mm-dd-yyyy → yyyy-mm-dd
function normDate(d) {
  const m = (d || '').match(/(\d{2})-(\d{2})-(\d{4})/);
  return m ? `${m[3]}-${m[1]}-${m[2]}` : (d || '');
}

function parse(xml) {
  const events = [];
  const blocks = xml.match(/<event>[\s\S]*?<\/event>/gi) || [];
  for (const b of blocks) {
    const title = tag(b, 'title');
    const currency = tag(b, 'country'); // dans ce flux, "country" = devise (USD, EUR…)
    if (!title) continue;
    events.push({
      title,
      currency,
      date: normDate(tag(b, 'date')),
      time: tag(b, 'time'),
      impact: impactLevel(tag(b, 'impact')),
      forecast: tag(b, 'forecast'),
      previous: tag(b, 'previous'),
      actual: tag(b, 'actual'), // souvent vide dans le flux prévisionnel
    });
  }
  return events;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600'); // 15 min CDN
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  let xml = '';
  for (const feed of FEEDS) {
    try { xml = await fetchXml(feed); if (xml && xml.indexOf('<event>') >= 0) break; }
    catch (e) { /* tente le feed suivant */ }
  }
  if (!xml || xml.indexOf('<event>') < 0) {
    res.status(502).json({ ok: false, error: 'feed_unavailable', events: [] });
    return;
  }
  try {
    const events = parse(xml);
    res.status(200).json({ ok: true, count: events.length, events });
  } catch (e) {
    res.status(500).json({ ok: false, error: String((e && e.message) || e), events: [] });
  }
};
