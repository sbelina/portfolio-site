# The website as an experiment

Owner direction, 23 October 2026: a portfolio for experimentation, linking ideas, and sharing its creator's perspective. The development process is itself an inquiry. This extends the existing investigative observatory direction.

## Question and working hypothesis

Question: Can a creator use multidisciplinary methods, and an understanding of the language needed to express them, to guide a large language model toward a meaningfully different kind of website?

Working hypothesis: Combining research, systems thinking, writing, design, accessibility, and engineering with explicit method vocabulary will help the creator produce a more coherent, accessible, personally expressive, and meaningfully connected experience than a conventional layout-focused prompt.

This is a proposed comparison, not a measured conclusion. Define what "different" means through reader understanding, useful connections, author control, and observed behavior before evaluating. A single authored site can demonstrate feasibility and reveal tradeoffs; it cannot establish general superiority or isolate every discipline's causal contribution.

## Practices to adopt now

| Research resource | Adapted practice | Application and evidence |
| --- | --- | --- |
| [Browser Use](https://github.com/browser-use/browser-use) | Observe tasks, actions, and resulting states. | Use existing browser tooling first. Record whether a reader task completes, where navigation fails, and console/network evidence. Agent task success is not human comprehension. |
| [Agent Memory](https://github.com/rohitg00/agentmemory) | Preserve origins, corrections, and superseded decisions. | Keep concise dated decisions linked to sources and commits. Retrieved summaries are leads; check original evidence before consequential claims. No memory service is installed by this document. |
| [Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) | Make methods and evidence traceable. | State the question, distinguish observation from interpretation, attach supporting sources, record limitations, and retain the creator's wording. |
| [Diagram Design](https://github.com/cathrynlavery/diagram-design) | Choose representation to fit the explanation. | Use diagrams when they clarify a relationship; maintain equivalent text and existing site semantics. Use Mermaid for evolving repository diagrams and review rendered publication graphics. |
| [Cybersecurity Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | Use scoped review procedures. | Check actual preview, asset, approval, and content-import boundaries. Repository branding or a framework mapping is not proof that a check is correct. |
| [Harness Engineering](https://github.com/walkinglabs/awesome-harness-engineering) | Supply relevant context, bounded tasks, observable outputs, and verification. | Load the index and task-relevant references; define acceptance before implementation; retain test evidence and failure notes. |
| [OpenViking](https://github.com/volcengine/OpenViking) | Load context at increasing depth. | Short orientation → task overview → original source. Apply this to development context and optional reading depth; keep essential qualifications visible. |

These are adaptations from reviewed documentation, not imported code, installed skills, audited dependencies, or verified vendor performance claims. Review the exact upstream files, license, version, dependencies, and permissions before copying or installing anything. Keep the public reading experience independent of agent services.

## A bounded development cycle

1. State the visitor/author problem, hypothesis, and what observation would challenge it.
2. Translate the relevant methods into explicit behavior, constraints, and acceptance conditions. Name the discipline only when it changes a decision.
3. Implement the smallest coherent example using the current stack. Preserve sources, authorship, and publication boundaries.
4. Inspect the actual artifact with automated checks and relevant human review. Label simulations, agent observations, and human observations separately.
5. Record the result and revise the decision. Update public implementation copy when capabilities change; do not present plans as working features.

For a controlled prompt comparison, keep the model/version, starting commit, assets, task, tool access, and resource budget as comparable as possible. Store both prompt variants and resulting commits. Repeat trials before drawing broad conclusions; record order/learning effects if the same people assess both versions. Human raters should assess artifacts without knowing the prompt condition where practical.

## Initial experiments, not completed studies

| Experiment | Comparison | Evidence to collect |
| --- | --- | --- |
| Method vocabulary | Layout-focused instructions versus explicit multidisciplinary acceptance conditions | Reader identification of question/contribution/limitations; defects; author-rated voice; implementation and review effort. |
| Reading depth | A long account versus invitation/overview/evidence paths using the same content | Human explanation of the argument and qualifications; task success; observed navigation problems. Clicks/time alone do not establish understanding. |
| Correction retention | A source correction retrieved through concise linked context | Whether a fresh session states the corrected accessibility account and keeps the three training artifacts distinct, with sources. |
| Connection usefulness | Keyword association versus a typed connection with rationale | Whether readers can explain what the connection adds and distinguish interpretation from evidence. |

Avoid adding visitor tracking to run these studies by default. Start with explicit moderated tasks and voluntary feedback. Publish only reviewed, non-sensitive records.

## Experiment record

For each actual trial record: ID/date; question; hypothesis; source references; prompt and method changes; model/tool versions; starting and resulting commits; conditions; acceptance criteria; actual observations; human versus automated methods; failures; limitations; decision; next step. Leave results empty until observed. Keep private manuscripts and participant records out of this public repository.

## Public explanation

`src/components/ExperimentNote.tsx` is the shared footer disclosure for home and reading documents. It states the idea, working hypothesis, process, and current implementation, and links to source history. The asterisk is visually small; the labeled native summary has a usable target and exposed expanded/collapsed state. It works without JavaScript and adds no tracking or animation. Keep this statement synchronized with verified implementation changes.
