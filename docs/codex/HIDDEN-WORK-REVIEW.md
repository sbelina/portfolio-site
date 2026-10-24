# Independent hidden-work review

Independent reviewer inspection, 24 October 2026. Scope: the isolated `feat/reveal-hidden-work` candidate based on production `0fb9481`; prior reading, fixture and private-writing branches remain outside the release. The integration lead records the final commit and remote release evidence. This record is technical review, not approval of any real manuscript or claimed research finding.

## Findings and disposition

**Medium — enlarged mobile reflow, resolved before approval.** The initial320px/200% screenshot expanded to347px. Comparing `scrollWidth` with mobile `innerWidth` failed to catch that expanded layout viewport. Reproduction: open the experiment with a320px mobile viewport, reveal the work and set the root font size to200%; compare `document.documentElement.scrollWidth` with the configured320px viewport. Affected files: `src/experiments/hidden-work/hidden-work.css` and `tests/hidden-work.spec.ts`. The integration lead added wrapping and a simplified narrow diagram with full text accounts, and tightened the assertion to320px. Independent final probe observed innerWidth, clientWidth, scrollWidth and visualViewport width all320px, with no overflowing elements.

No remaining substantive privacy, content-integrity, navigation, intro-preservation or motion-lifecycle finding was identified in the inspected candidate. No source changes were made by this reviewer.

## Independent checks

Against the built artifact served by the local Cloudflare Worker on port4177:

- A simulated hidden-document visibility event stopped canvas pixel changes; a visible event resumed them. This is a deterministic event probe, not physical browser-tab testing.
- Closing the native disclosure removed the canvas. Returning to the portfolio removed the sketch and retained the existing work destination, without page errors.
- Closing the disclosure during a deliberately delayed sketch import prevented a later canvas mount.
- The repaired320px/200% layout had no horizontal overflow. The narrow diagram was visually inspected: faint initial traces and categorical branches remained visible; readable labels and explanations stayed in the adjacent text accounts.

Source/artifact inspection verified a data-only illustrative process account, explicit relationship explanations and limitations, static prerendered HTML, native disclosures, optional p5 instance mode, bounded motion, offscreen/document pause, preference-change disposal, import-failure fallback and cleanup of owned observers/listeners. The homepage source diff adds only the shared footer/link and wrapping; its content, graph and intro implementation are preserved. The experiment route has useful initial HTML and the Worker uses a real404 fallback. Prior drafts, originals, studio credentials and unselected fixtures are not dependencies or generated routes of this branch.

The integration lead separately runs the repository's frozen install, type/build/artifact checks, browser regression suite and deployment-package validation. These results and remote CI are recorded in the release record; they are not silently substituted for independent observations above.

## Approval scope and limits

Approval is limited to this explicitly illustrative interaction experiment after the integration lead supplies the exact tested source commit and confirms the required checks. The final approval message identifies that commit. No actual reader-comprehension result, real screen-reader test, physical-device test or blanket WCAG-conformance claim is established. No approval extends to private writing, unpublished reading/studio branches, content migration, DNS changes or service purchases.
