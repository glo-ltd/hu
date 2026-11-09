// Shared Playwright helpers for the client journeys.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 900 };

function shooter(dir) {
  let n = 0;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  return async function shot(page, name, full) {
    const file = path.join(dir, String(++n).padStart(2, '0') + '-' + name + '.png');
    await page.screenshot({ path: file, fullPage: full !== false });
    console.log('  screenshot', path.relative(ROOT, file));
  };
}

async function newContext(browser, viewport, locale) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: locale || 'en-GB', reducedMotion: 'reduce', acceptDownloads: true });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.route(/challenges\.cloudflare\.com|assets\.calendly\.com|calendly\.com/, (r) => r.abort());
  await ctx.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js', (r) =>
    r.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' },
      body: fs.readFileSync(path.join(ROOT, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js')) }));
  await ctx.route('https://fake.supabase.co/**', (r) => r.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));
  return ctx;
}

// Signs a page into /admin/ as a team member with a stored Supabase session.
async function adminPage(browser, viewport, base, fake, hash) {
  const ctx = await newContext(browser, viewport);
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  const jwt = 'jwt-admin-' + Math.random().toString(36).slice(2);
  fake.users[jwt] = { email: 'james@heritage-union.com' };
  await page.goto(base + '/admin/');
  await page.evaluate((jwt) => {
    localStorage.setItem('sb-fake-auth-token', JSON.stringify({ access_token: jwt, refresh_token: 'r', token_type: 'bearer', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u1', email: 'james@heritage-union.com', aud: 'authenticated', role: 'authenticated' } }));
  }, jwt);
  await page.goto(base + '/admin/' + (hash || ''));
  await page.reload();
  await page.locator('#ad-tabs').waitFor({ state: 'visible' });
  return { ctx, page };
}

async function waitFor(fn, ms) {
  const until = Date.now() + (ms || 10000);
  while (Date.now() < until) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 100)); }
  throw new Error('timed out waiting');
}

function tokenFrom(text) {
  const m = /#t=([A-Za-z0-9_-]{43})/.exec(text);
  return m && m[1];
}

module.exports = { ROOT, MOBILE, DESKTOP, shooter, newContext, adminPage, waitFor, tokenFrom };
