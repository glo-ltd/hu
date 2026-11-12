// R12 Your choices are received (to him).
const { render } = require('./layout');
module.exports = {
  id: 'R12', name: 'Your choices are received', audience: 'client',
  when: 'Automatically, when he sends his choices.',
  sample: { firstName: 'Michael', count: 5 },
  build(d) {
    return render({
      subject: 'Your choices are received — Heritage Union',
      preheader: 'What happens next.',
      blocks: [
        'Dear ' + d.firstName + ',',
        'Thank you. Your ' + d.count + (d.count === 1 ? ' choice has' : ' choices have') + ' reached me.',
        'Next, Huyen and I will share your profile, your background declaration and your message with the woman you chose first, in her own language. She will decide, freely and in her own time, whether she would like to be introduced. If she would, I will send you the contact details she chooses to share.',
        'A woman never has to give a reason if she says no, and we never ask her to. If she does, or doesn\'t reply within 30 days, you can choose someone else from your list.',
        'Warm regards,',
      ],
    });
  },
};
