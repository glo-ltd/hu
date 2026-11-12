// R4 Not the right fit (to him). Kind and brief, with no reasons.
const { render } = require('./layout');
module.exports = {
  id: 'R4', name: 'Not the right fit', audience: 'client',
  when: 'When James taps "Not the right fit" (any time before an invoice is sent).',
  sample: { firstName: 'Michael' },
  build(d) {
    return render({
      subject: 'Thank you — Heritage Union',
      preheader: 'Thank you for your time.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you for the time you have given to Heritage Union, and for speaking with me so openly.',
        'Having thought about it carefully, I don\'t believe we are the right service for you, and I would rather tell you that honestly than take you further.',
        'I wish you every happiness in your search.',
        'Warm regards,',
      ],
    });
  },
};
