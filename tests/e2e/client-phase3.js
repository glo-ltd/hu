// Phase 3 journey (her decision and the introduction) at 375 px and desktop:
// the team's Introductions section, her decision page in Vietnamese and
// English, his statuses and a replacement choice.
// Run: node tests/e2e/client-phase3.js
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { start } = require('./server');
const { ROOT, MOBILE, DESKTOP, shooter, newContext, adminPage, tokenFrom } = require('./helpers');

const SHOTS = process.env.SHOTS || path.join(ROOT, 'docs', 'pr-screenshots', 'client-phase-3');
const PORT = 8903;
const ago = (d) => new Date(Date.now() - d * 86400000).toISOString();

(async () => {
  process.env.CLIENT_SIGNUPS_OPEN = 'true';
  const { server, fake, sentEmails, base } = await start(PORT);
  const S = require('../helpers/client-seed');
  const shot = shooter(SHOTS);
  const browser = await chromium.launch();
  const call = S.call;
  try {
    // ------------------------------------------------------------ setup: his approved, translated profile, and a shortlist
    const client = S.activeClient({ shortlist_sent_at: ago(3),
      declaration: Object.assign({}, S.DECLARATION, { conviction: 'yes', conviction_details: 'Driving with excess alcohol, United Kingdom, 1999. Fined and disqualified for 12 months.' }) });
    const hisPhotos = [1, 2].map((i) => { const p = client.id + '/photos/' + crypto.randomUUID() + '.jpg'; fake.addObject(p, fs.readFileSync(path.join(__dirname, 'fixture-person-' + (i + 3) + '.jpg')), 'client-documents'); return p; });
    fake.tables.client_profiles.push({ client_id: client.id, questions_version: 'x', display_name: 'Michael', photo_paths: hisPhotos,
      answers: { country: 'United Kingdom', city: 'Bristol' }, submitted_at: ago(9), message_to_women: 'Hello. Thank you for reading my profile. I would be glad to get to know you, at whatever pace feels right to you.',
      summary_html: '<p>Michael is a 48-year-old civil engineer living in Bristol, United Kingdom. He speaks English and a little French.</p><p>He lost his wife in 2016 and is close to his daughter. He loves hiking and cooking, and hopes to share a calm, family-centred life.</p>',
      summary_approved_at: ago(8),
      summary_vi_html: '<p>Michael 48 tuổi, là kỹ sư xây dựng, sống ở Bristol, Vương quốc Anh. Anh ấy nói tiếng Anh và một chút tiếng Pháp.</p><p>Vợ anh ấy mất năm 2016, và anh ấy rất gần gũi với con gái. Anh ấy thích đi bộ đường dài và nấu ăn, và mong có một cuộc sống gia đình bình yên.</p>',
      message_vi: 'Xin chào. Cảm ơn bạn đã đọc hồ sơ của tôi. Tôi rất vui nếu được làm quen với bạn, theo nhịp độ mà bạn thấy thoải mái.',
      declaration_vi: { conviction_details: 'Lái xe khi có nồng độ cồn vượt mức cho phép, Vương quốc Anh, năm 1999. Bị phạt tiền và tước bằng lái 12 tháng.', previous_marriages_details: 'Từ năm 2003 đến 2014, đã ly hôn.', countries_lived: 'Vương quốc Anh' } });
    const names = [['Hoa', 'vi'], ['Lan', 'en'], ['Mai', 'vi'], ['Thu', 'vi'], ['Ngọc', 'vi'], ['Linh', 'vi']];
    const women = names.map((n, i) => {
      const w = S.seedWoman({ zalo_number: '09' + String(20000000 + i), preferred_language: n[1], email: i === 0 ? 'hoa@example.vn' : i === 1 ? 'lan@example.com' : null }, { display_name: n[0], photo_paths: [] });
      const fp = fake.tables.candidate_profiles.find((x) => x.candidate_id === w.id);
      fp.photo_paths = [w.id + '/' + crypto.randomUUID() + '.jpg'];
      fake.addObject(fp.photo_paths[0], fs.readFileSync(path.join(__dirname, 'fixture-person-' + (i + 1) + '.jpg')));
      fake.tables.client_shortlists.push({ client_id: client.id, candidate_id: w.id, added_by: 'james@heritage-union.com', sent_at: ago(3) });
      return w;
    });
    const choose = await call('client-choices-submit', { token: client.token, candidateIds: women.slice(0, 3).map((w) => w.id) });
    assert.equal(choose.status, 200, choose.raw);

    // ------------------------------------------------------------ team: introductions
    console.log('Team: Introductions');
    let { ctx: actx, page: ap } = await adminPage(browser, MOBILE, base, fake, '#client-' + client.id);
    await ap.locator('h2:has-text("Introductions")').waitFor();
    await ap.locator('.ad-section:has(h2:has-text("Introductions"))').screenshot({ path: path.join(SHOTS, 'e01-team-introductions-ready-375.png') });
    for (const n of ['1. Hoa', '2. Lan']) {
      await ap.click('.cl-introrow:has(a:text-is("' + n + '")) button:has-text("Send to her")');
      await ap.click('.ad-modal-box .btn--primary');
      await ap.locator('.cl-copy:has-text("' + n.slice(3) + '")').waitFor();
    }
    await ap.locator('.cl-copy').scrollIntoViewIfNeeded();
    await ap.locator('.ad-section:has(h2:has-text("Introductions"))').screenshot({ path: path.join(SHOTS, 'e02-team-introductions-sent-with-zalo-message-375.png') });
    const viToken = tokenFrom(sentEmails.filter((m) => m.to === 'hoa@example.vn').pop().text);
    const enToken = tokenFrom(sentEmails.filter((m) => m.to === 'lan@example.com').pop().text);

    // ------------------------------------------------------------ her decision page, Vietnamese
    console.log('Her page (Vietnamese)');
    const vctx = await newContext(browser, MOBILE, 'vi-VN');
    const vp = await vctx.newPage();
    vp.on('dialog', (d) => d.accept());
    await vp.goto(base + '/vi/gioi-thieu#t=' + viToken);
    await vp.locator('.in-him').waitFor();
    assert.equal(new URL(vp.url()).hash, '', 'token removed from the address bar');
    const html = await vp.content();
    for (const s of ['Thompson', '1978', 'michael@example.com', '+44 7700', 'Rose Lane']) assert.ok(!html.includes(s), 'decision page leaks ' + s);
    assert.match(await vp.textContent('.in-decl'), /Lái xe khi có nồng độ cồn/);
    assert.equal(await vp.locator('.in-decl dd.is-yes').count(), 1, 'his "yes" is highlighted');
    assert.equal(await vp.textContent('#in-notchecked'), 'Đây là bản khai do chính anh ấy ký. Heritage Union không kiểm tra bản khai này.');
    assert.equal(await vp.textContent('#in-cert'), 'Yêu cầu anh ấy cung cấp phiếu lý lịch tư pháp trước');
    await shot(vp, 'her-page-vi-full');
    await vp.click('#in-yes');
    await vp.locator('#in-share-zalo').waitFor();
    assert.equal(await vp.isChecked('#in-share-zalo'), true);
    assert.equal(await vp.inputValue('#in-val-zalo'), '0920000000');
    await vp.check('#in-share-email');
    await vp.check('#in-m-messages');
    await vp.check('#in-m-video');
    await vp.click('#in-send-yes');
    assert.match(await vp.textContent('.in-error'), /đánh dấu ô đồng ý/);
    await vp.check('#in-agree');
    await vp.fill('#in-name', 'Hoa');
    await vp.locator('.in-actions').screenshot({ path: path.join(SHOTS, 'e04-her-page-vi-yes-form.png') });
    await vp.click('#in-send-yes');
    await vp.locator('.in-outcome').waitFor();
    await shot(vp, 'her-page-vi-thank-you');
    const hoaIntro = fake.tables.introductions.find((x) => x.candidate_id === women[0].id);
    assert.equal(hoaIntro.status, 'accepted');
    assert.deepEqual(hoaIntro.consent, { zalo: '0920000000', email: 'hoa@example.vn', contact: ['messages', 'video'] });
    // language switch keeps the same request
    const sw = await vp.getAttribute('#in-lang-switch', 'href');
    assert.ok(sw.startsWith('/introduction#t='));
    await vctx.close();

    // ------------------------------------------------------------ her decision page, English: question, then no
    console.log('Her page (English)');
    const ectx = await newContext(browser, MOBILE);
    const ep = await ectx.newPage();
    ep.on('dialog', (d) => d.accept());
    await ep.goto(base + '/introduction#t=' + enToken);
    await ep.locator('.in-him').waitFor();
    assert.match(await ep.textContent('.in-summary'), /civil engineer/);
    assert.equal(await ep.textContent('#in-notchecked'), 'This is his own signed declaration. Heritage Union has not checked it.');
    await shot(ep, 'her-page-en-full');
    await ep.click('#in-ask');
    await ep.fill('#in-question', 'Does he have any children living with him?');
    await ep.click('#in-send-ask');
    await ep.locator('.in-done').waitFor();
    await ep.locator('.in-actions').screenshot({ path: path.join(SHOTS, 'e07-her-page-en-question-sent.png') });
    await ep.click('#in-no');
    await ep.fill('#in-reason', 'I would prefer someone closer to my age.');
    await ep.locator('.in-actions').screenshot({ path: path.join(SHOTS, 'e08-her-page-en-no-form.png') });
    await ep.click('#in-send-no');
    await ep.locator('.in-outcome').waitFor();
    await shot(ep, 'her-page-en-after-no');
    const r17 = sentEmails.filter((m) => m.to === 'michael@example.com' && /update on your introduction/.test(m.subject)).pop();
    assert.ok(r17 && !r17.text.includes('closer to my age'));
    await ectx.close();

    // ------------------------------------------------------------ team: introduce, questions, desktop
    console.log('Team: introduce');
    await ap.reload();
    await ap.locator('.cl-introrow:has(a:text-is("1. Hoa")) button:has-text("Introduce")').waitFor();
    await ap.locator('.cl-introrow:has(a:text-is("2. Lan"))').screenshot({ path: path.join(SHOTS, 'e10-team-declined-with-private-reason-and-question-375.png') });
    await ap.click('.cl-introrow:has(a:text-is("1. Hoa")) button:has-text("Introduce")');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator('.cl-copy').waitFor();
    assert.match(await ap.inputValue('.ad-copybox'), /^Chào Hoa,/);
    await ap.locator('.cl-copy').screenshot({ path: path.join(SHOTS, 'e11-team-r16-zalo-message-375.png') });
    const r15 = sentEmails.filter((m) => m.to === 'michael@example.com' && /would like to be introduced/.test(m.subject)).pop();
    assert.ok(r15.text.includes('Zalo: 0920000000'));
    await actx.close();
    ({ ctx: actx, page: ap } = await adminPage(browser, DESKTOP, base, fake, '#client-' + client.id));
    await ap.locator('h2:has-text("Introductions")').waitFor();
    await shot(ap, 'team-client-introductions-desktop');
    await ap.goto(base + '/admin/#' + women[0].id);
    await ap.locator('h2:has-text("Introduction requests")').waitFor();
    await ap.locator('.ad-section:has(h2:has-text("Introduction requests"))').screenshot({ path: path.join(SHOTS, 'e13-team-candidate-introduction-requests-desktop.png') });
    await actx.close();

    // ------------------------------------------------------------ his page: statuses and a replacement
    console.log('His page');
    const cctx = await newContext(browser, MOBILE);
    const cp = await cctx.newPage();
    await cp.goto(base + '/client#t=' + tokenFrom(r17.text));
    await cp.locator('.cl-intros').waitFor();
    const statuses = await cp.locator('.cl-intro-status').allTextContents();
    assert.deepEqual(statuses, ['✓ Introduced: James has sent you her details', 'Not this time', 'Waiting for her reply']);
    assert.ok(!(await cp.content()).includes('closer to my age'));
    await shot(cp, 'client-introductions-and-replacement');
    await cp.click('.cl-pc:has(h3:has-text("Thu")) .cl-action');
    await cp.locator('.cl-intro:has-text("Thu")').waitFor();
    await shot(cp, 'client-after-replacement');
    assert.equal(fake.tables.introductions.find((x) => x.candidate_id === women[3].id).is_replacement, true);
    await cctx.close();

    // ------------------------------------------------------------ she asks for an official background check (Mai, Vietnamese)
    console.log('Certificate on request: provided');
    const maiIntro = fake.tables.introductions.find((x) => x.candidate_id === women[2].id);
    const s = await call('admin-intro', { id: client.id, op: 'send', introId: maiIntro.id }, { headers: S.adminToken('huyen@heritage-union.com') });
    const maiToken = tokenFrom(s.body.zalo);
    const mctx = await newContext(browser, MOBILE, 'vi-VN');
    const mp = await mctx.newPage();
    await mp.goto(base + '/vi/gioi-thieu#t=' + maiToken);
    await mp.locator('#in-cert').click();
    await mp.locator('#in-send-cert').waitFor();
    await mp.locator('.in-actions').screenshot({ path: path.join(SHOTS, 'e20-her-page-vi-ask-for-certificate.png') });
    await mp.click('#in-send-cert');
    await mp.locator('.in-cert').waitFor();
    assert.equal(await mp.locator('#in-cert').count(), 0, 'asked once');
    assert.match(await mp.textContent('.in-actions'), /tạm dừng/);
    await mp.locator('.in-cert').screenshot({ path: path.join(SHOTS, 'e21-her-page-vi-certificate-requested.png') });
    assert.ok(fake.tables.introductions.find((x) => x.id === maiIntro.id).expiry_paused_at);
    // team: send the request to him (R22)
    ({ ctx: actx, page: ap } = await adminPage(browser, MOBILE, base, fake, '#client-' + client.id));
    const maiRow = '.cl-introrow:has(a:text-is("3. Mai"))';
    await ap.locator(maiRow + ' .cl-certreq').waitFor();
    await ap.locator(maiRow).screenshot({ path: path.join(SHOTS, 'e22-team-certificate-requested-375.png') });
    await ap.click(maiRow + ' button:has-text("Send certificate request")');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator(maiRow + ' .cl-certreq:has-text("Waiting for his answer")').waitFor();
    const r22 = sentEmails.filter((m) => m.to === 'michael@example.com' && /official certificate/.test(m.subject)).pop();
    assert.ok(r22, 'R22 sent');
    // his page: optional upload
    const hctx = await newContext(browser, MOBILE);
    const hp = await hctx.newPage();
    hp.on('dialog', (d) => d.accept());
    await hp.goto(base + '/client#t=' + tokenFrom(r22.text));
    await hp.locator('.cl-certcard').waitFor();
    await hp.locator('.cl-certcard').scrollIntoViewIfNeeded();
    await hp.locator('.cl-certcard').screenshot({ path: path.join(SHOTS, 'e23-client-certificate-request.png') });
    await hp.setInputFiles('.cl-certcard input[type=file]', { name: 'certificate.pdf', mimeType: 'application/pdf', buffer: Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(400, 32)]) });
    await hp.locator('.cl-certcard:has-text("reached us safely")').waitFor();
    await hp.locator('.cl-certcard').screenshot({ path: path.join(SHOTS, 'e24-client-certificate-uploaded.png') });
    // team: open it, then mark as seen
    await ap.reload();
    await ap.locator(maiRow + ' button:has-text("Mark as seen")').waitFor();
    await ap.click(maiRow + ' button:has-text("Open certificate")');
    await ap.locator('#cl-intro-out a:has-text("requested certificate")').waitFor();
    await ap.locator(maiRow).screenshot({ path: path.join(SHOTS, 'e25-team-certificate-provided-375.png') });
    await ap.click(maiRow + ' button:has-text("Mark as seen")');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator(maiRow + ' .cl-certreq:has-text("Seen by")').waitFor();
    // her page shows it, in both languages
    await mp.reload();
    await mp.locator('.in-cert-line.is-provided').waitFor();
    assert.equal(await mp.textContent('.in-cert-line.is-provided'), '✓ Anh ấy đã cung cấp phiếu lý lịch tư pháp');
    assert.ok((await mp.getAttribute('#in-cert-view', 'href')).includes('/certificate/'));
    await mp.locator('.in-cert').screenshot({ path: path.join(SHOTS, 'e26-her-page-vi-certificate-provided.png') });
    await mctx.close();
    const mectx = await newContext(browser, MOBILE);
    const mep = await mectx.newPage();
    await mep.goto(base + '/introduction#t=' + maiToken);
    await mep.locator('.in-cert-line.is-provided').waitFor();
    assert.equal(await mep.textContent('.in-cert-line.is-provided'), '✓ He has provided an official certificate');
    await mep.locator('.in-cert').screenshot({ path: path.join(SHOTS, 'e27-her-page-en-certificate-provided.png') });
    await mectx.close();

    // ------------------------------------------------------------ he declines (Thu, English page, then Vietnamese)
    console.log('Certificate on request: declined');
    const thuIntro = fake.tables.introductions.find((x) => x.candidate_id === women[3].id);
    const st = await call('admin-intro', { id: client.id, op: 'send', introId: thuIntro.id }, { headers: S.adminToken('huyen@heritage-union.com') });
    const thuToken = tokenFrom(st.body.zalo);
    const tctx = await newContext(browser, MOBILE);
    const tp = await tctx.newPage();
    await tp.goto(base + '/introduction#t=' + thuToken);
    await tp.locator('#in-cert').click();
    await tp.locator('#in-send-cert').waitFor();
    await tp.locator('.in-actions').screenshot({ path: path.join(SHOTS, 'e28-her-page-en-ask-for-certificate.png') });
    await tp.click('#in-send-cert');
    await tp.locator('.in-cert').waitFor();
    await ap.reload();
    const thuRow = '.cl-introrow:has(a:text-is("4. Thu"))';
    await ap.click(thuRow + ' button:has-text("Send certificate request")');
    await ap.click('.ad-modal-box .btn--primary');
    await ap.locator(thuRow + ' .cl-certreq:has-text("Waiting for his answer")').waitFor();
    const r22b = sentEmails.filter((m) => m.to === 'michael@example.com' && /Thu would like an official certificate/.test(m.subject)).pop();
    await hp.goto('about:blank');
    await hp.goto(base + '/client#t=' + tokenFrom(r22b.text));
    await hp.locator('.cl-certcard:has-text("Thu") button:has-text("rather not")').click();
    await hp.locator('.cl-certcard:has-text("You chose not to provide one")').waitFor();
    await hctx.close();
    await tp.reload();
    await tp.locator('.in-cert-line.is-declined').waitFor();
    assert.equal(await tp.textContent('.in-cert-line.is-declined'), 'He chose not to provide one.');
    await tp.locator('.in-cert').screenshot({ path: path.join(SHOTS, 'e29-her-page-en-certificate-declined.png') });
    await tctx.close();
    const tvctx = await newContext(browser, MOBILE, 'vi-VN');
    const tvp = await tvctx.newPage();
    await tvp.goto(base + '/vi/gioi-thieu#t=' + thuToken);
    await tvp.locator('.in-cert-line.is-declined').waitFor();
    assert.equal(await tvp.textContent('.in-cert-line.is-declined'), 'Anh ấy đã chọn không cung cấp phiếu lý lịch tư pháp.');
    await tvp.locator('.in-cert').screenshot({ path: path.join(SHOTS, 'e30-her-page-vi-certificate-declined.png') });
    await tvctx.close();
    await ap.reload();
    await ap.locator(thuRow + ' .cl-certreq:has-text("chose not to provide")').waitFor();
    await actx.close();

    // ------------------------------------------------------------ desktop: her page; expired link
    const dctx = await newContext(browser, DESKTOP, 'vi-VN');
    const dp = await dctx.newPage();
    await dp.goto(base + '/vi/gioi-thieu#t=' + maiToken);
    await dp.locator('.in-him').waitFor();
    await shot(dp, 'her-page-vi-desktop');
    fake.tables.introductions.find((x) => x.id === maiIntro.id).decision_token_expires_at = ago(1);
    await dp.reload();
    await dp.locator('#in-message').waitFor({ state: 'visible' });
    assert.match(await dp.textContent('#in-message'), /hết hạn/);
    await shot(dp, 'her-page-vi-expired-desktop');
    await dctx.close();

    for (const m of sentEmails.filter((e) => Array.isArray(e.to))) for (const x of ['Michael', 'Hoa', 'Lan', 'example']) assert.ok(!(m.subject + m.text).includes(x), 'team email leaks ' + x);
    console.log('\nPhase 3 e2e passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => { console.error(err); process.exit(1); });
