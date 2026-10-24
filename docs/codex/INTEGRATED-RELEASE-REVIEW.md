# Independent integrated-release review

Scope: combine the existing public hidden-work release (`e52ec03`) with the older connected-reading, poetry, inspectable-diagram and isolated local writing-trial work (`75b2820`), followed by the SEO/SEM changes. The user explicitly requested this integration and publication. This record is technical review; it does not approve real manuscripts or claim a hosted editor exists.

## Source-boundary review

The older branch keeps the default publication selection empty (`content/public-release.json`: `no-approved-content`). Its loader refuses to invent approved canonical entries. The existing homepage is retained independently; synthetic investigation, pattern, poem and diagram routes are generated only by the separate fixture build. No runtime query or browser-storage switch enables them in production.

The public projection selects exact record revisions and digests, validates references, rights and routes, and copies an allowlist of public fields. Its digest/approval helper is explicitly mechanical integrity checking, not authentication. Article payloads select one current body, required evidence/assets, relevant edges and only minimal linked-entry metadata; collections have metadata without article bodies. Literal verse uses escaped text and pre-wrapped whitespace rather than Markdown.

The separate studio Worker checks loopback hostnames before servicing its login, API, UI, page or asset routes. It requires configured owner password material/application revision, server-side sessions, same-origin state changes and CSRF tokens. Responses are private/no-store with noindex. The default Worker serves `dist`, not `dist-studio`; the studio has no public route configuration. Local D1 storage/history and expected-version checks are actual implementation, while hosted CMS identity/persistence, cloud backups and production publishing remain unimplemented.

Candidate validation and authenticated local approval are distinct. Frozen candidates retain local-D1 source identity, are explicitly `releaseEligible: false` and `published: false`, and use a documented zero Git-content-commit placeholder. No live-release endpoint or production credential is present. A newer draft can coexist with an earlier frozen candidate. Original bytes/text and proposed edits remain separate; manuscript text is imported as data.

## Integration checks still required

- Resolve shared build, footer, routing and package conflicts while retaining both the published p5 page and the older content-contract/private-source boundary.
- Confirm the default artifact contains no originals, private/test canaries, fixture bodies/routes, studio assets or draft/API routes; confirm public sitemap/indexes exclude them.
- Confirm meaningful homepage HTML, one-action intro, direct reading/experiment URLs, native disclosures, p5 lazy lifecycle, poetry, aliases/backlinks and existing anchors through the integrated tests.
- Run public/private types, builds, artifact audit, deployment-package dry-runs, public and local-studio tests plus real Worker restart persistence proof. Preserve writing-review records and empty planning approvals.
- Update historical status documentation so earlier unreleased observations are distinguishable from this integration's implemented/deployed state. A source-serialization probe is not a completed native Pages CMS sign-in/save trial.
- Review the final exact source commit and remote CI/hosted preview before publication; verify production separately afterward.

Initial inspection identified no substantive blocker to safe source integration. Hosted CMS/repository-app access is a real external dependency, rather than proof that the protected local trial is ready for hosted use. Final approval is pending the integrated artifact and exact tested commit.

## Independent integrated-artifact checks

The reviewer inspected the integrated build and served it with the actual local Worker on port4187, with the already-built isolated fixture output on4188. These probes used standalone browser scripts and separate output files, without rebuilding or sharing the integration lead's test-result directory.

- The public Worker returned404 for `/api/workspace`, `/studio/`, `/preview/draft/` and the investigation/poetry/diagram fixture URLs. The default projection had empty entries, relationships, evidence, assets and aliases. Its sitemap contained only the canonical homepage and public hidden-work experiment; the empty collection and fixtures were absent.
- With JavaScript disabled, the full existing homepage and native footer disclosure were readable. The separate fixture poem retained blank lines, literal escaped markup and native verse-anchor navigation.
- A fresh browser completed the intro after one deliberate action. The direct hidden-work URL bypassed it, did not request p5 until reveal, and supported pause, pixel stability and canvas disposal on Reset. The article fixture bootstrap contained only the current body and minimal linked metadata, without the connected pattern body. No page errors occurred.
- Writing-review files were independently compared byte-for-byte against `75b2820`; none changed in this integration.
- Direct synthetic probes of the private Worker module returned401 for anonymous GET/HEAD access to workspace, backup, originals, preview pages/assets and preview CSS, with private/no-store and noindex headers. The corresponding non-loopback requests returned503 before touching the database or UI asset binding. These are boundary probes, not a hosted service penetration test or proof of real owner SSO.

The integration lead's recorded checks passed96/96 public tests and10/10 local-studio tests, plus the real D1 Worker stop/start/fresh-login proof preserving workspace revision28 and digest, and both deployment-package dry-runs. These integrated results retain the prior model, payload, poetry, relationship/alias, private-preview and exact-candidate checks. The reviewer verified the logs; this is distinct from the independent probes above.

No substantive architecture, privacy, content-integrity, route or lifecycle finding was identified in the integrated artifact. Final exact-source approval still requires the final commit and any affected checks after the last copy changes. Remote CI, hosted preview and postrelease production verification remain the integration lead's gates. Real manuscripts, hosted CMS access, physical devices, human screen-reader use, browser-toolbar zoom, reader comprehension and cloud disaster recovery are not established by these checks.

## Exact-source approval

**APPROVE the production-safe integrated release at `1f1cbb81e9ac9c5e7a193ee0bc0ce0074ab67947`, conditional on remote CI and hosted-preview verification before merge.** The reviewer inspected that exact integrated source, default/fixture artifacts and final check logs. The final footer clarification distinguishes the working website release from the unimplemented publication of new writing; its affected footer/SEO checks passed7/7 after a fresh build and packaging check. The earlier integrated96/96 public,10/10 private and real restart proof remain valid for the runtime scope described above.

No unresolved substantive finding remains. This approval covers source integration and selected public behavior, preserving the empty canonical-content selection and local-only private writing trial. It does not approve real manuscripts, move fixture bodies or private assets into public output, establish hosted CMS readiness, or claim search/reader outcomes. The hostname-scoped noindex rule must still be observed on actual hosted responses; an indexing header is not a privacy boundary. Production must be checked separately after deployment. A documentation-only approval commit does not change this approved implementation.
