# best free pdf converter

Privacy-first browser PDF tools for [bestfreepdfconverter.com](https://bestfreepdfconverter.com).
The app is built with Next.js and runs the core PDF workflows on the user's device, so selected files are not uploaded to a conversion server.

## What This Project Includes

- A responsive homepage with a searchable/category-filtered PDF tool grid.
- Individual tool pages for converting, organizing, optimizing, editing, signing, rotating, and unlocking PDFs.
- Client-side processing engines for supported workflows.
- Blog, about, contact, privacy, terms, robots, and sitemap routes.
- SEO metadata, JSON-LD for tool pages, and canonical URLs.
- A shared layout container so the navbar, sections, tool grid, pages, and footer use the same fixed site width.

## PDF Tools

The toolkit currently includes:

- PDF to Word
- Word to PDF
- Merge PDF
- Split PDF
- Compress PDF
- PDF to JPG
- JPG to PDF
- Edit PDF
- PDF Password Remover
- Sign PDF
- Excel to PDF
- PDF to Excel
- Rotate PDF
- Unlock PDF

Tool metadata lives in `lib/tools.ts`. Page routes are under `app/*/page.tsx`, and most tool UIs use shared shell components from `components/`.

## Layout System

The universal page width is controlled by `.site-container` in `app/globals.css`.

This class sets:

- `max-width: 72rem`
- centered horizontal layout
- consistent mobile and desktop side padding

Use `.site-container` for page-level wrappers, including nav/header content, homepage sections, tool pages, blog pages, legal pages, contact pages, and footer columns. This keeps all major sections aligned to the fixed navbar length.

Avoid mixing new page-level widths such as `max-w-7xl`, `max-w-5xl`, or `max-w-3xl` for main section wrappers. Smaller max widths are fine only for text measures inside a section, such as a paragraph line length.

## Privacy Model

Core file processing is designed to run in the browser:

- Files are selected locally by the user.
- Conversion and editing libraries process the data client-side.
- The app does not include a file upload API for the core tools.
- Password tools require the known password and do not crack unknown passwords.

Some hosting providers may still process standard web request logs for serving the site. See the Privacy page for user-facing wording.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- pdf-lib
- pdfjs-dist
- docx
- mammoth
- SheetJS `xlsx`
- JSZip

## Project Structure

```text
app/                  Next.js routes, metadata, global CSS
components/           Shared UI components and tool clients
components/tools/     Client components for each PDF tool
lib/                  Site config, tool metadata, download helpers, engines
lib/engines/          Browser-side PDF/document processing logic
public/               Static assets, logo, PDF worker, images
scripts/              Build asset preparation
docs/                 Admin, deployment, verification and source documentation
docs/content/         Source copy and article handoffs
docs/research/        PDF editor research
docs/references/      Archived design references, outside public assets
tests/                Automated review, email and media tests
tests/integration/    PDF editing and processing verification
tests/fixtures/       PDF, DOCX and image test inputs
tests/helpers/        Node test import helpers
types/                Local TypeScript declarations
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

## Build And Start

Create a production build:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

## Quality Checks

Run linting:

```bash
npm run lint
```

Recommended before deployment:

```bash
npm run lint
npm run build
```

PDF regression checks (Node.js 22.18+ or 24):

```bash
npm run test:pdf-edit
npm run test:pdf-core
```

These use portable repository paths and `tests/fixtures/`. Generated verification PDFs go to the operating system's temporary directory.

## Deployment

The app is intended for Vercel deployment with the domain `bestfreepdfconverter.com`.

See [deployment instructions](./docs/deployment.md) for Vercel and DNS steps, [admin documentation](./docs/admin.md), and [review behavior](./docs/reviews.md).

## Notes For Future Changes

- Keep page-level layout wrappers aligned with `.site-container`.
- Add new tools by updating `lib/tools.ts`, creating the route under `app/`, and adding or reusing a client component in `components/tools/`.
- Keep processing client-side unless the privacy policy and user-facing copy are updated.
- Document known limits honestly, especially OCR, password recovery, and complex Office/PDF formatting.

## Firebase web setup

Copy the NEXT_PUBLIC_FIREBASE_* values from `.env.example` into `.env.local` and your hosting environment. Restart development or rebuild production after changing them. The configured Firebase project is `bestfreepdfconverter-3c4b7`.

`lib/firebase.ts` initializes the browser app once. `components/Analytics.tsx` loads Analytics only in supported browsers, keeping the Word-to-PDF engine route excluded because it needs cross-origin isolation. This replaces the previous Google Analytics property with `G-4SJDWCMFMD`.

The CMS, reviews, and admin users use the separate server Admin SDK. To enable them, set `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from a service account belonging to `bestfreepdfconverter-3c4b7`; `FIREBASE_PROJECT_ID` can use the public project ID fallback. Never put service-account credentials in NEXT_PUBLIC variables. Public web configuration alone does not authorize Admin SDK database access.

Check Analytics Realtime in Firebase after opening a normal public page with browser tracking enabled. A successful build verifies integration but does not prove that Analytics events reached the dashboard.


## Admin media storage

New blog image uploads use Vercel Blob with lossless image optimization, within the Hobby plan's free usage limits. Connect a public Blob store to the Vercel project; Firebase Storage is not needed. Existing icons, logos, and bundled website images are unchanged. See [deployment instructions](./docs/deployment.md#admin-login-and-blog-image-storage) for setup, image limits, and live checks. Run `npm run test:media` to verify image fidelity and upload behavior.

## User reviews

Admins can open `/admin/reviews` from the User reviews sidebar item to search, filter, edit, or delete feedback and inspect email notification status. The list uses compact rows with pagination. Reviews rated 1?3 stars must remain private, and original feedback is retained privately on the first edit. Deletion requires confirmation. Team members need the Reviews permission. The admin list refreshes every 15 seconds, on window focus, or using Refresh feedback. Public visitors continue to see only 4–5 star reviews.

Run `npm run test:reviews` for the review/privacy tests. See `docs/functional-verification.md` for browser, database, production-build checks and deployment limits.

The homepage always shows a User reviews section with a Write a review button. Every accepted rating is saved to Cloud Firestore in `userReviews`. Only published 4?5 star reviews are sent to public visitors. Ratings of 1?3 stars remain private and trigger an email to `REVIEWS_TO_EMAIL` (falling back to `CONTACT_TO_EMAIL` or the configured inbox). Failed email attempts are recorded as `notificationStatus: failed` in Firestore; they do not discard the review or request duplicate submission.

`/api/reviews/stream` listens for Firestore changes and streams the public projection to visitors, including edits and deletions. Clients reconnect automatically and fall back to refreshing every 15 seconds if streaming is unavailable. Submission also refreshes the local page immediately.

Server credentials must belong to `bestfreepdfconverter-3c4b7`. Set `GOOGLE_APPLICATION_CREDENTIALS` to an absolute path (use forward slashes on Windows) for a downloaded service-account JSON, or set `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`. Enable Cloud Firestore in that Firebase project. Keep direct browser access to reviews and submission limits restricted: the server handles reads, validation, and writes. Never enable public Firestore writes as a workaround for missing server credentials.
