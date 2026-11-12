// R22 A woman would like an official certificate (to him). Sent when the
// team taps "Send certificate request" after she asked on her decision page.
// Providing one is entirely his choice; she is told either way.
const { render } = require('./layout');
module.exports = {
  id: 'R22', name: 'A woman would like an official certificate', audience: 'client',
  when: 'When the team taps "Send certificate request", after a woman asked for an official background check on her decision page.',
  sample: { firstName: 'Michael', herName: 'Hoa', link: 'https://heritage-union.com/client#t=EXAMPLE', expiresOn: '10 January 2027' },
  build(d) {
    return render({
      subject: d.herName + ' would like an official certificate — Heritage Union',
      preheader: 'Before she decides, ' + d.herName + ' has asked for an official criminal record certificate.',
      blocks: [
        'Dear ' + d.firstName + ',',
        d.herName + ' has read your profile and your background declaration. Before she decides, she would like you to provide an official criminal record certificate from your country of residence (for example a DBS check in the UK, a national police certificate in Australia, or an FBI Identity History Summary in the US).',
        'This is entirely your choice. You may provide one, or decline; either way, she will be told your answer, and you don\'t need to give a reason. Her request to you stays open in the meantime.',
        'If you provide one, it is kept privately, shown only to ' + d.herName + ' through a short-lived link, and deleted 6 months after your engagement closes.',
        { button: { label: 'Provide a certificate, or decline', href: d.link } },
        { small: 'This link is private to you and works until ' + d.expiresOn + '.' },
        'Warm regards,',
      ],
    });
  },
};
