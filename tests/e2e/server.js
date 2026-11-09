// Local stand-in for Netlify: serves the static site with Netlify-style
// pretty URLs, runs the real functions in netlify/functions against the
// in-memory fake Supabase, and plays the part of Supabase Storage for
// signed upload/view URLs. Used by journey.js; can also be run on its own
// (node tests/e2e/server.js) to click around locally.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };

function start(port) {
  process.env.FAKE_BASE_URL = 'http://127.0.0.1:' + port;
  const { fake, sentEmails } = require('../helpers/install-fakes');
  fake.baseUrl = process.env.FAKE_BASE_URL;
  const log = [];

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const body = Buffer.concat(chunks);
      try {
        // Functions
        const fm = /^\/\.netlify\/functions\/([a-z-]+)$/.exec(url.pathname);
        if (fm) {
          const file = path.join(ROOT, 'netlify', 'functions', fm[1] + '.js');
          if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
          const out = await require(file).handler({ httpMethod: req.method, headers: req.headers, body: body.toString('utf8'), path: url.pathname });
          log.push({ fn: fm[1], status: out.statusCode, body: out.body });
          res.writeHead(out.statusCode, out.headers || {});
          return res.end(out.body);
        }
        // Storage: direct upload to a signed URL, and signed view URLs
        const up = /^\/storage\/v1\/object\/upload\/sign\/([a-z-]+)\/(.+)$/.exec(url.pathname);
        if (up && req.method === 'PUT') {
          const ok = fake.putSigned(url.searchParams.get('token'), body, req.headers['content-type']);
          res.writeHead(ok ? 200 : 400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(ok ? { Key: up[1] + '/' + up[2] } : { error: 'bad token' }));
        }
        const view = /^\/storage\/v1\/object\/sign\/([a-z-]+)\/(.+)$/.exec(url.pathname);
        if (view) {
          const o = fake.objects[view[1] + '/' + decodeURIComponent(view[2])];
          if (!o) { res.writeHead(404); return res.end(); }
          res.writeHead(200, { 'Content-Type': o.contentType || 'image/jpeg' });
          return res.end(o.bytes);
        }
        // Static files with Netlify pretty URLs
        let p = decodeURIComponent(url.pathname);
        let file = path.join(ROOT, p);
        if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
        if (p.endsWith('/')) file = path.join(file, 'index.html');
        else if (!path.extname(p) && fs.existsSync(file + '.html')) file += '.html';
        if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
      } catch (err) {
        console.error(err);
        res.writeHead(500); res.end(String(err));
      }
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, fake, sentEmails, log, base: process.env.FAKE_BASE_URL })));
}

module.exports = { start };

if (require.main === module) {
  start(Number(process.env.PORT || 8888)).then(({ base }) => console.log('Listening on ' + base));
}
