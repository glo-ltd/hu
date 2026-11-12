// Team notifications about clients. Reference number and team-page link
// only: never names, emails or any other personal details.
const { render } = require('./layout');
const { clientRef, clientAdminLink } = require('./refs');

function teamEmail(subjectText, line) {
  return {
    id: 'T', name: subjectText, audience: 'team',
    sample: { clientId: '1a2b3c4d-0000-4000-8000-000000000000' },
    build(d) {
      const ref = clientRef(d.clientId);
      return render({
        subject: subjectText + ' (' + ref + ')',
        audience: 'team',
        blocks: [line + ' Reference ' + ref + '.', { button: { label: 'Open in the team page', href: clientAdminLink(d.clientId) } }],
      });
    },
  };
}

module.exports = {
  newEnquiry: teamEmail('New client enquiry', 'A new client enquiry has arrived.'),
  feeRequest: teamEmail('Fee document requested', 'The fee document was requested and sent automatically.'),
  applicationSubmitted: teamEmail('Client application submitted', 'An application and sworn background declaration are ready for you to read.'),
  thinkingReminder: teamEmail('Client still thinking it over', 'It has been a week since this client said he was thinking it over.'),
};
