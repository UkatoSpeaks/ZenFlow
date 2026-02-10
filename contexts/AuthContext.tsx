"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useTimerStore } from "@/lib/stores/timer-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { checkAndUpdateStreak } from "@/lib/streak-logic";

// User data stored in Firestore
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: any;
  lastLoginAt: any;
  lastActiveDate: string | null;
  streakStartDate: string | null;
  settings: {
    defaultDuration: number;
    breakDuration: number;
    darkFocusMode: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };
  stats: {
    totalSessions: number;
    totalFocusTime: number;
    longestStreak: number;
    currentStreak: number;
  };
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to create/update user document in Firestore
async function createOrUpdateUserDocument(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // New user - create document
    const newUserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastActiveDate: null,
      streakStartDate: null,
      settings: {
        defaultDuration: 25,
        breakDuration: 5,
        darkFocusMode: true,
        soundEnabled: true,
        notificationsEnabled: true,
      },
      stats: {
        totalSessions: 0,
        totalFocusTime: 0,
        longestStreak: 0,
        currentStreak: 0,
      },
    };
    await setDoc(userRef, newUserData);
  } else {
    // Existing user - update last login
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
}

// Helper to fetch user data from Firestore
async function fetchUserData(uid: string): Promise<UserData | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetStores = () => {
    // Access stores through their hooks' getState
    useTimerStore.getState().clear();
    useSettingsStore.getState().clear();
    // Clear localStorage as well to be safe
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zenflow-settings');
      localStorage.removeItem('zenflow-timer');
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // If user is switching or logging out, clear stores BEFORE updating state
      if (user && firebaseUser?.uid !== user.uid) {
        resetStores();
      }

      setUser(firebaseUser);
      setLoading(firebaseUser ? true : false); // Only set loading if we need to fetch user data
      
      if (!firebaseUser) {
        setUserData(null);
        resetStores();
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [user]);

  // Real-time user data listener
  useEffect(() => {
    if (!user) return;

    // Check and update streak immediately on login
    checkAndUpdateStreak(user.uid).catch(console.error);

    const userRef = doc(db, "users", user.uid);
    const unsubscribeData = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.data() as UserData);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error listening to user data:", err);
      setError("Failed to sync user data");
      setLoading(false);
    });

    return () => unsubscribeData();
  }, [user]);

  // Sign in with Google
  const signInWithGoogle = async (): Promise<UserCredential> => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createOrUpdateUserDocument(result.user);
      const data = await fetchUserData(result.user.uid);
      setUserData(data);
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
      throw err;
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createOrUpdateUserDocument(result.user);
      const data = await fetchUserData(result.user.uid);
      setUserData(data);
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
      throw err;
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, name: string): Promise<UserCredential> => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(result.user, { displayName: name });
      
      // Create Firestore document
      await createOrUpdateUserDocument(result.user);
      const data = await fetchUserData(result.user.uid);
      setUserData(data);
      
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      setError(errorMessage);
      throw err;
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      resetStores();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email";
      setError(errorMessage);
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
    setError(null);
    if (!auth.currentUser) {
      setError("No user logged in");
      throw new Error("No user logged in");
    }
    
    try {
      await updateProfile(auth.currentUser, { displayName, photoURL: photoURL || null });
      
      // Also update Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { displayName, photoURL: photoURL || null }, { merge: true });
      
      // Refresh user data
      const data = await fetchUserData(auth.currentUser.uid);
      setUserData(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    resetPassword,
    updateUserProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
