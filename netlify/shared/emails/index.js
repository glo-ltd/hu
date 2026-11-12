// All email templates, by code. docs/client-emails.md is generated from
// these (npm run build:email-docs).
module.exports = {
  R1: require('./r1-enquiry-received'),
  R2: require('./r2-fee-document'),
  R3: require('./r3-invite-to-apply'),
  R4: require('./r4-not-right-fit'),
  R5: require('./r5-private-link'),
  R6: require('./r6-application-received'),
  R7: require('./r7-invoice'),
  R8: require('./r8-welcome'),
  R9: require('./r9-profile-ready'),
  R10: require('./r10-profile-approved'),
  R11: require('./r11-profiles-to-review'),
  R12: require('./r12-choices-received'),
  team: require('./team-client'),
};
