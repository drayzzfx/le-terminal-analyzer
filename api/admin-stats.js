const https = require('https');

const ADMIN_PASS = 'leterminal-admin-2026';

function sbGet(path, serviceKey, supabaseUrl) {
  const url = new URL(supabaseUrl);
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json', 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` };
    const rq = https.request({ hostname: url.hostname, path, method: 'GET', headers }, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => { try { resolve({ s: r.statusCode, b: data ? JSON.parse(data) : null }); } catch(e) { resolve({ s: r.statusCode, b: data }); } });
    });
    rq.on('error', reject);
    rq.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Pass');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pass = req.headers['x-admin-pass'] || '';
  if (pass !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

  const SK = process.env.SUPABASE_SERVICE_KEY;
  const SU = process.env.SUPABASE_URL;
  if (!SK || !SU) return res.status(500).json({ error: 'Not configured' });

  try {
    const [
      usersRes,
      proRes,
      analysesRes,
      tradesRes,
      reviewsRes,
      views7dRes,
      views30dRes,
      viewsTodayRes,
      sessionRes,
      pagesRes,
      dailyRes,
      authRes,
    ] = await Promise.all([
      // Total users
      sbGet('/rest/v1/user_profiles?select=id,email,is_pro,created_at&order=created_at.desc&limit=500', SK, SU),
      // Pro users count
      sbGet('/rest/v1/user_profiles?is_pro=eq.true&select=id', SK, SU),
      // Total analyses
      sbGet('/rest/v1/analyses?select=id,created_at&limit=1&order=created_at.desc', SK, SU),
      // Total trades
      sbGet('/rest/v1/journal_trades?select=id&limit=1', SK, SU),
      // Reviews
      sbGet('/rest/v1/reviews?select=id,approved', SK, SU),
      // Pageviews last 7 days
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${new Date(Date.now()-7*864e5).toISOString()}&select=id,page,session_id,user_email,created_at`, SK, SU),
      // Pageviews last 30 days
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${new Date(Date.now()-30*864e5).toISOString()}&select=id,session_id,created_at`, SK, SU),
      // Pageviews today
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${new Date(new Date().setHours(0,0,0,0)).toISOString()}&select=id,session_id`, SK, SU),
      // Session durations (last 30d)
      sbGet(`/rest/v1/page_events?event_type=eq.session_end&created_at=gte.${new Date(Date.now()-30*864e5).toISOString()}&select=duration_s,user_email,session_id`, SK, SU),
      // Top pages (last 30d)
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${new Date(Date.now()-30*864e5).toISOString()}&select=page`, SK, SU),
      // Daily views last 14 days
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${new Date(Date.now()-14*864e5).toISOString()}&select=created_at`, SK, SU),
      // Auth audit (signups + logins) from Supabase auth
      sbGet('/rest/v1/user_profiles?select=id,email,is_pro,created_at&order=created_at.desc&limit=10', SK, SU),
    ]);

    const users = Array.isArray(usersRes.b) ? usersRes.b : [];
    const pro = Array.isArray(proRes.b) ? proRes.b : [];
    const analyses = Array.isArray(analysesRes.b) ? analysesRes.b : [];
    const reviews = Array.isArray(reviewsRes.b) ? reviewsRes.b : [];
    const views7d = Array.isArray(views7dRes.b) ? views7dRes.b : [];
    const views30d = Array.isArray(views30dRes.b) ? views30dRes.b : [];
    const viewsToday = Array.isArray(viewsTodayRes.b) ? viewsTodayRes.b : [];
    const sessions = Array.isArray(sessionRes.b) ? sessionRes.b : [];
    const pages30d = Array.isArray(pagesRes.b) ? pagesRes.b : [];
    const daily14d = Array.isArray(dailyRes.b) ? dailyRes.b : [];

    // Unique sessions
    const uniqSessions7d = new Set(views7d.map(v => v.session_id)).size;
    const uniqSessionsToday = new Set(viewsToday.map(v => v.session_id)).size;

    // Avg session duration
    const validSessions = sessions.filter(s => s.duration_s > 3 && s.duration_s < 3600);
    const avgDuration = validSessions.length ? Math.round(validSessions.reduce((a, b) => a + b.duration_s, 0) / validSessions.length) : 0;

    // Top pages
    const pageCounts = {};
    pages30d.forEach(v => { const p = v.page || 'index'; pageCounts[p] = (pageCounts[p] || 0) + 1; });
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([page, count]) => ({ page, count }));

    // Daily chart last 14 days
    const dayMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = 0;
    }
    daily14d.forEach(v => {
      const key = v.created_at ? v.created_at.slice(0, 10) : null;
      if (key && dayMap[key] !== undefined) dayMap[key]++;
    });
    const dailyChart = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    // Signups per day (last 14d from user_profiles.created_at)
    const signupMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      signupMap[d.toISOString().slice(0, 10)] = 0;
    }
    users.filter(u => u.created_at).forEach(u => {
      const key = u.created_at.slice(0, 10);
      if (signupMap[key] !== undefined) signupMap[key]++;
    });
    const signupChart = Object.entries(signupMap).map(([date, count]) => ({ date, count }));

    // Recent users (last 10)
    const recentUsers = users.slice(0, 10).map(u => ({
      email: u.email,
      is_pro: u.is_pro,
      created_at: u.created_at,
    }));

    return res.status(200).json({
      users: {
        total: users.length,
        pro: pro.length,
        free: users.length - pro.length,
        recent: recentUsers,
      },
      content: {
        analyses_total: analyses.length > 0 ? '50+' : 0,
        reviews_pending: reviews.filter(r => !r.approved).length,
        reviews_published: reviews.filter(r => r.approved).length,
      },
      traffic: {
        views_today: viewsToday.length,
        sessions_today: uniqSessionsToday,
        views_7d: views7d.length,
        sessions_7d: uniqSessions7d,
        views_30d: views30d.length,
        avg_duration_s: avgDuration,
      },
      charts: {
        daily_views: dailyChart,
        daily_signups: signupChart,
        top_pages: topPages,
      },
    });
  } catch (e) {
    console.error('[admin-stats]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
