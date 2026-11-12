// Shared look for every Heritage Union email: cream page, white card,
// maroon headings, gold rule, Georgia (web fonts are unreliable in email).
// Every email gets a plain-text version and, for clients and women, a
// "Report a concern" link. Client emails are signed by James.
//
// blocks: an array of
//   'plain paragraph'                       (escaped)
//   { h: 'Heading' }
//   { button: { label, href } }
//   { list: ['item', ...] }
//   { box: { title, lines: ['...'] } }      (a quiet panel, e.g. payment details)
//   { pre: 'multi-line text' }              (keeps line breaks)
//   { small: 'small print' }
const { escapeHtml } = require('../request-utils');
const C = require('../client-config');

const SITE = 'https://heritage-union.com';
const COLORS = { cream: '#F2EADA', card: '#FFFFFF', maroon: '#5E2A2E', gold: '#C2A35A', ink: '#16202E', muted: '#3A4A60', line: '#DDCFB2' };

const STRINGS = {
  en: { concern: 'Report a concern', concernText: 'If anything ever worries you, tell us in confidence:', footer: 'Heritage Union · heritage-union.com', sign: C.SIGNATURE },
  vi: { concern: 'Báo cáo một vấn đề', concernText: 'Nếu có bất cứ điều gì khiến bạn lo ngại, hãy báo cho chúng tôi, mọi thông tin đều được giữ kín:', footer: 'Heritage Union · heritage-union.com', sign: ['James', 'Nhà sáng lập, Heritage Union'] },
};

function render({ subject, preheader, blocks, lang, audience }) {
  const L = STRINGS[lang === 'vi' ? 'vi' : 'en'];
  const team = audience === 'team';
  const concernHref = SITE + (lang === 'vi' ? '/vi/contact?concern=1' : '/contact?concern=1');
  const font = "Georgia, 'Times New Roman', serif";
  const p = (inner) => '<p style="margin:0 0 16px;font-family:' + font + ';font-size:16px;line-height:1.6;color:' + COLORS.ink + ';">' + inner + '</p>';
  let html = '';
  let text = '';

  for (const b of blocks) {
    if (typeof b === 'string') {
      html += p(escapeHtml(b));
      text += b + '\n\n';
    } else if (b.h) {
      html += '<h2 style="margin:24px 0 12px;font-family:' + font + ';font-size:21px;font-weight:normal;color:' + COLORS.maroon + ';">' + escapeHtml(b.h) + '</h2>';
      text += b.h.toUpperCase() + '\n\n';
    } else if (b.button) {
      html += '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;"><tr><td style="background:' + COLORS.maroon + ';border-radius:2px;">' +
        '<a href="' + escapeHtml(b.button.href) + '" style="display:inline-block;padding:13px 26px;font-family:' + font + ';font-size:16px;color:#FBF7EF;text-decoration:none;">' + escapeHtml(b.button.label) + '</a></td></tr></table>';
      text += b.button.label + ': ' + b.button.href + '\n\n';
    } else if (b.list) {
      html += '<ul style="margin:0 0 16px;padding-left:20px;font-family:' + font + ';font-size:16px;line-height:1.6;color:' + COLORS.ink + ';">' + b.list.map((i) => '<li style="margin:0 0 6px;">' + escapeHtml(i) + '</li>').join('') + '</ul>';
      text += b.list.map((i) => '- ' + i).join('\n') + '\n\n';
    } else if (b.box) {
      html += '<div style="margin:0 0 18px;padding:16px 18px;background:#FBF7EF;border:1px solid ' + COLORS.line + ';border-radius:4px;">' +
        (b.box.title ? '<p style="margin:0 0 8px;font-family:' + font + ';font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#6B5A28;">' + escapeHtml(b.box.title) + '</p>' : '') +
        b.box.lines.map((l) => '<p style="margin:0 0 4px;font-family:' + font + ';font-size:15px;line-height:1.5;color:' + COLORS.ink + ';">' + escapeHtml(l) + '</p>').join('') + '</div>';
      text += (b.box.title ? b.box.title + '\n' : '') + b.box.lines.join('\n') + '\n\n';
    } else if (b.pre) {
      html += p(escapeHtml(b.pre).replace(/\n/g, '<br>'));
      text += b.pre + '\n\n';
    } else if (b.small) {
      html += '<p style="margin:0 0 12px;font-family:' + font + ';font-size:13px;line-height:1.5;color:' + COLORS.muted + ';">' + escapeHtml(b.small) + '</p>';
      text += b.small + '\n\n';
    }
  }

  if (!team) {
    html += p(escapeHtml(L.sign[0]) + '<br><span style="color:' + COLORS.muted + ';">' + escapeHtml(L.sign[1]) + '</span>');
    text += L.sign.join('\n') + '\n\n';
  }
  let footer = '';
  if (!team) {
    footer = '<p style="margin:0 0 6px;font-family:' + font + ';font-size:13px;color:' + COLORS.muted + ';">' + escapeHtml(L.concernText) +
      ' <a href="' + concernHref + '" style="color:' + COLORS.maroon + ';">' + escapeHtml(L.concern) + '</a></p>';
    text += '--\n' + L.concernText + ' ' + concernHref + '\n';
  }
  footer += '<p style="margin:0;font-family:' + font + ';font-size:12px;color:' + COLORS.muted + ';">' + escapeHtml(L.footer) + '</p>';
  text += L.footer + '\n';

  const doc = '<!DOCTYPE html><html lang="' + (lang === 'vi' ? 'vi' : 'en') + '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + escapeHtml(subject) + '</title></head><body style="margin:0;padding:0;background:' + COLORS.cream + ';">' +
    (preheader ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' + escapeHtml(preheader) + '</div>' : '') +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + COLORS.cream + ';"><tr><td align="center" style="padding:28px 12px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">' +
    '<tr><td style="padding:0 4px 16px;font-family:' + font + ';font-size:15px;letter-spacing:0.16em;color:' + COLORS.maroon + ';">HERITAGE UNION</td></tr>' +
    '<tr><td style="background:' + COLORS.card + ';border:1px solid ' + COLORS.line + ';border-top:3px solid ' + COLORS.gold + ';border-radius:4px;padding:28px 26px 12px;">' + html + '</td></tr>' +
    '<tr><td style="padding:18px 4px 0;">' + footer + '</td></tr>' +
    '</table></td></tr></table></body></html>';
  return { subject, html: doc, text: text.trim() + '\n' };
}

module.exports = { render, SITE };
