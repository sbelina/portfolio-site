# Consolidation: institutional value, published cases, retired archive — 23 November 2026

**Branch:** `claude/jolly-turing-noyo4q`. **Status:** built and tested for owner review. **Not merged or deployed.** Merging is the owner's approval of the release (see *Approval* below).

## Owner decisions (23 November, in conversation)

| Decision | Choice |
| --- | --- |
| Homepage headline | “I help organizations avoid costly solutions to *misunderstood* problems.” This supersedes the morning's “I diagnose gaps in understanding…”. |
| Pushkin interlude | Compact, at the base of the homepage, above the call to action. The full geometry moves to Field Notes. |
| Old archive | Make it private now. Replace it with public case versions, with deep-dive links beside each one and on the Investigations page. |
| Scope | All four releases, on one branch, for review at the end. |

The direction came from an external review that the owner pasted. That review's other proposals that conflicted with earlier owner decisions were put to the owner, not applied by default.

## Release 1: inventory and private preservation

- **Private copy.** All 52 files of the retired build (`2026-11-04-418efb7`, 3,151,985 bytes) were copied to a private Cloudflare KV namespace, `portfolio-site-private-archive`, together with a manifest of SHA-256 checksums. No Worker binds that namespace, so nothing serves it.
- **Verification.** Every file was read back and compared: 52 of 52 match.
- **Public history.** The files remain in this public repository's Git history before this branch. Removing them from the current tree does not erase earlier commits, forks or caches. Making that history private is a separate decision about repository visibility.
- **Field Notes.** `/field-notes/` is served by the separate thoughts Worker and sits behind Cloudflare Access, so anonymous readers are asked to sign in. That is an owner setting in Zero Trust. The public reading room is therefore the new static `/writing/` page, built from the descriptions and excerpts in `src/data.ts`, which were already public. No full manuscript is published or reconstructed.

## Release 2: value signal, decision layer and public cases

- **Homepage order:**
  1. identity and value: headline, the 23 November lead paragraph, and the value line;
  2. three things the work makes possible;
  3. approved headline figures;
  4. three selected investigations, each with *At stake*, *What changed*, and **Public version** and **Deep dive (password)** side by side;
  5. Test. Show. Enable. with How I Know and the purpose line;
  6. Explore further: Connections, Field Notes, Observatory, Edge Case;
  7. the compact interlude;
  8. Work together.
- **Decision layer.** This is a new, optional `investigation.decision` field. It holds:
  - what was at stake;
  - the explanation people held;
  - the options, each labelled *Considered*, *Recommended*, *Chosen* or *Not chosen*;
  - who decided;
  - what changed in practice;
  - resource implications, each labelled *Resource implication*, *Observed change*, *Measured result* or *Not established*.

  The labels are always in words. No financial effect is inferred.
- **Six public cases** (`content/release/cases.ts`): Claims (revision 3 of the reviewed candidate), Trust, Enterprise AI, telematics, Vote Huntsville and AI accessibility. Each pairs with the deep dive of the same slug.
  - **Evidence:** every factual statement and figure cites the owner's account. It is labelled publicly as *owner-reported; the underlying records are private and were not inspected*.
  - **Figures:** none is labelled *measured*.
- **Trusted release loader** (`scripts/release.ts`):
  - `npm run release:prepare` digests every record into `content/public-release.json`.
  - Each build re-digests the records and stops if any of them changed.
  - Changing one word in an approved case therefore requires a new release and a new approval.
- **Desktop task analysis** (police-report forms): an outline only, in `review-candidates/desktop-task-analysis.md`. The reported ~88% figure is unverified and does not appear publicly.
- **Practice** shows what each move produces, with a published example. **Connections** links three distinctions to the case that shows one instance.
- **Menu**, five items: Investigations, Practice, Field Notes, Observatory*, Contact. Connections is reached from Practice and the homepage; on `/patterns/` the Practice link is marked as the current section.
- **Search and preview:** a new search description, link-preview text and preview image.

## Release 3: public archive retired

- The build no longer copies `build-archives/`, and the folder, `scripts/build-archives.ts`, `content/build-archive.json` and the footer link are removed.
- The Worker now runs first for `/builds` and `/builds/*` and answers **410 Gone**, with `noindex` and `no-store`, for every old address, including nested assets.
- Old homepage fragments map to current pages (`src/content/legacy-fragments.ts`). With JavaScript they redirect. Without it, each old anchor is still a target in a *Looking for a section from the previous site?* list.
- **Not covered:** Cloudflare preview URLs of older Worker versions (`preview_urls: true`) can still serve the files of their own version. Turning previews off would also remove the per-PR previews that `DEPLOY.md` relies on, so that is left to the owner.

## Release 4: visual case stories

- **Claims:** the existing *Move the checkpoint* and the service blueprint.
- **Trust:** *Ask the question differently*. The same attribute is asked as agreement and as trust influence, with what each question can and cannot support. The wording is illustrative, not the instrument.
- **Enterprise AI:** *From proposals to problems*. Thirty-eight marks, one by one or grouped into eight areas. The group sizes are illustrative, and area names are not published.
- **Accessibility:** none. Each visual shows both views without JavaScript, switches with native radio buttons, and encodes no data.
- **Not built:** the police-report task replay, because no reviewed case exists.

## Approval

Preparing the release is not approval. **The owner approves by merging the pull request that contains `content/public-release.json`.** The owner's GitHub account is the authenticated authority, and the pull request shows every record exactly. An agent must not merge it without the owner's explicit instruction. A record changed after approval stops the build.

## Verification

| Check | Result |
| --- | --- |
| `npm run build` (type checks, Vite, prerender, public audit) | Passed: 21 routes, 6 approved entries, 68 files audited |
| Chromium suite | 293 passed, 0 failed |
| Reflow at 320 px and 200% text | Failed at first: the results strip's fixed 14rem column, never rendered before. Fixed with `min(100%, …)` in every such grid |
| Private archive copy | 52 of 52 checksums match |
| Full suite, all browsers (before the review fixes) | 796 passed, 4 failed, 11 skipped. Three failures were the release tamper check, which fired because cases were edited during the run; one was an Edge Case gesture flake on mobile WebKit that passed on rerun |
| Independent evidence review (read-only) | Four high-priority findings, all fixed or put to the owner: inherited “Source pending” notes, the salvage vendor's name in a bundled legacy module (moved out; vendor removed), approval of agent-written decision blocks (the owner must read them word for word), and the $20K grant figure (owner-reported on 20 and 23 November). Medium wording issues fixed |
| After the fixes: affected specs, all browsers | 156 passed, 0 failed |

Not established: how readers understand the new homepage (see the reader evaluation protocol), real screen readers and devices, and Cloudflare's live response once deployed.

## Rollback

Revert the merge commit on `main`. The previous release had no approved content, so reverting restores the earlier homepage and the archive mount. The private KV copy is unaffected either way.

## Visual and interaction system (owner decision, 23 November: no Tailwind, add all proposals)

The owner reviewed a teardown of five reference sites and chose to keep plain CSS and add every proposed technique. The new code lives in `src/design/system.css`, `src/design/motion.css` and `src/design/Interactions.tsx`.

| Technique | Where | Fallback |
| --- | --- | --- |
| Spacing and type scale, 12-step accent scale (`--signal-1…12` via `color-mix`), layered shadows (`--elevation-1/2`) | `system.css`, `pc-tokens` layer | Tints are decorative; unsupported `color-mix` leaves them unset |
| Cascade layers `pc-tokens, pc-components, pc-motion, pc-utilities` | all new CSS | Existing CSS stays unlayered and so always wins; migrate a component only when it is rewritten |
| Utilities `.pc-stack`, `.pc-cluster`, `.pc-flow` | new components | — |
| Scroll reveal (movement only, never opacity, so measured contrast never changes) | sections, cards, case sections, spreads | No movement |
| Accent word underlines itself | every h1 and h2 with an accent word | Underlined at rest |
| Reading progress bar | case pages, deep dives | Hidden |
| Cross-page view transitions; case titles share `view-transition-name: case-<slug>` | homepage card, collection card → case h1 | Normal navigation |
| Smooth `<details>` | all disclosures | Opens instantly |
| One card forward (`:has()`) | selected cases, Explore further, collection | Pointer devices only |
| Snapping deep-dive hub | deep dives, phones only | Stacked list |
| Strand line, drawn thread, travelling mark | homepage practice section, Practice page | Fully drawn; mark paused under reduced motion |
| Observed / interpreted / decided layers | every case with a decision layer; text drawn from the case's own approved statements | Readable list |
| Annotated plate with leader lines | Practice: the anatomy of a case page (structural, no case claims) | Plain list |
| Source popovers | each case's *At a glance → How I knew* | Native `popover`, works without JavaScript |
| A count that resolves (38 → 8) | Enterprise AI visual only; rounded figures are never counted | Shows 8 |
| Pinned before/after figure | Claims, beside the four questions | Both states shown |

Removed as dead: six unused rule groups in `foundation.css` (the earlier journeys, brief, representative-list, featured-status, evidence-boundary and deep-dive-index styles). `tests/interactions.spec.ts` now fails on any unused class in the current-edition stylesheets.

Not built: the deep-dive figures as SVG plates. Their text is private content in KV, and drawing each figure is a separate piece of work.

## Follow-up, 23 November: the pattern and verbal stress

- **“A way of looking”** moved out of the hero, which is now text only, into a new section after the selected investigations: *Related. Not equivalent. The pattern across the work.* The drawing now takes its pairs from the six approved case visuals and opens on Claims. Beside it, a text list gives every case's distinction as a link, as the text equivalent of the graph.
- **Verbal stress:** the turn, the finding and the label are marked in case copy (see the deck foundation). The self-underlining accent word was removed, because underlines belong to links. The source markers are no longer underlined either. The intro's step prompt keeps its underline, as part of the owner-specified intro.
- **Release:** the case text changed, so the release was prepared again.

## Follow-up, 23 November: the reader's words for the work

Owner note: “Investigations” and “Claims” were not helping readers find the work.

- **Why:** readers looking at a portfolio scan for **Work** (in the menu) and **case studies** (on the page). They place each piece by its **setting** and the **kind of work** they hire for. “Investigations” needed decoding, and “Claims” alone reads as claims-as-assertions on an evidence site.
- **Menu:** *Work*.
- **Collection page:** title and heading are *Case studies*.
- **Cards and case kickers:** *setting · kind of work*.

  | Case | Label |
  | --- | --- |
  | Claims | Insurance operations · Process & service design |
  | Trust | Customer research · Survey & measurement design |
  | AI | Enterprise innovation · Opportunity synthesis & facilitation |
  | Telematics | Product research · Usability research & findings recovery |
  | Vote Huntsville | Civic engagement · Service & content design |
  | Accessibility | AI-assisted development · Accessibility evaluation |
- **Addresses:** `/investigations/` stays the canonical address, so existing links keep working. `/work/` and `/case-studies/` redirect there with a 301.
- **Unchanged:** the internal model name (`investigation`) and the fixtures edition.

## Follow-up, 23 November: four case figures from the owner's references

- **Method profile** (after a survey-types infographic): *how it was gathered, when, from whom, what it could establish*. Each has tags and one sentence. Facts only; a dashed tag marks what was not recorded, such as *Survey mode not stated*.
- **Process dial** (after a “typical day” clock): Claims as a dial with one segment per stage, before and after, stepped with buttons. Orange marks where problems can surface; sage marks where verification moved. Without JavaScript, both processes are shown as step lists.
- **Shared legend**: solid ink established, dotted inferred, orange thread, sage check, orange ring where two things part. It sits under the pattern drawing, the strand line and the dial.
- **Card thumbnails** (after case-study galleries): each card shows the case's own distinction as a small drawing with the pair as text, for example *Delivered ≠ Verified*. No images that don't exist.
- Left for later: filter chips (worth it at about ten cases); the constellation, network graph and 3D references (Observatory only, or not yet); a case-study video (owner to record).

## Follow-up, 23–24 November: credibility, interaction and the ask

Owner notes: per-item hedges were undermining credibility; Test. Show. Enable. and Related. Not equivalent. should be interactive; the Observatory was missing the layered connections field; remove the previous-site list; the call to action should speak to a decision-maker; Contact gets the résumé after the form.

- **Hedges.** Figures no longer carry *Approximate · my estimate*; only a basis that adds weight (*Measured*, *Platform-reported*) is named. Statements and limitations no longer repeat *owner-reported*. Each case states its sourcing once: *project records, notes and deliverables; client and partner records are confidential*. The stale *Sources are pending review* line on Claims is gone. The basis stays in the data. The release was prepared again.
- **Related. Not equivalent.** Research looked at explorable explanations (Bret Victor, Nicky Case), the New York Times' *You Draw It*, Distill's *Communicating with Interactive Articles*, graph-view hover tracing (Obsidian) and accessible-graph guidance (Deque, CMU Data Navigator). Studies of predict-then-reveal (Rogha et al.; Case's replication) show more surprise and engagement, but not better recall. **Chosen pathway:** a field of six points on the night surface, one per case. Each point is two things taken for one. The reader predicts *the same* or *not the same*, and the point splits with the thread between the two. The panel gives the distinction, what changed and the case link. *Split them all* serves skimmers. Without JavaScript every point is already split and the six pairs are an open text list. No relationship between cases is drawn.
- **Test. Show. Enable.** One moving figure, chosen with native radios: a lens checks many explanations and one holds; two things pull apart; what held reaches the people who act on it. It is walked through the insurance operations case in its approved words. An optional *Play all three* steps once and is not offered under reduced motion. Without JavaScript all three moves show, each with its figure and questions.
- **Observatory.** The previous edition's layered system map returns as the **connections field**: *The work*, *+ Thinking*, *+ Archive*. Deeper layers sit smaller and drift less on pointer movement. Choosing a point traces its links in orange and lists each as a sentence. Case studies use their current names and pages. It is labelled as associations the owner drew, not evidence of cause. The whole field is available as text.
- **Removed:** *Looking for a section from the previous site?* Old fragments still redirect with JavaScript, and the build guard now accepts a mapped redirect in place of an on-page anchor.
- **Call to action:** *Before the next costly fix, understand the problem.* It has an offer of three outcomes, one primary action (*Start a conversation*), email and LinkedIn, and a line naming the settings worked in. There is a short prompt after the selected case studies.
- **Contact (`/contact/`):** the form opens the visitor's email app with the message written out. Nothing is stored or sent by the site. The résumé section follows. Until the owner supplies a reviewed PDF (`recruiterContact.resumeHref`), it shows the LinkedIn link.
- **Verified:** build passed; full suite in Chromium, WebKit, mobile WebKit (edge-case specs) and Firefox, 839 passed, 0 failed, 11 skipped. Screens checked at 1280 and 375 px. Not established: how readers respond to the predict-then-split field.

## Follow-up, 24 November: the call to action and a visual near the top

Owner note: the call to action and a visual need to be close to the top.

- **Hero action:** *Start a conversation* (to `/contact/`) is now the first action in the hero, before the case study link. The full call to action stays at the end.
- **Hero visual:** the six case studies' pairs, already split, sit beside the headline as a constellation in a taller two-column layout. The picture has a text alternative and links to the interactive field (*Split them yourself ↓*). On phones it follows the hero text.
- **Verified:** full suite 839 passed, 0 failed, 11 skipped; Atlas 22 passed. Screens checked at 1280 and 390 px.

## Follow-up, 24 November: optional depth folds into cards

Owner note: fold some homepage sections into accordion-style cards, after researching options.

- **Research:**
  - Nielsen Norman Group: accordions cost visibility and clicks; on desktop, scrolling is often easier, so fold only what most readers won't need.
  - GOV.UK Design System: never hide content every user needs, and test the content unfolded first.
  - Exclusive accordions (shared `name` on `<details>`) are supported in all major browsers, but they close one panel when another opens, which can surprise screen-reader users (Brosset). So each card opens independently.
- **Folded:** *How I investigate: Test. Show. Enable.* (with How I Know and the purpose line) and *Explore further* (Connections, Field Notes, Observatory, Edge Case). Each is a native `<details>` card under *Go deeper*, with a kicker, a heading, a one-line teaser, a small drawing and a plus that turns to a minus.
- **Kept open:** the hero (with its call to action and visual), the three possibilities, the figures, the selected case studies, the pattern field, the interlude and the call to action.
- **Links:** an address or link that targets something inside a folded card opens the card first. Cards open with keyboard and touch, and without JavaScript.
- **Verified:** full suite 839 passed, 0 failed, 11 skipped; Atlas 22 passed. Screens checked at 1280 and 390 px.

## Follow-up, 24 November: Experiments, before and after, artifacts

- **Menu:** *Observatory\** is now **Experiments\***. The original aim is unchanged: keep experiments apart from evidence (16 November hub decision; confirmed 19 November). The page heading is *Experiments\**, with *The Observatory · experimental* above it. The address stays `/lab/`.
- **Before and after:** the five cases without the pinned process (Trust, Enterprise AI, telematics, Vote Huntsville, accessibility) now open with a before/after figure under *At a glance*. It is built only from approved text: *Before · taken as one* gives the explanation people held, with the two things drawn as one; *After · kept apart* gives what changed, with them drawn apart. It is static and complete without JavaScript. Claims keeps its pinned figure.
- **Artifacts:** a private plan (not in the repository) sorts candidate artifacts into three routes: *yours outright*, *rebuilt* (structure only) and *redacted with permission*. It includes a redaction checklist. Real artifacts are added only after the owner clears them, through the normal release.
- **Verified:** full suite 842 passed, 0 failed, 11 skipped; Atlas suite passed.

## Follow-up, 24 November: About, the career thread, counting, the introduction

- **About (`/about/`, new, in the menu):**
  - headline: *I investigate why outcomes and their explanations part ways.*;
  - a portrait slot (`recruiterContact.portrait`, hidden until the owner supplies a rights-cleared photo);
  - the lead;
  - the career thread;
  - *What this site counts*.

  The fixtures-only About shell is retired.
- **Career thread** (About and Contact, in place of a résumé, with *Request the full résumé*). Three eras and *Next* along one orange thread, with proof as ink points:
  - **2011–2019 · Foundations: Design, code and access.** A degree (2011–2016), with early roles in 2012–2013 at one of the largest web-hosting and domain companies serving small businesses, and others.
  - **2019–2022 · Information systems: Knowledge that has to travel.** A global consumer-technology company known for its devices and support experience. Marked *context being written*; the owner is writing it.
  - **2022–2026 · Enterprise investigation: Explanations that cost money.** One of the largest U.S. auto insurers, known for usage-based pricing.
  - **Next · Systems strategy, before the fix.** Its call to action is *Bring me the problem your organization keeps paying to fix.*
  - **Format:** each era is a turn (*I learned that…*) with what was owned and links to the published case studies. Organizations are described, never named. The ownership wording was drafted for owner review and is not approved.
- **Counting** (`worker/count.ts`, `src/analytics.ts`):
  - **What is stored:** `POST /api/count` writes event, path and an optional short detail to Workers Analytics Engine (`producing_curiosity_counts`). No IP address, user agent, cookie or identifier is kept.
  - **When nothing is stored:** previews and local runs, and Do Not Track or Global Privacy Control signals (honoured in the browser and in the Worker).
  - **Opting out:** *Don't count me* (or `?count=off`) is remembered in this browser only.
  - **The notice:** a first-visit notice says what is counted and why, offers a one-click way out, and waits until the introduction has closed. A toast confirms each choice. About shows the current state and the toggle.
  - **Reading the counts:** `scripts/counts-report.ts` prints totals; it needs an Analytics read token.
- **Introduction:** the same four actions (three steps plus Dive), recast as a short investigation: notice, test, show. It is drawn in the deck palette; see `docs/INTRO-STATES.md`. The legacy fixtures edition is unchanged.
- **Footer experiment note:** updated for the retired archive, the new introduction and counting.

## Launch, 24 November

- **Owner change before approval:**
  - *Skip to main content* no longer shows after the introduction. It stays in the page for keyboard and screen-reader users and appears only when focused.
  - *Replay introduction* moved from the hero to the footer.
- **2019–2022 era:** the *context being written* marker was removed. Its lines come from the owner's own summary.
- **Approval:** the owner approved and asked to launch ("the site is ready, launch it").

## Follow-up, 24 November: removing the "generated" look (spacing, type, labels, threes)

**Feedback:** a reader said the site looks AI-generated and called out the spacing. The audit, measured on the live homepage, found:
- seven sections in an identical frame (1px rule, 48px margin, 40px padding);
- ten body text sizes, from two type systems;
- 22 small orange all-caps labels;
- groups of three repeated five times;
- six stacked items in the hero.

**Changes:**
- **Rhythm:** related sections share a band (the figures with the case studies; the pattern with the practice and explore cards), and only the big shifts get space and a rule.
- **Type:** one scale of five steps: .875rem small, 1rem body, 1.25rem lead, headings, display. `--step--1` and `--step-1` are now fixed values.
- **Labels:** four remain visible on the homepage (identity, *What changed*, the field's prompt, the interlude). Case settings are plain muted text, not labels.
- **Hero:** label, headline, the lead, *Start a conversation* and the case study link, beside the constellation. The value line, practice areas and tagline left the hero. The tagline and areas moved to About; the value line duplicated the lead and the call to action, so it was dropped.
- **Threes:** *Three things my work makes possible* was removed, because the lead and the call to action carry it. The first case study is featured across the full width, with two beside each other below it. The call to action sets the argument against a list of what you get, not three cards.
- **Waiting on the owner:** headline rewrites (the repeated contrast device, *X. Not Y.*) and a licensed typeface.
- **Verified:** full suite 854 passed (the only failures were three now-unused rules, since removed; that spec now passes 36 of 36), 14 skipped.
