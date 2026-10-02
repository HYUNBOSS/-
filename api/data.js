const { cmd, parseHash } = require('../lib/redis');
module.exports = async (req, res) => {
  try {
    const [rq, st, se] = await Promise.all([
      cmd(['HGETALL', 'requests']), cmd(['HGETALL', 'stamps']), cmd(['GET', 'settings']),
    ]);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ requests: parseHash(rq), stamps: parseHash(st), settings: se ? JSON.parse(se) : null });
  } catch (e) {
    res.status(500).json({ error: 'db' });
  }
};
