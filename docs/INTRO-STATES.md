# Authored introduction: states and recovery

The metaphor remains attempts → resistance → temporal echoes → breakthrough. A state is the tuple `(phase, step, attempt, effect, locked)`. It is deterministic for accepted input; additional inputs while locked are ignored, not queued. Main content exists throughout.

| State | Event | Next state / action |
|---|---|---|
| Initial routing | Existing fragment, remembered first visit, reduced motion, or unavailable preference/storage API | Main content directly; preserve fragment destination. |
| Question | Begin button | Step 1, attempt 0, idle. |
| Step 1–3 idle | Click, directional pointer drag/swipe, wheel intent, or a native step/Test the boundary button | Attempt 1: resist-one; attempt 2: resist-two; attempt 3: breakthrough. Lock during transition. |
| Resistance | Timer completes (720 ms; 180 ms reduced motion) | Same step, idle/unlocked, attempt retained. |
| Breakthrough | Timer completes (820 ms; 220 ms reduced motion) | Next step, attempt 0; after step 3 enter dive. |
| Dive | Dive button | Start the automatic 1600 ms dive immediately; otherwise it starts after a 2200 ms pause. Scroll continuously through the short 140vh shell and expanding aperture. |
| Dive | Automatic motion completes, or manual scroll reaches progress > .985 | Mark seen where possible, remove intro, move focus and viewport to content. |
| Any intro state | Skip introduction or Skip to main content | Cancel pending timers on unmount, mark seen where possible, remove intro, move to main. Global link retains native fragment semantics. |
| Any state | Replay | New intro instance at question; clear old timers; scroll top; retain the persistent seen marker so a later session does not replay. |
| Intro render/lifecycle failure | React error boundary | Isolate failed intro; main and global skip survive. Async/browser failures outside React are not caught by this boundary. |
| JS fails to load | No React transition possible | Static HTML identity/contact remains available. |

Listeners are scoped to the intro, not the whole window. Native interactive controls retain Space/Enter behavior and modifier shortcuts. The assistive boundary button supports the full progression without gestures. Reduced-motion visits default directly to content; optional replay retains short transitions and a skip. Reduced-motion preference changes mid-session are not subscribed to in this small patch; global skip remains available.

Reveal starts with readable text rather than opacity zero; failure of the 680 ms enhancement timer cannot hide the question. Pending timers are canceled on reset and unmount, including StrictMode cleanup. No automatic timeout silently discards the authored experience.

Regression tests exercise first/repeat visits, storage get/set failures, reduced-motion entry, keyboard skip, native Space, full nine-attempt progression, replay interruption, touch, intro render failure, blocked JS, deep links, graph access and 320/390px widths. The dive button animates continuously; the automated full-progression check uses focus + Enter rather than disabling motion to satisfy pointer-stability heuristics.


## Owner-requested interaction update

The entire opening phrase is clickable. Each step's words are a native button; clicking the surrounding central field also counts as one attempt. Desktop/touch pointer drags provide visible movement while held and use their release direction for resistance. Capture and suppression prevent a drag from also counting as a click. Pointer cancellation resets the drag. Native controls and browser shortcuts retain their semantics.

The first presentation is remembered in localStorage, including interrupted visits; legacy sessionStorage markers are respected. Completing/skipping is not required to remember that the visitor has already arrived. Replay is always explicit. Browser storage denial still opens content directly; clearing site storage makes a browser a first-time visitor again. This is browser-local memory, not cross-device tracking.

Dive is automatic after 2200 ms; the optional button starts it sooner. A 1600 ms animation continuously advances scroll and visual depth through a 140vh shell, with a narrow expanding opening instead of a long empty scrolling interval. Reduced-motion replay completes without that animation. Skip/unmount cancels scheduled timers and animation frames. The live document remains available independently of motion.
