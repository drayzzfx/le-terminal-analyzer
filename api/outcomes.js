const https = require('https');

function supabase(method, path, body, key, token) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${token || key}`,
      'Prefer': method === 'PATCH' ? 'return=representation' : undefined
    };
    Object.keys(headers).forEach(k => headers[k] === undefined && delete headers[k]);
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KEY = process.env.SUPABASE_ANON_KEY;
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  // Verify user
  const userRes = await supabase('GET', '/auth/v1/user', null, KEY, token);
  if (!userRes.body.id) return res.status(401).json({ error: 'Invalid token' });
  const userId = userRes.body.id;

  try {
    if (req.method === 'POST') {
      const { analysisId, tradeTaken, tradeResult, rrRealized, tradeNotes } = req.body;

      // Update the analysis with outcome
      const r = await supabase(
        'PATCH',
        `/rest/v1/analyses?id=eq.${analysisId}&user_id=eq.${userId}`,
        {
          trade_taken: tradeTaken,
          trade_result: tradeResult || null,
          rr_realized: rrRealized || null,
          trade_notes: tradeNotes || null,
          outcome_updated_at: new Date().toISOString()
        },
        KEY, token
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      // Get performance stats
      const r = await supabase(
        'GET',
        `/rest/v1/analyses?user_id=eq.${userId}&order=created_at.desc&limit=100`,
        null, KEY, token
      );

      const analyses = Array.isArray(r.body) ? r.body : [];
      const taken = analyses.filter(a => a.trade_taken === true);
      const wins = taken.filter(a => a.trade_result === 'win');
      const losses = taken.filter(a => a.trade_result === 'loss');
      const be = taken.filter(a => a.trade_result === 'be');
      const closed = taken.filter(a => ['win','loss','be'].includes(a.trade_result));

      // Weekly stats (last 7 days)
      const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
      const weekly = taken.filter(a => a.created_at > weekAgo);
      const weeklyRR = weekly.filter(a => a.rr_realized).reduce((sum,a) => sum + parseFloat(a.rr_realized||0), 0);

      // Score progression (last 10)
      const last10 = analyses.slice(0,10).reverse();
      const scoreProgression = last10.map(a => ({
        date: a.created_at,
        score: parseFloat(a.score||0),
        pair: a.pair,
        verdict: a.verdict
      }));

      // Best/worst pairs
      const pairStats = {};
      taken.forEach(a => {
        if(!a.pair) return;
        if(!pairStats[a.pair]) pairStats[a.pair] = {wins:0,losses:0,total:0};
        pairStats[a.pair].total++;
        if(a.trade_result==='win') pairStats[a.pair].wins++;
        if(a.trade_result==='loss') pairStats[a.pair].losses++;
      });

      return res.status(200).json({
        totalAnalyses: analyses.length,
        totalTaken: taken.length,
        totalSkipped: analyses.filter(a => a.trade_taken === false).length,
        wins: wins.length,
        losses: losses.length,
        be: be.length,
        winRate: closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : null,
        avgScore: analyses.length > 0 ? (analyses.reduce((s,a) => s + parseFloat(a.score||0), 0) / analyses.length).toFixed(1) : null,
        avgRR: taken.filter(a=>a.rr_realized).length > 0
          ? (taken.filter(a=>a.rr_realized).reduce((s,a) => s + parseFloat(a.rr_realized||0), 0) / taken.filter(a=>a.rr_realized).length).toFixed(2)
          : null,
        weeklyRR: weeklyRR.toFixed(2),
        weeklyTrades: weekly.length,
        scoreProgression,
        pairStats,
        recentAnalyses: analyses.slice(0, 20)
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};
