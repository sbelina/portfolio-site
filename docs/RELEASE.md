# Stability publication record

Sam authorized completion and publication on October 22, 2026. Scope: the stability fixes and tested static-site deployment; no Content Studio, content migration, new IA or keyboard prototype is approved by this release.

## Deployment and routing

The domain initially served raw TSX from GitHub Pages. While release work was in progress, the owner corrected routing: a fresh request now serves the compiled Worker bundle and no longer has GitHub origin headers. The prepared GitHub Pages fallback was therefore removed before merge. Keep publication on the existing Cloudflare `portfolio-site` Worker; no Pages settings or DNS were changed by the agent.

The Cloudflare branch-build check initially failed without exposing an error message. No account credential is available to read private build logs directly. An explicit standard static-assets `wrangler.jsonc` now declares the known Worker name and `dist` directory, SPA fallback, compatibility date and version-preview URLs. Wrangler is pinned in dev dependencies. Deployment packaging and the local Worker runtime are tested; the subsequent Cloudflare check must establish whether this resolves the actual remote failure. Missing configuration is not asserted as a confirmed root cause without that result.

GitHub checks run TypeScript/Vite, Wrangler dry-run packaging, Chromium interaction tests and axe scans. A feature branch does not change production through this workflow. The final PR records hosted preview/production results and exact commits; a configuration file or successful local dry-run alone is not proof of remote publication.

## Additional checks

The expanded checks exercise 320px text-spacing reflow and the archive graph layer with a selected node. The reflow test reproduced overflow in long case headings; `project-content` now allows long words to wrap without truncating or concealing content. Color/state labels, stable positions and graph text navigation remain unchanged.

Checks cover compiled HTML/JavaScript MIME, React mounting, first/repeat access, storage failures, skip/replay, full intro, touch and keyboard, reduced motion, graph endpoints/URLs, selected graph accessibility, narrow reflow and text-spacing overrides. Automated/browser checks are not screen-reader or physical-device certification.

## Outstanding evidence

- Actual screen-reader, physical mobile and human color-vision/comprehension review remain unverified. Browser emulation, keyboard testing and automated scans are reported separately.
- A newer Emergent implementation/export was not supplied; feature parity cannot be certified. No unavailable features or private evidence have been migrated or overwritten.
- If `www` DNS remains absent, the owner must configure it through Cloudflare. A source merge cannot create a missing hostname.

## Recovery

The prior Pages setting was legacy publishing from `main:/`, with the custom domain `producingcuriosity.com`; it served a broken app and is not a working-content rollback. The known working baseline is the existing Worker deployment, version `715fb4c4-075a-4c68-911f-e55087d233d2`, corresponding to the prior compiled bundle. Preserve that version. For a regression, use Cloudflare version history to restore the verified baseline, then revert code through a reviewed PR. Do not change domain routing back to raw-source GitHub publishing as a recovery step.


## Additional owner-approved interaction scope

Before publication Sam requested working desktop clicks and directional drags, an automatic dive through a short opening, persistent first-visit memory rather than session-only replay, and a clickable whole question. These are included in the release, with regression checks for actual phrase clicks, directional desktop dragging without duplicate attempts, automatic uninterrupted progression and persistence in a fresh browser context. Touch skip responds on pointer release so a browser-suppressed compatibility click after dragging cannot strand the visitor.
