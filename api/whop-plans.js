const https = require('https');

function whopGet(path, apiKey) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.whop.com',
      path: path,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' }
    };
    const req = https.request(options, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: r.statusCode, body: data }); }
      });
    });
    req.on('error', () => resolve({ status: 0, body: null }));
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');
  const KEY = process.env.WHOP_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'WHOP_API_KEY not configured' });

  const PRODUCT = 'prod_aWllhBRr5c5yz';
  // Essaie plusieurs routes connues de l'API Whop pour lister les plans du produit
  const routes = [
    '/v5/company/plans?product_id=' + PRODUCT + '&per=100',
    '/v2/plans?product_id=' + PRODUCT + '&per=100',
    '/v5/company/plans?per=100',
    '/v2/plans?per=100',
    '/v5/company/products/' + PRODUCT + '/plans',
    '/v5/company/plans'
  ];
  let plans = null, used = null, rawSample = null;
  for (const r of routes) {
    const out = await whopGet(r, KEY);
    rawSample = out;
    if (out.status === 200 && out.body) {
      const arr = out.body.data || out.body.plans || (Array.isArray(out.body) ? out.body : null);
      if (Array.isArray(arr) && arr.length) { plans = arr; used = r; break; }
    }
  }

  if (!plans) {
    return res.status(200).json({ ok: false, note: 'Plans introuvables via API', debug: rawSample });
  }

  // Normalise chaque plan
  const norm = plans.map(p => {
    const price = parseFloat(p.initial_price ?? p.renewal_price ?? p.price ?? p.base_price ?? 0) || 0;
    // période : selon les champs disponibles (jours ou libellé)
    const periodRaw = p.billing_period ?? p.renewal_period ?? p.plan_type ?? p.release_method ?? '';
    const days = (typeof periodRaw === 'number') ? periodRaw : null;
    const txt = String(periodRaw).toLowerCase();
    const isAnnual = (days != null && days >= 200) || /year|annual|annee|année/.test(txt) || price >= 150;
    const isMonthly = !isAnnual && ((days != null && days >= 20 && days < 200) || /month|mois/.test(txt) || (price > 0 && price < 150));
    return { id: p.id, price, period: periodRaw, isAnnual, isMonthly, raw: { plan_type: p.plan_type, billing_period: p.billing_period } };
  });

  const annual = norm.find(p => p.isAnnual);
  const monthly = norm.find(p => p.isMonthly && (!annual || p.id !== annual.id));

  return res.status(200).json({
    ok: true,
    source: used,
    plans: {
      monthly: monthly ? monthly.id : null,
      annual: annual ? annual.id : null
    },
    all: norm
  });
};
