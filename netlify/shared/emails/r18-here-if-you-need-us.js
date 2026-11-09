// R18 We're here if you need us (to him), once, 3 months after his first introduction.
const { render } = require('./layout');
module.exports = {
  id: 'R18', name: 'We\'re here if you need us', audience: 'client',
  when: 'Automatically (daily-tasks), once, 3 months after his first introduction.',
  sample: { firstName: 'Michael' },
  build(d) {
    return render({
      subject: 'We\'re here if you need us — Heritage Union',
      preheader: 'A short note, three months on.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'It is three months since your first introduction, and I wanted to say that Huyen and I are still here for you.',
        'If you would like help with anything (translation, understanding cultural differences, planning a visit, or simply talking something through), just reply to this email.',
        'And if anything has ever concerned you, please tell us in confidence.',
        'Warm regards,',
      ],
    });
  },
};
