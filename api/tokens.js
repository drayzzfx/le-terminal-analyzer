const https = require('https');

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
    const reqx = https.request(options, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: data ? JSON.parse(data) : null }); }
        catch(e) { resolve({ status: r.statusCode, body: data }); }
      });
    });
    reqx.on('error', reject);
    if (payload) reqx.write(payload);
    reqx.end();
  });
}

// Coûts par défaut
const COST = { analyze: 1, eco: 1, journal_perf: 2 };
const SLOTS_PER_TOKEN = 5; // 1 token = 5 trades dans le journal

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const action = (req.body && req.body.action) || 'get';
  const reason = (req.body && req.body.reason) || 'analyze';

  try {
    // Identifie l'utilisateur via son JWT
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    const userId = userRes.body && userRes.body.id;
    const userEmail = userRes.body && userRes.body.email;
    if (!userId) return res.status(401).json({ error: 'Invalid session' });

    // Lit le profil (service key → bypass RLS)
    let profRes = await supabaseRequest('GET',
      `/rest/v1/user_profiles?id=eq.${userId}&select=tokens,journal_slots,is_pro,pro_until`,
      null, SERVICE_KEY);
    let profile = (profRes.body && profRes.body[0]) || null;

    // Crée le profil avec 5 tokens si absent
    if (!profile) {
      await supabaseRequest('POST', '/rest/v1/user_profiles',
        { id: userId, email: userEmail, tokens: 5, journal_slots: 0 },
        SERVICE_KEY, null, 'resolution=ignore-duplicates');
      profile = { tokens: 5, journal_slots: 0, is_pro: false };
    }

    // Premium à durée limitée : pro_until NULL = permanent, sinon comparé à maintenant.
    const proActive = !profile.pro_until || new Date(profile.pro_until).getTime() > Date.now();
    const isPro = !!profile.is_pro && proActive;
    let tokens = (profile.tokens == null) ? 5 : profile.tokens;
    let slots = (profile.journal_slots == null) ? 0 : profile.journal_slots;

    // GET : renvoie l'état courant
    if (action === 'get') {
      return res.status(200).json({ tokens, journal_slots: slots, is_pro: isPro });
    }

    // Premium = illimité, on ne décompte rien
    if (isPro) {
      return res.status(200).json({ ok: true, unlimited: true, tokens, journal_slots: slots, is_pro: true });
    }

    // SPEND : analyse, éco, perf journal
    if (action === 'spend') {
      const cost = COST[reason] || 1;
      if (tokens < cost) {
        return res.status(200).json({ ok: false, error: 'insufficient', tokens, journal_slots: slots, is_pro: false });
      }
      tokens -= cost;
      await supabaseRequest('PATCH', `/rest/v1/user_profiles?id=eq.${userId}`,
        { tokens, updated_at: new Date().toISOString() }, SERVICE_KEY, 'return=minimal');
      return res.status(200).json({ ok: true, tokens, journal_slots: slots, is_pro: false });
    }

    // JOURNAL_TRADE : 1 token = 5 slots de trades
    if (action === 'journal_trade') {
      if (slots > 0) {
        slots -= 1;
        await supabaseRequest('PATCH', `/rest/v1/user_profiles?id=eq.${userId}`,
          { journal_slots: slots, updated_at: new Date().toISOString() }, SERVICE_KEY, 'return=minimal');
        return res.status(200).json({ ok: true, tokens, journal_slots: slots, is_pro: false });
      }
      if (tokens >= 1) {
        tokens -= 1;
        slots = SLOTS_PER_TOKEN - 1; // ce trade consomme 1 des 5
        await supabaseRequest('PATCH', `/rest/v1/user_profiles?id=eq.${userId}`,
          { tokens, journal_slots: slots, updated_at: new Date().toISOString() }, SERVICE_KEY, 'return=minimal');
        return res.status(200).json({ ok: true, tokens, journal_slots: slots, is_pro: false });
      }
      return res.status(200).json({ ok: false, error: 'insufficient', tokens, journal_slots: slots, is_pro: false });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('[tokens] EXCEPTION:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
