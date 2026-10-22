# Authored introduction: states and recovery

The metaphor remains attempts → resistance → temporal echoes → breakthrough. A state is the tuple `(phase, step, attempt, effect, locked)`. It is deterministic for accepted input; additional inputs while locked are ignored, not queued. Main content exists throughout.

| State | Event | Next state / action |
|---|---|---|
| Initial routing | Existing fragment, seen session, reduced motion, or unavailable preference/storage API | Main content directly; preserve fragment destination. |
| Question | Begin button | Step 1, attempt 0, idle. |
| Step 1–3 idle | Wheel or swipe intent, or native Test the boundary button | Attempt 1: resist-one; attempt 2: resist-two; attempt 3: breakthrough. Lock during transition. |
| Resistance | Timer completes (720 ms; 180 ms reduced motion) | Same step, idle/unlocked, attempt retained. |
| Breakthrough | Timer completes (820 ms; 220 ms reduced motion) | Next step, attempt 0; after step 3 enter dive. |
| Dive | Dive button | Scroll approximately .78 viewport into authored 350vh shell. Ordinary scrolling reveals depth. |
| Dive | Scroll progress > .985 | Mark seen where possible, remove intro, move focus and viewport to content. |
| Any intro state | Skip introduction or Skip to main content | Cancel pending timers on unmount, mark seen where possible, remove intro, move to main. Global link retains native fragment semantics. |
| Any state | Replay | New intro instance at question; clear old timers; scroll top; retain seen marker so a later reload need not replay. |
| Intro render/lifecycle failure | React error boundary | Isolate failed intro; main and global skip survive. Async/browser failures outside React are not caught by this boundary. |
| JS fails to load | No React transition possible | Static HTML identity/contact remains available. |

Listeners are scoped to the intro, not the whole window. Native interactive controls retain Space/Enter behavior and modifier shortcuts. The assistive boundary button supports the full progression without gestures. Reduced-motion visits default directly to content; optional replay retains short transitions and a skip. Reduced-motion preference changes mid-session are not subscribed to in this small patch; global skip remains available.

Reveal starts with readable text rather than opacity zero; failure of the 680 ms enhancement timer cannot hide the question. Pending timers are canceled on reset and unmount, including StrictMode cleanup. No automatic timeout silently discards the authored experience.

Regression tests exercise first/repeat visits, storage get/set failures, reduced-motion entry, keyboard skip, native Space, full nine-attempt progression, replay interruption, touch, intro render failure, blocked JS, deep links, graph access and 320/390px widths. The dive button animates continuously; the automated full-progression check uses focus + Enter rather than disabling motion to satisfy pointer-stability heuristics.
