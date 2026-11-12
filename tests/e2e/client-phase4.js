// Phase 4 journey (automation and closing) at 375 px and desktop: the
// concern form (English and Vietnamese), concerns on the team page, pause,
// the daily job's 12-month flag and Zalo reminder, closing with relationship
// success, the feedback form, and rendered samples of key emails.
// Run: node tests/e2e/client-phase4.js
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { start } = require('./server');
const { ROOT, MOBILE, DESKTOP, shooter, newContext, adminPage, tokenFrom } = require('./helpers');

const SHOTS = process.env.SHOTS || path.join(ROOT, 'docs', 'pr-screenshots', 'client-phase-4');
const PORT = 8904;
const DAY = 86400000;
const ago = (d) => new Date(Date.now() - d * DAY).toISOString();

(async () => {
  process.env.CLIENT_SIGNUPS_OPEN = 'true';
  process.env.INVOICE_PAYMENT_DETAILS = 'Account name: Heritage Union Ltd\nBank: Example Bank plc\nIBAN: GB00 EXAM 0000 0000 0000 00\nSWIFT/BIC: EXAMGB2L';
  delete process.env.TURNSTILE_SITE_KEY;
  const { server, fake, sentEmails, base } = await start(PORT);
  const S = require('../helpers/client-seed');
  const P = require('../../netlify/shared/profile-common');
  const shot = shooter(SHOTS);
  const browser = await chromium.launch();
  try {
    // ------------------------------------------------------------ concern form
    console.log('Concern form');
    for (const [lang, url] of [['en', '/contact?concern=1'], ['vi', '/vi/contact?concern=1']]) {
      const ctx = await newContext(browser, MOBILE, lang === 'vi' ? 'vi-VN' : 'en-GB');
      const page = await ctx.newPage();
      await page.goto(base + url);
      await page.addStyleTag({ content: '.site-nav { position: static !important; }' });
      await page.locator('#concern-form').waitFor();
      assert.equal(await page.isHidden(lang === 'en' ? '#enquiry-form' : 'form[name="contact-vi"]'), true, 'ordinary form hidden');
      await page.selectOption('#cn-about', 'client');
      await page.selectOption('#cn-role', lang === 'en' ? 'client' : 'candidate');
      await page.fill('#cn-subject', lang === 'en' ? 'Reference C-1234' : 'Michael');
      await page.fill('#cn-message', lang === 'en' ? 'I would like to raise something about my introduction.' : 'Anh ấy hỏi tôi có thể gửi tiền cho anh ấy không.');
      await page.fill('#cn-contact', lang === 'en' ? 'someone@example.com' : '0912345678');
      await page.locator('#concern-form').screenshot({ path: path.join(SHOTS, 'e0' + (lang === 'en' ? '1' : '2') + '-concern-form-' + lang + '-375.png') });
      await page.click('#cn-send');
      await page.locator('.concern-done').waitFor();
      await ctx.close();
    }
    assert.equal(fake.tables.concerns.length, 2);
    const plain = await newContext(browser, MOBILE);
    const pp = await plain.newPage();
    await pp.goto(base + '/contact');
    assert.ok(await pp.locator('a[href="/contact?concern=1"]').count(), 'link to the concern form');
    await plain.close();

    // ------------------------------------------------------------ an active client, 12 months on, with an open request
    const client = S.activeClient({ engagement_starts_at: ago(366), engagement_ends_at: ago(1), paid_at: ago(366) });
    fake.tables.client_profiles.push({ client_id: client.id, questions_version: 'x', display_name: 'Michael', photo_paths: [], answers: {}, submitted_at: ago(300), summary_html: '<p>x</p>', summary_approved_at: ago(299), summary_vi_html: '<p>x</p>', declaration_vi: {} });
    const hoa = S.seedWoman({ email: null }, { display_name: 'Hoa' });
    const lan = S.seedWoman({ zalo_number: '0933333333' }, { display_name: 'Lan' });
    fake.tables.introductions.push({ id: crypto.randomUUID(), client_id: client.id, candidate_id: lan.id, rank: 1, is_replacement: false, status: 'introduced', status_changed_at: ago(120), introduced_at: ago(120), created_at: ago(150), updated_at: ago(120) });
    fake.tables.introductions.push({ id: crypto.randomUUID(), client_id: client.id, candidate_id: hoa.id, rank: 2, is_replacement: true, status: 'sent', status_changed_at: ago(15), sent_at: ago(15),
      decision_token_hash: 'x', decision_token_expires_at: new Date(Date.now() + 15 * DAY).toISOString(), created_at: ago(16), updated_at: ago(15) });
    const out = await require('../../netlify/functions/daily-tasks').run(P.serviceClient());
    console.log('  daily-tasks:', JSON.stringify(out));
    assert.equal(out.remindersByZalo, 1); assert.equal(out.flagged, 1); assert.equal(out.checkins, 1);

    // ------------------------------------------------------------ team: concerns, pause, reminder, closing
    console.log('Team');
    let { ctx: actx, page: ap } = await adminPage(browser, MOBILE, base, fake, '#clients');
    await ap.locator('#cl-concerns-link').waitFor({ state: 'visible' });
    assert.match(await ap.textContent('#cl-concerns-link'), /2 open concerns/);
    await ap.click('#ad-clients .ad-filter[data-filter="active"]');
    await ap.locator('#ad-clients .ad-badge--danger:has-text("12 months reached")').waitFor();
    await shot(ap, 'team-clients-concerns-banner-and-12-month-flag-375');
    await ap.click('#cl-concerns-link');
    await ap.locator('.cl-concern').first().waitFor();
    await ap.locator('.cl-concern').nth(0).locator('select').selectOption(client.id);
    await shot(ap, 'team-concerns-375');
    await ap.goto(base + '/admin/#client-' + client.id);
    await ap.locator('h2:has-text("Engagement")').waitFor();
    await ap.click('button:has-text("Pause (after a concern)")');
    await ap.click('.ad-modal-box .btn--danger');
    await ap.locator('#ad-client-detail .ad-badge--status:has-text("Paused")').waitFor();
    // his page while paused
    const cctx = await newContext(browser, MOBILE);
    const cp = await cctx.newPage();
    await cp.goto(base + '/client#t=' + client.token);
    await cp.locator('h2:has-text("Paused")').waitFor();
    await shot(cp, 'client-paused');
    await cctx.close();
    await ap.click('button:has-text("Unpause")');
    await ap.locator('#ad-client-detail .ad-badge--status:has-text("Active")').waitFor();
    // Zalo reminder for the woman without email
    await ap.click('.cl-introrow button:has-text("Copy 14-day reminder for Zalo")');
    await ap.locator('.cl-copy').waitFor();
    assert.match(await ap.inputValue('.ad-copybox'), /^Chào Hoa,/);
    await ap.locator('.ad-section:has(h2:has-text("Introductions"))').screenshot({ path: path.join(SHOTS, 'e03-team-zalo-reminder-375.png') });
    await ap.locator('.ad-section:has(h2:has-text("Engagement"))').screenshot({ path: path.join(SHOTS, 'e04-team-engagement-12-months-375.png') });
    await ap.click('button:has-text("Relationship success…")');
    await ap.fill('#cl-honour', '8000');
    await shot(ap, 'team-relationship-success-confirm-375', false);
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator('#ad-client-detail .ad-badge--status:has-text("Closed")').waitFor();
    assert.equal(fake.tables.introductions.find((x) => x.candidate_id === hoa.id).status, 'cancelled');
    const r19 = sentEmails.filter((m) => /^Congratulations/.test(m.subject)).pop();
    assert.ok(r19 && /USD 8,000\.00/.test(r19.text));
    fs.writeFileSync(path.join(SHOTS, 'honour-invoice-sample.pdf'), Buffer.from(r19.attachments[0].content, 'base64'));
    await actx.close();
    ({ ctx: actx, page: ap } = await adminPage(browser, DESKTOP, base, fake, '#client-' + client.id));
    await ap.locator('h2:has-text("Engagement")').waitFor();
    await shot(ap, 'team-client-closed-desktop');

    // ------------------------------------------------------------ feedback
    console.log('Feedback');
    const r21 = sentEmails.filter((m) => /share your thoughts/.test(m.subject)).pop();
    const fctx = await newContext(browser, MOBILE);
    const fp = await fctx.newPage();
    await fp.goto(base + '/feedback#t=' + tokenFrom(r21.text));
    await fp.locator('#fb-form').waitFor({ state: 'visible' });
    await fp.click('.fb-star:has-text("5")');
    await fp.fill('#fb-comments', 'James and Huyen were patient, honest and kind from the first call. Thank you both.');
    await fp.check('#fb-p-first_name_country');
    await fp.click('#fb-send');
    assert.match(await fp.textContent('#fb-error'), /written permission/);
    await fp.check('#fb-agree');
    await shot(fp, 'feedback-form');
    await fp.click('#fb-send');
    await fp.locator('#fb-done').waitFor({ state: 'visible' });
    assert.equal(fake.tables.client_feedback[0].publish_permission, 'first_name_country');
    await fctx.close();
    await ap.reload();
    await ap.locator('.ad-section:has(h2:has-text("Engagement")) .ad-badge--ok:has-text("May publish")').waitFor();
    await ap.locator('.ad-section:has(h2:has-text("Engagement"))').screenshot({ path: path.join(SHOTS, 'e05-team-feedback-desktop.png') });
    await actx.close();

    // ------------------------------------------------------------ sample emails, as they look on a phone
    console.log('Sample emails');
    const E = require('../../netlify/shared/emails');
    const samples = [['R1', E.R1.build(E.R1.sample)], ['R7', E.R7.build(E.R7.sample)], ['R13-vi', E.R13.build(E.R13.variants.vi.sample)], ['R16-vi', E.R16.build(E.R16.variants.vi.sample)], ['R19', E.R19.build(E.R19.sample)]];
    const ectx = await newContext(browser, MOBILE);
    const ep = await ectx.newPage();
    for (const [name, m] of samples) {
      await ep.setContent(m.html);
      await ep.screenshot({ path: path.join(SHOTS, 'email-' + name + '-375.png'), fullPage: true });
    }
    await ectx.close();

    for (const m of sentEmails.filter((e) => Array.isArray(e.to))) for (const x of ['Michael', 'Hoa', 'tiền', '0912345678', 'example']) assert.ok(!(m.subject + m.text).includes(x), 'team email leaks ' + x);
    console.log('\nPhase 4 e2e passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => { console.error(err); process.exit(1); });
