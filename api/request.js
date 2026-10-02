const { cmd, key } = require('../lib/redis');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  try {
    const b = req.body || {};
    const name = String(b.name || '').trim().slice(0, 20);
    const memo = String(b.memo || '').trim().slice(0, 40);
    const kind = b.kind === '벙주' ? '벙주' : '벙참';
    if (!name || !memo) return res.status(400).json({ ok: false });
    const n = await cmd(['HLEN', 'requests']);
    if (n >= 300) return res.status(429).json({ ok: false });
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const rec = { id, memberId: key(name), name, memo, kind, ts: Date.now() };
    await cmd(['HSET', 'requests', id, JSON.stringify(rec)]);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
};
