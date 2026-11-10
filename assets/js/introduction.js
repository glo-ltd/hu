/* Heritage Union: her decision page for an introduction request.
 *   /vi/gioi-thieu#t=<token>  (Vietnamese)    /introduction#t=<token>  (English)
 * The token belongs to this one request only. It is read from the URL
 * fragment, kept in sessionStorage and removed from the address bar; the
 * language switch carries it across.
 * She reads his profile, photos, message and background declaration in her
 * language, then chooses: yes (and exactly what to share), no (a private
 * reason is optional), a question first, or to ask him for an official
 * background check first. Heritage Union does not check his declaration.
 */
(function () {
  'use strict';
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'vi';
  var API = '/.netlify/functions/';
  var KEY = 'hu_intro_token';
  var $ = function (id) { return document.getElementById(id); };

  // TODO(James): counsel to approve the consent wording (consent, consentNote) — versions vi/en-2026-12-introduction-v1.
  var TX = {
    vi: {
      invalidTitle: 'Không mở được lời mời', expiredTitle: 'Lời mời đã hết hạn', unavailableTitle: 'Lời mời không còn hiệu lực',
      noLink: 'Trang này chỉ mở được bằng đường link riêng mà Heritage Union gửi cho bạn qua Zalo hoặc email.',
      net: 'Không kết nối được. Bạn kiểm tra mạng rồi thử lại nhé.',
      eyebrow: 'Lời mời làm quen',
      hello: function (n) { return 'Chào ' + n + ','; },
      lead: 'Một khách hàng của Heritage Union đã đọc hồ sơ của bạn và mong được làm quen với bạn. Bạn hãy đọc kỹ thông tin về anh ấy dưới đây, rồi tự quyết định. Không có gì bắt buộc.',
      years: function (a) { return a + ' tuổi'; },
      about: 'Giới thiệu về anh ấy', message: 'Lời nhắn của anh ấy gửi bạn', photos: 'Ảnh của anh ấy',
      decl: 'Bản khai lý lịch của anh ấy',
      declIntro: 'Anh ấy tự viết và ký bản khai này, đồng ý cho bạn đọc. Câu trả lời “Có” được đánh dấu để bạn dễ thấy.',
      notChecked: 'Đây là bản khai do chính anh ấy ký. Heritage Union không kiểm tra bản khai này.',
      rightsTitle: 'Quyền của bạn',
      rights: ['Hoàn toàn miễn phí. Bạn không bao giờ phải trả bất kỳ khoản tiền nào.', 'Bạn không có nghĩa vụ gì. Bạn có thể từ chối mà không cần nêu lý do.',
        'Thông tin liên lạc của bạn chỉ được gửi cho anh ấy nếu bạn đồng ý, và chỉ những gì bạn chọn.', 'Trước khi quyết định, bạn có thể yêu cầu anh ấy cung cấp phiếu lý lịch tư pháp.', 'Bạn có thể rút đăng ký bất cứ lúc nào.'],
      concern: 'Nếu có điều gì khiến bạn lo ngại, hãy báo cho chúng tôi:', concernLink: 'Báo cáo một vấn đề',
      decide: 'Bạn muốn trả lời thế nào?',
      yes: 'Có, tôi muốn được giới thiệu', no: 'Không, cảm ơn', ask: 'Tôi muốn hỏi trước', cert: 'Yêu cầu anh ấy cung cấp phiếu lý lịch tư pháp trước',
      certHelp: 'Phiếu lý lịch tư pháp là giấy tờ chính thức do cơ quan nhà nước ở nước anh ấy cấp, cho biết anh ấy có tiền án hay không. Heritage Union sẽ chuyển yêu cầu của bạn đến anh ấy. Anh ấy có thể đồng ý hoặc từ chối, và chúng tôi sẽ cho bạn biết trên trang này. Trong lúc chờ, lời mời vẫn được giữ nguyên và thời hạn 30 ngày được tạm dừng.',
      certSend: 'Gửi yêu cầu',
      certTitle: 'Phiếu lý lịch tư pháp',
      certWaiting: 'Bạn đã yêu cầu anh ấy cung cấp phiếu lý lịch tư pháp. Heritage Union sẽ chuyển yêu cầu đến anh ấy và cho bạn biết trên trang này khi anh ấy trả lời. Lời mời vẫn được giữ nguyên và thời hạn 30 ngày đang tạm dừng. Bạn vẫn có thể trả lời bất cứ lúc nào.',
      certProvided: 'Anh ấy đã cung cấp phiếu lý lịch tư pháp',
      certView: 'Xem phiếu lý lịch tư pháp',
      certViewNote: 'Heritage Union đã xem phiếu này nhưng không xác minh với cơ quan cấp. Đường link chỉ dùng được trong 10 phút; nếu hết hạn, bạn hãy tải lại trang.',
      certDeclined: 'Anh ấy đã chọn không cung cấp phiếu lý lịch tư pháp.',
      certDeclinedNote: 'Bạn vẫn hoàn toàn tự do quyết định.',
      paused: 'Thời hạn 30 ngày đang tạm dừng trong lúc chờ anh ấy trả lời.',
      shareTitle: 'Bạn muốn chia sẻ thông tin nào với anh ấy?', shareHelp: 'Chỉ những thông tin bạn đánh dấu mới được gửi cho anh ấy. Bạn có thể sửa lại.',
      zalo: 'Zalo', email: 'Email', phone: 'Điện thoại',
      contactTitle: 'Bạn muốn được liên lạc lần đầu bằng cách nào?', messages: 'Nhắn tin', voice: 'Gọi thoại', video: 'Gọi video',
      consent: function (h) { return 'Tôi đồng ý để Heritage Union chia sẻ những thông tin tôi đã chọn ở trên với ' + h + '.'; },
      consentNote: 'Heritage Union sẽ gửi cho bạn thông tin liên lạc của anh ấy cùng lúc.',
      typeName: 'Gõ tên của bạn để xác nhận', send: 'Gửi câu trả lời',
      noTitle: 'Cảm ơn bạn đã cho chúng tôi biết.', noHelp: 'Bạn không cần nêu lý do. Nếu muốn, bạn có thể viết vài dòng cho Heritage Union. Anh ấy sẽ không bao giờ đọc được.',
      noReason: 'Lý do (không bắt buộc, chỉ Heritage Union đọc)', noSend: 'Gửi lời từ chối',
      askHelp: 'Hãy viết câu hỏi của bạn. Huyền sẽ trả lời bạn bằng tiếng Việt, thường qua Zalo. Lời mời vẫn còn nguyên để bạn quyết định sau.', askSend: 'Gửi câu hỏi',
      askDone: 'Cảm ơn bạn. Chúng tôi đã nhận được câu hỏi và sẽ trả lời bạn sớm. Bạn có thể quay lại trang này bằng cùng đường link để quyết định.',
      thanksTitle: 'Cảm ơn bạn đã trả lời.',
      doneYes: 'Cảm ơn bạn. Heritage Union sẽ gửi những thông tin bạn chọn cho anh ấy, và gửi cho bạn thông tin liên lạc của anh ấy, rất sớm.',
      doneNo: 'Cảm ơn bạn. Anh ấy sẽ chỉ nhận được một lời báo nhẹ nhàng, không kèm bất kỳ lý do nào.',
      doneExpired: 'Lời mời này đã hết hạn. Bạn không cần làm gì thêm.',
      introduced: 'Hai bạn đã được giới thiệu với nhau.', hisContact: 'Thông tin liên lạc của anh ấy',
      youShared: 'Những thông tin bạn đã chia sẻ', withdraw: 'Bạn vẫn có thể rút đăng ký bất cứ lúc nào tại trang', withdrawLink: 'rút đăng ký',
      expires: function (d) { return 'Lời mời có hiệu lực đến ngày ' + d + '.'; },
      confirmNo: 'Bạn chắc chắn muốn từ chối lời mời này?',
      errChoose: 'Bạn vui lòng chọn ít nhất một thông tin để chia sẻ.', errContact: 'Bạn vui lòng chọn cách liên lạc lần đầu.', errAgree: 'Bạn vui lòng đánh dấu ô đồng ý.', errName: 'Bạn vui lòng gõ tên của bạn.', errAsk: 'Bạn vui lòng viết câu hỏi.',
    },
    en: {
      invalidTitle: 'This request can\'t be opened', expiredTitle: 'This request has expired', unavailableTitle: 'This request is no longer active',
      noLink: 'This page only opens with the private link Heritage Union sent you on Zalo or by email.',
      net: 'We couldn\'t connect. Please check your connection and try again.',
      eyebrow: 'An introduction request',
      hello: function (n) { return 'Dear ' + n + ','; },
      lead: 'A Heritage Union client has read your profile and would like to be introduced to you. Please read about him below, then decide for yourself. There is no obligation.',
      years: function (a) { return a + ' years old'; },
      about: 'About him', message: 'His message to you', photos: 'His photos',
      decl: 'His background declaration',
      declIntro: 'He wrote and signed this declaration himself, and agreed that you may read it. Any “Yes” is highlighted so you can see it easily.',
      notChecked: 'This is his own signed declaration. Heritage Union has not checked it.',
      rightsTitle: 'Your rights',
      rights: ['It is free. You never pay anything.', 'You are under no obligation. You can say no without giving any reason.',
        'Your contact details are only sent to him if you agree, and only the ones you choose.', 'Before you decide, you can ask him for an official background check.', 'You can withdraw your registration at any time.'],
      concern: 'If anything worries you, tell us:', concernLink: 'Report a concern',
      decide: 'How would you like to answer?',
      yes: 'Yes, I\'d like to be introduced', no: 'No, thank you', ask: 'I have a question first', cert: 'Ask him for an official background check first',
      certHelp: 'An official background check is a criminal record certificate issued by the authorities in his country, showing whether he has any convictions. Heritage Union will pass your request to him. He may agree or decline, and we will tell you on this page. Meanwhile your request stays open, and the 30-day limit is paused.',
      certSend: 'Send my request',
      certTitle: 'Official background check',
      certWaiting: 'You asked him for an official criminal record certificate. Heritage Union will pass your request to him and tell you on this page when he answers. Your request stays open, and the 30-day limit is paused. You can still answer at any time.',
      certProvided: 'He has provided an official certificate',
      certView: 'View the certificate',
      certViewNote: 'Heritage Union has looked at it but cannot confirm it with the authority that issued it. The link works for 10 minutes; if it expires, reload the page.',
      certDeclined: 'He chose not to provide one.',
      certDeclinedNote: 'You are still completely free to decide.',
      paused: 'The 30-day limit is paused while we wait for his answer.',
      shareTitle: 'Which details would you like to share with him?', shareHelp: 'Only the details you tick are sent to him. You can edit them.',
      zalo: 'Zalo', email: 'Email', phone: 'Phone',
      contactTitle: 'How would you like the first contact to be?', messages: 'Messages', voice: 'Voice call', video: 'Video call',
      consent: function (h) { return 'I agree that Heritage Union may share the details I have chosen above with ' + h + '.'; },
      consentNote: 'Heritage Union will send you his contact details at the same time.',
      typeName: 'Type your name to confirm', send: 'Send my answer',
      noTitle: 'Thank you for letting us know.', noHelp: 'You don\'t need to give a reason. If you would like to, you can write a few words for Heritage Union. He will never see them.',
      noReason: 'Reason (optional, read only by Heritage Union)', noSend: 'Send my answer',
      askHelp: 'Write your question. Huyen will reply to you, usually on Zalo. The request stays open, so you can decide afterwards.', askSend: 'Send my question',
      askDone: 'Thank you. We have your question and will reply soon. You can come back to this page with the same link to decide.',
      thanksTitle: 'Thank you for your answer.',
      doneYes: 'Thank you. Heritage Union will send him the details you chose, and send you his contact details, very soon.',
      doneNo: 'Thank you. He will only receive a kind note, without any reason.',
      doneExpired: 'This request has expired. You don\'t need to do anything.',
      introduced: 'You have been introduced.', hisContact: 'His contact details',
      youShared: 'The details you shared', withdraw: 'You can still withdraw at any time on the', withdrawLink: 'withdraw page',
      expires: function (d) { return 'This request is open until ' + d + '.'; },
      confirmNo: 'Are you sure you want to say no to this request?',
      errChoose: 'Please tick at least one detail to share.', errContact: 'Please choose how you would like the first contact to be.', errAgree: 'Please tick the box to agree.', errName: 'Please type your name.', errAsk: 'Please write your question.',
    },
  }[LANG];

  function readToken() {
    var m = /(?:^#|&)t=([A-Za-z0-9_-]{43})(?:&|$)/.exec(location.hash || '');
    if (m) {
      try { sessionStorage.setItem(KEY, m[1]); } catch (e) {}
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      return m[1];
    }
    try { return sessionStorage.getItem(KEY); } catch (e) { return null; }
  }
  var token = readToken();
  (function () { var sw = $('in-lang-switch'); if (sw && token) sw.setAttribute('href', sw.getAttribute('href').split('#')[0] + '#t=' + token); })();
  window.addEventListener('hashchange', function () { if (/t=[A-Za-z0-9_-]{43}/.test(location.hash)) location.reload(); });

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') e.textContent = v;
      else if (k === 'class') e.className = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) { if (c !== null && c !== undefined && c !== false) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function errText(d) { return LANG === 'en' && d.error_en ? d.error_en : (d.error || ''); }
  function fmt(iso) { return iso ? new Date(iso).toLocaleDateString(LANG === 'en' ? 'en-GB' : 'vi-VN', { day: 'numeric', month: LANG === 'en' ? 'long' : 'numeric', year: 'numeric' }) : ''; }

  function api(name, body) {
    return fetch(API + name, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', referrerPolicy: 'no-referrer',
      body: JSON.stringify(Object.assign({ token: token, lang: LANG }, body || {})) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401 || r.status === 410) { message(d.code === 'expired' ? TX.expiredTitle : d.code === 'unavailable' ? TX.unavailableTitle : TX.invalidTitle, errText(d)); var e = new Error(''); e.fatal = true; throw e; }
        if (!r.ok) { var e2 = new Error(errText(d) || TX.net); e2.data = d; throw e2; }
        return d;
      });
    }, function () { throw new Error(TX.net); });
  }

  function message(title, text) {
    $('in-loading').hidden = true; $('in-app').hidden = true; $('in-message').hidden = false;
    $('in-message-title').textContent = title; $('in-message-text').textContent = text || '';
  }

  var D = null;

  function section(title, children, cls) { return el('section', { class: 'pf-panel in-section' + (cls ? ' ' + cls : '') }, [title ? el('h2', { text: title }) : null].concat(children)); }

  function render() {
    var app = $('in-app');
    app.innerHTML = '';
    $('in-loading').hidden = true;
    app.hidden = false;
    var h = D.him;
    app.appendChild(el('div', { class: 'in-welcome' }, [el('span', { class: 'eyebrow', text: TX.eyebrow }), el('h1', { text: TX.hello(D.name) }), el('p', { text: TX.lead })]));
    if (D.decision) app.appendChild(outcome());

    // His card
    var place = [h.city, h.country].filter(Boolean).join(', ');
    var gallery = el('div', { class: 'in-photos' });
    (h.photos || []).forEach(function (p, i) { gallery.appendChild(el('img', { src: p.url || '', alt: TX.photos + ' ' + (i + 1) })); });
    var sum = el('div', { class: 'in-summary' });
    sum.innerHTML = h.summaryHtml || ''; // sanitised by the server: paragraphs, bold, italic, lists only
    app.appendChild(section(null, [
      h.photos && h.photos.length ? gallery : null,
      el('h2', { class: 'in-name', text: h.firstName + (h.age ? ', ' + TX.years(h.age) : '') }),
      place ? el('p', { class: 'in-place', text: place }) : null,
      el('h3', { text: TX.about }), sum,
      h.message ? el('h3', { text: TX.message }) : null,
      h.message ? el('blockquote', { class: 'in-message', text: h.message }) : null,
    ], 'in-him'));

    // Declaration
    var dl = el('dl', { class: 'in-decl' });
    h.declaration.forEach(function (it) { dl.appendChild(el('dt', { text: it.label })); dl.appendChild(el('dd', { class: it.flag ? 'is-yes' : '', text: it.text })); });
    app.appendChild(section(TX.decl, [el('p', { class: 'pf-help', text: TX.declIntro }), dl, el('p', { class: 'in-notchecked', id: 'in-notchecked', text: TX.notChecked })]));
    if (D.certificate && D.certificate.requested) app.appendChild(certStatus());

    // Rights
    app.appendChild(section(TX.rightsTitle, [
      el('ul', { class: 'in-rights' }, TX.rights.map(function (r) { return el('li', { text: r }); })),
      el('p', { class: 'pf-help' }, [TX.concern + ' ', el('a', { href: LANG === 'en' ? '/contact?concern=1' : '/vi/contact?concern=1', text: TX.concernLink })]),
    ], 'in-rights-box'));

    if (!D.decision) app.appendChild(actions());
  }

  // The official certificate she asked him for, if any.
  function certStatus() {
    var c = D.certificate;
    var kids = [];
    if (c.status === 'provided') {
      kids.push(el('p', { class: 'in-cert-line is-provided', text: '✓ ' + TX.certProvided }));
      if (c.url) kids.push(el('p', {}, [el('a', { class: 'btn btn--secondary btn--md', id: 'in-cert-view', href: c.url, target: '_blank', rel: 'noopener', text: TX.certView })]));
      kids.push(el('p', { class: 'pf-help', text: TX.certViewNote }));
    } else if (c.status === 'declined') {
      kids.push(el('p', { class: 'in-cert-line is-declined', text: TX.certDeclined }));
      kids.push(el('p', { class: 'pf-help', text: TX.certDeclinedNote }));
    } else {
      kids.push(el('p', { class: 'in-cert-line', text: TX.certWaiting }));
    }
    return section(TX.certTitle, kids, 'in-cert');
  }

  function outcome() {
    var d = D.decision;
    var kids = [];
    if (D.status === 'introduced') {
      kids.push(el('h2', { text: TX.introduced }));
      if (D.hisContact) kids.push(el('dl', { class: 'in-decl' }, [el('dt', { text: TX.hisContact }), el('dd', { text: [D.hisContact.email, D.hisContact.phone].filter(Boolean).join(' · ') })]));
    } else {
      kids.push(el('h2', { text: d.status === 'declined' ? TX.noTitle : d.status === 'expired' ? TX.expiredTitle : TX.thanksTitle }));
      kids.push(el('p', { text: d.status === 'declined' ? TX.doneNo : d.status === 'expired' ? TX.doneExpired : TX.doneYes }));
    }
    if (d.shared) kids.push(el('p', { class: 'pf-help', text: TX.youShared + ': ' + ['zalo', 'email', 'phone'].filter(function (k) { return d.shared[k]; }).map(function (k) { return TX[k] + ' ' + d.shared[k]; }).join(' · ') }));
    kids.push(el('p', { class: 'pf-help' }, [TX.withdraw + ' ', el('a', { href: LANG === 'en' ? '/withdraw' : '/vi/withdraw', text: TX.withdrawLink }), '.']));
    return section(null, kids, 'in-outcome');
  }

  function actions() {
    var box = section(TX.decide, [el('p', { class: 'pf-help', text: D.expiryPaused ? TX.paused : TX.expires(fmt(D.expiresAt)) })], 'in-actions');
    var panel = el('div', { class: 'in-panel' });
    var buttons = el('div', { class: 'in-choices' }, [
      el('button', { type: 'button', class: 'btn btn--primary btn--md in-btn', id: 'in-yes', 'aria-expanded': 'false', text: TX.yes, onclick: function (e) { open(e, yesForm()); } }),
      el('button', { type: 'button', class: 'btn btn--secondary btn--md in-btn', id: 'in-no', 'aria-expanded': 'false', text: TX.no, onclick: function (e) { open(e, noForm()); } }),
      el('button', { type: 'button', class: 'btn btn--secondary btn--md in-btn', id: 'in-ask', 'aria-expanded': 'false', text: TX.ask, onclick: function (e) { open(e, askForm()); } }),
      D.certificate && D.certificate.requested ? null
        : el('button', { type: 'button', class: 'btn btn--secondary btn--md in-btn', id: 'in-cert', 'aria-expanded': 'false', text: TX.cert, onclick: function (e) { open(e, certForm()); } }),
    ]);
    function open(e, form) {
      buttons.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-expanded', b === e.currentTarget ? 'true' : 'false'); });
      panel.innerHTML = '';
      panel.appendChild(form);
      var f = form.querySelector('input, textarea');
      if (f) f.focus();
    }
    box.appendChild(buttons);
    box.appendChild(panel);
    return box;
  }

  function errorLine() { return el('p', { class: 'pf-form-error in-error', role: 'alert' }); }

  function yesForm() {
    var err = errorLine();
    var fields = {};
    var share = el('fieldset', { class: 'in-fieldset' }, [el('legend', { text: TX.shareTitle }), el('p', { class: 'pf-help', text: TX.shareHelp })]);
    ['zalo', 'phone', 'email'].forEach(function (k) {
      var cb = el('input', { type: 'checkbox', id: 'in-share-' + k });
      var input = el('input', { class: 'form-input', type: k === 'email' ? 'email' : 'tel', id: 'in-val-' + k, value: D.prefill[k] || '', 'aria-label': TX[k] });
      cb.checked = k !== 'phone' && !!D.prefill[k];
      input.disabled = !cb.checked;
      cb.addEventListener('change', function () { input.disabled = !cb.checked; if (cb.checked) input.focus(); });
      fields[k] = { cb: cb, input: input };
      share.appendChild(el('div', { class: 'in-share-row' }, [el('label', { class: 'in-check', for: 'in-share-' + k }, [cb, el('span', { text: TX[k] })]), input]));
    });
    var methods = el('fieldset', { class: 'in-fieldset' }, [el('legend', { text: TX.contactTitle })]);
    var mcb = {};
    ['messages', 'voice', 'video'].forEach(function (m) {
      var cb = el('input', { type: 'checkbox', id: 'in-m-' + m });
      mcb[m] = cb;
      methods.appendChild(el('label', { class: 'in-check in-chip', for: 'in-m-' + m }, [cb, el('span', { text: TX[m] })]));
    });
    var agree = el('input', { type: 'checkbox', id: 'in-agree' });
    agree.addEventListener('change', function () { err.textContent = ''; });
    var name = el('input', { class: 'form-input', type: 'text', id: 'in-name', maxlength: 120, autocomplete: 'name' });
    var send = el('button', { type: 'button', class: 'btn btn--primary btn--md in-btn', id: 'in-send-yes', text: TX.send });
    send.addEventListener('click', function () {
      err.textContent = '';
      var s = {};
      Object.keys(fields).forEach(function (k) { if (fields[k].cb.checked && fields[k].input.value.trim()) s[k] = fields[k].input.value.trim(); });
      var contact = Object.keys(mcb).filter(function (m) { return mcb[m].checked; });
      if (!Object.keys(s).length) { err.textContent = TX.errChoose; return; }
      if (!contact.length) { err.textContent = TX.errContact; return; }
      if (!agree.checked) { err.textContent = TX.errAgree; agree.focus(); return; }
      if (name.value.trim().length < 2) { err.textContent = TX.errName; name.focus(); return; }
      send.disabled = true;
      api('intro-decide', { decision: 'accept', share: s, contact: contact, agree: true, typedName: name.value }).then(function () { reload(); }, function (e) { if (!e.fatal) { err.textContent = e.message; send.disabled = false; } });
    });
    return el('div', { class: 'in-form' }, [share, methods,
      el('label', { class: 'in-consent', for: 'in-agree' }, [agree, el('span', { text: TX.consent(D.him.firstName) })]),
      el('p', { class: 'pf-help', text: TX.consentNote }),
      el('label', { class: 'pf-q-label', for: 'in-name', text: TX.typeName }), name, err, send]);
  }

  function noForm() {
    var err = errorLine();
    var reason = el('textarea', { class: 'form-textarea', id: 'in-reason', maxlength: 2000, rows: 4 });
    var send = el('button', { type: 'button', class: 'btn btn--primary btn--md in-btn', id: 'in-send-no', text: TX.noSend });
    send.addEventListener('click', function () {
      if (!window.confirm(TX.confirmNo)) return;
      send.disabled = true;
      api('intro-decide', { decision: 'decline', reason: reason.value }).then(function () { reload(); }, function (e) { if (!e.fatal) { err.textContent = e.message; send.disabled = false; } });
    });
    return el('div', { class: 'in-form' }, [el('p', { text: TX.noHelp }), el('label', { class: 'pf-q-label', for: 'in-reason', text: TX.noReason }), reason, err, send]);
  }

  function askForm() {
    var err = errorLine();
    var msg = el('textarea', { class: 'form-textarea', id: 'in-question', maxlength: 2000, rows: 4 });
    var send = el('button', { type: 'button', class: 'btn btn--primary btn--md in-btn', id: 'in-send-ask', text: TX.askSend });
    var wrap = el('div', { class: 'in-form' }, [el('p', { text: TX.askHelp }), msg, err, send]);
    send.addEventListener('click', function () {
      if (!msg.value.trim()) { err.textContent = TX.errAsk; return; }
      send.disabled = true;
      api('intro-question', { message: msg.value }).then(function () { wrap.innerHTML = ''; wrap.appendChild(el('p', { class: 'in-done', role: 'status', text: TX.askDone })); }, function (e) { if (!e.fatal) { err.textContent = e.message; send.disabled = false; } });
    });
    return wrap;
  }

  function certForm() {
    var err = errorLine();
    var send = el('button', { type: 'button', class: 'btn btn--primary btn--md in-btn', id: 'in-send-cert', text: TX.certSend });
    send.addEventListener('click', function () {
      send.disabled = true;
      api('intro-cert-request', {}).then(function () { reload(); }, function (e) { if (!e.fatal) { err.textContent = e.message; send.disabled = false; } });
    });
    return el('div', { class: 'in-form' }, [el('p', { text: TX.certHelp }), err, send]);
  }

  function reload() { api('intro-get').then(function (d) { D = d; render(); window.scrollTo(0, 0); }, function () {}); }

  if (!token) { message(TX.invalidTitle, TX.noLink); return; }
  api('intro-get').then(function (d) { D = d; render(); }, function (e) { if (!e.fatal) message(TX.invalidTitle, e.message); });
})();
