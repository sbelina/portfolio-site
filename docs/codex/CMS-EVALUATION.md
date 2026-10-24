# Source evaluation and isolated trial

Status: source-based recommendation plus a local custom Worker trial and a native Pages field/serialization probe. **No Pages CMS or Decap owner-authenticated application has been connected.** No production adoption, GitHub app installation or publication occurred. Editor’s Assistant and Thread Review are proposed features; the owner confirmed no implementation has been located. The existing 11 writing-review records and page inventory remain intact.

## Audited baseline

The branch was clean at `3f1a6e2`; remote inspection found `cfb4f2a` and `093c222`, fast-forwarded before implementation. These preserve the newer intro, study areas and shared footer. Baseline build/artifact/browser checks passed 72/72 tests. Work is isolated on `feat/private-writing-workflow`, based on `093c222`.

Implemented before this task: versioned stable-ID schemas, typed relationships, approved-public projection, aliases, page-specific reading payloads, initial HTML, native inline evidence, incoming/outgoing explained links, Back restoration and literal poetry. Proposed/missing: original-file intake, six-pass review UI, durable authenticated authoring, protected previews/assets, exact owner approval and production release integration. Existing public excerpts are not approved full manuscripts.

## Sources inspected

Pinned upstream snapshots (MIT licenses inspected; no upstream application code copied into the public bundle):

- [Pages CMS `6f4e860`](https://github.com/pages-cms/pages-cms/tree/6f4e860a35d934406580287e7042e5e111e207a1): [`lib/auth.ts`](https://github.com/pages-cms/pages-cms/blob/6f4e860a35d934406580287e7042e5e111e207a1/lib/auth.ts), `lib/authz-server.ts`, `lib/api-repo-context.ts`, `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`, `fields/core/reference/`, `lib/serialization.ts`, `lib/operations.ts`, `db/index.ts`.
- [Decap CMS `9d1bb3b`](https://github.com/decaporg/decap-cms/tree/9d1bb3beb69668cc43256dbe52a6dedae76d5436): `packages/decap-cms-backend-github/src/implementation.tsx` and `API.ts`, `decap-cms-backend-proxy/src/implementation.ts` and README, `decap-cms-widget-relation/src/schema.js`, `decap-cms-core/src/constants/publishModes.ts`, authentication actions.

These source observations do not establish operational security or current hosted-service behavior.

| Requirement | Pages CMS native / configuration | Decap native / configuration | Work still needed for this site |
| --- | --- | --- | --- |
| Durable draft saves | Server-side GitHub file writes; JSON collections | Git-backed file saves; GitHub workflow branches | Private source binding, incomplete-draft schema, immutable originals and revision adapter; test actual save/reopen |
| Owner authentication | Better Auth server sessions, GitHub credentials/server token lookup; self-host uses PostgreSQL and GitHub app configuration | Inspected GitHub backend receives/returns an OAuth token in browser state; other backends may differ | Verify actual configured scopes, cookies, revocation and owner policy. No secret values in chat |
| Review states | Content fields/configuration; did not find an exact-candidate release gate in inspected paths | Native draft / pending_review / pending_publish workflow | Six manuscript passes, individual decisions, completeness, separate approval/live state and exact frozen candidate |
| Private preview and assets | CMS authentication does not automatically protect the site's build/asset URLs | Editor preview/preview links do not authenticate hosted draft assets | A separate authenticated preview boundary before page/data/byte delivery; no public draft deployment |
| Typed relationships | Reference values can be `{fields.id}`, labels `{fields.title}`; structured fields | Relation widget has `value_field`, `display_fields`, `search_fields` | Direction/rationale/provenance records, selected-endpoint validation and derived backlinks |
| Conflicts | File update passes loaded SHA; disables retries on409 and reports stale-file conflict | GitHub `persistFiles` reads branch head and updates tree/ref; no proof here that two stale editor sessions cannot overwrite | Actual concurrent-session trial; atomic expected global revision/head. A client field is insufficient |
| Portability / poetry | JSON serialization preserves exact text in the inspected probe. Frontmatter parser removes one leading body newline, so avoid it for canonical verse | Plain structured files and text widgets are portable; exact whitespace not tested here | Keep immutable binary originals and literal verse; export source/rights/media/history and test restore |

## Recommendation

**Pages CMS is the conditional better fit for the real private-repository trial**, chiefly because server-side credential handling aligns with the existing no-browser-write-token boundary and the inspected stale-file path is explicit. Decap has stronger native review-state UI, but adopting its inspected GitHub backend would conflict with that credential boundary. This is not a claim that every Decap backend has that limitation.

Pages CMS is a separate Next/Postgres authoring service; adopting it need not replace the React/Vite/Worker public site. Its operational footprint is a real tradeoff. Neither CMS supplies the complete required approval/preview/publishing contract merely through configuration. Reassess after the smallest real sign-in/save trial; do not treat this recommendation as production adoption.

## Reproducible native Pages probe

Clone the pinned Pages source outside the public application. Inspect it before executing the probe:

```sh
git clone https://github.com/pages-cms/pages-cms.git /tmp/pc-pages-cms-source
git -C /tmp/pc-pages-cms-source checkout 6f4e860a35d934406580287e7042e5e111e207a1
npx tsx scripts/pages-source-probe.ts /tmp/pc-pages-cms-source
npm install --prefix .studio-local/pages-probe --no-save --package-lock=false yaml@2.4.2 @ltd/j-toml@1.38.0 zod@3.25.76
npx tsx .studio-local/pages-probe/probe.ts
```

The script retains the inspected native JSON serialization logic and reference-schema logic, removing only UI imports from the isolated field probe. It demonstrates round-trip preservation of a synthetic schema-valid poetry entry (spacing, punctuation, tabs, literal markup and blocks) and stable-ID reference values. **It does not demonstrate the Pages UI, Git saving, login, workflow or preview.** Source is pinned and no manuscript is sent to a service.

`cms/pages-config.json` is a draft field-mapping example, valid JSON/YAML for eventual private `.pages.yml`, **not an installed production configuration**. Use JSON records rather than frontmatter. It maps entry metadata/blocks and relationship IDs/types/rationales. It is deliberately not the publication authority: schema-version handling, discriminated-block normalization, full evidence/assets, IDs/revision enforcement, permissions and exact-candidate publication require the adapter and real integration tests. Readonly UI fields are not authorization. Originals should not be editable CMS fields.

## Local end-to-end trial boundary

The separate `studio/` Worker provides custom original intake, review records, structure/edit/relationship decisions, authenticated D1 saves and protected SSR previews using the existing templates. It demonstrates those local mechanisms with synthetic writing. It does **not** pretend to be Pages CMS or Decap, and does not replace an existing editor. D1 is a local feasibility fallback, not an approved replacement for the planned private Git source. No localStorage or in-memory save is counted as persistence.

This local trial can freeze and approve an exact candidate and export an approved-unpublished public projection. Production publication is disabled; saving, approving and exporting do not mark anything live. Cloud owner identity, a remotely durable source, hosted preview protection, actual Pages app integration and release recovery remain unverified.

The smallest external dependency is one owner-designated private Git repository and supported Pages CMS GitHub app/sign-in access. A repository/app name is enough to identify the gate; secrets belong only in secure service settings. The owner was asked for that binding while independent synthetic work continued. No access is inferred from silence.
