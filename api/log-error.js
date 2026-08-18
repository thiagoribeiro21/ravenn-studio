export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const clip = (s, n) => (typeof s === 'string' ? s.slice(0, n) : s);

  console.error('[client-error]', {
    type: clip(body.type, 40),
    message: clip(body.message, 500),
    source: clip(body.source, 300),
    line: body.line,
    col: body.col,
    stack: clip(body.stack, 2000),
    url: clip(body.url, 300),
    ua: clip(body.ua, 300),
    ts: body.ts,
  });

  res.status(204).end();
}
