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
  newConcern: {
    id: 'T', name: 'New concern', audience: 'team', sample: { concernId: '5a5a5a5a-0000-4000-8000-000000000000' },
    build(d) {
      const ref = 'R-' + String(d.concernId).slice(0, 8).toUpperCase();
      return render({ subject: 'New concern reported (' + ref + ')', audience: 'team', blocks: ['A concern has been reported through the website. Please read it today. Reference ' + ref + '.', { button: { label: 'Open concerns in the team page', href: 'https://heritage-union.com/admin/#clients/concerns' } }] });
    },
  },
  introAccepted: introEmail('A woman said yes to an introduction', 'A woman has said yes and chosen what to share. Tap "Introduce" to send both sides their details.'),
  introDeclined: introEmail('A woman said no to an introduction', 'A woman has said no. He has been told kindly (R17), with no reason.'),
  certRequested: introEmail('A woman asked for an official background check', 'A woman has asked the client for an official criminal record certificate before she decides. Open his page and tap "Send certificate request".'),
  certProvided: introEmail('A client provided a certificate', 'A client has uploaded a certificate a woman asked for. Open it, then tap "Mark as seen" so she can see it.'),
  certDeclined: introEmail('A client chose not to provide a certificate', 'A client chose not to provide the certificate a woman asked for. Her decision page now tells her so; you may want to message her on Zalo.'),
  reminderDue: introEmail('Send a gentle reminder on Zalo', 'A request has had no answer for 14 days and she has no email address. Open his page and copy the reminder into Zalo.'),
  introExpired: introEmail('An introduction request expired', 'A request reached 30 days without an answer and has expired. He has been told kindly (R17).'),
  introQuestion: introEmail('A woman has a question before deciding', 'A woman has a question before she decides. Her message is on the team page.'),
  newEnquiry: teamEmail('New client enquiry', 'A new client enquiry has arrived.'),
  feeRequest: teamEmail('Fee document requested', 'The fee document was requested and sent automatically.'),
  applicationSubmitted: teamEmail('Client application submitted', 'An application and sworn background declaration are ready for you to read.'),
  engagementYear: teamEmail('Engagement reached 12 months', 'A client\'s engagement has reached 12 months. Decide whether to close it (12 months complete, relationship success or close).'),
  feedbackReceived: teamEmail('Client feedback received', 'A client has sent feedback.'),
  thinkingReminder: teamEmail('Client still thinking it over', 'It has been a week since this client said he was thinking it over.'),
  profileSubmitted: teamEmail('Client profile ready for a summary', 'A client has sent his profile. It is ready for you to write his summary.'),
  changesRequested: teamEmail('Client asked for changes to his summary', 'A client has asked for changes to his profile summary.'),
  profileApproved: teamEmail('Client approved his summary', 'A client has approved his profile summary. He is ready for matching once the translations are done.'),
  choicesReceived: teamEmail('Client sent his choices', 'A client has sent his choices from his shortlist.'),
};
