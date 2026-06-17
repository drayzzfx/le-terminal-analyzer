const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  try {
    const body = req.body;
    const system = body && body.system;
    const messages = body && body.messages;

    if (!messages || !Array.isArray(messages)) {
      console.error('[analyze] ERR: missing or invalid messages. body keys:', body ? Object.keys(body) : 'null');
      return res.status(400).json({ error: 'Missing messages' });
    }

    const payload = JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 6000,
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
          catch(e) { resolve({ status: r.statusCode, body: { error: data.slice(0, 500) } }); }
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

  } catch(err) {
    console.error('[analyze] EXCEPTION:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
