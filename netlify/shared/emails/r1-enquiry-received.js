// R1 Enquiry received (to him, automatically after the enquiry form).
const { render, SITE } = require('./layout');
module.exports = {
  id: 'R1', name: 'Enquiry received', audience: 'client',
  when: 'Automatically, when he sends the enquiry form (F1).',
  sample: { firstName: 'Michael' },
  build(d) {
    return render({
      subject: 'Thank you for your enquiry — Heritage Union',
      preheader: 'James will reply to you personally within one working day.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you for getting in touch with Heritage Union. Your message has reached me, and I will reply to you personally within one working day.',
        'If you would like to talk things through sooner, you are welcome to book a free, private 30-minute call with me at a time that suits you.',
        { button: { label: 'Book a free call', href: SITE + '/contact#book' } },
        'You can also request our Service & Investment Structure, which sets out exactly how the service works and what it costs.',
        { button: { label: 'Request the fee document', href: SITE + '/request-fee-structure' } },
        'Everything you share with us is held in strict confidence.',
        'Warm regards,',
      ],
    });
  },
};
