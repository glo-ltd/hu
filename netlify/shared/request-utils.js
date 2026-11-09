// Small helpers shared by the public forms: IP hashing (never store a raw
// IP), Cloudflare Turnstile verification, HTML escaping and JSON responses.
const crypto = require('crypto');

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
}

function parseBody(event) {
  try {
    const data = JSON.parse(event.body || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch (err) {
    return null;
  }
}

function clientIp(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || h['client-ip'] || String(h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

function ipHash(event) {
  return crypto.createHash('sha256').update(clientIp(event)).digest('hex');
}

function turnstileConfigured() {
  return !!(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET);
}

async function verifyTurnstile(token, event) {
  if (!process.env.TURNSTILE_SECRET || !token) return false;
  try {
    const params = new URLSearchParams();
    params.append('secret', process.env.TURNSTILE_SECRET);
    params.append('response', token);
    const ip = clientIp(event);
    if (ip !== 'unknown') params.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const out = await res.json();
    return !!out.success;
  } catch (err) {
    console.error('Turnstile verification threw:', err);
    return false;
  }
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanText(v, max) {
  return typeof v === 'string' ? v.normalize('NFC').trim().slice(0, max) : '';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = { json, parseBody, clientIp, ipHash, turnstileConfigured, verifyTurnstile, escapeHtml, cleanText, EMAIL_PATTERN };
