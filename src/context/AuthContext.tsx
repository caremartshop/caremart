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
  toggleAdminRole: () => void;
  updateProfileData: (data: string | ProfileUpdateData, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if an email is a designated administrator email
  const isDesignatedAdminEmail = (email?: string | null) => {
    if (!email) return false;
    const lower = email.toLowerCase().trim();
    return (
      lower === 'christianiyonzima01@gmail.com' ||
      lower === 'admin@caremart.rw' ||
      lower === 'admin@caremart.com' ||
      lower.startsWith('admin@') ||
      lower.includes('caremart-admin')
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Check standard user document in Firestore users collection
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          // Also check if there is an 'admin' document in users collection
          const adminDocRef = doc(db, 'users', 'admin');
          let isAdminUid = false;
          try {
            const adminDoc = await getDoc(adminDocRef);
            if (adminDoc.exists() && (adminDoc.data()?.email === user.email || adminDoc.data()?.uid === user.uid)) {
              isAdminUid = true;
            }
          } catch {
            // Ignore if admin doc is unreadable
          }

          const shouldBeAdmin = isDesignatedAdminEmail(user.email) || isAdminUid;

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            if (shouldBeAdmin && data.role !== 'admin') {
              const updatedData: UserProfile = { ...data, role: 'admin' };
              await setDoc(userDocRef, updatedData, { merge: true });
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
          const fallbackRole = isDesignatedAdminEmail(user.email) ? 'admin' : 'customer';
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
      const role = isDesignatedAdminEmail(email) ? 'admin' : 'customer';
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: email,
        displayName: name,
        role: role,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      
      // Also register into 'users/admin' if it's the master admin
      if (role === 'admin') {
        try {
          await setDoc(doc(db, 'users', 'admin'), newProfile, { merge: true });
        } catch (e) {
          console.warn('Could not update users/admin doc:', e);
        }
      }

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

  const toggleAdminRole = () => {
    if (!currentUser) return;
    const nextRole = userProfile?.role === 'admin' ? 'customer' : 'admin';
    const updated: UserProfile = {
      ...userProfile,
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: userProfile?.displayName || 'User',
      role: nextRole,
      createdAt: userProfile?.createdAt || new Date().toISOString()
    };
    setUserProfile(updated);
    setDoc(doc(db, 'users', currentUser.uid), { role: nextRole }, { merge: true }).catch(console.error);
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

  const isAdmin = !loading && !!currentUser && (
    userProfile?.role === 'admin' || 
    isDesignatedAdminEmail(currentUser.email) ||
    currentUser.uid === 'admin'
  );

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
        toggleAdminRole,
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
