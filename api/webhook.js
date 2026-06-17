const https = require('https');
const crypto = require('crypto');

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, whop-signature');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const WHOP_API_KEY = process.env.WHOP_API_KEY;

  if (!ANON_KEY || !WHOP_API_KEY) {
    return res.status(500).json({ error: 'Missing config' });
  }

  try {
    const event = req.body;
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
