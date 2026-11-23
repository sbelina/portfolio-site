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
