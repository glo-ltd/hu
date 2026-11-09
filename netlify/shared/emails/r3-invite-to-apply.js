// R3 Invite to apply (to him, when James taps "Invite to apply" after the call).
const { render } = require('./layout');
const C = require('../client-config');
module.exports = {
  id: 'R3', name: 'Invitation to apply', audience: 'client',
  when: 'When James taps "Invite to apply" after the call. The fee PDF is attached; the link is valid 30 days.',
  sample: { firstName: 'Michael', link: 'https://heritage-union.com/client#t=EXAMPLE', expiresOn: '8 January 2027' },
  build(d) {
    return render({
      subject: 'Your invitation to apply — Heritage Union',
      preheader: 'Your private application link, and a summary of what happens next.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you for speaking with me. I enjoyed our conversation, and I would be glad to invite you to apply to Heritage Union.',
        { h: 'What happens next' },
        { list: [
          'Application: a short form about you, with a copy of your photo ID.',
          'Background declaration: a plain, honest declaration about your history, with an official criminal record certificate from your country of residence, issued within the last ' + C.CERTIFICATE_MAX_AGE_MONTHS + ' months. Any woman you are introduced to will read this declaration in her own language.',
          'Agreement: our client agreement, to read and accept.',
          'We check your documents, then send your invoice. Payment is by bank transfer.',
          'Once payment is received, you write your profile, and we prepare your introductions ' + C.MATCHING_TIME_TEXT + '.',
        ] },
        'Our Service & Investment Structure is attached again for reference. You can also download it at heritage-union.com/assets/documents/heritage-union-fee-structure.pdf.',
        { button: { label: 'Start your application', href: d.link } },
        { small: 'This link is private to you and works until ' + d.expiresOn + '. Please don\'t forward it. If it expires, just reply and I\'ll send a new one.' },
        'Warm regards,',
      ],
    });
  },
};
