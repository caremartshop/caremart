import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { isAdminEmail } from '../lib/adminAccess';
import { UserProfile, ShippingAddress } from '../types';

export interface ProfileUpdateData {
  displayName?: string;
  phone?: string;
  address?: ShippingAddress;
  addresses?: ShippingAddress[];
  preferredPaymentMethod?: UserProfile['preferredPaymentMethod'];
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: string | ProfileUpdateData, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Check standard user document in Firestore users collection
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          // Admin rights come only from the allowlist (enforced again by firestore.rules)
          const shouldBeAdmin = isAdminEmail(user.email);
          const expectedRole: UserProfile['role'] = shouldBeAdmin ? 'admin' : 'customer';

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            if (data.role !== expectedRole) {
              // Correct stale roles (e.g. accounts that self-promoted under the old rules)
              const updatedData: UserProfile = { ...data, role: expectedRole };
              await setDoc(userDocRef, { role: expectedRole }, { merge: true });
              setUserProfile(updatedData);
            } else {
              setUserProfile(data);
            }
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || (shouldBeAdmin ? 'Store Administrator' : 'Valued Customer'),
              photoURL: user.photoURL || undefined,
              role: shouldBeAdmin ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
          const fallbackRole = isAdminEmail(user.email) ? 'admin' : 'customer';
          setUserProfile({
            uid: user.uid,
            email: user.email || 'user@caremart.shop',
            displayName: user.displayName || (fallbackRole === 'admin' ? 'Store Administrator' : 'Customer'),
            role: fallbackRole,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      const role = isAdminEmail(email) ? 'admin' : 'customer';
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: email,
        displayName: name,
        role: role,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);

      setUserProfile(newProfile);
    }
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: string | ProfileUpdateData, legacyPhone?: string) => {
    if (!currentUser) return;
    
    let displayName = userProfile?.displayName || currentUser.displayName || '';
    let phone = userProfile?.phone || legacyPhone || '';
    let addresses = userProfile?.addresses || [];
    let preferredPaymentMethod = userProfile?.preferredPaymentMethod;

    if (typeof data === 'string') {
      displayName = data;
      if (legacyPhone) phone = legacyPhone;
    } else {
      if (data.displayName !== undefined) displayName = data.displayName;
      if (data.phone !== undefined) phone = data.phone;
      if (data.addresses !== undefined) {
        addresses = data.addresses;
      } else if (data.address) {
        addresses = [data.address, ...addresses.slice(1)];
      }
      if (data.preferredPaymentMethod !== undefined) {
        preferredPaymentMethod = data.preferredPaymentMethod;
      }
    }

    if (displayName && currentUser.displayName !== displayName) {
      try {
        await updateProfile(currentUser, { displayName });
      } catch (e) {
        console.warn('Could not update Auth displayName:', e);
      }
    }

    const updatedProfile: UserProfile = {
      uid: currentUser.uid,
      email: currentUser.email || userProfile?.email || '',
      displayName,
      photoURL: currentUser.photoURL || userProfile?.photoURL,
      role: userProfile?.role || 'customer',
      createdAt: userProfile?.createdAt || new Date().toISOString(),
      phone,
      addresses,
      preferredPaymentMethod
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
    } catch (err) {
      console.error('Error saving user profile to Firestore:', err);
    }
    setUserProfile(updatedProfile);
  };

  // UI-level check only; Firestore rules independently enforce the same allowlist.
  const isAdmin = !loading && !!currentUser && isAdminEmail(currentUser.email);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
