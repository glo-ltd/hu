// R11 Profiles ready to review (to him), with the review link (30 days).
const { render } = require('./layout');
const C = require('../client-config');
module.exports = {
  id: 'R11', name: 'Profiles ready to review', audience: 'client',
  when: 'When James sends him his shortlist from the matching screen.',
  sample: { firstName: 'Michael', count: 12, link: 'https://heritage-union.com/client#t=EXAMPLE', expiresOn: '8 February 2027' },
  build(d) {
    return render({
      subject: 'Your profiles are ready — Heritage Union',
      preheader: d.count + ' profiles are ready for you to read.',
      blocks: [
        'Dear ' + d.firstName + ',',
        d.count + ' women whose own answers meet your must-haves have chosen to let clients see their profiles. Their profiles are ready for you to read.',
        'Take your time. When you are ready, choose up to ' + C.CHOICES_MAX + ', in order of preference, and send your choices. Your choices can\'t be changed afterwards except by writing to me, so please choose carefully.',
        { button: { label: 'Read the profiles', href: d.link } },
        'These profiles are shared with you in confidence. Please don\'t copy, save or share them, or their photos, with anyone.',
        { small: 'This link is private to you and works until ' + d.expiresOn + '.' },
        'Warm regards,',
      ],
    });
  },
};
