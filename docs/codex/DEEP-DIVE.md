# Public cases and password-protected deep dives

**Owner direction, 22 November 2026:** every investigation has a **public version**. A longer **deep dive** sits behind a password wall. Status tags and a results strip lead with what changed. Tags and headline figures avoid date call-outs.

## What is public, and what is behind the wall

| | Public version | Deep dive |
| --- | --- | --- |
| Where | `/investigations/<slug>/`, in the static site | `/deep-dive/<slug>/`, served by the Worker after a password check |
| What | At a glance (what changed first), figures, the case artifact (for example the Claims blueprint), the four questions, what I’d do differently, How I know | The longer version: process, working artifacts and sources in more detail. Written by the owner. |
| Where the content lives | This repository, once approved | **Private Cloudflare KV storage only.** It is never committed, because this GitHub repository is public. |
| Approval | Authenticated owner approval of the exact revision | The owner decides; it is uploaded by the owner from a private folder |
| Indexing | Normal, once approved | `noindex`; `Cache-Control: private, no-store` |

A password protects only what is not already public. Anything committed to this repository can be read on GitHub whatever the website does. That is why deep-dive text never goes into the repository, the build or the public files.

## How the wall works

- `wrangler.jsonc` adds a small Worker (`worker/index.ts`) that runs first **only** for `/deep-dive` and `/deep-dive/*`. Every other request is served by the static assets exactly as before, including the 404 page.
- **Password check** (`worker/deep-dive.ts`): PBKDF2-SHA256 with 100,000 iterations against the secret `DEEP_DIVE_PASSWORD_HASH`.
- **Session:** an HMAC-signed, 12-hour cookie, tied to the current password hash so that changing the password signs everyone out (`pc_deep_dive`; HttpOnly, Secure, SameSite=Lax, Path=/deep-dive/). It is signed with the secret `DEEP_DIVE_SESSION_SECRET`.
- **Login protections:**
  - Cross-site login posts are refused.
  - Redirects after login stay inside `/deep-dive/`.
  - Failed attempts are slowed down.
  - Login posts must be a normal form and small; passwords are length-capped.
- **Headers on every deep-dive response:** no caching, no indexing, no framing.
- **Pages:**
  - The page frame (`/deep-dive/_shell/`) is built with the site and contains no private content. The Worker refuses to serve it directly.
  - `/deep-dive/` lists the uploaded deep dives once a reader is signed in.
  - Each public case with `investigation.deepDive: true` links to its deep dive, with *Request access by email*.
- **Closed by default.** Until the KV binding and both secrets exist, every `/deep-dive/` address answers *Deep dives are not open yet.* Merging this code therefore opens nothing.

## Owner setup (one time, from your computer)

You need Cloudflare access; no agent has it.

1. **Create the private store:** run `npx wrangler kv namespace create DEEP_DIVE`. Copy the printed `id` into `wrangler.jsonc`:
   `"kv_namespaces": [{ "binding": "DEEP_DIVE", "id": "<that id>" }]`
2. **Choose the password:** run `npm run deep-dive:hash`, type a password of 12 or more characters, then `npx wrangler secret put DEEP_DIVE_PASSWORD_HASH` and paste the printed line.
3. **Sign sessions:** run `npx wrangler secret put DEEP_DIVE_SESSION_SECRET` and paste a long random value, for example from `openssl rand -hex 32`. Changing it later signs everyone out.
4. **Slow down guessing (required before sharing the password):** in Cloudflare, add a rate-limiting rule for `POST /deep-dive/login`, for example 10 requests per minute per IP. The built-in delay alone does not stop many parallel guesses. Each attempt also costs real CPU time (100,000 PBKDF2 iterations). If logins fail with a CPU-limit error on your plan, regenerate the hash with `npm run deep-dive:hash -- --iterations 20000`; fewer iterations are faster, and the rate limit matters more.
5. **Write a deep dive** in `private/deep-dives/<slug>.md`. Git ignores the `private/` folder. Then upload it:
   `npm run deep-dive:upload -- --slug claims-operations --title "When “complete” still generated work." --file private/deep-dives/claims-operations.md`
6. **Give readers the password privately,** for example by email after a request. To revoke access, change the password; that signs everyone out because sessions are tied to it. Rotating the session secret also signs everyone out.

Deep-dive HTML is inserted as written, because it is your own content. The page’s security policy blocks inline scripts and embeds from other sites.

## Status tags and the results strip

- **Status tag** (`investigation.status`): one per case, chosen from a fixed list (in use, adopted, recurring, led to further work, recognized, proposal), with your wording. Examples: *In use 2+ years across four offices*, *Proposal, not adopted*. It appears on investigation cards, the case header (*What became of it*) and the homepage’s featured case. The kind is always given in words.
- **Results strip** (homepage, under the opening statement): shows up to four **headline** figures (`figures[].headline`) from **approved** investigations only. Each keeps its basis label and links to the case that explains it. It renders nothing until a case is approved, so it can never show an unapproved number.
- **No date call-outs.** The schema rejects years and month names in status labels and headline figures. Durations such as “2+ years” are fine. The check caught one real case in the Claims draft (“owner-reported, 20 November”).

## Verification

| Check | Result |
| --- | --- |
| `tests/deep-dive.spec.ts` | 4 tests: closed in production, refusals, keyboard login and sign-out, crypto |
| Status, strip and date tests | in `tests/claims-candidate.spec.ts` |
| Combined run (Chromium, WebKit, Firefox) | 36 passed |
| Production | still has no case route, no strip and no tag (no approved content) |
| `npm run check:deploy` | bundles the Worker |

Not established: behaviour on Cloudflare’s network, because this session cannot deploy. Check after the merge: `/deep-dive/` shows *not open yet* until setup, then the login page.
