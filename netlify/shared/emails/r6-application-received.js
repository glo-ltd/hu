// R6 Application received (to him, when he submits).
const { render } = require('./layout');
module.exports = {
  id: 'R6', name: 'Application received', audience: 'client',
  when: 'Automatically, when he sends his application.',
  sample: { firstName: 'Michael' },
  build(d) {
    return render({
      subject: 'Application received — Heritage Union',
      preheader: 'We\'ll be in touch within 3 working days.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you. Your application and signed background declaration have reached us safely.',
        'I will read them personally and be in touch within 3 working days. If everything is in order, the next email you receive from me will be your invoice.',
        'If anything in your application changes in the meantime, simply reply to this email.',
        'Warm regards,',
      ],
    });
  },
};
