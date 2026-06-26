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

  const now5m  = new Date(Date.now() -  5 * 60000).toISOString();
  const now7d  = new Date(Date.now() -  7 * 864e5).toISOString();
  const now30d = new Date(Date.now() - 30 * 864e5).toISOString();
  const now14d = new Date(Date.now() - 14 * 864e5).toISOString();
  const today  = new Date(new Date().setHours(0,0,0,0)).toISOString();

  try {
    const [
      usersRes,
      proRes,
      analysesRes,
      reviewsRes,
      views7dRes,
      views30dRes,
      viewsTodayRes,
      sessionRes,
      pagesRes,
      dailyRes,
      liveEventsRes,
      activeNowRes,
    ] = await Promise.all([
      sbGet('/rest/v1/user_profiles?select=id,email,is_pro,created_at&order=created_at.desc&limit=500', SK, SU),
      sbGet('/rest/v1/user_profiles?is_pro=eq.true&select=id', SK, SU),
      sbGet('/rest/v1/analyses?select=id,created_at&limit=1&order=created_at.desc', SK, SU),
      sbGet('/rest/v1/reviews?select=id,approved', SK, SU),
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${now7d}&select=id,page,session_id,user_email,created_at`, SK, SU),
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${now30d}&select=id,session_id,created_at`, SK, SU),
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${today}&select=id,session_id`, SK, SU),
      sbGet(`/rest/v1/page_events?event_type=eq.session_end&created_at=gte.${now30d}&select=duration_s,user_email,session_id`, SK, SU),
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${now30d}&select=page`, SK, SU),
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${now14d}&select=created_at`, SK, SU),
      sbGet(`/rest/v1/page_events?select=id,event_type,page,session_id,user_email,ua,referrer,created_at&order=created_at.desc&limit=80`, SK, SU),
      sbGet(`/rest/v1/page_events?event_type=eq.pageview&created_at=gte.${now5m}&select=session_id`, SK, SU),
    ]);

    const users      = Array.isArray(usersRes.b)        ? usersRes.b        : [];
    const pro        = Array.isArray(proRes.b)          ? proRes.b          : [];
    const analyses   = Array.isArray(analysesRes.b)     ? analysesRes.b     : [];
    const reviews    = Array.isArray(reviewsRes.b)      ? reviewsRes.b      : [];
    const views7d    = Array.isArray(views7dRes.b)      ? views7dRes.b      : [];
    const views30d   = Array.isArray(views30dRes.b)     ? views30dRes.b     : [];
    const viewsToday = Array.isArray(viewsTodayRes.b)   ? viewsTodayRes.b   : [];
    const sessions   = Array.isArray(sessionRes.b)      ? sessionRes.b      : [];
    const pages30d   = Array.isArray(pagesRes.b)        ? pagesRes.b        : [];
    const daily14d   = Array.isArray(dailyRes.b)        ? dailyRes.b        : [];
    const liveEvts   = Array.isArray(liveEventsRes.b)   ? liveEventsRes.b   : [];
    const activeNow  = Array.isArray(activeNowRes.b)    ? activeNowRes.b    : [];

    const uniqSessions7d    = new Set(views7d.map(v => v.session_id)).size;
    const uniqSessionsToday = new Set(viewsToday.map(v => v.session_id)).size;
    const activeSessions    = new Set(activeNow.map(v => v.session_id)).size;

    const validSessions = sessions.filter(s => s.duration_s > 3 && s.duration_s < 3600);
    const avgDuration = validSessions.length
      ? Math.round(validSessions.reduce((a, b) => a + b.duration_s, 0) / validSessions.length)
      : 0;

    const pageCounts = {};
    pages30d.forEach(v => { const p = v.page || 'index'; pageCounts[p] = (pageCounts[p] || 0) + 1; });
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count }));

    const dayMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    daily14d.forEach(v => {
      const key = v.created_at ? v.created_at.slice(0, 10) : null;
      if (key && dayMap[key] !== undefined) dayMap[key]++;
    });
    const dailyChart = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

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

    const hourMap = Array(24).fill(0);
    views7d.forEach(v => { if (v.created_at) hourMap[new Date(v.created_at).getHours()]++; });
    const hourlyChart = hourMap.map((count, hour) => ({ hour, count }));

    const recentUsers = users.slice(0, 15).map(u => ({
      email: u.email,
      is_pro: u.is_pro,
      created_at: u.created_at,
    }));

    const liveEvents = liveEvts.slice(0, 60).map(e => ({
      event_type: e.event_type,
      page: e.page,
      session_id: e.session_id ? String(e.session_id).slice(0, 8) : null,
      user_email: e.user_email || null,
      ua: e.ua || null,
      referrer: e.referrer || null,
      created_at: e.created_at,
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
        active_now: activeSessions,
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
        hourly: hourlyChart,
      },
      live: {
        events: liveEvents,
      },
    });
  } catch (e) {
    console.error('[admin-stats]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
