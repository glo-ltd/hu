// R10 Profile approved (to him).
const { render } = require('./layout');
const C = require('../client-config');
module.exports = {
  id: 'R10', name: 'Profile approved', audience: 'client',
  when: 'Automatically, when he approves his profile summary.',
  sample: { firstName: 'Michael' },
  build(d) {
    return render({
      subject: 'Thank you — your profile is approved',
      preheader: 'Your profiles will be ready ' + C.MATCHING_TIME_TEXT + '.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you for approving your profile.',
        'I will now look for women whose own answers meet the things that matter most to you. Every woman we show you has registered herself and chosen to let clients see her profile.',
        'Your profiles will be ready ' + C.MATCHING_TIME_TEXT + '. I will email you as soon as they are.',
        'Warm regards,',
      ],
    });
  },
};
