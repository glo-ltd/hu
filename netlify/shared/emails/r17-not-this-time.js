// R17 Not this time (to him), when she declines or doesn't answer in 30 days.
// Kind, and never a reason.
const { render } = require('./layout');
module.exports = {
  id: 'R17', name: 'Not this time', audience: 'client',
  when: 'Automatically, when she says no, or (phase 4) when her 30 days pass without an answer.',
  sample: { firstName: 'Michael', herName: 'Lan', canReplace: true, link: 'https://heritage-union.com/client#t=EXAMPLE', expiresOn: '8 February 2027' },
  build(d) {
    const blocks = [
      'Dear ' + d.firstName + ',',
      'Thank you for your patience. Your request to be introduced to ' + d.herName + ' has not led to an introduction this time.',
      'Every woman decides freely, and in her own time, and is never asked to give a reason. Please don\'t take it to heart.',
    ];
    if (d.canReplace) {
      blocks.push('If you would like to, you can choose someone else from the profiles on your list.');
      blocks.push({ button: { label: 'Choose someone else', href: d.link } });
      blocks.push({ small: 'This link is private to you and works until ' + d.expiresOn + '.' });
    }
    blocks.push('Warm regards,');
    return render({ subject: 'An update on your introduction — Heritage Union', preheader: 'An update on your request.', blocks });
  },
};
