import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey || 'AIzaSyCtoN3rm9t9ke8VezsWT3LdfZWWaFilHoU',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain || 'caremart-shop.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId || 'caremart-shop',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket || 'caremart-shop.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId || '397788280349',
  appId: env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId || '1:397788280349:web:d1b3e42d4d8fe6cfe5b8f4'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

const dbId = (firebaseAppletConfig as any)?.firestoreDatabaseId && (firebaseAppletConfig as any)?.firestoreDatabaseId !== '(default)' 
  ? (firebaseAppletConfig as any).firestoreDatabaseId 
  : undefined;

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    }, dbId);
  } catch (_err) {
    return getFirestore(app, dbId);
  }
})();

export default app;


