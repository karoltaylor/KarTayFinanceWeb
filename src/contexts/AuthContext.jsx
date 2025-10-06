import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, githubProvider } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set persistence to LOCAL (survives browser restarts)
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });

    // Check for redirect result when component mounts
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User successfully signed in via redirect
          setUser(result.user);
        }
      })
      .catch((error) => {
        setError(error.message);
        console.error('Redirect sign in error:', error);
      });

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
      // Note: The actual sign-in will complete after redirect
      // The user will be available via getRedirectResult() after page reload
    } catch (error) {
      setError(error.message);
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    setError(null);
    try {
      await signInWithRedirect(auth, facebookProvider);
    } catch (error) {
      setError(error.message);
      console.error('Facebook sign in error:', error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    setError(null);
    try {
      await signInWithRedirect(auth, githubProvider);
    } catch (error) {
      setError(error.message);
      console.error('GitHub sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGithub,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
