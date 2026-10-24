# Producing Curiosity

React, TypeScript and Vite on the existing Cloudflare Worker. The integrated build prerenders the portfolio and finite reading pages, with an optional p5.js experiment. See [current release scope and verification](docs/codex/INTEGRATED-SEO-RELEASE.md) and [deployment](DEPLOY.md).

The public build contains the existing portfolio, the illustrative hidden-work experiment and a truthfully empty investigation collection. Reading/poetry/diagram fixtures are local-only; the authenticated D1 writing trial is a separate loopback-only Worker. Hosted CMS integration and new manuscript publication remain incomplete.

The sections below preserve the original v0.5 baseline notes; the current intro uses one action followed by three automatic authored beats, skip/replay and an automatic dive. See [intro states](docs/INTRO-STATES.md).

## Codex development context

Start with [AGENTS.md](AGENTS.md) and the [Codex context index](docs/codex/README.md). The handoff includes the product direction, full researched IA/backend brief, implementation work packages, evidence rules, open decisions, and a [copy-ready first task](docs/codex/START-CODEX.md).

These documents describe proposed multi-page architecture and an expandable private authoring/publishing workflow. They do not mean a router, CMS, database, or publishing backend is already installed. Preserve the distinction between current implementation and target behavior.

## Original v0.5 changes

- Deployment-safe repository root with `.gitignore` and Node 22 pinning
- Exact package versions instead of `latest` dependency ranges
- Public favicon, web manifest, robots file, sitemap, and social-sharing metadata
- 1200×630 social-preview asset using the portfolio visual system
- Local-only unpublished research assets removed from the handoff and ignored if reintroduced
- Coral pressure-point token lifted slightly to `#F39185` for stronger contrast on dark panels while retaining the semantic palette
- Browser-first `DEPLOY.md` instructions for GitHub and Cloudflare Pages

## What this version contains

### Intro
- First-visit interaction remembered across browser sessions using `localStorage`, with a replay option
- Delayed **how does one produce curiosity?** opening with the entire phrase as a real button
- One deliberate action starts three automatic authored beats: attempts, resistance and breakthrough, followed by the transition
- Directional movement follows desktop clicks/drags, wheel/trackpad, touch-swipe, or keyboard intent
- Geometry-led temporal echoes inspired by Austin Malerba's Element Mirror work, implemented locally for portability
- Step 4 **dive in** pauses for 2.2 seconds, then moves automatically through a short expanding passage into the index
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
npm ci
npm run dev
```

Production build:

```bash
npm run build
```

The generated `dist/` folder can be hosted statically.

## Interaction implementation note

The mirror behavior is original CSS/DOM work inspired by Element Mirror rather than a direct dependency. The semantic DOM remains the interface; visual echoes are `aria-hidden` and non-interactive. This preserves the intended feel — the surface yields in the attempted direction, temporal slices lag behind, the field returns, and the automatic breakthrough beat magnifies before resolving — without tying the prototype to a rendering dependency before the interaction is settled.

## Content strategy

The public path remains professional and evidence-led. The writing is not a separate silo: it becomes another route into the same system. A reader can encounter `#knowledge` in a case, select it, and discover its relationship to a field note such as *The Bends*. Conversely, someone who enters through an essay can trace back to professional work.

The public portfolio preserves its curated homepage. Finite reading templates and an empty investigation collection are integrated; full case studies and field notes enter those routes only after source, rights and exact-content approval.


## Deployment

See `DEPLOY.md` for the existing GitHub → Cloudflare Worker build, preview and release process.

The generated `package-lock.json` is committed. Use Node 22 and `npm ci` for repeatable installs. Run `npm test` for production-build browser and automated accessibility checks; see `DEPLOY.md` for browser installation and preview instructions.

The observed Cloudflare deployment is a Worker, not Pages. See [the audit](docs/AUDIT.md), [intro states](docs/INTRO-STATES.md), [proposed Content Studio and roadmap](docs/CONTENT-ARCHITECTURE.md), and [keyboard research brief](docs/KEYBOARD-RESEARCH.md). Architecture and content migration remain subject to owner approval.
