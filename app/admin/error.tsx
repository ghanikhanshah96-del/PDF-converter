"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main className="site-container py-12">
    <h1 className="font-display text-2xl font-semibold">Admin data is unavailable</h1>
    <p className="mt-3">Check your Firebase server credentials, Cloud Firestore database, and service-account permissions, then try again.</p>
    <button className="btn btn-primary mt-5" onClick={reset}>Try again</button>
    <a href="/admin" className="ml-4 underline">Back to admin</a>
  </main>;
}
