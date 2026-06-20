const https = require('https');

// authToken absent → on utilise apiKey comme bearer (clé service = bypass RLS).
function supabaseRequest(method, path, body, apiKey, authToken, prefer) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': apiKey,
      'Authorization': `Bearer ${authToken || apiKey}`,
    };
    if (prefer) headers['Prefer'] = prefer;
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

function clip(s, n) { return String(s == null ? '' : s).slice(0, n).trim(); }

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ANON_KEY;
  if (!ANON_KEY) return res.status(500).json({ error: 'Not configured' });

  try {
    // ── GET : avis approuvés (public) ──
    if (req.method === 'GET') {
      const r = await supabaseRequest('GET',
        '/rest/v1/reviews?approved=eq.true&select=author_name,role,rating,body,lang,created_at&order=created_at.desc&limit=60',
        null, SERVICE_KEY);
      const rows = Array.isArray(r.body) ? r.body : [];
      const count = rows.length;
      const avg = count ? (rows.reduce((a, b) => a + (b.rating || 0), 0) / count) : 0;
      return res.status(200).json({ reviews: rows, count, average: Math.round(avg * 10) / 10 });
    }

    // ── POST : dépôt d'un avis (membre connecté uniquement) ──
    if (req.method === 'POST') {
      const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
      if (!token) return res.status(401).json({ error: 'Not authenticated' });

      const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
      const userId = userRes.body && userRes.body.id;
      const userEmail = userRes.body && userRes.body.email;
      if (!userId) return res.status(401).json({ error: 'Invalid session' });

      const b = req.body || {};
      if (b.consent !== true) return res.status(400).json({ error: 'consent_required' });
      const rating = parseInt(b.rating, 10);
      if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'invalid_rating' });
      const author = clip(b.author_name, 40);
      const body = clip(b.body, 1000);
      if (author.length < 2) return res.status(400).json({ error: 'invalid_name' });
      if (body.length < 10) return res.status(400).json({ error: 'too_short' });
      const lang = (b.lang === 'en') ? 'en' : 'fr';
      const role = clip(b.role, 60);

      // Upsert (1 avis / utilisateur) ; toujours approved=false → modération.
      const up = await supabaseRequest('POST',
        '/rest/v1/reviews?on_conflict=user_id',
        {
          user_id: userId, user_email: userEmail, author_name: author,
          role: role || null, rating, body, lang, approved: false,
          created_at: new Date().toISOString()
        },
        SERVICE_KEY, null, 'resolution=merge-duplicates,return=minimal');

      if (up.status >= 300) return res.status(up.status).json({ error: 'save_failed' });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[reviews] EXCEPTION:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
