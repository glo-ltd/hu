// R13 A client would like to be introduced to you (to her, in her language).
// Sent by email if she has one, and always given to the team as a Zalo
// message to copy (zalo()).
// TODO(James): approve wording. Huyen to proofread the Vietnamese.
const { render } = require('./layout');

const T = {
  vi: {
    subject: 'Một khách hàng mong được làm quen với bạn — Heritage Union',
    hello: (n) => 'Chào ' + n + ',',
    news: 'Heritage Union xin báo với bạn: một khách hàng đã đọc hồ sơ của bạn và mong được làm quen với bạn.',
    read: 'Bạn có thể xem hồ sơ, ảnh, lời nhắn và bản khai lý lịch của anh ấy, bằng tiếng Việt, qua đường link riêng này:',
    button: 'Xem hồ sơ của anh ấy',
    free: 'Bạn hoàn toàn không có nghĩa vụ gì. Bạn có thể đồng ý, từ chối mà không cần nêu lý do, hoặc hỏi chúng tôi trước khi quyết định. Bạn không bao giờ phải trả bất kỳ khoản tiền nào.',
    expiry: (d) => 'Đường link chỉ dành riêng cho bạn và dùng được đến ngày ' + d + '. Vui lòng không chia sẻ đường link này.',
    regards: 'Trân trọng,',
  },
  en: {
    subject: 'A client would like to be introduced to you — Heritage Union',
    hello: (n) => 'Dear ' + n + ',',
    news: 'A Heritage Union client has read your profile and would like to be introduced to you.',
    read: 'You can read his profile, his photos, his message and his background declaration through this private link:',
    button: 'Read his profile',
    free: 'You are under no obligation at all. You can say yes, say no without giving any reason, or ask us a question first. You never pay anything.',
    expiry: (d) => 'This link is just for you and works until ' + d + '. Please don\'t share it.',
    regards: 'Warm regards,',
  },
};

function build(d) {
  const t = T[d.lang === 'en' ? 'en' : 'vi'];
  return render({
    subject: t.subject, lang: d.lang, preheader: t.news,
    blocks: [t.hello(d.name), t.news, t.read, { button: { label: t.button, href: d.link } }, t.free, { small: t.expiry(d.expiresOn) }, t.regards],
  });
}

function zalo(d) {
  const t = T[d.lang === 'en' ? 'en' : 'vi'];
  return [t.hello(d.name), '', t.news, '', t.read, d.link, '', t.free, '', t.expiry(d.expiresOn), '', t.regards, 'Heritage Union'].join('\n');
}

const sample = { name: 'Hoa', link: 'https://heritage-union.com/vi/gioi-thieu#t=EXAMPLE', expiresOn: '8/1/2027' };
module.exports = {
  id: 'R13', name: 'A client would like to be introduced to you', audience: 'woman', build, zalo,
  when: 'When the team taps "Send to her". By email if she has one; the team always gets the same text to paste into Zalo.',
  variants: {
    vi: { name: 'Tiếng Việt', audience: 'woman', when: 'Her preferred language is Vietnamese.', sample: Object.assign({ lang: 'vi' }, sample), build },
    en: { name: 'English', audience: 'woman', when: 'Her preferred language is English.', sample: Object.assign({ lang: 'en' }, sample, { link: 'https://heritage-union.com/introduction#t=EXAMPLE', expiresOn: '8 January 2027' }), build },
  },
};
