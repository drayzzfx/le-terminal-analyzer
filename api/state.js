// api/state.js — état applicatif synchronisé entre appareils.
//
// Une ligne par (utilisateur, clé) dans public.user_state. Le client
// (sync.js) y dépose les données qui ne vivaient jusqu'ici que dans le
// localStorage : patrimoine, devise du journal, préférences du calendrier,
// analyses masquées. Le schéma est dans supabase-user-state.sql.
//
//   GET  /api/state            → { key: { value, updated_at }, … }
//   POST /api/state            → { key, value, updated_at? }  (upsert)
//   DELETE /api/state?key=…    → supprime une clé
//
// L'appel se fait toujours avec le jeton de l'utilisateur : les politiques
// RLS de Supabase garantissent qu'on ne lit et n'écrit que ses propres lignes.

const https = require('https');

function supabaseRequest(method, path, body, key, authToken) {
  const url = new URL(process.env.SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${authToken || key}`
    };
    if (method === 'POST' || method === 'PATCH') {
      headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
    }
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request({ hostname: url.hostname, path, method, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Garde-fous : on refuse ce qui n'a rien à faire ici plutôt que de laisser
// grossir la table sans limite.
const MAX_VALUE_BYTES = 512 * 1024;   // 512 Ko par clé
const KEY_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!ANON_KEY || !process.env.SUPABASE_URL) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const userRes = await supabaseRequest('GET', '/auth/v1/user', null, ANON_KEY, token);
    const userId = userRes.body && userRes.body.id;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    if (req.method === 'GET') {
      const r = await supabaseRequest(
        'GET', '/rest/v1/user_state?select=key,value,updated_at', null, ANON_KEY, token);
      if (r.status >= 400) return res.status(r.status).json({ error: r.body });
      const out = {};
      (Array.isArray(r.body) ? r.body : []).forEach(row => {
        out[row.key] = { value: row.value, updated_at: row.updated_at };
      });
      return res.status(200).json(out);
    }

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key || !KEY_PATTERN.test(key)) {
        return res.status(400).json({ error: 'Invalid key' });
      }
      if (value === undefined) return res.status(400).json({ error: 'Missing value' });
      if (Buffer.byteLength(JSON.stringify(value)) > MAX_VALUE_BYTES) {
        return res.status(413).json({ error: 'Value too large' });
      }
      const r = await supabaseRequest(
        'POST', '/rest/v1/user_state?on_conflict=user_id,key',
        { user_id: userId, key, value, updated_at: new Date().toISOString() },
        ANON_KEY, token);
      if (r.status >= 400) return res.status(r.status).json({ error: r.body });
      const row = Array.isArray(r.body) ? r.body[0] : r.body;
      return res.status(200).json({ ok: true, updated_at: row && row.updated_at });
    }

    if (req.method === 'DELETE') {
      const key = (req.query && req.query.key) || '';
      if (!KEY_PATTERN.test(key)) return res.status(400).json({ error: 'Invalid key' });
      const r = await supabaseRequest(
        'DELETE', `/rest/v1/user_state?key=eq.${encodeURIComponent(key)}`, null, ANON_KEY, token);
      if (r.status >= 400) return res.status(r.status).json({ error: r.body });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
};
