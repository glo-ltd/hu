// End-to-end check of the candidate journey and the team tool, at 375 px
// (and desktop for the team tool), against tests/e2e/server.js.
// Run: node tests/e2e/journey.js   Screenshots go to $SHOTS (default
// docs/pr-screenshots/candidate-profiles).
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { start } = require('./server');

const ROOT = path.join(__dirname, '..', '..');
const SHOTS = process.env.SHOTS || path.join(ROOT, 'docs', 'pr-screenshots', 'candidate-profiles');
const PORT = 8899;
const PII = ['Nguyễn Thị Mai', 'Nguyễn', '1995-06-20', '0987654321', 'mai@example.com'];
const MOBILE = { width: 375, height: 812 };

let shotN = 0;
async function shot(page, name, full) {
  fs.mkdirSync(SHOTS, { recursive: true });
  const file = path.join(SHOTS, String(++shotN).padStart(2, '0') + '-' + name + '.png');
  await page.screenshot({ path: file, fullPage: full !== false });
  console.log('  screenshot', path.relative(ROOT, file));
}

async function newContext(browser, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'vi-VN', reducedMotion: 'reduce' });
  // External fonts and the CDN are not reachable here: fonts fall back to
  // Georgia; supabase-js is served from the identical npm package.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js', (r) =>
    r.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' },
      body: fs.readFileSync(path.join(ROOT, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js')) }));
  await ctx.route('https://fake.supabase.co/**', (r) => r.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));
  return ctx;
}

function profileOf(fake, id) { return fake.tables.candidate_profiles.find((p) => p.candidate_id === id); }

async function waitFor(fn, ms) {
  const until = Date.now() + (ms || 10000);
  while (Date.now() < until) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 100)); }
  throw new Error('timed out waiting');
}

function inspectJpeg(bytes) {
  const tmp = path.join(require('os').tmpdir(), 'hu-upload-' + Date.now() + '.jpg');
  fs.writeFileSync(tmp, bytes);
  const out = execFileSync('python3', ['-c', `
import sys, json
from PIL import Image
im = Image.open(sys.argv[1]); px = im.convert('RGB')
w, h = im.size
print(json.dumps({"format": im.format, "w": w, "h": h, "exif": len(im.getexif()), "app1": b"Exif" in open(sys.argv[1],"rb").read(),
  "right": px.getpixel((w-20, h//2)), "left": px.getpixel((20, h//2))}))
`, tmp]).toString();
  fs.unlinkSync(tmp);
  return JSON.parse(out);
}

(async () => {
  fs.rmSync(SHOTS, { recursive: true, force: true });
  const { server, fake, sentEmails, log, base } = await start(PORT);
  const browser = await chromium.launch();
  try {
    // ------------------------------------------------------------ registration -> thank-you
    console.log('Registration');
    process.env.CANDIDATE_SIGNUPS_OPEN = 'true'; process.env.TURNSTILE_SITE_KEY = 's'; process.env.TURNSTILE_SECRET = 's';
    const realFetch = global.fetch;
    global.fetch = async () => ({ json: async () => ({ success: true }) });
    const reg = await require('../../netlify/functions/candidate-register').handler({
      httpMethod: 'POST', headers: {}, body: JSON.stringify({ fullName: 'Nguyễn Thị Mai', dateOfBirth: '1995-06-20', ageDeclared: true,
        province: 'Cần Thơ', zaloNumber: '0987654321', email: 'mai@example.com', preferredLanguage: 'vi',
        aboutText: 'Tôi làm y tá ở Cần Thơ. Tôi thích nấu ăn cho gia đình và đi chợ nổi vào sáng chủ nhật.',
        source: 'facebook_group', consentContact: true, consentProcessing: true, consentProfileSharing: true, turnstileToken: 'x', lang: 'vi' }) });
    global.fetch = realFetch;
    const token = JSON.parse(reg.body).profileToken;
    const cid = fake.tables.candidates[0].id;
    assert.ok(token);

    const ctx = await newContext(browser, MOBILE);
    const page = await ctx.newPage();
    const responses = [];
    page.on('response', async (r) => { if (r.url().includes('/.netlify/functions/profile-')) { try { responses.push(await r.text()); } catch (e) {} } });

    // This is exactly where main.js sends her after registering.
    await page.goto(base + '/vi/thank-you-registration#t=' + token);
    const cta = page.locator('#profile-cta-link');
    await cta.waitFor();
    assert.equal(await cta.textContent(), 'Hoàn thiện hồ sơ ngay (khoảng 10 phút)');
    assert.equal(new URL(page.url()).hash, '', 'token removed from the address bar');
    await shot(page, 'thank-you-with-profile-button');

    // ------------------------------------------------------------ step 1
    console.log('Step 1');
    await cta.click();
    await page.locator('#pf-step-count').waitFor();
    assert.equal(new URL(page.url()).hash, '', 'token removed from /vi/ho-so address bar');
    assert.equal(await page.textContent('#pf-step-count'), 'Bước 1/6');
    assert.equal(await page.inputValue('#q-display_name'), 'Mai', 'display name prefilled from last word');
    assert.equal(await page.inputValue('#q-province'), 'Cần Thơ');
    await shot(page, 'step1-prefilled');
    // Required check
    await page.click('#pf-next');
    assert.match(await page.textContent('[data-q="occupation"] .pf-error'), /Bạn vui lòng trả lời câu này/);
    await shot(page, 'step1-inline-errors');
    await page.fill('#q-occupation', 'Y tá');
    await page.click('[data-q="education"] .pf-chip[data-value="college"]');
    await page.click('[data-q="english_level"] .pf-chip[data-value="basic"]');
    await page.click('[data-q="marital_history"] .pf-chip[data-value="divorced"]');
    assert.equal(await page.isHidden('[data-q="children_live_with"]'), true);
    await page.click('[data-q="children"] [aria-label="Thêm 1"]');
    assert.equal(await page.isVisible('[data-q="children_live_with"]'), true, 'follow-up appears when children > 0');
    await page.click('[data-q="children_live_with"] .pf-chip[data-value="yes"]');
    await shot(page, 'step1-filled');
    await page.click('#pf-next');
    await page.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 2/6');
    let prof = profileOf(fake, cid);
    assert.equal(prof.display_name, 'Mai');
    assert.equal(prof.answers.children, 1);
    assert.equal(fake.tables.candidates[0].status, 'profile_in_progress');

    // ------------------------------------------------------------ step 2 (with a failed save + retry)
    console.log('Step 2');
    await page.click('[data-q="wants_children"] .pf-chip[data-value="open"]');
    await page.click('[data-q="religion"] .pf-chip[data-value="buddhist"]');
    await page.click('[data-q="smoking"] .pf-chip[data-value="never"]');
    await page.click('[data-q="drinking"] .pf-chip[data-value="socially"]');
    for (const v of ['family', 'kindness', 'honesty']) await page.click('[data-q="values"] .pf-chip[data-value="' + v + '"]');
    assert.equal(await page.isDisabled('[data-q="values"] .pf-chip[data-value="humour"]'), true, 'max 3 values');
    await page.route('**/.netlify/functions/profile-save', (r) => r.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'Chưa lưu được.' }) }));
    await page.click('#pf-next');
    await page.locator('#pf-save-error').waitFor({ state: 'visible' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, 'step3-after-failed-save-retry-banner', false);
    assert.equal(profileOf(fake, cid).answers.smoking, undefined, 'nothing saved yet');
    await page.unroute('**/.netlify/functions/profile-save');
    await page.click('#pf-retry');
    await page.locator('#pf-save-error').waitFor({ state: 'hidden' });
    assert.equal(profileOf(fake, cid).answers.smoking, 'never', 'retry saved the step 2 answers kept in memory');
    assert.deepEqual(profileOf(fake, cid).answers.values, ['family', 'kindness', 'honesty']);
    await page.click('#pf-back');
    await shot(page, 'step2-filled');
    await page.click('#pf-next');
    await page.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 3/6');

    // ------------------------------------------------------------ step 3 + textarea autosave
    console.log('Step 3');
    assert.equal(await page.textContent('[data-q="open_to_abroad"] .pf-q-label'), 'Bạn có sẵn sàng sống ở nước ngoài không?*');
    await page.click('[data-q="open_to_abroad"] .pf-chip[data-value="maybe"]');
    await page.click('[data-q="household_finances"] .pf-chip[data-value="decide_together"]');
    await page.click('[data-q="supports_family"] .pf-chip[data-value="sometimes"]');
    const range = page.locator('[data-q="partner_age_range"] input');
    assert.equal(await range.nth(0).inputValue(), '26', 'age - 5 default');
    assert.equal(await range.nth(1).inputValue(), '51', 'age + 20 default');
    await page.fill('#q-partner_matters', 'Một người chân thành, tôn trọng gia đình và biết lắng nghe.');
    assert.match(await page.textContent('[data-q="partner_matters"] .pf-counter'), /^59\/600 ký tự$/);
    await waitFor(() => (profileOf(fake, cid).answers.partner_matters || '').startsWith('Một người'), 6000);
    await page.waitForFunction(() => document.getElementById('pf-save-status').textContent === 'Đã lưu');
    await shot(page, 'step3-autosaved');
    await page.click('#pf-next');
    await page.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 4/6');
    assert.equal(profileOf(fake, cid).answers.household_finances, 'decide_together');
    assert.deepEqual(profileOf(fake, cid).answers.partner_age_range, [26, 51]);
    assert.equal(profileOf(fake, cid).answers.about, undefined, 'step 4 prefill not saved before she reaches step 4');

    // ------------------------------------------------------------ leave mid-step and come back
    console.log('Leave and return');
    // Leave from step 4 without tapping "Tiếp tục": typed text is still saved.
    await page.fill('#q-weekend', 'Sáng chủ nhật tôi đi chợ');
    await page.goto(base + '/vi/');
    await ctx.close();
    await waitFor(() => (profileOf(fake, cid).answers.weekend || '').length > 0, 5000);
    const ctx2 = await newContext(browser, MOBILE);
    const page2 = await ctx2.newPage();
    page2.on('response', async (r) => { if (r.url().includes('/.netlify/functions/profile-')) { try { responses.push(await r.text()); } catch (e) {} } });
    await page2.goto(base + '/vi/ho-so#t=' + token);
    await page2.locator('#pf-step-count').waitFor();
    // Steps 1-4 now have every required answer (about was prefilled and
    // seen on step 4), so she lands on the first unfinished step: photos.
    assert.equal(await page2.textContent('#pf-step-count'), 'Bước 5/6', 'returns at first incomplete step');
    await page2.click('#pf-back');
    assert.match(await page2.inputValue('#q-about'), /y tá ở Cần Thơ/, 'about prefilled from registration');
    assert.equal(await page2.inputValue('#q-weekend'), 'Sáng chủ nhật tôi đi chợ', 'typed text survived leaving');
    await page2.click('#pf-back');
    assert.equal(await page2.getAttribute('[data-q="household_finances"] .pf-chip[data-value="decide_together"]', 'aria-checked'), 'true', 'earlier answers filled in');
    await page2.click('#pf-next');
    await page2.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 4/6');
    await shot(page2, 'step4-returned-prefilled');

    // ------------------------------------------------------------ step 4
    console.log('Step 4');
    await page2.fill('#q-weekend', 'Sáng chủ nhật tôi đi chợ nổi, chiều về nấu cơm cho cả nhà.');
    await page2.fill('#q-message', 'Mong được làm quen với một người hiền lành và kiên nhẫn.');
    await page2.click('#pf-next');
    await page2.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 5/6');

    // ------------------------------------------------------------ step 5 photos
    console.log('Step 5 photos');
    await shot(page2, 'step5-photos-empty');
    await page2.setInputFiles('#pf-photo-input', path.join(__dirname, 'fixture-not-image.jpg'));
    await page2.waitForFunction(() => /Không đọc được ảnh/.test(document.getElementById('pf-photo-status').textContent));
    await page2.setInputFiles('#pf-photo-input', path.join(__dirname, 'fixture-exif-gps.jpg'));
    await page2.waitForFunction(() => document.querySelectorAll('.pf-photo img').length === 1);
    prof = profileOf(fake, cid);
    assert.equal(prof.photo_paths.length, 1);
    assert.ok(prof.photo_paths[0].startsWith(cid + '/'));
    const info = inspectJpeg(fake.objects['candidate-photos/' + prof.photo_paths[0]].bytes);
    console.log('  uploaded photo:', JSON.stringify(info));
    assert.equal(info.format, 'JPEG');
    assert.ok(Math.max(info.w, info.h) <= 1600, 'max 1600 px');
    assert.deepEqual([info.w, info.h], [1067, 1600], 'rotated to portrait per EXIF orientation 6');
    assert.equal(info.exif, 0, 'no EXIF tags');
    assert.equal(info.app1, false, 'no EXIF segment at all (GPS gone)');
    assert.ok(info.right[0] > 180 && info.right[2] < 80, 'stored-top (red) is now on the right, as displayed');
    assert.ok(info.left[2] > 150, 'left side is blue');
    await page2.setInputFiles('#pf-photo-input', path.join(__dirname, 'fixture-small.png'));
    await page2.waitForFunction(() => document.querySelectorAll('.pf-photo img').length === 2);
    const second = profileOf(fake, cid).photo_paths[1];
    await page2.click('.pf-photo:nth-child(2) button[aria-label^="Đưa ảnh 2 lên trước"]');
    await waitFor(() => profileOf(fake, cid).photo_paths[0] === second);
    await page2.waitForFunction(() => /Đã đổi ảnh chính/.test(document.getElementById('pf-photo-status').textContent));
    await shot(page2, 'step5-two-photos-reordered');
    await page2.click('#pf-next');
    await page2.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 6/6');

    // ------------------------------------------------------------ step 6 review + consents
    console.log('Step 6 review');
    assert.equal(await page2.isChecked('#consent-confirmTrue'), false, 'confirm unticked by default');
    assert.equal(await page2.isChecked('#consent-profileSharing'), true, 'pre-ticked: she consented at registration');
    assert.equal(await page2.isChecked('#consent-photoSharing'), false);
    assert.equal(await page2.isVisible('#pf-photo-warning'), true, 'photo deletion warning shown');
    const reviewText = await page2.textContent('#pf-step-body');
    for (const s of ['Y tá', 'Cao đẳng', 'Hai người cùng bàn bạc và quyết định', 'Có, thỉnh thoảng', 'Từ 26 đến 51 tuổi', 'Gia đình, Lòng tốt, Sự trung thực']) assert.ok(reviewText.includes(s), s);
    assert.equal(await page2.locator('.pf-review-head button', { hasText: 'Sửa' }).count(), 5);
    await shot(page2, 'step6-review-photo-warning');
    await page2.click('#pf-next');
    assert.match(await page2.textContent('#pf-form-error'), /đánh dấu ô xác nhận/);
    // "Sửa" goes back to a step
    await page2.click('.pf-review-head button[aria-label="Sửa: Tương lai"]');
    assert.equal(await page2.textContent('#pf-step-count'), 'Bước 3/6');
    await page2.click('#pf-next'); await page2.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 4/6');
    await page2.click('#pf-next'); await page2.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 5/6');
    await page2.click('#pf-next'); await page2.waitForFunction(() => document.getElementById('pf-step-count').textContent === 'Bước 6/6');
    await page2.check('#consent-confirmTrue');
    await page2.check('#consent-photoSharing');
    assert.equal(await page2.isVisible('#pf-photo-warning'), false);
    await shot(page2, 'step6-consents-ticked');
    await page2.click('#pf-next');
    await page2.locator('#pf-done').waitFor();
    await shot(page2, 'submitted-confirmation');
    assert.match(await page2.textContent('#pf-done'), /quay lại bằng cùng đường link này/);
    assert.equal(await page2.getAttribute('#pf-done a[href="/vi/withdraw"]', 'href'), '/vi/withdraw');
    prof = profileOf(fake, cid);
    const cand = fake.tables.candidates[0];
    assert.equal(cand.status, 'profile_complete');
    assert.ok(prof.submitted_at && prof.confirmed_true_at && prof.consent_photo_sharing_at);
    assert.equal(prof.consent_profile_text_version, 'vi-2026-11-profile-v1');
    assert.equal(prof.photo_paths.length, 2);
    const team = sentEmails.filter((m) => /Candidate profile submitted/.test(m.subject));
    assert.equal(team.length, 1);
    assert.equal(team[0].subject, 'Candidate profile submitted (#' + cid + ')');

    // ------------------------------------------------------------ edit after submit, untick sharing
    console.log('Change after submitting');
    await page2.click('#pf-edit-again');
    await page2.uncheck('#consent-profileSharing');
    await page2.check('#consent-confirmTrue');
    assert.equal(await page2.isVisible('#pf-share-note'), true);
    await page2.click('#pf-next');
    await page2.locator('#pf-done').waitFor();
    assert.equal(fake.tables.candidates[0].consent_profile_sharing_at, null, 'unticking sharing sets null');
    assert.equal(fake.tables.candidates[0].status, 'profile_complete');
    // re-consent so the admin preview below has something to show
    await page2.click('#pf-edit-again');
    await page2.check('#consent-profileSharing'); await page2.check('#consent-confirmTrue');
    await page2.click('#pf-next'); await page2.locator('#pf-done').waitFor();
    await ctx2.close();

    // ------------------------------------------------------------ no link / expired link
    console.log('No link / expired');
    const ctx3 = await newContext(browser, MOBILE);
    const p3 = await ctx3.newPage();
    await p3.goto(base + '/vi/ho-so');
    await p3.locator('#pf-nolink').waitFor({ state: 'visible' });
    assert.equal(await p3.isHidden('#pf-form'), true);
    await shot(p3, 'no-link-message');
    const expired = require('../../netlify/shared/profile-common').newProfileToken(Date.now() - 61 * 86400000);
    fake.tables.candidates.push(Object.assign({}, fake.tables.candidates[0], { id: require('crypto').randomUUID(), profile_token_hash: expired.hash, profile_token_expires_at: expired.expiresAt }));
    await p3.goto(base + '/vi/ho-so#t=' + expired.token);
    await p3.reload();
    await p3.locator('#pf-nolink').waitFor({ state: 'visible' });
    assert.match(await p3.textContent('#pf-nolink-message'), /hết hạn/);
    await shot(p3, 'expired-link-message');
    fake.tables.candidates.pop();
    // Page HTML itself carries no personal data
    for (const s of PII) assert.ok(!(await p3.content()).includes(s));
    await ctx3.close();

    // ------------------------------------------------------------ PII check on every candidate-facing response
    console.log('PII check over', responses.length, 'candidate-facing responses');
    assert.ok(responses.length > 10);
    for (const body of responses) for (const s of PII.concat(['ip_hash', 'zalo_number', 'date_of_birth', 'full_name'])) assert.ok(!body.includes(s), 'response leaks ' + s);
    for (const entry of log.filter((l) => l.fn.startsWith('profile-'))) assert.ok(!PII.some((s) => entry.body.includes(s)));

    // ------------------------------------------------------------ admin
    console.log('Admin');
    // more candidates so the list has some variety
    const { seedCandidate } = require('../helpers/seed');
    seedCandidate({ full_name: 'Lê Thị Thu', zalo_number: '0911222333', province: 'Huế', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), profile_link_sent_at: new Date(Date.now() - 2 * 86400000).toISOString() });
    seedCandidate({ full_name: 'Phạm Ngọc Hạnh', zalo_number: '0933444555', province: 'Hà Nội', status: 'withdrawn', profile_token_hash: null,
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(), updated_at: new Date(Date.now() - 24 * 86400000).toISOString() });
    seedCandidate({ full_name: 'Võ Thị Ngân', zalo_number: '0944555666', province: 'Đà Nẵng', status: 'withdrawn', profile_token_hash: null,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString() });

    for (const [label, viewport] of [['375', MOBILE], ['desktop', { width: 1280, height: 900 }]]) {
      const actx = await newContext(browser, viewport);
      await actx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
      const ap = await actx.newPage();
      await ap.goto(base + '/admin/');
      await ap.locator('#ad-signin').waitFor({ state: 'visible' });
      if (label === '375') await shot(ap, 'admin-signin-375');
      // Sign in: a stored Supabase session for an allowed email.
      const jwt = 'jwt-admin-' + label;
      fake.users[jwt] = { email: 'huyen@heritage-union.com' };
      await ap.evaluate((jwt) => {
        localStorage.setItem('sb-fake-auth-token', JSON.stringify({ access_token: jwt, refresh_token: 'r', token_type: 'bearer', expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u1', email: 'huyen@heritage-union.com', aud: 'authenticated', role: 'authenticated' } }));
      }, jwt);
      await ap.reload();
      await ap.locator('.ad-card').first().waitFor();
      await shot(ap, 'admin-list-followup-' + label);
      await ap.click('.ad-filter[data-filter="all"]');
      await shot(ap, 'admin-list-all-' + label);
      await ap.click('.ad-filter[data-filter="withdrawn"]');
      assert.equal(await ap.locator('.ad-badge--danger').count(), 1, 'red after 21 days');
      await shot(ap, 'admin-list-withdrawn-' + label);
      await ap.click('.ad-filter[data-filter="all"]');
      await ap.fill('#ad-search', '0987');
      assert.equal(await ap.locator('.ad-card').count(), 1, 'search by Zalo');
      await ap.fill('#ad-search', 'mai');
      assert.equal(await ap.locator('.ad-card').count(), 1, 'search by name without accents');
      await ap.click('.ad-card');
      await ap.locator('.ad-section h2', { hasText: 'Her answers' }).waitFor();
      if (label === '375') {
        await ap.fill('#tr-partner_matters', 'Someone sincere, who respects family and knows how to listen.');
        await ap.click('.ad-translate:has(#tr-partner_matters) button');
        await waitFor(() => (profileOf(fake, cid).translations || {}).partner_matters);
        assert.equal(profileOf(fake, cid).translated_by, 'huyen@heritage-union.com');
        const before = fake.tables.candidates[0].profile_token_hash;
        await ap.click('button:has-text("Copy Zalo message")');
        await ap.locator('.ad-copybox').waitFor();
        const msg = await ap.inputValue('.ad-copybox');
        assert.match(msg, /^Chào Mai,/);
        assert.notEqual(fake.tables.candidates[0].profile_token_hash, before, 'old link replaced');
        const clip = await ap.evaluate(() => navigator.clipboard.readText()).catch(() => null);
        if (clip !== null) assert.equal(clip, msg, 'copied to clipboard');
      }
      await ap.reload();
      await ap.locator('.ad-section h2', { hasText: 'Her answers' }).waitFor();
      const html = await ap.content();
      assert.ok(html.includes('Internal preview. No profile may be shown to clients until the client IMBRA disclosure process exists.'));
      const preview = await ap.textContent('.ad-preview-card');
      for (const s of ['Nguyễn', '1995-06-20', '0987654321', 'mai@example.com']) assert.ok(!preview.includes(s), 'preview leaks ' + s);
      assert.ok(preview.includes('Mai, '), 'display name and age');
      await shot(ap, 'admin-detail-' + label);
      if (label === '375') {
        await ap.click('button:has-text("Delete permanently")');
        await ap.fill('#ad-del-name', 'Nguyễn');
        await ap.click('.ad-modal-box .btn--danger');
        await ap.waitForFunction(() => /does not match/.test(document.querySelector('#ad-modal-body').textContent));
        await shot(ap, 'admin-delete-confirm-375', false);
        await ap.click('.ad-modal-box button:has-text("Cancel")');
        assert.equal(fake.tables.candidates.some((c) => c.id === cid), true, 'not deleted with wrong name');
        // A candidate with no sharing consent
        const thu = fake.tables.candidates.find((c) => c.full_name === 'Lê Thị Thu');
        await ap.goto(base + '/admin/#' + thu.id);
        await ap.locator('.ad-preview-no').waitFor();
        assert.equal(await ap.textContent('.ad-preview-no'), 'Not consented: must not be shown to clients.');
        await shot(ap, 'admin-detail-not-consented-375');
      }
      await actx.close();
    }
    console.log('\nAll e2e checks passed. Screenshots:', shotN);
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => { console.error(err); process.exit(1); });
