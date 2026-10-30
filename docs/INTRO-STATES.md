# Authored introduction: states and recovery

Current owner correction,30October2026: **one deliberate interaction per step**, three required actions total. This supersedes the earlier one-start/automatic-three-beats behavior. The initial question is the first step’s action; there is no separate start gate. Main content exists throughout.

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
