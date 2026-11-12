// R16 His contact details (to her, in her language), by email if she has
// one, and as a Zalo message for the team to copy (zalo()).
// TODO(James): approve wording. Huyen to proofread the Vietnamese.
const { render } = require('./layout');

const T = {
  vi: {
    subject: (h) => 'Thông tin liên lạc của ' + h + ' — Heritage Union',
    hello: (n) => 'Chào ' + n + ',',
    thanks: (h) => 'Cảm ơn bạn đã đồng ý được giới thiệu với ' + h + '. Anh ấy đã nhận được những thông tin bạn chọn chia sẻ, và biết bạn muốn được liên lạc lần đầu như thế nào.',
    his: (h) => 'Thông tin liên lạc của ' + h,
    phone: 'Điện thoại / WhatsApp',
    guide: 'Một vài lời khuyên cho những lần trò chuyện đầu tiên',
    tips: [
      'Hãy từ từ. Bạn không cần vội, và không có ai ép buộc bạn.',
      'Giờ ở Việt Nam và nước của anh ấy có thể chênh nhau nhiều tiếng. Hãy chọn giờ thuận tiện cho bạn.',
      'Không bao giờ gửi hoặc nhận tiền, và không chia sẻ thông tin ngân hàng hay giấy tờ tùy thân. Nếu có ai hỏi bạn về tiền, hãy dừng lại và báo ngay cho chúng tôi.',
      'Nếu gặp mặt, hãy gặp ở nơi công cộng và báo cho người thân biết.',
      'Huyền luôn sẵn sàng hỗ trợ bạn bằng tiếng Việt, kể cả giúp dịch. Bạn chỉ cần nhắn cho Heritage Union qua Zalo, hoặc email team@heritage-union.com.',
    ],
    stop: 'Bạn vẫn có thể dừng lại bất cứ lúc nào, không cần giải thích. Đăng ký hoàn toàn miễn phí, và bạn không bao giờ phải trả bất kỳ khoản tiền nào.',
    regards: 'Trân trọng,',
  },
  en: {
    subject: (h) => h + '\'s contact details — Heritage Union',
    hello: (n) => 'Dear ' + n + ',',
    thanks: (h) => 'Thank you for agreeing to be introduced to ' + h + '. He has received the details you chose to share, and knows how you would like the first contact to be.',
    his: (h) => h + '\'s contact details',
    phone: 'Phone / WhatsApp',
    guide: 'A few tips for your first conversations',
    tips: [
      'Take your time. There is no rush, and no one can pressure you.',
      'There may be several hours\' time difference between Vietnam and his country. Choose times that suit you.',
      'Never send or receive money, and never share bank details or identity documents. If anyone asks you about money, stop and tell us at once.',
      'If you meet, meet in a public place and tell someone close to you.',
      'Huyen is always there to help you in Vietnamese, including with translation. Just message Heritage Union on Zalo, or email team@heritage-union.com.',
    ],
    stop: 'You can stop at any time, without explaining why. Registering is free, and you never pay anything.',
    regards: 'Warm regards,',
  },
};

function lines(d, t) {
  const out = [];
  if (d.hisEmail) out.push('Email: ' + d.hisEmail);
  if (d.hisPhone) out.push(t.phone + ': ' + d.hisPhone);
  return out;
}

function build(d) {
  const t = T[d.lang === 'en' ? 'en' : 'vi'];
  return render({
    subject: t.subject(d.hisName), lang: d.lang, preheader: t.thanks(d.hisName),
    blocks: [t.hello(d.name), t.thanks(d.hisName), { box: { title: t.his(d.hisName), lines: lines(d, t) } }, { h: t.guide }, { list: t.tips }, t.stop, t.regards],
  });
}

function zalo(d) {
  const t = T[d.lang === 'en' ? 'en' : 'vi'];
  return [t.hello(d.name), '', t.thanks(d.hisName), '', t.his(d.hisName) + ':'].concat(lines(d, t), ['', t.guide + ':'], t.tips.map((x) => '- ' + x), ['', t.stop, '', t.regards, 'Heritage Union']).join('\n');
}

const sample = { name: 'Hoa', hisName: 'Michael', hisEmail: 'michael@example.com', hisPhone: '+44 7700 900123' };
module.exports = {
  id: 'R16', name: 'His contact details', audience: 'woman', build, zalo,
  when: 'When the team taps "Introduce". By email if she has one; the team always gets the same text to paste into Zalo.',
  variants: {
    vi: { name: 'Tiếng Việt', audience: 'woman', when: 'Her preferred language is Vietnamese.', sample: Object.assign({ lang: 'vi' }, sample), build },
    en: { name: 'English', audience: 'woman', when: 'Her preferred language is English.', sample: Object.assign({ lang: 'en' }, sample), build },
  },
};
