/* "Report a concern": /contact?concern=1 and /vi/contact?concern=1 swap the
   ordinary contact form for a concern form. Anyone can use it. It always
   reaches the team. Without ?concern=1, adds a small link to it. */
(function () {
  'use strict';
  var vi = document.documentElement.lang === 'vi';
  var host = document.getElementById('enquiry-wrap') || (document.querySelector('form[name="contact-vi"]') || {}).parentNode;
  if (!host) return;
  var T = vi ? {
    link: 'Cần báo cáo một vấn đề? Bấm vào đây.', heading: 'Báo cáo một vấn đề', intro: 'Nếu có điều gì khiến bạn lo ngại, như một yêu cầu về tiền bạc, một hành vi không phù hợp, hay bất cứ điều gì khác, hãy cho chúng tôi biết. Mọi báo cáo đều được giữ kín và được đọc trong ngày.',
    about: 'Điều này liên quan đến', aboutOpts: [['client', 'Một khách hàng (người đàn ông)'], ['woman', 'Một ứng viên (người phụ nữ)'], ['heritage_union', 'Heritage Union hoặc nhân viên của chúng tôi'], ['other', 'Điều khác']],
    role: 'Bạn là', roleOpts: [['candidate', 'Ứng viên đã đăng ký'], ['client', 'Khách hàng'], ['other', 'Người khác']],
    subject: 'Tên hoặc mã tham chiếu của người đó, nếu bạn biết (không bắt buộc)', what: 'Chuyện gì đã xảy ra?',
    name: 'Tên của bạn (không bắt buộc)', contact: 'Số Zalo hoặc email để chúng tôi trả lời bạn (không bắt buộc)',
    send: 'Gửi báo cáo', sending: 'Đang gửi…', done: 'Cảm ơn bạn đã cho chúng tôi biết. Chúng tôi sẽ đọc ngay hôm nay. Nếu bạn để lại cách liên lạc, chúng tôi sẽ trả lời bạn.',
    urgent: 'Nếu bạn đang gặp nguy hiểm, hãy gọi ngay số khẩn cấp tại nơi bạn ở (tại Việt Nam: 113).', err: 'Đã có lỗi xảy ra. Bạn vui lòng thử lại.',
  } : {
    link: 'Need to report a concern? Use our concern form.', heading: 'Report a concern', intro: 'If anything has worried you (a request for money, inappropriate behaviour, or anything else), please tell us. Every report is handled in confidence and read the same day.',
    about: 'This is about', aboutOpts: [['client', 'A client (a man using the service)'], ['woman', 'A candidate (a woman who registered)'], ['heritage_union', 'Heritage Union or our team'], ['other', 'Something else']],
    role: 'You are', roleOpts: [['client', 'A client'], ['candidate', 'A registered candidate'], ['other', 'Someone else']],
    subject: 'Their name or reference, if you know it (optional)', what: 'What happened?',
    name: 'Your name (optional)', contact: 'Email, phone or Zalo so we can reply (optional)',
    send: 'Send report', sending: 'Sending…', done: 'Thank you for telling us. We will read it today. If you left your contact details, we will reply to you.',
    urgent: 'If you are in danger, call your local emergency number now.', err: 'Something went wrong. Please try again.',
  };
  var params = new URLSearchParams(location.search);
  if (params.get('concern') !== '1') {
    var p = document.createElement('p');
    p.className = 'form-note';
    var a = document.createElement('a');
    a.href = location.pathname + '?concern=1';
    a.textContent = T.link;
    p.appendChild(a);
    host.appendChild(p);
    return;
  }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function select(name, label, opts) {
    var s = el('select', { class: 'form-input', id: 'cn-' + name, name: name, required: 'required' }, [el('option', { value: '', text: '…' })].concat(opts.map(function (o) { return el('option', { value: o[0], text: o[1] }); })));
    return el('div', { class: 'form-field' }, [el('label', { class: 'form-label', for: 'cn-' + name, text: label }), s]);
  }
  function field(name, label, tag, max) {
    var i = el(tag || 'input', { class: tag === 'textarea' ? 'form-textarea' : 'form-input', id: 'cn-' + name, name: name, maxlength: String(max) });
    if (!tag) i.type = 'text';
    return el('div', { class: 'form-field' }, [el('label', { class: 'form-label', for: 'cn-' + name, text: label }), i]);
  }
  var heading = document.getElementById('contact-heading');
  if (heading) heading.textContent = T.heading;
  var err = el('p', { class: 'fee-form-error', role: 'alert' });
  var btn = el('button', { class: 'btn btn--primary btn--md', type: 'submit', id: 'cn-send', text: T.send, style: 'justify-self:start' });
  var form = el('form', { class: 'contact-form concern-form', id: 'concern-form', novalidate: 'novalidate' }, [
    el('p', { text: T.intro }),
    el('p', { class: 'concern-urgent', text: T.urgent }),
    el('p', { style: 'position:absolute;left:-9999px', 'aria-hidden': 'true' }, [el('label', {}, ['Leave blank', el('input', { name: 'website', tabindex: '-1', autocomplete: 'off' })])]),
    select('about', T.about, T.aboutOpts), select('role', T.role, T.roleOpts),
    field('subject', T.subject, null, 200), field('message', T.what, 'textarea', 5000),
    field('name', T.name, null, 120), field('contact', T.contact, null, 200), err, btn,
  ]);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (n) { return form.elements[n].value.trim(); };
    btn.disabled = true; btn.textContent = T.sending;
    fetch('/.netlify/functions/concern-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      about: v('about'), role: v('role'), subject: v('subject'), message: v('message'), name: v('name'), contact: v('contact'), website: v('website'), lang: vi ? 'vi' : 'en',
    }) }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var x = new Error(d.error || T.err); x.field = d.field; throw x; } }); })
      .then(function () { form.innerHTML = ''; form.appendChild(el('div', { class: 'fee-form-success concern-done', role: 'status', tabindex: '-1' }, [el('p', { text: T.done })])); form.firstChild.focus(); },
        function (x) { err.textContent = x.message; err.classList.add('visible'); btn.disabled = false; btn.textContent = T.send; var f = x.field && form.elements[x.field]; if (f) f.focus(); });
  });
  Array.prototype.forEach.call(host.children, function (c) { c.hidden = true; c.style.display = 'none'; });
  host.appendChild(form);
  var sec = document.getElementById('contact-form');
  if (sec) setTimeout(function () { sec.scrollIntoView(); form.querySelector('select').focus({ preventScroll: true }); }, 50);
})();
