# Producing Curiosity

Sami Belina's applied human systems research and strategy portfolio and field journal. It is live at [producingcuriosity.com](https://producingcuriosity.com/).

> I investigate situations where outcomes are visible, but the explanations behind them remain unclear.

- **Test. Show. Enable.** is the professional practice.
- **Related. Not equivalent.** is the intellectual signature.
- **How I Know** is the evidence commitment. Each claim on the site separates what was observed, interpreted, recommended, implemented and measured.

## What is here

| Route | What it is |
| --- | --- |
| `/` | Homepage and statement, with the first-visit introduction: three authored steps, then a separate **Dive in**. See [intro states](docs/INTRO-STATES.md). |
| `/practice/` | Test. Show. Enable., explained. |
| `/system/` | Conceptual Connections overview, with a text equivalent for every relationship. |
| `/patterns/` | Design-system specimen. |
| `/experiments/reveal-hidden-work/` | Illustrative hidden-work experiment. |
| `/investigations/` | Investigation collection. It is truthfully empty until case manuscripts receive source, rights and exact-content approval. |
| `/builds/2026-11-04-418efb7/` | The previous edition as a frozen, `noindex` archive. Its bytes are immutable. |

These are still pending:

- Final asterisk artwork. The typographic asterisk is a placeholder.
- Verified font files and licences.
- A hosted publishing workflow.
- Publication of full case manuscripts.

The presentation follows the adopted [design system](docs/design-system/ADOPTION.md): a paper, ink and orange scientific/editorial direction with distinct semantic colours, always paired with labels or shape.

## Stack

- React 19, TypeScript and Vite 8.
- Served by a Cloudflare Worker, not Pages.
- Every public route is prerendered to static HTML, so the site reads without JavaScript.
- Each build runs a public-artifact audit (`scripts/audit-public.ts`), which fails if private, fixture-only or unpublished material reaches `dist/`.
- Playwright covers Chromium, desktop Safari (WebKit), Firefox (plus a simulated iPhone for the game specs), including automated accessibility checks. Automated checks do not establish WCAG conformance; manual checks are recorded separately.

Local-only surfaces are never deployed:

- **Fixtures build** (`npm run build:fixtures`): reading, poetry and manuscript templates, plus the unpublished *Edge Case* game prototype ([record](docs/codex/EDGE-CASE-PROTOTYPE.md), [mechanics spec](tests/EDGE-CASE-MECHANICS.md)).
- **Writing studio** (`npm run studio:*`): an authenticated, loopback-only D1 Worker for private drafting and review.

## Run

Use Node 22 (see `engines` in `package.json`) and the committed lockfile.

```bash
npm ci
npm run dev            # development server
npm run build          # typecheck, build, prerender, public audit
npm run check:deploy   # wrangler dry run
npm test               # production build + full Playwright suite
```

Browser installation for tests is covered in [DEPLOY.md](DEPLOY.md).

## Deployment

[DEPLOY.md](DEPLOY.md) and [RELEASE.md](docs/RELEASE.md) describe the GitHub → Cloudflare Worker build, preview and release process. Production releases require explicit owner approval. [AUDIT.md](docs/AUDIT.md) records dated observations, not current production behaviour.

## Working on this repository

Start with [AGENTS.md](AGENTS.md) and the [Codex context index](docs/codex/README.md). They hold the product direction, IA/backend brief, implementation plan, [evidence rules](docs/codex/EVIDENCE-RULES.md) and open decisions.

Those documents also propose architecture that is not built. Keep what is implemented separate from what is proposed: the repository has no router, CMS, database-backed public site or publishing backend.

The v0.5 baseline notes this README used to carry remain in git history.
