import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const USER_STORAGE_KEY = '@esm_hub_user_profile';

const AuthContext = createContext({
  user: null,
  veteranProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  updateVeteranProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [veteranProfile, setVeteranProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load local cached profile on startup
  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY).then(saved => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && !user) {
            setVeteranProfile(parsed);
          }
        } catch {}
      }
    }).catch(() => {});
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userData = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Veteran Sir',
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        };
        setUser(userData);

        // Fetch or create profile from Firestore
        if (db) {
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(userDocRef);
            if (snap.exists()) {
              const fullProfile = { ...userData, ...snap.data() };
              setVeteranProfile(fullProfile);
              AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullProfile)).catch(() => {});
            } else {
              // Create initial profile
              const initialProfile = {
                ...userData,
                rank: 'Ex-Serviceman',
                serviceBranch: 'Indian Army',
                createdAt: serverTimestamp(),
              };
              setDoc(userDocRef, initialProfile, { merge: true }).catch(() => {});
              setVeteranProfile(initialProfile);
              AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(initialProfile)).catch(() => {});
            }
          } catch (e) {
            // Local fallback if firestore rules prevent read
            setVeteranProfile(userData);
          }
        } else {
          setVeteranProfile(userData);
        }
      } else {
        setUser(null);
        setVeteranProfile(null);
        AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => {});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please verify .env config.');
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      if (Platform.OS === 'web') {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } else {
        // Fallback for native devices
        throw new Error('Please sign in via Web browser.');
      }
    } catch (error) {
      console.error('[Google Sign-In Error]:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
      setUser(null);
      setVeteranProfile(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('[Sign-Out Error]:', e);
    }
  };

  const updateVeteranProfile = async (updates) => {
    const updated = { ...(veteranProfile || {}), ...updates };
    setVeteranProfile(updated);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});

    if (user && db) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn('[Profile Sync Warning]:', e.message);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        veteranProfile,
        loading,
        signInWithGoogle,
        signOutUser,
        updateVeteranProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
