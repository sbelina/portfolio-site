# Writing and page review workflow

Status: records and page inventory added; private manuscript storage, editorial UI, approval enforcement, and publication controls remain implementation work.

## Owner outcome

Sam has a Writing inbox and one Pages screen listing every potential page. They can inspect the full piece, compare suggested edits, preview the page and its connections, request changes, approve a particular revision, and publish it when ready. A draft does not disappear or publish just because its review status changes.

## Folder and storage contract

- Public application repository: `writing/review/` holds only already-public excerpts/descriptions and public-safe review records. `docs/codex/page-review.json` is the present planning inventory.
- Private content repository: `writing/inbox/{id}.md` holds canonical full manuscripts, metadata, source provenance, and revision history. Store restricted review notes separately by ID/revision. Folder names are organizational, not access controls.
- Keep original wording, paragraphing, poem line breaks, title punctuation, and authorship. Suggested revisions must remain distinguishable from the original.
- A manuscript links to one content ID. Its page route and relationship records reference that ID. Avoid two competing full-text sources between a “writing” folder and a “pages” folder.
- Promote approved content by compiling a selected revision into the public projection, not by copying all private writing to the application repository.
- “Inbox” remains a stable collection name; editorial state changes do not require moving files.

## Pages screen requirements

Columns: title, type, manuscript completeness, editorial state, candidate revision, approval state, live revision/status, proposed URL, blockers, and last meaningful update.

Filters: needs manuscript, ready for review, changes requested, approved/unpublished, live with newer draft, deferred, withdrawn; plus content type and topic.

Each row opens a reading preview with source/claim notes, suggested edits, metadata, and explained connections. Offer the actions **Request changes**, **Approve this revision**, **Publish approved revision**, **Defer**, and **Withdraw** only when their prerequisites and owner permissions are satisfied.

“Needs manuscript” is a real blocker: an excerpt cannot be approved as the full essay. An intentional fragment can be approved only when explicitly designated and reviewed as that complete publication unit.

## State contract

Editorial state: `needs_manuscript → draft → ready_for_review → changes_requested / approved`; changes requested returns to draft. Deferred is a reversible editorial choice.

Approval record: content ID, candidate digest, reviewer identity, time, decision, and optional note. The candidate binds body, metadata, selected assets, and proposed relationship revisions. Do not trust a client-editable `approved: true` field.

Publication is independent: never published, queued, publishing, live, failed, or withdrawn, with the actual deployed revision and URL. Record unknown/unverified state honestly for legacy pages until checked. Only successful verified deployment can mark a candidate live.

Any content-affecting change after approval requires approval of a new candidate. Editing a live page leaves its previous approved revision live. Approval can remain unpublished indefinitely. Batch approval/publishing must show the exact items and candidates; do not infer approval of one piece from approval of another.

## Reviewer assistance

Use the [validated review rubric](REVIEW-ROLE-VALIDATION.md) for source/rights uncertainty, reading integrity and complete public-surface coverage. Its synthetic trials supported stronger prepared Evidence, Experience and Release suggestions for future local-studio intake. Existing saved review records are preserved. This adds no seventh pass, autonomous reviewer or release authority; the local trial's implemented scope is recorded in [PRIVATE-WRITING-TRIAL.md](PRIVATE-WRITING-TRIAL.md).

Codex may prepare an editorial report covering purpose, audience, argument, structure, voice, factual support, accessibility, and possible connections. Separate mechanical suggestions from substantive reframing. Link notes to passages and explain the change. Sam keeps final authority over voice, interpretation, and publication.

For poems and creative prose, preserve ambiguity and formal choices unless Sam requests a change. Do not force creative writing into a professional case-study template. Decide archive versus Perspective placement after reading the complete piece.

## Constellation context

The atlas metaphor can explain cross-links: observations and pieces are points; patterns are reviewed interpretations connecting them. It does not make a visual association evidence of a relationship. Let Sam review each rationale, and provide ordinary links and a readable list alongside optional charts.

## Implementation sequence and acceptance

Extend W3/W4 in [the implementation plan](IMPLEMENTATION-PLAN.md), keeping W0–W2 as the foundational reading slice.

1. Connect private manuscript storage and demonstrate save/reopen of a complete original.
2. Build Pages list and full-text review preview from authoritative content/revision records.
3. Add revision-specific approval and explicit publish controls using the existing candidate/release architecture.
4. Verify missing-manuscript blocking, changes-requested flow, stale approval invalidation, approved-but-unpublished state, live-with-newer-draft state, publish failure, and withdrawal.
5. Prove public exports, preview assets, logs, and indexes exclude unpublished writing.
6. Have Sam review one complete piece, request an edit, approve the resulting revision, publish it, and restore an earlier revision without source-code changes.

Import the current inventory once with stable IDs; thereafter generate the admin list from authoritative records. Do not maintain a hand-edited JSON inventory and a database/CMS as competing sources of publication truth.
