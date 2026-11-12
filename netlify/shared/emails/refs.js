// Reference numbers and team-page links used in team emails, which must
// never contain personal details.
const { SITE } = require('./layout');
function clientRef(id) { return 'C-' + String(id).slice(0, 8).toUpperCase(); }
function clientAdminLink(id) { return SITE + '/admin/#client-' + id; }
function clientPageLink(token) { return SITE + '/client#t=' + token; }
module.exports = { clientRef, clientAdminLink, clientPageLink };
