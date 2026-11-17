# Private thought capture ("Thoughts")

**Status:** built on `feature/thought-capture`, 17 November 2026. **Not deployed.** Owner request: text ideas to a Google Voice number and have them land, sorted, on a private page of the site that can be searched, filtered and edited from anywhere. Inspired by MindChuk.

**Owner decisions, 17 November:** capture through her existing Google Voice number, not a paid texting number; AI suggestions applied automatically (“pre-approved”) and editable; #hashtags and keywords can be typed in a text and changed later; a tag cloud. The repository's general “no AI runtime” guidance is overridden by this explicit request, for this private tool only.

Nothing here touches the public site build, its routes or its content model. The archive is a separate Worker (`producing-curiosity-thoughts`) on its own subdomain with its own database. Phone numbers, email addresses and secrets are Worker configuration and never appear in this repository.

## How it works

1. You text your Google Voice number from your own phone.
2. Google Voice emails the text to its Gmail account (“Forward messages to email”).
3. A Gmail filter forwards those notifications to `thoughts@producingcuriosity.com`.
4. Cloudflare Email Routing hands the message to the Worker's `email()` handler. It accepts a message only if all of these hold:
   - the envelope comes from the configured Gmail account;
   - the original sender is `…@txt.voice.google.com`;
   - your sender number appears in the message.

   Anything else is rejected and nothing is stored. Gmail's one-time forwarding confirmation is the one exception: it's shown on the page as a setup note so you can read the code.
5. The text is saved exactly as received (`raw`, never edited) plus an editable working copy. `#hashtags` become tags at once.
6. Sorting runs straight after saving. Workers AI suggests a short title and two to five tags, which are **applied automatically and marked ✦**. You can edit or remove them. If the AI is unavailable, simple keyword extraction is used instead, and a 30-minute scheduled job retries anything left unsorted.
7. The Thoughts page sits behind Cloudflare Access (your login). The Worker also verifies Access's signed token itself, so a misconfigured route can't expose it.

## Interface design system

Adapted from MindChuk to Producing Curiosity:

| Element | Decision |
| --- | --- |
| Surface | The existing dark “observatory” surface: ink `#f1eee5` on `#151614`, panel `#1c1d1b`. |
| Type | Thoughts are set in monospace, as typed (IBM Plex Mono if licensed, else the system monospace). The wordmark “Thoughts*” uses the serif with the placeholder asterisk. |
| Primary color | Orange `#ffab7d` only for the single primary action (+ and Save); yellow focus ring. |
| Tag color | A stable categorical hue per tag name, from eight hues tuned for the dark surface. Each card's outline uses the hue of your own first tag (typed, then manual, then AI). Color never stands alone, because the #tag text is always shown. AI tags carry ✦ and a screen-reader label. |
| Layout | Header, then search with +, then your top six tags as chips (the full tag cloud, sized by use, is in a disclosure), then date/archive filters, then masonry cards (two columns wide, one on a phone). |
| Cards | Relative time and source, tag chips, then the thought in bold monospace, clamped to eight lines. A tap opens the edit view. |
| Edit view | Title, text, tags and archive work as ordinary forms, so nothing needs JavaScript. Delete needs a confirmation tick. The original is shown under “Original, exactly as received”. |
| Accessibility | 40–52px touch targets, visible focus, real links and buttons, a skip link, reduced-motion respected, and no meaning carried by color alone. |

## Setup

**Order:** 1 (done) → 4 deploy → 2 Access → 3 secrets → 5 email routing → 6 Google Voice → 7 Gmail → 8 test.

You'll need the Cloudflare dashboard, a terminal with this branch checked out (`npm ci` first), and your Google Voice and Gmail settings. **Steps 2, 3, 5 and 7 change live account settings.**

1. **Database — done 17 November.** `producing-curiosity-thoughts` (ID `2da3d1d3-7a2f-4042-a9c2-4da021d43616`, eastern North America) was created through the Cloudflare connector with the schema applied and recorded as migration `0001_thoughts.sql`. The ID is in `wrangler.thoughts.jsonc`; a database ID is not a secret.
2. **Protect the subdomain with Cloudflare Access.** In Zero Trust, go to Access → Applications → Add → Self-hosted. Set the domain to `thoughts.producingcuriosity.com` and the policy to *Allow*, with your email as the only rule. Copy the application's **Audience (AUD) tag** and your team domain (`<team>.cloudflareaccess.com`).
3. **Set the Worker's secrets.** After the first deploy (step 4), add them in the dashboard under Workers & Pages → `producing-curiosity-thoughts` → Settings → Variables and Secrets, choosing type *Secret*. Or run each of these once, from the repository root:
   ```sh
   npx wrangler secret put OWNER_EMAIL --config wrangler.thoughts.jsonc        # the email you log in with
   npx wrangler secret put ACCESS_TEAM_DOMAIN --config wrangler.thoughts.jsonc # <team>.cloudflareaccess.com
   npx wrangler secret put ACCESS_AUD --config wrangler.thoughts.jsonc         # AUD tag from step 2
   npx wrangler secret put FORWARDING_ACCOUNT --config wrangler.thoughts.jsonc # the Gmail address on your Google Voice account
   npx wrangler secret put VOICE_NUMBER --config wrangler.thoughts.jsonc       # your Google Voice number
   npx wrangler secret put SENDER_NUMBERS --config wrangler.thoughts.jsonc     # the cell number(s) you text from, comma-separated
   npx wrangler secret put CSRF_SECRET --config wrangler.thoughts.jsonc        # any long random string
   ```
4. **Deploy with Workers Builds (from the dashboard; works from a phone browser).** Go to Workers & Pages → Create → Import a repository, and choose `sbelina/portfolio-site`.
   - **Project name:** `producing-curiosity-thoughts`. It must match `name` in `wrangler.thoughts.jsonc`.
   - **Production branch:** `feature/thought-capture`.
   - **Build command:** leave empty.
   - **Deploy command:** `npx wrangler deploy --config wrangler.thoughts.jsonc`.
   - **Preview builds:** turn off.

   The first deploy creates the `thoughts.producingcuriosity.com` custom domain. The page answers “This page is private.” until steps 2 and 3 are done. That's expected; it fails closed. If you prefer a terminal, `npx wrangler deploy --config wrangler.thoughts.jsonc` does the same.
5. **Route email to the Worker.** In the producingcuriosity.com zone, go to Email → Email Routing and enable it, after checking the DNS records it proposes don't replace mail you already use. Then add a custom address, `thoughts@producingcuriosity.com`, with the action *Send to a Worker*, set to `producing-curiosity-thoughts`.
6. **Turn on Google Voice forwarding.** In voice.google.com, go to Settings → Messages and turn on *Forward messages to email*.
7. **Forward the texts with Gmail.**
   - In Gmail, go to Settings → Forwarding and POP/IMAP → Add a forwarding address, and enter `thoughts@producingcuriosity.com`.
   - Google sends a confirmation email to that address, which appears on your Thoughts page as a setup note. Use the code or link there, then dismiss the note.
   - Create a filter with From: `txt.voice.google.com` and the action *Forward to* `thoughts@producingcuriosity.com`. Don't forward all mail.
8. **Test it.** Text your Voice number something like `testing the archive #setup`. Within a minute it should appear with a #setup tag, plus ✦ tags once sorting runs.

**Costs:** D1, Email Routing, Access (one user) and Workers are within Cloudflare's free tiers at this volume. Workers AI may bill for usage past its free daily allowance. Google Voice forwarding is free.

## Privacy and limits

- Your texts are stored in your Cloudflare D1 database and sent to Workers AI, which runs inside your Cloudflare account, for sorting. They are never committed to Git or included in the public site. To turn sorting off, remove the `ai` binding; keyword fallback then runs instead.
- Google Voice has no official API, so this relies on Google's notification email format. If Google changes it, intake may stop; your texts remain in Voice and Gmail. The sender check is deliberately strict, so a format change fails closed.
- Group texts, picture messages and replies sent from Gmail are not handled.
- The search is a simple text match. That's fine for thousands of thoughts; a full-text index can be added later.

## Verification (17 November)

- `thoughts-tests/thoughts.spec.ts` covers the following, against the real SQL schema on Node's built-in SQLite:
  - parsing of a forwarded Voice email (multipart, quoted-printable, footer stripped);
  - sender checks (configured account, Voice origin, allowed number, spoofed envelope, stranger's number, missing configuration, Gmail confirmation);
  - typed tags, keyword fallback and bounded AI parsing;
  - one save per message despite duplicate delivery;
  - AI tags marked as AI;
  - fallback when the AI fails;
  - Access token verification (signature, audience, expiry, owner, forgery);
  - search, tag filter, edit (raw text preserved, manual title), archive, guarded delete, CSRF and origin checks, and private no-store headers.

  **8 of 8 passed** in this session, using a minimal stand-in for the Playwright test runner. The repository's real runner has not run them: `npm run test:thoughts`.
- The TypeScript check of `thoughts/` passed with TypeScript 6 and `@types/node`.
- **Not run here:** `npm ci`, `wrangler dev`, `check:thoughts`, real Email Routing, real Access, real Workers AI. The Workers AI model was checked against Cloudflare's model catalog on 17 November: `@cf/meta/llama-3.1-8b-instruct` is listed as deprecated and the fp8 variant is scheduled for deprecation on 20 November 2026, so the default is `@cf/meta/llama-3.1-8b-instruct-fast`.

## Rollback

Delete the Email Routing rule (texts stop arriving), then `npx wrangler delete --config wrangler.thoughts.jsonc`, then remove the Access application. Export first if you want to keep anything: `npx wrangler d1 export producing-curiosity-thoughts --remote --output thoughts-backup.sql`. Keep that file private, outside this repository. The public site is unaffected throughout.
