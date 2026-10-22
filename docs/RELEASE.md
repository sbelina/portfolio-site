# Stability publication record

Sam authorized completion and publication on October 22, 2026. Scope: the stability fixes and tested compiled-site deployment; no Content Studio, content migration, new IA or keyboard prototype is approved by this release.

## Release path

- Existing production DNS/origin: GitHub Pages for `producingcuriosity.com`.
- Defect: legacy branch/Jekyll publishing exposes raw TSX with an invalid module MIME type.
- Correction: retain the existing domain binding, switch Pages to Actions publishing, upload only `dist`, and deploy after the build/browser job succeeds on main. PR builds never deploy to the live Pages site.
- Preserve the working Cloudflare Worker as a separate deployment. Its feature-branch build failed; the GitHub check supplies no error text or annotations. A log was requested from the owner. No Cloudflare credentials are present, and no Cloudflare management connector is available.
- Record the final deployment URL, commit and action result in PR #1 after publication; do not mistake a workflow configuration change for a successful deployment.

## Additional checks

The expanded checks exercise 320px text-spacing reflow and the archive graph layer with a selected node. The reflow test reproduced overflow in long case headings; `project-content` now allows long words to wrap without truncating or concealing content. Color/state labels, stable positions and graph text navigation remain unchanged.

Release checks include production HTML/JavaScript MIME, React mounting, first/repeat access, storage failures, skip/replay, full intro, touch and keyboard input, reduced motion, graph endpoints/URLs, selected graph accessibility, narrow reflow, and text-spacing override. Automated checks are not screen-reader or physical-device certification.

## Outstanding evidence

- Hosted Cloudflare branch preview and repair of its failed build need the actual Cloudflare log/account access. No error cause is guessed.
- Actual screen-reader, real mobile and human color-vision/comprehension review remain unverified. Browser emulation, keyboard testing, and automated scans are reported separately.
- A newer Emergent implementation/export was not supplied; feature parity cannot be certified. No unavailable features or private evidence have been migrated or overwritten.
- `www` DNS requires owner Cloudflare control if still absent. Publishing the apex through GitHub cannot create a missing hostname.

## Recovery

Prior Pages settings: legacy publishing from `main:/`, custom domain `producingcuriosity.com`. Those settings served a broken app and are not a working-content rollback. The known working baseline is the existing workers.dev build corresponding to source `7eab47a` / the prior compiled bundle. Preserve that Worker deployment. For code regression, revert the stability merge through a PR, retain the Actions-based compiled publishing fix, and redeploy a verified compiled baseline. Never restore raw-source publishing as if it were a successful site recovery.
