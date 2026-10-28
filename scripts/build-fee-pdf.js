#!/usr/bin/env node
// Builds the fee structure PDF from docs/fee-structure/fee-structure.html
// and writes the same bytes to both locations that use it:
//   assets/documents/heritage-union-fee-structure.pdf          (site download)
//   netlify/functions/assets/heritage-union-fee-structure.pdf  (emailed attachment)
//
// Usage: npm run build:fee-pdf
// Needs Playwright with Chromium (`npm install` then `npx playwright install chromium`).

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'docs', 'fee-structure', 'fee-structure.html');
const OUTPUTS = [
  path.join(ROOT, 'assets', 'documents', 'heritage-union-fee-structure.pdf'),
  path.join(ROOT, 'netlify', 'functions', 'assets', 'heritage-union-fee-structure.pdf'),
];
const MAX_BYTES = 1024 * 1024; // sent as an email attachment

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (err) {
    console.error('Playwright is not installed. Run `npm install` and `npx playwright install chromium`.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(SOURCE).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    const missing = await page.evaluate(() =>
      ['Cormorant Garamond', 'Spectral'].filter((f) => !document.fonts.check('12px "' + f + '"'))
    );
    if (missing.length) throw new Error('Fonts failed to load: ' + missing.join(', '));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    if (pdf.length > MAX_BYTES) {
      throw new Error('PDF is ' + Math.round(pdf.length / 1024) + ' KB; keep it under 1 MB for email.');
    }

    for (const out of OUTPUTS) {
      fs.writeFileSync(out, pdf);
      console.log('Wrote ' + path.relative(ROOT, out) + ' (' + Math.round(pdf.length / 1024) + ' KB)');
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
