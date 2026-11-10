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
          'Application: a short form about you.',
          'Background declaration: a plain, honest declaration about your history, which you sign as a sworn statement. Heritage Union does not carry out background checks; instead, every woman you choose reads your declaration in her own language before she decides, and she may ask you for an official background check.',
          'Agreement: our client agreement, to read and accept.',
          'I read your application and declaration, then send your invoice. Payment is by bank transfer.',
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
