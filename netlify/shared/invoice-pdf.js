// Builds a one-page A4 invoice as a PDF, with no dependencies: it writes the
// PDF by hand using the standard Times and Helvetica fonts that every PDF
// reader has built in. Text outside the Latin-1 range is simplified
// (accents removed) because those built-in fonts can't show it.
const C = require('./client-config');

const W = 595.28, H = 841.89, M = 56;
const MAROON = [0.369, 0.165, 0.180], GOLD = [0.761, 0.639, 0.353], INK = [0.086, 0.125, 0.180], MUTED = [0.30, 0.36, 0.44];

// Approximate glyph widths (per 1000 em) for right-aligning and wrapping.
const WIDE = /[MWmw@%]/, MID = /[A-Z0-9#&$]/, NARROW = /[ilj.,:;'!|()\[\] ]/;
function textWidth(s, size) {
  let w = 0;
  for (const ch of s) w += /[0-9]/.test(ch) ? 500 : WIDE.test(ch) ? 900 : MID.test(ch) ? 680 : NARROW.test(ch) ? 260 : 480;
  return (w / 1000) * size;
}

function latin1(s) {
  return String(s == null ? '' : s)
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/\u2026/g, '...')
    .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
    .split('').map((ch) => {
      if (ch.charCodeAt(0) < 256) return ch;
      const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return base.length === 1 && base.charCodeAt(0) < 256 ? base : '?';
    }).join('');
}
function pdfStr(s) { return '(' + latin1(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[\r\n]/g, ' ') + ')'; }

function wrap(s, size, maxWidth) {
  const out = [];
  for (const para of String(s || '').split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/)) {
      const next = line ? line + ' ' + word : word;
      if (textWidth(latin1(next), size) > maxWidth && line) { out.push(line); line = word; } else line = next;
    }
    out.push(line);
  }
  return out;
}

function money(cents, currency) {
  const v = (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (currency || C.CURRENCY) + ' ' + v;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// inv: { number, issuedAt, dueAt, description, amountCents, currency, billTo: [lines], paymentDetails }
function buildInvoicePdf(inv) {
  const ops = [];
  const color = (c) => ops.push(c.join(' ') + ' rg');
  const stroke = (c) => ops.push(c.join(' ') + ' RG');
  const text = (x, y, s, font, size, c) => { color(c || INK); ops.push('BT /' + font + ' ' + size + ' Tf 1 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Tm ' + pdfStr(s) + ' Tj ET'); };
  const right = (xr, y, s, font, size, c) => text(xr - textWidth(latin1(s), size), y, s, font, size, c);
  const line = (x1, y1, x2, y2, c, w) => { stroke(c); ops.push((w || 0.6) + ' w ' + x1 + ' ' + y1 + ' m ' + x2 + ' ' + y2 + ' l S'); };

  let y = H - M - 10;
  text(M, y, 'HERITAGE UNION', 'F1', 18, MAROON);
  right(W - M, y, 'INVOICE', 'F1', 18, MAROON);
  y -= 14;
  line(M, y, W - M, y, GOLD, 1.2);
  y -= 26;

  const meta = [['Invoice number', inv.number], ['Date', fmtDate(inv.issuedAt)], ['Due by', fmtDate(inv.dueAt)]];
  let my = y;
  for (const [k, v] of meta) { right(W - M - 150, my, k, 'F3', 9, MUTED); text(W - M - 140, my, v, 'F2', 10.5); my -= 16; }

  text(M, y, 'BILL TO', 'F3', 9, MUTED);
  let by = y - 16;
  for (const l of inv.billTo.filter(Boolean)) for (const w of wrap(l, 10.5, 240)) { text(M, by, w, 'F2', 10.5); by -= 14; }
  y = Math.min(by, my) - 30;

  // Line items
  line(M, y + 14, W - M, y + 14, [0.87, 0.81, 0.70]);
  text(M, y, 'DESCRIPTION', 'F3', 9, MUTED);
  right(W - M, y, 'AMOUNT', 'F3', 9, MUTED);
  y -= 8;
  line(M, y, W - M, y, [0.87, 0.81, 0.70]);
  y -= 20;
  const descLines = wrap(inv.description, 11, 330);
  descLines.forEach((d, i) => text(M, y - i * 15, d, 'F2', 11));
  right(W - M, y, money(inv.amountCents, inv.currency), 'F2', 11);
  y -= descLines.length * 15 + 10;
  line(M, y, W - M, y, [0.87, 0.81, 0.70]);
  y -= 22;
  right(W - M - 150, y, 'Total due', 'F1', 12, MAROON);
  right(W - M, y, money(inv.amountCents, inv.currency), 'F1', 12, MAROON);
  y -= 42;

  // Payment
  text(M, y, 'PAYMENT BY ' + C.PAYMENT_METHOD.toUpperCase(), 'F3', 9, MUTED);
  y -= 18;
  for (const l of String(inv.paymentDetails || '').split('\n')) for (const w of wrap(l, 10.5, W - 2 * M)) { text(M, y, w, 'F2', 10.5); y -= 14; }
  text(M, y, 'Payment reference: ' + inv.number, 'F1', 10.5); y -= 28;
  for (const w of wrap('Please pay only by bank transfer to the account above, quoting the invoice number. Heritage Union will never ask you to pay anyone else or in any other way. If you receive such a request, do not pay and tell us at once.', 9, W - 2 * M)) { text(M, y, w, 'F2', 9, MUTED); y -= 12; }

  line(M, M + 26, W - M, M + 26, GOLD, 0.8);
  text(M, M + 10, 'Heritage Union  ·  team@heritage-union.com  ·  heritage-union.com', 'F2', 8.5, MUTED);

  const content = ops.join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>',
    '<< /Length ' + Buffer.byteLength(content, 'latin1') + ' >>\nstream\n' + content + '\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Title ' + pdfStr('Invoice ' + inv.number) + ' /Author (Heritage Union) /Producer (Heritage Union) >>',
  ];
  let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(Buffer.byteLength(out, 'latin1')); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
  const xref = Buffer.byteLength(out, 'latin1');
  out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R /Info 8 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  return Buffer.from(out, 'latin1');
}

module.exports = { buildInvoicePdf, money, fmtDate };
