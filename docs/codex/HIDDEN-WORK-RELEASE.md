# Reveal the hidden work: bounded release record

## Scope and authority

The owner requested an optional p5.js creative-coding layer and explicitly authorized publication after agent approval. This branch, `feat/reveal-hidden-work`, starts from production `main` at `0fb948124a5f02455818f10bbbdc53d2fafbe6b4`. It releases only a clearly illustrative interaction experiment, its native footer disclosure, and the build/routing/checks needed to serve it. No DNS, service purchase, manuscript migration, studio deployment or real editorial approval is included.

Earlier work is preserved on `feat/inspectable-assumptions` at `75b2820` and the connected-reading/private-writing branches. The draft handoff/reading PRs are not merged to obtain this feature. Their synthetic manuscript routes remain absent from this release. Editor’s Assistant and Thread Review remain proposals; no existing implementation is claimed or replaced.

## Question, representation and decisions

Question: what becomes visible when a simplified process retains its original trace while the work beneath it is revealed? A later reader evaluation should ask whether people can identify both views, explain a relationship, and recognize the limits. No comprehension benefit has been established.

- `/experiments/reveal-hidden-work/` has useful prerendered HTML. A native `details` summary reveals all extra steps with one click, tap, Enter or Space. The overview stays in place; its repeated faint track remains visible in the revealed SVG.
- All content is explicitly invented and illustrative. No reviewed process account was available for this slice. Relationships have IDs, endpoint identities, categorical meanings and explanations in a portable typed data account, independent of p5/React. No durations, measured values, real causal findings or private writing are supplied.
- Semantic HTML carries labels, controls and explanations. SVG carries the inspectable geometry. Narrow layouts simplify the diagram and retain full-width text accounts. Equivalent text explains every relationship; color is accompanied by words and symbols.
- `p5@1.11.13` is an optional instance-mode adapter. It is imported only after reveal, when visible, with motion allowed. A finite3.6-second trace illustrates relationships; `noLoop` stops drawing when paused, offscreen, backgrounded or complete. `remove` disposes it on close/reset/unmount or preference change. Paused wall time does not advance the sketch. Import failure leaves the explanation usable.
- Reduced motion and missing browser preference/visibility APIs fail to the static alternative. Native disclosures and readable explanations work without JavaScript. No CDN or analytics are added.
- The existing homepage data, graph, typography and intro implementation are retained. Only a footer link and the shared asterisk disclosure are added there. Its no-JavaScript fallback also includes the native disclosure. Reading templates and the private authoring trial are described as separate development work, not live capabilities.
- Vite builds a second finite page and prerenders it. Worker static404 handling prevents a missing experiment URL from becoming a soft homepage200. Existing fragment links remain unchanged.

See [the creative-technologist evaluation](P5-EVALUATION.md) for inspected primary sources, version tradeoffs, experiment opportunities and approval criteria. p5 is substantial: the built lazy chunk is approximately1,048KB raw /255KB gzip. The experiment-specific initial JS is approximately11.7KB raw /4.3KB gzip, plus shared React/footer code. p5 is absent from initial homepage and experiment requests; its cost is accepted only for this optional enhancement. It is not justified for ordinary reading or labeled diagrams. The upstream LGPL2.1 license is shipped at `/licenses/p5-LGPL-2.1.txt`, with attribution and tagged source linked on the page; no library source is edited.

## Verification

Local frozen `npm ci`, application/tool TypeScript checks, production Vite build, prerender/public artifact audit, Worker deployment dry-run and `git diff --check` passed. Browser checks use actual local Worker static-assets behavior, not Vite’s SPA fallback.

The integrated local suite passed35/35 tests, including all26 original homepage/intro/content checks. After adding deferred-import cancellation and simulated document-visibility coverage, the focused suite passed10/10. The final remote CI run must exercise all36 tests on the resulting candidate. Test output and screenshots are retained as local/CI artifacts, not copied into public site assets.

New checks cover portable endpoints/provenance, direct initial HTML, compiled assets,404, no eager p5 on homepage/initial experiment, one-action keyboard reveal, stable trigger position, native focus, pause/resume/reset, unchanged canvas pixels while paused/offscreen/backgrounded/complete, reduced-motion startup and preference change, failed/deferred imports, canvas disposal, no-JavaScript reading/footer, emulated touch,320px layout with200% text, and automated axe checks with the experiment/footer expanded.

Independent agent probes separately checked simulated background/foreground events, closing/navigation disposal, closing during deferred loading, and actual320px document/client/visual-viewport width. See [the independent review](HIDDEN-WORK-REVIEW.md). A first reflow assertion compared against mobile `innerWidth`, which itself expanded to347px. Visual inspection caught the false pass. Wrapping, a simplified narrow diagram and a strict320px document-width assertion repaired it; the reviewer reproduced the corrected behavior.

Manual visual inspection covered desktop and normal/enlarged narrow captures. Human screen-reader use, physical touch devices, native browser toolbar zoom, reader comprehension and a calibrated real-process simulation remain unverified. Automated axe and browser emulation do not establish WCAG conformance. No private CMS login/save or real manuscript publication is implied.

## Preview, release and recovery

```sh
npm ci
npm run build
npx wrangler dev --local --ip 127.0.0.1 --port 4174
```

Open the permanent experiment path above. All its content is illustrative and public-safe under this task’s explicit publication scope; it is not the prior fixture build or a protected author preview. Keep all existing ignored local studio state outside `dist`. The artifact audit rejects private/unselected fixture markers and source/maps. This branch contains no studio or manuscript intake code.

Publication remains conditional on both agents approving the exact implementation and remote CI/preview verification. The PR records the final source commit, Cloudflare preview/version, production result and limitations. The existing main-branch Cloudflare Git integration publishes the reviewed build; no DNS or separate credential flow is needed. Do not merge a newer unreviewed source revision.

Before release, preserve the currently served HTML/assets and compile the exact previous `main` baseline. If preview fails, do not merge. If production regresses, restore the prior healthy Worker version using Cloudflare history where authorized access exists, or revert this scoped release through a PR and the existing Git build. The prior source is `0fb9481`; rebuilding it restores its former SPA/static-assets behavior. Do not restore the historical broken GitHub raw-TSX origin. No private storage, original manuscripts or schema migration is involved in rollback. The previous branches stay intact regardless.

## Next bounded task

Run a small voluntary reader evaluation of this illustration: can readers distinguish the overview, hidden work, illustrative relationships and missing real evidence? Record actual observations and revise before extending p5 to another interaction. A future content-driven block should reuse the structured content contract on the preserved development branch, bind documented relationships to reviewed sources, and retain this adapter/static separation. Do not infer learning from clicks or animation completion.
