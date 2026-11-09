// R20 Twelve months complete (to him): confirms nothing more is owed.
const { render } = require('./layout');
const C = require('../client-config');
module.exports = {
  id: 'R20', name: 'Twelve months complete', audience: 'client',
  when: 'When James presses "12 months complete" on the team page.',
  sample: { firstName: 'Michael' },
  build(d) {
    return render({
      subject: 'Your engagement is complete — Heritage Union',
      preheader: 'Thank you, and nothing more is owed.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Your ' + C.ENGAGEMENT_MONTHS + '-month engagement with Heritage Union is now complete. Thank you for the trust you have placed in us.',
        'To confirm: nothing more is owed. No further fees are due from you.',
        'As promised in our Privacy Policy, your identity documents will be deleted ' + C.DOCUMENT_RETENTION_MONTHS_AFTER_CLOSE + ' months from today.',
        'I wish you every happiness, and you are always welcome to write to me.',
        'Warm regards,',
      ],
    });
  },
};
