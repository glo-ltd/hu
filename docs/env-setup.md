# Environment setup — launch readiness

Everything below needs to be set in **Netlify → Site configuration →
Environment variables** before the features in this branch work. Nothing
here is committed to the repo — these are secrets.

## 1. Existing (should already be set from the fee-structure form)

| Variable | Used by |
| --- | --- |
| `RESEND_API_KEY` | `request-fee-structure.js`, `candidate-register.js`, `withdraw-candidate.js` |

## 2. Candidate registration feature flag

| Variable | Value | Notes |
| --- | --- | --- |
| `CANDIDATE_SIGNUPS_OPEN` | `false` (default) or `true` | Keep this `false` until legal sign-off is confirmed. While `false`, the register page shows a waitlist form instead of the full registration form, and the function stores only name + contact + consent to be notified. Set to `true` only when told to by James. The full form only appears when this is `true` **and** both `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` are set (the same two keys also protect the client enquiry form on /contact whenever they are set); if either key is missing, the page keeps showing the waitlist so women never meet a form they can't submit. |

## 3. Supabase (candidate data storage)

1. Create a new Supabase project at [supabase.com](https://supabase.com), **region: Singapore**.
2. In the SQL editor, run `supabase/schema.sql` from this repo once, against that project.
   If the project was set up before the profile-sharing consent was added, also run the
   `alter table ... consent_profile_sharing_at` line at the bottom of that file.
3. In **Project Settings → API**, copy:
   - **Project URL** → set as `SUPABASE_URL`
   - **service_role key** (NOT the `anon` key — the service_role key bypasses Row Level Security and must never be exposed to the browser) → set as `SUPABASE_SERVICE_ROLE_KEY`

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Your project's URL, e.g. `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The service_role key from Project Settings → API |

The `candidates` and `candidate_waitlist` tables have Row Level Security
enabled with no policies for the public `anon` key, so even if that key
leaked it couldn't read or write candidate data. Only the service_role key,
used exclusively inside Netlify Functions, can touch these tables. Candidate
photos are in the private `candidate-photos` bucket with no storage
policies; every upload and view uses a short-lived signed URL made by a
function.

### 3a. Candidate profiles migration

Production already has this (applied 2026-11-09); nothing to run there.
For a **new** project, `supabase/schema.sql` now includes it at the bottom,
so running that file once is enough. For a project created before
November 2026, paste `supabase/migrations/2026-11-candidate-profiles.sql`
into the SQL editor and run it. It is safe to run more than once. It adds
the `profile_in_progress` status, the private-link and Zalo columns on
`candidates`, the `candidate_profiles` table (RLS on, no policies) and the
private `candidate-photos` Storage bucket.

### 3b. Team tool (/admin/) sign-in

The team tool signs in with Supabase Auth email links. Two more variables:

| Variable | Value |
| --- | --- |
| `SUPABASE_ANON_KEY` | The **publishable** (anon) key from Project Settings → API. It is public by design: it only starts the sign-in. Every table has RLS on with no policies, so this key alone can read nothing. |
| `ADMIN_EMAILS` | Comma-separated emails allowed to use `/admin/`, e.g. `james@heritage-union.com,huyen@heritage-union.com`. Case doesn't matter. Anyone not on this list is refused even if they can sign in. Everyone on this list also gets the team emails about candidates (new registration, profile submitted, withdrawal); if it is empty, they go to james@ only. Fee-structure requests still go to james@ only. |

Supabase Auth settings (Authentication in the Supabase dashboard). James
does these by hand:

1. **Sign In / Providers → Email**: keep Email enabled; **turn off "Allow new users to sign up"**, so nobody can create an account.
2. **URL Configuration**: Site URL `https://heritage-union.com`. Redirect URLs: `https://heritage-union.com/admin/` and `https://*--hu.netlify.app/admin/` (deploy previews).
3. **SMTP Settings**: turn on custom SMTP and use Resend (host `smtp.resend.com`, port `465`, user `resend`, password = a Resend API key, sender `team@heritage-union.com`). Without this, Supabase's built-in email is heavily rate-limited.
4. **Users → Invite user**: invite James and Huyen by email. They follow the invite once; after that they sign in from `/admin/` with "Email me a sign-in link".

### 3c. Clients (enquiry to payment)

Run `supabase/migrations/2026-12-client-phase-1.sql` once (James asks Claude in
chat to apply it). It is safe to run more than once. It adds the `clients`,
`client_events`, `client_invoices` and `general_enquiries` tables (RLS on, no
policies) and the private `client-documents` Storage bucket (10 MB; PDF, JPEG,
PNG). A new project gets the same from `supabase/schema.sql`.

| Variable | Value |
| --- | --- |
| `CLIENT_SIGNUPS_OPEN` | `false` (default) or `true`. Keep it `false` until the client agreement is final. While it is off, the enquiry form still works, but the team page can't send application links and his private page (`/client`) shows "not available yet". |
| `INVOICE_PAYMENT_DETAILS` | The bank details printed on every invoice and in the invoice email, several lines, e.g. `Account name: …`, `Bank: …`, `IBAN: …`, `SWIFT/BIC: …`. Never committed to the repo. Invoices can be drafted without it but not sent. |

Phase 2 (his profile, matching and choices): run
`supabase/migrations/2026-12-client-phase-2.sql` (tables `client_profiles`,
`client_shortlists`, `client_choices`; two new columns on `clients`). No new
env vars.

The fees, invoice numbering, link lengths and the other client-side
decisions live in `netlify/shared/client-config.js`.

## 4. Cloudflare Turnstile (spam protection on the registration form)

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/), go to **Turnstile** and add a new site for `heritage-union.com` (and your Netlify preview domain, if you want previews to work too).
2. Choose the **Managed** challenge type.

| Variable | Value |
| --- | --- |
| `TURNSTILE_SITE_KEY` | The public site key (safe to be visible in page source) |
| `TURNSTILE_SECRET` | The secret key (server-side only, used in `candidate-register.js` to verify the token) |

## 5. Summary — full list to paste into Netlify

```
RESEND_API_KEY=            (existing)
CANDIDATE_SIGNUPS_OPEN=false
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLIENT_SIGNUPS_OPEN=false   (new: clients; true once the agreement is final)
INVOICE_PAYMENT_DETAILS=    (new: bank details for invoices, multi-line)
SUPABASE_ANON_KEY=         (new: publishable key, for /admin/ sign-in)
ADMIN_EMAILS=              (new: e.g. james@heritage-union.com,huyen@heritage-union.com)
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET=
```

After setting these, trigger a new deploy (environment variable changes
don't apply to already-built deploys).

## 6. Analytics (not set up yet)

No analytics script is loaded on any page.

`TODO(James): create a Plausible account for heritage-union.com and add its
script tag to every page, or switch on Netlify Analytics (no script tag needed).`
