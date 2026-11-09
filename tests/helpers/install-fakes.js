// Replaces @supabase/supabase-js and resend in Node's require cache, so the
// real function code runs against the in-memory fake. Require this before
// requiring any function.
const path = require('path');
const { FakeSupabase } = require('./fake-supabase');

const fake = new FakeSupabase({ baseUrl: process.env.FAKE_BASE_URL });
const sentEmails = [];

function stub(name, exports) {
  const file = require.resolve(name, { paths: [path.join(__dirname, '..', '..', 'netlify', 'functions')] });
  require.cache[file] = { id: file, filename: file, loaded: true, exports };
}

stub('@supabase/supabase-js', { createClient: () => fake });
stub('resend', {
  Resend: class {
    constructor() { this.emails = { send: async (m) => { sentEmails.push(m); return { data: { id: 'e' + sentEmails.length }, error: null }; } }; }
  },
});

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://fake.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-test';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'anon-test';
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_test';
process.env.ADMIN_EMAILS = process.env.ADMIN_EMAILS || 'James@heritage-union.com, huyen@heritage-union.com';

module.exports = { fake, sentEmails };
