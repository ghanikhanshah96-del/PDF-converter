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

## Deployment

The app is intended for Vercel deployment with the domain `bestfreepdfconverter.com`.

See [DEPLOY.md](./DEPLOY.md) for Vercel and DNS steps.

## Notes For Future Changes

- Keep page-level layout wrappers aligned with `.site-container`.
- Add new tools by updating `lib/tools.ts`, creating the route under `app/`, and adding or reusing a client component in `components/tools/`.
- Keep processing client-side unless the privacy policy and user-facing copy are updated.
- Document known limits honestly, especially OCR, password recovery, and complex Office/PDF formatting.
