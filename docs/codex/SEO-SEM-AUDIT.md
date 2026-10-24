# SEO / SEM review and release criteria

SEO/SEM specialist review, 24 October 2026. The integration lead first reverified the published hidden-work experiment and production `e52ec03`; the owner then explicitly requested review and integration of the older development branches as well as publication. This audit separates observed implementation, recommended changes and external marketing work. It does not approve private writing or create search-performance evidence.

## Inspected baseline

Fresh verified-HTTPS requests to the custom-domain homepage, `/experiments/reveal-hidden-work/`, robots, sitemap and an unknown route established:

| Finding | Baseline evidence | Priority / bounded response |
| --- | --- | --- |
| Homepage depends on JavaScript for substantive portfolio text | Raw homepage HTML contains identity/contact/loading fallback; the experiment already has useful initial HTML. | High: retain the older reading branch's prerendered homepage while preserving its actual browser intro. Search engines can render JavaScript, but not every crawler does. Serve the same visible portfolio, not a search-only rewrite. |
| Sitemap omits the published experiment | The served sitemap lists only the apex homepage. | Medium: derive canonical sitemap URLs from the public route inventory, including the real hidden-work page. Exclude404, alternate hosts, fixtures and empty collections. |
| Experiment social metadata is incomplete | Correct title, description and canonical exist; Open Graph and Twitter cards are absent. | Medium: generate complete, consistent page-specific metadata from one helper for home, reading pages and the experiment. Use the existing cleared social image; no invented image or evidence. |
| Public canonical conventions already exist | Both pages point to `https://producingcuriosity.com/` paths; unknown route returns404. | Preserve: trailing-slash canonical paths, unique descriptions/titles and real404 status. Do not canonicalize missing pages to the homepage. |
| Empty reading collection will become available after integration | Older branch has no approved canonical manuscripts; its `/investigations/` page truthfully states this. | Medium: keep it readable and `noindex`; omit it from sitemap until it contains selected approved entries. Never fill it with synthetic case studies merely for search. |
| Deployment aliases duplicate public pages | Production Worker and immutable/branch preview hosts serve the same compiled content. | Medium: keep production canonicals and add host-scoped `X-Robots-Tag: noindex` for `*.*.workers.dev`, verified on actual hosted responses. This is indexing policy, not access control. |
| No observed marketing account data | No connected Search Console, Google Ads or analytics account was supplied or inspected. | External dependency: technical readiness and a proposed SEM brief only. No rank, traffic, search volume, conversion, campaign or improved-comprehension result can be reported. |

The served robots file also contains Cloudflare-managed content signals and training-crawler restrictions before the repository's generic allow/sitemap stanza. Google Search crawling is not generically blocked by the observed rules. Preserve this account policy; changing the repository file is not a reason to override it, and training-crawler preferences are separate from Search indexing.

## Content and architecture recommendations

Use the site's existing professional and investigative language: Sam/Sami Belina, Producing Curiosity, service design, research, organizational systems, upstream problem definition and hidden work where the current visible text supports them. Keep navigation labels clear. Do not stuff queries into prose, invent credentials, repeat disputed metrics in metadata or turn illustrative content into purported case evidence.

Use a shared build-time metadata contract rather than divergent JSX/head copies. It should create one title, description, absolute canonical, Open Graph URL/title/description/image/alt, and Twitter card/title/description/image/alt for each public page. The existing social image is a general portfolio image, not an artifact proving an experiment's result. Ensure escaping and safe JSON serialization for content-derived metadata. Source dates, if present, must come from approved content revisions; build time is not `datePublished` or a trustworthy `lastmod`.

Minimal home `WebSite` JSON-LD may identify the real site name and canonical URL. A truthful page-level `WebPage` may describe the experiment. Schema must match visible content. Do not add reviews, ratings, awards, business addresses, credentials, invented outcomes, a nonexistent search action, or promises of rich-result eligibility. Person details should be limited to already published facts if used at all. This review recommends the smaller `WebSite` representation rather than an unnecessary entity inventory.

Retain direct entry URLs, aliases, semantic links, explained backlinks, page-specific payloads and useful initial HTML from the older branch. Do not send unrelated article bodies to every page for a search crawler. A published entry may enter the sitemap/search index only through the selected public projection. Fixtures need explicit `noindex` in their local artifact and must remain absent from production. Local studio code, protected previews, originals, credentials and approved-but-unpublished candidates must remain outside public artifacts and sitemap. `robots.txt`, hidden links and `noindex` never make private material safe to publish.

Cloudflare's documented static-assets `_headers` rule supports this deployment without introducing a new Worker runtime:

```text
https://:version.:subdomain.workers.dev/*
  X-Robots-Tag: noindex
```

Its hostname placeholders match a label between periods, covering the current Worker and its version/branch aliases while leaving the apex custom domain untouched. Verify on preview, Worker and apex HTTPS responses; local pathname-only tests do not establish host-scoped behavior. Do not block these public aliases in robots while expecting a crawler to read `noindex`.

## Proposed SEM brief, not an active campaign

| Search intent | Candidate language to research | Existing honest destination | Evidence needed before spending |
| --- | --- | --- | --- |
| Navigational / referral | Producing Curiosity; Sami Belina; Sam Belina portfolio | Curated homepage and contact | Owner account access and actual branded query observations. |
| Professional problem / collaboration | Service design research; organizational systems research; upstream problem definition | Current work and practice sections, with clear contact path | Owner-defined audience, geography, offer, budget, approved case wording, relevant landing-page and conversion review. |
| Exploratory ideas | Hidden work; assumptions and evidence; connected systems thinking | Clearly labeled experiment and future approved reading entries | Actual query relevance and reader tasks. Illustrative content must not masquerade as demonstrated client outcomes. |

These are research candidates, not measured keywords or launched ad groups. Inspect Keyword Planner and Search Console data with authorized access before selecting terms, predicting reach or making budget recommendations. Any future ad must accurately describe the available service and landing page. Do not purchase ads, create campaigns, install remarketing, add tracking or invent conversion data in this release.

First measurement task: once owner-verified Search Console access exists, submit the generated canonical sitemap, inspect homepage/experiment URLs and record actual index coverage/query data with dates. Search engines choose whether and how to index; a technically valid build cannot prove indexing, ranking or rich-result display. If voluntary reader evaluation or conversion measurement is introduced later, define consent, events and interpretation before instrumenting it. Contact availability is implemented; a functioning attribution/conversion system is not established by an email link.

## Primary references inspected

Fetched over verified HTTPS during this review:

- [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): describes crawling/rendering and recommends server rendering or prerendering where appropriate; not all bots run JavaScript.
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): consistent canonical signals and canonical sitemap URLs; canonicalization is a search-engine decision.
- [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing): HTML meta or response header can prevent indexing; crawlers must be able to retrieve the directive.
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): list canonical URLs; do not fabricate last-modified dates; sitemap submission is a discovery hint.
- [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies): mark up visible, representative content; valid markup does not guarantee a search feature.
- [Google site names](https://developers.google.com/search/docs/appearance/site-names): home-page `WebSite` data can indicate a preferred site name.
- [Cloudflare static-assets headers](https://developers.cloudflare.com/workers/static-assets/headers/): absolute-host patterns and the documented `workers.dev` noindex example above.
- [Google Ads Keyword Planner refinement](https://support.google.com/google-ads/answer/6325025): research/refine proposed terms within the authorized account; no private keyword-planning data was obtained here.

## Release acceptance and approval status

Acceptance: exact integrated public artifact includes substantive prerendered home content, correct unique metadata, valid escaped JSON-LD, canonical-only sitemap with the real experiment, empty collection/fixture/404 indexing exclusions, correct URL/alias behavior, host-scoped alias noindex, no private leaks, retained intro/p5/accessibility behavior and successful type/build/artifact/packaging/browser checks. Independently inspect the resulting commit and hosted preview, then production separately. Record automated browser checks separately from human accessibility or reader evaluation.

Implementation and final SEO/SEM approval are pending the integration lead's candidate. This audit does not assert that any recommendation has already shipped. No paid campaign or external account operation is approved merely by this technical review.
