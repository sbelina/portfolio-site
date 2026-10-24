# Producing Curiosity: information architecture and publishing backend

Research and implementation brief • 22 October 2026

Prepared for Sam Belina. This is a proposed architecture and Codex handoff, not an implemented backend or a production release. Recommendations below distinguish observed repository facts, documented platform capabilities, and design hypotheses to test.

## 1. Recommended decision

Turn the current portfolio into a collection of durable, individually addressable pages. Keep a short, curated home page. Use Investigations to show work, Patterns to connect insights across work, Perspective to explain how you think, and About to establish your role and background. Keep the graph as an optional way to explore the same content.

Use a private, structured content repository and trial Pages CMS as the authoring interface. Publish a validated public snapshot to the existing React/TypeScript/Vite site on Cloudflare Workers. The first backend is a publishing pipeline, not a public database API. Visitors should be able to read the site even when the CMS is unavailable.

Keep three things separate:

| Concern | Example | Owner |
| --- | --- | --- |
| Content identity | An investigation and its evidence | Content model |
| Navigation | Its URL, collection, related pages | Route and relationship model |
| Interaction | Open evidence drawer, hovered node, shimmer | UI state |

Adding a page should mean creating content. Changing a title should not break relationships. Publishing a draft should not require editing a React component. A visual experiment should not change the underlying editorial facts.

## 2. What exists today

Repository reviewed: [sbelina/portfolio-site](https://github.com/sbelina/portfolio-site). Inspection was against main commit `0fb948124a5f02455818f10bbbdc53d2fafbe6b4` (tree `562fe5f2c8f2f23bd32e173a48064ff5a7485218`); Codex must resolve the current commit again before implementation.

- React and TypeScript with Vite; no installed routing layer or content backend in the inspected package.
- `src/App.tsx` presents sections on one page. Navigation points to fragment identifiers such as `#work`, `#connections`, `#practice`, and `#field-notes`.
- Structured case information lives in `src/data.ts`; some prose remains in JSX.
- `wrangler.jsonc` uses Workers static assets with `single-page-application` fallback.
- `docs/CONTENT-ARCHITECTURE.md` already proposes a private Git-backed Content Studio trial. This brief develops that proposal instead of replacing it.
- `docs/AUDIT.md` reports a custom-domain deployment problem and a working Worker deployment. That is a repository-reported finding, not a fresh live-domain test in this brief. Recheck before changing deployment.

If “pagination” means the section navigation currently on the site, this is primarily a move from one long page to a multi-page architecture. Actual numbered pagination becomes a separate concern when collections grow.

Preserve existing work and reconcile any Emergent version before replacing features. An unavailable source export should be recorded as a parity risk; it need not prevent preparing schemas and an isolated prototype.

## 3. Expert advice translated into decisions

These are applications of the sources, not claims that an expert reviewed this particular site.

| Source / idea | Application here | What to verify |
| --- | --- | --- |
| [NN/g: progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Give a useful first reading, then optional evidence and deeper exploration. | Visitors can understand your role and central finding without opening every panel. |
| [NN/g: tree testing](https://www.nngroup.com/articles/tree-testing/) | Test labels and hierarchy before elaborate motion. | People know where to find work, methods, writing, and contact. |
| [Google: pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) | Collection pages need distinct URLs, ordinary links, and their own canonical URLs. | Page 2 works on direct load and is not canonicalized to page 1. |
| [Andy Matuschak: fine-grained associations](https://notes.andymatuschak.org/Prefer_fine-grained_associations) | Explain why two pieces are linked, close to the relevant claim. | Readers can explain the connection rather than merely noticing a graph edge. |
| [Amelia Wattenberger: evolving the infinite canvas](https://wattenberger.com/thoughts/evolving-the-infinite-canvas/) | Experiment with different scales of inspection while retaining orientation. | Rich exploration has an equally usable reading path. |
| [W3C: disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | Implement expandable evidence with real controls and exposed state. | Keyboard and screen-reader use remains clear. |

Three adjacent topics are particularly useful: semantic zoom, where one subject supports several levels of detail; knowledge representation, where a relationship has an explicit meaning; and publishing systems, where drafts, approvals, and deployed versions are distinct. Together they make the site expandable without making its interface arbitrary.

## 4. Navigation and URL architecture

Initial primary navigation: **Investigations · Patterns · Perspective · About**. The site identity links Home. Contact remains visible as an action, with Search, Map, and Archive introduced as secondary utilities when useful. Do not launch empty destinations simply to complete a taxonomy.

| Destination | Proposed URL | Visitor expectation |
| --- | --- | --- |
| Home | `/` | Understand your focus and choose a promising starting point. |
| Work collection | `/investigations/` | Browse a clear, selected body of work. |
| Individual investigation | `/investigations/{slug}/` | Understand the question, your contribution, evidence, decisions, and limits. |
| Pattern collection | `/patterns/` | Find ideas that recur across situations. |
| Individual pattern | `/patterns/{slug}/` | Understand a principle, its examples, and where it fails. |
| Perspective landing | `/perspective/` | Understand your approach and find essays about it. |
| Perspective essay | `/perspective/{slug}/` | Read a coherent argument with examples. |
| About | `/about/` | Find your role, background, working style, and contact. |
| Notes, when warranted | `/notes/{slug}/` | Read a smaller observation without inflated case-study framing. |
| Experiments, when warranted | `/experiments/{slug}/` | Try something and understand what it tests. |
| Archive | `/archive/` | Browse all public material with predictable filters. |
| Map | `/map/` | Explore explicit relationships with a list alternative. |
| Search, when warranted | `/search/?q=…` | Find published content by words and concepts. |

The initial release needs Home, an Investigations collection and detail template, a Pattern detail template, Perspective, and About. Notes and experiments can exist as content types before they deserve dedicated navigation entries.

### What becomes a page?

Create a page when it has an independent question or purpose, deserves a shareable link, has enough substance to stand alone, or is referenced from multiple places. Keep a section when it only makes sense within its parent argument. Keep a transient state when it is merely a way of inspecting the same material.

- A complete Claims investigation deserves its own URL.
- Its limitations normally belong on that investigation, with a stable `#limitations` anchor.
- A recurring idea such as “Delivered ≠ Complete” can become a pattern if supported by approved material.
- Opening an evidence card does not automatically create a new page.
- An evidence artifact deserves a separate page only if context, provenance, or reuse warrants it.

Avoid splitting a short argument into multiple click-through pages. More URLs are useful only when they improve orientation, reuse, or independent reading.

### Collection pagination

Start with all approved investigations visible if the collection is still small. When scanning becomes difficult, use a tested page size; 12 cards is a starting hypothesis, not an evidence-based universal rule.

Use `/investigations/` for page 1 and `/investigations/page/2/` for page 2. Redirect `/investigations/page/1/` to the collection root. Every page gets an accurate title, a self-canonical URL, and crawlable Previous/Next links. Invalid or out-of-range pages return a real 404. Use a deterministic order with an ID tie-breaker so entries do not randomly shuffle.

Filters may use query parameters, such as `/archive/?type=observation&topic=systems`. Changing a filter resets the page. Selected filters and result counts are visible and removable. Preserve filters when visiting a result and returning. Initially keep arbitrary search/filter combinations out of the sitemap and mark them noindex; do not incorrectly call materially different results duplicates of an unfiltered page. Curated topic landing pages can become indexable later.

### Legacy links

Maintain a reviewed migration manifest. Proposed mappings include:

| Existing location | Proposed destination |
| --- | --- |
| `/#work` | `/investigations/` |
| `/#connections` | `/map/` when available, otherwise a retained useful home section |
| `/#practice` | `/perspective/` |
| `/#field-notes` | `/archive/?type=field_note` until a Notes collection exists |
| `/#archive` | `/archive/` |
| `/#contact` | `/about/#contact` |
| `/#claims-operations` | `/investigations/claims-operations/` |
| Other existing case and essay IDs | Their individually reviewed canonical destinations |

A server cannot see the fragment after `#`. Legacy fragment compatibility therefore needs a small client-side mapping on the home page, plus useful fallback anchors or links in the HTML. Do not describe this as an HTTP redirect. Old path aliases can use permanent server redirects. Preserve unrelated query parameters only where appropriate; never forward arbitrary redirect targets.

## 5. Reusable page templates

### Home: orientation and editorial selection

Include a concrete statement of what you investigate, a short explanation of your contribution, three or four selected entries, one cross-case pattern, a small recent-notes area if populated, and a clear route to About/contact. “Seeing What Systems Miss” can provide the editorial voice, supported by plain language describing the actual work.

The home page should let a visitor decide where to go in roughly one screen of reading. Treat this as a usability goal to test. Do not duplicate every full case study or require a graph interaction before work can be reached.

### Investigation: accountable reasoning

Required introductory elements:

1. Title and concise question or problem.
2. A short summary explaining what you found or changed.
3. Your role, collaborators where relevant, timeframe, and context.
4. A clear statement of contribution: observed, diagnosed, proposed, implemented, or measured.

Body modules, included when warranted:

- Context and the initial assumption.
- What did not add up.
- Evidence, with provenance and limitations.
- Interpretation and alternative explanations.
- Decision or intervention, distinguishing recommendation from implementation.
- Outcomes with measurement method, date range, denominator, and uncertainty when available.
- What remains unresolved and what you would test next.
- Related patterns with explanations of the relationship.

Provide section anchors and a table of contents for longer cases. Keep the central finding, your role, and material limitations visible. Optional disclosure is appropriate for supporting detail, not for hiding qualifications that change the conclusion.

A case without outcome measurements is still publishable if honestly framed as diagnosis or a proposal. Do not fill an empty “Results” section with invented success language.

### Pattern: reusable insight

Include a one-sentence proposition, the conditions under which it appears, at least one illustrative investigation, a practical diagnostic question, counterexamples or boundary conditions, and explained related concepts. Mark a pattern provisional if its support is narrow. A single case does not demonstrate a universal principle.

### Perspective: argument and method

Include a thesis, your reasoning, concrete examples, limits or tensions, and links to work that demonstrates the method. The landing page can incorporate current Practice prose; extract it from JSX into authored content.

### Observation / field note: small and honest

Include what was noticed, when and where, why it might matter, evidence if available, and the next question. “Field note” can be a display format for an observation; preserve legacy values through a migration adapter rather than silently reclassifying existing content.

### Experiment: testable and reproducible

Include the question, hypothesis, adjustable variables, procedure, interpretation guide, result status, and accessible non-interactive explanation. State when data are illustrative or simulated. Render interactive blocks through a registered component with validated props; authors must not need to paste executable JavaScript.

### Shared elements

Use one shell with consistent navigation, a skip link, meaningful page titles, breadcrumbs where helpful, type/date/role metadata, readable content width, evidence blocks, related-link explanations, and a restrained footer. Add print-friendly reading styles. Show updated dates when meaningful; do not refresh them on every deployment.

## 6. Nested states and visual behavior

Use nested information without making every nesting level a new navigation system.

| State | Where stored | Expected behavior |
| --- | --- | --- |
| Which article | URL path | Shareable, reloadable, direct HTML response. |
| Which section | URL fragment | Linkable; focuses or scrolls to a meaningful target. |
| Filter or search | Query parameters | Back/Forward restores it. |
| Selected graph node | Query parameter if shareable | Invalid selections fall back gracefully. |
| Expanded supporting detail | Local component state by default | Keyboard accessible; does not flood browser history. |
| Motion preference | System preference, optional user setting | Reduced-motion mode preserves meaning. |
| Hover, light response, shimmer | Ephemeral state | No editorial or navigational responsibility. |

Use links for navigation and buttons for actions. A route change updates title and establishes a sensible focus target; Back should restore reading position rather than repeatedly jumping to the heading. Test these separately. Keep native modified-click and open-in-new-tab behavior.

The current intro checks browser storage and fragments. Refactor it so direct content URLs bypass the intro, browser-only APIs are not read during server/build rendering, and returning visitors are not interrupted. The initial render must be deterministic to avoid hydration mismatches.

Preserve the visual vocabulary: violet for unresolved questions, coral for pressure or friction, teal for what holds. Always pair color with words or shapes. Reflective input styling can communicate focus or activity, but continuous shimmer should not imply that a completed action is still processing. Motion should reveal relationship or state changes and remain optional.

## 7. Content model: structured but not overconstrained

Use immutable IDs for relationships and editable slugs for URLs. Store authored content independently of page layouts. A useful initial model is:

```ts
type EntryKind =
  | 'investigation' | 'pattern' | 'perspective'
  | 'observation' | 'experiment' | 'reference';

type EditorialState = 'draft' | 'review' | 'approved' | 'withdrawn';

interface Entry {
  schemaVersion: 1;
  id: string;                 // UUID; never derived from title
  kind: EntryKind;
  format?: 'case' | 'field_note' | 'essay';
  slug: string;
  title: string;
  summary: string;
  editorialState: EditorialState;
  visibility: 'public' | 'restricted';
  createdAt: string;
  updatedAt: string;
  firstPublishedAt?: string;  // derived from release history
  authorIds: string[];
  contribution?: string;
  topicIds: string[];
  blocks: ContentBlock[];
  evidenceIds: string[];
  aliases: string[];
}

type ContentBlock =
  | { id: string; type: 'prose'; markdown: string }
  | { id: string; type: 'evidence'; evidenceId: string }
  | { id: string; type: 'image'; assetId: string; caption?: string }
  | { id: string; type: 'callout'; label: string; markdown: string }
  | { id: string; type: 'interaction'; component: string;
      componentVersion: number; props: Record<string, unknown> };

interface Relationship {
  schemaVersion: 1;
  id: string;
  fromId: string;
  toId: string;
  type: 'supports' | 'challenges' | 'extends' | 'illustrates'
      | 'depends_on' | 'emerged_from' | 'shares_pattern';
  rationale: string;
  evidenceIds: string[];
  reviewState: 'proposed' | 'approved' | 'rejected';
  provenance: 'owner' | 'import' | 'assistant_suggestion';
}
```

This is a starting contract, not a drop-in compiled module. Add runtime schemas for every union and field. Validate interaction props against the registry entry; `Record<string, unknown>` is not sufficient validation. Use Markdown with sanitized rendering, not executable MDX from the editor.

Keep relationships in one canonical collection. Derive incoming and outgoing links from it rather than storing separately editable copies on both entries. A backlink is reverse navigation, not evidence that the inverse relationship is true. Treat `shares_pattern` as symmetric and normalize endpoint ordering; other types are directional.

Evidence records need a source locator, title, author/source, access or observation date, support/challenge role, rights/redaction status, visibility, and limitations. Metrics additionally need unit, denominator where applicable, measurement period, comparison baseline, and a defensible source. Missing evidence should result in a narrower claim or an explicit limitation.

Assets need an immutable ID, checksum, MIME type, dimensions where applicable, alt text or a deliberate decorative designation, caption, credit/rights, and visibility. Private originals and public derivatives must be distinct objects. Sanitize or rasterize untrusted SVG; do not publish active uploads merely because their extension says “image.”

The repository proposal includes publication within editorial status. This brief refines that: editorial readiness and actual deployment are separate dimensions. A published item can have a new draft revision while its previous approved revision remains live. The interface should show both, such as “Draft revision 8; live revision 6.” Preserve compatibility through an explicit schema migration.

## 8. Backend recommendation: Git first, private by design

### Components and responsibilities

| Component | Responsibility |
| --- | --- |
| Public application repository | Templates, styles, route generation, validators, tests. |
| Private content repository | Authored entries, evidence, relationships, revisions, editorial configuration. |
| Pages CMS trial | Forms, references, media selection, save actions. |
| Protected preview | Render an exact candidate revision and its private assets for the owner. |
| Release workflow | Validate, obtain approval, construct public projection, build and deploy. |
| Existing Worker | Serve the compiled public website and true 404 responses. |

Suggested content repository layout:

```text
content/entries/{uuid}.md
content/relationships/{uuid}.json
content/evidence/{uuid}.json
content/assets/{uuid}.json
content/people/{uuid}.json
content/topics/{uuid}.json
site/navigation.yml
site/home.yml
.pages.yml
```

Use stable filenames where supported; store the public slug in metadata. Keep large/private originals in appropriate private object storage rather than growing Git indefinitely. Public approved derivatives can enter the built artifact. Navigation and featured selections reference IDs so a title or slug change does not break them.

### Pages CMS feasibility

Current Pages CMS documentation describes collection reference fields, configurable stored values, and actions that dispatch GitHub workflows. These are promising building blocks for selecting related entries and adding Preview/Publish controls. They do not by themselves prove that this site's approval and privacy requirements are met. [Reference fields](https://pagescms.org/docs/configuration/fields/reference/) · [Actions](https://pagescms.org/docs/configuration/actions/)

Configure reference values as immutable IDs, such as `{fields.id}`, and display titles for people. The documented authentication model supports GitHub user tokens and installation-token fallback; inspect the actual deployment and session behavior rather than inferring credential exposure from those names. Verify write credentials remain server-side and authorization is checked for the correct repository. [Authentication](https://pagescms.org/docs/development/authentication/)

The trial must demonstrate:

- Create, save, reopen, preview, revise, publish, unpublish, and restore without code.
- Select relationships by title while storing IDs, with a rationale and review state.
- Protected draft pages and protected draft assets, including direct URLs.
- Clear distinction between a saved draft and the version visitors can see.
- Rejection of stale edits or a useful conflict-resolution workflow.
- A recoverable export and a successful restore exercise.

Do not build custom OAuth just to force the CMS to fit. If a documented requirement fails, record it and compare a managed structured CMS or the Cloudflare-native fallback below. Confirm actual service terms, costs, and operational requirements before provisioning; this brief assumes no free-tier guarantee.

### Publication contract

Saving must never publish automatically. A status field controlled by the browser is not authorization to deploy.

1. Save a revision to the private content source.
2. Validate syntax, IDs, references, rights, claims, aliases, and graph invariants.
3. Freeze a candidate: content commit, application commit, schema version, and asset checksums.
4. Build an authenticated preview for that candidate.
5. Owner reviews the exact candidate and approves it through a protected action.
6. Generate a public projection containing only explicitly approved entries, relationships, and allowed assets.
7. Run public-artifact checks; build the full public release; deploy that exact artifact.
8. Confirm deployment health, then record the active release. On failure, keep the prior healthy release active.

The approval record binds the candidate digest and authenticated approver. Treat workflow inputs, including a claimed user name or commit SHA in a payload, as untrusted until verified. Protect the workflow definition and production secrets from content-only edits. Publishing permissions belong to the deployment environment or trusted service, not to a content field.

Serialize production deployments so an older slow build cannot overwrite a newer release. Use idempotent release identifiers and an expected previous release. Editing after approval creates a new candidate requiring review; it must not silently alter an approved artifact.

An unpublished update should not remove the current public version. Construct releases from selected approved revisions, not simply from every file at the latest private branch head. If latest draft B depends on unpublished pattern C, omit B until both approved revisions are selected or report a blocking dependency.

Keep a release manifest containing the selected revisions, build identifier, digests, deployment result, and previous release. Store authoritative release history privately or as trusted CI records; publish only harmless version information. Rollback redeploys a previously approved artifact after checking whether it would re-expose withdrawn material.

For the initial trial, GitHub workflow actions and protected approval can provide these controls without a bespoke publishing API. Verify the chosen repository plan supports the required protections. If it does not, use a trusted server-side approval service or a controlled local release workflow until the requirement is met.

### Privacy boundaries

The public compiler should accept only an allowlisted public schema. Do not import the full private dataset into frontend code and filter it at runtime. Check HTML, JavaScript, JSON, route data, source maps, search indexes, sitemap, graph exports, media, and build logs for restricted content.

Private previews require authentication before both page and asset delivery. An obscure URL, robots.txt, and noindex do not provide access control. Avoid publicly accessible preview deployments containing private material. Preview cookies and caching must not allow one user's private response to become public cache content.

Removing public content prevents future serving through controlled routes; it cannot guarantee erasure from third-party caches, downloads, or public Git history. Keep restricted source material out of public storage from the beginning.

## 9. Rendering and deployment

Keep React/TypeScript/Vite. Introduce a route manifest derived from the approved public projection. Produce a full HTML document for every published URL, with accurate title, description, canonical URL, social metadata, headings, and main text.

Adding a client router alone does not accomplish this. Choose a maintainable prerender integration compatible with the existing pinned toolchain. React Router documents prerendering and explicit enumeration of dynamic paths, but adopting its framework plugin changes build conventions; record that tradeoff before choosing it. A minimal Vite static-render entry is another option only if it avoids creating a fragile home-grown framework. Do not perform an unrelated Next.js or Astro rewrite. [React Router prerendering](https://reactrouter.com/how-to/pre-rendering)

Acceptance matters more than the adapter: direct requests must receive the right HTML, pages must hydrate without mismatches, all approved slugs must be generated, and unknown slugs must return 404. Existing browser-only initialization needs an SSR-safe boundary.

For prerendered assets, replace unconditional SPA fallback with a real 404 strategy. Cloudflare documents `404-page` handling and configurable slash behavior. Use one consistent trailing-slash convention throughout links, canonicals, redirects, and generated files. If Worker code protects preview assets, configure routing so static asset serving cannot bypass authentication. [Cloudflare SSG routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)

Keep reading pages lightweight. Load the graph and experiments only on relevant routes or deliberate interaction. Optimize media dimensions and loading; avoid layout shifts. Use Core Web Vitals as operational targets, with field measurements when enough traffic exists: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile. Lab tests are useful diagnostics, not equivalent to field results. [Web Vitals](https://web.dev/articles/vitals)

## 10. Cloudflare-native fallback, only if the editor trial fails

Use a Worker API, D1 for structured metadata and revisions, R2 for private media, and an established owner authentication system. This is more engineering, so build it only to satisfy a specific failed requirement. Keep the same portable schema and static public release contract.

Suggested logical tables:

| Table | Essential responsibility |
| --- | --- |
| `entries` | Stable ID, kind, current draft revision; no implied public status. |
| `entry_revisions` | Immutable versioned document, author, timestamp, digest. |
| `relationship_revisions` | Versioned endpoints, type, rationale, provenance, review. |
| `evidence_revisions` | Versioned source, rights, visibility, limitations. |
| `assets` | Object keys, checksums, metadata, private/public derivative identities. |
| `approvals` | Approver, candidate digest, timestamp, revoked state. |
| `releases` | Candidate, state, prior release, artifact and deployment identifiers. |
| `release_items` | Exact entry/relationship/evidence revisions in a release. |
| `slug_aliases` | Unique canonical and legacy route ownership. |
| `audit_events` | Who changed or published what and when. |

Use foreign keys and uniqueness constraints where possible; enforce cross-record editorial rules in a shared validator. A slug rename reserves its old route as an alias. A referenced entry cannot be hard-deleted without resolving dependencies. For actual permanent deletion, define retention and backup implications explicitly.

Illustrative authenticated API contract:

| Endpoint | Behavior |
| --- | --- |
| `POST /api/admin/entries` | Create a draft and return its ID and revision. |
| `PUT /api/admin/entries/:id` | Save with `If-Match`; reject stale revisions. |
| `POST /api/admin/relationships` | Validate endpoints and create a proposed relationship. |
| `POST /api/admin/assets/uploads` | Authorize a size/type-limited upload to private storage. |
| `POST /api/admin/candidates` | Freeze and validate a candidate; return its digest. |
| `POST /api/admin/candidates/:id/approve` | Record owner approval for the exact digest. |
| `POST /api/admin/releases` | Queue an approved candidate with an idempotency key. |
| `GET /api/admin/releases/:id` | Report queued/building/deployed/failed state and useful errors. |
| `POST /api/admin/entries/:id/restore` | Create a new draft from an older revision. |

Authenticate and authorize every admin request, protect cookie-authenticated writes against CSRF, validate input at the server, and use bounded queries/uploads. Never trust an author ID, role, approval flag, or visibility assertion supplied by the client. Public pages continue to read compiled artifacts rather than querying admin endpoints.

D1 transactions cannot atomically encompass an external build and deployment. Model release progression explicitly, retry safely, and reconcile recorded versus observed deployment state. Store secrets outside browser bundles. Exercise database export, object backup, and restoration before relying on this system.

## 11. Authoring experience: what “add more as I build” means

The owner workflow should be ordinary:

1. Select New → Investigation, Pattern, Observation, Perspective, or Experiment.
2. Enter a title, a useful summary, and content blocks. Save incomplete drafts.
3. Add evidence and assets with clear rights/visibility fields.
4. Search existing entries and create explained connections.
5. Preview the page, collection card, and related-content appearance together.
6. Resolve specific validation messages, such as “This relationship points to a private draft.”
7. Review a publication diff and publish the exact candidate.
8. See “Live” only after deployment succeeds; retain an understandable failure state otherwise.

Required feedback states: unsaved changes, saving, saved revision, conflict, preview building, preview ready, review required, publishing, live, failed, withdrawn. Avoid a single green checkmark that ambiguously means either saved or published.

Routine additions should automatically generate routes, cards, backlinks, graph nodes, search entries, and sitemap entries where applicable. Home-page featuring remains a deliberate editorial selection. A new layout block or fundamentally new content type is a developer task; a new entry of an existing type is not.

## 12. Migration and phased implementation

### Phase 0 — establish the baseline

Resolve the current commit, read applicable repository instructions, inspect deployment and CI, inventory every existing anchor/content ID, and record the source of truth for each case. Preserve local changes. Recheck custom-domain routing and compiled assets before attributing behavior to the application. Do not change DNS as part of an unapproved content prototype.

### Phase 1 — one connected slice

Convert a copy of the reviewed Claims investigation, one supported pattern, and one explained relationship into the proposed schema. Build collection/detail templates and actual URL routes in an isolated branch/preview. Preserve old fragment behavior. Confirm useful HTML without JavaScript and correct 404 responses.

No unverified metrics should be promoted merely because they exist in prototype data. For the accessibility case, preserve the distinction: the agent restored deliberately removed accessibility code; a human separately identified weak red/green Focus/Break distinction during planned review. Do not collapse these into an invented AI failure. Keep the seven-hire onboarding, paperwork-guide views, and total-loss training artifacts distinct unless primary material supports combining them.

### Phase 2 — prove editorial independence

Trial the editor against a private content source. The owner creates an Observation with three meaningful connections, saves it, reopens it in a new session, previews, publishes, revises, and restores it without touching code. Check that changes persist after deployment and that drafts remain private. This is the adoption gate for the CMS.

### Phase 3 — migrate the archive

Convert content in reviewed batches. Compare text and content counts, resolve aliases, validate references and rights, and keep a migration ledger. Introduce secondary utilities only as content volume warrants them. Preserve graph direction and labels; do not automatically treat every edge as an interchangeable undirected connection.

### Phase 4 — refine through observed use

Test comprehension and findability, then introduce context-preserving transitions, local graph views, or interactive experiments. Keep a text route for every important concept. Add sophisticated search or relationship editing only when basic authoring and browsing expose a concrete need.

## 13. Validation and release acceptance

| Area | Required proof |
| --- | --- |
| Content integrity | Stable unique IDs, valid schemas, valid endpoints, no alias collisions, no broken evidence references. |
| Editorial truth | No fabricated outcomes; contribution and limitations distinguish observation, proposal, implementation, and measurement. |
| Public privacy | Restricted test strings absent from all public artifacts; private page and asset URLs deny unauthenticated access. |
| Routing | Direct load, refresh, Back/Forward, anchors, old links, pagination, and real HTTP 404s work. |
| Rendering | Correct initial HTML/head for every generated page; no hydration errors. |
| Accessibility | Keyboard operation, focus, headings, contrast, zoom/reflow, reduced motion, and text graph alternative receive manual checks. |
| Publishing | Exact revision approval, stale-edit rejection, failed-build safety, serialized deployment, rollback, and withdrawal are demonstrated. |
| Owner independence | New Observation plus three explained connections, publish and restore without source-code edits. |
| Recovery | Portable content export and restoration tested; private originals recoverable. |
| Performance | Reading routes do not eagerly load graph/experiment code; measure representative pages and set budgets from the baseline. |

Use existing Playwright and content-integrity tests as the foundation. Add tests for meaningful new failure modes, not snapshots that merely mirror implementation. Include at least one negative test for an approved entry linked to a restricted draft and one stale-candidate publication test.

A lightweight tree test should ask visitors to find evidence of your work, understand your approach, locate a smaller observation, and contact you. Watch first choice, success, wrong turns, and the words they expected. Small qualitative sessions uncover confusion; do not treat a handful of sessions as statistically conclusive conversion evidence.

For a case reading test, ask: What was the question? What did Sam do? What evidence supports the conclusion? What remains uncertain? Why is the related pattern relevant? These reveal understanding more directly than time-on-page alone.

## 14. Copy-ready instruction for Codex

> Work in `sbelina/portfolio-site` using this brief and the existing `docs/CONTENT-ARCHITECTURE.md`. First inspect the current branch, applicable AGENTS instructions, package versions, deployment configuration, existing tests, and uncommitted work. Treat this brief as a target proposal, not proof that its backend or routes already exist.
>
> Prepare an isolated implementation of Phase 1, followed by the Phase 2 editor proof where credentials and services are available. Keep React/TypeScript/Vite and the current Worker hosting. Preserve existing content, visual vocabulary, intro behavior where appropriate, and legacy links. Do not perform a framework rewrite or replace missing source material with guesses.
>
> Create a stable-ID content schema, explicit typed relationship records, runtime validation, a route manifest, collection/detail templates, and generated HTML for approved public routes. Keep authoring data separate from presentation. Do not load private source data into browser bundles. Ensure direct loads and unknown routes have correct HTTP behavior.
>
> Start with one source-reviewed investigation, one pattern, and one explained relationship. Use fixtures clearly marked as fixtures if actual content is unapproved, and prevent fixtures from entering production. Preserve the distinction between observations, interpretations, proposals, implemented changes, and measured outcomes.
>
> Trial Pages CMS with a private content repository. Prove ID-based references, protected preview and assets, revision-aware saving, owner approval of an exact candidate, explicit publishing, failure recovery, and restore. Use existing workflow capabilities before building a custom service. Do not assume editor status fields constitute publish authorization. Report any unmet CMS requirement precisely before choosing a fallback.
>
> Generate public releases from selected approved revisions. Bind approvals to content/application revisions and asset digests. Serialize deployments; retain the previous healthy release on failure. Avoid browser repository-write credentials, public draft artifacts, and secrets in Vite variables or logs. Protect deployment workflows and credentials from ordinary content edits.
>
> Add focused tests for content integrity, private-data exclusion, URL/legacy behavior, direct HTML/404 responses, accessible navigation, stale saves, exact-candidate approval, failure safety, and restore. Run the repository's applicable checks. Manually inspect representative mobile and desktop reading paths, keyboard use, reduced motion, and Back navigation.
>
> Keep the work concrete and reviewable: implementation, preview when available, migration ledger, architecture decision record, test results, owner instructions, limitations, and rollback procedure. Continue useful local work if external provisioning is unavailable; clearly distinguish implemented and verified behavior from planned integrations. Do not publish to production, modify DNS, purchase services, or destroy existing content without authorization. Ask only for missing information that materially blocks the next dependent step.
>
> Completion of the first release means a visitor can directly open a real investigation page and follow an explained pattern link, and the owner can create an Observation with three meaningful connections, preview it privately, publish the approved revision, and restore it without editing code. Do not expand into a graph database, AI runtime, collaborative editor, or elaborate custom CMS before this works.

## 15. Source register and limits

Sources accessed 22 October 2026. Platform documentation can change; verify compatibility and product terms during implementation. Design choices such as labels, page size, and template ordering are proposals requiring visitor/owner testing.

- [Repository](https://github.com/sbelina/portfolio-site) and its [content architecture proposal](https://github.com/sbelina/portfolio-site/blob/main/docs/CONTENT-ARCHITECTURE.md): inspected implementation baseline and prior project requirements.
- [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/): secondary detail and interface complexity.
- [NN/g tree testing](https://www.nngroup.com/articles/tree-testing/): evaluating labels and hierarchy independently of visual design.
- [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading): navigable URLs and canonical handling.
- [Google URL structure](https://developers.google.com/search/docs/crawling-indexing/url-structure): crawlable page URLs.
- [Matuschak fine-grained associations](https://notes.andymatuschak.org/Prefer_fine-grained_associations): explanatory connections as an inspiration.
- [Wattenberger on the infinite canvas](https://wattenberger.com/thoughts/evolving-the-infinite-canvas/): exploration and representation as an inspiration.
- [W3C disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): control semantics and expanded state.
- [Pages CMS configuration](https://pagescms.org/docs/configuration/), [references](https://pagescms.org/docs/configuration/fields/reference/), [actions](https://pagescms.org/docs/configuration/actions/), and [authentication](https://pagescms.org/docs/development/authentication/): documented primitives; not a completed security or usability evaluation.
- [React Router prerendering](https://reactrouter.com/how-to/pre-rendering): build-time route generation; evaluate toolchain compatibility before adoption.
- [Cloudflare SSG and 404 handling](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/): deployment routing behavior.
- [Core Web Vitals](https://web.dev/articles/vitals): performance thresholds and measurement context.

No deployment, CMS provisioning, source rewrite, or backend implementation was performed to produce this brief.
