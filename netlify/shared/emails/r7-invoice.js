// R7 Invoice (to him), with the PDF invoice attached. Payment details come
// from the INVOICE_PAYMENT_DETAILS env var.
const { render } = require('./layout');
const C = require('../client-config');
module.exports = {
  id: 'R7', name: 'Invoice', audience: 'client',
  when: 'When James sends the invoice (only after both documents are checked). The PDF invoice is attached.',
  sample: { firstName: 'Michael', number: 'HU-2026-0001', description: 'Concierge Initiation', amount: 'USD 15,000.00', dueOn: '23 December 2026',
    paymentDetails: 'Account name: Heritage Union\nBank: (from INVOICE_PAYMENT_DETAILS)\nIBAN / account number: …' },
  build(d) {
    return render({
      subject: 'Invoice ' + d.number + ' — Heritage Union',
      preheader: 'Your invoice for the ' + d.description + ', payable by bank transfer.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you for your patience while we checked your documents. Everything is in order, and I am delighted to welcome you to the next step.',
        'Your invoice is attached as a PDF, and summarised below.',
        { box: { title: 'Invoice ' + d.number, lines: [d.description, d.amount, 'Due by ' + d.dueOn] } },
        { box: { title: 'Payment by ' + C.PAYMENT_METHOD.toLowerCase(), lines: String(d.paymentDetails).split('\n').concat(['Reference: ' + d.number]) } },
        'Please use the invoice number as your payment reference. I will write to you as soon as your payment arrives, with your link to begin your profile.',
        { small: 'Heritage Union will only ever ask you to pay by bank transfer to the account shown on your invoice. If you ever receive a request to pay anyone else, or in any other way, please do not pay and tell us at once.' },
        'Warm regards,',
      ],
    });
  },
};
