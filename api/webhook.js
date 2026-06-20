const https = require('https');
const crypto = require('crypto');

// Lit le corps BRUT de la requête (nécessaire pour vérifier la signature HMAC).
// Le parsing automatique du body est désactivé via module.exports.config (bas du fichier).
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    if (typeof req.body === 'string') return resolve(req.body);
    if (Buffer.isBuffer(req.body)) return resolve(req.body.toString('utf8'));
    let data = '';
    try { req.setEncoding('utf8'); } catch (e) {}
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// Vérifie la signature du webhook Whop : HMAC-SHA256 (hex) du corps brut signé
// avec le secret du webhook. Robuste : compatible avec les schémas courants
// (HMAC hex simple, Stripe « t=…,v1=… » sur « timestamp.corps », et Svix/Whop
// « id.timestamp.corps » en base64 avec secret « whsec_ » décodé en base64).
function safeEq(a, b) {
  try { const ba = Buffer.from(a), bb = Buffer.from(b); return ba.length === bb.length && crypto.timingSafeEqual(ba, bb); }
  catch (e) { return false; }
}
function verifyWhopSignature(rawBody, headers, secret) {
  const sig = headers['x-whop-signature'] || headers['whop-signature'] || headers['svix-signature'] || headers['webhook-signature'] || '';
  const ts  = headers['x-whop-timestamp'] || headers['whop-timestamp'] || headers['svix-timestamp'] || headers['webhook-timestamp'] || '';
  const id  = headers['svix-id'] || headers['webhook-id'] || headers['x-whop-id'] || '';
  if (!secret || !sig) return false;

  // Clés candidates : secret brut (utf8) + variante base64-décodée (whsec_… → Svix)
  const keys = [Buffer.from(secret, 'utf8')];
  const m = /^whsec_(.+)$/.exec(secret);
  try { keys.push(Buffer.from(m ? m[1] : secret, 'base64')); } catch (e) {}

  // Contenus signés candidats
  const payloads = [rawBody];
  if (ts) payloads.push(ts + '.' + rawBody);
  if (id && ts) payloads.push(id + '.' + ts + '.' + rawBody);

  // Tokens fournis (gère « t=…,v1=… », « v1,<sig> », séparés par , ou espace).
  // ATTENTION : une signature base64 finit par « = » (padding) → on ne retire le
  // préfixe que si la partie avant « = » est une vraie clé courte (t, v1, sha256).
  const provided = [];
  String(sig).split(/[\s,]+/).forEach((part) => {
    if (!part) return;
    const eq = part.indexOf('=');
    if (eq > 0 && /^[a-z][a-z0-9]{0,8}$/i.test(part.slice(0, eq))) {
      provided.push(part.slice(eq + 1).trim());
    } else {
      provided.push(part.trim());
    }
  });
  provided.push(String(sig).trim());

  for (const key of keys) {
    for (const p of payloads) {
      const hHex = crypto.createHmac('sha256', key).update(p, 'utf8').digest('hex');
      const hB64 = crypto.createHmac('sha256', key).update(p, 'utf8').digest('base64');
      for (const cand of provided) {
        if (safeEq(cand, hHex) || safeEq(cand, hB64)) return true;
      }
    }
  }
  return false;
}

function supabaseRequest(method, path, body, anonKey) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const url = new URL(SUPABASE_URL);
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || anonKey;

  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const options = { hostname: url.hostname, path, method, headers };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function verifyWhopMembership(userEmail) {
  const WHOP_API_KEY = process.env.WHOP_API_KEY;
  const WHOP_PRODUCT_ID = 'prod_aWllhBRr5c5yz';

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.whop.com',
      path: `/v5/memberships?product_id=${WHOP_PRODUCT_ID}&status=active`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHOP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const members = parsed.data || [];
          // Check if email matches any active member
          const match = members.find(m =>
            m.user?.email?.toLowerCase() === userEmail.toLowerCase() ||
            m.discord?.username?.toLowerCase() === userEmail.toLowerCase()
          );
          resolve(match ? match : null);
        } catch(e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, whop-signature, x-whop-signature');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const WHOP_API_KEY = process.env.WHOP_API_KEY;
  const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;

  if (!ANON_KEY || !WHOP_API_KEY) {
    return res.status(500).json({ error: 'Missing config' });
  }
  // Sécurité : sans secret de webhook configuré, on REFUSE (fail-closed) plutôt
  // que d'accepter des événements non authentifiés qui octroieraient un accès
  // Premium frauduleux. → Définir WHOP_WEBHOOK_SECRET dans Vercel.
  if (!WHOP_WEBHOOK_SECRET) {
    console.error('[webhook] WHOP_WEBHOOK_SECRET manquant — webhook refusé (fail-closed).');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  try {
    // Corps brut + vérification de signature AVANT tout traitement.
    const rawBody = await readRawBody(req);
    if (!verifyWhopSignature(rawBody, req.headers, WHOP_WEBHOOK_SECRET)) {
      // Diagnostic (sans exposer le secret) : aide à identifier le format Whop exact.
      const sigHeaders = Object.keys(req.headers).filter(h => /sign|whop|svix|webhook/i.test(h));
      console.warn('[webhook] Signature invalide. En-têtes liés:', JSON.stringify(sigHeaders),
        '· valeurs:', JSON.stringify(sigHeaders.reduce((o, h) => (o[h] = req.headers[h], o), {})),
        '· longueur corps:', (rawBody || '').length);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    let event;
    try { event = JSON.parse(rawBody || '{}'); }
    catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }

    const action = event.action || event.event;
    const data = event.data || event;

    console.log('Whop webhook received:', action, JSON.stringify(data).slice(0, 200));

    // Handle membership events
    if (action === 'membership.went_valid' || action === 'membership.created' ||
        action === 'payment.succeeded' || action === 'membership.activated') {

      const userEmail = data?.user?.email || data?.email || data?.membership?.user?.email;
      const status = data?.status || 'active';

      if (!userEmail) {
        console.log('No email found in webhook data');
        return res.status(200).json({ received: true, note: 'no email' });
      }

      // Update user in Supabase - set is_pro = true
      // First find the user by email in auth.users
      const findUser = await supabaseRequest(
        'GET',
        `/rest/v1/user_profiles?email=eq.${encodeURIComponent(userEmail)}&select=id,email,is_pro`,
        null,
        ANON_KEY
      );

      if (findUser.body && findUser.body.length > 0) {
        const userId = findUser.body[0].id;
        await supabaseRequest(
          'PATCH',
          `/rest/v1/user_profiles?id=eq.${userId}`,
          { is_pro: true, whop_status: 'active', updated_at: new Date().toISOString() },
          ANON_KEY
        );
        console.log('Updated user to PRO:', userEmail);
      } else {
        // Store pending activation for when user registers
        await supabaseRequest(
          'POST',
          '/rest/v1/pending_activations',
          {
            email: userEmail.toLowerCase(),
            is_pro: true,
            whop_status: 'active',
            created_at: new Date().toISOString()
          },
          ANON_KEY
        );
        console.log('Stored pending activation for:', userEmail);
      }
    }

    // Handle cancellation/expiry
    if (action === 'membership.went_invalid' || action === 'membership.cancelled' ||
        action === 'membership.expired') {

      const userEmail = data?.user?.email || data?.email;
      if (userEmail) {
        const findUser = await supabaseRequest(
          'GET',
          `/rest/v1/user_profiles?email=eq.${encodeURIComponent(userEmail)}&select=id`,
          null,
          ANON_KEY
        );
        if (findUser.body && findUser.body.length > 0) {
          await supabaseRequest(
            'PATCH',
            `/rest/v1/user_profiles?id=eq.${findUser.body[0].id}`,
            { is_pro: false, whop_status: 'cancelled', updated_at: new Date().toISOString() },
            ANON_KEY
          );
          console.log('Cancelled PRO for:', userEmail);
        }
      }
    }

    return res.status(200).json({ received: true });

  } catch(err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Désactive le parsing automatique du corps : la vérification de signature HMAC
// exige le corps brut, octet pour octet (sinon la signature ne correspond pas).
module.exports.config = { api: { bodyParser: false } };
