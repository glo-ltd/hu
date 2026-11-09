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
new enquiry → call booked → call held → invited → applying → documents to
check → ready to invoice → awaiting payment → active. The filters along the
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

**Documents to check:** when he sends his application you get an email.
Open his page, tap **Open** on his photo ID and certificate (each link works
for 10 minutes), and check that:
- the ID matches his legal name and date of birth;
- the certificate is official, from his country of residence, and dated
  within the last 6 months.

Then tap **Mark checked** on each. Read his background declaration: any
"yes" is shown in red. You can still send **Not the right fit** at this
stage.

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

