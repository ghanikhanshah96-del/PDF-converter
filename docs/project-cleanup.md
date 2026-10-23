# Project cleanup - 23 October 2026

## Organization

- Root admin, deployment, and review notes moved into `docs/` and linked from `README.md` and `docs/README.md`.
- Original tool copy and article handoffs moved into `docs/content/`.
- PDF editor research moved into `docs/research/`.
- Historical design downloads moved into `docs/references/ilovepdf/`; three identical HTML copies were excluded.
- PDF/DOCX/image fixtures moved into `tests/fixtures/`.
- PDF verification scripts moved into `tests/integration/`, and their alias helpers into `tests/helpers/`. Paths are portable rather than tied to a developer's Windows directory.
- Build preparation remains in `scripts/`. Obsolete content-generation, token-rewrite, and one-time migration scripts and their generated JSON intermediates were removed.
- The local service-account key moved into ignored `.secrets/firebase-admin.json`; its `.env.local` path was updated. No private credentials were added to Git or moved into public assets.

## Audited leftovers

The application source and all five existing CMS blog records were checked for references to `/assets/imported/`; none used that directory. Its extracted reference assets were removed from `public/`, while source reference archives remain under `docs/references/`. Unused Next.js starter SVGs, the obsolete root logo copy, a generated DOCX result, and tracked OS metadata were also removed from the active project.

Automatic safety review rejected shell deletion. The binary assets, duplicate HTML copies, and miscellaneous leftovers were instead moved to the reversible sibling backup `../project-cleanup-backup-2026-10-23/`: 271 files, 7,964,891 bytes. This backup is outside the application repository and public URL paths.

Current official branding in `public/logo.png`, application code, runtime fonts/workers/engines, dependencies, and existing blog-card changes were preserved. No Firestore records or Vercel Blob objects were edited or deleted.

## Checks

- `npm run test:pdf-edit` and `npm run test:pdf-core` passed from their new locations.
- All 25 review/media/email tests passed.
- TypeScript and ESLint for the relocated verification scripts/helpers passed.
- Documentation link checks passed.
- A real Firestore read confirmed local Firebase access after credential relocation.
- Production build passed with existing unrelated lint warnings. Production browser smoke checks covered the homepage, Edit PDF, blog and admin login, with runtime asset availability verified.

Edit PDF has no pending application-code changes to commit; its current tool implementation was already in Git before cleanup. The existing uncommitted feature changes are the blog image cards and their verification notes.
