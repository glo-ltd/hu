// R8 Welcome (to him, when James marks payment received).
const { render } = require('./layout');
const C = require('../client-config');
module.exports = {
  id: 'R8', name: 'Welcome', audience: 'client',
  when: 'When James marks the invoice paid.',
  sample: { firstName: 'Michael', link: 'https://heritage-union.com/client#t=EXAMPLE', expiresOn: '8 February 2027', endsOn: '9 December 2027' },
  build(d) {
    return render({
      subject: 'Welcome to Heritage Union',
      preheader: 'Your payment has arrived. Here is how we begin.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Your payment has arrived, thank you. It is a pleasure to welcome you to Heritage Union.',
        'Your engagement runs for ' + C.ENGAGEMENT_MONTHS + ' months, until ' + d.endsOn + '.',
        { h: 'Your first step: your profile' },
        'Your profile is what the women you choose will read, in their own language. It takes about 20 minutes, saves as you go, and you can come back to it at any time with the link below.',
        { button: { label: 'Begin your profile', href: d.link } },
        'Once your profile is ready, I will write a short summary for you to approve, and then prepare your introductions ' + C.MATCHING_TIME_TEXT + '.',
        { small: 'This link is private to you and works until ' + d.expiresOn + '. If it expires, just reply and I\'ll send a new one.' },
        'Warm regards,',
      ],
    });
  },
};
