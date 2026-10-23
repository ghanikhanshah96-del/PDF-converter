# Project documentation

- [Admin workspace](./admin.md)
- [Deployment, Firebase, email and Blob setup](./deployment.md)
- [Reviews and editorial profile](./reviews.md)
- [Functional verification and known limits](./functional-verification.md)
- [Original tool copy](./content/tool-copy.md)
- [Article source handoffs](./content/articles/)
- [PDF editor research](./research/pdf-editor.md)
- [Archived design references](./references/ilovepdf/)

The design references are historical source material, not application assets. Current web assets live in `public/`; new CMS blog images live in Vercel Blob. Build preparation stays in `scripts/`, regression checks in `tests/integration/`, test inputs in `tests/fixtures/`, and import helpers in `tests/helpers/`.

Local private credentials belong in the ignored `.secrets/` directory, outside `public/`. They must never be committed. Vercel uses its own server environment variables; it cannot read a local Windows credential-file path.
