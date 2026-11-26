# Contact form delivery

Owner direction, November 2026: "Send the emails to hello@sbelina.com but make sure I can't get spammed."

## How it works

The Contact form posts to `/api/contact` (`worker/contact.ts`, rules in `worker/contact-rules.ts`). The Worker:

- sends one plain-text email to hello@sbelina.com from `contact@producingcuriosity.com`, with the visitor as Reply-To, so replying answers them directly;
- stores nothing: no database, no copy of the message, no cookie.

Spam defences:
- same-origin only;
- 3 submissions a minute per client (rate-limit binding `CONTACT_LIMIT`);
- a hidden honeypot field;
- a 3-second minimum before submitting;
- field length limits, a valid reply address and at most 3 links;
- no header injection;
- **Cloudflare Turnstile**, verified on the server. It is required.

Until setup is complete, `/api/contact` answers 503 and the form keeps its current behaviour: **Prepare email** opens the visitor's own email app. The button always says which one will happen.

## Owner setup (Cloudflare dashboard, about 10 minutes)

1. **Email Routing**:
   1. Go to **producingcuriosity.com → Email → Email Routing** and choose **Enable**. Accept the DNS records it adds.
   2. Under **Destination addresses**, add **hello@sbelina.com**.
   3. Click the verification link Cloudflare emails you.
2. **Turnstile**:
   1. Go to **Turnstile → Add widget**. Name it "Contact form", set Hostname to `producingcuriosity.com`, and choose Widget mode **Managed**.
   2. Copy the **site key**. It's public; send it to me.
   3. Copy the **secret key**. It's private; keep it out of chat.
3. **The secret**:
   1. Go to **Workers & Pages → portfolio-site → Settings → Variables and Secrets → Add**.
   2. Choose Type **Secret**, Name `TURNSTILE_SECRET`, and paste the secret key.
   3. Click **Deploy**.
4. Tell me when steps 1–3 are done. I then:
   - add the email binding to `wrangler.jsonc`: `"send_email": [{ "name": "CONTACT_EMAIL", "destination_address": "hello@sbelina.com" }]`. This must wait until Email Routing is on, or deploys fail;
   - set the site key in `contactDelivery.turnstileSiteKey` (`src/content/recruiter.ts`);
   - send a test message through the live form.

## Reducing spam to the address itself

hello@sbelina.com has been visible in the site's pages, where scrapers can collect it. In **producingcuriosity.com → Scrape Shield**, turn on **Email Address Obfuscation**. Cloudflare then hides the address in page HTML from bots while people still see it. The address also appears on LinkedIn and on any résumé you send out; those are outside this site.
