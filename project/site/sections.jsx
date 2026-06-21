// Heritage Union — Website sections
const HU = () => window.HeritageUnionDesignSystem_8eb14e;

// Viewport hook — drives responsive layout (inline styles can't use media queries)
function useVW() {
  const [w, setW] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  React.useEffect(() => {
    const f = () => setW(window.innerWidth);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return w;
}

function LucideIcon({ name, size = 24, color = 'currentColor', sw = 1.5, style = {} }) {
  const data = window.lucide && window.lucide[name];
  if (!data) return null;
  const kids = Array.isArray(data) ? data : (data.children || []);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {kids.map(([t, a], i) => React.createElement(t, { key: i, ...a }))}
    </svg>
  );
}

const scrollToBook = () => {
  const el = document.getElementById('book');
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 16, behavior: 'smooth' });
};
const goTo = (id, off = 70) => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - off, behavior: 'smooth' }); };

// Shared horizontal rhythm. G = page gutter; EDGE aligns full-bleed split sections
// (hero, Vietnam) to the same content edge as the centered 1280px sections.
const G = 'clamp(24px, 5vw, 40px)';
const EDGE = `max(${G}, calc((100vw - 1280px) / 2))`;

/* ---------------- Nav ---------------- */
function SiteNav() {
  const { Logo, Button } = HU();
  const vw = useVW();
  const mob = vw < 860;
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.pageYOffset > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [['process', 'The Process'], ['vietnam', 'Why Vietnam'], ['story', 'Our Story'], ['faq', 'FAQ']];
  const go = (id) => { setOpen(false); goTo(id); };
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--cream-100)', borderBottom: '1px solid ' + (scrolled || open ? 'var(--cream-300)' : 'transparent'), transition: 'border-color 240ms ease' }}>
      <div style={{ padding: mob ? `14px ${G}` : `16px ${G}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}><Logo variant={mob ? 'mark-only' : 'primary'} height={mob ? 36 : 42} /></a>
        {!mob && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            {links.map(([id, label]) => (
              <a key={id} onClick={() => go(id)} style={{ fontSize: 15, letterSpacing: '0.03em', color: 'var(--ink-700)', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--burgundy-700)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-700)'}>{label}</a>
            ))}
            <Button variant="primary" size="sm" onClick={scrollToBook}>Book a consultation</Button>
          </nav>
        )}
        {mob && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button variant="primary" size="sm" onClick={scrollToBook}>Book a consultation</Button>
            <button onClick={() => setOpen(!open)} aria-label="Menu" style={{ background: 'none', border: 0, padding: 6, cursor: 'pointer', color: 'var(--burgundy-700)' }}>
              <LucideIcon name={open ? 'X' : 'Menu'} size={26} color="var(--burgundy-700)" />
            </button>
          </div>
        )}
        </div>
      </div>
      {mob && open && (
        <div style={{ padding: `8px ${G} 22px`, borderTop: '1px solid var(--cream-200)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 1280, margin: '0 auto' }}>
            {links.map(([id, label]) => (
              <a key={id} onClick={() => go(id)} style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--burgundy-700)', cursor: 'pointer', padding: '8px 0' }}>{label}</a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------------- Hero ---------------- */
function SiteHero() {
  const { EyebrowLabel, Button } = HU();
  const vw = useVW();
  const mob = vw < 900;
  return (
    <section style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', minHeight: mob ? 0 : 660, background: 'var(--cream-100)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: mob ? `48px ${G} 40px` : `48px clamp(40px, 4vw, 72px) 48px ${EDGE}`, order: mob ? 2 : 1 }}>
        <EyebrowLabel items={['Companionship', 'Marriage', 'Family']} style={{ marginBottom: mob ? 18 : 26 }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-strong)', fontSize: 'clamp(40px, 9vw, 78px)', lineHeight: 1.06, letterSpacing: '-0.015em', margin: '0 0 24px', maxWidth: '13ch' }}>
          A union built to last generations.
        </h1>
        <p style={{ fontSize: 'clamp(17px, 2.4vw, 20px)', lineHeight: 1.65, color: 'var(--ink-700)', fontWeight: 300, maxWidth: '46ch', margin: '0 0 34px' }}>
          For the man entering a meaningful chapter who wants more than company — a partner, a family, a legacy worth building with care.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? 20 : 28, flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" onClick={scrollToBook} style={mob ? { width: '100%' } : {}}>Schedule a free consultation</Button>
          <a onClick={() => goTo('process')} style={{ fontSize: 16, color: 'var(--burgundy-700)', borderBottom: '1px solid var(--burgundy-700)', paddingBottom: 2, cursor: 'pointer' }}>How it works</a>
        </div>
        <div style={{ display: 'flex', gap: mob ? 22 : 30, marginTop: mob ? 36 : 48, flexWrap: 'wrap' }}>
          {[['Trust-led', 'process, not access'], ['Selective', 'by application only'], ['Discreet', 'from first word']].map(([a, b]) => (
            <div key={a}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--burgundy-700)' }}>{a}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 2 }}>{b}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ order: mob ? 1 : 2, minHeight: mob ? 320 : 'auto', backgroundImage: 'url(assets/images/lifestyle-04.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 20%' }}></div>
    </section>
  );
}

/* ---------------- Trust / why apps fail ---------------- */
function TrustSection() {
  const { EyebrowLabel } = HU();
  const vw = useVW();
  const cols = vw < 680 ? 1 : vw < 1040 ? 2 : 4;
  const points = [
    ['ShieldCheck', 'Trust before introductions', 'Every client and candidate is screened. You will always know the process is handled with integrity and care.'],
    ['EyeOff', 'Discretion as standard', 'Calm, mature and confidential from the first conversation. Nothing about this is loud or sales-driven.'],
    ['Globe', 'Cultural understanding', 'A lasting international union asks for more than attraction. We guide communication, expectations and culture.'],
    ['HeartHandshake', 'Built for the long term', 'Companionship, marriage, family and legacy — grounded and real. Never a catalogue, never a transaction.'],
  ];
  return (
    <section style={{ background: 'var(--ink-800)', color: 'var(--cream-50)', padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ maxWidth: 780 }}>
          <EyebrowLabel color="var(--gold-400)" style={{ marginBottom: 18 }}>The market chased scale. We restore trust.</EyebrowLabel>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--cream-50)', fontSize: 'clamp(34px, 6vw, 46px)', lineHeight: 1.05, margin: '0 0 18px' }}>
            A consultancy, not a dating app.
          </h2>
          <p style={{ fontSize: 'clamp(17px, 2.4vw, 19px)', lineHeight: 1.7, color: 'var(--ink-200)', fontWeight: 300, margin: 0 }}>
            Apps offer access, scale and convenience — but strip out trust, screening, guidance and cultural understanding. Heritage Union restores the human layer that serious relationships require.
          </p>
        </div>
        <hr style={{ width: 48, height: 1, border: 0, background: 'var(--gold-500)', margin: 'clamp(36px,5vw,44px) 0 clamp(40px,5vw,52px)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'clamp(32px, 4vw, 44px)' }}>
          {points.map(([ic, t, b]) => (
            <div key={t}>
              <LucideIcon name={ic} size={30} color="var(--gold-400)" sw={1.25} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--cream-50)', fontSize: 24, margin: '18px 0 10px', lineHeight: 1.15 }}>{t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-200)', margin: 0 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Process ---------------- */
function ProcessSection() {
  const { EyebrowLabel, Card } = HU();
  const vw = useVW();
  const cols = vw < 760 ? 1 : 2;
  const steps = [
    ['01', 'A private conversation', 'We begin with a free, discreet consultation to understand your hopes, your circumstances and what a meaningful future looks like for you.'],
    ['02', 'Selective acceptance', 'Not every enquiry becomes a client. We accept those who are serious — which protects the integrity of the process for everyone involved.'],
    ['03', 'Considered introductions', 'With local Vietnamese expertise, we introduce screened candidates chosen for genuine, long-term compatibility. Never a catalogue of profiles.'],
    ['04', 'Guided, every step', 'Cultural guidance and concierge support continue throughout — discreet from first conversation to lasting marriage.'],
  ];
  return (
    <section id="process" style={{ background: 'var(--cream-100)', padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ maxWidth: 720, marginBottom: 'clamp(36px, 5vw, 50px)' }}>
          <EyebrowLabel style={{ marginBottom: 18 }}>The Process</EyebrowLabel>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-strong)', fontSize: 'clamp(32px, 6vw, 46px)', lineHeight: 1.05, margin: '0 0 16px' }}>
            Trust-led, from first conversation to lasting marriage.
          </h2>
          <p style={{ fontSize: 'clamp(17px, 2.4vw, 19px)', lineHeight: 1.7, color: 'var(--ink-700)', fontWeight: 300, margin: 0 }}>
            A serious process for serious intentions — built around the long term, never the transaction.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
          {steps.map(([n, t, b]) => (
            <Card key={n} surface="white" elevation="border" padding="clamp(28px, 4vw, 36px) clamp(26px, 4vw, 38px)" hover>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--gold-600)', lineHeight: 1, marginBottom: 16 }}>{n}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-strong)', fontSize: 'clamp(24px, 3vw, 28px)', margin: '0 0 10px' }}>{t}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-700)', margin: 0 }}>{b}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Vietnam ---------------- */
function VietnamSection() {
  const { EyebrowLabel, Button } = HU();
  const vw = useVW();
  const mob = vw < 900;
  return (
    <section id="vietnam" style={{ background: 'var(--cream-50)', display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', alignItems: 'stretch' }}>
      <div style={{ order: mob ? 1 : 1, minHeight: mob ? 300 : 600, backgroundImage: 'url(assets/images/lifestyle-01.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div style={{ order: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: mob ? `56px ${G}` : `96px ${EDGE} 96px clamp(40px, 4vw, 72px)` }}>
        <EyebrowLabel style={{ marginBottom: 18 }}>Why Vietnam</EyebrowLabel>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-strong)', fontSize: 'clamp(32px, 6vw, 46px)', lineHeight: 1.05, margin: '0 0 18px', maxWidth: '14ch' }}>
          A trusted cultural bridge.
        </h2>
        <hr style={{ width: 48, height: 1, border: 0, background: 'var(--gold-500)', margin: '0 0 28px' }} />
        <p style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--ink-700)', margin: '0 0 18px', maxWidth: '48ch' }}>
          International relationships ask for more than attraction. They ask for cultural awareness, honest communication and carefully managed expectations.
        </p>
        <p style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--ink-700)', margin: '0 0 34px', maxWidth: '48ch' }}>
          Through genuine local Vietnamese expertise, we offer the human layer the technology-led platforms have removed — values of loyalty, family and warmth that endure.
        </p>
        <div><Button variant="secondary" size="md" onClick={scrollToBook}>Talk it through with us</Button></div>
      </div>
    </section>
  );
}

/* ---------------- Founder's note / story ---------------- */
function StorySection() {
  const { EyebrowLabel } = HU();
  return (
    <section id="story" style={{ background: 'var(--cream-100)', padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
        <EyebrowLabel align="center" style={{ marginBottom: 22 }}>Our Story</EyebrowLabel>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(25px, 4.5vw, 34px)', lineHeight: 1.35, color: 'var(--text-strong)', margin: '0 0 28px' }}>
          We built Heritage Union for the man who has reached a meaningful moment and wants something worth keeping — and for the women who deserve to be met with the same respect and seriousness.
        </p>
        <p style={{ fontSize: 'clamp(17px, 2.4vw, 18px)', lineHeight: 1.8, color: 'var(--ink-700)', maxWidth: '62ch', margin: '0 auto 36px' }}>
          Where the rest of the category sells access, we offer permanence: a selective, trust-led path toward marriage, companionship and family. Every introduction is considered. Every client is guided. Nothing is left to chance.
        </p>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--burgundy-700)' }}>Huyen &amp; James</div>
          <div className="hu-eyebrow">Founders · Vietnam &amp; the West</div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Promise quote ---------------- */
function PromiseBand() {
  const { Logo } = HU();
  return (
    <section style={{ background: 'var(--burgundy-700)', color: 'var(--cream-50)', padding: 'clamp(72px, 10vw, 108px) clamp(24px, 5vw, 40px)', textAlign: 'center' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <span style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 34 }}>
          <svg viewBox="0 0 64 44" height={40} style={{ display: 'block', flex: 'none' }} aria-hidden="true">
            <circle cx="24" cy="22" r="18.5" stroke="var(--cream-50)" strokeWidth="2.4" fill="none" />
            <circle cx="40" cy="22" r="18.5" stroke="var(--cream-50)" strokeWidth="2.4" fill="none" />
          </svg>
        </span>
        <blockquote style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(26px, 4.6vw, 40px)', lineHeight: 1.3, color: 'var(--cream-50)', margin: '0 0 30px' }}>
          “We are not selling access to profiles. We sell confidence, guidance and cultural understanding — a credible, premium environment for serious relationship formation.”
        </blockquote>
        <div className="hu-eyebrow" style={{ color: 'var(--gold-300)' }}>The Heritage Union promise</div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials() {
  const { EyebrowLabel, Card } = HU();
  const vw = useVW();
  const cols = vw < 760 ? 1 : 3;
  const items = [
    ['I had grown tired of apps and shallow conversations. Heritage Union treated my hopes seriously and guided me with real care.', 'D.M.', 'United Kingdom'],
    ['What reassured me most was the screening and the discretion. It never once felt transactional — it felt human.', 'R.S.', 'United States'],
    ['The cultural guidance made all the difference. I felt understood, and so did she. We are building a life together now.', 'J.A.', 'Australia'],
  ];
  return (
    <section style={{ background: 'var(--cream-50)', padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto clamp(36px,5vw,50px)' }}>
          <EyebrowLabel align="center" style={{ marginBottom: 18 }}>In their words</EyebrowLabel>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-strong)', fontSize: 'clamp(32px, 6vw, 44px)', lineHeight: 1.05, margin: 0 }}>Quiet confidence, earned.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
          {items.map(([quote, who, where]) => (
            <Card key={who} surface="white" elevation="shadow" padding="34px 34px">
              <div style={{ color: 'var(--gold-500)', fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 0.6, height: 24 }}>“</div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 21, lineHeight: 1.5, color: 'var(--text-strong)', margin: '6px 0 22px' }}>{quote}</p>
              <div style={{ fontFamily: 'var(--font-text)', fontSize: 14, letterSpacing: '0.04em', color: 'var(--ink-700)' }}>{who} · <span style={{ color: 'var(--text-muted)' }}>{where}</span></div>
            </Card>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 28 }}>Initials used to protect client privacy.</p>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const { EyebrowLabel } = HU();
  const faqs = [
    ['Is the first consultation really free?', 'Yes. The initial consultation is a free, no-obligation conversation — thirty private minutes to understand your hopes and answer your questions. There is no pressure to proceed.'],
    ['How is this different from a dating app or agency?', 'We are a consultancy, not a platform. There is no database to browse and no catalogue of profiles. We screen, guide and introduce — selectively and with discretion — toward genuine long-term outcomes.'],
    ['Who do you accept as clients?', 'We work with serious, financially established men seeking marriage, companionship and family. Acceptance is selective, which protects the integrity of the process for everyone involved.'],
    ['How are candidates screened?', 'Both clients and candidates are carefully screened. Our local Vietnamese expertise allows us to assess intention, character and long-term compatibility before any introduction is made.'],
    ['Is my enquiry confidential?', 'Entirely. Discretion is central to how we work — your details are never shared, and every conversation is held in strict confidence from the first word.'],
  ];
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq" style={{ background: 'var(--cream-100)', padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(34px,5vw,48px)' }}>
          <EyebrowLabel align="center" style={{ marginBottom: 18 }}>Questions, answered</EyebrowLabel>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-strong)', fontSize: 'clamp(32px, 6vw, 44px)', lineHeight: 1.05, margin: 0 }}>Before you apply.</h2>
        </div>
        <div>
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderTop: '1px solid var(--cream-300)' }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '22px 4px', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3.4vw, 24px)', color: 'var(--text-strong)' }}>{q}</span>
                  <LucideIcon name={isOpen ? 'Minus' : 'Plus'} size={22} color="var(--burgundy-700)" style={{ flex: 'none' }} />
                </button>
                {isOpen && <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--ink-700)', margin: '0 4px 26px', maxWidth: '64ch' }}>{a}</p>}
              </div>
            );
          })}
          <div style={{ borderTop: '1px solid var(--cream-300)' }} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Booking section ---------------- */
function BookingSection() {
  const { EyebrowLabel } = HU();
  return (
    <section id="book" style={{ background: 'var(--cream-50)', padding: `clamp(64px, 9vw, 100px) ${G}`, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(assets/images/lifestyle-03.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 30%', opacity: 0.16 }}></div>
      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto clamp(34px,5vw,46px)' }}>
          <EyebrowLabel align="center" style={{ marginBottom: 18 }}>Apply for a private consultation</EyebrowLabel>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-strong)', fontSize: 'clamp(36px, 7vw, 52px)', lineHeight: 1.02, margin: '0 0 16px' }}>
            Build something that lasts.
          </h2>
          <p style={{ fontSize: 'clamp(17px, 2.6vw, 20px)', lineHeight: 1.7, color: 'var(--ink-700)', fontWeight: 300, margin: 0 }}>
            A free, no-obligation conversation with our founder. Choose a time that suits you — discreet, considered and entirely confidential.
          </p>
        </div>
        <Scheduler />
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function SiteFooter() {
  const { Logo, Button } = HU();
  const vw = useVW();
  const cols = vw < 760 ? '1fr' : '1.4fr 1fr 1fr';
  const links = [['The Process', 'process'], ['Why Vietnam', 'vietnam'], ['Our Story', 'story'], ['FAQ', 'faq']];
  return (
    <footer style={{ background: 'var(--ink-900)', color: 'var(--cream-50)' }}>
      <div style={{ padding: `clamp(56px,8vw,80px) ${G} clamp(40px,6vw,56px)` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: cols, gap: 'clamp(36px, 5vw, 56px)' }}>
        <div>
          <Logo variant="reversed" height={34} showDescriptor />
          <p style={{ color: 'var(--ink-200)', fontSize: 16, lineHeight: 1.7, maxWidth: '38ch', margin: '24px 0 24px' }}>
            A premium international relationship and family-formation consultancy. A serious consultancy for serious men.
          </p>
          <Button variant="gold" onClick={scrollToBook}>Schedule a free consultation</Button>
        </div>
        <div>
          <div className="hu-eyebrow" style={{ color: 'var(--gold-300)', marginBottom: 18 }}>Heritage Union</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {links.map(([l, id]) => (
              <a key={l} onClick={() => goTo(id)} style={{ color: 'var(--ink-200)', fontSize: 15, cursor: 'pointer' }}>{l}</a>
            ))}
          </div>
        </div>
        <div>
          <div className="hu-eyebrow" style={{ color: 'var(--gold-300)', marginBottom: 18 }}>Contact</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="mailto:team@heritage-union.com" style={{ color: 'var(--ink-200)', fontSize: 15 }}>team@heritage-union.com</a>
            <span style={{ color: 'var(--ink-400)', fontSize: 15 }}>heritage-union.com</span>
            <span style={{ color: 'var(--ink-400)', fontSize: 15 }}>By application only</span>
          </div>
        </div>
      </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border-on-dark)' }}>
        <div style={{ padding: `24px ${G}` }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: 'var(--ink-400)', fontSize: 13, letterSpacing: '0.04em' }}>© 2026 Heritage Union · Private &amp; Confidential</span>
            <span style={{ color: 'var(--ink-400)', fontSize: 13, letterSpacing: '0.04em' }}>Web Design by <a href="https://generateleads.online/" target="_blank" rel="noopener" style={{ color: 'var(--gold-300)', borderBottom: '1px solid rgba(216,192,136,0.4)' }}>GLO</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { SiteNav, SiteHero, TrustSection, ProcessSection, VietnamSection, StorySection, PromiseBand, Testimonials, FAQ, BookingSection, SiteFooter });
