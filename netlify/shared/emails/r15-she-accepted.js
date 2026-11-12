// R15 She'd like to be introduced (to him): her first name, the details she
// chose to share, how she'd like the first contact, and a short guide.
const { render } = require('./layout');
const METHOD = { messages: 'messages', voice: 'a voice call', video: 'a video call' };
module.exports = {
  id: 'R15', name: 'She would like to be introduced', audience: 'client',
  when: 'When the team taps "Introduce" after she has said yes on her decision page.',
  sample: { firstName: 'Michael', herName: 'Hoa', details: { zalo: '0912 345 678', email: 'hoa@example.vn' }, contact: ['messages', 'video'] },
  build(d) {
    const lines = [];
    if (d.details.zalo) lines.push('Zalo: ' + d.details.zalo);
    if (d.details.phone) lines.push('Phone: ' + d.details.phone);
    if (d.details.email) lines.push('Email: ' + d.details.email);
    const how = (d.contact || []).map((m) => METHOD[m] || m);
    return render({
      subject: d.herName + ' would like to be introduced — Heritage Union',
      preheader: 'Good news, and how to begin.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'I am delighted to tell you that ' + d.herName + ' has read your profile, your background declaration and your message, and would like to be introduced to you.',
        { box: { title: 'The details ' + d.herName + ' chose to share', lines } },
        how.length ? d.herName + ' would prefer to begin with ' + (how.length > 1 ? how.slice(0, -1).join(', ') + ' or ' + how[how.length - 1] : how[0]) + '.' : '',
        { h: 'A short guide for your first conversations' },
        { list: [
          'Time zones: Vietnam is UTC+7. Suggest times that suit her day, not just yours.',
          'Language: write simply and kindly. Translation apps help, and Huyen can help with anything important, in both directions.',
          'Patience: let things unfold at her pace. There is no rush, and no pressure on either of you.',
          'Money: never ask her for money, and never send money, gifts of money or bank details. If anyone ever asks you for money, stop and tell us at once.',
          'Huyen: to reach her, reply to this email and James will connect you.',
        ] },
        'Please treat her details with care and keep them private. Use them only to get to know her.',
        'Warm regards,',
      ].filter(Boolean),
    });
  },
};
