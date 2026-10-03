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
| `CANDIDATE_SIGNUPS_OPEN` | `false` (default) or `true` | Keep this `false` until legal sign-off is confirmed. While `false`, the register page shows a waitlist form instead of the full registration form, and the function stores only name + contact + consent to be notified. Set to `true` only when told to by James. |

## 3. Supabase (candidate data storage)

1. Create a new Supabase project at [supabase.com](https://supabase.com), **region: Singapore**.
2. In the SQL editor, run `supabase/schema.sql` from this repo once, against that project.
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
used exclusively inside the two Netlify Functions above, can touch this
table.

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
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET=
```

After setting these, trigger a new deploy (environment variable changes
don't apply to already-built deploys).
