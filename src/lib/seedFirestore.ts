import { setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    // Ensure master admin entry exists in users collection
    await setDoc(doc(db, 'users', 'admin'), {
      uid: 'admin',
      email: 'christianiyonzima01@gmail.com',
      displayName: 'Store Administrator',
      role: 'admin',
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore admin verification fallback notice:', error);
  }
}

