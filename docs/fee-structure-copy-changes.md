# Fee structure document — copy changes needed

`assets/documents/heritage-union-fee-structure.pdf` and
`netlify/functions/assets/heritage-union-fee-structure.pdf` are generated from
a Word document James holds locally. They have **not** been edited as part of
this change — PDFs aren't a practical format to hand-edit safely, and the
source of truth lives outside this repo.

James: please make the following replacements in the source Word document,
then regenerate both PDFs and replace the two files above.

## Replacements

1. **Step 3 of the process** (candidate search)
   - Find: "Heritage Union searches on your behalf across our network and candidate pool"
   - Replace with: "Heritage Union searches the pool of women who have self-registered with us."

2. **Concierge fee — what's included, bullet list**
   - Find: "Initiation of your candidate search across Heritage Union's network"
   - Replace with: "Search of the self-registered candidate pool against your profile"

3. **Expense table row**
   - Find: "Travel, accommodation, and expenses incurred by Heritage Union while sourcing and vetting candidates"
   - Replace with: "Heritage Union's own operating and travel costs"

4. **Expense section paragraph**
   - Find: "Heritage Union bears all costs associated with sourcing, vetting, and travelling to meet candidates on your behalf during the search process."
   - Replace with: "Heritage Union bears its own operating costs during the search process."

5. **Opening paragraph**
   - Find: "we search, curate, and introduce"
   - Replace with: "we search, advise, and introduce"

6. **Step 4 of the process** (replace the whole step, including its title)
   - Find: "Curated Shortlist — Our team reviews the search results and presents you with the 20 most suitable candidates. Working together, you and our team then select the 5 candidates you wish to pursue for introduction."
   - Replace with: "Profile Review — You have the opportunity to review 20 profiles of women who have registered with Heritage Union and agreed to their profile being shown to clients. Profiles never include contact details. Working together, we then identify the five most suitable."

7. **Step 5 of the process** (replace the whole step; this supersedes the sentence previously listed here)
   - Find: "Introductions — We facilitate a formal introduction between you and each of the 5 candidates, using your preferred channel — phone, social media, or another method of your choosing."
   - Replace with: "Introductions — You have the opportunity to be introduced to the five most suitable profiles. Before any introduction, each woman receives your background disclosure in Vietnamese and decides whether to share her contact details. For each woman who agrees, we facilitate a formal introduction using your preferred channel — phone, social media, or another method of your choosing."

8. **Concierge fee — what's included, bullet list** (three bullets)
   - Find: "Comprehensive review of candidate profiles, narrowed to the 20 most suitable matches"
   - Replace with: "The opportunity to review 20 profiles of women who have agreed to their profile being shown to clients"
   - Find: "Your involvement in selecting the 5 candidates you wish to pursue from this shortlist"
   - Replace with: "The opportunity to be introduced to the five most suitable profiles, where each woman agrees"
   - Find: "Facilitated introductions between you and each of your 5 chosen candidates"
   - Replace with: "Facilitated introductions with each woman who agrees to be introduced"

9. **12-month timeline paragraph**
   - Find: "no agreement has been reached on proceeding with any of the five shortlisted candidates"
   - Replace with: "no agreement has been reached on proceeding with any of the five introductions offered"

## Outstanding

- `TODO(James): attorney review of the honour-payment section before reissuing.`
- `TODO(James): before the PDF promises clients 20 profiles, the candidate side must match.` Today
  become-a-candidate says "Everything you tell us stays private within Heritage Union", and the
  Privacy Policy only covers using her data "to consider possible introductions". Showing her
  profile to clients needs (a) a separate, optional consent at registration ("I agree to my
  profile, without contact details, being shown to Heritage Union clients"), (b) updated
  candidate-page and Privacy Policy wording, and (c) counsel sign-off. Until then, only profiles
  of women who have given that consent can be shown.
- `TODO(James): confirm "20" can be guaranteed.` If fewer than 20 women have agreed to profile
  sharing, consider "up to 20".
- `TODO(James): regenerate both PDFs` (`assets/documents/heritage-union-fee-structure.pdf` and `netlify/functions/assets/heritage-union-fee-structure.pdf`) once the Word source is updated, and commit the new files to this repo.
