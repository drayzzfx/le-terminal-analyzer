const https = require('https');

const ADMIN_PASS = 'leterminal-admin-2026';

function supabaseRequest(method, path, body, serviceKey) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const options = { hostname: url.hostname, path, method, headers };
    const rq = https.request(options, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: data ? JSON.parse(data) : null }); }
        catch (e) { resolve({ status: r.statusCode, body: data }); }
      });
    });
    rq.on('error', reject);
    if (payload) rq.write(payload);
    rq.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Pass');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pass = req.headers['x-admin-pass'] || '';
  if (pass !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SERVICE_KEY) return res.status(500).json({ error: 'Not configured' });

  try {
    // GET : tous les avis (pending + approved)
    if (req.method === 'GET') {
      const r = await supabaseRequest('GET',
        '/rest/v1/reviews?select=id,user_email,author_name,role,rating,body,lang,approved,created_at&order=created_at.desc&limit=200',
        null, SERVICE_KEY);
      const rows = Array.isArray(r.body) ? r.body : [];
      return res.status(200).json({ reviews: rows });
    }

    // PATCH : approuver ou retirer
    if (req.method === 'PATCH') {
      const { id, approved } = req.body || {};
      if (!id || approved === undefined) return res.status(400).json({ error: 'missing_fields' });
      const r = await supabaseRequest('PATCH',
        `/rest/v1/reviews?id=eq.${id}`,
        { approved }, SERVICE_KEY);
      if (r.status >= 300) return res.status(500).json({ error: 'update_failed' });
      return res.status(200).json({ ok: true });
    }

    // DELETE : supprimer définitivement
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'missing_id' });
      const r = await supabaseRequest('DELETE',
        `/rest/v1/reviews?id=eq.${id}`,
        null, SERVICE_KEY);
      if (r.status >= 300) return res.status(500).json({ error: 'delete_failed' });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[admin-reviews]', err.message);
    return res.status(500).json({ error: err.message });
  }
};
