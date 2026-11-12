// R5 Your private link (to him). Re-sendable from the team page; the old
// link stops working whenever a new one is sent.
const { render } = require('./layout');
module.exports = {
  id: 'R5', name: 'Your private link', audience: 'client',
  when: 'When James taps "Send a new private link". The old link stops working.',
  sample: { firstName: 'Michael', link: 'https://heritage-union.com/client#t=EXAMPLE', expiresOn: '8 January 2027', purpose: 'application' },
  build(d) {
    const purpose = d.purpose === 'application' ? 'continue your application' : 'open your private Heritage Union page';
    return render({
      subject: 'Your private link — Heritage Union',
      preheader: 'Your new private link to ' + purpose + '.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Here is your new private link to ' + purpose + '. Anything you have already saved is still there.' + (d.purpose === 'application' ? ' Your application has three parts: about you, your sworn background declaration, and the client agreement.' : ''),
        { button: { label: d.purpose === 'application' ? 'Continue your application' : 'Open your page', href: d.link } },
        { small: 'This link is private to you and works until ' + d.expiresOn + '. Any earlier link no longer works. Please don\'t forward it.' },
        'Warm regards,',
      ],
    });
  },
};
