# Vietnamese string inventory

Taken on branch `vi-native-voice-retranslation` **before any edits**, from `main` at
`bc5ee58`. Every Vietnamese string in the repository is listed below with its file and line.

**Total: 1704 strings.**

## How the list was built

- **`vi/*.html` (17 pages):** every run of visible text inside a block element (headings,
  paragraphs, list items, buttons, links, labels, `<option>`s, nav, footer, cookie/consent text),
  plus every translatable attribute (`alt`, `aria-label`, `placeholder`, `title`), every SEO /
  Open Graph / Twitter `<meta>` description, keyword list and title, and every string value inside
  JSON-LD structured data. Text interrupted by inline tags (`<em>`, `<a>`, `<strong>`, `<br>`) is
  counted as one string, because it is read as one sentence.
- **`assets/js/main.js`:** Vietnamese validation, error and "sending" messages for the candidate
  waitlist, registration and withdrawal forms.
- **`netlify/functions/candidate-register.js`:** the Vietnamese confirmation email sent to women
  who register.
- Searched and found **no** Vietnamese in: locale/i18n files (the site has none), `assets/css`,
  the other Netlify functions, `supabase/schema.sql`, `sitemap.xml`, `robots.txt`, `project/`
  (design prototype, English only). There is **no** separate 404 page or cookie-banner component
  in the repo.
- Kept as-is and still counted: brand names, personal names, email addresses, place names and
  the Vietnamese province list on the registration form. They appear in the inventory so nothing
  is silently skipped, but they are proper nouns, not translation.

## Known gaps (Vietnamese that **does not exist** yet)

These show English on Vietnamese pages. Fixing them needs code changes, not string changes, so
they are raised as questions in `vi-review.md` rather than changed on this branch:

1. `assets/js/main.js` lines 155–180: the fee-structure request form (`/vi/request-fee-structure`)
   shows English messages ("Sending...", "Please complete all fields.", etc.).
2. All Netlify functions return English `error` messages, which `main.js` shows as-is on Vietnamese
   pages (e.g. "Please provide a valid Vietnamese phone number.").

## Inventory by file

Pages are listed in site order. Pages marked *legal / consent content* contain lawyer-approved
wording; on those, only clear grammar and spelling errors are corrected (see LEGAL REVIEW in
`vi-review.md`).

### `vi/index.html`: 169 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Heritage Union — Một Sự Kết Nối Bền Vững Qua Nhiều Thế Hệ |
| 2 | 11 | `meta:description` | Heritage Union là công ty tư vấn quan hệ quốc tế cao cấp. Dịch vụ riêng tư, đặt niềm tin lên hàng đầu dành cho những người đàn ông phương Tây nghiêm túc tìm kiếm một kết nối ý nghĩa với phụ nữ Việt Nam, thông qua sự am hiểu văn hóa và hướng dẫn kín đáo. |
| 3 | 12 | `meta:keywords` | tư vấn quan hệ quốc tế, tư vấn quan hệ Việt Nam, hẹn hò với người phương Tây, tư vấn quan hệ nghiêm túc, mai mối quốc tế uy tín, hướng dẫn quan hệ đa văn hóa |
| 4 | 25 | `meta:og:title` | Heritage Union — Một Sự Kết Nối Bền Vững Qua Nhiều Thế Hệ |
| 5 | 26 | `meta:og:description` | Công ty tư vấn quan hệ quốc tế cao cấp. Riêng tư, đặt niềm tin hàng đầu, đồng hành từng bước — hướng tới một kết nối ý nghĩa và bền vững. |
| 6 | 36 | `meta:twitter:title` | Heritage Union — Một Sự Kết Nối Bền Vững Qua Nhiều Thế Hệ |
| 7 | 37 | `meta:twitter:description` | Công ty tư vấn quan hệ quốc tế cao cấp. Riêng tư, đặt niềm tin hàng đầu, đồng hành từng bước — hướng tới một kết nối ý nghĩa và bền vững. |
| 8 | 43 | `jsonld.name` | Heritage Union |
| 9 | 43 | `jsonld.description` | Công ty tư vấn quan hệ quốc tế cao cấp. Giới thiệu dựa trên niềm tin và hướng dẫn văn hóa, hướng tới một kết nối ý nghĩa và bền vững. |
| 10 | 43 | `jsonld.hasOfferCatalog.name` | Dịch Vụ |
| 11 | 43 | `jsonld.hasOfferCatalog.itemListElement[0].itemOffered.name` | Buổi Tư Vấn Riêng Miễn Phí |
| 12 | 43 | `jsonld.hasOfferCatalog.itemListElement[0].itemOffered.description` | Một buổi tư vấn riêng tư kéo dài ba mươi phút với người sáng lập — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 13 | 43 | `jsonld.hasOfferCatalog.itemListElement[1].itemOffered.name` | Tiếp Nhận Khách Hàng Qua Đăng Ký |
| 14 | 43 | `jsonld.hasOfferCatalog.itemListElement[1].itemOffered.description` | Một quy trình chu đáo, dựa trên đăng ký, dành cho những người đàn ông nghiêm túc tìm kiếm sự đồng hành và gia đình lâu dài. |
| 15 | 82 | `jsonld.mainEntity[0].name` | Buổi tư vấn đầu tiên có thực sự miễn phí không? |
| 16 | 82 | `jsonld.mainEntity[0].acceptedAnswer.text` | Có. Buổi tư vấn ban đầu là một cuộc trò chuyện miễn phí, không ràng buộc — ba mươi phút riêng tư để tìm hiểu mong muốn của bạn và giải đáp mọi thắc mắc. Không có bất kỳ áp lực nào để tiếp tục. |
| 17 | 82 | `jsonld.mainEntity[1].name` | Điều này khác gì so với ứng dụng hẹn hò hay một trung tâm môi giới? |
| 18 | 82 | `jsonld.mainEntity[1].acceptedAnswer.text` | Chúng tôi là một công ty tư vấn, không phải một nền tảng. Không có cơ sở dữ liệu để duyệt xem và không có danh mục hồ sơ. Chúng tôi tư vấn, hướng dẫn và giới thiệu — một cách cẩn trọng và kín đáo — hướng tới những kết quả lâu dài thực sự. |
| 19 | 82 | `jsonld.mainEntity[2].name` | Heritage Union nhận những khách hàng nào? |
| 20 | 82 | `jsonld.mainEntity[2].acceptedAnswer.text` | Chúng tôi làm việc với những người đàn ông nghiêm túc, có nền tảng tài chính vững vàng, đang tìm kiếm sự đồng hành và gia đình. Khách hàng được tiếp nhận qua đơn đăng ký, giúp bảo vệ sự nghiêm túc của quy trình cho tất cả mọi người liên quan. |
| 21 | 82 | `jsonld.mainEntity[3].name` | Các ứng viên được kết nối như thế nào? |
| 22 | 82 | `jsonld.mainEntity[3].acceptedAnswer.text` | Mọi khách hàng đều được kiểm tra lý lịch. Mọi ứng viên tự đăng ký và xác minh thông tin của mình với Heritage Union trước khi bất kỳ buổi giới thiệu nào được xem xét. |
| 23 | 82 | `jsonld.mainEntity[4].name` | Thông tin của tôi có được bảo mật không? |
| 24 | 82 | `jsonld.mainEntity[4].acceptedAnswer.text` | Hoàn toàn được bảo mật. Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên. |
| 25 | 155 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 26 | 169 | `attr:aria-label` | Heritage Union — về đầu trang |
| 27 | 176 | `text` | HERITAGE UNION |
| 28 | 187 | `text` | Quy Trình |
| 29 | 188 | `text` | Dịch Vụ |
| 30 | 189 | `text` | Thành Công |
| 31 | 191 | `text` | Tài Nguyên |
| 32 | 196 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 33 | 202 | `text` | Giới Thiệu |
| 34 | 207 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 35 | 213 | `text` | Hỏi Đáp |
| 36 | 214 | `text` | Liên Hệ |
| 37 | 218 | `attr:aria-label` | Ngôn ngữ |
| 38 | 219 | `text` | EN \| VI |
| 39 | 223 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 40 | 225 | `attr:aria-label` | Mở menu điều hướng |
| 41 | 239 | `attr:aria-label` | Điều hướng trên di động |
| 42 | 241 | `attr:aria-label` | Ngôn ngữ |
| 43 | 242 | `text` | EN \| VI |
| 44 | 246 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 45 | 268 | `attr:aria-label` | Heritage Union — mở đầu |
| 46 | 270 | `attr:aria-label` | Đồng hành · Gia đình · Di sản |
| 47 | 270 | `text` | ĐỒNG HÀNH · GIA ĐÌNH · DI SẢN |
| 48 | 271 | `text` | Một sự kết nối được xây dựng để trường tồn. |
| 49 | 272 | `text` | Dành cho người đàn ông đang bước vào một chương ý nghĩa của cuộc đời, mong muốn nhiều hơn là bạn đồng hành — một người bạn đời, một gia đình, một di sản đáng để vun đắp bằng cả sự chu đáo. |
| 50 | 276 | `text` | Đặt lịch tư vấn miễn phí Quy trình hoạt động |
| 51 | 279 | `attr:aria-label` | Nguyên tắc cốt lõi |
| 52 | 281 | `text` | Đặt niềm tin lên hàng đầu |
| 53 | 282 | `text` | là một quy trình, không phải một kênh tiếp cận |
| 54 | 285 | `text` | Tận tâm |
| 55 | 286 | `text` | tư vấn khách hàng qua đăng ký |
| 56 | 289 | `text` | Kín đáo |
| 57 | 290 | `text` | ngay từ những lời đầu tiên |
| 58 | 294 | `attr:aria-label` | Một cặp đôi ôm nhau trên bãi biển lúc hoàng hôn |
| 59 | 303 | `text` | Thị trường chạy theo quy mô. Chúng tôi khôi phục niềm tin. |
| 60 | 304 | `text` | Một công ty tư vấn, không phải một ứng dụng hẹn hò. |
| 61 | 305 | `text` | Các ứng dụng mang lại sự tiếp cận, quy mô và tiện lợi — nhưng lại loại bỏ niềm tin, sự quan tâm, hướng dẫn và am hiểu văn hóa. Heritage Union khôi phục lại yếu tố con người mà một mối quan hệ nghiêm túc thực sự cần đến. |
| 62 | 315 | `text` | Niềm tin trước khi giới thiệu |
| 63 | 316 | `text` | Mọi khách hàng đều được kiểm tra lý lịch. Mọi ứng viên tự đăng ký và xác minh thông tin của mình. Bạn sẽ luôn biết rằng quy trình được thực hiện với sự chính trực và chu đáo. |
| 64 | 322 | `text` | Sự kín đáo là tiêu chuẩn |
| 65 | 323 | `text` | Điềm tĩnh, trưởng thành và bảo mật ngay từ cuộc trò chuyện đầu tiên. Không có gì ở đây là phô trương hay mang tính bán hàng. |
| 66 | 329 | `text` | Am hiểu văn hóa |
| 67 | 330 | `text` | Một mối quan hệ quốc tế bền vững cần nhiều hơn là sự thu hút. Chúng tôi hướng dẫn về giao tiếp, kỳ vọng và văn hóa. |
| 68 | 336 | `text` | Xây dựng cho lâu dài |
| 69 | 337 | `text` | Sự đồng hành, gia đình và di sản — chân thực và bền vững. Không bao giờ là một danh mục, không bao giờ là một giao dịch. |
| 70 | 349 | `text` | Quy Trình |
| 71 | 350 | `text` | Đặt niềm tin lên hàng đầu, từ cuộc trò chuyện đầu tiên đến một mối quan hệ bền vững. |
| 72 | 351 | `text` | Một quy trình nghiêm túc cho những mục đích nghiêm túc — được xây dựng xoay quanh giá trị lâu dài, không bao giờ là một giao dịch. |
| 73 | 358 | `text` | Một cuộc trò chuyện riêng tư |
| 74 | 359 | `text` | Chúng tôi bắt đầu bằng một buổi tư vấn miễn phí, kín đáo để hiểu về mong muốn, hoàn cảnh của bạn và hình dung về một tương lai ý nghĩa dành cho bạn. |
| 75 | 363 | `text` | Tiếp nhận khách hàng qua đăng ký |
| 76 | 364 | `text` | Không phải mọi lời đề nghị đều trở thành khách hàng. Chúng tôi chỉ nhận những người thực sự nghiêm túc — điều này giúp bảo vệ sự nghiêm túc của quy trình cho tất cả những người liên quan. |
| 77 | 368 | `text` | Những buổi giới thiệu chu đáo |
| 78 | 369 | `text` | Với sự am hiểu thực tế về Việt Nam, chúng tôi sắp xếp những buổi giới thiệu với những người phụ nữ đã tự đăng ký, và chỉ khi cô ấy đồng ý. Không bao giờ là một danh mục hồ sơ. |
| 79 | 373 | `text` | Đồng hành trong từng bước |
| 80 | 374 | `text` | Sự hướng dẫn văn hóa và hỗ trợ tận tâm được tiếp tục xuyên suốt — kín đáo từ cuộc trò chuyện đầu tiên cho đến một mối quan hệ bền vững. |
| 81 | 378 | `text` | Xem toàn bộ hành trình, từng bước một |
| 82 | 388 | `text` | Những Gì Chúng Tôi Mang Lại |
| 83 | 389 | `text` | Một công ty tư vấn quan hệ toàn diện — không bao giờ là một danh mục hồ sơ. |
| 84 | 392 | `text` | Hồ sơ quan hệ của bạn, kết nối với các ứng viên tự đăng ký, giới thiệu chu đáo, hướng dẫn đa văn hóa và hỗ trợ mối quan hệ liên tục — mọi dịch vụ đều được cân nhắc kỹ lưỡng, không bao giờ mang tính giao dịch. |
| 85 | 395 | `text` | Khám phá dịch vụ của chúng tôi |
| 86 | 405 | `text` | Những Người Đồng Hành Cùng Bạn |
| 87 | 406 | `text` | Gặp gỡ James & Huyền. |
| 88 | 407 | `text` | Hai châu lục, một tiêu chuẩn chăm sóc chung. |
| 89 | 415 | `text` | James |
| 90 | 416 | `text` | Người sáng lập và cố vấn. Ly hôn ở tuổi năm mươi sau ba mươi tư năm hôn nhân, James đã xây dựng lại cuộc sống của mình tại Việt Nam — và tạo nên công ty tư vấn mà ông từng ước có được. |
| 91 | 417 | `text` | Đọc câu chuyện của James → |
| 92 | 423 | `text` | Huyền |
| 93 | 424 | `text` | Chuyên Gia Văn Hóa Độc Lập & Cầu Nối. Hướng dẫn văn hóa và hỗ trợ ngôn ngữ cho mọi khách hàng, và cho bất kỳ ứng viên nào có câu hỏi. |
| 94 | 425 | `text` | Đọc câu chuyện của Huyền → |
| 95 | 435 | `attr:aria-label` | Việt Nam — con phố treo đèn lồng ở Hội An lúc hoàng hôn |
| 96 | 437 | `text` | Vì Sao Việt Nam |
| 97 | 438 | `text` | Một cầu nối văn hóa đáng tin cậy. |
| 98 | 440 | `text` | Những mối quan hệ quốc tế cần nhiều hơn là sự thu hút. Chúng cần sự am hiểu văn hóa, giao tiếp chân thành và những kỳ vọng được quản lý cẩn thận. |
| 99 | 443 | `text` | Thông qua sự am hiểu thực tế về Việt Nam, chúng tôi mang lại yếu tố con người mà các nền tảng công nghệ đã đánh mất — những giá trị về lòng chung thủy, gia đình và sự ấm áp trường tồn theo thời gian. |
| 100 | 447 | `text` | Trò chuyện cùng chúng tôi |
| 101 | 457 | `text` | Câu Chuyện Của Chúng Tôi |
| 102 | 458 | `text` | Chúng tôi xây dựng Heritage Union dành cho người đàn ông đã đến một thời điểm ý nghĩa của cuộc đời và mong muốn điều gì đó thực sự đáng gìn giữ — và dành cho những người phụ nữ xứng đáng được đối xử với sự tôn trọng và nghiêm túc tương xứng. |
| 103 | 461 | `text` | Trong khi phần còn lại của ngành này bán sự tiếp cận, chúng tôi mang lại sự bền vững: một con đường riêng tư, đặt niềm tin lên hàng đầu hướng tới sự đồng hành và gia đình. Mỗi buổi giới thiệu đều được cân nhắc kỹ lưỡng. Mỗi khách hàng đều được đồng hành. Không có gì bị bỏ mặc cho may rủi. |
| 104 | 465 | `text` | James Người Sáng Lập · Heritage Union |
| 105 | 474 | `attr:aria-label` | Lời cam kết của Heritage Union |
| 106 | 482 | `text` | "Chúng tôi không bán quyền truy cập vào hồ sơ. Chúng tôi mang lại sự tin tưởng, hướng dẫn và am hiểu văn hóa — một môi trường uy tín, cao cấp cho việc xây dựng mối quan hệ nghiêm túc." |
| 107 | 485 | `text` | Lời cam kết của Heritage Union |
| 108 | 495 | `text` | Khởi Đầu Như Thế Nào |
| 109 | 496 | `text` | Hai người bạn. Một quy trình chân thành. |
| 110 | 498 | `text` | Heritage Union vừa mới ra mắt, vì vậy chúng tôi chưa có khách hàng trả phí để dẫn chứng — điều chúng tôi có là trải nghiệm thực sự của hai người bạn thân đã tin tưởng người sáng lập của chúng tôi với điều này từ rất lâu trước khi nó trở thành một doanh nghiệp. |
| 111 | 504 | `text` | Mỗi buổi giới thiệu đều có lý do của nó. Không ai phải đoán mò. |
| 112 | 505 | `text` | John · Vương Quốc Anh |
| 113 | 509 | `text` | Việc chờ đợi lâu hơn một chút ở giai đoạn đầu đã tiết kiệm được rất nhiều thời gian, tiền bạc và cảm xúc về sau. |
| 114 | 510 | `text` | Adam · Úc |
| 115 | 514 | `text` | Có một điều gì đó thực sự phi thường khi chứng kiến hai con người tìm thấy nhau, chỉ vì có ai đó đã dành thời gian để thấu hiểu họ một cách trọn vẹn. |
| 116 | 515 | `text` | James · Người sáng lập, Heritage Union |
| 117 | 519 | `text` | Đọc toàn bộ câu chuyện của họ |
| 118 | 530 | `text` | Câu hỏi, đã được giải đáp |
| 119 | 531 | `text` | Trước khi bạn đăng ký. |
| 120 | 536 | `text` | Buổi tư vấn đầu tiên có thực sự miễn phí không? |
| 121 | 540 | `text` | Có. Buổi tư vấn ban đầu là một cuộc trò chuyện miễn phí, không ràng buộc — ba mươi phút riêng tư để tìm hiểu mong muốn của bạn và giải đáp mọi thắc mắc. Không có bất kỳ áp lực nào để tiếp tục. |
| 122 | 544 | `text` | Điều này khác gì so với ứng dụng hẹn hò hay một trung tâm môi giới? |
| 123 | 548 | `text` | Chúng tôi là một công ty tư vấn, không phải một nền tảng. Không có cơ sở dữ liệu để duyệt xem và không có danh mục hồ sơ. Chúng tôi tư vấn, hướng dẫn và giới thiệu — một cách cẩn trọng và kín đáo — hướng tới những kết quả lâu dài thực sự. |
| 124 | 552 | `text` | Heritage Union nhận những khách hàng nào? |
| 125 | 556 | `text` | Chúng tôi làm việc với những người đàn ông nghiêm túc, có nền tảng tài chính vững vàng, đang tìm kiếm sự đồng hành và gia đình. Khách hàng được tiếp nhận qua đơn đăng ký, giúp bảo vệ sự nghiêm túc của quy trình cho tất cả mọi người liên quan. |
| 126 | 560 | `text` | Các ứng viên được kết nối như thế nào? |
| 127 | 564 | `text` | Mọi khách hàng đều được kiểm tra lý lịch. Mọi ứng viên tự đăng ký và xác minh thông tin của mình với Heritage Union trước khi bất kỳ buổi giới thiệu nào được xem xét. |
| 128 | 568 | `text` | Thông tin của tôi có được bảo mật không? |
| 129 | 572 | `text` | Hoàn toàn được bảo mật. Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên. |
| 130 | 576 | `text` | Xem toàn bộ danh sách câu hỏi thường gặp |
| 131 | 588 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 132 | 589 | `text` | Xây dựng điều gì đó bền vững. |
| 133 | 590 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 134 | 599 | `text` | Buổi tư vấn ban đầu miễn phí |
| 135 | 600 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 136 | 602 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 137 | 609 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 138 | 615 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 139 | 621 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 140 | 627 | `text` | Không ràng buộc, không áp lực |
| 141 | 632 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 142 | 633 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 143 | 641 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 144 | 657 | `text` | Dành cho phụ nữ Việt Nam |
| 145 | 658 | `text` | Bạn muốn làm quen với một người đàn ông thật lòng mong muốn gắn bó lâu dài? |
| 146 | 659 | `text` | Việc đăng ký hoàn toàn miễn phí và do bạn tự quyết định, dành cho phụ nữ từ 18 tuổi trở lên. Bạn xem lý lịch của anh ấy trước, rồi chính bạn quyết định có chia sẻ thông tin liên lạc hay không. |
| 147 | 660 | `text` | Tìm hiểu và đăng ký miễn phí |
| 148 | 676 | `attr:aria-label` | Heritage Union — về đầu trang |
| 149 | 680 | `text` | HERITAGE UNION |
| 150 | 683 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 151 | 686 | `text` | Đặt lịch tư vấn miễn phí |
| 152 | 691 | `text` | Khám Phá |
| 153 | 693 | `text` | Quy Trình |
| 154 | 694 | `text` | Dịch Vụ |
| 155 | 695 | `text` | Thành Công |
| 156 | 696 | `text` | Hỏi Huyền |
| 157 | 697 | `text` | Kiến Thức & Tài Nguyên |
| 158 | 698 | `text` | Biểu Phí |
| 159 | 699 | `text` | Hỏi Đáp |
| 160 | 705 | `text` | Giới Thiệu |
| 161 | 707 | `text` | Gặp Gỡ James |
| 162 | 708 | `text` | Gặp Gỡ Huyền |
| 163 | 709 | `text` | Câu Chuyện Của Chúng Tôi |
| 164 | 710 | `text` | Vì Sao Việt Nam |
| 165 | 716 | `text` | Liên Hệ |
| 166 | 718 | `text` | team@heritage-union.com |
| 167 | 719 | `text` | Trang liên hệ |
| 168 | 720 | `text` | Trở Thành Ứng Viên |
| 169 | 729 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/how-it-works.html`: 108 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Cách Thức Hoạt Động — Hành Trình Của Heritage Union |
| 2 | 11 | `meta:description` | Từ buổi tư vấn riêng tư đến một kết nối ý nghĩa: toàn bộ hành trình của Heritage Union, từng bước một. Một quy trình chu đáo, đặt niềm tin lên hàng đầu, hướng tới sự phù hợp thực sự. |
| 3 | 12 | `meta:keywords` | quy trình Heritage Union, tư vấn quan hệ Việt Nam, tư vấn giới thiệu văn hóa, quy trình giới thiệu tại Việt Nam, các bước tư vấn quan hệ |
| 4 | 25 | `meta:og:title` | Cách Thức Hoạt Động — Hành Trình Của Heritage Union |
| 5 | 26 | `meta:og:description` | Từ buổi tư vấn riêng tư đến một kết nối ý nghĩa: toàn bộ hành trình của Heritage Union, từng bước một. |
| 6 | 36 | `meta:twitter:title` | Cách Thức Hoạt Động — Hành Trình Của Heritage Union |
| 7 | 37 | `meta:twitter:description` | Từ buổi tư vấn riêng tư đến một kết nối ý nghĩa: toàn bộ hành trình của Heritage Union, từng bước một. |
| 8 | 43 | `jsonld.name` | Hành Trình Của Heritage Union |
| 9 | 43 | `jsonld.description` | Quy trình của Heritage Union, từ buổi tư vấn riêng tư đến một kết nối ý nghĩa. |
| 10 | 43 | `jsonld.step[0].name` | Một Cuộc Trò Chuyện Riêng Tư |
| 11 | 43 | `jsonld.step[0].text` | Một buổi tư vấn miễn phí, kín đáo với người sáng lập để tìm hiểu về mong muốn và hoàn cảnh của bạn. |
| 12 | 43 | `jsonld.step[1].name` | Hồ Sơ Quan Hệ Của Bạn |
| 13 | 43 | `jsonld.step[1].text` | Một hồ sơ chu đáo về giá trị và hoàn cảnh của bạn — nền tảng cho mọi điều tiếp theo. |
| 14 | 43 | `jsonld.step[2].name` | Kết Nối |
| 15 | 43 | `jsonld.step[2].text` | Hồ sơ của bạn được đối chiếu với những phụ nữ đã tự đăng ký với Heritage Union, để tìm những người có giá trị và hoàn cảnh phù hợp. |
| 16 | 43 | `jsonld.step[3].name` | Xem Hồ Sơ |
| 17 | 43 | `jsonld.step[3].text` | Cơ hội xem tối đa 20 hồ sơ của những người phụ nữ đã đồng ý cho khách hàng xem hồ sơ của mình — không bao giờ là một danh mục để duyệt, và không bao giờ kèm thông tin liên lạc. |
| 18 | 43 | `jsonld.step[4].name` | Những Buổi Giới Thiệu Chu Đáo |
| 19 | 43 | `jsonld.step[4].text` | Cơ hội được giới thiệu với năm người phù hợp nhất. Mỗi buổi giới thiệu chỉ diễn ra khi cô ấy đồng ý sau khi đọc bản khai lý lịch của bạn. |
| 20 | 43 | `jsonld.step[5].name` | Kết Nối, Theo Nhịp Độ Của Riêng Bạn |
| 21 | 43 | `jsonld.step[5].text` | Mối quan hệ phát triển một cách tự nhiên, với hướng dẫn văn hóa và hỗ trợ sẵn sàng khi mọi thứ tiến triển. |
| 22 | 81 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 23 | 95 | `attr:aria-label` | Heritage Union — về trang chủ |
| 24 | 102 | `text` | HERITAGE UNION |
| 25 | 113 | `text` | Quy Trình |
| 26 | 114 | `text` | Dịch Vụ |
| 27 | 115 | `text` | Thành Công |
| 28 | 117 | `text` | Tài Nguyên |
| 29 | 122 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 30 | 128 | `text` | Giới Thiệu |
| 31 | 133 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 32 | 139 | `text` | Hỏi Đáp |
| 33 | 140 | `text` | Liên Hệ |
| 34 | 144 | `attr:aria-label` | Ngôn ngữ |
| 35 | 145 | `text` | EN \| VI |
| 36 | 149 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 37 | 151 | `attr:aria-label` | Mở menu điều hướng |
| 38 | 165 | `attr:aria-label` | Điều hướng trên di động |
| 39 | 167 | `attr:aria-label` | Ngôn ngữ |
| 40 | 168 | `text` | EN \| VI |
| 41 | 172 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 42 | 194 | `attr:aria-label` | Cách Thức Hoạt Động — mở đầu |
| 43 | 196 | `text` | HÀNH TRÌNH |
| 44 | 197 | `text` | Một con đường chu đáo hướng tới một kết nối ý nghĩa. |
| 45 | 198 | `text` | Heritage Union là một quy trình, không phải một nền tảng. Mỗi giai đoạn đều được đồng hành tận tâm, xây dựng xoay quanh giá trị lâu dài — không bao giờ là một giao dịch. |
| 46 | 202 | `text` | Đặt lịch tư vấn miễn phí Dịch vụ của chúng tôi |
| 47 | 206 | `attr:aria-label` | Một cặp đôi ôm nhau trên bãi biển lúc hoàng hôn |
| 48 | 215 | `text` | Hành Trình Của Heritage Union |
| 49 | 216 | `text` | Sáu giai đoạn. Một con đường chu đáo. |
| 50 | 217 | `text` | Không có gì ở đây là tự động hóa và không có gì bị vội vã. |
| 51 | 225 | `text` | Một cuộc trò chuyện riêng tư |
| 52 | 226 | `text` | Một buổi tư vấn miễn phí, kín đáo với James để tìm hiểu về mong muốn, hoàn cảnh của bạn và hình dung về một kết nối ý nghĩa dành cho bạn. Không ràng buộc, không áp lực. |
| 53 | 230 | `text` | Hồ sơ quan hệ của bạn |
| 54 | 231 | `text` | Cùng nhau, chúng tôi xây dựng một bức tranh chu đáo về giá trị, hoàn cảnh của bạn và những phẩm chất quan trọng nhất đối với bạn — nền tảng cho mọi điều tiếp theo. Bạn xem lại và phê duyệt hồ sơ của mình trước khi bất kỳ điều gì được tiến hành. |
| 55 | 235 | `text` | Kết nối |
| 56 | 236 | `text` | Chúng tôi chỉ xem xét những phụ nữ đã tự đăng ký với Heritage Union và thực sự sẵn sàng cho một kết nối, xác định những người có giá trị và hoàn cảnh phù hợp với hồ sơ của bạn. |
| 57 | 240 | `text` | Xem hồ sơ |
| 58 | 241 | `text` | Từ quá trình tìm kiếm đó, bạn có cơ hội xem tối đa 20 hồ sơ của những người phụ nữ đã đăng ký với chúng tôi và đồng ý cho khách hàng xem hồ sơ của mình — không bao giờ là một danh mục để duyệt xem, và không bao giờ kèm thông tin liên lạc. Sau đó, chúng ta cùng xác định năm người phù hợp nhất. |
| 59 | 245 | `text` | Những buổi giới thiệu chu đáo |
| 60 | 246 | `text` | Sau đó, bạn có cơ hội được giới thiệu với năm người đó. Trước mỗi buổi giới thiệu, cô ấy sẽ nhận được bản khai lý lịch của bạn bằng tiếng Việt và tự quyết định có tiếp tục hay không. Với mỗi người đồng ý, chúng tôi tạo điều kiện cho một buổi giới thiệu chính thức thông qua hình thức nào tự nhiên nhất với bạn — gọi điện, video, hoặc nhắn tin. |
| 61 | 250 | `text` | Kết nối, theo nhịp độ của riêng bạn |
| 62 | 251 | `text` | Từ thời điểm giới thiệu, mối quan hệ phát triển một cách tự nhiên, theo nhịp độ của riêng bạn. Chúng tôi luôn sẵn sàng hỗ trợ hướng dẫn văn hóa khi mọi thứ tiến triển — nhưng chúng tôi không theo dõi hay can thiệp vào cách kết nối của bạn diễn ra. Khi thời điểm thích hợp, chúng tôi có thể giúp điều phối một chuyến thăm để gặp gỡ trực tiếp, với các sắp xếp thực tế được xử lý kín đáo. |
| 63 | 263 | `text` | Khuôn Khổ Niềm Tin Của Heritage Union |
| 64 | 264 | `text` | Vì sao quy trình này thực sự hiệu quả. |
| 65 | 265 | `text` | Mọi giai đoạn đều được gắn kết bởi cùng những nguyên tắc — một quy trình chu đáo, sự hiện diện thực tế tại địa phương, sự tham gia của người sáng lập, và sự hỗ trợ liên tục. |
| 66 | 275 | `text` | Một quy trình chu đáo |
| 67 | 276 | `text` | Chúng tôi dành thời gian để thấu hiểu điều thực sự quan trọng với bạn, thay vì vội vàng hướng tới một kết nối. |
| 68 | 282 | `text` | Hiện diện thực tế tại địa phương |
| 69 | 283 | `text` | Sự hiện diện của chúng tôi tại Việt Nam có nghĩa là hướng dẫn văn hóa và hỗ trợ ngôn ngữ luôn sẵn sàng ngay khi bạn cần — không phải những lời khuyên chung chung viết từ xa. |
| 70 | 289 | `text` | Sự tham gia của người sáng lập |
| 71 | 290 | `text` | James đích thân tham gia vào mỗi buổi tư vấn. Đây là một công ty tư vấn do chính ông trực tiếp dẫn dắt, không phải một hệ thống vận hành mà không có ông. |
| 72 | 296 | `text` | Hướng dẫn văn hóa, xuyên suốt |
| 73 | 297 | `text` | Huyền, chuyên gia văn hóa độc lập và cầu nối của chúng tôi, hỗ trợ cả hai phía khi một kết nối phát triển — giúp vượt qua rào cản ngôn ngữ, khoảng cách và kỳ vọng với sự tự tin, từ buổi giới thiệu trở đi. |
| 74 | 310 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 75 | 311 | `text` | Bắt đầu giai đoạn đầu tiên. |
| 76 | 312 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 77 | 321 | `text` | Buổi tư vấn ban đầu miễn phí |
| 78 | 322 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 79 | 324 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 80 | 331 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 81 | 337 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 82 | 343 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 83 | 349 | `text` | Không ràng buộc, không áp lực |
| 84 | 354 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 85 | 355 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 86 | 363 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 87 | 384 | `attr:aria-label` | Heritage Union — về trang chủ |
| 88 | 388 | `text` | HERITAGE UNION |
| 89 | 391 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 90 | 394 | `text` | Đặt lịch tư vấn miễn phí |
| 91 | 399 | `text` | Khám Phá |
| 92 | 401 | `text` | Quy Trình |
| 93 | 402 | `text` | Dịch Vụ |
| 94 | 403 | `text` | Thành Công |
| 95 | 404 | `text` | Hỏi Huyền |
| 96 | 405 | `text` | Kiến Thức & Tài Nguyên |
| 97 | 406 | `text` | Biểu Phí |
| 98 | 407 | `text` | Hỏi Đáp |
| 99 | 413 | `text` | Giới Thiệu |
| 100 | 415 | `text` | Gặp Gỡ James |
| 101 | 416 | `text` | Gặp Gỡ Huyền |
| 102 | 417 | `text` | Câu Chuyện Của Chúng Tôi |
| 103 | 418 | `text` | Vì Sao Việt Nam |
| 104 | 424 | `text` | Liên Hệ |
| 105 | 426 | `text` | team@heritage-union.com |
| 106 | 427 | `text` | Trang liên hệ |
| 107 | 428 | `text` | Trở Thành Ứng Viên |
| 108 | 437 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/services.html`: 101 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Dịch Vụ — Công Ty Tư Vấn Quan Hệ Heritage Union |
| 2 | 11 | `meta:description` | Tư vấn quan hệ, hồ sơ quan hệ của bạn, kết nối với các ứng viên tự đăng ký, giới thiệu chu đáo, hướng dẫn đa văn hóa và hỗ trợ quan hệ — toàn bộ dịch vụ của Heritage Union. |
| 3 | 12 | `meta:keywords` | dịch vụ tư vấn quan hệ, hồ sơ quan hệ, kết nối ứng viên, hướng dẫn quan hệ đa văn hóa, dịch vụ hỗ trợ quan hệ, dịch vụ tư vấn quan hệ quốc tế |
| 4 | 25 | `meta:og:title` | Dịch Vụ — Công Ty Tư Vấn Quan Hệ Heritage Union |
| 5 | 26 | `meta:og:description` | Một công ty tư vấn quan hệ toàn diện — không bao giờ là một danh mục hồ sơ. Khám phá dịch vụ của Heritage Union. |
| 6 | 36 | `meta:twitter:title` | Dịch Vụ — Công Ty Tư Vấn Quan Hệ Heritage Union |
| 7 | 37 | `meta:twitter:description` | Một công ty tư vấn quan hệ toàn diện — không bao giờ là một danh mục hồ sơ. |
| 8 | 43 | `jsonld.provider.name` | Heritage Union |
| 9 | 43 | `jsonld.hasOfferCatalog.name` | Dịch Vụ Của Heritage Union |
| 10 | 43 | `jsonld.hasOfferCatalog.itemListElement[0].itemOffered.name` | Tư Vấn Quan Hệ |
| 11 | 43 | `jsonld.hasOfferCatalog.itemListElement[1].itemOffered.name` | Hồ Sơ Quan Hệ Của Bạn |
| 12 | 43 | `jsonld.hasOfferCatalog.itemListElement[2].itemOffered.name` | Ứng Viên Tự Đăng Ký |
| 13 | 43 | `jsonld.hasOfferCatalog.itemListElement[3].itemOffered.name` | Kết Nối Ứng Viên |
| 14 | 43 | `jsonld.hasOfferCatalog.itemListElement[4].itemOffered.name` | Giới Thiệu Chu Đáo |
| 15 | 43 | `jsonld.hasOfferCatalog.itemListElement[5].itemOffered.name` | Hướng Dẫn Đa Văn Hóa |
| 16 | 43 | `jsonld.hasOfferCatalog.itemListElement[6].itemOffered.name` | Hỗ Trợ Quan Hệ |
| 17 | 43 | `jsonld.hasOfferCatalog.itemListElement[7].itemOffered.name` | Cầu Nối Văn Hóa |
| 18 | 92 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 19 | 106 | `attr:aria-label` | Heritage Union — về trang chủ |
| 20 | 113 | `text` | HERITAGE UNION |
| 21 | 124 | `text` | Quy Trình |
| 22 | 125 | `text` | Dịch Vụ |
| 23 | 126 | `text` | Thành Công |
| 24 | 128 | `text` | Tài Nguyên |
| 25 | 133 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 26 | 139 | `text` | Giới Thiệu |
| 27 | 144 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 28 | 150 | `text` | Hỏi Đáp |
| 29 | 151 | `text` | Liên Hệ |
| 30 | 155 | `attr:aria-label` | Ngôn ngữ |
| 31 | 156 | `text` | EN \| VI |
| 32 | 160 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 33 | 162 | `attr:aria-label` | Mở menu điều hướng |
| 34 | 176 | `attr:aria-label` | Điều hướng trên di động |
| 35 | 178 | `attr:aria-label` | Ngôn ngữ |
| 36 | 179 | `text` | EN \| VI |
| 37 | 183 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 38 | 205 | `attr:aria-label` | Dịch Vụ — mở đầu |
| 39 | 207 | `text` | DỊCH VỤ |
| 40 | 208 | `text` | Một công ty tư vấn toàn diện, không bao giờ là một danh mục. |
| 41 | 209 | `text` | Mỗi giai đoạn của hành trình Heritage Union đều là một dịch vụ đúng nghĩa — chu đáo, mang tính cá nhân, và được James cùng Huyền dẫn dắt từ đầu đến cuối. |
| 42 | 213 | `text` | Đặt lịch tư vấn miễn phí Xem toàn bộ hành trình |
| 43 | 217 | `attr:aria-label` | Một cặp đôi dùng bữa tối bên ánh nến |
| 44 | 226 | `text` | Những Gì Chúng Tôi Mang Lại |
| 45 | 227 | `text` | Tám dịch vụ. Một hành trình chu đáo. |
| 46 | 228 | `text` | Chúng tôi là một công ty tư vấn quan hệ, không phải một nền tảng hẹn hò. Mỗi dịch vụ dưới đây tồn tại để bảo vệ sự nghiêm túc của quy trình — cho bạn, và cho những ứng viên chúng tôi giới thiệu cho bạn. |
| 47 | 237 | `text` | Tư Vấn Quan Hệ |
| 48 | 238 | `text` | Một mối quan hệ cố vấn mang tính cá nhân với James, từ buổi tư vấn đầu tiên đến một kết quả bền vững — một đầu mối liên hệ, một kế hoạch chu đáo. |
| 49 | 244 | `text` | Hồ Sơ Quan Hệ Của Bạn |
| 50 | 245 | `text` | Trước khi bắt đầu kết nối, chúng tôi dành thời gian để hiểu về giá trị, lối sống và điều bạn thực sự đang tìm kiếm ở người bạn đời tương lai. |
| 51 | 251 | `text` | Ứng Viên Tự Đăng Ký |
| 52 | 252 | `text` | Chúng tôi chỉ xem xét những phụ nữ đã tự đăng ký với Heritage Union, và xác định những người có giá trị và quan điểm họ chia sẻ phù hợp với hồ sơ của bạn. |
| 53 | 258 | `text` | Kết Nối Ứng Viên |
| 54 | 259 | `text` | Thay vì để bạn phải tự mình lướt qua vô số hồ sơ, chúng tôi đối chiếu hồ sơ của bạn với những thông tin mỗi phụ nữ đã chọn chia sẻ khi đăng ký, và giới thiệu những người phù hợp nhất để bạn cân nhắc. Buổi giới thiệu chỉ diễn ra khi cô ấy đồng ý. |
| 55 | 265 | `text` | Giới Thiệu Chu Đáo |
| 56 | 266 | `text` | Một số ít buổi giới thiệu mang tính cá nhân, mỗi buổi chỉ diễn ra khi cô ấy đồng ý — không bao giờ là một cơ sở dữ liệu hay một danh mục hồ sơ để duyệt xem. |
| 57 | 272 | `text` | Hướng Dẫn Đa Văn Hóa |
| 58 | 273 | `text` | Hướng dẫn liên tục về văn hóa, giao tiếp và kỳ vọng gia đình — yếu tố con người mà một mối quan hệ quốc tế bền vững phụ thuộc vào. |
| 59 | 279 | `text` | Hỗ Trợ Quan Hệ |
| 60 | 280 | `text` | Hỗ trợ tận tâm ở cấp độ cao, tiếp tục sau khi một buổi giới thiệu diễn ra — xuyên suốt quá trình phát triển của mối quan hệ, một chuyến thăm Việt Nam, và xa hơn nữa. Điều gì xảy ra từ đó là giữa bạn và người bạn đã gặp; chúng tôi luôn sẵn sàng nếu bạn cần hướng dẫn thêm trên chặng đường đó. |
| 61 | 286 | `text` | Cầu Nối Văn Hóa |
| 62 | 287 | `text` | Luôn có thể tiếp cận Huyền để được hỗ trợ về bối cảnh văn hóa và phiên dịch khi kết nối của bạn phát triển — kết nối ngôn ngữ, phong tục và kỳ vọng của cả hai phía. |
| 63 | 298 | `text` | Vì Sao Dịch Vụ Của Chúng Tôi Khác Biệt |
| 64 | 299 | `text` | Chúng tôi không bán quyền truy cập vào hồ sơ. Chúng tôi mang lại sự tin tưởng, hướng dẫn và am hiểu văn hóa — một môi trường uy tín, chu đáo cho những mối quan hệ chân thành, lâu dài được hình thành. |
| 65 | 302 | `text` | Mỗi dịch vụ ở trên đều tồn tại vì một lý do: loại bỏ sự phỏng đoán, những cuộc trò chuyện lãng phí và những ý định không rõ ràng khiến việc hẹn hò hiện đại trở nên khó chịu đối với những người nghiêm túc. Không có gì là tự động hóa, và không có gì bị bỏ mặc cho may rủi. |
| 66 | 306 | `text` | James Người Sáng Lập · Heritage Union |
| 67 | 319 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 68 | 320 | `text` | Tìm hiểu dịch vụ nào phù hợp với bạn. |
| 69 | 321 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 70 | 330 | `text` | Buổi tư vấn ban đầu miễn phí |
| 71 | 331 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 72 | 333 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 73 | 340 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 74 | 346 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 75 | 352 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 76 | 358 | `text` | Không ràng buộc, không áp lực |
| 77 | 363 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 78 | 364 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 79 | 372 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 80 | 393 | `attr:aria-label` | Heritage Union — về trang chủ |
| 81 | 397 | `text` | HERITAGE UNION |
| 82 | 400 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 83 | 403 | `text` | Đặt lịch tư vấn miễn phí |
| 84 | 408 | `text` | Khám Phá |
| 85 | 410 | `text` | Quy Trình |
| 86 | 411 | `text` | Dịch Vụ |
| 87 | 412 | `text` | Thành Công |
| 88 | 413 | `text` | Hỏi Huyền |
| 89 | 414 | `text` | Kiến Thức & Tài Nguyên |
| 90 | 415 | `text` | Biểu Phí |
| 91 | 416 | `text` | Hỏi Đáp |
| 92 | 422 | `text` | Giới Thiệu |
| 93 | 424 | `text` | Gặp Gỡ James |
| 94 | 425 | `text` | Gặp Gỡ Huyền |
| 95 | 426 | `text` | Câu Chuyện Của Chúng Tôi |
| 96 | 427 | `text` | Vì Sao Việt Nam |
| 97 | 433 | `text` | Liên Hệ |
| 98 | 435 | `text` | team@heritage-union.com |
| 99 | 436 | `text` | Trang liên hệ |
| 100 | 437 | `text` | Trở Thành Ứng Viên |
| 101 | 446 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/meet-james.html`: 96 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Gặp Gỡ James — Người Sáng Lập, Heritage Union |
| 2 | 11 | `meta:description` | James, người sáng lập Heritage Union. Một cuộc đời trải qua ba châu lục, một chương mới sau ly hôn, và lý do ông xây dựng công ty tư vấn mà ông từng ước có được. |
| 3 | 12 | `meta:keywords` | người sáng lập Heritage Union, James Heritage Union, câu chuyện người sáng lập công ty tư vấn quan hệ, câu chuyện tư vấn quan hệ Việt Nam |
| 4 | 25 | `meta:og:title` | Gặp Gỡ James — Người Sáng Lập, Heritage Union |
| 5 | 26 | `meta:og:description` | James, người sáng lập Heritage Union. Một cuộc đời trải qua ba châu lục, một chương mới sau ly hôn, và lý do ông xây dựng công ty tư vấn mà ông từng ước có được. |
| 6 | 36 | `meta:twitter:title` | Gặp Gỡ James — Người Sáng Lập, Heritage Union |
| 7 | 37 | `meta:twitter:description` | James, người sáng lập Heritage Union. Một cuộc đời trải qua ba châu lục và lý do ông xây dựng công ty tư vấn mà ông từng ước có được. |
| 8 | 43 | `jsonld.mainEntity.name` | James |
| 9 | 43 | `jsonld.mainEntity.jobTitle` | Người Sáng Lập |
| 10 | 43 | `jsonld.mainEntity.description` | Người sáng lập Heritage Union, công ty tư vấn quan hệ quốc tế có trụ sở tại Đà Nẵng, Việt Nam. |
| 11 | 43 | `jsonld.mainEntity.worksFor.name` | Heritage Union |
| 12 | 85 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 13 | 99 | `attr:aria-label` | Heritage Union — về trang chủ |
| 14 | 106 | `text` | HERITAGE UNION |
| 15 | 117 | `text` | Quy Trình |
| 16 | 118 | `text` | Dịch Vụ |
| 17 | 119 | `text` | Thành Công |
| 18 | 121 | `text` | Tài Nguyên |
| 19 | 126 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 20 | 132 | `text` | Giới Thiệu |
| 21 | 137 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 22 | 143 | `text` | Hỏi Đáp |
| 23 | 144 | `text` | Liên Hệ |
| 24 | 148 | `attr:aria-label` | Ngôn ngữ |
| 25 | 149 | `text` | EN \| VI |
| 26 | 153 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 27 | 155 | `attr:aria-label` | Mở menu điều hướng |
| 28 | 169 | `attr:aria-label` | Điều hướng trên di động |
| 29 | 171 | `attr:aria-label` | Ngôn ngữ |
| 30 | 172 | `text` | EN \| VI |
| 31 | 176 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 32 | 198 | `attr:aria-label` | Gặp Gỡ James — mở đầu |
| 33 | 200 | `text` | NGƯỜI SÁNG LẬP · CỐ VẤN · HERITAGE UNION |
| 34 | 201 | `text` | Dịch vụ mà tôi từng ước có được. |
| 35 | 202 | `text` | Ly hôn ở tuổi năm mươi sau ba mươi tư năm hôn nhân, James đã xây dựng lại cuộc sống của mình tại Việt Nam — và sáng lập Heritage Union để mang đến cho những người đàn ông khác quy trình mà chính ông đã không thể tìm thấy cho bản thân. |
| 36 | 206 | `text` | Đặt lịch tư vấn miễn phí Quy trình hoạt động |
| 37 | 212 | `attr:alt` | Chân dung James, người sáng lập Heritage Union |
| 38 | 222 | `text` | Câu Chuyện Người Sáng Lập |
| 39 | 223 | `text` | Một cuộc đời trải qua ba châu lục. |
| 40 | 227 | `text` | James sinh ra và lớn lên tại Nam Phi, nơi ông kết hôn với mối tình thời trung học ở tuổi hai mươi hai. Cùng nhau, họ xây dựng một cuộc sống và nuôi dạy hai người con. |
| 41 | 228 | `text` | Năm 1996, một kỳ nghỉ làm việc hai năm đã đưa gia đình ông đến Vương Quốc Anh. Hai năm trở thành mười bốn năm — sự nghiệp được xây dựng, con cái trưởng thành, một chương mới được đón nhận. Năm 2007, một cơ hội khác đưa họ đến Dubai, nơi họ sinh sống trong mười lăm năm. |
| 42 | 229 | `text` | "Nhìn lại, tôi cảm thấy vô cùng biết ơn về những trải nghiệm đó — về đặc ân được nuôi dạy một gia đình trong khi sống và làm việc ở nhiều nơi khác nhau trên thế giới." |
| 43 | 233 | `text` | Một chương mới, không hề dự đoán trước |
| 44 | 234 | `text` | Sau khi ly hôn ở tuổi năm mươi, sau ba mươi tư năm trong một mối quan hệ đầy yêu thương và cam kết, James nhận ra mình đang bước vào một thế giới mà ông biết rất ít về nó. |
| 45 | 235 | `text` | Thay vì quay về những điều quen thuộc, ông chọn một cuộc phiêu lưu mới — Đông Nam Á, một khu vực đã hấp dẫn ông trong nhiều năm. Từng đi qua Thái Lan, Campuchia và Việt Nam cùng gia đình, cuối cùng ông đã chọn Đà Nẵng, Việt Nam làm quê hương thứ hai của mình. |
| 46 | 239 | `text` | Khám phá Việt Nam |
| 47 | 240 | `text` | Ngay từ khoảnh khắc đặt chân đến, James đã bị cuốn hút bởi sự ấm áp, năng lượng và văn hóa của Việt Nam — một dân tộc mà ông nhận thấy thân thiện, chăm chỉ và vô cùng tự hào về đất nước mình, với sự coi trọng gia đình, sự tôn trọng và cộng đồng mà ông thấy vừa mới mẻ vừa truyền cảm hứng. |
| 48 | 241 | `text` | Khi hòa mình vào cuộc sống thường nhật, ông dần trân trọng những phẩm chất tương tự ở nhiều phụ nữ Việt Nam: thông minh, độc lập, coi trọng gia đình và vững vàng trong những giá trị truyền thống, đồng thời đón nhận cuộc sống hiện đại với sự tự tin và khát vọng. Trên hết, đó là những con người trân trọng những mối quan hệ chân thành và một tương lai ý nghĩa. |
| 49 | 245 | `text` | Điều thế giới hẹn hò hiện đại đã sai |
| 50 | 246 | `text` | Giống như nhiều người quay lại thế giới hẹn hò ở giai đoạn muộn hơn của cuộc đời, James đã thử mọi cách có sẵn — ứng dụng hẹn hò, giới thiệu qua bạn bè, sự kiện xã hội, nhóm kết nối, hẹn cà phê, ăn trưa, ăn tối. |
| 51 | 247 | `text` | Điều ông nhận thấy là một quy trình thường khiến ông thất vọng, tốn thời gian và bất định. Những cuộc trò chuyện hiếm khi dẫn đến điều gì ý nghĩa. Hồ sơ không phải lúc nào cũng phản ánh đúng thực tế. Ý định thường không rõ ràng. |
| 52 | 248 | `text` | Ông nhận ra mình không đơn độc. Nhiều người đàn ông thành đạt khác cũng đã trải qua chính xác những nỗi thất vọng tương tự. Họ không tìm kiếm việc hẹn hò vô tận, hay những cuộc gặp gỡ qua loa. Họ đang tìm kiếm sự đồng hành. Gia đình. Một người để cùng xây dựng chương tiếp theo của cuộc đời. |
| 53 | 249 | `text` | Rõ ràng là phải có một cách tốt hơn. Khi James không thể tìm thấy dịch vụ mà ông đang tìm kiếm, ông quyết định tự mình tạo ra nó. |
| 54 | 259 | `text` | Vì Sao Heritage Union Ra Đời |
| 55 | 260 | `text` | Heritage Union được thành lập dựa trên một niềm tin đơn giản: những mối quan hệ ý nghĩa xứng đáng được chăm sóc, chuyên nghiệp và hỗ trợ nhiều hơn những gì việc hẹn hò hiện đại thường mang lại. |
| 56 | 263 | `text` | Vai trò của chúng tôi không đơn thuần là giới thiệu con người với nhau. Vai trò của chúng tôi là thấu hiểu khách hàng, cân nhắc kỹ lưỡng sự phù hợp, cung cấp hướng dẫn văn hóa, và tạo ra môi trường tốt nhất có thể để những mối quan hệ chân thành, lâu dài được phát triển. |
| 57 | 266 | `text` | Hành trình của mỗi khách hàng đều mang tính cá nhân. Mỗi buổi giới thiệu đều được cân nhắc kỹ lưỡng. Mỗi mối quan hệ đều xứng đáng được tôn trọng. |
| 58 | 269 | `text` | James hợp tác chặt chẽ với Huyền, một chuyên gia văn hóa độc lập và cầu nối tại Việt Nam, kết hợp kiến thức thực tế, sự am hiểu văn hóa và một phương pháp tận tâm mang tính cá nhân hóa cao — hỗ trợ cả khách hàng và những người phụ nữ lựa chọn trở thành một phần của cộng đồng Heritage Union. |
| 59 | 278 | `attr:aria-label` | Lời chia sẻ từ James |
| 60 | 286 | `text` | "Với tôi, Heritage Union còn hơn cả một doanh nghiệp. Đó là dịch vụ mà tôi từng ước có được khi bắt đầu hành trình của chính mình." |
| 61 | 289 | `text` | James, Người Sáng Lập |
| 62 | 300 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 63 | 301 | `text` | Tôi rất mong được lắng nghe câu chuyện của bạn. |
| 64 | 302 | `text` | Nếu trải nghiệm của James có thể giúp những người khác tìm được sự đồng hành, hạnh phúc và gia đình, Heritage Union sẽ hoàn thành đúng sứ mệnh mà nó được tạo ra để thực hiện. Mỗi buổi tư vấn bắt đầu bằng một cuộc trò chuyện riêng tư trực tiếp với ông — ba mươi phút không vội vã, hoàn toàn bảo mật, không ràng buộc. |
| 65 | 311 | `text` | Buổi tư vấn ban đầu miễn phí |
| 66 | 312 | `text` | Một cuộc trò chuyện riêng tư với James. |
| 67 | 314 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 68 | 321 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 69 | 327 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 70 | 333 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 71 | 339 | `text` | Không ràng buộc, không áp lực |
| 72 | 344 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 73 | 345 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 74 | 353 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 75 | 374 | `attr:aria-label` | Heritage Union — về trang chủ |
| 76 | 378 | `text` | HERITAGE UNION |
| 77 | 381 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 78 | 384 | `text` | Đặt lịch tư vấn miễn phí |
| 79 | 389 | `text` | Khám Phá |
| 80 | 391 | `text` | Quy Trình |
| 81 | 392 | `text` | Dịch Vụ |
| 82 | 393 | `text` | Thành Công |
| 83 | 394 | `text` | Hỏi Huyền |
| 84 | 395 | `text` | Kiến Thức & Tài Nguyên |
| 85 | 396 | `text` | Biểu Phí |
| 86 | 397 | `text` | Hỏi Đáp |
| 87 | 403 | `text` | Giới Thiệu |
| 88 | 405 | `text` | Gặp Gỡ James |
| 89 | 406 | `text` | Gặp Gỡ Huyền |
| 90 | 407 | `text` | Câu Chuyện Của Chúng Tôi |
| 91 | 408 | `text` | Vì Sao Việt Nam |
| 92 | 414 | `text` | Liên Hệ |
| 93 | 416 | `text` | team@heritage-union.com |
| 94 | 417 | `text` | Trang liên hệ |
| 95 | 418 | `text` | Trở Thành Ứng Viên |
| 96 | 427 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/meet-huyen.html`: 101 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Gặp Gỡ Huyền — Chuyên Gia Văn Hóa Độc Lập & Cầu Nối, Heritage Union |
| 2 | 11 | `meta:description` | Huyền, Chuyên Gia Văn Hóa Độc Lập & Cầu Nối của Heritage Union tại Việt Nam. Hướng dẫn văn hóa, phiên dịch và hỗ trợ ngôn ngữ cho cả khách hàng và ứng viên. |
| 3 | 12 | `meta:keywords` | Huyền Heritage Union, chuyên gia văn hóa Việt Nam, cầu nối văn hóa độc lập, trở thành ứng viên Heritage Union |
| 4 | 25 | `meta:og:title` | Gặp Gỡ Huyền — Chuyên Gia Văn Hóa Độc Lập & Cầu Nối, Heritage Union |
| 5 | 26 | `meta:og:description` | Huyền, chuyên gia văn hóa độc lập của Heritage Union tại Việt Nam. Hướng dẫn văn hóa, phiên dịch và hỗ trợ ngôn ngữ tận tâm. |
| 6 | 36 | `meta:twitter:title` | Gặp Gỡ Huyền — Chuyên Gia Văn Hóa Độc Lập & Cầu Nối, Heritage Union |
| 7 | 37 | `meta:twitter:description` | Huyền, chuyên gia văn hóa độc lập của Heritage Union tại Việt Nam. |
| 8 | 43 | `jsonld.mainEntity.name` | Huyen |
| 9 | 43 | `jsonld.mainEntity.jobTitle` | Chuyên Gia Văn Hóa Độc Lập & Cầu Nối |
| 10 | 43 | `jsonld.mainEntity.description` | Chuyên gia văn hóa độc lập, cung cấp hướng dẫn văn hóa, phiên dịch và hỗ trợ ngôn ngữ cho khách hàng và ứng viên của Heritage Union. |
| 11 | 77 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 12 | 91 | `attr:aria-label` | Heritage Union — về trang chủ |
| 13 | 98 | `text` | HERITAGE UNION |
| 14 | 109 | `text` | Quy Trình |
| 15 | 110 | `text` | Dịch Vụ |
| 16 | 111 | `text` | Thành Công |
| 17 | 113 | `text` | Tài Nguyên |
| 18 | 118 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 19 | 124 | `text` | Giới Thiệu |
| 20 | 129 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 21 | 135 | `text` | Hỏi Đáp |
| 22 | 136 | `text` | Liên Hệ |
| 23 | 140 | `attr:aria-label` | Ngôn ngữ |
| 24 | 141 | `text` | EN \| VI |
| 25 | 145 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 26 | 147 | `attr:aria-label` | Mở menu điều hướng |
| 27 | 161 | `attr:aria-label` | Điều hướng trên di động |
| 28 | 163 | `attr:aria-label` | Ngôn ngữ |
| 29 | 164 | `text` | EN \| VI |
| 30 | 168 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 31 | 190 | `attr:aria-label` | Gặp Gỡ Huyền — mở đầu |
| 32 | 192 | `text` | CHUYÊN GIA VĂN HÓA ĐỘC LẬP & CẦU NỐI |
| 33 | 193 | `text` | Cầu nối giữa hai thế giới. |
| 34 | 194 | `text` | Sinh ra ở miền Bắc, học tập ở miền Nam và an cư ở miền Trung, Huyền đã sống trọn dải đất Việt Nam từ Bắc vào Nam. Cô là chuyên gia văn hóa độc lập và cầu nối đứng sau mọi hướng dẫn văn hóa của Heritage Union. Cô mang đến sự am hiểu thực tế, giúp những thiện chí ban đầu trở thành những mối quan hệ bền vững. |
| 35 | 198 | `text` | Đặt lịch tư vấn miễn phí Quy trình hoạt động |
| 36 | 204 | `attr:alt` | Huyền, Quản lý Quan hệ & Văn hóa Việt Nam tại Heritage Union |
| 37 | 216 | `text` | Câu Chuyện Của Cô |
| 38 | 217 | `text` | Việt Nam, nhìn từ bên trong. |
| 39 | 221 | `text` | Huyền sinh ra và lớn lên ở Ninh Bình, miền Bắc Việt Nam, trong một gia đình luôn đặt sự thủy chung, lòng tôn trọng và tình thân lên trên hết. Đến hôm nay, những giá trị ấy vẫn là nền tảng cho mỗi lời khuyên cô đưa ra. |
| 40 | 222 | `text` | Học xong phổ thông, cô vào Nam, theo học tại Đại học Tôn Đức Thắng ở Thành phố Hồ Chí Minh. Cô gắn bó với thành phố ấy mười năm, ban đầu là học tập, sau đó là lập nghiệp. Rồi cô chuyển đến Đà Nẵng, thành phố biển miền Trung, nơi đã là nhà của cô gần mười năm nay. |
| 41 | 226 | `text` | Ba miền, một đất nước |
| 42 | 227 | `text` | Không nhiều người hiểu cả ba miền Việt Nam từ bên trong, và sự khác biệt giữa các miền là có thật. Miền Bắc giữ gìn truyền thống và lễ nghi, coi trọng chuẩn mực và sự tinh tế trong cách cư xử. Miền Trung nổi tiếng với sự bền bỉ, chừng mực và thủy chung. Miền Nam cởi mở, linh hoạt, thực tế và nhanh thích nghi. |
| 43 | 228 | `text` | Dĩ nhiên, mỗi người là một cá nhân riêng, và không đặc điểm vùng miền nào định nghĩa được một con người. Nhưng khi hiểu gia đình một người đến từ đâu, và những kỳ vọng mà họ lớn lên cùng, ta có thể tránh được nhiều hiểu lầm âm thầm thường nảy sinh khi hai nền văn hóa gặp nhau. |
| 44 | 232 | `text` | Hai mươi năm thấu hiểu con người |
| 45 | 233 | `text` | Hơn hai mươi năm qua, Huyền làm việc trong lĩnh vực giáo dục và kinh doanh cho các công ty Việt Nam và quốc tế, trong đó có Poly, BV FV Saigon và Gamma. Cô từng đảm nhiệm các vị trí như Trưởng phòng Kinh doanh và Giám đốc Kinh doanh. Những công việc như vậy đều bắt đầu từ việc thấu hiểu con người: lắng nghe cẩn thận, nhận ra điều gì thực sự quan trọng với một người, và giúp hai bên trong một cuộc trò chuyện đi đến cùng một sự thấu hiểu. |
| 46 | 234 | `text` | Rất lâu trước khi có Heritage Union, cô đã làm điều này cho bạn bè và người thân. Cô giúp họ tìm được tiếng nói chung giữa truyền thống Việt Nam và những kỳ vọng của thế giới bên ngoài, chuyển tải không chỉ ngôn từ mà cả ý tứ. |
| 47 | 235 | `text` | "Hai người có thể nói cùng một câu mà ý nghĩa lại rất khác nhau. Công việc của tôi là giúp mỗi bên hiểu được điều người kia thật sự muốn nói." |
| 48 | 239 | `text` | Đồng hành cùng James |
| 49 | 240 | `text` | Khi James bắt đầu hình dung về một công ty tư vấn được xây dựng trên niềm tin thay vì số lượng, ông cần một người nhìn rõ được cả hai phía của cây cầu. Đó phải là người mà phụ nữ Việt Nam có thể hoàn toàn tin tưởng, và cũng là người mà khách hàng phương Tây có thể dựa vào để có một góc nhìn trung thực, không tô vẽ. |
| 50 | 241 | `text` | Huyền chính là người đó. Là chuyên gia văn hóa độc lập và cầu nối, cô mang đến sự hướng dẫn văn hóa, phiên dịch và hỗ trợ ngôn ngữ, giúp một mối quan hệ đa văn hóa chân thành trở nên khả thi. Sự hỗ trợ ấy dành cho khách hàng khi tìm hiểu Việt Nam, và cho bất kỳ người phụ nữ nào có câu hỏi khi mối quan hệ của chính mình đang tiến triển. |
| 51 | 245 | `text` | Hướng dẫn văn hóa, xuyên suốt hành trình |
| 52 | 246 | `text` | Huyền là người khách hàng tìm đến khi một cuộc trò chuyện bị lạc nghĩa, dù vì ngôn ngữ hay vì kỳ vọng. Trách nhiệm với gia đình, nhịp độ của một mối quan hệ nghiêm túc, vai trò của cha mẹ, hay đơn giản là cách thể hiện sự tôn trọng trong một nền văn hóa mới: chính cô đã trải qua những câu hỏi này, ở ba vùng miền rất khác nhau của Việt Nam. |
| 53 | 247 | `text` | Sự hướng dẫn của cô vẫn tiếp tục rất lâu sau khi một buổi giới thiệu diễn ra, qua từng giai đoạn khi mối quan hệ lớn dần lên, hướng tới một tương lai chân thành và bền vững. Cô cũng luôn sẵn sàng hỗ trợ bất kỳ người phụ nữ nào đăng ký với Heritage Union khi có câu hỏi trong suốt quá trình này. |
| 54 | 248 | `text` | Bạn là phụ nữ Việt Nam và quan tâm đến việc đăng ký với Heritage Union? Tìm hiểu thêm → |
| 55 | 259 | `text` | Vai Trò Của Cô Tại Heritage Union |
| 56 | 260 | `text` | Am hiểu thực tế, được thực hiện với sự chu đáo. |
| 57 | 261 | `text` | Chỉ ba điều, và duy nhất ba điều: hướng dẫn văn hóa, hỗ trợ ngôn ngữ, và những câu trả lời trung thực. |
| 58 | 268 | `text` | Hướng dẫn văn hóa |
| 59 | 269 | `text` | Giúp khách hàng hiểu về đời sống gia đình, giá trị và kỳ vọng của người Việt Nam — và giúp bất kỳ người phụ nữ nào có câu hỏi hiểu về cuộc sống cùng một người bạn đời phương Tây. |
| 60 | 273 | `text` | Phiên dịch & hỗ trợ ngôn ngữ |
| 61 | 274 | `text` | Phiên dịch rõ ràng, chính xác và hỗ trợ ngôn ngữ cho cả hai phía của một cuộc trò chuyện — để không điều gì quan trọng bị thất lạc trong quá trình trao đổi. |
| 62 | 278 | `text` | Hỏi Huyền |
| 63 | 279 | `text` | Một lời mời thường trực để đặt những câu hỏi thực sự về văn hóa Việt Nam, gia đình và những gì một mối quan hệ đa văn hóa thực sự liên quan — được trả lời trung thực, trong chuỗi bài Hỏi Huyền. |
| 64 | 288 | `attr:aria-label` | Lời chia sẻ từ Huyền |
| 65 | 296 | `text` | "Tôi tự hào là người Việt Nam, và tôi tự hào về sự thấu hiểu mà tôi có thể mang lại cho cả hai phía trong một mối quan hệ như thế này. Công việc của tôi là đảm bảo không điều gì chân thật bị thất lạc giữa hai nền văn hóa." |
| 66 | 299 | `text` | Huyền, Chuyên Gia Văn Hóa Độc Lập & Cầu Nối |
| 67 | 310 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 68 | 311 | `text` | Hãy cùng trò chuyện về điều bạn đang tìm kiếm. |
| 69 | 312 | `text` | Mỗi buổi tư vấn bắt đầu bằng một cuộc trò chuyện riêng tư với James — cùng với sự hướng dẫn văn hóa của Huyền luôn sẵn sàng trong suốt hành trình. Ba mươi phút không vội vã, hoàn toàn bảo mật, không ràng buộc. |
| 70 | 321 | `text` | Buổi tư vấn ban đầu miễn phí |
| 71 | 322 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 72 | 324 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 73 | 331 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 74 | 337 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 75 | 343 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 76 | 349 | `text` | Không ràng buộc, không áp lực |
| 77 | 354 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 78 | 355 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 79 | 363 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 80 | 384 | `attr:aria-label` | Heritage Union — về trang chủ |
| 81 | 388 | `text` | HERITAGE UNION |
| 82 | 391 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 83 | 394 | `text` | Đặt lịch tư vấn miễn phí |
| 84 | 399 | `text` | Khám Phá |
| 85 | 401 | `text` | Quy Trình |
| 86 | 402 | `text` | Dịch Vụ |
| 87 | 403 | `text` | Thành Công |
| 88 | 404 | `text` | Hỏi Huyền |
| 89 | 405 | `text` | Kiến Thức & Tài Nguyên |
| 90 | 406 | `text` | Biểu Phí |
| 91 | 407 | `text` | Hỏi Đáp |
| 92 | 413 | `text` | Giới Thiệu |
| 93 | 415 | `text` | Gặp Gỡ James |
| 94 | 416 | `text` | Gặp Gỡ Huyền |
| 95 | 417 | `text` | Câu Chuyện Của Chúng Tôi |
| 96 | 418 | `text` | Vì Sao Việt Nam |
| 97 | 424 | `text` | Liên Hệ |
| 98 | 426 | `text` | team@heritage-union.com |
| 99 | 427 | `text` | Trang liên hệ |
| 100 | 428 | `text` | Trở Thành Ứng Viên |
| 101 | 437 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/success-stories.html`: 100 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 11 | `text` | Câu Chuyện Thành Công — Heritage Union |
| 2 | 12 | `meta:description` | Heritage Union vừa mới ra mắt — nhưng quy trình đằng sau nó đã được thử nghiệm từ rất lâu trước khi trở thành một doanh nghiệp. Câu chuyện thật của hai người bạn đã truyền cảm hứng cho nó, và những chia sẻ của người sáng lập về lý do nó tồn tại. |
| 3 | 13 | `meta:keywords` | câu chuyện Heritage Union, khởi nguồn tư vấn quan hệ quốc tế, tư vấn quan hệ Việt Nam, câu chuyện quan hệ đa văn hóa |
| 4 | 26 | `meta:og:title` | Câu Chuyện Thành Công — Heritage Union |
| 5 | 27 | `meta:og:description` | Heritage Union vừa mới ra mắt — đây là câu chuyện thật của hai người bạn đã truyền cảm hứng cho nó, và lý do người sáng lập đã xây dựng nó. |
| 6 | 37 | `meta:twitter:title` | Câu Chuyện Thành Công — Heritage Union |
| 7 | 38 | `meta:twitter:description` | Heritage Union vừa mới ra mắt — đây là câu chuyện thật của hai người bạn đã truyền cảm hứng cho nó, và lý do người sáng lập đã xây dựng nó. |
| 8 | 62 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 9 | 76 | `attr:aria-label` | Heritage Union — về trang chủ |
| 10 | 83 | `text` | HERITAGE UNION |
| 11 | 94 | `text` | Quy Trình |
| 12 | 95 | `text` | Dịch Vụ |
| 13 | 96 | `text` | Thành Công |
| 14 | 98 | `text` | Tài Nguyên |
| 15 | 103 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 16 | 109 | `text` | Giới Thiệu |
| 17 | 114 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 18 | 120 | `text` | Hỏi Đáp |
| 19 | 121 | `text` | Liên Hệ |
| 20 | 125 | `attr:aria-label` | Ngôn ngữ |
| 21 | 126 | `text` | EN \| VI |
| 22 | 130 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 23 | 132 | `attr:aria-label` | Mở menu điều hướng |
| 24 | 146 | `attr:aria-label` | Điều hướng trên di động |
| 25 | 148 | `attr:aria-label` | Ngôn ngữ |
| 26 | 149 | `text` | EN \| VI |
| 27 | 153 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 28 | 175 | `attr:aria-label` | Câu Chuyện Thành Công — mở đầu |
| 29 | 177 | `text` | KHỞI ĐẦU NHƯ THẾ NÀO |
| 30 | 178 | `text` | Hai người bạn. Một quy trình chân thành. |
| 31 | 179 | `text` | Heritage Union vừa mới ra mắt, và chúng tôi muốn bạn nghe sự thật từ chính chúng tôi hơn là tự suy đoán: chúng tôi chưa có khách hàng trả phí để dẫn chứng. Điều chúng tôi có là đây — trải nghiệm thật của hai người bạn thân đã tin tưởng người sáng lập của chúng tôi với điều riêng tư này, từ rất lâu trước khi nó trở thành một doanh nghiệp, và sự tự tin mà trải nghiệm đó đã trao cho anh ấy để xây dựng nó thành một điều lớn lao hơn. |
| 32 | 183 | `text` | Đặt lịch tư vấn miễn phí Quy trình hoạt động |
| 33 | 187 | `attr:aria-label` | Một cặp đôi cùng khám phá khu chợ Việt Nam |
| 34 | 196 | `text` | Những Câu Chuyện Đằng Sau Heritage Union |
| 35 | 197 | `text` | Bạn bè thật. Kết quả thật. Lý do chúng tôi tồn tại. |
| 36 | 202 | `text` | J |
| 37 | 204 | `text` | John 60 tuổi · Vương Quốc Anh |
| 38 | 208 | `text` | Kiên nhẫn, không phải số lượng |
| 39 | 209 | `text` | Sau khi ly hôn, tôi đã dành gần bảy năm để cố gắng tìm một người để cùng chia sẻ cuộc sống. Giống như nhiều người đàn ông ở tuổi tôi, các ứng dụng hẹn hò có vẻ là lựa chọn dễ dàng nhất — nhưng chúng trở thành một vòng lặp của sự thất vọng: những cuộc trò chuyện bất tận chẳng đi đến đâu, những hồ sơ không trung thực, và những buổi hẹn mà chỉ trong nửa tiếng đầu tiên chúng tôi đã nhận ra mình muốn những điều hoàn toàn khác nhau. Tôi đã chi hàng nghìn bảng cho các gói thành viên, những bữa tối và những chuyến đi chẳng dẫn đến đâu. Hơn cả tiền bạc, đó là sự kiệt quệ về mặt cảm xúc. Tôi không tìm kiếm những mối quan hệ hời hợt. Tôi muốn một người bạn đời thực sự — người coi trọng lòng chung thủy, gia đình và việc cùng nhau xây dựng một tương lai. |
| 40 | 210 | `text` | James là một người bạn tốt của tôi, và khi biết tôi đã trải qua những gì, anh ấy hỏi liệu có thể giúp tôi không — không phải như một sự sắp xếp chính thức nào cả, chỉ đơn giản là một người bạn muốn làm điều đúng đắn cho bạn mình. Anh ấy bắt đầu bằng cách thực sự tìm hiểu về tôi: cuộc sống, giá trị sống, tính cách của tôi, liệu tôi có muốn có con hay không, nơi tôi hy vọng sẽ sống trong tương lai, và điều tôi thực sự cần ở một người bạn đời — không chỉ là điều tôi thấy hấp dẫn. |
| 41 | 211 | `text` | Chứng kiến cách James xử lý mọi thứ cẩn trọng đến vậy — cho cả hai phía, không chỉ riêng tôi — cho tôi thấy đây không phải là một sự giúp đỡ qua loa. Đó là điều mà anh ấy thực sự có một năng khiếu đặc biệt. Nhìn lại, tôi nghĩ trải nghiệm của tôi đã góp phần cho anh ấy sự tự tin để xây dựng điều này thành một điều gì đó lớn lao hơn. Với tôi, đó chính là điều tạo nên sự khác biệt. |
| 42 | 212 | `text` | "Mỗi buổi giới thiệu đều có lý do của nó. Không ai phải đoán mò." |
| 43 | 217 | `text` | A |
| 44 | 219 | `text` | Adam 57 tuổi · Úc |
| 45 | 223 | `text` | Một nền tảng vững chắc trước buổi hẹn đầu tiên |
| 46 | 224 | `text` | Tôi đã ly hôn gần sáu năm khi cuối cùng tôi thừa nhận với chính mình rằng việc hẹn hò trực tuyến đơn giản là không hiệu quả. Mỗi tuần đều giống nhau — hàng giờ lướt qua các hồ sơ, tự hỏi liệu những bức ảnh có phải là ảnh gần đây không, trả tiền cho các gói thành viên cao cấp hứa hẹn những kết nối tốt hơn nhưng chỉ mang lại nhiều thất vọng hơn. Rồi đến những bữa tối và cà phê với những người phụ nữ hoàn toàn tử tế, nhưng chúng tôi nhanh chóng nhận ra mình muốn những cuộc sống hoàn toàn khác nhau. Không ai sai cả — chỉ là sự không phù hợp. |
| 47 | 225 | `text` | James là một người bạn lâu năm, và khi tôi kể anh ấy nghe mình đã kiệt sức vì tất cả những điều đó, anh ấy đề nghị giúp đỡ. Lúc đó nó chưa phải là một công việc kinh doanh — chỉ đơn giản là James, muốn thấy một người bạn được hạnh phúc. Anh ấy không quan tâm đến việc giới thiệu tôi với càng nhiều phụ nữ càng tốt. Thay vào đó, anh ấy muốn hiểu tôi trước: giá trị sống, tính cách, gia đình, kế hoạch nghỉ hưu, công việc, lối sống, đức tin, và loại mối quan hệ tôi hy vọng xây dựng trong hai hoặc ba mươi năm tới. |
| 48 | 226 | `text` | Điều đó không có nghĩa là mọi buổi giới thiệu đều trở thành một mối quan hệ, nhưng mỗi buổi gặp gỡ đều đáng giá, và có sự tôn trọng lẫn nhau ngay từ đầu vì cả hai chúng tôi đều hiểu vì sao mình được giới thiệu với nhau. Trớ trêu thay, việc chờ đợi lâu hơn một chút ở giai đoạn đầu đã tiết kiệm được rất nhiều thời gian, tiền bạc và cảm xúc về sau. Nhìn lại, tôi biết trải nghiệm của tôi — cùng với của John — là một phần lý do đã cho James niềm tin rằng điều này thực sự có thể giúp đỡ những người khác nữa. |
| 49 | 227 | `text` | "Việc chờ đợi lâu hơn một chút ở giai đoạn đầu đã tiết kiệm được rất nhiều thời gian, tiền bạc và cảm xúc về sau." |
| 50 | 232 | `text` | J |
| 51 | 234 | `text` | James Người sáng lập, Heritage Union |
| 52 | 238 | `text` | Heritage Union đã tìm thấy mục đích của mình như thế nào |
| 53 | 239 | `text` | Tôi không bắt đầu với ý định xây dựng một doanh nghiệp. Tôi bắt đầu chỉ để giúp đỡ hai người bạn. Adam và John đều đã trải qua guồng quay mệt mỏi của việc hẹn hò hiện đại — nhiều năm dùng ứng dụng, những buổi tối lãng phí, và sự cô đơn đặc biệt của việc liên tục đặt bản thân ra ngoài kia mà không hề đến gần hơn với điều mình thực sự mong muốn. Tôi đã quen biết cả hai người trong nhiều năm. Tôi nghĩ mình hiểu họ. Tôi đã sai, hoặc ít nhất, tôi chỉ đúng một phần. |
| 54 | 240 | `text` | Khi tôi ngồi xuống trò chuyện với từng người — không phải một cuộc trò chuyện qua loa, mà là những cuộc trò chuyện thực sự, không vội vã — tôi bắt đầu nhận ra những điều nhỏ nhặt. Một cụm từ được lặp lại hơi thường xuyên. Một từ được chọn lựa cẩn thận, rồi lại được rút lại. Cách một người mô tả điều họ muốn ở một người bạn đời, rồi lại tự mâu thuẫn với chính mình hai câu sau đó mà không nhận ra. Đây không phải là những mâu thuẫn theo nghĩa xấu — đó là dấu hiệu của những điều mà cả hai người chưa từng thực sự diễn đạt rõ ràng với chính mình, chứ đừng nói đến với tôi. Việc vượt qua câu trả lời được trau chuốt để đến với câu trả lời thật sự hóa ra chính là chìa khóa quan trọng nhất. Một khi tìm được điều đó, mọi thứ khác trở nên dễ dàng hơn. |
| 55 | 241 | `text` | Quá trình đó đã đưa tôi đến với một đất nước và một nền văn hóa mà tôi nghĩ mình đã hiểu rõ. Tôi đã đến Việt Nam nhiều lần trước khi tất cả những điều này bắt đầu, và tôi có những người bạn địa phương cũng như những người bạn nước ngoài lâu năm đã xây dựng cuộc sống của họ ở đó — nhưng sớm nhận ra rằng thiện chí và sự quen thuộc thôi là chưa đủ. Kết nối hai con người một cách đúng đắn đòi hỏi sự thấu hiểu cả hai phía với chiều sâu tương đương, và tôi không thể làm điều đó một mình từ nửa kia của thế giới. |
| 56 | 242 | `text` | Tôi nhận ra rằng những người chúng tôi hy vọng giúp đỡ cần một người thực sự có một chân ở cả hai thế giới — song ngữ, từng trải, và thấu hiểu sâu sắc những sắc thái văn hóa mà tôi có thể cảm nhận nhưng không phải lúc nào cũng chuyển tải được. Đó là lý do đưa tôi đến với Huyền. Sự tham gia của cô ấy không chỉ đơn thuần lấp đầy một khoảng trống — nó đã thay đổi hoàn toàn hình dạng của những gì chúng tôi có thể mang lại, và giúp cả hai phía thực sự hiểu nhau theo cách mà tôi không bao giờ có thể tự mình làm được. |
| 57 | 243 | `text` | Nhìn lại, việc giúp đỡ Adam và John không chỉ là tia lửa khởi đầu cho Heritage Union. Đó là khoảnh khắc tôi khám phá ra một niềm đam mê thực sự với công việc này. Có một điều gì đó thực sự phi thường khi chứng kiến hai con người tìm thấy nhau, chỉ vì có ai đó đã dành thời gian để thấu hiểu họ một cách trọn vẹn. Đó là toàn bộ lý do vì sao điều này tồn tại. |
| 58 | 244 | `text` | "Có một điều gì đó thực sự phi thường khi chứng kiến hai con người tìm thấy nhau, chỉ vì có ai đó đã dành thời gian để thấu hiểu họ một cách trọn vẹn." |
| 59 | 254 | `text` | Thành Công Trông Như Thế Nào |
| 60 | 255 | `text` | Mỗi hành trình đều khác nhau. Nhưng hình dáng của một hành trình tốt đẹp thì hiếm khi khác biệt. |
| 61 | 258 | `text` | Nó bắt đầu bằng một cuộc trò chuyện riêng tư, chân thành. Nó tiếp tục qua quá trình kết nối ứng viên cẩn trọng, những buổi giới thiệu chu đáo và sự hướng dẫn không bao giờ dừng lại ngay khi hai người gặp nhau. Và nó kết thúc — khi thành công như chúng tôi mong muốn — bằng sự đồng hành và gia đình xứng đáng với sự kiên nhẫn đã bỏ ra để xây dựng. |
| 62 | 261 | `text` | Khi những khách hàng mới hoàn thành hành trình của riêng họ cùng chúng tôi, câu chuyện của họ sẽ được thêm vào cùng hai câu chuyện này — luôn luôn chỉ được chia sẻ khi có sự cho phép của họ. Sự kín đáo luôn được đặt lên hàng đầu. |
| 63 | 270 | `attr:aria-label` | Lời cam kết của Heritage Union |
| 64 | 278 | `text` | "Chúng tôi sẽ đo lường thành công theo cùng cách mà khách hàng của mình vẫn làm — không phải bằng số buổi giới thiệu đã thực hiện, mà bằng những mối quan hệ thực sự bền vững." |
| 65 | 281 | `text` | Lời cam kết của Heritage Union |
| 66 | 292 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 67 | 293 | `text` | Câu chuyện của bạn cũng có thể bắt đầu như vậy. |
| 68 | 294 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 69 | 303 | `text` | Buổi tư vấn ban đầu miễn phí |
| 70 | 304 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 71 | 306 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 72 | 313 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 73 | 319 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 74 | 325 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 75 | 331 | `text` | Không ràng buộc, không áp lực |
| 76 | 336 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 77 | 337 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 78 | 345 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 79 | 366 | `attr:aria-label` | Heritage Union — về trang chủ |
| 80 | 370 | `text` | HERITAGE UNION |
| 81 | 373 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 82 | 376 | `text` | Đặt lịch tư vấn miễn phí |
| 83 | 381 | `text` | Khám Phá |
| 84 | 383 | `text` | Quy Trình |
| 85 | 384 | `text` | Dịch Vụ |
| 86 | 385 | `text` | Thành Công |
| 87 | 386 | `text` | Hỏi Huyền |
| 88 | 387 | `text` | Kiến Thức & Tài Nguyên |
| 89 | 388 | `text` | Biểu Phí |
| 90 | 389 | `text` | Hỏi Đáp |
| 91 | 395 | `text` | Giới Thiệu |
| 92 | 397 | `text` | Gặp Gỡ James |
| 93 | 398 | `text` | Gặp Gỡ Huyền |
| 94 | 399 | `text` | Câu Chuyện Của Chúng Tôi |
| 95 | 400 | `text` | Vì Sao Việt Nam |
| 96 | 406 | `text` | Liên Hệ |
| 97 | 408 | `text` | team@heritage-union.com |
| 98 | 409 | `text` | Trang liên hệ |
| 99 | 410 | `text` | Trở Thành Ứng Viên |
| 100 | 419 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/insights.html`: 109 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Kiến Thức & Tài Nguyên — Heritage Union |
| 2 | 11 | `meta:description` | Những bài viết chu đáo về hẹn hò hiện đại, các mối quan hệ, gia đình, các mối quan hệ đa văn hóa và cuộc sống tại Việt Nam — từ Heritage Union. |
| 3 | 12 | `meta:keywords` | lời khuyên quan hệ, lời khuyên hẹn hò hiện đại, mối quan hệ nghiêm túc sau 45 tuổi, quan hệ đa văn hóa, cuộc sống tại Việt Nam, giá trị gia đình Việt Nam |
| 4 | 25 | `meta:og:title` | Kiến Thức & Tài Nguyên — Heritage Union |
| 5 | 26 | `meta:og:description` | Những bài viết chu đáo về hẹn hò hiện đại, các mối quan hệ, gia đình, các mối quan hệ đa văn hóa và cuộc sống tại Việt Nam. |
| 6 | 36 | `meta:twitter:title` | Kiến Thức & Tài Nguyên — Heritage Union |
| 7 | 37 | `meta:twitter:description` | Những bài viết chu đáo về hẹn hò hiện đại, các mối quan hệ, gia đình, các mối quan hệ đa văn hóa và cuộc sống tại Việt Nam. |
| 8 | 61 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 9 | 75 | `attr:aria-label` | Heritage Union — về trang chủ |
| 10 | 82 | `text` | HERITAGE UNION |
| 11 | 93 | `text` | Quy Trình |
| 12 | 94 | `text` | Dịch Vụ |
| 13 | 95 | `text` | Thành Công |
| 14 | 97 | `text` | Tài Nguyên |
| 15 | 102 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 16 | 108 | `text` | Giới Thiệu |
| 17 | 113 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 18 | 119 | `text` | Hỏi Đáp |
| 19 | 120 | `text` | Liên Hệ |
| 20 | 124 | `attr:aria-label` | Ngôn ngữ |
| 21 | 125 | `text` | EN \| VI |
| 22 | 129 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 23 | 131 | `attr:aria-label` | Mở menu điều hướng |
| 24 | 145 | `attr:aria-label` | Điều hướng trên di động |
| 25 | 147 | `attr:aria-label` | Ngôn ngữ |
| 26 | 148 | `text` | EN \| VI |
| 27 | 152 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 28 | 174 | `attr:aria-label` | Kiến Thức & Tài Nguyên — mở đầu |
| 29 | 176 | `text` | KIẾN THỨC & TÀI NGUYÊN |
| 30 | 177 | `text` | Những bài viết chu đáo, dành cho độc giả nghiêm túc. |
| 31 | 178 | `text` | Về hẹn hò hiện đại, các mối quan hệ, gia đình, các mối quan hệ đa văn hóa và xây dựng cuộc sống tại Việt Nam — từ những người đồng hành cùng khách hàng của Heritage Union mỗi ngày. |
| 32 | 182 | `text` | Đặt lịch tư vấn miễn phí Hỏi Huyền |
| 33 | 186 | `attr:aria-label` | Một cặp đôi cùng dạo bước trên bãi biển lúc hoàng hôn |
| 34 | 195 | `text` | Trong Số Này |
| 35 | 196 | `text` | Sáu bài viết, một góc nhìn chu đáo. |
| 36 | 199 | `text` | Vì Sao Các Ứng Dụng Hẹn Hò Hiện Đại Không Phù Hợp Với Người Đàn Ông Nghiêm Túc |
| 37 | 200 | `text` | Một Mối Quan Hệ Nghiêm Túc Sau Tuổi 45 Thực Sự Cần Những Gì |
| 38 | 201 | `text` | Gia Đình Trên Hết: Thấu Hiểu Giá Trị Gia Đình Việt Nam |
| 39 | 202 | `text` | Quan Hệ Đa Văn Hóa: Điều Không Ai Nói Với Bạn |
| 40 | 203 | `text` | Xây Dựng Cuộc Sống Tại Việt Nam: Những Điều Cần Chuẩn Bị |
| 41 | 204 | `text` | Lời Khuyên Quan Hệ Cho Đàn Ông Bắt Đầu Lại Sau Tuổi 50 |
| 42 | 212 | `attr:aria-label` | Bài viết |
| 43 | 216 | `text` | Hẹn Hò Hiện Đại |
| 44 | 217 | `text` | Vì Sao Các Ứng Dụng Hẹn Hò Hiện Đại Không Phù Hợp Với Người Đàn Ông Nghiêm Túc |
| 45 | 218 | `text` | Các ứng dụng hẹn hò được xây dựng để tối đa hóa mức độ tương tác, không phải kết quả. Bạn càng dành nhiều thời gian lướt xem, sản phẩm càng hoạt động tốt hơn — nghĩa là động lực của nền tảng và động lực của một người đàn ông đang tìm kiếm một mối quan hệ nghiêm túc âm thầm đối lập với nhau. |
| 46 | 219 | `text` | Đối với một người hai mươi lăm tuổi đang khám phá hẹn hò thông thường, sự đánh đổi đó có thể ổn. Nhưng với một người đàn ông ở tuổi năm mươi, người đã xây dựng sự nghiệp, nuôi dạy con cái, và biết rõ mình muốn gì, điều đó hiếm khi ổn. Số lượng lựa chọn tạo ra ảo giác về sự phong phú trong khi khiến việc đánh giá nghiêm túc một người trở nên khó khăn hơn. Các cuộc trò chuyện vẫn hời hợt vì luôn có một hồ sơ khác chỉ cách một cú vuốt. |
| 47 | 220 | `text` | Điều chúng tôi thường nghe nhất từ khách hàng mới không phải là các ứng dụng không giới thiệu được ai cho họ — mà là chính quy trình đó khiến họ trở nên hoài nghi hơn, chứ không phải ít đi. Những cuộc trò chuyện vô tận chẳng dẫn đến đâu. Hồ sơ không phản ánh đúng thực tế. Ý định không bao giờ rõ ràng ngay từ đầu. Một công ty tư vấn tồn tại chính là để loại bỏ sự vướng mắc đó: ít buổi giới thiệu hơn, nhưng mỗi buổi đều được cân nhắc kỹ lưỡng trước khi diễn ra. |
| 48 | 224 | `text` | Các Mối Quan Hệ |
| 49 | 225 | `text` | Một Mối Quan Hệ Nghiêm Túc Sau Tuổi 45 Thực Sự Cần Những Gì |
| 50 | 226 | `text` | Xây dựng cuộc sống cùng ai đó ở tuổi hai mươi và làm điều đó sau tuổi bốn mươi lăm không phải là cùng một điều, dù sự cam kết có trông giống nhau đến đâu trên bề mặt. Ở giai đoạn này, hầu hết mọi người đều đã có một cuộc sống ổn định — sự nghiệp, một mái nhà, đôi khi có con từ mối quan hệ trước, và một nhận thức rõ ràng hơn về điều họ sẽ và sẽ không thỏa hiệp. |
| 51 | 227 | `text` | Sự rõ ràng đó là một lợi thế, nhưng nó thay đổi những gì mối quan hệ cần để thành công. Sự phù hợp về thói quen hằng ngày và ý định lâu dài quan trọng hơn chỉ riêng sự rung động lãng mạn. Cũng vậy là sự sẵn lòng cùng nhau xây dựng điều gì đó mới, thay vì chỉ đơn giản gộp hai cuộc sống đã hoàn chỉnh lại với nhau. Những cặp đôi mà chúng tôi thấy xây dựng được nền tảng vững chắc nhất là những người thảo luận về kỳ vọng một cách chân thành và sớm — về gia đình, về tài chính, về nơi họ sẽ thực sự sinh sống — thay vì cho rằng những điều đó sẽ tự giải quyết sau này. |
| 52 | 228 | `text` | Đây chính xác là lý do vì sao chúng tôi dành nhiều thời gian cho hồ sơ quan hệ của khách hàng trước khi bất kỳ cuộc tìm kiếm nào bắt đầu. Một mối quan hệ nghiêm túc thứ hai (hoặc đầu tiên) muộn hơn trong đời thành công khi cả hai người đều biết rõ ràng họ đang xây dựng điều gì và vì sao. |
| 53 | 232 | `text` | Gia Đình & Việt Nam |
| 54 | 233 | `text` | Gia Đình Trên Hết: Thấu Hiểu Giá Trị Gia Đình Việt Nam |
| 55 | 234 | `text` | Ở phần lớn phương Tây, một mối quan hệ lãng mạn thường được xem là quyết định giữa hai cá nhân. Ở Việt Nam, gia đình hiếm khi tách biệt khỏi quyết định đó — cha mẹ, anh chị em và cả họ hàng mở rộng vẫn là một phần của bức tranh rất lâu sau khi một cặp đôi đã cùng nhau xây dựng cuộc sống. |
| 56 | 235 | `text` | Đây không phải là một ràng buộc cần vượt qua; đó là một trong những phẩm chất thu hút nhiều khách hàng của chúng tôi đến với một người bạn đời Việt Nam ngay từ đầu. Lòng chung thủy, sự tôn trọng người lớn tuổi, và cảm giác trách nhiệm với gia đình là những giá trị sống thực, không phải điều trừu tượng. Một người bạn đời hiểu điều này — người xem việc hỗ trợ cha mẹ cô ấy là trách nhiệm chung thay vì một ưu tiên cạnh tranh — thường xây dựng được một mối quan hệ ổn định hơn nhiều so với người âm thầm khó chịu với điều đó. |
| 57 | 236 | `text` | Sự hướng dẫn văn hóa của Huyền tồn tại chính vì lý do này: giúp khách hàng hiểu "gia đình trên hết" thực sự trông như thế nào trong đời sống hằng ngày, rất lâu trước khi nó trở thành điểm mâu thuẫn. |
| 58 | 240 | `text` | Quan Hệ Đa Văn Hóa |
| 59 | 241 | `text` | Quan Hệ Đa Văn Hóa: Điều Không Ai Nói Với Bạn |
| 60 | 242 | `text` | Hầu hết lời khuyên về các mối quan hệ đa văn hóa tập trung vào những khác biệt rõ ràng — ngôn ngữ, ẩm thực, lễ hội. Những khác biệt thực sự gây căng thẳng cho một mối quan hệ thường lặng lẽ hơn: những giả định khác nhau về cách xử lý xung đột, cách thể hiện tình cảm, cách đưa ra quyết định, và mức độ nói thẳng so với để người kia tự hiểu. |
| 61 | 243 | `text` | Không điều nào trong số này có nghĩa là một mối quan hệ đa văn hóa khó duy trì hơn — nhiều mối quan hệ bền vững, kiên cường nhất mà chúng tôi từng thấy chính là loại quan hệ này. Nó có nghĩa là sự phỏng đoán ban đầu cần được thay thế bằng những cuộc trò chuyện thực sự, và lý tưởng nhất là sự hướng dẫn từ một người đã từng thấy khuôn mẫu này trước đây. Đó chính là toàn bộ tiền đề của việc hướng dẫn văn hóa tại Heritage Union: không phải dịch từ ngữ, mà là dịch kỳ vọng. |
| 62 | 247 | `text` | Việt Nam |
| 63 | 248 | `text` | Xây Dựng Cuộc Sống Tại Việt Nam: Những Điều Cần Chuẩn Bị |
| 64 | 249 | `text` | Dù một mối quan hệ cuối cùng có nghĩa là chuyển đến sống hẳn, dành một phần trong năm tại Việt Nam, hay đơn giản chỉ là thăm thường xuyên, bản thân đất nước này thường khiến mọi người bất ngờ. Những thành phố như Đà Nẵng và Hội An mang lại chất lượng sống thực sự cao — cơ sở hạ tầng hiện đại, chi phí sinh hoạt thấp hơn, khí hậu ấm áp, và một nền văn hóa chào đón những người ngoại quốc thể hiện sự tôn trọng thực sự với nó. |
| 65 | 250 | `text` | Trải nghiệm của chính James, chuyển đến Việt Nam sau khi ly hôn với không nhiều hơn sự tò mò, không phải điều bất thường đối với những khách hàng cuối cùng dành thời gian ý nghĩa ở đó. Điều khiến hầu hết người mới đến bất ngờ không phải là những khác biệt — mà là việc cảm giác cộng đồng hình thành nhanh đến thế nào, và sự lịch thiệp cùng tôn trọng hằng ngày mang trọng lượng lớn đến mức nào trong đời sống địa phương. |
| 66 | 251 | `text` | Chúng tôi giúp khách hàng chuẩn bị thực tế cho một chuyến thăm hoặc một thời gian lưu trú dài hơn — nhưng sự chuẩn bị quan trọng hơn thường là hướng dẫn văn hóa đến trước đó. |
| 67 | 255 | `text` | Lời Khuyên Quan Hệ |
| 68 | 256 | `text` | Lời Khuyên Quan Hệ Cho Đàn Ông Bắt Đầu Lại Sau Tuổi 50 |
| 69 | 257 | `text` | Bắt đầu lại sau tuổi năm mươi — sau một cuộc ly hôn, sau khi mất người bạn đời, hay đơn giản chỉ là sau nhiều năm sống độc thân — đi kèm với một loại áp lực đặc biệt. Thường có một sự thôi thúc thầm lặng để "làm đúng lần này," cùng với sự bất định thực sự về cách hẹn hò còn hoạt động như thế nào nữa. |
| 70 | 258 | `text` | Lời khuyên chúng tôi thường đưa ra cho khách hàng không phải là về chiến thuật. Đó là về việc trung thực, sớm, về điều bạn thực sự mong muốn. Những người đàn ông rõ ràng — với chính mình và với người bạn đời tiềm năng — về việc mong muốn một mối quan hệ gắn bó, sự đồng hành hay gia đình thường có những cuộc trò chuyện hiệu quả hơn nhiều so với những người để ý định mơ hồ nhằm tránh có vẻ quá nghiêm túc quá sớm. |
| 71 | 259 | `text` | Lời khuyên thứ hai là sự kiên nhẫn với chính quy trình. Những mối quan hệ bền vững hiếm khi là những mối quan hệ nhanh nhất. Một buổi giới thiệu chu đáo, theo sau bởi những cuộc trò chuyện thực sự, và cuối cùng, thời gian ở bên nhau trực tiếp, sẽ luôn vượt trội hơn số lượng. |
| 72 | 268 | `attr:aria-label` | Lời cam kết của Heritage Union |
| 73 | 276 | `text` | "Chúng tôi viết những gì chúng tôi thực sự học được khi đồng hành cùng khách hàng — không bao giờ là điều gì đó hào nhoáng, chỉ là những gì chân thực." |
| 74 | 279 | `text` | Huyền & James |
| 75 | 290 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 76 | 291 | `text` | Sẵn sàng trao đổi trực tiếp? |
| 77 | 292 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 78 | 301 | `text` | Buổi tư vấn ban đầu miễn phí |
| 79 | 302 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 80 | 304 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 81 | 311 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 82 | 317 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 83 | 323 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 84 | 329 | `text` | Không ràng buộc, không áp lực |
| 85 | 334 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 86 | 335 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 87 | 343 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 88 | 364 | `attr:aria-label` | Heritage Union — về trang chủ |
| 89 | 368 | `text` | HERITAGE UNION |
| 90 | 371 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 91 | 374 | `text` | Đặt lịch tư vấn miễn phí |
| 92 | 379 | `text` | Khám Phá |
| 93 | 381 | `text` | Quy Trình |
| 94 | 382 | `text` | Dịch Vụ |
| 95 | 383 | `text` | Thành Công |
| 96 | 384 | `text` | Hỏi Huyền |
| 97 | 385 | `text` | Kiến Thức & Tài Nguyên |
| 98 | 386 | `text` | Biểu Phí |
| 99 | 387 | `text` | Hỏi Đáp |
| 100 | 393 | `text` | Giới Thiệu |
| 101 | 395 | `text` | Gặp Gỡ James |
| 102 | 396 | `text` | Gặp Gỡ Huyền |
| 103 | 397 | `text` | Câu Chuyện Của Chúng Tôi |
| 104 | 398 | `text` | Vì Sao Việt Nam |
| 105 | 404 | `text` | Liên Hệ |
| 106 | 406 | `text` | team@heritage-union.com |
| 107 | 407 | `text` | Trang liên hệ |
| 108 | 408 | `text` | Trở Thành Ứng Viên |
| 109 | 417 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/ask-huyen.html`: 101 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Hỏi Huyền — Kiến Thức Văn Hóa Về Việt Nam & Gia Đình |
| 2 | 11 | `meta:description` | Hỏi Huyền: những câu hỏi thực tế về văn hóa Việt Nam, gia đình và các mối quan hệ đa văn hóa, được trả lời trung thực bởi chuyên gia văn hóa độc lập của Heritage Union. |
| 3 | 12 | `meta:keywords` | Hỏi Huyền, câu hỏi văn hóa Việt Nam, phong tục hẹn hò Việt Nam, lời khuyên quan hệ đa văn hóa, hẹn hò với phụ nữ Việt Nam, giá trị gia đình Việt Nam |
| 4 | 25 | `meta:og:title` | Hỏi Huyền — Kiến Thức Văn Hóa Về Việt Nam & Gia Đình |
| 5 | 26 | `meta:og:description` | Những câu hỏi thực tế về văn hóa Việt Nam, gia đình và các mối quan hệ đa văn hóa, được trả lời trung thực bởi Huyền. |
| 6 | 36 | `meta:twitter:title` | Hỏi Huyền — Kiến Thức Văn Hóa Về Việt Nam & Gia Đình |
| 7 | 37 | `meta:twitter:description` | Những câu hỏi thực tế về văn hóa Việt Nam, gia đình và các mối quan hệ đa văn hóa. |
| 8 | 43 | `jsonld.mainEntity[0].name` | Sự chấp thuận của gia đình có thực sự quan trọng đến vậy ở Việt Nam không? |
| 9 | 43 | `jsonld.mainEntity[0].acceptedAnswer.text` | Có, quan trọng hơn nhiều so với những gì hầu hết đàn ông phương Tây mong đợi. Một mối quan hệ ở đây không chỉ là giữa hai người — nó có sự tham gia của gia đình ngay từ đầu. Đó không hẳn là xin phép, mà là sự tôn trọng. Một người đàn ông dành thời gian để được gia đình cô ấy biết đến, dù chỉ từ xa, sẽ được đánh giá nghiêm túc hơn nhiều. |
| 10 | 43 | `jsonld.mainEntity[1].name` | Hiểu lầm lớn nhất mà đàn ông phương Tây có về phụ nữ Việt Nam là gì? |
| 11 | 43 | `jsonld.mainEntity[1].acceptedAnswer.text` | Rằng coi trọng gia đình và truyền thống nghĩa là thụ động. Nhiều phụ nữ tôi làm việc cùng tự điều hành công việc kinh doanh của riêng mình, hỗ trợ tài chính cho cha mẹ, và đưa ra quyết định hoàn toàn độc lập. Coi trọng gia đình và có ý chí mạnh mẽ không phải là hai điều đối lập ở đây. |
| 12 | 43 | `jsonld.mainEntity[2].name` | Văn hóa hẹn hò có khác nhau giữa miền Bắc và miền Nam Việt Nam không? |
| 13 | 43 | `jsonld.mainEntity[2].acceptedAnswer.text` | Có sự khác biệt thực sự về nhịp độ và sự trang trọng. Miền Bắc thường kín đáo và truyền thống hơn trong việc tìm hiểu, miền Nam thoải mái và cởi mở hơn. Không nơi nào nghiêm túc hơn về một mối quan hệ gắn bó — những giá trị cốt lõi đều giống nhau, dù phong cách có khác. |
| 14 | 43 | `jsonld.mainEntity[3].name` | Tôi nên chuẩn bị gì khi gặp gia đình cô ấy lần đầu tiên? |
| 15 | 43 | `jsonld.mainEntity[3].acceptedAnswer.text` | Sự trang trọng đi cùng sự ấm áp. Mang theo một món quà nhỏ, ăn mặc kín đáo, và chuẩn bị được hỏi những câu hỏi trực tiếp về ý định của bạn — đó là dấu hiệu của sự tôn trọng, không phải nghi ngờ. Thể hiện sự quan tâm chân thành đến cha mẹ cô ấy quan trọng hơn bất cứ điều gì bạn nói về bản thân. |
| 16 | 43 | `jsonld.mainEntity[4].name` | Việc một phụ nữ Việt Nam hỗ trợ tài chính cho cha mẹ có bình thường không? |
| 17 | 43 | `jsonld.mainEntity[4].acceptedAnswer.text` | Rất phổ biến, và không phải điều gì đáng lo ngại. Hỗ trợ cha mẹ được xem là bổn phận và niềm tự hào, không phải gánh nặng đặt lên một mối quan hệ. Một người bạn đời hiểu và tôn trọng điều này, thay vì cảm thấy khó chịu, thường xây dựng được một mối quan hệ vững chắc hơn nhiều. |
| 18 | 78 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 19 | 92 | `attr:aria-label` | Heritage Union — về trang chủ |
| 20 | 99 | `text` | HERITAGE UNION |
| 21 | 110 | `text` | Quy Trình |
| 22 | 111 | `text` | Dịch Vụ |
| 23 | 112 | `text` | Thành Công |
| 24 | 114 | `text` | Tài Nguyên |
| 25 | 119 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 26 | 125 | `text` | Giới Thiệu |
| 27 | 130 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 28 | 136 | `text` | Hỏi Đáp |
| 29 | 137 | `text` | Liên Hệ |
| 30 | 141 | `attr:aria-label` | Ngôn ngữ |
| 31 | 142 | `text` | EN \| VI |
| 32 | 146 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 33 | 148 | `attr:aria-label` | Mở menu điều hướng |
| 34 | 162 | `attr:aria-label` | Điều hướng trên di động |
| 35 | 164 | `attr:aria-label` | Ngôn ngữ |
| 36 | 165 | `text` | EN \| VI |
| 37 | 169 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 38 | 191 | `attr:aria-label` | Hỏi Huyền — mở đầu |
| 39 | 193 | `text` | HỎI HUYỀN · KIẾN THỨC VĂN HÓA |
| 40 | 194 | `text` | Câu hỏi thật, được trả lời trung thực. |
| 41 | 195 | `text` | Một chuỗi nội dung ngày càng phong phú, nơi Huyền trả lời những câu hỏi mà khách hàng thực sự đặt ra — về văn hóa Việt Nam, gia đình và ý nghĩa thực sự của một mối quan hệ đa văn hóa. |
| 42 | 199 | `text` | Đặt lịch tư vấn miễn phí Gặp gỡ Huyền |
| 43 | 203 | `attr:aria-label` | Một cặp đôi cùng nấu ăn tại nhà |
| 44 | 211 | `text` | Về Chuỗi Nội Dung Này |
| 45 | 212 | `text` | Một chuỗi video sắp ra mắt — trong lúc này, đây là những câu hỏi khách hàng thường hỏi Huyền nhất, được trả lời bằng văn bản. |
| 46 | 215 | `text` | Hỏi Huyền tồn tại vì phần lớn những gì quyết định một mối quan hệ đa văn hóa thành công hay khó khăn không liên quan đến sự thu hút — mà nằm ở sự thấu hiểu. Dưới đây là những câu hỏi thực tế mà khách hàng đã đặt ra, được nhóm theo chủ đề, trả lời trực tiếp bởi Huyền. |
| 47 | 227 | `text` | Hỏi Huyền |
| 48 | 228 | `text` | Câu hỏi của tuần này. |
| 49 | 231 | `text` | Đời Sống Gia Đình |
| 50 | 235 | `text` | Sự chấp thuận của gia đình có thực sự quan trọng đến vậy ở Việt Nam không? |
| 51 | 239 | `text` | Có, quan trọng hơn nhiều so với những gì hầu hết đàn ông phương Tây mong đợi. Một mối quan hệ ở đây không chỉ là giữa hai người — nó có sự tham gia của gia đình ngay từ đầu. Đó không hẳn là xin phép, mà là sự tôn trọng. Một người đàn ông dành thời gian để được gia đình cô ấy biết đến, dù chỉ từ xa, sẽ được đánh giá nghiêm túc hơn nhiều. |
| 52 | 243 | `text` | Việc một phụ nữ Việt Nam hỗ trợ tài chính cho cha mẹ có bình thường không? |
| 53 | 247 | `text` | Rất phổ biến, và không phải điều gì đáng lo ngại. Hỗ trợ cha mẹ được xem là bổn phận và niềm tự hào, không phải gánh nặng đặt lên một mối quan hệ. Một người bạn đời hiểu và tôn trọng điều này, thay vì cảm thấy khó chịu, thường xây dựng được một mối quan hệ vững chắc hơn nhiều. |
| 54 | 251 | `text` | Gặp Gỡ Gia Đình |
| 55 | 255 | `text` | Tôi nên chuẩn bị gì khi gặp gia đình cô ấy lần đầu tiên? |
| 56 | 259 | `text` | Sự trang trọng đi cùng sự ấm áp. Mang theo một món quà nhỏ, ăn mặc kín đáo, và chuẩn bị được hỏi những câu hỏi trực tiếp về ý định của bạn — đó là dấu hiệu của sự tôn trọng, không phải nghi ngờ. Thể hiện sự quan tâm chân thành đến cha mẹ cô ấy quan trọng hơn bất cứ điều gì bạn nói về bản thân. |
| 57 | 263 | `text` | Văn Hóa & Khác Biệt Vùng Miền |
| 58 | 267 | `text` | Văn hóa hẹn hò có khác nhau giữa miền Bắc và miền Nam Việt Nam không? |
| 59 | 271 | `text` | Có sự khác biệt thực sự về nhịp độ và sự trang trọng. Miền Bắc thường kín đáo và truyền thống hơn trong việc tìm hiểu, miền Nam thoải mái và cởi mở hơn. Không nơi nào nghiêm túc hơn về một mối quan hệ gắn bó — những giá trị cốt lõi đều giống nhau, dù phong cách có khác. |
| 60 | 275 | `text` | Thấu Hiểu Phụ Nữ Việt Nam |
| 61 | 279 | `text` | Hiểu lầm lớn nhất mà đàn ông phương Tây có về phụ nữ Việt Nam là gì? |
| 62 | 283 | `text` | Rằng coi trọng gia đình và truyền thống nghĩa là thụ động. Nhiều phụ nữ tôi làm việc cùng tự điều hành công việc kinh doanh của riêng mình, hỗ trợ tài chính cho cha mẹ, và đưa ra quyết định hoàn toàn độc lập. Coi trọng gia đình và có ý chí mạnh mẽ không phải là hai điều đối lập ở đây. |
| 63 | 288 | `text` | Bạn có câu hỏi riêng? Hãy hỏi trực tiếp chúng tôi |
| 64 | 296 | `attr:aria-label` | Lời chia sẻ từ Huyền |
| 65 | 304 | `text` | "Hầu hết những hiểu lầm trong một mối quan hệ đa văn hóa không hề liên quan đến văn hóa. Chúng liên quan đến việc không ai giải thích rõ ràng. Đó là lý do tôi ở đây." |
| 66 | 307 | `text` | Huyền, Chuyên Gia Văn Hóa Độc Lập & Cầu Nối |
| 67 | 318 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 68 | 319 | `text` | Hỏi trực tiếp những câu hỏi của riêng bạn. |
| 69 | 320 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 70 | 329 | `text` | Buổi tư vấn ban đầu miễn phí |
| 71 | 330 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 72 | 332 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 73 | 339 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 74 | 345 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 75 | 351 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 76 | 357 | `text` | Không ràng buộc, không áp lực |
| 77 | 362 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 78 | 363 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 79 | 371 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 80 | 392 | `attr:aria-label` | Heritage Union — về trang chủ |
| 81 | 396 | `text` | HERITAGE UNION |
| 82 | 399 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 83 | 402 | `text` | Đặt lịch tư vấn miễn phí |
| 84 | 407 | `text` | Khám Phá |
| 85 | 409 | `text` | Quy Trình |
| 86 | 410 | `text` | Dịch Vụ |
| 87 | 411 | `text` | Thành Công |
| 88 | 412 | `text` | Hỏi Huyền |
| 89 | 413 | `text` | Kiến Thức & Tài Nguyên |
| 90 | 414 | `text` | Biểu Phí |
| 91 | 415 | `text` | Hỏi Đáp |
| 92 | 421 | `text` | Giới Thiệu |
| 93 | 423 | `text` | Gặp Gỡ James |
| 94 | 424 | `text` | Gặp Gỡ Huyền |
| 95 | 425 | `text` | Câu Chuyện Của Chúng Tôi |
| 96 | 426 | `text` | Vì Sao Việt Nam |
| 97 | 432 | `text` | Liên Hệ |
| 98 | 434 | `text` | team@heritage-union.com |
| 99 | 435 | `text` | Trang liên hệ |
| 100 | 436 | `text` | Trở Thành Ứng Viên |
| 101 | 445 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/faq.html`: 126 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Câu Hỏi Thường Gặp — Heritage Union |
| 2 | 11 | `meta:description` | Giải đáp những câu hỏi mà khách hàng nghiêm túc thường đặt ra trước khi đăng ký với Heritage Union — về quy trình, kết nối ứng viên, văn hóa Việt Nam, sự riêng tư và niềm tin. |
| 3 | 12 | `meta:keywords` | câu hỏi thường gặp Heritage Union, câu hỏi tư vấn quan hệ quốc tế, câu hỏi mai mối Việt Nam, câu hỏi quan hệ đa văn hóa |
| 4 | 25 | `meta:og:title` | Câu Hỏi Thường Gặp — Heritage Union |
| 5 | 26 | `meta:og:description` | Giải đáp những câu hỏi mà khách hàng nghiêm túc thường đặt ra trước khi đăng ký với Heritage Union. |
| 6 | 36 | `meta:twitter:title` | Câu Hỏi Thường Gặp — Heritage Union |
| 7 | 37 | `meta:twitter:description` | Giải đáp những câu hỏi mà khách hàng nghiêm túc thường đặt ra trước khi đăng ký với Heritage Union. |
| 8 | 43 | `jsonld.mainEntity[0].name` | Buổi tư vấn đầu tiên có thực sự miễn phí không? |
| 9 | 43 | `jsonld.mainEntity[0].acceptedAnswer.text` | Có. Buổi tư vấn ban đầu là một cuộc trò chuyện miễn phí, không ràng buộc — ba mươi phút riêng tư để tìm hiểu mong muốn của bạn và giải đáp mọi thắc mắc. Không có bất kỳ áp lực nào để tiếp tục. |
| 10 | 43 | `jsonld.mainEntity[1].name` | Điều này khác gì so với ứng dụng hẹn hò hay một trung tâm môi giới? |
| 11 | 43 | `jsonld.mainEntity[1].acceptedAnswer.text` | Chúng tôi là một công ty tư vấn, không phải một nền tảng. Không có cơ sở dữ liệu để duyệt xem và không có danh mục hồ sơ. Chúng tôi tư vấn, hướng dẫn và giới thiệu — một cách cẩn trọng và kín đáo — hướng tới những kết quả lâu dài thực sự. |
| 12 | 43 | `jsonld.mainEntity[2].name` | Heritage Union nhận những khách hàng nào? |
| 13 | 43 | `jsonld.mainEntity[2].acceptedAnswer.text` | Chúng tôi làm việc với những người đàn ông nghiêm túc, có nền tảng tài chính vững vàng, đang tìm kiếm sự đồng hành và gia đình. Khách hàng được tiếp nhận qua đơn đăng ký, giúp bảo vệ sự nghiêm túc của quy trình cho tất cả mọi người liên quan. |
| 14 | 43 | `jsonld.mainEntity[3].name` | Điều gì xảy ra sau buổi tư vấn đầu tiên? |
| 15 | 43 | `jsonld.mainEntity[3].acceptedAnswer.text` | Nếu chúng tôi đồng ý hợp tác, chúng tôi sẽ xây dựng hồ sơ quan hệ của bạn, đối chiếu hồ sơ đó với những phụ nữ đã tự đăng ký với Heritage Union, và đồng hành cùng bạn qua quá trình kết nối, giới thiệu và mọi bước tiếp theo. |
| 16 | 43 | `jsonld.mainEntity[4].name` | Quy trình thường mất bao lâu? |
| 17 | 43 | `jsonld.mainEntity[4].acceptedAnswer.text` | Mỗi khách hàng có một khung thời gian khác nhau. Chúng tôi thà dành thời gian để tìm đúng ứng viên còn hơn vội vàng thực hiện một buổi giới thiệu không thực sự phù hợp. |
| 18 | 43 | `jsonld.mainEntity[5].name` | Tôi có gặp ứng viên trực tiếp không? |
| 19 | 43 | `jsonld.mainEntity[5].acceptedAnswer.text` | Có. Các mối quan hệ phát triển qua những cuộc trò chuyện được hướng dẫn trước, và một chuyến thăm Việt Nam sẽ được sắp xếp khi cả hai sẵn sàng gặp gỡ trực tiếp. |
| 20 | 43 | `jsonld.mainEntity[6].name` | Các ứng viên được kết nối như thế nào? |
| 21 | 43 | `jsonld.mainEntity[6].acceptedAnswer.text` | Chúng tôi tìm kiếm trong số những phụ nữ đã tự nguyện đăng ký với Heritage Union, đối chiếu với hồ sơ quan hệ của bạn. Bạn chọn người mình muốn được giới thiệu, và cô ấy chọn có đồng ý hay không. |
| 22 | 43 | `jsonld.mainEntity[7].name` | Những phụ nữ mà Heritage Union làm việc cùng là ai? |
| 23 | 43 | `jsonld.mainEntity[7].acceptedAnswer.text` | Phụ nữ Việt Nam đã tự nguyện đăng ký và xác minh thông tin liên hệ với Heritage Union — không bao giờ được lấy từ một cơ sở dữ liệu hay danh bạ công khai. |
| 24 | 43 | `jsonld.mainEntity[8].name` | Vì sao Heritage Union tập trung vào Việt Nam? |
| 25 | 43 | `jsonld.mainEntity[8].acceptedAnswer.text` | Kinh nghiệm cá nhân của người sáng lập, cùng với sự am hiểu văn hóa thực tế của Huyền, đều bắt nguồn từ Việt Nam, điều này cho phép chúng tôi mang lại chiều sâu về am hiểu văn hóa mà chúng tôi không thể đảm bảo trách nhiệm ở nơi khác. |
| 26 | 43 | `jsonld.mainEntity[9].name` | Thông tin của tôi có được bảo mật không? |
| 27 | 43 | `jsonld.mainEntity[9].acceptedAnswer.text` | Hoàn toàn được bảo mật. Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên. |
| 28 | 83 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 29 | 97 | `attr:aria-label` | Heritage Union — về trang chủ |
| 30 | 104 | `text` | HERITAGE UNION |
| 31 | 115 | `text` | Quy Trình |
| 32 | 116 | `text` | Dịch Vụ |
| 33 | 117 | `text` | Thành Công |
| 34 | 119 | `text` | Tài Nguyên |
| 35 | 124 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 36 | 130 | `text` | Giới Thiệu |
| 37 | 135 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 38 | 141 | `text` | Hỏi Đáp |
| 39 | 142 | `text` | Liên Hệ |
| 40 | 146 | `attr:aria-label` | Ngôn ngữ |
| 41 | 147 | `text` | EN \| VI |
| 42 | 151 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 43 | 153 | `attr:aria-label` | Mở menu điều hướng |
| 44 | 167 | `attr:aria-label` | Điều hướng trên di động |
| 45 | 169 | `attr:aria-label` | Ngôn ngữ |
| 46 | 170 | `text` | EN \| VI |
| 47 | 174 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 48 | 196 | `attr:aria-label` | Câu Hỏi Thường Gặp — mở đầu |
| 49 | 198 | `text` | CÂU HỎI, ĐÃ ĐƯỢC GIẢI ĐÁP |
| 50 | 199 | `text` | Trước khi bạn đăng ký. |
| 51 | 200 | `text` | Mỗi câu hỏi nghiêm túc đều xứng đáng có một câu trả lời thẳng thắn. Đây là những gì các khách hàng tiềm năng hỏi chúng tôi nhiều nhất, được nhóm theo chủ đề. |
| 52 | 204 | `text` | Đặt lịch tư vấn miễn phí Hỏi trực tiếp chúng tôi |
| 53 | 208 | `attr:aria-label` | Một cặp đôi cùng ăn sáng tại nhà |
| 54 | 217 | `text` | Câu Hỏi Thường Gặp |
| 55 | 218 | `text` | Mọi điều bạn đang định hỏi. |
| 56 | 221 | `text` | Bắt Đầu |
| 57 | 225 | `text` | Buổi tư vấn đầu tiên có thực sự miễn phí không? |
| 58 | 229 | `text` | Có. Buổi tư vấn ban đầu là một cuộc trò chuyện miễn phí, không ràng buộc — ba mươi phút riêng tư để tìm hiểu mong muốn của bạn và giải đáp mọi thắc mắc. Không có bất kỳ áp lực nào để tiếp tục. |
| 59 | 233 | `text` | Điều này khác gì so với ứng dụng hẹn hò hay một trung tâm môi giới? |
| 60 | 237 | `text` | Chúng tôi là một công ty tư vấn, không phải một nền tảng. Không có cơ sở dữ liệu để duyệt xem và không có danh mục hồ sơ. Chúng tôi tư vấn, hướng dẫn và giới thiệu — một cách cẩn trọng và kín đáo — hướng tới những kết quả lâu dài thực sự. |
| 61 | 241 | `text` | Heritage Union nhận những khách hàng nào? |
| 62 | 245 | `text` | Chúng tôi làm việc với những người đàn ông nghiêm túc, có nền tảng tài chính vững vàng, đang tìm kiếm sự đồng hành và gia đình. Khách hàng được tiếp nhận qua đơn đăng ký, giúp bảo vệ sự nghiêm túc của quy trình cho tất cả mọi người liên quan. |
| 63 | 249 | `text` | Điều gì xảy ra sau buổi tư vấn đầu tiên? |
| 64 | 253 | `text` | Nếu chúng tôi đồng ý hợp tác, chúng tôi sẽ xây dựng hồ sơ quan hệ của bạn, đối chiếu hồ sơ đó với những phụ nữ đã tự đăng ký với Heritage Union, và đồng hành cùng bạn qua quá trình kết nối, giới thiệu và mọi bước tiếp theo. |
| 65 | 257 | `text` | Quy Trình |
| 66 | 261 | `text` | Quy trình thường mất bao lâu? |
| 67 | 265 | `text` | Mỗi khách hàng có một khung thời gian khác nhau. Chúng tôi thà dành thời gian để tìm đúng ứng viên còn hơn vội vàng thực hiện một buổi giới thiệu không thực sự phù hợp. |
| 68 | 269 | `text` | Tôi sẽ nhận được bao nhiêu buổi giới thiệu? |
| 69 | 273 | `text` | Chúng tôi sắp xếp một số ít buổi giới thiệu thay vì số lượng lớn, và mỗi buổi chỉ diễn ra khi cô ấy đồng ý — chất lượng và sự phù hợp chân thành quan trọng với chúng tôi hơn số lượng. |
| 70 | 277 | `text` | Tôi có gặp ứng viên trực tiếp không? |
| 71 | 281 | `text` | Có. Các mối quan hệ phát triển qua những cuộc trò chuyện được hướng dẫn trước, và một chuyến thăm Việt Nam sẽ được sắp xếp khi cả hai sẵn sàng gặp gỡ trực tiếp. |
| 72 | 285 | `text` | Nếu tôi không được ghép với ai phù hợp thì sao? |
| 73 | 289 | `text` | Chúng tôi thà nói thẳng với bạn còn hơn ép buộc một buổi giới thiệu không phù hợp. Chúng tôi sẽ tiếp tục xem xét các đăng ký mới khi có, tinh chỉnh hồ sơ của bạn, và luôn giữ liên lạc với bạn xuyên suốt. |
| 74 | 293 | `text` | Ứng Viên & Kết Nối |
| 75 | 297 | `text` | Các ứng viên được kết nối như thế nào? |
| 76 | 301 | `text` | Chúng tôi tìm kiếm trong số những phụ nữ đã tự nguyện đăng ký với Heritage Union, đối chiếu với hồ sơ quan hệ của bạn. Bạn chọn người mình muốn được giới thiệu, và cô ấy chọn có đồng ý hay không. |
| 77 | 305 | `text` | Những phụ nữ mà Heritage Union làm việc cùng là ai? |
| 78 | 309 | `text` | Phụ nữ Việt Nam đã tự nguyện đăng ký và xác minh thông tin liên hệ với Heritage Union — không bao giờ được lấy từ một cơ sở dữ liệu hay danh bạ công khai. |
| 79 | 313 | `text` | Tôi có thể trực tiếp trò chuyện với Huyền không? |
| 80 | 317 | `text` | Có. Huyền trực tiếp tham gia xuyên suốt hành trình của bạn, đặc biệt là trong việc hướng dẫn văn hóa, hỗ trợ ngôn ngữ và bất kỳ chuyến thăm nào đến Việt Nam. |
| 81 | 321 | `text` | Văn Hóa & Việt Nam |
| 82 | 325 | `text` | Vì sao Heritage Union tập trung vào Việt Nam? |
| 83 | 329 | `text` | Kinh nghiệm cá nhân của người sáng lập, cùng với sự am hiểu văn hóa thực tế của Huyền, đều bắt nguồn từ Việt Nam, điều này cho phép chúng tôi mang lại chiều sâu về am hiểu văn hóa mà chúng tôi không thể đảm bảo trách nhiệm ở nơi khác. |
| 84 | 333 | `text` | Bạn cung cấp những hướng dẫn văn hóa nào? |
| 85 | 337 | `text` | Từ kỳ vọng gia đình và vai trò của cha mẹ, đến phong cách giao tiếp và tốc độ mà các mối quan hệ thường phát triển — Huyền hướng dẫn cả hai bên vượt qua những phần dễ bị hiểu lầm nhất. |
| 86 | 341 | `text` | Riêng Tư & Niềm Tin |
| 87 | 345 | `text` | Thông tin của tôi có được bảo mật không? |
| 88 | 349 | `text` | Hoàn toàn được bảo mật. Sự kín đáo là yếu tố cốt lõi trong cách chúng tôi làm việc — thông tin của bạn không bao giờ được chia sẻ, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối ngay từ những lời đầu tiên. |
| 89 | 353 | `text` | Heritage Union có nhận khách hàng ngoài Anh, Mỹ và Úc không? |
| 90 | 357 | `text` | Thị trường chính của chúng tôi là Vương Quốc Anh, Hoa Kỳ và Úc. Nếu bạn sống ở nơi khác, hãy liên hệ với chúng tôi — chúng tôi rất sẵn lòng trao đổi xem quy trình có phù hợp hay không. |
| 91 | 362 | `text` | Vẫn còn thắc mắc? Hãy liên hệ với chúng tôi |
| 92 | 374 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 93 | 375 | `text` | Hỏi bất cứ điều gì, một cách trực tiếp. |
| 94 | 376 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 95 | 385 | `text` | Buổi tư vấn ban đầu miễn phí |
| 96 | 386 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 97 | 388 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 98 | 395 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 99 | 401 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 100 | 407 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 101 | 413 | `text` | Không ràng buộc, không áp lực |
| 102 | 418 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 103 | 419 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 104 | 427 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 105 | 448 | `attr:aria-label` | Heritage Union — về trang chủ |
| 106 | 452 | `text` | HERITAGE UNION |
| 107 | 455 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 108 | 458 | `text` | Đặt lịch tư vấn miễn phí |
| 109 | 463 | `text` | Khám Phá |
| 110 | 465 | `text` | Quy Trình |
| 111 | 466 | `text` | Dịch Vụ |
| 112 | 467 | `text` | Thành Công |
| 113 | 468 | `text` | Hỏi Huyền |
| 114 | 469 | `text` | Kiến Thức & Tài Nguyên |
| 115 | 470 | `text` | Biểu Phí |
| 116 | 471 | `text` | Hỏi Đáp |
| 117 | 477 | `text` | Giới Thiệu |
| 118 | 479 | `text` | Gặp Gỡ James |
| 119 | 480 | `text` | Gặp Gỡ Huyền |
| 120 | 481 | `text` | Câu Chuyện Của Chúng Tôi |
| 121 | 482 | `text` | Vì Sao Việt Nam |
| 122 | 488 | `text` | Liên Hệ |
| 123 | 490 | `text` | team@heritage-union.com |
| 124 | 491 | `text` | Trang liên hệ |
| 125 | 492 | `text` | Trở Thành Ứng Viên |
| 126 | 501 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/contact.html`: 83 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Liên Hệ — Heritage Union |
| 2 | 11 | `meta:description` | Liên hệ với Heritage Union. Viết thư trực tiếp cho chúng tôi hoặc đặt lịch một buổi tư vấn miễn phí, bảo mật với người sáng lập — kín đáo ngay từ những lời đầu tiên. |
| 3 | 12 | `meta:keywords` | liên hệ Heritage Union, gửi yêu cầu Heritage Union, liên hệ tư vấn quan hệ Việt Nam |
| 4 | 25 | `meta:og:title` | Liên Hệ — Heritage Union |
| 5 | 26 | `meta:og:description` | Liên hệ với Heritage Union. Viết thư trực tiếp cho chúng tôi hoặc đặt lịch một buổi tư vấn miễn phí, bảo mật với người sáng lập. |
| 6 | 36 | `meta:twitter:title` | Liên Hệ — Heritage Union |
| 7 | 37 | `meta:twitter:description` | Liên hệ với Heritage Union. Viết thư trực tiếp cho chúng tôi hoặc đặt lịch một buổi tư vấn miễn phí, bảo mật với người sáng lập. |
| 8 | 43 | `jsonld.about.name` | Heritage Union |
| 9 | 78 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 10 | 92 | `attr:aria-label` | Heritage Union — về trang chủ |
| 11 | 99 | `text` | HERITAGE UNION |
| 12 | 110 | `text` | Quy Trình |
| 13 | 111 | `text` | Dịch Vụ |
| 14 | 112 | `text` | Thành Công |
| 15 | 114 | `text` | Tài Nguyên |
| 16 | 119 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 17 | 125 | `text` | Giới Thiệu |
| 18 | 130 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 19 | 136 | `text` | Hỏi Đáp |
| 20 | 137 | `text` | Liên Hệ |
| 21 | 141 | `attr:aria-label` | Ngôn ngữ |
| 22 | 142 | `text` | EN \| VI |
| 23 | 146 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 24 | 148 | `attr:aria-label` | Mở menu điều hướng |
| 25 | 162 | `attr:aria-label` | Điều hướng trên di động |
| 26 | 164 | `attr:aria-label` | Ngôn ngữ |
| 27 | 165 | `text` | EN \| VI |
| 28 | 169 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 29 | 191 | `attr:aria-label` | Liên Hệ — mở đầu |
| 30 | 193 | `text` | LIÊN HỆ |
| 31 | 194 | `text` | Viết thư cho chúng tôi, trong sự tin tưởng. |
| 32 | 195 | `text` | Muốn giới thiệu về bản thân bằng văn bản trước khi đặt lịch gọi điện? Chúng tôi đích thân đọc từng tin nhắn, và mọi cuộc trò chuyện đều được giữ bí mật tuyệt đối. |
| 33 | 199 | `text` | Đặt lịch tư vấn miễn phí Xem câu hỏi thường gặp |
| 34 | 203 | `attr:aria-label` | Một cặp đôi ngồi cùng nhau trong khu vườn nhiệt đới |
| 35 | 213 | `text` | Thông Tin Liên Hệ |
| 36 | 214 | `text` | Một cuộc trò chuyện riêng tư bắt đầu từ đây. |
| 37 | 217 | `text` | Email team@heritage-union.com |
| 38 | 221 | `text` | Thời gian phản hồi Chúng tôi đích thân phản hồi mọi yêu cầu nghiêm túc, thường trong vòng một đến hai ngày làm việc. |
| 39 | 225 | `text` | Bảo mật Thông tin của bạn không bao giờ được chia sẻ. Mọi yêu cầu, dù bạn gửi bằng cách nào, đều được giữ bí mật tuyệt đối. |
| 40 | 229 | `text` | Thị trường chính Vương Quốc Anh · Hoa Kỳ · Úc |
| 41 | 233 | `text` | Nếu bạn là phụ nữ Việt Nam quan tâm đến Heritage Union, vui lòng đăng ký tại đây: Trở Thành Ứng Viên. |
| 42 | 242 | `text` | Để trống trường này |
| 43 | 245 | `text` | Họ và tên |
| 44 | 249 | `text` | Địa chỉ email |
| 45 | 253 | `text` | Quốc gia |
| 46 | 257 | `text` | Tin nhắn |
| 47 | 260 | `text` | Gửi tin nhắn |
| 48 | 261 | `text` | Bằng việc gửi, bạn đồng ý để Heritage Union liên hệ với bạn về yêu cầu của bạn. Chúng tôi không bao giờ chia sẻ thông tin của bạn với bên thứ ba. |
| 49 | 275 | `text` | Đăng ký một buổi tư vấn riêng tư |
| 50 | 276 | `text` | Muốn trao đổi trực tiếp hơn? |
| 51 | 277 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 52 | 286 | `text` | Buổi tư vấn ban đầu miễn phí |
| 53 | 287 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 54 | 289 | `text` | Ba mươi phút không vội vã cùng James để tìm hiểu về mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 55 | 296 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 56 | 302 | `text` | Bảo mật ngay từ những lời đầu tiên |
| 57 | 308 | `text` | Trực tiếp với người sáng lập của chúng tôi, James |
| 58 | 314 | `text` | Không ràng buộc, không áp lực |
| 59 | 319 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 60 | 320 | `text` | Muốn viết thư trước? team@heritage-union.com |
| 61 | 328 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 62 | 349 | `attr:aria-label` | Heritage Union — về trang chủ |
| 63 | 353 | `text` | HERITAGE UNION |
| 64 | 356 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 65 | 359 | `text` | Đặt lịch tư vấn miễn phí |
| 66 | 364 | `text` | Khám Phá |
| 67 | 366 | `text` | Quy Trình |
| 68 | 367 | `text` | Dịch Vụ |
| 69 | 368 | `text` | Thành Công |
| 70 | 369 | `text` | Hỏi Huyền |
| 71 | 370 | `text` | Kiến Thức & Tài Nguyên |
| 72 | 371 | `text` | Biểu Phí |
| 73 | 372 | `text` | Hỏi Đáp |
| 74 | 378 | `text` | Giới Thiệu |
| 75 | 380 | `text` | Gặp Gỡ James |
| 76 | 381 | `text` | Gặp Gỡ Huyền |
| 77 | 382 | `text` | Câu Chuyện Của Chúng Tôi |
| 78 | 383 | `text` | Vì Sao Việt Nam |
| 79 | 389 | `text` | Liên Hệ |
| 80 | 391 | `text` | team@heritage-union.com |
| 81 | 392 | `text` | Trang liên hệ |
| 82 | 393 | `text` | Trở Thành Ứng Viên |
| 83 | 402 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/request-fee-structure.html`: 89 strings (legal / consent content: grammar & spelling only)

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Biểu Phí — Heritage Union |
| 2 | 11 | `meta:description` | Heritage Union tin vào sự minh bạch hoàn toàn về phí dịch vụ. Yêu cầu tài liệu Cơ Cấu Dịch Vụ & Đầu Tư đầy đủ của chúng tôi, gửi thẳng vào hộp thư của bạn — không ràng buộc. |
| 3 | 12 | `meta:keywords` | phí Heritage Union, chi phí dịch vụ tư vấn quan hệ, giá dịch vụ mai mối, cơ cấu đầu tư Heritage Union |
| 4 | 25 | `meta:og:title` | Biểu Phí — Heritage Union |
| 5 | 26 | `meta:og:description` | Heritage Union tin vào sự minh bạch hoàn toàn về phí dịch vụ. Yêu cầu tài liệu Cơ Cấu Dịch Vụ & Đầu Tư đầy đủ, gửi thẳng vào hộp thư của bạn. |
| 6 | 36 | `meta:twitter:title` | Biểu Phí — Heritage Union |
| 7 | 37 | `meta:twitter:description` | Heritage Union tin vào sự minh bạch hoàn toàn về phí dịch vụ. Yêu cầu tài liệu Cơ Cấu Dịch Vụ & Đầu Tư đầy đủ, gửi thẳng vào hộp thư của bạn. |
| 8 | 61 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 9 | 75 | `attr:aria-label` | Heritage Union — về trang chủ |
| 10 | 82 | `text` | HERITAGE UNION |
| 11 | 93 | `text` | Quy Trình |
| 12 | 94 | `text` | Dịch Vụ |
| 13 | 95 | `text` | Thành Công |
| 14 | 97 | `text` | Tài Nguyên |
| 15 | 102 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 16 | 108 | `text` | Giới Thiệu |
| 17 | 113 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 18 | 119 | `text` | Hỏi Đáp |
| 19 | 120 | `text` | Liên Hệ |
| 20 | 124 | `attr:aria-label` | Ngôn ngữ |
| 21 | 125 | `text` | EN \| VI |
| 22 | 129 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 23 | 131 | `attr:aria-label` | Mở menu điều hướng |
| 24 | 145 | `attr:aria-label` | Mobile navigation |
| 25 | 147 | `attr:aria-label` | Ngôn ngữ |
| 26 | 148 | `text` | EN \| VI |
| 27 | 152 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 28 | 174 | `attr:aria-label` | Biểu Phí — mở đầu |
| 29 | 176 | `text` | MINH BẠCH HOÀN TOÀN |
| 30 | 177 | `text` | Xem chính xác những gì được bao gồm. |
| 31 | 178 | `text` | Chúng tôi tin rằng bạn nên hiểu rõ hoàn toàn về phí dịch vụ của chúng tôi trước khi nhấc điện thoại. Yêu cầu tài liệu Cơ Cấu Dịch Vụ & Đầu Tư đầy đủ bên dưới — nó trình bày mọi giai đoạn, những gì được bao gồm, và cách chi phí được chia sẻ chính xác, không có gì mơ hồ. |
| 32 | 182 | `text` | Yêu cầu tài liệu Quy trình hoạt động |
| 33 | 186 | `attr:aria-label` | Một cặp đôi ôm nhau trên bãi biển lúc hoàng hôn |
| 34 | 195 | `text` | Vì Sao Chúng Tôi Công Khai Điều Này |
| 35 | 196 | `text` | Không bất ngờ, không gói dịch vụ mơ hồ. |
| 36 | 197 | `text` | Những người đàn ông nghiêm túc cân nhắc một dịch vụ như của chúng tôi xứng đáng có câu trả lời rõ ràng về chi phí, trước khi bất kỳ cuộc trò chuyện nào bắt đầu. Tài liệu của chúng tôi trình bày đầy đủ cơ cấu đầu tư, những gì mỗi giai đoạn bao gồm, và cách chi phí được chia sẻ giữa Heritage Union và khách hàng. |
| 37 | 207 | `text` | Không có gì mơ hồ |
| 38 | 208 | `text` | Mọi giai đoạn của quy trình, và chính xác những gì được bao gồm ở mỗi giai đoạn, được trình bày đầy đủ trước khi bạn cam kết bất cứ điều gì. |
| 39 | 214 | `text` | Không áp lực, không cuộc gọi |
| 40 | 215 | `text` | Yêu cầu tài liệu này không ràng buộc bạn với bất cứ điều gì. Đọc theo tốc độ của riêng bạn, không có cuộc gọi theo dõi hay áp lực bán hàng. |
| 41 | 221 | `text` | Thẳng vào hộp thư của bạn |
| 42 | 222 | `text` | Điền vào biểu mẫu ngắn bên dưới và tài liệu đầy đủ sẽ đến qua email chỉ trong giây lát — không chờ đợi, không cần gọi điện. |
| 43 | 234 | `text` | Yêu Cầu Tài Liệu |
| 44 | 235 | `text` | Chúng tôi nên gửi đến đâu? |
| 45 | 236 | `text` | Chỉ ba thông tin, và tài liệu sẽ được gửi đi — bản trình bày đầy đủ về mọi khoản phí, những gì được bao gồm, và cách quy trình hoạt động. |
| 46 | 244 | `text` | Leave this field blank |
| 47 | 248 | `text` | Họ và tên |
| 48 | 252 | `text` | Địa chỉ email |
| 49 | 256 | `text` | Quốc gia cư trú |
| 50 | 259 | `text` | Gửi tài liệu cho tôi |
| 51 | 260 | `text` | Bằng việc gửi biểu mẫu này, bạn đồng ý để Heritage Union liên hệ về yêu cầu của bạn. Chúng tôi không bao giờ chia sẻ thông tin của bạn với bên thứ ba. |
| 52 | 267 | `text` | Hãy kiểm tra hộp thư của bạn. |
| 53 | 268 | `text` | Tài liệu Cơ Cấu Dịch Vụ & Đầu Tư đầy đủ của chúng tôi đang được gửi đến địa chỉ email của bạn. Nếu bạn không thấy trong vài phút, vui lòng kiểm tra thư mục spam. |
| 54 | 281 | `text` | Đặt lịch tư vấn riêng |
| 55 | 282 | `text` | Muốn trao đổi trực tiếp hơn? |
| 56 | 283 | `text` | Một cuộc trò chuyện miễn phí, không ràng buộc với người sáng lập của chúng tôi. Chọn thời gian phù hợp với bạn — kín đáo, chu đáo và hoàn toàn bảo mật. |
| 57 | 292 | `text` | Buổi tư vấn miễn phí đầu tiên |
| 58 | 293 | `text` | Một cuộc trò chuyện riêng tư với người sáng lập. |
| 59 | 295 | `text` | Ba mươi phút không vội vã với James để hiểu mong muốn của bạn và giải đáp mọi thắc mắc — kín đáo, chu đáo và hoàn toàn không ràng buộc. |
| 60 | 302 | `text` | 30 phút, qua cuộc gọi video riêng tư |
| 61 | 308 | `text` | Bảo mật ngay từ lời đầu tiên |
| 62 | 314 | `text` | Trực tiếp với người sáng lập, James |
| 63 | 320 | `text` | Không ràng buộc, không áp lực |
| 64 | 325 | `text` | "Riêng tư, chu đáo và đồng hành cùng bạn trong từng bước." |
| 65 | 326 | `text` | Muốn viết trước? team@heritage-union.com |
| 66 | 334 | `attr:aria-label` | Đặt lịch tư vấn với Heritage Union |
| 67 | 355 | `attr:aria-label` | Heritage Union — về trang chủ |
| 68 | 359 | `text` | HERITAGE UNION |
| 69 | 362 | `text` | Công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 70 | 365 | `text` | Đặt lịch tư vấn miễn phí |
| 71 | 370 | `text` | Khám Phá |
| 72 | 372 | `text` | Quy Trình |
| 73 | 373 | `text` | Dịch Vụ |
| 74 | 374 | `text` | Thành Công |
| 75 | 375 | `text` | Hỏi Huyền |
| 76 | 376 | `text` | Kiến Thức & Tài Nguyên |
| 77 | 377 | `text` | Biểu Phí |
| 78 | 378 | `text` | Hỏi Đáp |
| 79 | 384 | `text` | Giới Thiệu |
| 80 | 386 | `text` | Gặp Gỡ James |
| 81 | 387 | `text` | Gặp Gỡ Huyền |
| 82 | 388 | `text` | Câu Chuyện Của Chúng Tôi |
| 83 | 389 | `text` | Vì Sao Việt Nam |
| 84 | 395 | `text` | Liên Hệ |
| 85 | 397 | `text` | team@heritage-union.com |
| 86 | 398 | `text` | Trang liên hệ |
| 87 | 399 | `text` | Trở Thành Ứng Viên |
| 88 | 400 | `text` | Chỉ nhận theo hồ sơ đăng ký |
| 89 | 409 | `text` | © 2026 Heritage Union · Bảo Mật & Riêng Tư Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/become-a-candidate.html`: 193 strings (legal / consent content: grammar & spelling only)

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Trở Thành Ứng Viên Của Heritage Union |
| 2 | 11 | `meta:description` | Bạn là phụ nữ Việt Nam nghiêm túc tìm kiếm một kết nối ý nghĩa? Tìm hiểu về việc trở thành ứng viên của Heritage Union — một quy trình tôn trọng, bảo mật, nơi bạn luôn là người quyết định. |
| 3 | 12 | `meta:keywords` | trở thành ứng viên Heritage Union, đăng ký làm ứng viên, giới thiệu quan hệ cho phụ nữ Việt Nam, đăng ký quan tâm Heritage Union |
| 4 | 25 | `meta:og:title` | Trở Thành Ứng Viên Của Heritage Union |
| 5 | 26 | `meta:og:description` | Một quy trình tôn trọng, bảo mật dành cho phụ nữ Việt Nam nghiêm túc tìm kiếm một kết nối ý nghĩa — bạn luôn là người quyết định. |
| 6 | 36 | `meta:twitter:title` | Trở Thành Ứng Viên Của Heritage Union |
| 7 | 37 | `meta:twitter:description` | Một quy trình tôn trọng, bảo mật dành cho phụ nữ Việt Nam nghiêm túc tìm kiếm một kết nối ý nghĩa — bạn luôn là người quyết định. |
| 8 | 61 | `text` | Chuyển đến nội dung chính Xem biểu phí đầy đủ của chúng tôi — gửi miễn phí ngay vào hộp thư của bạn. Yêu cầu ngay → |
| 9 | 75 | `attr:aria-label` | Heritage Union — về trang chủ |
| 10 | 82 | `text` | HERITAGE UNION |
| 11 | 93 | `text` | Quy Trình |
| 12 | 94 | `text` | Dịch Vụ |
| 13 | 95 | `text` | Thành Công |
| 14 | 97 | `text` | Tài Nguyên |
| 15 | 102 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 16 | 108 | `text` | Giới Thiệu |
| 17 | 113 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 18 | 119 | `text` | Hỏi Đáp |
| 19 | 120 | `text` | Liên Hệ |
| 20 | 124 | `attr:aria-label` | Ngôn ngữ |
| 21 | 125 | `text` | EN \| VI |
| 22 | 129 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đăng ký quan tâm |
| 23 | 131 | `attr:aria-label` | Mở menu điều hướng |
| 24 | 145 | `attr:aria-label` | Điều hướng trên di động |
| 25 | 147 | `attr:aria-label` | Ngôn ngữ |
| 26 | 148 | `text` | EN \| VI |
| 27 | 152 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 28 | 176 | `text` | DÀNH CHO PHỤ NỮ VIỆT NAM |
| 29 | 177 | `text` | Làm quen với một người đàn ông thật lòng mong muốn gắn bó lâu dài |
| 30 | 178 | `text` | Heritage Union làm việc với những người đàn ông ở nước ngoài đang tìm một mối quan hệ nghiêm túc, gắn bó lâu dài với một người phụ nữ Việt Nam. Mỗi người trong số họ là khách hàng trả phí, đã hoàn tất việc kiểm tra lý lịch, và đã nhờ Heritage Union tư vấn, đồng hành cùng anh ấy trên hành trình này. |
| 31 | 181 | `text` | Việc đăng ký hoàn toàn miễn phí và do bạn tự quyết định. Nếu có một người đàn ông muốn được giới thiệu với bạn, bạn sẽ nhận được thông tin lý lịch của anh ấy bằng tiếng Việt trước tiên, bao gồm cả chuyện tình cảm và hôn nhân trước đây của anh ấy. Sau đó, chính bạn quyết định có chia sẻ thông tin liên lạc của mình hay không. Bạn không bao giờ phải trả tiền cho bất kỳ ai, và bạn có thể rút đăng ký bất cứ lúc nào. |
| 32 | 185 | `text` | Miễn phí và tự nguyện, chỉ dành cho người từ 18 tuổi trở lên |
| 33 | 186 | `text` | Bạn xem lý lịch của anh ấy trước, rồi bạn quyết định |
| 34 | 187 | `text` | Rút đăng ký bất cứ lúc nào |
| 35 | 189 | `text` | Tìm hiểu về sự an toàn và quyền lợi của bạn → |
| 36 | 191 | `text` | Đăng ký quan tâm Quy trình của chúng tôi diễn ra như thế nào |
| 37 | 203 | `text` | Trước Khi Đăng Ký |
| 38 | 204 | `text` | Điều này có phù hợp với bạn không? |
| 39 | 205 | `text` | Đây là dành cho bạn nếu những điều sau đúng với bạn — việc đăng ký luôn là lựa chọn của riêng bạn, không phải của chúng tôi. |
| 40 | 212 | `text` | Nghiêm túc về một mối quan hệ gắn bó & gia đình |
| 41 | 213 | `text` | Bạn đang tìm kiếm một mối quan hệ chân thành, lâu dài — không phải hẹn hò qua loa hay chỉ để lấp đầy thời gian. |
| 42 | 217 | `text` | Độc lập & vững vàng |
| 43 | 218 | `text` | Tự tin về chính con người mình, có cuộc sống và giá trị riêng — coi trọng gia đình mà không đánh mất sự độc lập. |
| 44 | 222 | `text` | Trung thực về điều bạn mong muốn |
| 45 | 223 | `text` | Rõ ràng với chính mình và với chúng tôi về mẫu người bạn đời và tương lai mà bạn hy vọng xây dựng. |
| 46 | 227 | `text` | Sẵn sàng cho một tương lai đa văn hóa |
| 47 | 228 | `text` | Thực sự tò mò và cởi mở với việc xây dựng cuộc sống cùng một người đến từ nền văn hóa và hoàn cảnh khác. |
| 48 | 232 | `text` | Từ 18 tuổi trở lên |
| 49 | 233 | `text` | Heritage Union chỉ tiếp nhận đăng ký từ phụ nữ từ 18 tuổi trở lên. |
| 50 | 245 | `text` | Điều Bạn Có Thể Mong Đợi |
| 51 | 246 | `text` | Một quy trình mang tính cá nhân, từ tin nhắn đầu tiên. |
| 52 | 247 | `text` | Một quy trình rõ ràng và tôn trọng — bạn là người quyết định ở mỗi bước. |
| 53 | 255 | `text` | Đăng ký |
| 54 | 256 | `text` | Chia sẻ đôi điều về bản thân bạn qua mẫu đăng ký bên dưới. Chưa cần ảnh hay video ở giai đoạn này — chỉ cần một lời giới thiệu chân thành. |
| 55 | 260 | `text` | Xác nhận thông tin của bạn |
| 56 | 261 | `text` | Chúng tôi sẽ gửi một tin nhắn ngắn để bạn xác nhận thông tin liên hệ và hoàn thiện hồ sơ của chính mình. |
| 57 | 265 | `text` | Bạn là người quyết định mọi buổi giới thiệu |
| 58 | 266 | `text` | Khi có một người đàn ông quan tâm đến việc được giới thiệu, bạn sẽ nhận được thông tin về anh ấy — bao gồm cả bản khai lý lịch — và chính bạn quyết định có chia sẻ thông tin liên hệ của mình hay không. |
| 59 | 270 | `text` | Hỗ trợ văn hóa, bất cứ khi nào bạn cần |
| 60 | 271 | `text` | Huyền luôn sẵn sàng hỗ trợ bạn về văn hóa bằng tiếng Việt, bất cứ khi nào bạn cần. |
| 61 | 283 | `text` | Cam Kết Của Chúng Tôi Với Bạn |
| 62 | 284 | `text` | Sự tôn trọng và an toàn, trong từng bước. |
| 63 | 292 | `text` | Bảo mật tuyệt đối |
| 64 | 293 | `text` | Thông tin của bạn không bao giờ được công bố, chia sẻ công khai, hay cho phép duyệt xem. Thông tin liên lạc của bạn luôn được bảo mật trong nội bộ Heritage Union. Chỉ khi bạn đánh dấu ô không bắt buộc lúc đăng ký, khách hàng mới có thể xem một hồ sơ ngắn gồm tên, tuổi, thành phố/tỉnh và những gì bạn viết về bản thân. Mọi thông tin được xử lý theo đúng Chính Sách Bảo Mật của chúng tôi. |
| 65 | 299 | `text` | Không ràng buộc, không bao giờ |
| 66 | 300 | `text` | Đăng ký quan tâm không khiến bạn phải cam kết bất cứ điều gì. Bạn hoàn toàn tự do đặt câu hỏi và dừng lại bất cứ lúc nào. |
| 67 | 306 | `text` | Mọi khách hàng đều đã được kiểm tra lý lịch |
| 68 | 307 | `text` | Mọi người đàn ông đều là khách hàng trả phí và đã hoàn tất kiểm tra lý lịch. Bạn sẽ được xem bản khai của anh ấy trước khi bất kỳ thông tin nào được chia sẻ. |
| 69 | 313 | `text` | Bạn là người quyết định bước tiếp theo |
| 70 | 314 | `text` | Một buổi giới thiệu chỉ diễn ra khi có sự đồng ý của bạn. Bạn không bao giờ bị bắt buộc phải tiếp tục một cuộc trò chuyện mà bạn không thấy thoải mái. |
| 71 | 326 | `text` | Đăng Ký Quan Tâm |
| 72 | 327 | `text` | Hãy cho chúng tôi biết đôi điều về bạn. |
| 73 | 328 | `text` | Đây đơn giản chỉ là một lời giới thiệu — chưa cần ảnh hay video. Chúng tôi sẽ xác nhận đã nhận được đăng ký của bạn và hướng dẫn bước tiếp theo. |
| 74 | 336 | `text` | Việc đăng ký sắp được mở. Để lại số Zalo hoặc email của bạn và chúng tôi sẽ báo ngay khi có thể đăng ký. |
| 75 | 341 | `text` | Để trống trường này |
| 76 | 344 | `text` | Họ và tên |
| 77 | 348 | `text` | Số Zalo hoặc email |
| 78 | 353 | `text` | Tôi đồng ý để Heritage Union liên hệ với tôi khi việc đăng ký được mở. |
| 79 | 356 | `text` | Báo cho tôi |
| 80 | 359 | `text` | Cảm ơn bạn. |
| 81 | 360 | `text` | Chúng tôi sẽ báo cho bạn ngay khi việc đăng ký được mở. |
| 82 | 368 | `text` | Để trống trường này |
| 83 | 371 | `text` | Họ và tên |
| 84 | 375 | `text` | Ngày sinh |
| 85 | 380 | `text` | Tôi xác nhận mình từ 18 tuổi trở lên. |
| 86 | 383 | `text` | Thành phố / Tỉnh |
| 87 | 386 | `text` | Chọn... |
| 88 | 387 | `text` | An Giang |
| 89 | 388 | `text` | Bà Rịa – Vũng Tàu |
| 90 | 389 | `text` | Bạc Liêu |
| 91 | 390 | `text` | Bắc Giang |
| 92 | 391 | `text` | Bắc Kạn |
| 93 | 392 | `text` | Bắc Ninh |
| 94 | 393 | `text` | Bến Tre |
| 95 | 394 | `text` | Bình Định |
| 96 | 395 | `text` | Bình Dương |
| 97 | 396 | `text` | Bình Phước |
| 98 | 397 | `text` | Bình Thuận |
| 99 | 398 | `text` | Cà Mau |
| 100 | 399 | `text` | Cần Thơ |
| 101 | 400 | `text` | Cao Bằng |
| 102 | 401 | `text` | Đà Nẵng |
| 103 | 402 | `text` | Đắk Lắk |
| 104 | 403 | `text` | Đắk Nông |
| 105 | 404 | `text` | Điện Biên |
| 106 | 405 | `text` | Đồng Nai |
| 107 | 406 | `text` | Đồng Tháp |
| 108 | 407 | `text` | Gia Lai |
| 109 | 408 | `text` | Hà Giang |
| 110 | 409 | `text` | Hà Nam |
| 111 | 410 | `text` | Hà Nội |
| 112 | 411 | `text` | Hà Tĩnh |
| 113 | 412 | `text` | Hải Dương |
| 114 | 413 | `text` | Hải Phòng |
| 115 | 414 | `text` | Hậu Giang |
| 116 | 415 | `text` | Hòa Bình |
| 117 | 416 | `text` | Hưng Yên |
| 118 | 417 | `text` | Khánh Hòa |
| 119 | 418 | `text` | Kiên Giang |
| 120 | 419 | `text` | Kon Tum |
| 121 | 420 | `text` | Lai Châu |
| 122 | 421 | `text` | Lâm Đồng |
| 123 | 422 | `text` | Lạng Sơn |
| 124 | 423 | `text` | Lào Cai |
| 125 | 424 | `text` | Long An |
| 126 | 425 | `text` | Nam Định |
| 127 | 426 | `text` | Nghệ An |
| 128 | 427 | `text` | Ninh Bình |
| 129 | 428 | `text` | Ninh Thuận |
| 130 | 429 | `text` | Phú Thọ |
| 131 | 430 | `text` | Phú Yên |
| 132 | 431 | `text` | Quảng Bình |
| 133 | 432 | `text` | Quảng Nam |
| 134 | 433 | `text` | Quảng Ngãi |
| 135 | 434 | `text` | Quảng Ninh |
| 136 | 435 | `text` | Quảng Trị |
| 137 | 436 | `text` | Sóc Trăng |
| 138 | 437 | `text` | Sơn La |
| 139 | 438 | `text` | Tây Ninh |
| 140 | 439 | `text` | Thái Bình |
| 141 | 440 | `text` | Thái Nguyên |
| 142 | 441 | `text` | Thanh Hóa |
| 143 | 442 | `text` | Thừa Thiên Huế |
| 144 | 443 | `text` | Tiền Giang |
| 145 | 444 | `text` | TP. Hồ Chí Minh |
| 146 | 445 | `text` | Trà Vinh |
| 147 | 446 | `text` | Tuyên Quang |
| 148 | 447 | `text` | Vĩnh Long |
| 149 | 448 | `text` | Vĩnh Phúc |
| 150 | 449 | `text` | Yên Bái |
| 151 | 450 | `text` | Khác |
| 152 | 454 | `text` | Số Zalo |
| 153 | 455 | `attr:placeholder` | VD: 0901234567 |
| 154 | 458 | `text` | Email (không bắt buộc) |
| 155 | 462 | `text` | Ngôn ngữ ưa thích |
| 156 | 464 | `text` | Tiếng Việt |
| 157 | 465 | `text` | English |
| 158 | 469 | `text` | Đôi điều về bản thân bạn, và điều bạn hy vọng tìm kiếm |
| 159 | 474 | `text` | Bạn biết đến chúng tôi qua đâu? |
| 160 | 476 | `text` | Nhóm Facebook |
| 161 | 477 | `text` | Bạn bè giới thiệu |
| 162 | 478 | `text` | Tìm kiếm |
| 163 | 479 | `text` | Khác |
| 164 | 484 | `text` | Tôi đồng ý để Heritage Union liên hệ với tôi về đăng ký này. |
| 165 | 488 | `text` | Tôi đồng ý để thông tin của mình được xử lý theo Chính Sách Bảo Mật, bao gồm việc lưu trữ ngoài lãnh thổ Việt Nam. |
| 166 | 492 | `text` | Không bắt buộc: Tôi đồng ý để Heritage Union cho khách hàng của mình xem hồ sơ của tôi, gồm tên, tuổi, thành phố/tỉnh và những gì tôi viết về bản thân. Không bao giờ kèm họ, ngày sinh, số Zalo hay email của tôi. Tôi có thể thay đổi ý định bất cứ lúc nào. |
| 167 | 494 | `text` | Nếu bạn không đánh dấu ô này, chúng tôi sẽ không cho khách hàng xem hồ sơ của bạn, vì vậy bạn khó có thể nhận được lời giới thiệu. Bạn vẫn có thể đăng ký. |
| 168 | 497 | `text` | Đăng ký |
| 169 | 498 | `text` | Chúng tôi không bao giờ chia sẻ thông tin của bạn với bất kỳ ai bên ngoài Heritage Union. Xem thêm tại trang an toàn và quyền lợi của bạn. |
| 170 | 501 | `text` | Cảm ơn bạn. |
| 171 | 502 | `text` | Chúng tôi sẽ sớm liên hệ để hướng dẫn bước tiếp theo. |
| 172 | 519 | `attr:aria-label` | Heritage Union — về trang chủ |
| 173 | 523 | `text` | HERITAGE UNION |
| 174 | 526 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 175 | 529 | `text` | Đăng ký quan tâm |
| 176 | 534 | `text` | Khám Phá |
| 177 | 536 | `text` | Quy Trình |
| 178 | 537 | `text` | Dịch Vụ |
| 179 | 538 | `text` | Thành Công |
| 180 | 539 | `text` | Hỏi Huyền |
| 181 | 540 | `text` | Kiến Thức & Tài Nguyên |
| 182 | 541 | `text` | Biểu Phí |
| 183 | 542 | `text` | Hỏi Đáp |
| 184 | 548 | `text` | Giới Thiệu |
| 185 | 550 | `text` | Gặp Gỡ James |
| 186 | 551 | `text` | Gặp Gỡ Huyền |
| 187 | 552 | `text` | Câu Chuyện Của Chúng Tôi |
| 188 | 553 | `text` | Vì Sao Việt Nam |
| 189 | 559 | `text` | Liên Hệ |
| 190 | 561 | `text` | team@heritage-union.com |
| 191 | 562 | `text` | Trang liên hệ |
| 192 | 563 | `text` | Trở Thành Ứng Viên |
| 193 | 572 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/thank-you-registration.html`: 50 strings

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Cảm Ơn Bạn — Heritage Union |
| 2 | 11 | `meta:description` | Cảm ơn bạn đã đăng ký với Heritage Union. |
| 3 | 39 | `text` | Chuyển đến nội dung chính |
| 4 | 48 | `attr:aria-label` | Heritage Union — về trang chủ |
| 5 | 55 | `text` | HERITAGE UNION |
| 6 | 66 | `text` | Quy Trình |
| 7 | 67 | `text` | Dịch Vụ |
| 8 | 68 | `text` | Thành Công |
| 9 | 70 | `text` | Tài Nguyên |
| 10 | 75 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 11 | 81 | `text` | Giới Thiệu |
| 12 | 86 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 13 | 92 | `text` | Hỏi Đáp |
| 14 | 93 | `text` | Liên Hệ |
| 15 | 97 | `attr:aria-label` | Ngôn ngữ |
| 16 | 98 | `text` | EN \| VI |
| 17 | 102 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Về trang chủ |
| 18 | 104 | `attr:aria-label` | Mở menu điều hướng |
| 19 | 118 | `attr:aria-label` | Điều hướng trên di động |
| 20 | 120 | `attr:aria-label` | Ngôn ngữ |
| 21 | 121 | `text` | EN \| VI |
| 22 | 125 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 23 | 147 | `attr:aria-label` | Cảm ơn bạn |
| 24 | 149 | `text` | ĐÃ NHẬN ĐƯỢC ĐĂNG KÝ |
| 25 | 150 | `text` | Cảm ơn bạn. |
| 26 | 151 | `text` | Chúng tôi đã nhận được đăng ký của bạn với Heritage Union. Chúng tôi sẽ gửi một tin nhắn ngắn để bạn xác nhận thông tin liên hệ và hoàn thiện hồ sơ của mình. Việc đăng ký là hoàn toàn miễn phí và tự nguyện — bạn có thể rút lại bất cứ lúc nào. |
| 27 | 154 | `text` | Nếu bạn muốn rút đăng ký bất cứ lúc nào, bạn có thể thực hiện tại trang rút đăng ký. Để hiểu về quyền lợi của bạn, xem trang an toàn và quyền lợi của bạn. |
| 28 | 158 | `text` | Về trang chủ |
| 29 | 174 | `attr:aria-label` | Heritage Union — về trang chủ |
| 30 | 178 | `text` | HERITAGE UNION |
| 31 | 181 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 32 | 184 | `text` | Về trang chủ |
| 33 | 189 | `text` | Khám Phá |
| 34 | 191 | `text` | Quy Trình |
| 35 | 192 | `text` | Dịch Vụ |
| 36 | 193 | `text` | Thành Công |
| 37 | 194 | `text` | Hỏi Huyền |
| 38 | 195 | `text` | Kiến Thức & Tài Nguyên |
| 39 | 196 | `text` | Biểu Phí |
| 40 | 197 | `text` | Hỏi Đáp |
| 41 | 203 | `text` | Giới Thiệu |
| 42 | 205 | `text` | Gặp Gỡ James |
| 43 | 206 | `text` | Gặp Gỡ Huyền |
| 44 | 207 | `text` | Câu Chuyện Của Chúng Tôi |
| 45 | 208 | `text` | Vì Sao Việt Nam |
| 46 | 214 | `text` | Liên Hệ |
| 47 | 216 | `text` | team@heritage-union.com |
| 48 | 217 | `text` | Trang liên hệ |
| 49 | 218 | `text` | Trở Thành Ứng Viên |
| 50 | 227 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/withdraw.html`: 55 strings (legal / consent content: grammar & spelling only)

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 10 | `text` | Rút Đăng Ký — Heritage Union |
| 2 | 11 | `meta:description` | Rút đăng ký ứng viên của bạn với Heritage Union bất cứ lúc nào. Miễn phí, đơn giản, không cần giải thích. |
| 3 | 39 | `text` | Chuyển đến nội dung chính |
| 4 | 48 | `attr:aria-label` | Heritage Union — về trang chủ |
| 5 | 55 | `text` | HERITAGE UNION |
| 6 | 66 | `text` | Quy Trình |
| 7 | 67 | `text` | Dịch Vụ |
| 8 | 68 | `text` | Thành Công |
| 9 | 70 | `text` | Tài Nguyên |
| 10 | 75 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 11 | 81 | `text` | Giới Thiệu |
| 12 | 86 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 13 | 92 | `text` | Hỏi Đáp |
| 14 | 93 | `text` | Liên Hệ |
| 15 | 97 | `attr:aria-label` | Ngôn ngữ |
| 16 | 98 | `text` | EN \| VI |
| 17 | 102 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Trở thành ứng viên |
| 18 | 104 | `attr:aria-label` | Mở menu điều hướng |
| 19 | 118 | `attr:aria-label` | Điều hướng trên di động |
| 20 | 120 | `attr:aria-label` | Ngôn ngữ |
| 21 | 121 | `text` | EN \| VI |
| 22 | 125 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 23 | 147 | `attr:aria-label` | Rút đăng ký của bạn |
| 24 | 149 | `text` | LỰA CHỌN CỦA BẠN, LUÔN LUÔN |
| 25 | 150 | `text` | Rút đăng ký của bạn. |
| 26 | 151 | `text` | Việc đăng ký với Heritage Union luôn là tự nguyện, và bạn có thể rút lại bất cứ lúc nào, vì bất kỳ lý do gì, không cần giải thích. Chúng tôi sẽ ngừng sử dụng thông tin của bạn cho các buổi giới thiệu và xóa thông tin đó trong vòng 30 ngày kể từ khi bạn yêu cầu, theo Chính Sách Bảo Mật của chúng tôi. |
| 27 | 161 | `text` | Nhập số Zalo hoặc email của bạn |
| 28 | 162 | `text` | Chúng tôi sẽ đối chiếu với hồ sơ của mình và xóa đăng ký của bạn. |
| 29 | 169 | `text` | Để trống trường này |
| 30 | 172 | `text` | Số Zalo hoặc email |
| 31 | 176 | `text` | Rút đăng ký của tôi |
| 32 | 179 | `text` | Hoàn tất. |
| 33 | 180 | `text` | Nếu chúng tôi tìm thấy một đăng ký phù hợp, đăng ký đó đã được rút lại. Bạn có thể đăng ký lại bất cứ lúc nào trong tương lai. |
| 34 | 197 | `attr:aria-label` | Heritage Union — về trang chủ |
| 35 | 201 | `text` | HERITAGE UNION |
| 36 | 204 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 37 | 207 | `text` | Trở thành ứng viên |
| 38 | 212 | `text` | Khám Phá |
| 39 | 214 | `text` | Quy Trình |
| 40 | 215 | `text` | Dịch Vụ |
| 41 | 216 | `text` | Thành Công |
| 42 | 217 | `text` | Hỏi Huyền |
| 43 | 218 | `text` | Kiến Thức & Tài Nguyên |
| 44 | 219 | `text` | Biểu Phí |
| 45 | 220 | `text` | Hỏi Đáp |
| 46 | 226 | `text` | Giới Thiệu |
| 47 | 228 | `text` | Gặp Gỡ James |
| 48 | 229 | `text` | Gặp Gỡ Huyền |
| 49 | 230 | `text` | Câu Chuyện Của Chúng Tôi |
| 50 | 231 | `text` | Vì Sao Việt Nam |
| 51 | 237 | `text` | Liên Hệ |
| 52 | 239 | `text` | team@heritage-union.com |
| 53 | 240 | `text` | Trang liên hệ |
| 54 | 241 | `text` | Trở Thành Ứng Viên |
| 55 | 250 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/privacy.html`: 76 strings (legal / consent content: grammar & spelling only)

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 11 | `text` | Chính Sách Bảo Mật — Heritage Union |
| 2 | 12 | `meta:description` | Cách Heritage Union thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của bạn, dành cho cả khách hàng và ứng viên. |
| 3 | 40 | `text` | Chuyển đến nội dung chính |
| 4 | 42 | `text` | BẢN NHÁP — đang chờ luật sư xem xét |
| 5 | 51 | `attr:aria-label` | Heritage Union — về trang chủ |
| 6 | 58 | `text` | HERITAGE UNION |
| 7 | 69 | `text` | Quy Trình |
| 8 | 70 | `text` | Dịch Vụ |
| 9 | 71 | `text` | Thành Công |
| 10 | 73 | `text` | Tài Nguyên |
| 11 | 78 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 12 | 84 | `text` | Giới Thiệu |
| 13 | 89 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 14 | 95 | `text` | Hỏi Đáp |
| 15 | 96 | `text` | Liên Hệ |
| 16 | 100 | `attr:aria-label` | Ngôn ngữ |
| 17 | 101 | `text` | EN \| VI |
| 18 | 105 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 19 | 107 | `attr:aria-label` | Mở menu điều hướng |
| 20 | 121 | `attr:aria-label` | Điều hướng trên di động |
| 21 | 123 | `attr:aria-label` | Ngôn ngữ |
| 22 | 124 | `text` | EN \| VI |
| 23 | 128 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 24 | 149 | `text` | Pháp Lý |
| 25 | 150 | `text` | Chính Sách Bảo Mật |
| 26 | 151 | `text` | Cập nhật lần cuối: Ngày 14 tháng 10 năm 2026. Chính sách này áp dụng cho heritage-union.com và tất cả các dịch vụ của Heritage Union. |
| 27 | 154 | `text` | 1. Chúng tôi là ai |
| 28 | 155 | `text` | Heritage Union ("chúng tôi") là một công ty tư vấn quan hệ quốc tế. Bên kiểm soát dữ liệu theo chính sách này là: |
| 29 | 157 | `text` | Bạn có thể liên hệ với chúng tôi qua team@heritage-union.com. |
| 30 | 161 | `text` | 2. Những gì chúng tôi thu thập |
| 31 | 162 | `text` | Nếu bạn đăng ký làm ứng viên, chúng tôi thu thập: họ và tên, ngày sinh, thành phố/tỉnh, số Zalo, địa chỉ email (không bắt buộc), ngôn ngữ ưa thích, những gì bạn chia sẻ về bản thân và điều bạn hy vọng, bạn biết đến chúng tôi qua đâu, và bản ghi về sự đồng ý của bạn. |
| 32 | 163 | `text` | Nếu bạn là khách hàng hoặc khách hàng tiềm năng, chúng tôi thu thập thông tin bạn cung cấp trực tiếp — tên, thông tin liên hệ, và bất cứ điều gì bạn chia sẻ trong buổi tư vấn hoặc qua trao đổi — cùng với kết quả kiểm tra lý lịch mà chúng tôi yêu cầu đối với mọi khách hàng trước khi có bất kỳ buổi giới thiệu nào. |
| 33 | 164 | `text` | Chúng tôi không thu thập ảnh hoặc giấy tờ tùy thân từ ứng viên ở giai đoạn đăng ký. |
| 34 | 168 | `text` | 3. Vì sao chúng tôi thu thập, và cơ sở pháp lý |
| 35 | 169 | `text` | Chúng tôi sử dụng thông tin này để vận hành dịch vụ giới thiệu và tư vấn của mình: để hiểu bạn đang tìm kiếm điều gì, để xem xét các buổi giới thiệu có thể diễn ra, để liên lạc với bạn, và để đáp ứng các nghĩa vụ pháp lý và an toàn của chúng tôi. |
| 36 | 170 | `text` | Cho khách hàng xem hồ sơ của bạn. Chỉ khi bạn đánh dấu vào ô đồng ý riêng, không bắt buộc lúc đăng ký, chúng tôi mới có thể cho khách hàng của Heritage Union xem một hồ sơ ngắn gồm tên, tuổi, thành phố/tỉnh và những gì bạn viết về bản thân. Chúng tôi không bao giờ cho khách hàng biết họ, ngày sinh, số Zalo, email hay bất kỳ thông tin liên lạc nào khác của bạn. Nếu bạn không đánh dấu ô này, hồ sơ của bạn sẽ không được cho khách hàng xem. Bạn có thể rút lại sự đồng ý này bất cứ lúc nào bằng cách gửi email đến team@heritage-union.com hoặc rút đăng ký, và chúng tôi sẽ ngừng cho xem hồ sơ của bạn ngay lập tức. |
| 37 | 171 | `text` | Cơ sở pháp lý của chúng tôi để xử lý dữ liệu ứng viên là sự đồng ý của bạn, được đưa ra tại thời điểm đăng ký. Bạn có thể rút lại sự đồng ý đó bất cứ lúc nào — xem Mục 7. |
| 38 | 175 | `text` | 4. Dữ liệu của bạn được lưu trữ ở đâu |
| 39 | 176 | `text` | Dữ liệu đăng ký ứng viên được lưu trữ với Supabase, trong cơ sở dữ liệu đặt tại Singapore. Trang web của chúng tôi được lưu trữ với Netlify, và email được gửi qua Resend — cả hai đều có trụ sở tại Hoa Kỳ. Điều này có nghĩa là dữ liệu của bạn có thể được xử lý ngoài lãnh thổ Việt Nam, điều mà bạn được yêu cầu đồng ý riêng khi đăng ký. |
| 40 | 180 | `text` | 5. Chúng tôi lưu giữ dữ liệu bao lâu |
| 41 | 181 | `text` | Chúng tôi lưu giữ dữ liệu ứng viên trong thời gian đăng ký của bạn còn hiệu lực, hoặc cho đến khi bạn yêu cầu chúng tôi xóa. Nếu bạn rút đăng ký, chúng tôi sẽ ngừng sử dụng thông tin của bạn cho các buổi giới thiệu và xóa hoàn toàn trong vòng 30 ngày. |
| 42 | 185 | `text` | 6. Quyền của bạn |
| 43 | 186 | `text` | Bạn có quyền: |
| 44 | 188 | `text` | Truy cập dữ liệu cá nhân mà chúng tôi lưu giữ về bạn |
| 45 | 189 | `text` | Chỉnh sửa thông tin không chính xác hoặc chưa đầy đủ |
| 46 | 190 | `text` | Rút đăng ký và sự đồng ý bất cứ lúc nào, bao gồm cả sự đồng ý riêng cho khách hàng xem hồ sơ của bạn |
| 47 | 191 | `text` | Yêu cầu xóa dữ liệu của bạn |
| 48 | 193 | `text` | Để thực hiện bất kỳ quyền nào trong số này, hãy gửi email đến team@heritage-union.com, hoặc — nếu bạn là ứng viên — sử dụng trang rút đăng ký của chúng tôi. |
| 49 | 197 | `text` | 7. Rút đăng ký của bạn |
| 50 | 198 | `text` | Ứng viên có thể rút đăng ký bất cứ lúc nào, vì bất kỳ lý do gì, không cần giải thích, thông qua trang rút đăng ký. Chúng tôi sẽ xóa dữ liệu của bạn trong vòng 30 ngày kể từ yêu cầu rút đăng ký. |
| 51 | 202 | `text` | 8. Khung pháp lý |
| 52 | 203 | `text` | Chúng tôi nỗ lực xử lý dữ liệu của bạn theo cách phù hợp với Luật Bảo Vệ Dữ Liệu Cá Nhân của Việt Nam và Quy Định Bảo Vệ Dữ Liệu Chung của Vương Quốc Anh (UK GDPR), bất kể bạn đang ở đâu. |
| 53 | 207 | `text` | 9. Liên hệ |
| 54 | 208 | `text` | Mọi câu hỏi về chính sách này, hoặc về dữ liệu của bạn, có thể gửi đến team@heritage-union.com. |
| 55 | 224 | `attr:aria-label` | Heritage Union — về trang chủ |
| 56 | 228 | `text` | HERITAGE UNION |
| 57 | 231 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 58 | 234 | `text` | Đặt lịch tư vấn miễn phí |
| 59 | 239 | `text` | Khám Phá |
| 60 | 241 | `text` | Quy Trình |
| 61 | 242 | `text` | Dịch Vụ |
| 62 | 243 | `text` | Thành Công |
| 63 | 244 | `text` | Hỏi Huyền |
| 64 | 245 | `text` | Kiến Thức & Tài Nguyên |
| 65 | 246 | `text` | Biểu Phí |
| 66 | 247 | `text` | Hỏi Đáp |
| 67 | 253 | `text` | Giới Thiệu |
| 68 | 255 | `text` | Gặp Gỡ James |
| 69 | 256 | `text` | Gặp Gỡ Huyền |
| 70 | 257 | `text` | Câu Chuyện Của Chúng Tôi |
| 71 | 258 | `text` | Vì Sao Việt Nam |
| 72 | 264 | `text` | Liên Hệ |
| 73 | 266 | `text` | team@heritage-union.com |
| 74 | 267 | `text` | Trang liên hệ |
| 75 | 268 | `text` | Trở Thành Ứng Viên |
| 76 | 277 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/terms.html`: 62 strings (legal / consent content: grammar & spelling only)

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 11 | `text` | Điều Khoản Sử Dụng — Heritage Union |
| 2 | 12 | `meta:description` | Các điều khoản quản lý việc sử dụng trang web và dịch vụ của Heritage Union. |
| 3 | 40 | `text` | Chuyển đến nội dung chính |
| 4 | 42 | `text` | BẢN NHÁP — đang chờ luật sư xem xét |
| 5 | 51 | `attr:aria-label` | Heritage Union — về trang chủ |
| 6 | 58 | `text` | HERITAGE UNION |
| 7 | 69 | `text` | Quy Trình |
| 8 | 70 | `text` | Dịch Vụ |
| 9 | 71 | `text` | Thành Công |
| 10 | 73 | `text` | Tài Nguyên |
| 11 | 78 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 12 | 84 | `text` | Giới Thiệu |
| 13 | 89 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 14 | 95 | `text` | Hỏi Đáp |
| 15 | 96 | `text` | Liên Hệ |
| 16 | 100 | `attr:aria-label` | Ngôn ngữ |
| 17 | 101 | `text` | EN \| VI |
| 18 | 105 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Đặt lịch tư vấn |
| 19 | 107 | `attr:aria-label` | Mở menu điều hướng |
| 20 | 121 | `attr:aria-label` | Điều hướng trên di động |
| 21 | 123 | `attr:aria-label` | Ngôn ngữ |
| 22 | 124 | `text` | EN \| VI |
| 23 | 128 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 24 | 149 | `text` | Pháp Lý |
| 25 | 150 | `text` | Điều Khoản Sử Dụng |
| 26 | 151 | `text` | Cập nhật lần cuối: Ngày 14 tháng 10 năm 2026. |
| 27 | 154 | `text` | 1. Chấp nhận các điều khoản này |
| 28 | 155 | `text` | Bằng việc sử dụng heritage-union.com hoặc bất kỳ dịch vụ nào của Heritage Union, bạn đồng ý với các Điều Khoản Sử Dụng này. Nếu bạn không đồng ý, vui lòng không sử dụng trang web này. |
| 29 | 159 | `text` | 2. Ai có thể sử dụng trang web này |
| 30 | 160 | `text` | Trang web và dịch vụ của chúng tôi chỉ dành cho những người từ 18 tuổi trở lên. Bằng việc đăng ký hoặc gửi bất kỳ biểu mẫu nào trên trang web này, bạn xác nhận mình đáp ứng yêu cầu này. |
| 31 | 164 | `text` | 3. Heritage Union làm gì |
| 32 | 165 | `text` | Heritage Union là một dịch vụ giới thiệu và tư vấn. Chúng tôi tạo điều kiện cho các buổi giới thiệu giữa khách hàng và ứng viên, những người đã tự nguyện đăng ký hoặc tương tác với chúng tôi. Chúng tôi không đảm bảo bất kỳ kết quả, mối quan hệ hay thành quả cụ thể nào từ việc sử dụng dịch vụ của chúng tôi. |
| 33 | 169 | `text` | 4. Heritage Union không phải là một bên trong bất kỳ mối quan hệ nào |
| 34 | 170 | `text` | Heritage Union không phải là một bên, và không chịu trách nhiệm, đối với bất kỳ mối quan hệ nào phát triển giữa khách hàng và ứng viên sau một buổi giới thiệu. Những gì xảy ra sau buổi giới thiệu là giữa hai cá nhân liên quan. Chúng tôi không chịu trách nhiệm về hành vi, phát ngôn, hay hành động của bất kỳ khách hàng hay ứng viên nào. |
| 35 | 174 | `text` | 5. Không đảm bảo kết quả |
| 36 | 175 | `text` | Chúng tôi không hứa hẹn hay đảm bảo về số lượng, chất lượng, hay kết quả của bất kỳ buổi giới thiệu nào. Dịch vụ của chúng tôi là một quy trình chu đáo — không phải là sự đảm bảo về một sự phù hợp, mối quan hệ, hay hôn nhân. |
| 37 | 179 | `text` | 6. Thay đổi các điều khoản này |
| 38 | 180 | `text` | Chúng tôi có thể cập nhật các điều khoản này theo thời gian. Việc tiếp tục sử dụng trang web sau khi các thay đổi được đăng tải đồng nghĩa với việc chấp nhận các điều khoản đã cập nhật. |
| 39 | 184 | `text` | 7. Liên hệ |
| 40 | 185 | `text` | Mọi câu hỏi về các điều khoản này có thể gửi đến team@heritage-union.com. |
| 41 | 201 | `attr:aria-label` | Heritage Union — về trang chủ |
| 42 | 205 | `text` | HERITAGE UNION |
| 43 | 208 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 44 | 211 | `text` | Đặt lịch tư vấn miễn phí |
| 45 | 216 | `text` | Khám Phá |
| 46 | 218 | `text` | Quy Trình |
| 47 | 219 | `text` | Dịch Vụ |
| 48 | 220 | `text` | Thành Công |
| 49 | 221 | `text` | Hỏi Huyền |
| 50 | 222 | `text` | Kiến Thức & Tài Nguyên |
| 51 | 223 | `text` | Biểu Phí |
| 52 | 224 | `text` | Hỏi Đáp |
| 53 | 230 | `text` | Giới Thiệu |
| 54 | 232 | `text` | Gặp Gỡ James |
| 55 | 233 | `text` | Gặp Gỡ Huyền |
| 56 | 234 | `text` | Câu Chuyện Của Chúng Tôi |
| 57 | 235 | `text` | Vì Sao Việt Nam |
| 58 | 241 | `text` | Liên Hệ |
| 59 | 243 | `text` | team@heritage-union.com |
| 60 | 244 | `text` | Trang liên hệ |
| 61 | 245 | `text` | Trở Thành Ứng Viên |
| 62 | 254 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `vi/your-rights.html`: 66 strings (legal / consent content: grammar & spelling only)

| # | Line | Kind | Current Vietnamese |
|---|---|---|---|
| 1 | 11 | `text` | An Toàn Và Quyền Lợi Của Bạn — Heritage Union |
| 2 | 12 | `meta:description` | Thông tin dành cho ứng viên về quyền lợi, sự an toàn và lựa chọn của bạn khi đăng ký với Heritage Union. |
| 3 | 40 | `text` | Chuyển đến nội dung chính |
| 4 | 42 | `text` | BẢN NHÁP — đang chờ luật sư xem xét |
| 5 | 51 | `attr:aria-label` | Heritage Union — về trang chủ |
| 6 | 58 | `text` | HERITAGE UNION |
| 7 | 69 | `text` | Quy Trình |
| 8 | 70 | `text` | Dịch Vụ |
| 9 | 71 | `text` | Thành Công |
| 10 | 73 | `text` | Tài Nguyên |
| 11 | 78 | `text` | Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí |
| 12 | 84 | `text` | Giới Thiệu |
| 13 | 89 | `text` | Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam |
| 14 | 95 | `text` | Hỏi Đáp |
| 15 | 96 | `text` | Liên Hệ |
| 16 | 100 | `attr:aria-label` | Ngôn ngữ |
| 17 | 101 | `text` | EN \| VI |
| 18 | 105 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Trở thành ứng viên |
| 19 | 107 | `attr:aria-label` | Mở menu điều hướng |
| 20 | 121 | `attr:aria-label` | Điều hướng trên di động |
| 21 | 123 | `attr:aria-label` | Ngôn ngữ |
| 22 | 124 | `text` | EN \| VI |
| 23 | 128 | `text` | Dành cho phụ nữ Việt Nam: Đăng ký miễn phí Quy Trình Dịch Vụ Thành Công Hỏi Huyền Kiến Thức & Tài Nguyên Biểu Phí Gặp Gỡ James Gặp Gỡ Huyền Câu Chuyện Của Chúng Tôi Vì Sao Việt Nam Hỏi Đáp Liên Hệ |
| 24 | 150 | `attr:aria-label` | An toàn và quyền lợi của bạn — mở đầu |
| 25 | 152 | `text` | DÀNH CHO ỨNG VIÊN |
| 26 | 153 | `text` | An toàn của bạn. Quyền lợi của bạn. |
| 27 | 154 | `text` | Trang này giải thích rõ ràng những gì bạn cần biết trước khi đăng ký với Heritage Union — và trong suốt quá trình sau đó. Không có gì ở đây yêu cầu bạn phải trả tiền, và không có gì bắt buộc bạn phải tiếp tục nếu bạn không muốn. |
| 28 | 158 | `text` | Trở thành ứng viên |
| 29 | 170 | `text` | Đăng ký là miễn phí và hoàn toàn tự nguyện |
| 30 | 171 | `text` | Việc đăng ký với Heritage Union không bao giờ tốn phí. Bạn không bao giờ cần trả bất kỳ khoản tiền nào cho chúng tôi, cho James, hay cho Huyền, ở bất kỳ giai đoạn nào. Nếu có ai yêu cầu bạn gửi tiền nhân danh Heritage Union, đó không phải là chúng tôi — vui lòng báo ngay cho chúng tôi (xem phần "Báo cáo một vấn đề" bên dưới). |
| 31 | 175 | `text` | Bạn có thể rút đăng ký bất cứ lúc nào |
| 32 | 176 | `text` | Bạn có quyền rút đăng ký bất cứ lúc nào, vì bất kỳ lý do gì, không cần giải thích. Việc này không ảnh hưởng gì đến bạn. Sử dụng trang rút đăng ký của chúng tôi, và thông tin của bạn sẽ được xóa trong vòng 30 ngày. |
| 33 | 180 | `text` | Trước bất kỳ buổi giới thiệu nào, bạn sẽ nhận được thông tin đầy đủ về người đàn ông đó |
| 34 | 181 | `text` | Trước khi đồng ý với bất kỳ buổi giới thiệu nào, bạn sẽ nhận được bản khai lý lịch của người đàn ông đó bằng tiếng Việt, bao gồm thông tin về lý lịch tư pháp (hình sự) và tình trạng hôn nhân trước đây của anh ấy, cùng với thông tin chính thức về quyền lợi của bạn. Bạn có toàn quyền quyết định có tiếp tục hay không, dựa trên thông tin đó. |
| 35 | 185 | `text` | Bạn quyết định khách hàng có được xem hồ sơ của bạn hay không |
| 36 | 186 | `text` | Khách hàng chỉ được xem một hồ sơ ngắn về bạn (tên, tuổi, thành phố/tỉnh và những gì bạn viết về bản thân) nếu bạn đánh dấu vào ô đồng ý riêng, không bắt buộc lúc đăng ký. Họ không bao giờ được biết họ, ngày sinh hay thông tin liên lạc của bạn. Bạn có thể thay đổi ý định bất cứ lúc nào, và chúng tôi sẽ ngừng cho xem hồ sơ ngay lập tức. |
| 37 | 190 | `text` | Thông tin liên hệ của bạn chỉ được chia sẻ khi có sự đồng ý bằng văn bản của bạn |
| 38 | 191 | `text` | Chúng tôi sẽ không bao giờ chia sẻ số Zalo, email, hay bất kỳ thông tin liên hệ nào khác của bạn với một người đàn ông cho đến khi bạn đồng ý bằng văn bản để làm vậy, sau khi đã xem thông tin về anh ấy. |
| 39 | 195 | `text` | Bạn không bao giờ nợ ai bất cứ điều gì |
| 40 | 196 | `text` | Là một ứng viên, bạn không bao giờ phải trả bất kỳ khoản phí nào cho Heritage Union, bất kể điều gì xảy ra trong hoặc sau một buổi giới thiệu. Mọi khoản phí của dịch vụ chúng tôi đều do khách hàng (người đàn ông) chi trả. |
| 41 | 200 | `text` | Báo cáo một vấn đề |
| 42 | 201 | `text` | Nếu bạn gặp bất kỳ điều gì khiến bạn lo ngại — một yêu cầu về tiền bạc, hành vi không phù hợp, hoặc bất cứ điều gì khác không đúng như những gì trang này mô tả — vui lòng liên hệ với chúng tôi ngay tại team@heritage-union.com. Mọi báo cáo đều được giữ kín. |
| 43 | 205 | `text` | Tìm hiểu thêm |
| 44 | 206 | `text` | Xem Chính Sách Bảo Mật của chúng tôi để biết cách chúng tôi xử lý thông tin của bạn, hoặc đăng ký ngay nếu bạn đã sẵn sàng. |
| 45 | 223 | `attr:aria-label` | Heritage Union — về trang chủ |
| 46 | 227 | `text` | HERITAGE UNION |
| 47 | 230 | `text` | Một công ty tư vấn giới thiệu và quan hệ quốc tế cao cấp. Một công ty tư vấn nghiêm túc dành cho những người đàn ông nghiêm túc. Khách hàng được tiếp nhận qua đơn đăng ký. |
| 48 | 233 | `text` | Trở thành ứng viên |
| 49 | 238 | `text` | Khám Phá |
| 50 | 240 | `text` | Quy Trình |
| 51 | 241 | `text` | Dịch Vụ |
| 52 | 242 | `text` | Thành Công |
| 53 | 243 | `text` | Hỏi Huyền |
| 54 | 244 | `text` | Kiến Thức & Tài Nguyên |
| 55 | 245 | `text` | Biểu Phí |
| 56 | 246 | `text` | Hỏi Đáp |
| 57 | 252 | `text` | Giới Thiệu |
| 58 | 254 | `text` | Gặp Gỡ James |
| 59 | 255 | `text` | Gặp Gỡ Huyền |
| 60 | 256 | `text` | Câu Chuyện Của Chúng Tôi |
| 61 | 257 | `text` | Vì Sao Việt Nam |
| 62 | 263 | `text` | Liên Hệ |
| 63 | 265 | `text` | team@heritage-union.com |
| 64 | 266 | `text` | Trang liên hệ |
| 65 | 267 | `text` | Trở Thành Ứng Viên |
| 66 | 276 | `text` | © 2026 Heritage Union · Riêng Tư & Bảo Mật Quyền Riêng Tư · Điều Khoản · Quyền Của Bạn Thiết kế web bởi GLO |

### `assets/js/main.js`: 14 strings (form validation / status messages)

| # | Line | Current Vietnamese |
|---|---|---|
| 1 | 199 | Đã có lỗi xảy ra. Vui lòng thử lại. |
| 2 | 272 | Vui lòng điền đầy đủ thông tin. |
| 3 | 276 | Vui lòng đồng ý để được liên hệ. |
| 4 | 281 | Đang gửi... |
| 5 | 337 | Vui lòng điền đầy đủ các trường bắt buộc. |
| 6 | 341 | Vui lòng xác nhận bạn từ 18 tuổi trở lên. |
| 7 | 345 | Vui lòng đồng ý với cả hai điều khoản để tiếp tục. |
| 8 | 351 | Vui lòng hoàn thành xác minh để tiếp tục. |
| 9 | 356 | Đang gửi... |
| 10 | 385 | /vi/thank-you-registration |
| 11 | 417 | Vui lòng nhập số Zalo hoặc email bạn đã đăng ký. |
| 12 | 423 | Đang gửi... |
| 13 | 433 | Đã có lỗi xảy ra. Vui lòng thử lại. |
| 14 | 443 | Đã có lỗi xảy ra. Vui lòng thử lại. |

### `netlify/functions/candidate-register.js`: 5 strings (Vietnamese auto-reply email)

| # | Line | Current Vietnamese |
|---|---|---|
| 1 | 286 | Heritage Union — Đã nhận được đăng ký của bạn |
| 2 | 289 | Cảm ơn bạn đã đăng ký với Heritage Union. Chúng tôi đã nhận được thông tin của bạn. |
| 3 | 290 | Bước tiếp theo: chúng tôi sẽ gửi một tin nhắn ngắn để bạn xác nhận thông tin liên hệ và hoàn thiện hồ sơ của mình. Việc đăng ký là hoàn toàn miễn phí và tự nguyện — bạn có thể rút lại bất cứ lúc nào. |
| 4 | 291 | Nếu bạn muốn rút đăng ký, vui lòng truy cập  heritage-union.com/vi/withdraw . |
| 5 | 292 | Trân trọng, Đội ngũ Heritage Union |
