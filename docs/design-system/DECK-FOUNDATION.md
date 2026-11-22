# The portfolio deck as the design foundation

**Owner direction, 22 November 2026:** the owner’s nine-slide portfolio deck (*Sami Belina, Portfolio*) is “the base of the design system”. It governs:

- which word in a headline to change, and how;
- the language and colours;
- how work is visualized;
- the imagery that connects problems to their solutions.

New pages and components start from these rules. Where an earlier document conflicts, this one wins for presentation. The [evidence rules](../codex/EVIDENCE-RULES.md) still win for claims.

The deck file itself is **not** stored in this public repository. It contains figures that need source review (see *Guardrails*). These rules describe it in words.

## The final version: *Designing Better Questions About Trust*, 22 November

The owner supplied the Trust case interview deck (*Sami Belina · Designing Better Questions About Trust*: five spreads and two appendices) as **the final version**. Where it differs from the nine-slide deck below, **the final version wins.** The file is not stored here.

| Element | Final version |
| --- | --- |
| Spread labels | **The first view** (muted) and **What held** (accent colour), replacing *The label* and *What the evidence showed* |
| Lower row | **My role** with a case-specific partner: *Who did what*, *Whose experience is missing?*, *Fieldwork*, or *What changed* |
| Kickers | numbered and accent-coloured: `01 · THE RESEARCH CHALLENGE` |
| Footer | a series line, `Sami Belina · Designing Better Questions About Trust`, then `01 / 05` |
| Type | one sans-serif family, including italic sans for principles and asides (no serif) |
| Cover statement | “I diagnose gaps in understanding and design the conditions that empower people to make **informed** decisions.” Kicker: *Research leadership*. Owner decision pending: this versus the site H1 |
| Test. Show. Enable. | “Diagnose the gap, then design the conditions that close it.” **Test:** diagnose the gap, where a measure, definition, or category has drifted. **Show:** make evidence and uncertainty visible so people reach defensible interpretations. **Enable:** design the conditions people need to make informed decisions. *(Now used on the site.)* |
| Across cases | agreement ≠ trust · delivered ≠ verified · 38 proposals ≠ 38 needs · passing checks ≠ accessible |
| Honest closing line | “Proposals are recommendations, not completed outcomes. The full framework was not implemented; no revenue or retention impact is claimed.” A *Limits* line in deep dives |

**Imagery added by the final version:**

- Fog strands from different starting points cross an orange *designed conditions* line, braid as “held together, still distinct”, and end at an orange *informed decision* bar.
- A shaded band between two curves, marked ≠ *the gap*.
- A funnel spiral for question order, labelled “shapes are not data”.
- Audience lanes for the framework, with the unsampled group dashed and labelled “championed; not sampled”.
- A timeline with a dashed, proposed future.
- A filled-squares bar for fieldwork reach.

The figure types now include *The sequence I set*, *My proposed framework*, *Sanitized instrument* and *Timeline*. Each still states its caveat.

## 1. Headlines: one word carries the turn

Every headline is two short lines. The first states the familiar reading (the label); the second turns it. **One word is set in the accent colour: the word that carries the change**, the one that would be different if the old assumption were still true.

| Slide | Headline | Accent word, and why |
| --- | --- | --- |
| Positioning | I uncover the … factors **beneath** outcomes | *beneath*: where to look |
| Claims, Test | Errors repeated. **Timing** was the problem. | *Timing*: the actual cause |
| Claims, Show | “Complete” now means **verified**. | *verified*: the new definition |
| Claims, Enable | What admins knew became **teachable**. | *teachable*: the new capability |
| Trust | Trust **separate** from agreement. | *separate*: the measurement split |
| AI challenge | 38 proposals. **8** shared challenges. | *8*: the synthesis |
| Pattern | Related. **Not** equivalent. | *Not*: the distinction |
| Close | Where I’d **start**. | *start*: the invitation |

**Rules:**

1. At most one accent per headline.
2. Never accent a word only for decoration.
3. A short rule sits under the headline’s first word.
4. In a subhead, accent the verbs of action (“so leaders can **decide** … teams can put it into **practice**”).
5. In markup, the accent is `<em>` (Markdown `*word*`), styled in the accent colour at the headline’s weight. Its meaning never relies on colour alone, because the word is still emphasized for screen readers and in print.

## 2. The case grammar (one case, one spread)

Each case or case part is laid out the same way. This is the site’s *four questions* in the deck’s own vocabulary:

| Deck element | What it holds | Four questions |
| --- | --- | --- |
| Kicker: `FIELD · CASE 01, 1 OF 3 · TEST — DIAGNOSING A CROSS-DEPARTMENT FAILURE` | section · position · move — topic | — |
| Headline with accent (§1) | the label, then the turn | — |
| **The first view** (was *The label*) | the familiar reading or proxy people relied on | What was the problem |
| **What held** (was *What the evidence showed*) | what testing it revealed | How I knew |
| `FIG. NN · TYPE · caveat` | the visual and its evidence status (§4) | — |
| **My role** | what I did, unassigned or not | What I did |
| **What leadership changed** / **What changed** | the decision and what lasted | What changed |
| Italic serif line | the principle, e.g. *The cost of an error depends on when you discover it.* | — |
| Footer: `— Trade-off: …` | the cost of the change, honestly | What I’d do differently |
| Footer: italic question `→` | the next question, which links onward | — |

## 3. Surfaces, colour and type

| Surface | Used for | Ground | Text | Accent |
| --- | --- | --- | --- | --- |
| **Beneath** (dark) | how I think, the pattern, where I’d start | near-black | warm cream | bright orange |
| **Field** (paper) | cases and evidence | warm paper | near-black ink | rust orange; **sage** for verification (the lens) |
| **Signal** (orange) | the practice: Test. Show. Enable. | orange | ink, with cream for the final move | — |

These map onto the implemented tokens. *Beneath* is the existing `observatory` surface, *Field* is `paper`, and *Signal* is a new orange panel. Each colour pair must pass contrast again before use, especially orange text on paper.

**Type in the deck:**

- **Headlines:** a heavy geometric sans.
- **Kickers and labels:** wide-tracked geometric capitals.
- **Principles and asides:** italic serif.
- **Body:** a light geometric sans.

The faces look like Outfit, Jost and EB Garamond, all SIL Open Font License families. Per AGENTS.md, use them only after the font files and licences are verified and self-hosted (`public/licenses/`). Until then the site keeps its system stacks.

**Frame:** thin rules and corner registration marks (`+`) make each spread read as an instrument plate. Page numbers are shown as `NN / NN`.

## 4. Figures say what they are

Every visual is labelled `FIG. NN · TYPE · caveat`. The type comes from this vocabulary, which matches the evidence classes:

| Type | Meaning | Deck caveats |
| --- | --- | --- |
| **Conceptual illustration** | the idea, drawn; positions and marks are illustrative | “positions illustrative”, “each mark illustrative; types from the log” |
| **Documented process** | a real process, simplified | “simplified comparison; strands are not transaction data” |
| **Artifact** | a condensed view of a real thing I made | “condensed from my guide”, “condensed view of the instrument” |
| **Interpretive synthesis** | a pattern across cases | “connections are schematic, not measured” |

A figure drawn later is also captioned *reconstructed for this portfolio*.

## 5. Imagery: how problems connect to solutions

| Mark | Means |
| --- | --- |
| Many faint strands, tangled | variation, noise, an unexplained outcome |
| One orange strand through them | the thread I followed |
| Strands settling into one calm line | the explanation holding; the change taking effect |
| **Lens** (sage ellipse) | a verification point, a check |
| **Plane** (orange slab across the line) | a commitment point: payment, a decision |
| × | a defect or failure |
| ○ on a line | a step |
| ■ | a decision or synthesis point |
| Dotted line | uncertain, inferred or before |
| Solid line | established, or after |
| Fan-in to a block, fan-out to audiences | knowledge pooled, then transferred |
| ≠ chip between two terms | the gap: definition, representation or measurement |

Before and after are shown as two parallel lines, Before above After, with the moved element connected by a dotted line. This is the deck’s *Pay → Verify* over *Verify → Pay*.

## 6. Language

- **Short declaratives.** “Change runs on assumptions. I surface the ones worth questioning.”
- **Labels in quotation marks.** The thing being tested is a word people used: “Errors”, “Complete”, “Looks good”, “Trust”.
- **Questions as navigation.** Each spread ends with the question the next one answers: *How do I think? → Where did it start? → So what changed? → How did it last? → Can it change a measure? → What about 38 ideas? → What’s the pattern? → Where would I start?*

## 7. Guardrails when moving deck material to the site

- **18% → 7.6%:** slide 4 shows “~18% → 7.6%” with an arrow. The evidence rules (27 October correction) withdraw that before-and-after comparison, because the figures have different scopes. The arrow implies a reduction even with the caption. **Do not reproduce it on the site** unless the owner re-decides with sources.
- **Dates:** the “2025” in slide kickers is a date call-out. The owner asked to avoid those.
- **Identity:** the deck’s identity line is *Organizational Diagnosis & Change*; the site and LinkedIn use *Research & Innovation Strategist*. The owner chooses one, or decides when each is used.
- **New facts in the deck still need the normal review before publication:**
  - “chosen from three designs I proposed”;
  - partners use the measure to steer briefs;
  - presented to my branch, then statewide training;
  - adjusters now verify before paying;
  - the local manager formed a training team;
  - the sprint runs annually and new tools were adopted.

## Where it is applied

- **Claims service blueprint:** corrected to the deck’s documented process (photo reviewed → salvage if uncertain → paid once picked up; the deck’s defect types).
- **Deep dives:** built in the deck grammar (§2), with accent headlines (§1), figure labels (§4) and question links (§6). See [deep dives](../codex/DEEP-DIVE.md).
- **Interlude:** already a *Beneath* surface. Its drawing is a conceptual illustration.
- **Next:** accent headlines and the case grammar on public case pages; the *Signal* panel for the practice; the imagery kit as reusable SVG components; and the fonts, once their licences are verified.
