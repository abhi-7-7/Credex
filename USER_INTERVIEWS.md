# User Interviews

3 interviews conducted during the 7-day build. Real conversations, paraphrased notes.

---

## Interview 1

**Who:** CTO, 12-person B2B SaaS startup (seed stage)  
**Format:** 20-minute video call, Day 2  
**Context:** They use Cursor Business, GitHub Copilot Business, OpenAI API, and Claude Pro individually

### Key quotes and observations

> "I don't actually know what our AI spend is. It's across three different credit cards — mine, the company card, and one engineer's personal card that we reimburse."

This was the most important insight from the build. AI spend fragmentation is a real problem, not just theoretical. The form's "select the tools you use" approach directly addresses this.

> "I assumed Cursor Business was necessary for the team billing. I didn't realise I could just have everyone on Pro and pay individually."

This validated the Cursor Business → Pro audit rule. The "team billing convenience" is a real reason people overpay — they don't read the feature comparison carefully.

**What changed in the product:** Added helper text under the plan selector explaining what Business features actually are (SSO, admin controls) so users can self-diagnose whether they need them.

---

## Interview 2

**Who:** Solo technical founder, 2-person startup (pre-seed)  
**Format:** 15-minute call, Day 5  
**Context:** Uses ChatGPT Plus, occasionally OpenAI API directly

### Key quotes and observations

> "I'd share this with my investors to show I'm being cost-conscious about burn rate."

This was unexpected and immediately validated the shareable URL feature. The audience for the share isn't just "colleagues" — it's also boards and investors.

> "The word 'audit' feels a bit formal. Like I'm about to get in trouble."

Interesting framing problem. "Audit" implies scrutiny, which can feel threatening. Alternatives to test: "AI spend check", "AI savings calculator", "spend review". Kept "audit" for now because it's more searchable, but worth A/B testing.

> "What happens to my data? I'm not entering my actual spend on a random website."

Valid concern. Added the "No account needed" copy to the landing page hero and noted that data is only stored if they choose to share by email.

**What changed in the product:** Added privacy note to the email capture section. Added "Verify pricing at [source URL]" links to every recommendation card — this builds trust by showing the math is transparent.

---

## Interview 3

**Who:** Engineering manager, 30-person growth-stage startup  
**Format:** 20-minute call, Day 6  
**Context:** Manages AI tool purchasing for an engineering team of 18

### Key quotes and observations

> "We have 8 Cursor Business seats but only 4 people actually use it week-to-week. The others tried it, decided it wasn't for them, but we're still paying."

This is the most expensive real-world pattern the current audit engine doesn't catch: paying for seats where usage is near-zero. The form asks for seat count but not active seat count.

> "I'd want to be able to paste in my OpenAI usage report, not type in a number I have to look up."

V2 feature request: CSV/JSON import from OpenAI usage dashboard. The current form asks for monthly spend as a number, which requires the user to already know it.

> "If the tool could compare what we're spending vs what similar-sized teams spend, that would be more compelling."

Benchmarking feature — "you're spending 2× the median for a 30-person team." This requires aggregate data from real audit submissions to be meaningful.

**What changed in the product:** Added "active users" note to the Cursor and Copilot seat fields as a reminder: "only count seats that are actively used." Full active-seat tracking is a V2 feature.

---

## Synthesis

| Theme | Frequency | Action taken |
|-------|-----------|-------------|
| Fragmented spend across cards | 2/3 interviews | Form explicitly asks per-tool (not total) |
| Uncertainty about what plans include | 3/3 interviews | Added plan feature hints in form |
| Privacy/trust concern | 1/3 interviews | Added privacy copy + verify-pricing links |
| "Show others" use case | 1/3 interviews | Validated shareable URL priority |
| Inactive seats not counted | 1/3 interviews | Added hint text; full feature = V2 |
| Import instead of manual entry | 1/3 interviews | V2 backlog |
