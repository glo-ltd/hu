// Loads the fee-structure PDF that is attached to R2 (fee request) and R3
// (invite to apply). Functions are bundled with esbuild, which does not pack
// files read from disk, so netlify.toml includes netlify/functions/assets/**
// and this looks in every place the file can land once deployed. Returns a
// Buffer, or null (logged) so callers can answer with a proper error instead
// of crashing.
const fs = require('fs');
const path = require('path');

const NAME = 'heritage-union-fee-structure.pdf';
let cached = null;

function candidates() {
  const list = [
    path.join(__dirname, 'assets', NAME),
    path.join(__dirname, '..', 'functions', 'assets', NAME),
    path.join(process.cwd(), 'netlify', 'functions', 'assets', NAME),
  ];
  if (process.env.LAMBDA_TASK_ROOT) list.push(path.join(process.env.LAMBDA_TASK_ROOT, 'netlify', 'functions', 'assets', NAME));
  return list;
}

function loadFeePdf() {
  if (cached) return cached;
  for (const p of candidates()) {
    try {
      if (fs.existsSync(p)) { cached = fs.readFileSync(p); return cached; }
    } catch (e) { /* try the next place */ }
  }
  console.error('Fee structure PDF not found. Looked in: ' + candidates().join(', '));
  return null;
}

function feePdfAttachment() {
  const buf = loadFeePdf();
  return buf ? [{ filename: 'Heritage-Union-Fee-Structure.pdf', content: buf.toString('base64') }] : null;
}

module.exports = { loadFeePdf, feePdfAttachment };
