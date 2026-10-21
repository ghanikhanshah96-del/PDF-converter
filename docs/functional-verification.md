# Functional verification — 21 October 2026

This report covers the local application using the connected `bestfreepdfconverter-3c4b7` Firestore database. It does not certify a deployed hosting environment or every possible input document.

## Changes

- Added `/admin/reviews` and a permission-protected `/api/admin/reviews` endpoint. Admins can search every stored review, filter below 3 stars (1–2), see all private feedback (1–3), view public reviews (4–5), and filter email delivery failures. Feedback refreshes every 15 seconds and on window focus; a manual refresh is available.
- Added a Reviews permission to team-member access settings and a User reviews sidebar link.
- Removed the white color filter from the official logo on admin login and sidebar. The same official `public/logo.png` asset is used by the website and author profile.
- Kept login fields disabled until the client form is ready, preventing lost input during initial loading.
- Fixed the PDF editor clearing the selection immediately after placing new text. New text can now be typed and saved without selecting the box a second time.
- Updated `docx` to 9.9.0 to fix its published ImageRun/Turbopack syntax failure in PDF-to-Word conversion. Upstream fix: https://github.com/dolanmiu/docx/pull/3574
- Moved the middleware request-size option to the experimental configuration supported by the installed Next.js version.

## Verification completed

- 22 real Edge/Chromium browser checks passed: admin login/navigation, official logo colors, feedback page, anonymous access rejection, PDF merge/split/rotate/compress, PDF-to-JPG, image-to-PDF, Excel-to-PDF, PDF-to-Excel, PDF-to-Word, password protection/removal, Word-to-PDF WASM engine, PDF viewer, typed signature, PDF text editing/export, invalid page-range rejection, blog search, homepage review dialog/author logo, and mobile layouts. Downloaded documents were opened or inspected for expected page counts, rotation, ZIP contents, spreadsheet text, or document text as appropriate.
- All 30 checked public routes and assets returned HTTP 200. Unknown pages returned 404, and invalid contact submissions returned 400 without sending mail.
- Real Firestore/API checks passed for draft blog creation/read/update/deletion, draft privacy, media upload/download/library listing, user permission updates, admin feedback access, and restricted-user rejection.
- Seeded private 1-, 2-, and 3-star feedback was visible to authorized admins, searchable/filterable in the browser, and excluded from the public API. Desktop and mobile feedback layouts were checked.
- A temporary 4-star review submitted through the real API was stored and streamed immediately to a public listener. Deleting it updated that listener. Invalid ratings were rejected.
- Temporary QA reviews, the QA submission counter, the QA admin user, the QA draft, and the uploaded QA image were removed after their checks. Existing user content was preserved.
- Eight automated review tests cover star boundaries, persistence/email routing, private-data projection, invalid inputs/rate limits, email failures, stream updates/disconnect cleanup, and admin authorization. Run `npm run test:reviews`.
- Targeted ESLint and `npx tsc --noEmit` passed.
- `npm run build` passed. Six additional browser checks against `next start` passed: login, official logo/feedback page, PDF-to-Word, Word-to-PDF, viewer, and logout/session invalidation. No browser errors were recorded in those production checks. The local production server is running at http://localhost:3000.

## Admin management and layout update ? 22 October 2026

- Feedback uses a compact desktop table, mobile rows, inline count/filter tabs, search, expandable comments, and 10-row pagination. Large metric cards and repeated full-width feedback cards were removed.
- Reviews can be edited or permanently deleted through authenticated endpoints. Rating and visibility are validated on the server; 1?3 star reviews cannot become public. First-edit originals, update time, and editing admin are retained privately. Email notification history is preserved; editing does not resend alerts.
- Review deletion uses an explicit confirmation dialog. Cancel leaves the record intact. Saving/deleting updates the admin list and public review data.
- Team management uses a compact searchable table, permission presets, an Add user dialog, an Edit access dialog, and confirmations for removal/password reset. Invitation failures and temporary recovery passwords remain available to the owner.
- The shared admin shell, overview, blog table, and media spacing were tightened. Dialogs trap focus, support Escape, and return focus to the trigger. The mobile menu supports keyboard navigation and Escape.
- Seven additional real browser workflows passed: feedback density/pagination; Firestore review edits and public projection; cancellation and actual deletion; permission rejection; mocked invite form submission; real user access editing/removal and reset cancellation; mobile dialogs/menu/focus behavior. Temporary fixtures were removed.
- The automated review suite now contains 14 passing tests, including mutation permissions, validation, original-record preservation, missing records, and deletion.
- The updated production build passed. All five admin sections loaded successfully under `next start`; compact feedback layouts passed at widths of 1024, 768, and 390 pixels. Production invitation dialogs opened/closed correctly, inactive links were absent, and no browser errors were recorded.
- Invite form submission used a mocked response to avoid sending a test invitation. Permission changes and review/user deletion used temporary Firestore records; customer records were not changed.

## Limits and deployment checks

- Email routing, HTML escaping, and failure persistence were tested with a mocked mail provider. No new verification emails were sent. Actual inbox delivery and administrator invite emails are not verified. The configured sender uses Resend's onboarding domain; the API key permits sending but cannot list domain status.
- Live hosting has not been deployed or tested in this task. Configure server credentials in the hosting environment, redeploy, and repeat login, review submission/live updates, mail delivery, uploads, and Word-to-PDF header tests on the HTTPS domain. The local Windows service-account path is not portable to hosting.
- Media uploads currently use the application's local filesystem. Hosting must provide persistent writable storage for uploads to survive deployments; ephemeral/serverless hosting requires external storage.
- Inactive Pages and Services entries have been removed from navigation and assignable permissions.
- npm reports 19 dependency vulnerabilities (6 moderate, 13 high). Dependency-wide remediation was outside this functional change.

## CMS article layout update - 22 October 2026

- Admin-published articles now use the full shared navbar content width. Removed the extra narrow column and neutralized nested pasted page-container padding. The shared article introduction uses tighter spacing and a full-width excerpt.
- Explicit cover images remain supported; articles without a selected cover no longer receive a duplicate fallback image. Saved editor content is unchanged.
- Published HTML uses consistent article typography, mobile table scrolling, relative local asset/link URLs, and working copied FAQ controls.
- Real Edge browser checks at 1440, 768, and 390 pixels confirmed exact left/right navbar alignment, no page overflow, and FAQ opening/closing without browser errors. All three inline images loaded on desktop and mobile.
- Targeted ESLint and TypeScript checks passed. Live hosting was not deployed as part of this layout change.
- The production build passed with existing unrelated lint warnings. Repeated navbar alignment, mobile overflow, and FAQ checks against `next start` passed at all three widths, with no browser errors. Local preview is available at http://localhost:3000.
