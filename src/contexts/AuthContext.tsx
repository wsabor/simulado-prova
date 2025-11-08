'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          photoURL: userData.photoURL,
          createdAt: userData.createdAt.toDate(),
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // First time login - create user document
        // Default role is 'aluno', you can change this logic
        const newUser: Omit<User, 'id'> = {
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
          role: 'aluno', // Default role
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
        };

        await setDoc(userDocRef, newUser);
        setUser({ ...newUser, id: firebaseUser.uid });
      } else {
        await loadUserData(firebaseUser);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
