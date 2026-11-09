// R9 Your profile is ready (to him): James's summary, for him to approve.
const { render } = require('./layout');
module.exports = {
  id: 'R9', name: 'Your profile is ready', audience: 'client',
  when: 'When James sends the profile summary he has written for him to approve.',
  sample: { firstName: 'Michael', link: 'https://heritage-union.com/client#t=EXAMPLE', expiresOn: '8 February 2027' },
  build(d) {
    return render({
      subject: 'Your profile is ready to approve — Heritage Union',
      preheader: 'Please read your profile summary and approve it, or ask for changes.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you for completing your profile. I have written a short summary from your answers. It is what the women you choose will read first, in their own language, with your photos, your background declaration and your message.',
        'Please read it carefully. If it is right, approve it. If anything should change, tell me what, and I will revise it.',
        { button: { label: 'Read and approve your profile', href: d.link } },
        { small: 'This link is private to you and works until ' + d.expiresOn + '.' },
        'Warm regards,',
      ],
    });
  },
};
