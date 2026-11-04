# "bí mật" inventory (Vietnamese site)

Searched every text file in the repo on `main` at `31a82e8`: HTML pages, `assets/js`, Netlify functions (including the email templates), JSON-LD, meta / OG tags, alt text, aria-labels, `sitemap.xml`, `docs/` and the fee-structure source. The search was case-insensitive ("bí mật", "Bí mật", "BÍ MẬT") and Unicode-normalised: every line was normalised to NFC before matching, and NFD-encoded matches were reported separately. A diacritic-free search for "bi mat" / "bi-mat" / "bi_mat" was run as well.

## Result on `main`

- **6 hits** for "bí mật", in 3 files. All are saved as NFC (no NFD-encoded hits).
- **0 hits** for diacritic-free "bi mat", so no slugs, IDs, class names, keys or URLs are affected.
- **0 hits** on the legal pages (Privacy, Terms, Your Rights), in the candidate consent wording, in the fee-structure document or in anything IMBRA-related, so there is nothing for LEGAL REVIEW.
- The 6 hits are 3 distinct sentences. The FAQ answer appears four times: visible text and structured data, on both the FAQ page and the homepage.

| # | File | Line | Where | Full sentence (current) | English source |
|---|---|---|---|---|---|
| 1 | `vi/contact.html` | 196 | Hero standfirst (visible) | Chúng tôi đích thân đọc từng tin nhắn, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối. | We read every message personally, and every conversation is held in strict confidence. |
| 2 | `vi/contact.html` | 231 | "Bảo mật" item in the contact details list (visible) | Mọi yêu cầu, dù bạn gửi bằng cách nào, đều được giữ bí mật tuyệt đối. | Every enquiry, however you choose to send it, is held in strict confidence. |
| 3 | `vi/faq.html` | 57 | FAQ structured data (JSON-LD, read by search engines) | Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên. | Discretion is central to how we work — your details are never shared, and every conversation is held in strict confidence from the first word. |
| 4 | `vi/faq.html` | 354 | FAQ answer "Thông tin của tôi có được bảo mật không?" (visible) | Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên. | Discretion is central to how we work — your details are never shared, and every conversation is held in strict confidence from the first word. |
| 5 | `vi/index.html` | 124 | Homepage FAQ structured data (JSON-LD) | Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên. | Discretion is central to how we work — your details are never shared, and every conversation is held in strict confidence from the first word. |
| 6 | `vi/index.html` | 582 | Homepage FAQ answer "Thông tin của tôi có được bảo mật không?" (visible) | Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên. | Discretion is central to how we work — your details are never shared, and every conversation is held in strict confidence from the first word. |

## Other open branches (report only, not edited)

### `vi-native-voice-retranslation` — PR #27 "Vietnamese retranslation — native-voice pass"

- 12 hits: 0 in site files, 12 in `translation-review/` documents.
  - `translation-review/inventory.md:71` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/inventory.md:176` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/inventory.md:999` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/inventory.md:1060` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/inventory.md:1135` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/inventory.md:1142` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/vi-review.md:125` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/vi-review.md:209` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/vi-review.md:669` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/vi-review.md:715` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/vi-review.md:740` — quotes the old sentence from `main` in a review table; not live text.
  - `translation-review/vi-review.md:747` — quotes the old sentence from `main` in a review table; not live text.

### `fee-structure-self-registration` — PR #25 "Fee structure PDF: align with self-registration model"

- 6 hits: 6 in site files, 0 in `translation-review/` documents.
  - `vi/contact.html:196` — Chúng tôi đích thân đọc từng tin nhắn, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối.
  - `vi/contact.html:226` — Mọi yêu cầu, dù bạn gửi bằng cách nào, đều được giữ bí mật tuyệt đối.
  - `vi/faq.html:57` — Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên.
  - `vi/faq.html:349` — Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên.
  - `vi/index.html:124` — Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên.
  - `vi/index.html:572` — Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên.

