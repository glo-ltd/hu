// R21 Feedback (to him), sent with every closing, with a private link to a
// short form. Nothing is ever published without the permission he gives there.
const { render } = require('./layout');
module.exports = {
  id: 'R21', name: 'Your feedback', audience: 'client',
  when: 'With every closing (relationship success, 12 months complete, or close).',
  sample: { firstName: 'Michael', link: 'https://heritage-union.com/feedback#t=EXAMPLE', expiresOn: '8 March 2027' },
  build(d) {
    return render({
      subject: 'Would you share your thoughts? — Heritage Union',
      preheader: 'Two minutes, and entirely optional.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Would you tell me how you found Heritage Union? It takes two minutes, and it helps us look after the men and women who come after you.',
        { button: { label: 'Share your feedback', href: d.link } },
        'We will only ever publish what you write if you give us written permission on the form, and only in the way you choose.',
        { small: 'This link is private to you and works until ' + d.expiresOn + '.' },
        'Thank you,',
      ],
    });
  },
};
