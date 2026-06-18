const https = require('https');

function claudeRequest(base64Image, mediaType) {
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  const payload = JSON.stringify({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType || 'image/png', data: base64Image }
        },
        {
          type: 'text',
          text: `Tu es un assistant qui analyse des screenshots d'historique de trading MetaTrader 5.

Extrait TOUS les trades visibles dans cette image et retourne un JSON valide uniquement, sans texte avant ou après.

Format attendu :
{
  "trades": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "pair": "XAUUSD",
      "direction": "LONG",
      "entryPrice": 1920.50,
      "exitPrice": 1935.00,
      "lots": 0.10,
      "pnl": 145.00,
      "sl": null,
      "tp": null,
      "rr": null,
      "session": "London"
    }
  ]
}

Règles :
- direction: "LONG" pour buy, "SHORT" pour sell
- pnl: nombre décimal (négatif si perte), en devise du compte
- date au format YYYY-MM-DD
- time au format HH:MM
- Si une valeur n'est pas visible, mets null
- session: déduis depuis l'heure (Asian 00-08 UTC, London 08-12 UTC, NewYork 12-20 UTC, autres → "London")
- Retourne UNIQUEMENT le JSON, rien d'autre`
        }
      ]
    }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ error: 'Parse error', raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const { imgData, mediaType } = req.body || {};
  if (!imgData) return res.status(400).json({ error: 'Missing imgData' });

  try {
    const claudeRes = await claudeRequest(imgData, mediaType || 'image/png');
    if (claudeRes.error && !claudeRes.content) {
      return res.status(500).json({ error: claudeRes.error });
    }

    const text = claudeRes.content?.[0]?.text || '';
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(200).json({ trades: [] });

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ trades: Array.isArray(parsed.trades) ? parsed.trades : [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
