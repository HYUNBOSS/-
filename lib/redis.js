const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function cmd(args) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: JSON.stringify(args),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
function parseHash(arr) {
  const out = [];
  for (let i = 0; i < (arr || []).length; i += 2) out.push(JSON.parse(arr[i + 1]));
  return out;
}
const key = (n) => String(n || '').trim().replace(/\s+/g, ' ').toLowerCase();
module.exports = { cmd, parseHash, key };
