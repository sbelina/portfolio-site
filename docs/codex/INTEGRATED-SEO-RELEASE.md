# Integrated development and SEO release

Owner-authorized integration and publication,24 October2026. This is the current release record; earlier slice/trial records describe what was verified at their own commits and are preserved as history. PR/CI and production verification are recorded on the implementation PR after its exact candidate is built.

## Previous work verified first

Production `e52ec03` and PR4 were rechecked before creating the SEO/SEM agent: main and remote CI were unchanged/successful; a fresh custom-domain browser pass confirmed the approved experiment asset hashes, initial HTML,404, no eager p5, keyboard reveal, lazy motion, pause/reset/focus/disposal, preserved portfolio navigation, no-JavaScript reading/footer and emulated touch/reduced-motion/320px reflow. Prior healthy Cloudflare version: `f395e53f-7631-4221-bbb8-8419e64dbb03`.

The owner then explicitly selected integration of the older branches. Merge `95d7422` joins `feat/inspectable-assumptions` at `75b2820` (including connected-reading `093c222` and private-writing `f73f257`) with released main. No unrelated work was discarded. Writing-review records, inventory, legacy identities/anchors and the empty publication selection are unchanged byte-for-byte from that branch.

## Integrated behavior and publication boundary

| Area | Implemented and verified here | Remaining boundary |
| --- | --- | --- |
| Homepage/intro | Same portfolio, graph and legacy fragment destinations; useful initial HTML; the development branch’s one-action automatic intro, skip/replay and motion alternatives. | No reader-comprehension result or new portfolio claim. |
| Connected reading | Stable IDs, editable slugs/aliases, revisions, typed relationships, selected public projection, page-specific payloads, sanitized reading templates, literal poetry and accessible explanations. | No canonical full manuscript has approval; `/investigations/` is truthfully empty and noindex. |
| Visual experiments | Published illustrative hidden-work HTML/SVG+p5 route preserved; structured Assumed→observed block/editor proposal integrated. | Assumed→observed, poetry and investigation/pattern examples remain fixture-only; not deployed as real work. |
| Local writing | Authenticated durable local D1 save/history, immutable TXT/Markdown/DOCX originals, six prepared review passes, owner decisions on structure/edits/connections, exact candidate approval, protected pages/assets and export/restore. | Loopback-only separate Worker; no hosted CMS, remote owner session, production publisher or real manuscript import is supplied. Local candidates remain `releaseEligible:false`. |
| Pages CMS | Source comparison/probe and trial configuration are preserved. | `sbelina/pages-trial` still does not exist or is inaccessible to this integration; its creation previously returned `Resource not accessible by integration`. Real GitHub-app binding/native sign-in/save remains blocked. No local mock is substituted for it. |
| SEO/SEM | Shared titles/descriptions/canonicals/OG/Twitter, accurate home WebSite JSON-LD, canonical public sitemap, host-scoped Worker noindex and fixture/empty-collection/404 indexing exclusions. | No search-engine indexing/ranking outcome, external-account verification, paid campaign, tracking or ad spend. |

“Publish all changes” integrates the development source and production-safe public behavior. It does not move private originals, local database/session state, approved-but-unpublished candidates or synthetic manuscript fixtures into the site. Normal Wrangler configuration continues to serve only `dist`; fixtures and studio retain separate output/configuration. The actual default projection contains zero selected canonical entries. The standalone hidden-work illustration has its own earlier publication authorization; it is not inserted into that empty manuscript projection.

## SEO decisions

The [SEO/SEM agent audit](SEO-SEM-AUDIT.md) records live findings, verified primary references and a proposed search-intent brief. The main deficiency was a loading-only homepage response; integration now prerenders the same portfolio visitors see. Metadata uses visible professional scope without amplifying disputed metrics. Only the homepage and published illustration enter the default sitemap. No fake modified/publication dates, ratings, outcomes, credentials or nonexistent search features are added.

`scripts/seo.ts` generates metadata once for home, reading and experiment documents. The source sitemap was removed because prerendering now owns its route inventory. All fixture documents and their empty sitemap are noindex; empty collections and404 pages also receive noindex. `public/_headers` applies noindex to the existing productionWorker and branch/version hosts while leaving the custom domain indexable; actual hosted responses must confirm this. These indexing controls are not authentication. Existing Cloudflare-managed robots policy is preserved.

## Verification and limits

Local frozen install, application/tool/private TypeScript builds, production/fixture/private builds, public artifact audit, public/private Worker packaging dry-runs and diff checks passed. **96/96 public tests** and **10/10 private tests** passed. After the final footer copy clarification, all7 affected footer/SEO checks and the final build/package passed again. A real local Worker stop/start followed by fresh authenticated login preserved synthetic workspace revision28 and its digest. Private tests use their separate synthetic DB and credentials, preserving unrelated local author data.

Public coverage includes model validation, exact candidate digests and public projections, unrelated article-body exclusion, relationships/aliases/direct links/404, poetry punctuation/whitespace/safe rendering/reflow, no-JavaScript reading, diagram keyboard/touch/focus/inline expansion, one-action intro/replay/storage/failure recovery, p5 lazy loading and pause/offscreen/background/disposal/resize failure behavior, plus metadata/schema/sitemap/fixture exclusions. Private coverage includes protected previews and assets, stale/racing saves, fresh-session reopen, original preservation, review decisions, diagram proposal provenance, approval and restore.

Automated browser emulation and local synthetic proofs are distinct from manual inspection. Manual screenshots and independent agent probes are recorded in [the integration review](INTEGRATED-RELEASE-REVIEW.md). Physical devices, real screen readers, native browser-toolbar zoom, human comprehension and real CMS/private-repository workflows remain unverified. No improved business, search or reader outcome is claimed. The SEO/SEM agent and independent reviewer approved exact implementation `1f1cbb81e9ac9c5e7a193ee0bc0ce0074ab67947`. The immutable preview `https://f29915d6-portfolio-site.sami-belina.workers.dev` and branch alias were verified: Worker noindex, production canonical metadata, actual initial HTML, accurate schema/sitemap, private/fixture exclusions, one-action intro, p5 lifecycle and320px no-JavaScript reading passed without page errors. The apex remained unaffected. Final remote CI must pass before merge; production Worker/apex headers and behavior are then checked independently. Documentation-only approval records do not change the approved runtime.

## Recovery and next task

Preview locally with `npm run build` then `npx wrangler dev --local --ip 127.0.0.1 --port 4174`. Fixture-only pages require `npm run build:fixtures` and the fixtureWorker; see their existing records. Keep studio configuration/local databases outside public artifacts.

Before release, retain verified production `e52ec03` and Worker version above. Do not merge a failed preview. For a regression, restore that healthy Worker version with authorized account access or revert the integrated release through a PR and the existing Git build. Source branches, review records and private local state must survive rollback; no DNS change or content-storage migration is required. Never restore the historical raw-TSX GitHub origin.

Next bounded authoring task: create/bind the private Pages CMS trial repository and demonstrate actual owner sign-in, native durable save/reopen/conflict and protected page/asset behavior before considering the hosted editor usable. Next search task: owner-verified Search Console access, submit the canonical sitemap and inspect actual coverage/query data. Neither dependency blocks this production-safe source integration.
