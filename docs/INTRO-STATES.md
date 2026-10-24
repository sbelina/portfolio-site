# Authored introduction: states and recovery

One deliberate action starts three automatic teaching stages: question the boundaries → test the limits → recognize patterns. Resistance, temporal echoes and breakthrough express those stages without requiring repeated input. Main content exists throughout.

| State | Event | Next state / action |
|---|---|---|
| Initial routing | Existing fragment, remembered visit, reduced motion, unavailable preference/storage API | Main directly; preserve fragment. |
| Question | Native Begin button, central field click/tap, directional drag/swipe, wheel intent, supported navigation key | Lock further starts; show step 1 and first resistance immediately. |
| Step 1 | 1000 ms after start | Step 2, second resistance. |
| Step 2 | 2000 ms after start | Step 3, breakthrough. |
| Step 3 | 3000 ms after start | Dive; automatic motion starts after 150 ms. Optional dive button starts sooner. |
| Dive | 900 ms animation completes, or manual scroll reaches progress > .985 | Remove intro, focus main and move viewport to content. |
| Any intro state | Skip introduction / Skip to main content | Cancel timers and animation on unmount; move to main. Global skip retains native fragment semantics. |
| Replay | Explicit replay control | Fresh question, clear old timers, scroll top. |
| Reduced-motion replay | Begin | Complete immediately without staged animation. |
| Intro render/lifecycle failure | React error boundary | Main and global skip survive. Async/browser failures outside React are not caught. |
| JavaScript unavailable | No React transition | Prerendered document remains readable. |

Input after the initial accepted action cannot queue, restart or accelerate the stages. Directional drag provides visible feedback while held; release starts the sequence. Click suppression avoids double activation after a drag. Cancellation resets drag feedback. Native controls retain keyboard semantics; listeners are scoped to the intro. Stage labels are text, not repeated-action buttons. Decorative echoes are hidden from assistive technology; a polite status region announces progression.

The full passage takes approximately 4.05 seconds after starting, without additional required actions. Skip remains available throughout. Reduced-motion visits bypass the intro. Preference changes mid-session are not subscribed to; skip remains available. The 680 ms reveal enhancement never starts with unreadable text. Timers cancel on reset/unmount, including StrictMode cleanup, and animation frames cancel on unmount.

First presentation is remembered in localStorage even if interrupted; legacy sessionStorage markers are respected. Replay is explicit, and storage denial opens content directly. Memory is browser-local. Direct reading documents never load the intro.

Regression coverage includes a single keyboard action through all stages, repeated-input suppression, directional desktop drag, touch swipe, wheel-to-dive progression, interrupted replay timers, first/repeat visits, storage failures, reduced motion, native keyboard controls, render failure, blocked JavaScript, direct links, graph access and narrow reflow. Automated checks do not establish comprehension or perceived waiting; observe those with readers.
