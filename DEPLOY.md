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

## Admin login and blog image storage

Set these variables in Vercel **Settings > Environment Variables > Production**:

- `ADMIN_USERNAME`: your chosen login name, for example `admin` (not a URL).
- `ADMIN_PASSWORD`: a unique strong password. This is the password for `/admin/login`.
- `SESSION_SECRET`: an independent random secret, at least 32 characters. Keep it stable between deployments; changing it signs out current sessions.
- `FIREBASE_PROJECT_ID=bestfreepdfconverter-3c4b7`, plus `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from that project's service-account JSON.
- Connect a **public Vercel Blob store** for blog images; Vercel adds `BLOB_READ_WRITE_TOKEN` and/or `BLOB_STORE_ID` when the store is connected to this project's Production environment.

Generate your own password and session secret locally, then copy each value into its separate Vercel field, without surrounding quotes:

```bash
node -e "const c=require('node:crypto'); console.log('ADMIN_PASSWORD='+c.randomBytes(18).toString('base64url')); console.log('SESSION_SECRET='+c.randomBytes(32).toString('hex'))"
```

Do not set `GOOGLE_APPLICATION_CREDENTIALS` to a Windows file path on Vercel. Use the email/private-key variables above. Never expose these credentials using `NEXT_PUBLIC_` names or commit the JSON key.

For blog images, open **Vercel > Project > Storage > Create Database > Blob**, choose **Public** access, create the store on your Hobby account, and connect it to the project. Include Production (and Development if testing locally). Vercel's Hobby Blob allowance is free within its storage, operation and bandwidth limits. Exceeding those limits can suspend Blob access; there is no paid fallback in this app. Check current allowances and Hobby eligibility in [Vercel's documentation](https://vercel.com/docs/vercel-blob/usage-and-pricing).

New admin-uploaded blog images are written only to `blog-images/` in Vercel Blob. Firebase Storage and `FIREBASE_STORAGE_BUCKET` are not needed. Firebase Firestore remains the database for blog records, admin users and reviews. Do not remove its server credentials.

Existing website icons, logos, and bundled images stay in the repository and are served by Vercel as before. The upload optimizer does not scan, rewrite, or migrate those assets. Existing bundled `/uploads/blog/` files also remain readable. The media library combines new blog uploads with existing images.

Static 8-bit sRGB images are offered lossless WebP compression without resizing. The smaller of the original and compressed file is stored. Colour profile and EXIF are retained; vectors, animation, high-bit-depth and other colour-space images are preserved unchanged. This avoids promising a fixed size reduction for already compressed images. Uploads are limited to 4 MB (below Vercel's multipart request limit) and 24 million decoded pixels.

Push the code and redeploy after connecting the store. Test login, upload from Media and the blog editor, refresh the media library, publish a test image, and confirm its Blob URL opens. If the store is unconfigured or free usage is exhausted, upload reports an error instead of writing to local disk or using a paid service. Never expose the Blob write token in a `NEXT_PUBLIC_` variable.

Run `npm run test:media` for image pixel fidelity, animation/vector preservation, upload permissions/size checks, missing configuration, and the mocked Blob upload/list round trip. A successful local test does not prove a live Blob store has been connected.

## Invitation email setup

User creation and email delivery are separate: if delivery fails, the created account remains active. The Users screen shows the username, login link and a collapsed temporary-password disclosure. Share those details privately, or use Reset password to send a new invitation after fixing delivery.

Resend must send **from a domain you own and have verified**, not from `gmail.com`. In **Resend > Domains**, add `bestfreepdfconverter.com`, copy the exact DNS records into its DNS provider, and wait for Resend to mark the domain verified. Then set this Vercel Production variable and redeploy:

```text
RESEND_FROM_EMAIL=BestFreePDFConverter <noreply@bestfreepdfconverter.com>
```

Paste only the value in Vercel's Value field. Keep `RESEND_API_KEY` from the same Resend account/domain. A Gmail address is valid as the recipient (`CONTACT_TO_EMAIL` or a teammate's address), but not as the Resend sender. `onboarding@resend.dev` only supports sending tests to the email associated with the Resend account, so it cannot replace a verified sender for team invitations. See [verified domains](https://resend.com/docs/dashboard/domains/introduction) and [test-sender restrictions](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

Domain verification and the Production sender variable must be configured by the account/DNS owner; changing application code cannot verify ownership. No real invitation is sent by automated tests. Run `npm run test:email` for sender validation, provider-specific error messages, SMTP behavior, and account preservation when email fails.

## Post-deploy SEO checks

- [ ] Canonical URLs use `https://bestfreepdfconverter.com`
- [ ] Each tool page has unique title / H1 / FAQ
- [ ] Submit sitemap in Google Search Console
- [ ] Mobile viewport: hub hero + tool dropzones usable under 390px width

## Privacy reminder

Core tools are 100% client-side. Do not add a file-upload API without updating Privacy/Terms and UI callouts.
