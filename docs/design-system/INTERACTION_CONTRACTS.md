# Interaction contracts: expected behavior before visual invention

## Classification
- **Conventional**: semantic links, buttons, links to source, disclosures, normal navigation, basic filter controls. Implement native/APG expectations. Example does not require new usability hypothesis, but the task fit remains reviewable.
- **Adapted**: before-vs-after comparisons, evidence visualization, anchored annotations. Use known patterns + explicit content semantics. Test with relevant visitors.
- **Experimental**: network as navigation, generative interactions, hidden knowledge maps, immersive narrative modes. Put behind a non-required `/lab` route. Baseline exists; benefit unproven until tested.

## Contract template
```
ID | Owner | Status | User goal | User context | Research basis and source |
Established pattern | Static baseline | Affordance and accessible label |
Entry / exit / back behavior | State transitions | Failure, empty, loading states |
Pointer | Touch | Keyboard | Focus | Screen reader | Reduced motion |
URL/deep-link behavior | Data dependency and privacy | Success criteria |
Hypothesis | Alternative explanation | Evaluation method | Reopen conditions
```

## PC-01 Native navigation
**User task:** Find work or practice. **Pattern:** clear semantic links. **Behavior:** obvious current location, page title, breadcrumbs on long nested paths, skip-to-content, browser back works. **Never:** icon-only mystery navigation, forced intro to reach investigations, graph required. **Validation:** user can open a case study from homepage; deep link refresh works.

## PC-02 Asterisk-backed evidence note
**User task:** Examine a claim's qualifying or supporting context. **Pattern:** context-labeled anchor link to footnote, or disclosure button when showing text inline. **Behavior:** activation reveals/locates the specific annotation; focus and return path predictable; source URL or plain citation visible. **Never:** decorative asterisks masquerade as buttons; hover-only evidence; all asterisks always interactive. **Validation:** keyboard reader can discover and return, screen reader announces destination.

## PC-03 Original vs revised explanation
**User task:** Distinguish initial framing from evidence-supported reframing. **Pattern selection:** two-column juxtaposition if simultaneous comparison necessary; tabs/segmented control if screen constraints demand one at a time. **Behavior:** both states clearly labeled; source data and caveat survive. **Never:** animate a claim into apparently proven causal fact. **Validation:** users correctly identify what changed and what remains uncertain.

## PC-04 Evidence/diagram inspector
**User task:** Inspect methods, limitations, sources behind a finding. **Pattern:** optional disclosure within readable article; essential conclusion visible. **Behavior:** content is structured, figures have short + long descriptions and accessible tabular equivalents for quantitative data. **Never:** forced interactive SVG to understand a chart. **Validation:** diagram-off and screen-reader text provide equivalent substance.

## PC-05 Related investigation links
**User task:** Follow a concept across cases. **Pattern:** curated text link cards, grouped by declared type. **Behavior:** stable URL; link wording says *why* related and indicates not equivalent. **Experimental enhancement:** graph view with a list equivalent, not required. **Never:** inferred AI edges auto-published. **Validation:** readers can find related work with and without graphic view.

## PC-06 Visual atmosphere and motion
**User task:** Orient and comprehend. **Pattern:** CSS transitions & SVG art without functional requirement. **Behavior:** reduced-motion defaults disable nonessential movement; no flashes, no scroll-jacking, no focus displacement, no content withheld until animation. **Validation:** no-movement mode preserves reading, all interactions still work.

## PC-07 Contact / action
**User task:** Contact the author or view work. **Pattern:** native link or straightforward labeled button, with destination described. **Never:** misleading action labels, broken forms, mandatory account creation. **Validation:** click/tap/keyboard all reach an intended endpoint.

## PC-08 System specimen
**User task:** Test and inspect design tokens/components. **Pattern:** labeled controls with state changes reflected in specimen. **Behavior:** no inert controls; live contrast check, typography and responsive previews; documented defaults. **Never:** treat an interactive gallery as a substitute for behavioral tests.

## References
- APG patterns https://www.w3.org/WAI/ARIA/apg/patterns/
- Disclosure https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- Tabs https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- Complex visuals https://www.w3.org/WAI/tutorials/images/complex/
