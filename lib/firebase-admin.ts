import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}

export function isFirebaseAdminConfigured() {
  return Boolean(
    (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
    ((process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS),
  );
}

function createFirebaseApp(): App {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const name = `admin-${projectId}`;
  const existing = getApps().find(app => app.name === name);
  if (existing) return existing;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (projectId && process.env.GOOGLE_APPLICATION_CREDENTIALS && (!clientEmail || !privateKey)) {
    return initializeApp({ credential: applicationDefault(), projectId }, name);
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  }, name);
}

const globalForFirebase = globalThis as unknown as {
  firebaseApp?: App;
  firestore?: Firestore;
};

export function getFirebaseApp(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!globalForFirebase.firebaseApp || globalForFirebase.firebaseApp.options.projectId !== projectId) {
    globalForFirebase.firebaseApp = createFirebaseApp();
    globalForFirebase.firestore = undefined;
  }
  return globalForFirebase.firebaseApp;
}

export function getDb(): Firestore {
  const app = getFirebaseApp();
  if (!globalForFirebase.firestore) {
    globalForFirebase.firestore = getFirestore(app);
  }
  return globalForFirebase.firestore;
}

export const BLOG_POSTS_COLLECTION = "blogPosts";
