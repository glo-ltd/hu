// R19 Congratulations (to him), with the honour-payment invoice attached.
// Only ever sent when James presses "Relationship success".
const { render } = require('./layout');
const C = require('../client-config');
module.exports = {
  id: 'R19', name: 'Congratulations', audience: 'client',
  when: 'Only when James presses "Relationship success" on the team page. The honour-payment invoice is attached.',
  sample: { firstName: 'Michael', number: 'HU-2027-0004', amount: 'USD 10,000.00', dueOn: '23 June 2027', paymentDetails: 'Account name: Heritage Union\nIBAN: …' },
  build(d) {
    return render({
      subject: 'Congratulations — Heritage Union',
      preheader: 'With our warmest congratulations.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Congratulations. Huyen and I are so happy for you both. Thank you for letting us be a small part of your story.',
        'As set out in your client agreement, the ' + C.FEES.honour.label.toLowerCase() + ' is now due. Your invoice is attached and summarised below.',
        { box: { title: 'Invoice ' + d.number, lines: [C.FEES.honour.label, d.amount, 'Due by ' + d.dueOn] } },
        { box: { title: 'Payment by ' + C.PAYMENT_METHOD.toLowerCase(), lines: String(d.paymentDetails).split('\n').concat(['Reference: ' + d.number]) } },
        'We are always here if you need us, now and in the future.',
        'With warmest wishes,',
      ],
    });
  },
};
