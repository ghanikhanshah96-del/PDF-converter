# best free pdf converter — Deploy checklist (bestfreepdfconverter.com)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

## Vercel deploy

1. Push this repo to GitHub (or import the folder in the Vercel dashboard).
2. Create a new Vercel project → Framework Preset: **Next.js**.
3. Deploy with default build (`next build`) and output settings.
4. In **Project → Settings → Domains**, add `bestfreepdfconverter.com` and `www.bestfreepdfconverter.com`.
5. At your DNS host, point records as Vercel instructs (usually):
   - `A` / `ALIAS` for apex → Vercel
   - `CNAME` for `www` → `cname.vercel-dns.com`
6. Wait for SSL to become **Valid**.
7. Confirm:
   - `https://bestfreepdfconverter.com/` loads the hub
   - `/sitemap.xml` and `/robots.txt` respond
   - A sample tool (e.g. `/merge-pdf`) works offline after first load (no upload network calls for the file)

## Post-deploy SEO checks

- [ ] Canonical URLs use `https://bestfreepdfconverter.com`
- [ ] Each tool page has unique title / H1 / FAQ
- [ ] Submit sitemap in Google Search Console
- [ ] Mobile viewport: hub hero + tool dropzones usable under 390px width

## Privacy reminder

Core tools are 100% client-side. Do not add a file-upload API without updating Privacy/Terms and UI callouts.
