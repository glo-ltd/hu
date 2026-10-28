# Fee structure document

The fee structure PDF emailed by `netlify/functions/request-fee-structure.js`
(and linked from the site) now describes the self-registration model: women
register themselves, Heritage Union matches only against those registrations,
and each introduction happens only if she agrees.

## Status

- **Applied.** The replacements this file used to list have been made, in their
  final wording (which supersedes the earlier drafts here). Nothing in the PDF now
  says Heritage Union searches a network, sources, vets, curates or shortlists
  candidates, and "engaged" in the honour-payment section is now "committed".
- **Source of truth:** `docs/fee-structure/fee-structure.html`. Edit this file
  and nothing else. Fonts are bundled in `docs/fee-structure/fonts/` (SIL Open
  Font License) and colours match `assets/css/main.css`.
- **The Word document (`Heritage_Union_Investment_Structure.docx`) is retired.**
  It still has the old wording. Don't edit or export from it.

## Rebuilding the PDF

```sh
npm install                        # first time only
npx playwright install chromium    # first time only, if Chromium isn't already installed
npm run build:fee-pdf
```

This prints the HTML to A4 with Chromium and writes the same file to both:

- `assets/documents/heritage-union-fee-structure.pdf` (site download)
- `netlify/functions/assets/heritage-union-fee-structure.pdf` (email attachment)

The two must stay byte-identical (`cmp` them). The script fails if the brand fonts
don't load or the PDF is over 1 MB. Commit both PDFs together with the HTML change.

Before committing, open the PDF and check page breaks. Also make sure none of these
words have crept back in: network, source/sourcing, vet/vetting, curate/curated,
shortlist, searches, engaged.

## Outstanding

- `TODO(James): attorney review of the honour-payment section`. In particular, check
  that the $10,000 payment can't be read as a fee due on marriage.
- `TODO(James): counsel to approve the profile-sharing consent wording` (registration
  form, Privacy Policy section 3, Your Rights) before the PDF is relied on.
- Profiles may only be shown for candidates whose `consent_profile_sharing_at` is set
  in Supabase (the optional box on the registration form). A profile is first name,
  age, city/province and her "about" text, never surname, date of birth or contact
  details.
