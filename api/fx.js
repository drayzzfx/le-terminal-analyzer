const https = require('https');

// Proxy serveur des taux de change (Frankfurter) — évite que le navigateur du
// visiteur n'appelle frankfurter.app directement (pas d'IP transmise à un tiers).
function fetchFx(path) {
  return new Promise((resolve, reject) => {
    const opt = {
      hostname: 'api.frankfurter.app', path, method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    };
    const rq = https.request(opt, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error('parse')); } });
    });
    rq.on('error', reject);
    rq.setTimeout(6000, () => { rq.destroy(); reject(new Error('timeout')); });
    rq.end();
  });
}
function cur(s) { return /^[A-Z]{3}$/.test(s) ? s : null; }
function day(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null; }

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const from = cur(String(req.query.from || '').toUpperCase());
  const to = cur(String(req.query.to || '').toUpperCase());
  if (!from || !to) return res.status(400).json({ error: 'invalid currency' });

  const start = day(String(req.query.start || ''));
  const end = day(String(req.query.end || ''));
  const path = (start && end)
    ? `/${start}..${end}?from=${from}&to=${to}`
    : `/latest?from=${from}&to=${to}`;

  try {
    const data = await fetchFx(path);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
