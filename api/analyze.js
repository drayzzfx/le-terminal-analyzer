const https = require('https');

// Appel REST/Auth Supabase. authToken absent → on utilise apiKey comme bearer
// (utile pour la clé service qui contourne la RLS sur user_profiles).
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

const COST = { analyze: 1 }; // coût en tokens d'une analyse pour un compte gratuit
// Admin : Premium à vie → analyses illimitées (email lu depuis le JWT vérifié).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'obstetar.adrien@gmail.com')
  .toLowerCase().split(',').map(function (s) { return s.trim(); }).filter(Boolean);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ANON_KEY;
  if (!ANON_KEY) return res.status(500).json({ error: 'Auth not configured' });

  // ── Authentification OBLIGATOIRE : ferme le proxy ouvert qui exposait la clé
  //    Anthropic à tout appelant anonyme. ──
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const body = req.body;
    const kind = (body && body.kind) || 'analyze'; // 'analyze' (payant) | 'chat' | 'coach'
    const system = body && body.system;
    const messages = body && body.messages;

    if (!messages || !Array.isArray(messages)) {
      console.error('[analyze] ERR: missing or invalid messages.');
      return res.status(400).json({ error: 'Missing messages' });
    }

    // Valide la session et identifie l'utilisateur.
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    const userId = userRes.body && userRes.body.id;
    const userEmail = userRes.body && userRes.body.email;
    if (!userId) return res.status(401).json({ error: 'Invalid session' });

    // Quota : seule la VRAIE analyse coûte un token. Le chat et le coach de
    // suivi (déjà rattachés à une analyse / au journal) ne décomptent rien ici.
    if (kind === 'analyze') {
      let profRes = await supabaseRequest('GET',
        `/rest/v1/user_profiles?id=eq.${userId}&select=tokens,is_pro,pro_until`, null, SERVICE_KEY);
      let profile = (profRes.body && profRes.body[0]) || null;

      // Crée le profil (5 tokens) s'il n'existe pas encore, sinon le PATCH de
      // décompte ne toucherait aucune ligne → analyses illimitées par erreur.
      if (!profile) {
        await supabaseRequest('POST', '/rest/v1/user_profiles',
          { id: userId, email: userEmail, tokens: 5, journal_slots: 0 },
          SERVICE_KEY, null, 'resolution=ignore-duplicates');
        profile = { tokens: 5, is_pro: false };
      }

      // Premium à durée limitée : pro_until NULL = permanent, sinon comparé à maintenant.
      const proActive = !profile.pro_until || new Date(profile.pro_until).getTime() > Date.now();
      const isPro = (!!(profile && profile.is_pro) && proActive) || ADMIN_EMAILS.includes((userEmail || '').toLowerCase());
      let tokens = (profile && profile.tokens != null) ? profile.tokens : 5;

      if (!isPro) {
        if (tokens < COST.analyze) {
          return res.status(402).json({ error: 'insufficient', tokens, is_pro: false });
        }
        // Décompte atomique côté serveur (impossible à contourner par le client).
        await supabaseRequest('PATCH', `/rest/v1/user_profiles?id=eq.${userId}`,
          { tokens: tokens - COST.analyze, updated_at: new Date().toISOString() },
          SERVICE_KEY, null, 'return=minimal');
      }
    }

    const payload = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system,
      messages
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      };

      const req2 = https.request(options, (r) => {
        let data = '';
        r.on('data', c => data += c);
        r.on('end', () => {
          try { resolve({ status: r.statusCode, body: JSON.parse(data) }); }
          catch (e) { resolve({ status: r.statusCode, body: { error: data.slice(0, 500) } }); }
        });
      });

      req2.on('error', reject);
      req2.write(payload);
      req2.end();
    });

    if (result.status !== 200) {
      const errType = result.body?.error?.type || '?';
      const errMsg = result.body?.error?.message || JSON.stringify(result.body).slice(0, 300);
      console.error('[analyze] ERR ' + result.status + ' type=' + errType + ' msg=' + errMsg);
      return res.status(result.status).json({ error: errMsg });
    }
    return res.status(200).json(result.body);

  } catch (err) {
    console.error('[analyze] EXCEPTION:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
