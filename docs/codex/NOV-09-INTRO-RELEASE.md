# Intentional intro and nested reading — 9 November 2026

Owner direction: fix and publish the interactive introduction. The owner explicitly confirmed **three steps plus a final Dive action**, and then requested interactive layers by recognizing nested opportunities. This authorizes this bounded application release, including the previously adopted current-edition design. It does not approve canonical case manuscripts, metrics, private evidence or a new publishing service.

## Baseline and release scope

Clean starting point: `a7ae225fe57df8356c0b196986f1c5432c688ff7`, `feat/test-show-enable-design`. Remote main was `418efb750fe89c754b890b99a605213fed5ffddc`; archive/index PR #9 and design PR #10 remained draft/unmerged with passing checks. Work is isolated on `fix/intentional-intro-release`. Unrelated Site copy work and private author data remain untouched.

Fresh production/Worker requests still served `home-pDxPFP4r.js` with the older one-start/automatic progression. The approved new design was only a preview and omitted the intro. This release therefore restores the corrected intro on the current homepage and delivers the approved archive/design foundation in one production candidate, rather than first deploying an intermediate homepage without the fix.

## Implemented behavior

- `IntroExperience` has an explicit ready-to-dive state for the current edition. Three independent step activations expose an immediately actionable Dive button. Waiting, wheel inertia, held keys, a touch compatibility click or a background click cannot start Dive. The fourth deliberate activation starts the transition.
- The same native phrase button preserves keyboard focus. Its accessible name includes the visible wording; repeated keydown cannot supply another action. Skip is fixed and reachable even during the transition. Skip/unmount cancels timers/frames; replay starts fresh. Primary controls stay still while decorative echoes provide feedback.
- `HomeIntroduction` supplies deterministic server/first-client output, first-visit memory, prominent replay beside the homepage statement, error recovery and focus return. Direct reading/fragment URLs, returning visits, Back/Forward restoration, denied storage and reduced-motion first visits bypass the intro. Reduced-motion replay retains all four actions without animated movement.
- Current intro styles inherit observatory tokens. Narrow/enlarged text reflows; vertical touch panning reads content without completing a step, while sideways swipes, native phrase buttons and keyboard input remain alternatives. No fixed-height clipping is required to preserve the composition.
- Native disclosures add optional questions beneath Test/Show/Enable and two shallow levels within the conceptual homepage illustration. Main explanations and the conceptual/not-measured qualification remain visible. Context opens in place, retains focus/reading position, works without JavaScript and adds no required intro actions. No case relationships or evidence were invented.
- Historical `App` fixtures and the immutable archive retain their three-step/automatic-dive variant. No frozen artifact or capture ledger was edited. The current public projection remains empty for canonical entries, relationships, evidence, assets and aliases.

## Verification and review

Pinned Node22.23.4, lockfile installation and the normal public `dist` output are used. Tests target the actual production Worker4175 for current behavior; legacy fixtures remain on4174.

Initial focused checks reproduced enlarged intro overflow; the scoped grid/sizing correction removed it. A broader run reproduced an inaccessible moving Skip during the animation; fixed-position Skip resolved it. The subsequent nine focused tests passed, including keyboard/held-key prevention, four separate touch activations, indefinite waits, reduced-motion replay, cancelled animation/replay, denied storage, direct links, enlarged touch panning, native nested disclosure and reading position. The independent reviewer also required visible question wording in the accessible name; that correction is included.

Final local `npm test` passed **159/159**, including TypeScript/tools, production/fixture builds, recursive public-artifact audit and browser checks. Private workflow **11/11**, actual Worker restart/fresh-login persistence and public/private Worker dry-run packaging passed. Frozen install and `git diff --check` passed. The independent reviewer verified actual desktop keyboard, four mobile taps, held-key suppression, completion focus, enlarged vertical touch panning, no-JavaScript nested layers, no page errors/overflow and unchanged archive hashes. Evidence is in `/tmp/pc-intro-independent-nov09/`; parent separately inspected the captures. Exact-head hosted preview, remote CI and production observations are recorded on the release PR. Local logs use `/tmp/pc-intro-nov09-*.log`; screenshots/probe observations are outside public source. No lint script exists. Automated/visual checks do not establish full WCAG conformance, real screen-reader/physical-device support or improved comprehension.

## Publisher and recovery

Local Wrangler `whoami` reported unauthenticated. GitHub's integration could not list repository-secret metadata (403); no secrets were read, created or requested in chat. The existing Cloudflare Git build connection successfully built the prior feature preview. The authorized release uses the existing main-branch publisher, retaining account/domain settings and distinguishing source merge, preview upload and verified production serving. If that publisher is blocked, finish the candidate and report the exact dependency rather than claim publication.

Before release, the prior public version URL `https://2655dfcf-portfolio-site.sami-belina.workers.dev/` matched the live homepage byte-for-byte: HTML SHA256 `fd45820f9357ac04c327f1a48e6078ece603f0182939208ef14ba53c84218fcc`. Its previously recorded full version ID is `2655dfcf-72b1-46e1-ac04-2d5af4a58047`; only the prefix URL/HTML parity was reverified here. The approved pre-fix new-edition candidate is `a7ae225`, version `3d9b3e1d-ab92-4580-9094-42c0ebb885f2`, with no newly published case material.

For a regression, preserve the release/version IDs and recover through the authorized Worker version history or a reviewed revert/rebuild. Check withdrawn-content constraints before restoring any older artifact; the older live site is not proof that all its claims remain approved. Never restore the broken raw-TSX GitHub origin or change DNS to compensate for an application error. No database migration is involved. Keep private author state, archive bytes and source review records intact.

The existing local private authoring trial and exact-candidate approval contracts remain unchanged. Final asterisk/font assets, real case-source approval, hosted authoring/publishing and human comprehension evaluation remain separate work.
