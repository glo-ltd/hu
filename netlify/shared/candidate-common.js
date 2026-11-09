// Shared helpers for the candidate registration and withdraw functions.
// Lives outside netlify/functions so Netlify doesn't treat it as a function;
// it is bundled in by the require() calls in those functions.

// Turn any reasonable way of writing a Vietnamese mobile number into one
// canonical form: 0 followed by 9 digits (e.g. "+84 90-123 4567" -> "0901234567").
// Used both when saving a registration and when matching a withdrawal, so the
// two always compare like with like.
function normaliseZalo(raw) {
  var digits = String(raw || '').replace(/[\s\-.()]/g, '');
  if (digits.indexOf('+84') === 0) digits = '0' + digits.slice(3);
  else if (/^84\d{9}$/.test(digits)) digits = '0' + digits.slice(2);
  return digits;
}

var ZALO_PATTERN = /^0(3|5|7|8|9)\d{8}$/;

function isValidZalo(raw) {
  return ZALO_PATTERN.test(normaliseZalo(raw));
}

// Registrations only count as open when the flag is on AND the human check
// is fully configured. Without both Turnstile keys the form could never be
// submitted, so we keep showing the waitlist instead of a form that's stuck.
function signupsOpen() {
  return (
    process.env.CANDIDATE_SIGNUPS_OPEN === 'true' &&
    !!process.env.TURNSTILE_SITE_KEY &&
    !!process.env.TURNSTILE_SECRET
  );
}

var MESSAGES = {
  method: {
    en: 'Method not allowed.',
    vi: 'Yêu cầu không hợp lệ.',
  },
  invalid: {
    en: 'Invalid request. Please reload the page and try again.',
    vi: 'Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại.',
  },
  notConfigured: {
    en: 'This form is not available right now. Please try again later.',
    vi: 'Biểu mẫu tạm thời chưa sẵn sàng. Vui lòng quay lại sau.',
  },
  saveFailed: {
    en: 'We could not save your details right now. Please try again shortly.',
    vi: 'Hiện chúng tôi chưa lưu được thông tin của bạn. Vui lòng thử lại sau ít phút.',
  },
  rateLimited: {
    en: 'There have been a lot of sign-ups from your connection in the last hour. Please try again a little later.',
    vi: 'Có nhiều lượt đăng ký từ cùng kết nối mạng của bạn trong một giờ qua. Vui lòng thử lại sau ít phút.',
  },
  waitlistRequired: {
    en: 'Please complete all fields.',
    vi: 'Vui lòng điền đầy đủ thông tin.',
  },
  waitlistConsent: {
    en: 'Please confirm you agree to be contacted.',
    vi: 'Vui lòng xác nhận bạn đồng ý để chúng tôi liên hệ.',
  },
  required: {
    en: 'Please complete all required fields.',
    vi: 'Vui lòng điền đầy đủ các mục bắt buộc.',
  },
  language: {
    en: 'Please select a language.',
    vi: 'Vui lòng chọn ngôn ngữ.',
  },
  province: {
    en: 'Please select your city or province from the list.',
    vi: 'Vui lòng chọn thành phố hoặc tỉnh của bạn trong danh sách.',
  },
  phone: {
    en: 'Please check your Zalo number. It should be a Vietnamese mobile number, for example 0901234567.',
    vi: 'Vui lòng kiểm tra lại số Zalo. Số cần là số di động Việt Nam, ví dụ: 0901234567.',
  },
  email: {
    en: 'Please check your email address, or leave it blank.',
    vi: 'Vui lòng kiểm tra lại địa chỉ email, hoặc để trống mục này.',
  },
  ageConfirm: {
    en: 'Please confirm you are 18 or over.',
    vi: 'Vui lòng xác nhận bạn từ 18 tuổi trở lên.',
  },
  age: {
    en: 'You must be 18 or over to register.',
    vi: 'Bạn cần từ 18 tuổi trở lên để đăng ký.',
  },
  consents: {
    en: 'Please tick both required consent boxes to continue.',
    vi: 'Vui lòng đánh dấu cả hai ô đồng ý bắt buộc để tiếp tục.',
  },
  human: {
    en: 'We could not complete the verification. Please try again.',
    vi: 'Chưa hoàn tất được bước xác minh. Vui lòng thử lại.',
  },
  withdrawContact: {
    en: 'Please enter the Zalo number or email you registered with.',
    vi: 'Vui lòng nhập số Zalo hoặc email bạn đã đăng ký.',
  },

  // ---- Private profile link (/vi/ho-so). Vietnamese first: she sees these.
  linkInvalid: {
    en: 'This link can no longer be used. To get a new private link, reply to Heritage Union on Zalo or use our contact page.',
    vi: 'Đường link này không còn dùng được nữa. Để nhận đường link riêng mới, bạn chỉ cần nhắn lại cho Heritage Union qua Zalo, hoặc liên hệ với chúng tôi qua trang Liên hệ.',
  },
  linkExpired: {
    en: 'This link has expired (links last 60 days). To get a new one, reply to Heritage Union on Zalo or use our contact page.',
    vi: 'Đường link này đã hết hạn (mỗi đường link dùng được trong 60 ngày). Để nhận đường link mới, bạn chỉ cần nhắn lại cho Heritage Union qua Zalo, hoặc liên hệ với chúng tôi qua trang Liên hệ.',
  },
  profileRateLimited: {
    en: 'Too many requests from this link in the last hour. Please wait a little and try again.',
    vi: 'Có quá nhiều lượt gửi từ đường link này trong một giờ qua. Bạn vui lòng đợi một lát rồi thử lại nhé.',
  },
  answerInvalid: {
    en: 'One of your answers is not valid. Please check it and try again.',
    vi: 'Có một câu trả lời chưa hợp lệ. Bạn vui lòng kiểm tra lại nhé.',
  },
  answerTooLong: {
    en: 'One of your answers is too long. Please shorten it.',
    vi: 'Có một câu trả lời quá dài. Bạn vui lòng rút gọn lại nhé.',
  },
  answerRequired: {
    en: 'Please answer every required question before sending.',
    vi: 'Bạn vui lòng trả lời đủ các câu bắt buộc trước khi gửi nhé.',
  },
  confirmTrue: {
    en: 'Please confirm that the information is true and written by you.',
    vi: 'Bạn vui lòng đánh dấu ô xác nhận thông tin là đúng sự thật và do chính bạn viết.',
  },
  tooManyPhotos: {
    en: 'You can add up to 3 photos.',
    vi: 'Bạn có thể thêm tối đa 3 ảnh.',
  },
  photoInvalid: {
    en: 'This photo could not be saved. Please try again.',
    vi: 'Chưa lưu được ảnh này. Bạn vui lòng thử lại nhé.',
  },
  profileSaveFailed: {
    en: 'We could not save just now. Your answers are still here; please try again.',
    vi: 'Chưa lưu được. Câu trả lời của bạn vẫn còn nguyên, bạn vui lòng thử lại nhé.',
  },
};

function pickLang(data) {
  return data && data.lang === 'vi' ? 'vi' : 'en';
}

function msg(key, lang) {
  var entry = MESSAGES[key] || MESSAGES.invalid;
  return entry[lang] || entry.en;
}

module.exports = { normaliseZalo, isValidZalo, signupsOpen, pickLang, msg };
