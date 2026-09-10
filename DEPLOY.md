# Deploy Producing Curiosity — GitHub → Cloudflare Pages

This file is written for the browser-first setup; you do not need Bash for the initial upload.

## 1. Put the project in GitHub

Unzip the handoff. In your GitHub repository, choose **Add file → Upload files** and drag in the **contents** of the unzipped folder.

The repository root should show files/folders such as:

- `.gitignore`
- `.node-version`
- `index.html`
- `package.json`
- `public/`
- `src/`
- `vite.config.ts`

Do not upload the ZIP itself, and do not leave all of these files inside an extra nested project folder.

Commit the upload to `main`.

## 2. Connect the repository to Cloudflare Pages

In Cloudflare, open **Workers & Pages**, create a Pages project, and connect the GitHub repository.

Use:

- Production branch: `main`
- Framework preset: Vite (React is fine if shown as the preset label)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank / repository root

No environment variables are required for this prototype.

## 3. Test the Pages URL first

Cloudflare will give the project a `*.pages.dev` address. Check that version before connecting the custom domain.

Verify:

- intro runs once in the session
- Replay introduction works in the footer
- keyboard focus is visible
- reduced-motion behavior is usable
- project tags open relevant graph traces
- mobile layout does not horizontally overflow

## 4. Connect producingcuriosity.com

In the Pages project, open **Custom domains** and add:

- `producingcuriosity.com`
- `www.producingcuriosity.com`

Use the apex domain as the canonical public address. Configure `www` to redirect to the apex domain in Cloudflare after both are attached.

## 5. Future updates

Once GitHub integration is active, every commit pushed to `main` triggers a new production build. Pull requests/branches can be used for preview builds before merging.

## Local build, if/when you want it

A local terminal is optional for the first GitHub upload. Later, the standard commands are:

```sh
npm install
npm run dev
```

Production check:

```sh
npm run build
```

The first successful `npm install` will generate `package-lock.json`. Commit that file to GitHub so later installs use the same resolved dependency tree.
