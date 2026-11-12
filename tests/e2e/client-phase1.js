// Phase 1 client journey (enquiry -> payment) at 375 px and desktop, against
// tests/e2e/server.js running the real functions on the in-memory fake.
// Run: node tests/e2e/client-phase1.js
const assert = require('node:assert/strict');
const path = require('path');
const { chromium } = require('playwright');
const { start } = require('./server');
const { ROOT, MOBILE, DESKTOP, shooter, newContext, adminPage, waitFor, tokenFrom } = require('./helpers');

const SHOTS = process.env.SHOTS || path.join(ROOT, 'docs', 'pr-screenshots', 'client-phase-1');
const PORT = 8901;

(async () => {
  process.env.CLIENT_SIGNUPS_OPEN = 'true';
  process.env.INVOICE_PAYMENT_DETAILS = 'Account name: Heritage Union Ltd\nBank: Example Bank plc\nIBAN: GB00 EXAM 0000 0000 0000 00\nSWIFT/BIC: EXAMGB2L';
  delete process.env.TURNSTILE_SITE_KEY;
  const { server, fake, sentEmails, base } = await start(PORT);
  const CC = require('../../netlify/shared/client-common');
  const shot = shooter(SHOTS);
  const browser = await chromium.launch();
  const lastEmailTo = (to, re) => sentEmails.filter((m) => m.to === to && (!re || re.test(m.subject))).pop();
  try {
    // ------------------------------------------------------------ F1 enquiry
    console.log('F1 enquiry');
    for (const [label, vp] of [['375', MOBILE], ['desktop', DESKTOP]]) {
      const ctx = await newContext(browser, vp);
      const page = await ctx.newPage();
      await page.goto(base + '/contact');
      await page.addStyleTag({ content: '.site-nav { position: static !important; }' });
      await page.locator('#enquiry-form').scrollIntoViewIfNeeded();
      if (label === '375') {
        await page.check('input[name="iAm"][value="woman"]');
        assert.equal(await page.isVisible('#enq-woman'), true);
        assert.equal(await page.isHidden('#enq-fields'), true);
        await page.locator('#enquiry-wrap').screenshot({ path: path.join(SHOTS, '00-enquiry-woman-375.png') });
        await page.check('input[name="iAm"][value="client"]');
        await page.click('#enq-submit');
        assert.match(await page.textContent('#enq-error'), /full name/);
        await page.fill('#enq-name', 'Michael Thompson');
        await page.fill('#enq-email', 'michael@example.com');
        await page.fill('#enq-country', 'United Kingdom');
        await page.fill('#enq-age', '48');
        await page.fill('#enq-phone', '+44 7700 900123');
        await page.selectOption('#enq-source', 'search');
        await page.fill('#enq-message', 'I lost my wife some years ago and would like to talk about whether Heritage Union is right for me.');
        await page.check('#enq-consent');
        await page.locator('#enquiry-wrap').screenshot({ path: path.join(SHOTS, '01-enquiry-filled-375.png') });
        await page.click('#enq-submit');
        await page.locator('#enq-success').waitFor({ state: 'visible' });
        await page.locator('#enquiry-wrap').screenshot({ path: path.join(SHOTS, '02-enquiry-sent-375.png') });
        assert.equal(await page.isVisible('#calendly-embed'), true, 'Calendly embed kept');
      } else {
        await page.check('input[name="iAm"][value="client"]');
        await shot(page, 'contact-page-with-enquiry-form-desktop');
      }
      await ctx.close();
    }
    const client = fake.tables.clients[0];
    assert.equal(client.status, 'enquiry');
    assert.ok(lastEmailTo('michael@example.com', /Thank you for your enquiry/), 'R1 sent');

    // ------------------------------------------------------------ team: stage 2
    console.log('Team: call and invitation');
    let { ctx: actx, page: ap } = await adminPage(browser, MOBILE, base, fake, '#clients');
    await ap.locator('#ad-clients .ad-card').first().waitFor();
    await shot(ap, 'team-clients-new-enquiries-375');
    await ap.click('#ad-clients .ad-card');
    await ap.locator('h2:has-text("Next step")').waitFor();
    await shot(ap, 'team-client-enquiry-375');
    await ap.click('#ad-client-detail button:has-text("Call booked")');
    await ap.locator('.ad-badge--status:has-text("Call booked")').waitFor();
    await ap.click('#ad-client-detail button:has-text("Call held")');
    await ap.locator('.ad-badge--status:has-text("Call held")').waitFor();
    await ap.click('#ad-client-detail button:has-text("Invite to apply")');
    await ap.locator('#ad-modal').waitFor({ state: 'visible' });
    await shot(ap, 'team-invite-confirm-375', false);
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator('.ad-badge--status:has-text("Invited to apply")').waitFor();
    const r3 = lastEmailTo('michael@example.com', /invitation to apply/);
    assert.ok(r3 && r3.attachments.length === 1);
    let token = tokenFrom(r3.text);

    // ------------------------------------------------------------ client page: draft agreement state
    console.log('Client page');
    const cctx = await newContext(browser, MOBILE);
    const cp = await cctx.newPage();
    await cp.goto(base + '/client#t=' + token);
    await cp.locator('#cl-step-title').waitFor();
    assert.equal(new URL(cp.url()).hash, '', 'token removed from address bar');
    assert.equal(await cp.textContent('#cl-hello'), 'Welcome, Michael');
    await shot(cp, 'client-step1-application-empty');
    // Step 1
    await cp.click('#cl-next');
    assert.match(await cp.textContent('[data-f="legal_name"] .cl-error'), /Please answer/);
    await cp.fill('#f-legal_name', 'Michael James Thompson');
    await cp.fill('#f-date_of_birth', '1978-04-02');
    await cp.fill('#f-nationality', 'British');
    await cp.fill('#f-country', 'United Kingdom');
    await cp.fill('#f-city', 'Bristol');
    await cp.fill('#f-address', '14 Rose Lane\nBristol BS1 4AA');
    await cp.fill('#f-phone', '+44 7700 900123');
    await cp.fill('#f-email', 'michael@example.com');
    await cp.click('[data-f="preferred_contact"] .cl-chip[data-value="email"]');
    await cp.fill('#f-occupation', 'Civil engineer');
    await cp.click('[data-f="education"] .cl-chip[data-value="university"]');
    await cp.fill('#f-languages', 'English');
    await cp.selectOption('[data-f="languages"] select', 'native');
    await cp.click('[data-f="languages"] .cl-link-btn');
    await cp.locator('[data-f="languages"] .cl-lang-row').nth(1).locator('input').fill('French');
    await cp.locator('[data-f="languages"] .cl-lang-row').nth(1).locator('select').selectOption('basic');
    await cp.click('[data-f="marital_status"] .cl-chip[data-value="widowed"]');
    await cp.fill('#f-children_count', '1');
    assert.equal(await cp.isVisible('[data-f="children_details"]'), true);
    await cp.fill('#f-children_details', 'A daughter, 19, at university in Leeds.');
    await cp.click('[data-f="visited_vietnam"] .cl-chip[data-value="yes"]');
    await cp.fill('#f-visited_vietnam_details', 'Two weeks in Hanoi and Hoi An, 2019.');
    assert.equal(await cp.locator('input[type="file"]').count(), 0, 'no photo ID upload');
    await shot(cp, 'client-step1-application-filled');
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'Background declaration');
    assert.equal(fake.tables.clients[0].status, 'applying');
    assert.equal(fake.tables.clients[0].application.legal_name, 'Michael James Thompson');
    // Step 2
    await cp.click('[data-f="conviction"] .cl-chip[data-value="yes"]');
    await cp.fill('#f-conviction_details', 'Driving with excess alcohol, United Kingdom, 1999. Fined and disqualified for 12 months.');
    await cp.click('[data-f="protection_order"] .cl-chip[data-value="no"]');
    await cp.click('[data-f="domestic_violence"] .cl-chip[data-value="no"]');
    await cp.fill('#f-previous_marriages', '1');
    await cp.fill('#f-previous_marriages_details', '2002 to 2016. My wife passed away.');
    await cp.fill('#f-countries_lived', 'United Kingdom; Germany (2005 to 2007, for work)');
    await cp.click('[data-f="agency_or_visa"] .cl-chip[data-value="no"]');
    assert.equal(await cp.locator('input[type="file"]').count(), 0, 'no certificate upload');
    assert.match(await cp.textContent('.cl-sign-text'), /Heritage Union does not check it/);
    await cp.check('#f-legally_free');
    await cp.check('#decl-agree');
    await cp.fill('#decl-name', 'M Thompson');
    await cp.click('button:has-text("Sign my declaration")');
    await cp.waitForFunction(() => /exactly as in your application/.test(document.querySelector('.cl-sign .cl-error').textContent));
    await cp.fill('#decl-name', 'Michael James Thompson');
    await cp.click('button:has-text("Sign my declaration")');
    await cp.locator('.cl-signed').waitFor();
    await shot(cp, 'client-step2-declaration-signed');
    const row = fake.tables.clients[0];
    assert.equal(row.declaration_typed_name, 'Michael James Thompson');
    assert.ok(row.declaration_ip_hash && row.declaration_version);
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'Client agreement');
    await cp.locator('.cl-draft-banner').waitFor();
    assert.equal(await cp.isVisible('.cl-soon'), true, 'draft agreement shows "coming soon"');
    assert.equal(await cp.locator('#agr-agree').count(), 0, 'no accept box for a draft');
    await shot(cp, 'client-step3-agreement-draft-coming-soon');
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'Check and send');
    await cp.click('#cl-send');
    assert.match(await cp.textContent('.cl-form-error'), /isn't ready yet/);
    await shot(cp, 'client-step4-review-draft-agreement');

    // Final agreement (what James will publish): switch both files in this test.
    CC.AGREEMENT.version = 'FINAL-TEST-2027-01';
    await cctx.route('**/assets/data/client-agreement.html', (r) => r.fulfill({ contentType: 'text/html',
      body: '<article class="cl-agreement" data-version="FINAL-TEST-2027-01"><h2>Client Agreement</h2><p>(Test text standing in for the final agreement.)</p><p>1. Services. Heritage Union provides…</p></article>' }));
    await cp.reload();
    await cp.locator('#cl-step-title').waitFor();
    assert.equal(await cp.textContent('#cl-step-title'), 'Client agreement', 'returns at the first open step');
    await cp.check('#agr-agree');
    await cp.fill('#agr-name', 'Michael James Thompson');
    await cp.click('button:has-text("Accept the agreement")');
    await cp.locator('.cl-signed').waitFor();
    await shot(cp, 'client-step3-agreement-accepted');
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'Check and send');
    await shot(cp, 'client-step4-review');
    await cp.click('#cl-send');
    await cp.locator('.cl-timeline').waitFor();
    await shot(cp, 'client-application-received');
    assert.equal(fake.tables.clients[0].status, 'submitted');
    assert.ok(lastEmailTo('michael@example.com', /Application received/));

    // ------------------------------------------------------------ team: read, then invoice
    console.log('Team: read, then invoice');
    await ap.goto(base + '/admin/#clients');
    await ap.click('#ad-clients .ad-filter[data-filter="documents"]');
    await ap.locator('#ad-clients .ad-card').first().waitFor();
    await shot(ap, 'team-clients-to-read-375');
    await ap.click('#ad-clients .ad-card');
    await ap.locator('h2:has-text("Read his application")').waitFor();
    await shot(ap, 'team-client-read-application-and-declaration-375');
    await ap.click('button:has-text("I have read his application and declaration")');
    await ap.locator('#ad-client-detail .ad-badge--status:has-text("Ready to invoice")').waitFor();
    await ap.fill('#cl-inv-amount', '12000');
    await ap.fill('#cl-inv-desc', 'Concierge Initiation (founding member rate)');
    await ap.click('button:has-text("Create draft invoice")');
    await ap.locator('button:has-text("Send invoice (R7)")').waitFor();
    await shot(ap, 'team-client-invoice-draft-375');
    await ap.click('button:has-text("Send invoice (R7)")');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator('.ad-badge--status:has-text("Awaiting payment")').waitFor();
    const r7 = lastEmailTo('michael@example.com', /^Invoice HU-/);
    assert.ok(r7 && /USD 12,000\.00/.test(r7.text) && /IBAN: GB00 EXAM/.test(r7.text));
    require('fs').writeFileSync(path.join(SHOTS, 'invoice-sample.pdf'), Buffer.from(r7.attachments[0].content, 'base64'));

    // his page shows the invoice and downloads the PDF
    await cp.reload();
    await cp.locator('.cl-invoice').waitFor();
    const [download] = await Promise.all([cp.waitForEvent('download'), cp.click('.cl-invoice button')]);
    assert.match(download.suggestedFilename(), /^HU-\d{4}-0001\.pdf$/);
    await shot(cp, 'client-invoice-awaiting-payment');

    await ap.click('button:has-text("Mark payment received")');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator('.ad-badge--status:has-text("Active")').waitFor();
    await shot(ap, 'team-client-active-375');
    const r8 = lastEmailTo('michael@example.com', /Welcome to Heritage Union/);
    token = tokenFrom(r8.text);
    await cp.goto(base + '/client#t=' + token);
    await cp.locator('#cl-eyebrow:has-text("Your engagement")').waitFor();
    await cp.locator('#cl-view .cl-card').first().waitFor();
    assert.equal(await cp.textContent('#cl-eyebrow'), 'Your engagement');
    await shot(cp, 'client-active-welcome');
    await cctx.close();

    // desktop views of the team page and his page
    await actx.close();
    ({ ctx: actx, page: ap } = await adminPage(browser, DESKTOP, base, fake, '#clients'));
    await ap.click('#ad-clients .ad-filter[data-filter="all"]');
    await ap.locator('#ad-clients .ad-card').first().waitFor();
    await shot(ap, 'team-clients-all-desktop');
    await ap.goto(base + '/admin/#client-' + client.id);
    await ap.locator('h2:has-text("Timeline")').waitFor();
    await shot(ap, 'team-client-detail-desktop');
    await actx.close();
    const dctx = await newContext(browser, DESKTOP);
    const dp = await dctx.newPage();
    await dp.goto(base + '/client#t=' + token);
    await dp.locator('#cl-view .cl-card').first().waitFor();
    await shot(dp, 'client-active-desktop');
    // signups switched off: polite message
    process.env.CLIENT_SIGNUPS_OPEN = 'false';
    await dp.reload();
    await dp.locator('#cl-message').waitFor({ state: 'visible' });
    assert.match(await dp.textContent('#cl-message'), /isn't available yet/);
    await shot(dp, 'client-page-signups-closed-desktop');
    process.env.CLIENT_SIGNUPS_OPEN = 'true';
    await dctx.close();

    // No team email contains personal details
    for (const m of sentEmails.filter((e) => Array.isArray(e.to) || /heritage-union\.com$/.test(e.to))) {
      for (const s of ['Michael', 'Thompson', 'example.com', 'Bristol']) assert.ok(!(m.subject + m.html + m.text).includes(s), 'team email leaks ' + s);
    }
    console.log('\nPhase 1 e2e passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => { console.error(err); process.exit(1); });
