// Heritage Union — Consultation Scheduler
// On-brand panel: dark context rail + embedded Calendly inline widget (themed to the palette).
function Scheduler() {
  const [vw, setVw] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  React.useEffect(() => { const f = () => setVw(window.innerWidth); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const mob = vw < 820;

  // Calendly themed to brand tokens: primary = burgundy-800, text = ink, bg = white.
  const calUrl = 'https://calendly.com/james-heritage-union/30min'
    + '?hide_event_type_details=1&hide_gdpr_banner=1'
    + '&primary_color=4a2023&text_color=16202e&background_color=ffffff';

  const ref = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false;
    const init = () => {
      if (cancelled || !window.Calendly || !ref.current) return;
      ref.current.innerHTML = '';
      window.Calendly.initInlineWidget({ url: calUrl, parentElement: ref.current });
    };
    if (window.Calendly) { init(); return () => { cancelled = true; }; }
    let s = document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]');
    if (!s) { s = document.createElement('script'); s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true; document.body.appendChild(s); }
    s.addEventListener('load', init);
    return () => { cancelled = true; s && s.removeEventListener('load', init); };
  }, []);

  return (
    <div style={panelWrap}>
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '0.82fr 1.18fr', minHeight: mob ? 0 : 700 }}>
        {/* Context rail */}
        <div style={{ background: 'var(--ink-800)', color: 'var(--cream-50)', padding: mob ? '36px 26px' : '48px 42px', display: 'flex', flexDirection: 'column' }}>
          <div className="hu-eyebrow" style={{ color: 'var(--gold-400)', marginBottom: 18 }}>Free initial consultation</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--cream-50)', fontSize: 32, lineHeight: 1.1, margin: '0 0 10px' }}>
            A private conversation with the founder.
          </h3>
          <hr style={{ width: 48, height: 1, border: 0, background: 'var(--gold-500)', margin: '8px 0 24px' }} />
          <p style={{ color: 'var(--ink-200)', fontSize: 15.5, lineHeight: 1.7, margin: '0 0 28px' }}>
            Thirty unhurried minutes with James to understand your hopes and answer your questions — discreet, considered, and entirely without obligation.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Clock', '30 minutes, by private video call'],
              ['Lock', 'Confidential from the first word'],
              ['UserRound', 'Directly with our founder, James'],
              ['HeartHandshake', 'No obligation, no pressure'],
            ].map(([ic, label]) => (
              <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <SIcon name={ic} />
                <span style={{ fontSize: 15, color: 'var(--cream-50)' }}>{label}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: mob ? 28 : 'auto', paddingTop: 28 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--gold-300)', lineHeight: 1.4 }}>
              “Selective, screened and guided every step of the way.”
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-200)' }}>
              Prefer to write first? <a href="mailto:team@heritage-union.com" style={{ color: 'var(--gold-300)', borderBottom: '1px solid rgba(216,192,136,0.4)' }}>team@heritage-union.com</a>
            </div>
          </div>
        </div>

        {/* Calendly embed */}
        <div style={{ background: 'var(--white)', padding: mob ? '4px' : '6px' }}>
          <div ref={ref} className="calendly-inline-widget" data-url={calUrl} style={{ minWidth: 320, width: '100%', height: mob ? 1040 : 700 }}></div>
        </div>
      </div>
    </div>
  );
}

const panelWrap = { borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--cream-200)', background: 'var(--white)' };

function SIcon({ name }) {
  const data = window.lucide && window.lucide[name];
  if (!data) return null;
  const kids = Array.isArray(data) ? data : (data.children || []);
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      {kids.map(([t, a], i) => React.createElement(t, { key: i, ...a }))}
    </svg>
  );
}

Object.assign(window, { Scheduler });
