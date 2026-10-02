const { cmd } = require('../lib/redis');
const num = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const b = req.body || {};
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return res.status(500).json({ ok: false, error: 'ADMIN_PASSWORD not set' });
  if (String(b.password || '') !== real) {
    await new Promise((r) => setTimeout(r, 500));
    return res.status(401).json({ ok: false });
  }
  try {
    const id = String(b.id || '');
    if (b.action === 'verify') return res.status(200).json({ ok: true });
    if (b.action === 'approve') {
      const raw = await cmd(['HGET', 'requests', id]);
      if (!raw) return res.status(404).json({ ok: false });
      const rec = JSON.parse(raw);
      await cmd(['HSET', 'stamps', id, JSON.stringify({ ...rec, reqTs: rec.ts, ts: Date.now() })]);
      await cmd(['HDEL', 'requests', id]);
    } else if (b.action === 'reject') {
      await cmd(['HDEL', 'requests', id]);
    } else if (b.action === 'delStamp') {
      await cmd(['HDEL', 'stamps', id]);
    } else if (b.action === 'settings') {
      const s = b.settings || {};
      const v = { zoom: num(s.zoom, 100, 250, 100), x: num(s.x, 0, 100, 50), y: num(s.y, 0, 100, 50), rot: num(s.rot, -30, 30, 8) };
      await cmd(['SET', 'settings', JSON.stringify(v)]);
    } else {
      return res.status(400).json({ ok: false });
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
};
