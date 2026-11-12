// Phase 2 journey (his profile -> his 5 choices) at 375 px and desktop,
// plus the new "other languages" question on the women's form (VI and EN).
// Run: node tests/e2e/client-phase2.js
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { start } = require('./server');
const { ROOT, MOBILE, DESKTOP, shooter, newContext, adminPage, tokenFrom } = require('./helpers');

const SHOTS = process.env.SHOTS || path.join(ROOT, 'docs', 'pr-screenshots', 'client-phase-2');
const PORT = 8902;

(async () => {
  process.env.CLIENT_SIGNUPS_OPEN = 'true';
  const { server, fake, sentEmails, base } = await start(PORT);
  const S = require('../helpers/client-seed');
  const P = require('../../netlify/shared/profile-common');
  const shot = shooter(SHOTS);
  const browser = await chromium.launch();
  const last = (re) => sentEmails.filter((m) => re.test(m.subject)).pop();
  try {
    // ------------------------------------------------------------ women
    const names = [['Hoa', 'Huế', '1990-03-02'], ['Lan', 'Đà Nẵng', '1987-07-15'], ['Mai', 'Cần Thơ', '1992-11-20'], ['Thu', 'Hà Nội', '1985-01-09'], ['Ngọc', 'TP. Hồ Chí Minh', '1995-06-30'], ['Linh', 'Hải Phòng', '1983-09-12']];
    const women = names.map((n, i) => {
      const photo = crypto.randomUUID();
      const w = S.seedWoman({ zalo_number: '09' + String(10000000 + i), date_of_birth: n[2], created_at: new Date(Date.now() - (60 - i) * 86400000).toISOString() }, {
        display_name: n[0],
        photo_paths: [],
        consent_photo_sharing_at: i === 3 ? null : new Date().toISOString(),
        translations: { occupation: ['Teacher', 'Nurse', 'Accountant', 'Tailor', 'Pharmacist', 'Shop owner'][i], partner_matters: 'Someone honest and kind, who values family.', about: 'I love cooking for my family and walking by the river in the evening.' },
        answers: Object.assign({}, {
          province: n[1], occupation: 'x', education: ['university', 'college', 'university', 'vocational', 'postgraduate', 'secondary'][i],
          english_level: ['conversational', 'basic', 'fluent', 'none', 'conversational', 'basic'][i], marital_history: i === 5 ? 'divorced' : 'never_married',
          children: i === 5 ? 1 : 0, children_live_with: i === 5 ? 'yes' : undefined, wants_children: 'open', smoking: 'never', drinking: 'never',
          values: ['family', 'honesty', 'kindness'], open_to_abroad: i === 1 ? 'prefer_vietnam' : 'yes', household_finances: 'decide_together',
          supports_family: 'sometimes', partner_age_range: [35, 55], partner_matters: 'Một người trung thực.', about: 'Tôi thích nấu ăn.',
          other_languages: i === 2 ? [{ language: 'french', level: 'conversational' }] : undefined,
        }),
      });
      w.prof.answers.children_live_with === undefined && delete w.prof.answers.children_live_with;
      const fp = fake.tables.candidate_profiles.find((x) => x.candidate_id === w.id);
      Object.keys(fp.answers).forEach((k) => fp.answers[k] === undefined && delete fp.answers[k]);
      fp.photo_paths = [w.id + '/' + photo + '.jpg'];
      fake.addObject(fp.photo_paths[0], fs.readFileSync(path.join(__dirname, 'fixture-person-' + (i + 1) + '.jpg')));
      return w;
    });

    // ------------------------------------------------------------ candidate form: other languages
    console.log('Women\'s form: other languages');
    for (const [lang, url] of [['vi', '/vi/ho-so'], ['en', '/my-profile']]) {
      const ctx = await newContext(browser, MOBILE);
      const page = await ctx.newPage();
      await page.goto(base + url + '#t=' + women[0].token);
      await page.locator('#pf-step-count').waitFor();
      if (await page.locator('.pf-review-head button').count()) await page.locator('.pf-review-head button').first().click();
      await page.locator('[data-q="other_languages"]').waitFor();
      await page.click('[data-q="other_languages"] .pf-lang-add');
      await page.selectOption('[data-q="other_languages"] .pf-lang-row select >> nth=0', 'chinese');
      await page.selectOption('[data-q="other_languages"] .pf-lang-row select >> nth=1', 'fluent');
      await page.click('[data-q="other_languages"] .pf-lang-add');
      await page.selectOption('[data-q="other_languages"] .pf-lang-row >> nth=1 >> select >> nth=0', 'other');
      await page.fill('[data-q="other_languages"] .pf-lang-other', lang === 'vi' ? 'Tiếng Thái' : 'Thai');
      await page.selectOption('[data-q="other_languages"] .pf-lang-row >> nth=1 >> select >> nth=1', 'basic');
      await page.locator('[data-q="other_languages"]').scrollIntoViewIfNeeded();
      await page.locator('[data-q="english_level"]').screenshot({ path: path.join(SHOTS, '00-women-form-' + lang + '-english-level.png') });
      await page.locator('[data-q="other_languages"]').screenshot({ path: path.join(SHOTS, '00-women-form-' + lang + '-other-languages.png') });
      await ctx.close();
    }

    // ------------------------------------------------------------ his profile (F4)
    console.log('F4 his profile');
    const client = S.activeClient();
    const cctx = await newContext(browser, MOBILE);
    const cp = await cctx.newPage();
    await cp.goto(base + '/client#t=' + client.token);
    await cp.locator('#cl-step-title').waitFor();
    assert.equal(await cp.textContent('#cl-step-title'), 'About you');
    assert.equal(await cp.inputValue('#q-display_name'), 'Michael', 'prefilled from his application');
    await shot(cp, 'client-f4-step1-about-you-prefilled');
    await cp.click('[data-f="education"] .cl-chip[data-value="university"]');
    await cp.selectOption('[data-f="languages"] .cl-lang-row >> nth=0 >> select >> nth=0', 'english').catch(() => {});
    await cp.selectOption('[data-f="languages"] .cl-lang-row >> nth=0 >> select >> nth=1', 'native');
    await cp.click('[data-f="marital_history"] .cl-chip[data-value="widowed"]');
    await cp.fill('#q-children', '1');
    await cp.click('[data-f="children_live_with"] .cl-chip[data-value="no"]');
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'Family and values');
    await cp.click('[data-f="wants_children"] .cl-chip[data-value="open"]');
    await cp.click('[data-f="smoking"] .cl-chip[data-value="never"]');
    await cp.click('[data-f="drinking"] .cl-chip[data-value="socially"]');
    for (const v of ['family', 'honesty', 'kindness']) await cp.click('[data-f="values"] .cl-chip[data-value="' + v + '"]');
    assert.equal(await cp.isDisabled('[data-f="values"] .cl-chip[data-value="humour"]'), true);
    await shot(cp, 'client-f4-step2-family-values');
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'The future');
    await cp.click('[data-f="where_live"] .cl-chip[data-value="my_country"]');
    await cp.click('[data-f="household_finances"] .cl-chip[data-value="decide_together"]');
    await cp.click('[data-f="parents_support_view"] .cl-chip[data-value="happy"]');
    await shot(cp, 'client-f4-step3-future');
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'What you\'re looking for');
    await cp.fill('#q-her_age_range', '32');
    await cp.locator('[data-f="her_age_range"] input').nth(1).fill('45');
    await cp.click('[data-f="must_languages"] .cl-link-btn');
    await cp.selectOption('[data-f="must_languages"] .cl-lang-row select >> nth=0', 'english');
    await cp.selectOption('[data-f="must_languages"] .cl-lang-row select >> nth=1', 'conversational');
    await cp.click('[data-f="min_education"] .cl-chip[data-value="college"]');
    await cp.click('[data-f="children_accepted"] .cl-chip[data-value="one"]');
    await cp.fill('#q-partner_matters', 'Kindness, honesty and a sense of humour. Someone who loves family life and would enjoy building a home together.');
    await shot(cp, 'client-f4-step4-looking-for');
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'Your photos');
    await cp.click('#cl-next');
    assert.match(await cp.textContent('.cl-form-error'), /at least one photo/);
    await cp.setInputFiles('#cl-photo-input', path.join(__dirname, 'fixture-exif-gps.jpg'));
    await cp.waitForFunction(() => document.querySelectorAll('.cl-photo img').length === 1);
    const stored = fake.tables.client_profiles[0].photo_paths[0];
    const bytes = fake.objects['client-documents/' + stored].bytes;
    assert.ok(!bytes.includes(Buffer.from('Exif')), 'his photo has no EXIF/GPS');
    await cp.setInputFiles('#cl-photo-input', path.join(__dirname, 'fixture-person-2.jpg'));
    await cp.waitForFunction(() => document.querySelectorAll('.cl-photo img').length === 2);
    await shot(cp, 'client-f4-step5-photos');
    await cp.click('#cl-next');
    await cp.waitForFunction(() => document.getElementById('cl-step-title').textContent === 'Your message, then send');
    await cp.fill('#q-message', 'Hello. Thank you for reading my profile. I would be glad to get to know you, at whatever pace feels right to you.');
    await shot(cp, 'client-f4-step6-message-and-review');
    await cp.click('#cl-next');
    await cp.locator('h2:has-text("James is writing your summary")').waitFor();
    await shot(cp, 'client-waiting-for-summary');

    // ------------------------------------------------------------ team: summary and translations
    console.log('Team: summary and translations');
    let { ctx: actx, page: ap } = await adminPage(browser, MOBILE, base, fake, '#client-' + client.id);
    await ap.locator('h2:has-text("Profile summary")').waitFor();
    await ap.click('button:has-text("Insert key facts")');
    await ap.locator('#cl-summary-editor').click();
    await ap.keyboard.press('Control+End');
    await ap.keyboard.type(' Michael lost his wife in 2016. He is warm, patient and close to his daughter, and hopes to share a calm, family-centred life.');
    await ap.locator('.ad-section:has(h2:has-text("Profile summary"))').screenshot({ path: path.join(SHOTS, '02-team-summary-editor-375.png') });
    await ap.click('button:has-text("Save and send for approval")');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator('text=Sent to him for approval').waitFor();
    const r9 = last(/ready to approve/);
    // Huyen's translations
    await ap.locator('.ad-section:has(h2:has-text("Vietnamese translations")) textarea').first().fill('Michael là kỹ sư xây dựng, 48 tuổi, sống ở Bristol, Vương quốc Anh. Anh ấy nói tiếng Anh (bản ngữ).');
    const declBoxes = ap.locator('.ad-section:has(h2:has-text("Vietnamese translations")) .cl-pair textarea');
    const n = await declBoxes.count();
    for (let i = 1; i < n - 1; i++) await declBoxes.nth(i).fill('Không');
    await declBoxes.nth(n - 1).fill('Xin chào. Cảm ơn bạn đã đọc hồ sơ của tôi.');
    await ap.click('button:has-text("Save translations")');
    await ap.locator('text=Last saved by james@heritage-union.com').waitFor();
    await shot(ap, 'team-client-profile-summary-translations-375');

    // ------------------------------------------------------------ client: summary approval
    console.log('Client: summary');
    await cp.goto(base + '/client#t=' + tokenFrom(r9.text));
    await cp.locator('.cl-summary').waitFor();
    await shot(cp, 'client-summary-to-approve');
    await cp.click('button:has-text("Ask for changes")');
    await cp.fill('#cl-changes', 'Could you mention that I love hiking and cooking?');
    await shot(cp, 'client-summary-ask-for-changes', false);
    await cp.click('button:has-text("Send my comments")');
    await cp.locator('h2:has-text("Your summary is being revised")').waitFor();
    await ap.reload();
    await ap.locator('blockquote.cl-quote').waitFor();
    await ap.locator('#cl-summary-editor').click();
    await ap.keyboard.press('Control+End');
    await ap.keyboard.type(' He loves hiking and cooking.');
    await ap.click('button:has-text("Save and send for approval")');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator('text=Sent to him for approval').waitFor();
    await cp.goto(base + '/client#t=' + tokenFrom(last(/ready to approve/).text));
    await cp.locator('.cl-summary').waitFor();
    await cp.click('#cl-approve');
    await cp.locator('h2:has-text("Your profiles are being prepared")').waitFor();
    await shot(cp, 'client-approved-profiles-being-prepared');
    assert.ok(last(/your profile is approved/));

    // ------------------------------------------------------------ team: matching
    console.log('Team: matching');
    await ap.goto(base + '/admin/#client-' + client.id + '/matching');
    await ap.locator('.cl-match').first().waitFor();
    await shot(ap, 'team-matching-375');
    await ap.click('.ad-filter:has-text("Matches all")');
    const matchesAll = await ap.locator('.cl-match').count();
    assert.ok(matchesAll >= 2 && matchesAll < women.length, 'filter narrows the list: ' + matchesAll);
    await ap.click('.ad-filter:has-text("Matches all")');
    for (const w of [women[0], women[2], women[3], women[4]]) await ap.check('#pick-' + w.id);
    await ap.locator('.cl-sendbar').screenshot({ path: path.join(SHOTS, '07-team-matching-sendbar-375.png') });
    await ap.click('.cl-sendbar .btn');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator('h2:has-text("Matching and choices")').waitFor();
    await actx.close();
    ({ ctx: actx, page: ap } = await adminPage(browser, DESKTOP, base, fake, '#client-' + client.id + '/matching'));
    await ap.locator('.cl-match').first().waitFor();
    await shot(ap, 'team-matching-desktop');
    await ap.goto(base + '/admin/#client-' + client.id);
    await ap.locator('h2:has-text("His profile")').waitFor();
    await shot(ap, 'team-client-profile-desktop');

    // ------------------------------------------------------------ client: F5 review and choices
    console.log('Client: review and choose');
    const r11 = last(/Your profiles are ready/);
    const reviewToken = tokenFrom(r11.text);
    await cp.goto(base + '/client#t=' + reviewToken);
    await cp.locator('.cl-pc').first().waitFor();
    assert.equal(await cp.locator('.cl-pc').count(), 4);
    assert.ok((await cp.textContent('.cl-wm')).includes('Michael James Thompson'), 'watermark with his name');
    assert.equal(await cp.locator('.cl-pc:has(h3:has-text("Thu")) .cl-pc-photo').count(), 0, 'no photo consent: no photo');
    const html = await cp.content();
    for (const s of ['Trần', '0910000000', 'hoa@example.vn', 'Giáo viên']) assert.ok(!html.includes(s), 'review page leaks ' + s);
    await shot(cp, 'client-f5-profiles');
    await cp.click('.cl-pc:has(h3:has-text("Mai")) .cl-action');
    await cp.click('.cl-pc:has(h3:has-text("Hoa")) .cl-action');
    await cp.click('.cl-pc:has(h3:has-text("Ngọc")) .cl-action');
    await cp.click('.cl-choices button[aria-label="Move Hoa up"]');
    assert.match(await cp.textContent('.cl-choice-list li:first-child'), /Hoa/);
    await cp.locator('.cl-choices').screenshot({ path: path.join(SHOTS, '11-client-f5-choices-bar.png') });
    await cp.click('#cl-send-choices');
    await cp.locator('.cl-confirm-box').waitFor();
    await shot(cp, 'client-f5-confirm', false);
    await cp.click('#cl-confirm-send');
    await cp.locator('h2:has-text("Your choices")').first().waitFor();
    await cp.locator('.cl-timeline').waitFor();
    await shot(cp, 'client-choices-sent');
    const ch = fake.tables.client_choices.sort((a, b) => a.rank - b.rank).map((x) => x.candidate_id);
    assert.deepEqual(ch, [women[0].id, women[2].id, women[4].id]);
    assert.ok(last(/Your choices are received/));
    await cctx.close();

    const dctx = await newContext(browser, DESKTOP);
    const dp = await dctx.newPage();
    // a fresh shortlist view on desktop (a second client)
    const c2 = S.activeClient({ email: 'second@example.com', full_name: 'David Brown', application: Object.assign({}, S.APPLICATION, { legal_name: 'David Brown' }), shortlist_sent_at: new Date().toISOString() });
    fake.tables.client_profiles.push(Object.assign({ client_id: c2.id, questions_version: 'x', answers: {}, photo_paths: [], declaration_vi: {}, submitted_at: new Date().toISOString(), summary_html: '<p>x</p>', summary_sent_at: new Date().toISOString(), summary_approved_at: new Date().toISOString() }));
    women.slice(0, 4).forEach((w) => fake.tables.client_shortlists.push({ client_id: c2.id, candidate_id: w.id, added_by: 'james@heritage-union.com', sent_at: new Date().toISOString() }));
    await dp.goto(base + '/client#t=' + c2.token);
    await dp.locator('.cl-pc').first().waitFor();
    await dp.click('.cl-pc:has(h3:has-text("Lan")) .cl-action');
    await shot(dp, 'client-f5-profiles-desktop');
    await dctx.close();

    await ap.reload();
    await ap.locator('.cl-ranked').waitFor();
    await ap.locator('.ad-section:has(h2:has-text("Matching and choices"))').screenshot({ path: path.join(SHOTS, '16-team-choices-desktop.png') });
    await actx.close();

    for (const m of sentEmails.filter((e) => Array.isArray(e.to))) for (const s of ['Michael', 'Thompson', 'Hoa', 'example.com']) assert.ok(!(m.subject + m.text).includes(s), 'team email leaks ' + s);
    console.log('\nPhase 2 e2e passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => { console.error(err); process.exit(1); });
