// R2 Fee document (to whoever requests it on /request-fee-structure).
const { render, SITE } = require('./layout');
module.exports = {
  id: 'R2', name: 'Fee document', audience: 'client',
  when: 'Automatically, when anyone requests the fee document. The PDF is attached.',
  sample: { firstName: 'Michael' },
  build(d) {
    return render({
      subject: 'Heritage Union — Service & Investment Structure',
      preheader: 'Our Service & Investment Structure is attached.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you for your interest in Heritage Union. As requested, I have attached our Service & Investment Structure, which sets out exactly how our engagement works and how fees are structured.',
        'If you have any questions after reading it, simply reply to this email. Or, if you would like to talk it through, book a free, no-obligation call with me.',
        { button: { label: 'Book a free call', href: SITE + '/contact#book' } },
        'Warm regards,',
      ],
    });
  },
};
