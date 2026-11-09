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

// Introduction notices: reference I-XXXXXXXX, linking to his page.
function introEmail(subjectText, line) {
  return {
    id: 'T', name: subjectText, audience: 'team',
    sample: { clientId: '1a2b3c4d-0000-4000-8000-000000000000', introId: '9f8e7d6c-0000-4000-8000-000000000000' },
    build(d) {
      const ref = 'I-' + String(d.introId).slice(0, 8).toUpperCase();
      return render({
        subject: subjectText + ' (' + ref + ')', audience: 'team',
        blocks: [line + ' Reference ' + ref + '.', { button: { label: 'Open in the team page', href: clientAdminLink(d.clientId) } }],
      });
    },
  };
}

module.exports = {
  introAccepted: introEmail('A woman said yes to an introduction', 'A woman has said yes and chosen what to share. Tap "Introduce" to send both sides their details.'),
  introDeclined: introEmail('A woman said no to an introduction', 'A woman has said no. He has been told kindly (R17), with no reason.'),
  introQuestion: introEmail('A woman has a question before deciding', 'A woman has a question before she decides. Her message is on the team page.'),
  newEnquiry: teamEmail('New client enquiry', 'A new client enquiry has arrived.'),
  feeRequest: teamEmail('Fee document requested', 'The fee document was requested and sent automatically.'),
  applicationSubmitted: teamEmail('Client application submitted', 'An application is ready for document checks.'),
  thinkingReminder: teamEmail('Client still thinking it over', 'It has been a week since this client said he was thinking it over.'),
  profileSubmitted: teamEmail('Client profile ready for a summary', 'A client has sent his profile. It is ready for you to write his summary.'),
  changesRequested: teamEmail('Client asked for changes to his summary', 'A client has asked for changes to his profile summary.'),
  profileApproved: teamEmail('Client approved his summary', 'A client has approved his profile summary. He is ready for matching once the translations are done.'),
  choicesReceived: teamEmail('Client sent his choices', 'A client has sent his choices from his shortlist.'),
};
