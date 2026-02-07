// Firebase Admin SDK configuration for server-side operations
// This file provides authenticated access to Firestore from API routes

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let db: Firestore;
let adminAuth: Auth;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // For production, use service account credentials
    // For development, you can use ADC (Application Default Credentials)
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;

    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback for development - requires gcloud CLI authentication
      app = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  adminAuth = getAuth(app);

  return { app, db, adminAuth };
}

// Initialize on module load
const firebase = initializeFirebaseAdmin();

export const adminDb = firebase.db;
export const adminAuthService = firebase.adminAuth;
export default firebase.app;
