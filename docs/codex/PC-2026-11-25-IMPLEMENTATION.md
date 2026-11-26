# PC-2026-11-25 · Professional recognition, research accessibility and institutional value

Implementation report for the owner's master directive (received 26 November 2026). Branch `claude/jolly-turing-noyo4q`; nothing here is live until the owner merges the pull request. Implemented changes are marked as such; proposals and owner decisions are listed separately.

## 1. Executive summary

The directive's main problem was that existing work was slow to recognize. P0 is implemented:
- **Capabilities:** one capability registry drives the homepage, the Work filters, each case's next steps and the Practice methods inventory.
- **Work:** cards now state the problem, my part and what changed; an optional filter keeps its state in the address and works without JavaScript.
- **Homepage:** professional orientation is stronger, with the tagline under the headline, "Explore the work" as the primary action, figures that say what they measure, a capability index and three engagement pathways.
- **Contact:** asks the reason, adapts its prompt and says plainly that it *prepares* an email.
- **About:** adds a conventional career history and education.
- **Practice:** adds a methods inventory and a research agenda.
- **Bug fix:** a live hydration error on every case page is fixed (an invalid `<div>` popover inside a paragraph).

The search work from the previous request (titles, descriptions, structured data, sharing images) is on the same branch.

## 2. Verified starting state (discovery, 26 November)

- **Stack:**
  - React 19, Vite and TypeScript, with build-time prerendering (`scripts/prerender.tsx`).
  - A Cloudflare Worker for `/deep-dive/*` (password, KV) and `/api/count` (opt-in counting, Analytics Engine).
  - Plain CSS in cascade layers (`src/design/system.css`, `field.css`, `motion.css`), plus `src/reading/reading.css`.
- **Routes (sitemap, 17 indexable):**
  - `/`, `/experiments/reveal-hidden-work/`, `/practice/`, `/patterns/`, `/writing/`, `/about/`, `/contact/`, `/investigations/`;
  - nine cases under `/investigations/<slug>/`.
  - Not indexed: `/lab/` (Experiments, plus Atlas, Edge Case and Je ne sais qu'a), `/system/`, `/deep-dive/*` (password; `noindex` and `X-Robots-Tag`).
- **Work collection:** all **nine** approved cases were already listed. The audit's "only six exposed" finding is **outdated**; the earlier six-only state ended with PR #28.
- **Content sources:**
  - `content/release/*.ts` (approved cases, bound by digest in `content/public-release.json`; the owner approves by merging);
  - `src/content/*.ts` (recruiter, career, about, primary-evidence labels, search metadata).
  - Evidence: per-statement `kind` and `contribution`, case-level `evidence` records, and the `artifacts` field with provenance labels. A claim-level evidence system already exists (see §6), so no parallel schema was added.
- **Duplication found:**
  - The capability or setting labels existed in `primary-evidence.ts` (setting and kind of work) and as free text in the career thread. The new `capabilities.ts` holds classifications.
  - Headline figures already come from one record each: the 835 views appear on Home and in Claims from the same figure.
- **Résumé:** `recruiterContact.resumeHref` is `null`, meaning no approved résumé file, but Contact's meta description said "download the résumé". **Corrected.**
- **Privacy:** counting is opt-in (`src/analytics.ts`), Cloudflare Web Analytics is disclosed, and DNT and GPC are honoured. No new events were added; new links deliberately carry no `data-count`.
- **Baseline tests (before this work, with the search commit):** full Playwright suite **890 passed**, Atlas **22 passed**, build and deploy check passed.
- **Pre-existing defect:** React hydration error #418 on every live case page, confirmed on producingcuriosity.com.

## 3. Changes by phase (implemented)

### P0 · Recognition and navigation
- **`src/content/capabilities.ts` (new):**
  - Seven capabilities (organizational effectiveness, research strategy, service design, measurement and evaluation, responsible AI, knowledge and information systems, strategic innovation).
  - `caseCapabilities` maps each slug to its capabilities.
  - Also holds the methods inventory and the research agenda.
  - A capability shows only when a published case demonstrates it, so no empty capability pages exist.
- **Work (`src/reading/ReadingPage.tsx`):**
  - Each card gives setting, title, status, then **The problem / My part / What changed**, then capability labels and "Read the case study".
  - **Optional filter:** buttons with `aria-pressed`, an "All work" reset, counts, a `role="status"` result line, `?capability=` state with Back support, and an empty state with reset.
  - It appears only once the page is interactive. Without JavaScript all cases show, plus a static **"The work, by capability"** index.
- **Homepage (`src/BuildIndex.tsx`):**
  - The tagline sits under the H1, which is unchanged because it is distinctive and doesn't conflict.
  - Actions are **Explore the work** (primary) and **Work with me**; the résumé link stays hidden until approved.
  - Each figure now shows what it measures (its qualifier). This supersedes the 23 November "no per-figure hedge" direction, per the directive.
  - Adds a **"Find the work by capability"** index and **three pathways** (employment and research leadership; an organizational challenge; research, teaching or collaboration), each opening Contact with the reason set.
- **About:**
  - **Career history** table with titles as held. Employers are described, not named (see decisions).
  - **Education:** BA, Interdisciplinary Design, Iowa State University; minors in Digital Media and Philosophy.
  - A résumé request link and "Discuss a role".
- **Contact:**
  - A reason selector (employment, organizational, research, teaching or speaking, other) with adaptive prompts; `?reason=` preselects it.
  - The button now reads **Prepare email**, with the note "Nothing is sent from this page". The confirmation says only that the email app *should have opened*.
  - The career thread is removed and replaced by a link to About.
  - The meta description is corrected.

### P1 · Reading architecture
- **Every case** now ends with **"Where to go next"**:
  - other cases grouped by shared capability (a classification, not an asserted relationship);
  - "All … work" filtered links;
  - How I investigate;
  - **Discuss a similar question** (Contact, organizational reason).
- **The short read** (result first: what changed, the problem, what I did, how I knew) already opens every case, before the contents. It was left as it is.
- **Hydration fix (`src/design/Interactions.tsx`):** `SourceCites` popovers now use `<span>` elements, so they are valid inside the short read's paragraph. All nine cases now hydrate with no console errors.

### P2 · Research and engagement (partial)
- **Practice:**
  - A **methods inventory** in three families. Every method links to the case(s) whose public text shows it, with the note "not a formal credential".
  - A **research agenda** of four themes stated as continuing interests, each linked to cases, Field Notes, Experiments and Connections.
- **Titles:**
  - Practice: "Research methods and practice".
  - Work: "Case studies in applied research and systems strategy · Sami Belina".
  - Field Notes: "Field Notes: essays and research writing".
  - About: "About Sami Belina".
  - Case pages use the search titles from the previous request.

## 4. Files changed

`src/content/capabilities.ts` (new), `src/content/recruiter.ts`, `src/content/career.ts`, `src/reading/ReadingPage.tsx`, `src/reading/page-data.ts`, `src/reading/reading.css`, `src/BuildIndex.tsx`, `src/design/ResultsStrip.tsx`, `src/design/FoundationPage.tsx`, `src/design/field.css`, `src/design/foundation.css`, `src/design/Interactions.tsx`, `src/design/motion.css`, `scripts/prerender.tsx`, `tests/directive-pc-2026-11-25.spec.ts` (new), `tests/about-counting.spec.ts`, and this report.

## 5. Architectural decisions

- **The capability registry is separate from the approved-content digest.** Capabilities are presentation classifications, not case claims, so they live in `src/content/`. Changing them needs no new release approval, and no case wording changed.
- **Next steps come from shared capability, not inferred relationships.** The project rules require owner approval for relationships between cases, and the 13 proposed connections in the private registry remain unapproved. The "Related. Not equivalent." homepage field stays at six points by design.
- **The filter is progressive enhancement**, so the static HTML is complete and indexable. No dependency was added.
- **No new counted events, processors or data collection.**

## 6. Evidence and attribution

- **No figures, claims or case text changed.** Evidence categories already exist as statement kinds (direct observation, measured result, documented outcome, interpretation, hypothesis, illustration, intended benefit, unverified) with contribution levels. Figures carry a basis (owner estimate, approximate, platform-reported, measured). These map onto the directive's categories, so no parallel claim schema was introduced. A modeled kind is expressed through the figure basis plus a "model" label, as with the typing model.
- **Checked against the directive's case notes** (no edits needed):
  - **Insurance:** onboarding chronology and roadshow ownership are already correct; no rework percentage.
  - **Trust:** the 800+ count and nine days are approved.
  - **Telematics:** no SUS-to-NPS relationship is claimed.
  - **Accessibility:** the simulation is framed as a possible weakness, labels are acknowledged and roles are attributed.
  - **Automation:** the typing time is labelled as a model and the 88% figure stays withheld.

## 7. Accessibility (automated and scripted checks; not a conformance claim)

- **Widths:** 320, 390 and 1280 px, with no horizontal overflow on Home, Work, filtered Work, a case page, Contact, About or Practice.
- **Filter:** reachable by keyboard (tested: focus plus Enter); state is exposed with `aria-pressed`; results are announced through `role="status"`; targets are at least 44 px.
- **Tables:** the career history and artifacts sit in labelled, focusable scroll regions, with `th scope` set.
- **Contact:** every field has a visible label, including the select.
- **Popovers:** source popovers open with valid markup.
- **Not done here:** screen-reader passes, 200% zoom, and a full contrast audit of new elements. These need manual review (§12).

## 8. Build and test results

These are the actual results from the session:

- `npm run build`: passed (86 public files, public artifact audit passed).
- `npm run check:deploy`: passed (dry run).
- **Full suite, first run** (`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium npx playwright test --trace off`): **905 passed, 12 failed.**
  - All 12 failures were older tests encoding the previous hero (Start a conversation first) and the old Work title.
  - Fixed by keeping the approved one-click path to the insurance case in the hero, making the tagline 16px on phones so that link stays on the first screen at 390 px, and updating the tests to the new order and title.
- **Rerun of the affected suites** (evidence-first, professional-alignment, consolidation, the directive tests, interactions with its dead-CSS check, about-counting, seo, seo-structured): **173 passed, 1 failed.** The failure was a WebKit radio click on About, unrelated to this change; it then passed 5 of 5 times with `--repeat-each=5`.
- `npm run test:atlas`: **22 passed.**
- **Hydration:** a scripted check of the nine case pages, Home, Work, Contact, About, Practice and Field Notes showed no console errors after the popover fix. Before the fix, error #418 appeared on case pages, including on the live site.

## 9. Privacy and confidentiality

- No employer, colleague or internal-system names appear. Education is named as given in the owner's directive.
- No new data collection.
- `private/` stays git-ignored.
- The deep dives stay behind the password.

## 10. Owner-decision register

| Decision | Why | Where | Current safe state | Alternatives and consequences |
|---|---|---|---|---|
| Name employers? | The directive lists employer names; the site deliberately describes them instead (24 Nov rule) | About › Career history, career thread | Described, not named | **Name them:** stronger recruiter recognition, but cases become attributable to employers, so check every case for confidentiality. **Keep described:** the current privacy. **Name only past employers:** a middle path |
| Current role's official title | Not in any source I hold | About › Career history | Function ("Claims operations and administration") with a "to be confirmed" note | Supply the title, or keep the function |
| Approved résumé file | No public résumé exists; the link is hidden | Home, About, Contact | "Request the full résumé" (email) | Supply a public-safe PDF, then I set `resumeHref` and the button appears |
| Recognition (strategic foresight selection) | No approved details or figures | About | Not shown; the career thread says "Took part in strategic foresight work" | Supply wording and figures to add a Recognition section |
| Relationships between cases | The rules require owner approval | Case "next steps", Connections | Grouped by capability only | Approve some or all of the 13 proposed connections to add typed "related, not equivalent" links |
| Field Notes full texts | The originals aren't recovered; the site must not generate essays | Field Notes | Excerpts with existing status | Supply the originals (Conjunction Conjecture, Calculus of Syntax, The Bends) |
| Contact delivery | A server-side form would add a processor and secrets | Contact | `mailto:` with honest wording | Approve a submission service (e.g., Cloudflare Email Routing via the Worker) |
| 88% purchasing-form figure | Raw timings not yet supplied | Operational friction | Withheld | Supply the timings and scope |
| Capability classifications | Editorial choices by me | `capabilities.ts` | Seven capabilities, mapped to the cases that show them | Rename, merge or remap any of them |

## 11. Deferred (not done in this pass)

- **Field Notes:** collections and per-item publication status (P2).
- **Experiments:** status records (P3).
- **Evaluation plans:** Atlas, Edge Case and hidden-work (P3).
- **Recognition section:** waiting on a decision.
- **Per-case scope summaries:** a new "orientation layer" field. The current method profile and short read cover most of it; a dedicated scope block needs per-case facts that aren't all recorded.

## 12. Usability evaluation (prepared, not run)

Use the existing [reader evaluation protocol](READER-EVALUATION-PROTOCOL.md), with the directive's four groups: 3–5 recruiters, hiring leaders, researchers and prospective clients. Each group gets its directive task:

| Group | Task |
|---|---|
| Recruiters | Find the capabilities and a relevant role, and locate the résumé route |
| Hiring leaders | Judge whether the person could investigate a complex problem, and explain the evidence |
| Researchers | Find a continuing question and the methods, and describe a potential collaboration |
| Prospective clients | Find a relevant engagement and the right Contact reason |

- **Capture:** completion, time to relevant evidence, misreadings, obstacles, recall of the professional identity, and the next action.
- **Primary open question, asked without priming:** "Based on what you encountered, what would you bring this person into your organization to do?"
- **No participants were recruited and no results exist.**

## 13. Rollback

Revert the merge commit on `main`; Workers Builds redeploys the previous version.

## 14. Follow-up decisions and changes (owner, November 2026)

- **Employers stay unnamed.** "Request the résumé" sits inside the career history. The current role is described by function, and the official title is on the résumé. There is no public résumé, because one would name employers.
- **Recognition and speaking:**
  - Recognition: the strategic foresight selection.
  - Speaking, from the owner's earlier résumés: "Navigating the Digital Realm" (a company-wide conference talk), an AI Summer Camp presentation on identifying AI-generated images, and Carnegie Mellon University HCII guest speaker and mentor (2023).
- **Contact delivery:** `/api/contact`, with its own spam defences and a limit of one message every five minutes for the whole site (KV `portfolio-site-contact`). It stays inactive until the owner sets up Email Routing and Turnstile (`CONTACT-FORM.md`).
- **Typefaces:** Outfit (main) and Source Serif 4 (case headlines and long reading), both self-hosted under the OFL. System monospace is removed from the design and reading CSS.
- **A figure per case:** each case has its own graph structure (directed path, independent axes, many-to-few mapping, no edge, path across a tree, loop with an outside check, contraction, star, merged classes). It appears on the cards and in the headline visual of each case page, named in words.
- **AI-tell cleanup:**
  - Six of nine case headlines rewritten as single statements.
  - Figure qualifiers rewritten as positive scope statements.
  - "Not X. Y." turns rewritten.
  - The three-part offer reduced to two.
  - The footer note shortened to one evaluation statement.
  - "At stake:" removed from homepage cards.
  - Pill shapes squared.
  - The word "actually" and filler words removed.
  - Owner-direction and date provenance removed from code comments.
  - Measured in visible text: em dashes 102 → 48 (the rest are the approved lead, quotations and table placeholders); sentences with "not" 18% → 12%; filler words 18 → 0.
