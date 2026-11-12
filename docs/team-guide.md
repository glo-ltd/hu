# Team guide: using /admin/

For James and Huyen. Open **heritage-union.com/admin/** on your phone or
computer. It isn't linked from the site; bookmark it.

## Signing in

Type your Heritage Union email and tap **Email me a sign-in link**. Open
the link from the email **on the same device**. You stay signed in on that
device until you tap **Sign out**. Only emails on the team list can get in.

## The ground rules

Women register and write their profiles themselves. We read, translate
and record simple facts (Zalo confirmed, link sent, withdrawn). We **never**
edit her answers, and there is nowhere to rate, tag, score or write notes
about anyone. That's deliberate: please don't keep notes about women
anywhere else either.

No profile can be shown to any client yet. The **Client preview** on each
page is for us only.

## Daily routine (5–10 minutes)

1. Open **Needs follow-up**. These are new registrations we haven't
   confirmed on Zalo yet. "Link sent 7 Nov" shows when we last messaged her.
2. For each new woman: open her card, tap **Copy Zalo message**, then
   paste it into Zalo to her number (shown under *Registration details*).
   If the copy doesn't work on your phone, the message is shown in a box:
   press and hold, select all, copy.
   The message is in her language: English if she chose English when she
   registered, otherwise Vietnamese. Its link opens the profile form in that
   language (/my-profile or /vi/ho-so), and she can switch at any time.
3. When she replies on Zalo, open her card and tap **Mark Zalo confirmed**.
   Tapped it by mistake? Tap **Undo Zalo confirmed**.
4. Look at **Withdrawn** (see below).

## Private profile links

- Each woman has one private link to her profile. It works for 60 days.
- **Copy Zalo message** always makes a **new** link, and her old link stops
  working. So if she says her link doesn't work or has expired, just copy
  a fresh message and send it again.
- Never post a link anywhere public, and never send one woman's link to
  anyone else: anyone with the link can see and change her profile.

## Reading and translating a profile

Her answers are shown as she wrote them, under each question in English.
Choices show the Vietnamese she saw with English in brackets. Under each
answer she typed herself there's an **English translation** box: type the
translation and tap **Save translation**. It records who saved it and
when. Translate faithfully, without improving or softening what she wrote.

## Consent badges

- **Sharing: yes / no**: whether she agreed that clients may see her
  profile. If no, the preview says "Not consented: must not be shown to
  clients".
- **Photos · consented / no consent**: photos need their own separate
  agreement. If she submits without it, her photos are deleted
  automatically.
- She can change these herself at any time with her link.

## Withdrawals and the 30-day promise

A woman can withdraw on the website (/vi/withdraw or /withdraw) or by
replying **"RÚT"** (or **"WITHDRAW"** in English) on Zalo.

- If she writes "RÚT" or "WITHDRAW" on Zalo: open her card and tap **Mark withdrawn**.
  Her link stops working, her sharing choices are cleared and her photos
  are deleted straight away. (The website form does the same thing.)
- We promise to delete everything within **30 days**. The **Withdrawn**
  list shows how many days ago each woman withdrew; it turns **red after
  21 days**.
- To delete: open her card, tap **Delete permanently…**, type her first
  name exactly as shown (e.g. *Lan*), and confirm. This removes her
  photos, registration and profile for good. It can't be undone.
- Aim to delete as soon as you've dealt with anything she asked for;
  don't wait for day 30.

## If something looks wrong

- "Your sign-in has expired": sign in again.
- "This account is not allowed": the email isn't on the team list; ask
  James to add it to `ADMIN_EMAILS` in Netlify.
- Anything else: email James with the candidate number from the address
  bar (the long code after `#`), never her name or Zalo number.

## Clients (the Clients tab)

The **Clients** tab sits beside Candidates. Each man moves through:
new enquiry → call booked → call held → invited → applying → to read →
ready to invoice → awaiting payment → active. The filters along the
top follow the same order.

**Every morning:** open **New enquiries**. Each one has already had an
automatic thank-you (R1) with links to book a call and to request the fee
document. Reply to him personally within one working day.

**The call:** when he books on Calendly, tap **Call booked**; after it,
**Call held**. Then choose one:
- **Invite to apply:** sends R3 with the fee document and his private
  application link (valid 30 days). Only works once `CLIENT_SIGNUPS_OPEN` is on.
- **Thinking it over:** you'll get a reminder after 7 days.
- **Not the right fit:** sends R4, a short, kind email with no reasons.

**To read:** when he sends his application you get an email. **Heritage
Union does not carry out background checks** and never asks for photo ID or a
criminal record certificate at this stage. Instead, he signs a sworn
background declaration, which every woman he chooses reads in her own
language before she decides (and she may ask him for an official certificate
then).

Open his page and read his application and declaration properly:
- any "yes" is shown in red;
- he must have ticked that he is legally free to enter the agreement and is
  not married or in a registered partnership.

Then tap **I have read his application and declaration**: that unlocks the
invoice. You can still send **Not the right fit** at this stage, and **Undo
"read"** until the invoice goes.

**Invoice:** the draft shows the standard fee; change the amount for a
founding member before sending. **Preview PDF**, then **Send invoice**. It
gets the next number (HU-2026-0001…) and goes to him with the PDF and the
bank details. When the money is in the account, tap **Mark payment
received**: his 12 months start that day and he gets the welcome email with
his link to begin his profile.

**Links:** if he loses his link or it expires, tap **Send a new private
link**. The old one stops working.

Every action is recorded in the **Timeline** with who did it.

### After payment: his profile, summary and matching

1. **He writes his profile** on his private page (about 20 minutes). When
   he sends it you get an email. Open his page: his answers, photos and his
   message to the women are under **His profile**.
2. **James writes the summary** (about 300 words) in the **Profile summary**
   box. **Insert key facts** starts it from his answers; edit freely.
   **Save and send for approval** emails him (R9). He either approves it
   (R10) or asks for changes. His comment then appears in a quote box: edit,
   then send again.
3. **Huyen translates** the summary, his background declaration and his
   message in the **Vietnamese translations** boxes (English on the left,
   Vietnamese on the right), then **Save translations**. Women read these
   before deciding, so this must be done before any introduction.
4. **Matching:** **Open the matching screen**. It lists only women whose
   profiles are complete, who agreed to clients seeing their profile, and who
   haven't withdrawn. Each has a ✓ or ✗ for each of his must-haves, taken
   from her own answers. There are no scores: please don't keep any ranking
   or opinion of a woman anywhere. **Matches all** narrows the list.
   - A woman marked **Needs English translation** can't be sent until her
     own free-text answers are translated (on her page, Candidates tab).
   - Tick up to 20, then **Send to client**. He gets R11 with a link (valid
     30 days) to read the profiles and choose up to 5 in order.
5. **His choices** arrive by email and show on his page under **Matching and
   choices**, in order. They can only be changed by you.

### Introductions: asking her, and introducing them

His choices appear under **Introductions** on his page, in his order.

- **Ready to send:** tap **Send to her**. It only works when:
  - the Vietnamese translations of his summary, declaration and message
    are done (for a woman who registered in English, the English texts are
    used);
  - she has no other request open;
  - his engagement is active.

  This makes her private link (valid 30 days), emails her if she has an
  email, and shows the message in her language. **Copy it into Zalo.**
- **Queued:** she has another client's request open. It moves to "Ready"
  by itself when she answers that one.
- **She opened it / Sent:** wait. If she lost the link, **New link and
  message** sends a fresh one (the old one stops working).
- **Her question:** shown in his Introductions list. Reply to her on Zalo,
  then tap **Mark question answered**.
- **She said yes:** her written consent is shown: exactly what she agreed
  to share, how she would like the first contact, her typed name and the
  time. Tap **Introduce**. He gets R15 with her chosen details and a short
  guide; she gets R16 with his email and phone (by email if she has one).
  **Copy the message into Zalo for her as well.**
- **She said no:** he has already had a kind note (R17) with no reason.
  Her private reason, if she gave one, is shown only to the team. **Never
  pass it on.**
- **She asked for an official background check:** Heritage Union doesn't
  check his declaration, so on her decision page she can ask him for an
  official criminal record certificate before she decides. You get an email
  (reference only), and his Introductions row shows the request. Her request
  stays open and her 30 days are paused meanwhile.
  1. Tap **Send certificate request**. He gets R22, with a fresh link to his
     page (his old link stops working): she would like him to provide an
     official certificate; he may agree or decline.
  2. If he uploads one, you get an email. Tap **Open certificate (10
     minutes)** and look at it, then tap **Mark as seen**. Her page then shows
     "He has provided an official certificate" / "Anh ấy đã cung cấp phiếu lý
     lịch tư pháp" with a 10-minute link, and her 30 days run again (with the
     paused days added back). We don't verify it with the authority that
     issued it, and her page says so.
  3. If he declines, you get an email, her page tells her he chose not to
     provide one, and her 30 days run again. You may want to message her on
     Zalo.

  Certificates are deleted with his other documents 6 months after his
  engagement closes.
- **No answer in 30 days:** the request expires and counts as a no (Phase 4
  sends a gentle reminder at 14 days).

He can choose a replacement from the rest of his list on his own page, up
to 5 introductions in use. A no, an expired request or a cancelled one
doesn't count.

If a woman withdraws (website, "RÚT" on Zalo, or **Mark withdrawn**), every
pending request for her is cancelled automatically, and he only sees "No
longer available".

### Every day, automatically (`daily-tasks`)

You don't need to do anything for these; they happen once a day and never
twice:

- **14 days with no answer:** she gets a gentle reminder (R14) by email. If
  she has no email, you get "Send a gentle reminder on Zalo": open his page
  and tap **Copy 14-day reminder for Zalo**.
- **30 days with no answer:** the request expires and counts as a no. He
  gets the kind R17, and her next waiting request (if any) becomes ready.
- **Thinking it over for 7 days:** you get a reminder to follow up.
- **3 months after his first introduction:** he gets R18, "We're here if
  you need us", once.
- **12 months:** his card shows **12 months reached**, and you get an
  email. Nothing closes by itself: you choose how to close.
- **While she waits for a certificate she asked him for**, neither of the
  two steps above happens: her 30 days are paused until he declines or you
  mark his certificate as seen, and the paused days are added back.
- **6 months after closing:** his photos, and any certificate he provided
  at a woman's request, are deleted.

### Closing an engagement (his page → Engagement)

- **Relationship success…:** only when they have told you so. He gets
  R19, congratulations, with the honour-payment invoice (amount editable).
- **12 months complete…:** he gets R20 confirming nothing more is owed.
- **Close…:** for anything else (e.g. he ends early).

Every closing also asks him for feedback (R21), cancels any requests still
waiting, and starts the 6-month deletion clock. Feedback shows on his page
with his publishing choice. **Never publish anything marked "Do NOT
publish"**, and otherwise only in the way he chose.

### Concerns

"Report a concern" links in every email lead to `/contact?concern=1`
(English) or `/vi/contact?concern=1` (Vietnamese). Every report is emailed
to you (reference only) and listed under **Clients → Concerns**. Read each
the same day.

- If it's about a client, **link it to him**, and if needed tap **Pause
  (after a concern)** on his page. Pausing blocks new requests (sending to
  women, his replacements, his shortlist) and shows "paused" on his page.
- Requests already with a woman stay open, but **Introduce** waits until
  you **Unpause**.
- Tap **Mark handled** when it's dealt with.

