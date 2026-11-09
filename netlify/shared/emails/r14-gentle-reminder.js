// R14 A gentle reminder (to her, in her language), 14 days after the request
// if she hasn't answered. Sent by daily-tasks by email if she has one;
// otherwise the team gets the same text to paste into Zalo.
// TODO(James): approve wording. Huyen to proofread the Vietnamese.
const { render } = require('./layout');

const T = {
  vi: {
    subject: 'Nhắc nhẹ về lời mời làm quen — Heritage Union',
    hello: (n) => 'Chào ' + n + ',',
    body: 'Heritage Union chỉ nhắc nhẹ: hai tuần trước, một khách hàng đã mong được làm quen với bạn. Bạn không cần vội, và hoàn toàn không có nghĩa vụ gì.',
    choice: 'Nếu bạn muốn trả lời, dù là đồng ý, từ chối hay hỏi thêm, bạn có thể mở lại đường link riêng trong tin nhắn trước của chúng tôi, hoặc chỉ cần nhắn cho Heritage Union qua Zalo.',
    none: (d) => 'Nếu bạn không trả lời, lời mời sẽ tự hết hạn vào ngày ' + d + ', và anh ấy chỉ nhận được một lời báo nhẹ nhàng, không kèm lý do. Bạn không bao giờ phải trả bất kỳ khoản tiền nào.',
    regards: 'Trân trọng,',
  },
  en: {
    subject: 'A gentle reminder about your introduction request — Heritage Union',
    hello: (n) => 'Dear ' + n + ',',
    body: 'Just a gentle reminder: two weeks ago, a Heritage Union client asked to be introduced to you. There is no rush, and you are under no obligation.',
    choice: 'If you would like to answer, whether yes, no or with a question, just open the private link in our earlier message, or reply to Heritage Union on Zalo.',
    none: (d) => 'If you don\'t answer, the request simply expires on ' + d + ', and he only receives a kind note, without any reason. You never pay anything.',
    regards: 'Warm regards,',
  },
};

function build(d) {
  const t = T[d.lang === 'en' ? 'en' : 'vi'];
  const blocks = [t.hello(d.name), t.body, t.choice, t.none(d.expiresOn), t.regards];
  return render({ subject: t.subject, lang: d.lang, preheader: t.body, blocks });
}
function zalo(d) {
  const t = T[d.lang === 'en' ? 'en' : 'vi'];
  return [t.hello(d.name), '', t.body, '', t.choice, '', t.none(d.expiresOn), '', t.regards, 'Heritage Union'].join('\n');
}
const sample = { name: 'Hoa', expiresOn: '8/1/2027' };
module.exports = {
  id: 'R14', name: 'A gentle reminder', audience: 'woman', build, zalo,
  when: 'Automatically (daily-tasks), 14 days after the request if she hasn\'t answered. Email if she has one; otherwise the team is asked to send it on Zalo.',
  variants: {
    vi: { name: 'Tiếng Việt', audience: 'woman', when: 'Her preferred language is Vietnamese.', sample: Object.assign({ lang: 'vi' }, sample), build },
    en: { name: 'English', audience: 'woman', when: 'Her preferred language is English.', sample: Object.assign({ lang: 'en' }, sample, { expiresOn: '8 January 2027' }), build },
  },
};
