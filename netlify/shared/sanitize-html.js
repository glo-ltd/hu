// Keeps only simple formatting in the profile summary James writes:
// paragraphs, line breaks, bold, italic and lists, with no attributes.
// Everything else is dropped or escaped.
const ALLOWED = { p: 'p', br: 'br', strong: 'strong', b: 'strong', em: 'em', i: 'em', ul: 'ul', ol: 'ol', li: 'li', div: 'p' };

function sanitizeHtml(input, maxLen) {
  let s = String(input || '').slice(0, maxLen || 20000);
  s = s.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|iframe|object|embed|template)[\s\S]*?<\/\1\s*>/gi, '');
  let out = '';
  const re = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    out += s.slice(last, m.index).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tag = ALLOWED[m[1].toLowerCase()];
    if (tag) out += tag === 'br' ? '<br>' : (m[0][1] === '/' ? '</' + tag + '>' : '<' + tag + '>');
    last = re.lastIndex;
  }
  out += s.slice(last).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return out.replace(/(<p>\s*(<br>)?\s*<\/p>)+/g, '').trim();
}

function textOf(html) {
  return String(html || '').replace(/<br>/g, '\n').replace(/<\/(p|li)>/g, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

module.exports = { sanitizeHtml, textOf };
