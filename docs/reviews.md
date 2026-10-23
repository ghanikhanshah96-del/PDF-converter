# Reviews and editorial profile

The homepage review form and post-download prompt submit feedback through `/api/reviews`. All accepted ratings are saved in Firestore's `userReviews` collection. Ratings of 4–5 stars publish automatically; 1–3 stars remain private and trigger an email attempt. The public selection is explicitly disclosed and does not represent all feedback.

Admins with Reviews permission can search, filter, edit, hide, or delete reviews at `/admin/reviews`. Low ratings cannot be published. The first edit retains the original feedback privately; deletion removes the document permanently. Editing does not resend email alerts.

Public reviews update through `/api/reviews/stream`, with a 15-second polling fallback when streaming is unavailable. The admin list refreshes every 15 seconds while visible and while no edit/delete dialog is open.

Set Firebase server credentials and the existing SMTP or Resend configuration. `REVIEWS_TO_EMAIL` overrides the alert recipient, followed by `CONTACT_TO_EMAIL` and the email helper's inbox fallback. Failed alerts retain `notificationStatus: failed`; the review remains saved. No automatic email retry worker is configured, and provider acceptance does not prove inbox delivery.

The API limits five attempts per daily network-address hash. Firestore TTL cleanup of `reviewSubmissionLimits.expiresAt` requires a separately configured TTL policy. Keep direct browser access to private collections restricted; the server Admin SDK performs the authorized operations.

Prompt preferences are stored in the browser, while actual reviews are stored centrally in Firestore. Old browser-only review records are not imported or fabricated.

The editorial profile is `/team/editorial` and uses the official website logo, article bylines and sitemap entry.

Run `npm run test:reviews`. See [deployment](./deployment.md) and [functional verification](./functional-verification.md) for configuration and tested limits.
