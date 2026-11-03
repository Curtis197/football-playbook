import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCUhaolKLREYDSoTmGQ125rVAsWDr1axIs';
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'football-playbook-c6936.firebaseapp.com';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'football-playbook-c6936';
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'football-playbook-c6936.firebasestorage.app';
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1070455562140';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || '1:1070455562140:web:884fd61e3650903527f259';

export const isFirebaseConfigured = Boolean(
  apiKey &&
  !apiKey.includes('your_firebase') &&
  projectId &&
  !projectId.includes('your_project_id')
);

if (!isFirebaseConfigured) {
  console.warn(
    '[Firebase] Environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID) are missing or set to placeholders. Remote Firestore sync is operating in fallback/demo mode. Copy .env.example to .env and configure your Firebase project credentials to enable live cloud persistence.'
  );
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);

export default db;
