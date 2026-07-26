const https = require('https');

function supabaseInsert(body, serviceKey, supabaseUrl) {
  const url = new URL(supabaseUrl);
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
      'Content-Length': Buffer.byteLength(payload),
    };
    const rq = https.request({ hostname: url.hostname, path: '/rest/v1/page_events', method: 'POST', headers }, (r) => {
      r.resume();
      resolve(r.statusCode);
    });
    rq.on('error', reject);
    rq.write(payload);
    rq.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  if (!SERVICE_KEY || !SUPABASE_URL) return res.status(200).end();

  try {
    let b = req.body || {};
    // navigator.sendBeacon() envoie le corps en text/plain : Vercel ne le parse
    // alors PAS en JSON et req.body arrive sous forme de chaîne → sans ce parse,
    // chaque événement était silencieusement ignoré (page_events restait vide).
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    const allowed = ['pageview', 'session_end'];
    if (!allowed.includes(b.event_type)) return res.status(200).end();

    const row = {
      event_type: b.event_type,
      page: String(b.page || '').slice(0, 120) || null,
      session_id: String(b.session_id || '').slice(0, 64) || null,
      user_id: b.user_id || null,
      user_email: b.user_email ? String(b.user_email).slice(0, 120) : null,
      duration_s: b.duration_s ? parseInt(b.duration_s, 10) : null,
      referrer: b.referrer ? String(b.referrer).slice(0, 200) : null,
      ua: req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 200) : null,
    };

    await supabaseInsert(row, SERVICE_KEY, SUPABASE_URL);
    return res.status(200).end();
  } catch (e) {
    return res.status(200).end();
  }
};
