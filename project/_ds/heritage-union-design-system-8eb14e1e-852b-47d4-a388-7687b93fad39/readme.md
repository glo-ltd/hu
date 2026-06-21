# Heritage Union — Design System

> *International relationships, handled with trust, discretion and care.*
> A union built to last generations.

Heritage Union is a **premium international relationship and family-formation consultancy** for serious Western men (aged 50–60, US / UK / Australia) seeking genuine long-term companionship, marriage and family. Through selective acceptance, local Vietnamese expertise, cultural guidance and concierge-level support, the brand creates a trusted environment where meaningful relationships develop with respect, discretion and long-term intent.

This is **not** a dating app, a catalogue of profiles, or a transactional introduction service. The brand feels closer to a private relationship consultancy and a family-formation advisory — dignified, classic and warm, with the quiet authority of an heirloom.

The recommended creative concept is **"Heritage & Legacy — build something that lasts,"** carried by **The Union Mark**: two rings, two lives, two families, two cultures joining as one.

---

## Sources

This system was built from the brand strategy package provided by the client. No codebase or Figma file was supplied; the visual identity is derived directly from the brand book.

- `uploads/Heritage Union Brand Analysis.md` — strategic foundation (positioning, audience, values, USP, voice).
- `uploads/Heritage Union Brand Analysis - Heritage & Legacy.pdf` — the 18-page brand book defining the concept, the Union Mark, typography, colour palette and a homepage-hero comp.
- Additional brand notes: `https://claude.ai/design/p/3412dc42-1f39-472a-9b4e-3876548452ac` (a DC version of the brand analysis — not directly accessible from this project, recorded for reference).

Real brand photography and the homepage comp were extracted from the PDF and live in `assets/images/`.

---

## Content Fundamentals — how Heritage Union speaks

**Voice in one line:** *Calm, considered, warm — short declarative sentences carrying quiet authority. Never salesy, never urgent.*

It should read like an **expert advisor speaking to a serious man** who has reached a meaningful stage of life and wants something that lasts.

**Tone & register**
- Mature, premium, reassuring, discreet. Confident but never aggressive.
- Sells **the quality of the process**, never "finding a wife abroad." Avoid fantasy, romance clichés, urgency, hype, or anything transactional.
- Frame around **permanence**: partner, family, legacy, generations, "built to last."

**Person & address**
- Speaks **to "you"** (the prospective client) and about **"we / Heritage Union"** as the consultancy. "We are not selling access to profiles."
- Addresses the audience as **"the man"** / "serious men" in editorial standfirsts ("For the man entering a meaningful chapter…").

**Casing & punctuation**
- Headlines: **sentence case**, set in the display serif. "A union built to last generations."
- Eyebrows / labels / nav / wordmark: **UPPERCASE with wide tracking**, often separated by middots — `COMPANIONSHIP · MARRIAGE · FAMILY`.
- Em dashes for considered asides — used freely. Middots (·) as elegant separators.
- No exclamation marks. No ALL-CAPS shouting in body copy.

**Vocabulary**
- Use: *trust, discretion, care, respect, selective, screened, guided, companionship, marriage, family, legacy, permanence, heritage, cultural understanding, concierge, private consultation.*
- Avoid: *match, swipe, profiles, browse, hot, deals, sign up now, limited time, mail-order, find a wife.*

**Calls to action** — premium and selective, never casual:
- ✓ "Apply for a private consultation." · "How it works." · "Begin your application."
- ✗ "Book a call" · "Sign up" · "Get started free."

**Specimen copy** (from the brand book)
- Headline: *"A union built to last generations."*
- Standfirst: *"For the man entering a meaningful chapter who wants more than company — a partner, a family, a legacy worth building with care."*
- Reassurance: *"Selective, screened and guided every step of the way — discreet from first conversation to lasting marriage."*
- Positioning: *"We are not selling access to profiles. We sell confidence, guidance, screening and cultural understanding."*

**Emoji:** Never. The brand uses no emoji. Middots (·) and em dashes carry the rhythm instead.

---

## Visual Foundations

The world is **dignified, classic and warm — heirloom quality, never nostalgic or dated.** Editorial, architectural, generous with space.

**Colour** — a tight four-colour palette (see `tokens/colors.css`):
- **Heritage Burgundy `#5E2A2E`** — primary. Headlines on light, primary buttons, dark sections, the wordmark.
- **Antique Gold `#C2A35A`** — accent only. Eyebrow labels, thin rules, one ring of the mark, hairline highlights. Used sparingly — it signals, it doesn't fill.
- **Warm Cream `#F2EADA`** — the default canvas. Almost everything sits on cream, not white.
- **Ink `#16202E`** — contrast. Body text, alternate dark sections, footer.
- White is a *raised* surface for cards, used quietly. Tint/shade ramps exist for each but the brand stays close to the four base tones.
- **Vibe:** warm, low-contrast, sunlit. Burgundy + gold + cream reads as wine, brass and parchment.

**Typography** — all serif, no sans (see `tokens/typography.css`):
- **Display: Cormorant Garamond** — headlines and wordmark. High-contrast, classic, set large with tight leading and slightly negative tracking. Medium weight is the workhorse.
- **Text: Spectral** — body, captions, UI. A refined transitional serif that reads beautifully at body sizes; Light/Regular for long-form.
- Eyebrows are Spectral, uppercase, **very wide tracking (0.24em)**, in gold.

**Imagery** — real, warm documentary photography of **mature couples** (Western man + Vietnamese woman, 50s), shot at **golden hour**: gardens, Hoi An lantern streets, soft greens and amber light. Natural, candid, dignified — never stock-posed or staged. Full-bleed in heroes, often paired with a cream text panel beside it (split hero). Warm colour grade throughout. No black & white, no heavy grain. See `assets/images/`.

**Backgrounds** — solid cream or solid ink/burgundy. **No gradients, no patterns, no textures, no glassmorphism.** Imagery provides the only "texture." Sections alternate cream ↔ ink/burgundy for rhythm.

**Layout** — editorial and architectural. Generous whitespace, wide gutters, max width ~1200px. Asymmetric split heroes (text + image). 8px spacing base; large section padding (~96px). Thin gold rules and uppercase eyebrows mark section starts.

**Corners** — near-square. `2px` on buttons/inputs/chips, `4px` on cards, `8px` on media. Pills reserved for avatars/dots only. The brand is rectilinear, not rounded — it feels built, not bubbly.

**Borders** — hairline `1px`. Warm cream-toned hairlines on light; translucent cream on dark. Gold `1px` rules as accents and section dividers.

**Shadows** — soft, low, warm-tinted (ink at 6–14% alpha). Cards lift gently (`--shadow-sm`/`--shadow-md`). No hard drop shadows, no neon glow. Focus states use a **gold ring** (`--shadow-focus`).

**Motion** — slow and dignified. 140–420ms, standard ease, **no bounce, no spring.** Quiet fades and short rises on scroll. Respect `prefers-reduced-motion`.

**Hover** — primary buttons darken (burgundy → burgundy-800). Links darken. Cards lift slightly with a deeper shadow. Text links reveal a thin underline. Never scale-up or brighten.

**Press / active** — darken further (burgundy-900) and/or a subtle 1px settle. No dramatic shrink.

**Transparency & blur** — used rarely. Translucent cream borders on dark sections; a faint cream wash over imagery for text legibility (protection wash, not a heavy scrim). No frosted-glass UI.

**Cards** — white or cream-50 surface, `4px` radius, hairline border or soft shadow (rarely both), generous internal padding. Calm and editorial, never busy.

---

## Iconography

Heritage Union is **typographically driven** — the identity leans on the Union Mark, serif type, gold rules and middots rather than a dense icon set. Use icons **sparingly**, only where they aid comprehension (process steps, contact details, small affordances).

- **The Union Mark** (two overlapping rings) is the hero glyph — see `assets/logos/`. Burgundy + gold on light; cream + gold reversed on dark. Never fill the rings or change the overlap.
- **No built-in icon font or sprite was supplied** by the brand. For UI icons we substitute **Lucide** (`https://unpkg.com/lucide@latest`) — a thin, even-stroke, classic line set that matches the restrained, editorial feel. **⚠ This is a substitution; flag for client approval / replacement with a bespoke set if desired.**
  - Use the **outline / 1.5px stroke** style only. Tint with `currentColor` (burgundy or ink). Keep icons small and quiet — they are punctuation, not decoration.
- **Middots (·)** and **em dashes (—)** function as the brand's typographic "icons" / separators.
- **Emoji: never.** Unicode pictographs are not part of the system.

---

## Index — what's in this system

**Foundations / tokens** (all reachable from `styles.css`)
- `styles.css` — global entry point (consumers link this one file; `@import` lines only).
- `tokens/fonts.css` — Cormorant Garamond + Spectral (Google Fonts CDN).
- `tokens/colors.css` — brand palette, ramps, semantic aliases.
- `tokens/typography.css` — families, weights, scale, leading, tracking.
- `tokens/spacing.css` — 8px spacing scale + layout sizes.
- `tokens/effects.css` — radii, borders, shadows, motion.
- `tokens/base.css` — base element styles + brand utility classes (`.hu-eyebrow`, `.hu-wordmark`, `.hu-display`, `.hu-lead`, `.hu-container`, `.hu-rule-gold`).

**Assets**
- `assets/logos/` — the Union Mark (primary, reversed, gold, ink, burgundy mono).
- `assets/images/` — brand photography: a 19-image lifestyle library (`lifestyle-01`–`19`: Vietnam markets & Hoi An lanterns, gardens, terraces, beaches, candlelit dinners, home life) plus the original `couple-garden` / `couple-vietnam` and the homepage hero reference comp.

**Foundation specimen cards** — `guidelines/` (rendered in the Design System tab: Colors, Type, Spacing, Brand groups).

**Components** — `components/` reusable React primitives (each with a `*.prompt.md`):
- `core/` — **Button**, **Logo** (Union Mark lockup), **EyebrowLabel**, **Divider**, **Badge**, **Card**.
- `forms/` — **Input**, **Textarea**, **Select**, **Checkbox** (the application-funnel fields).
- Consumed in @dsCard HTML / `<x-import>` via `window.HeritageUnionDesignSystem_8eb14e`.

**Templates** — `templates/` starting folders for consuming projects:
- `landing-page/` — Heritage Union marketing landing page (hero + promise band) built from DS components.

**UI kit** — `ui_kits/website/` — high-fidelity, interactive recreation of the Heritage Union marketing site (home · process · apply funnel).

**Live website** — `site/index.html` — the production marketing site for heritage-union.com: hero, trust, process, why-Vietnam, our story, promise, testimonials, FAQ, and an embedded **on-brand consultation scheduler** (calendar → time → details → confirmation) whose primary CTA books a free consultation with the founder. Contact: team@heritage-union.com. Built on the design system (`site/sections.jsx`, `site/Scheduler.jsx`).

**Other**
- `SKILL.md` — makes this system usable as a downloadable Claude Agent Skill.
- `readme.md` — this file.

---

*The brand's success rests on communicating three things: this is a serious consultancy for serious men; the process is respectful, selective and trust-led; the goal is genuine long-term outcomes — not introductions alone.*
