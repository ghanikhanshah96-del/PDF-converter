# Admin blog CMS (BestFreePDFConverter)

This site includes an admin panel adapted from the StellixSoft CMS pattern, wired to **your own Firebase project** and **BestFreePDFConverter branding**.

## What you get

- `/admin/login` — sign in
- `/admin` — dashboard (post counts)
- `/admin/blogs` — create, edit, publish, delete posts
- `/admin/media` — image library + uploads
- `/admin/users` — invite teammates (optional email)

Published posts appear on `/blog` and `/blog/{slug}` with SEO meta, Open Graph, JSON-LD, and sitemap entries.

The three existing React guides (split / merge / Word→PDF) stay as static pages until you publish a Firestore post with the same slug (CMS then wins).

## Create a new Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/) and create a **new** project (not StellixSoft’s).
2. Enable **Cloud Firestore**.
3. Project settings → Service accounts → Generate new private key.
4. Put values into `.env.local` (and Vercel env):

```env
FIREBASE_PROJECT_ID=your-new-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-new-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_USERNAME=admin
ADMIN_PASSWORD=a-strong-password
SESSION_SECRET=at-least-32-random-characters
```

Collections used by the app:

- `blogPosts`
- `adminUsers`

## Local run

```bash
npm install
cp .env.example .env.local
# fill Firebase + ADMIN_* + SESSION_SECRET
npm run dev
```

Open http://localhost:3000/admin/login

## Production notes

- New blog image uploads use a connected public Vercel Blob store under `blog-images/`. See [deployment instructions](./deployment.md#admin-login-and-blog-image-storage) for connection variables and free-plan limits.
- Set the same env vars in Vercel → Project → Settings → Environment Variables.
- `/admin` is `noindex` and disallowed in `robots.ts`.
