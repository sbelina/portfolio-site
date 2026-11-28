# Authored introduction: states and recovery

Current owner correction, 9 November 2026: **three step actions plus a separate Dive action**, four total. The initial question is step1; there is no extra Start gate. Each next phrase becomes actionable immediately. After step3 the intro waits indefinitely at **Dive in**. Only activating Dive starts the transition; waiting, wheel inertia, a held key or a generic field click cannot supply that fourth action. Skip remains available. The historical variant below remains in the immutable archive and legacy fixtures.

## Current edition — explicit Dive

**28 November 2026: tightened, with more splash.** Progress tiles (1 · 2 · 3 · dive) sit above the drawing; the instruction appears once, at the start; the phrase's keyboard focus ring is lighter (2px). The drawing borrows from network-graph posters: faint links in the field, pill labels with leader lines, travelling signals, all in the deck palette and decorative.

**24 November 2026: the same four actions, a clearer idea.** On the owner's request to clarify the concept and expand its visual storytelling, the current edition's three steps became a short investigation in the site's own terms. The legacy fixtures edition keeps its earlier wording and visuals.

| Step | Words (button and live status) | Drawing (decorative, deck palette) |
| --- | --- | --- |
| Question | *how does one produce curiosity?* · hint *Step 1: notice what doesn't add up*, then one short instruction | One point of light in a faint network: an outcome and its explanation, taken as one |
| After step 1 | *step 2: test the explanation* · "Noticed: something doesn't add up." | Corner brackets close on the point, and it won't sit still |
| After step 2 | *step 3: show where they part* · "Tested: the explanation and what happened come apart." | A sage lens passes over it; it splits into *what happened* and *what was assumed*, each in a labelled tag |
| After step 3 (ready) | *Dive in* (in the accent) · "Shown: related, not equivalent." · hint *Three steps done. Dive in when you're ready.* | An orange thread joins the two; the nine published case studies light up around it, each split and joined and tagged with its structure (tags hidden on narrow screens), while signals travel out along the spokes. Spokes mean one way of looking applied to each case, not relationships between cases |
| Dive | unchanged | The view scales toward the thread; text never fades |

The drawing is `aria-hidden`; the button and the live status line carry the same meaning in words. Movement only, inside `prefers-reduced-motion: no-preference`. The violet, coral and teal tones are no longer used in the current intro.

| State | One action | Result |
| --- | --- | --- |
| Question / step1 | Activate the whole phrase, native keyboard action, click/tap or supported gesture | Step2; no timer advances it |
| Step2 | One new activation | Step3; no timer advances it |
| Step3 | One new activation | Immediately enable Dive in; retain focus on the same native button |
| Ready | Activate Dive in | Run the900ms transition; reduced motion goes directly to main |
| Any intro state, including animation | Skip | Cancel pending work and focus main |
| Returning visitor | Replay introduction near homepage statement | Restart at step1 with all four actions required |

The first presentation uses the existing browser-local visit marker; fragments, direct reading routes, Back/Forward restoration, denied storage and reduced-motion first visits bypass it. Replay remains available. Server/first-client markup is deterministic and keeps useful reading in the HTML. An error boundary recovers to main. Intro colors inherit the current observatory surface; paper tokens are not used on a dark stage.

On narrow/short screens, vertical touch panning reads enlarged content rather than advancing it; sideways swipes, phrase taps and keyboard controls remain alternatives. Primary controls stay still while decorative echoes communicate resistance/breakthrough. Skip stays fixed and reachable. Optional practice/illustration disclosures have native semantics, require no JavaScript and never change intro progress.

## Historical variant — 30 October

One deliberate interaction per step, three total, followed by an automatic dive. This is retained only for legacy fixtures and the immutable archived experience. It superseded the earlier one-start/automatic-three-beats behavior at that time. Main content exists throughout.

| State | Event | Next state / action |
|---|---|---|
| Initial routing | Existing fragment, remembered visit, reduced motion, unavailable preference/storage API | Main directly; preserve fragment. |
| Step1: question the boundaries | Activate the whole question phrase, field click/tap, directional drag/swipe, wheel gesture or supported key | First resistance/echo; step2 phrase becomes actionable immediately. |
| Step2: test the limits | One new deliberate interaction | Second resistance/echo; step3 phrase becomes actionable immediately. |
| Step3: recognize patterns | One new deliberate interaction | Breakthrough; lock further step actions. After650ms show Dive; motion starts150ms later. |
| Dive |900ms animation completes, or manual scroll reaches progress>.985 | Remove intro, focus main, move viewport to content. No fourth action required; optional dive control starts motion sooner. |
| Any intro state | Skip introduction / Skip to main content | Cancel timers and animation; move to main. |
| Replay | Explicit replay control | Fresh step1; clear timers, gesture state and counters; scroll top. |
| Reduced-motion replay | One action per step | Static progression; third action enters content immediately without animated dive. |
| Intro failure | React error boundary | Main and global skip survive. Async/browser failures outside React are not caught. |
| JavaScript unavailable | No React transition | Prerendered document remains readable. |

Waiting cannot complete step1 or step2. Click, tap, Enter or Space requires no cooldown or repeated attempt. Native phrase buttons retain keyboard focus across steps. Their clicks do not bubble into another advancement. Drag/swipe release suppresses its compatibility click. Held navigation keys ignore repeats. Wheel events within a continuous gesture are grouped using250ms of inactivity, preventing inertia from completing multiple steps.

After the third action, breakthrough/dive lasts approximately1.7seconds. Skip remains available throughout. Reduced-motion visits bypass the intro; explicit replay retains three static actions. Preference changes mid-session remain unsubscribed; skip is always available. Initial reveal enhancement remains680ms with readable text. Timers cancel on reset/unmount including StrictMode; animation frames cancel on unmount.

First presentation is remembered in localStorage even if interrupted; legacy sessionStorage markers are respected. Replay is explicit, storage denial opens content directly, and memory is browser-local. Direct reading documents never load the intro.

Regression coverage includes three separate keyboard/click/touch actions; pauses between steps; retained phrase focus; gesture click suppression/inertia grouping; directional drag; automatic continuous dive; skip/replay cancellation; returning visits; denied storage; reduced motion; direct URLs; static reading; accessibility and reflow. Automated checks do not establish comprehension or perceived waiting.
