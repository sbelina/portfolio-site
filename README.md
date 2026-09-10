# Producing Curiosity — v0.5 deployment-ready prototype

React + TypeScript + Vite prototype for Sami Belina's portfolio, prepared for a GitHub → Cloudflare Pages deployment.

## v0.5 changes

- Deployment-safe repository root with `.gitignore` and Node 22 pinning
- Exact package versions instead of `latest` dependency ranges
- Public favicon, web manifest, robots file, sitemap, and social-sharing metadata
- 1200×630 social-preview asset using the portfolio visual system
- Local-only unpublished research assets removed from the handoff and ignored if reintroduced
- Coral pressure-point token lifted slightly to `#F39185` for stronger contrast on dark panels while retaining the semantic palette
- Browser-first `DEPLOY.md` instructions for GitHub and Cloudflare Pages

## What this version contains

### Required intro
- Once-per-session interaction using `sessionStorage`
- Delayed **how does one produce curiosity?** opening with the `?` as a real button
- Steps 1–3 use a three-intent rhythm: two yielding failures, then a slight magnification and breakthrough
- Directional movement follows wheel/trackpad, touch-swipe, or keyboard intent
- Geometry-led temporal echoes inspired by Austin Malerba's Element Mirror work, implemented locally for portability
- Step 4 **dive in** opens roughly 2.5 screens of actual scroll before the index
- Reduced-motion behavior, skip control, live-region announcements, and a focusable non-gesture route
- Footer **Replay introduction** control


### Semantic color grammar
The deck and site use the same three-color argument. Color is never the only cue; labels, position, and shape carry the same meaning.
- **Violet / unresolved** — observed but not yet understood; evidence without structure.
- **Coral / pressure point** — friction, defect, failure, or the moment something has to change.
- **Teal / what holds** — structure built, evidence that survived, and what remained.

The intro uses violet for the open question, coral for resisted attempts, and teal for breakthrough / dive. Case logic uses violet → coral → teal across observed → diagnosed → structure / what remains. The graph keeps node types shape-based and reserves color for the same epistemic states, especially the core curiosity → evidence → decision → structure → transfer spine.

### Portfolio
- Dark visual system aligned to the current portfolio deck
- Six case summaries structured as observed → diagnosed → structure → what remains
- Current practice framing: upstream problem definition, evidence, decisions, durable structures, transfer
- Practice / research-direction section incorporating the recurring themes of language, multimodal form, information, and sociotechnical systems
- Delta Theory shown as an emerging research direction rather than a finished claim

### Discoverable system map
- Stable authored node graph rather than randomized force layout
- Three levels: **Work**, **+ thinking**, and **+ archive**
- Hashtags are navigable concepts, not decoration
- Cases connect to methods and themes; field notes connect to the same tags; archive fragments reveal earlier versions of recurring questions
- Suggested entry tags make the graph discoverable without requiring users to infer the interaction
- Every graph node is a native button
- Every trace has a text-list equivalent for nonvisual and keyboard browsing

### Field notes + archive
Curated field notes currently represented:
- *A Spotlight on The Bends*
- *The Calculus of Syntax*
- *Conjunction Conjecture*
- *AI: A Tool vs. A Toy*
- *The mundane is evidence.*

The archive preserves earlier research, essays, poetry, and prose fragments without putting them in the primary hiring-manager path.

The older minimum-wage charts remain deliberately **outside this repository handoff** until their figures and sourcing receive a publication-verification pass. `.gitignore` also prevents the local `source-material/not-published/` path from being committed accidentally.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The generated `dist/` folder can be hosted statically.

## Interaction implementation note

The mirror behavior is original CSS/DOM work inspired by Element Mirror rather than a direct dependency. The semantic DOM remains the interface; visual echoes are `aria-hidden` and non-interactive. This preserves the intended feel — the surface yields in the attempted direction, temporal slices lag behind, the field returns, and the third attempt magnifies before resolving — without tying the prototype to a rendering dependency before the interaction is settled.

## Content strategy

The public path remains professional and evidence-led. The writing is not a separate silo: it becomes another route into the same system. A reader can encounter `#knowledge` in a case, select it, and discover its relationship to a field note such as *The Bends*. Conversely, someone who enters through an essay can trace back to professional work.

This is still a single-page prototype. The next production pass can split full case studies and full field notes into routes once the content, image rights, analytics, hosting, and publication-verification decisions are final.


## Deployment

See `DEPLOY.md` for the browser-first GitHub → Cloudflare Pages setup. No command line is required for the initial repository upload.

A `package-lock.json` is intentionally not fabricated in this handoff because this execution environment cannot reach the npm registry. The first successful `npm install` will generate it; commit that generated lockfile afterward.
