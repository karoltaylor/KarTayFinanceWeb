import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, githubProvider } from '../config/firebase';
import { registerUser, setUserId } from '../services/api';

const AuthContext = createContext({});

// Detect if we're in development (localhost) or production
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

// Use popup for all environments to avoid cross-domain redirect issues
// Redirect mode has issues when app domain differs from Firebase auth domain
const USE_POPUP = true; // Changed from: isLocalhost

console.log('🔧 Auth Mode:', USE_POPUP ? 'POPUP (Development)' : 'REDIRECT (Production)');

// Module-level promise to ensure redirect result is only checked once
// This persists across component remounts (including React StrictMode)
let redirectCheckPromise = null;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔵 ========== AUTH INITIALIZATION START ==========');
      console.log('🔵 Initializing auth...');
      console.log('🌍 Environment:', {
        hostname: window.location.hostname,
        href: window.location.href,
        isLocalhost,
        authMode: USE_POPUP ? 'POPUP' : 'REDIRECT'
      });
      
      // Only check for redirect result in production (when using redirect mode)
      if (!USE_POPUP) {
        // Only check for redirect result once across all component mounts
        if (!redirectCheckPromise) {
          console.log('🆕 Creating redirect check promise...');
          console.log('📍 Current URL:', window.location.href);
          
          redirectCheckPromise = (async () => {
            try {
              // Set persistence to LOCAL (survives browser restarts)
              await setPersistence(auth, browserLocalPersistence);
              console.log('✅ Persistence set to LOCAL');

              // Check for redirect result first
              console.log('🔍 Checking for redirect result...');
              const result = await getRedirectResult(auth);
              
              if (result) {
                // User successfully signed in via redirect
                console.log('✅ Redirect authentication successful!', {
                  email: result.user.email,
                  uid: result.user.uid,
                  provider: result.providerId
                });
                return result;
              } else {
                console.log('ℹ️ No pending redirect result');
                return null;
              }
            } catch (error) {
              // Handle specific error cases
              console.error('❌ Error during redirect handling:', error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              throw error;
            }
          })();
        } else {
          console.log('♻️ Reusing existing redirect check promise...');
        }

        // Wait for redirect check to complete
        try {
          await redirectCheckPromise;
        } catch (error) {
          if (error.code === 'auth/account-exists-with-different-credential') {
            setError('An account already exists with the same email address but different sign-in credentials.');
          } else if (error.code === 'auth/popup-closed-by-user') {
            setError('Sign-in was cancelled. Please try again.');
          } else {
            setError(error.message);
          }
        }
      } else {
        // In development, just set persistence
        try {
          await setPersistence(auth, browserLocalPersistence);
          console.log('✅ Persistence set to LOCAL');
        } catch (error) {
          console.error('Error setting persistence:', error);
        }
      }

      // Set up the auth state listener
      console.log('🔵 Setting up auth state listener...');
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('🔔 ========== AUTH STATE CHANGED ==========');
        console.log('🔔 Auth state changed:', firebaseUser ? `✅ User authenticated` : '❌ No user');
        if (firebaseUser) {
          console.log('👤 Firebase User Details:', {
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            providerId: firebaseUser.providerData?.[0]?.providerId,
            emailVerified: firebaseUser.emailVerified
          });
        }
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Register user in backend (backend handles if user already exists)
          try {
            console.log('🔄 Starting backend registration/verification...');
            
            // Determine OAuth provider from providerData
            let oauthProvider = 'google'; // default
            if (firebaseUser.providerData && firebaseUser.providerData.length > 0) {
              const providerId = firebaseUser.providerData[0].providerId;
              if (providerId.includes('google')) oauthProvider = 'google';
              else if (providerId.includes('facebook')) oauthProvider = 'facebook';
              else if (providerId.includes('github')) oauthProvider = 'github';
            }
            
            console.log('📤 Sending registration request to backend:', {
              email: firebaseUser.email,
              username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              oauth_provider: oauthProvider,
              oauth_id: firebaseUser.uid,
            });
            
            const backendUserData = await registerUser({
              email: firebaseUser.email,
              username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              oauth_provider: oauthProvider,
              oauth_id: firebaseUser.uid,
            });
            
            console.log('✅ Backend registration successful:', backendUserData);
            setBackendUser(backendUserData);
            console.log('✅ Backend user state updated');
          } catch (error) {
            console.error('❌ ========== BACKEND REGISTRATION ERROR ==========');
            console.error('❌ Error registering user in backend:', error);
            console.error('❌ Error details:', {
              message: error.message,
              stack: error.stack
            });
            console.log('⚠️ Continuing with Firebase-only auth (no backend user)');
            // Don't block user from using the app, continue with Firebase auth
            // Set a minimal backend user object with Firebase info
            const fallbackUser = {
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email,
              display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            };
            console.log('⚠️ Using fallback user data:', fallbackUser);
            setBackendUser(fallbackUser);
          }
        } else {
          console.log('🚪 User logged out, clearing state...');
          // User logged out, clear stored user ID
          setUserId(null);
          setBackendUser(null);
          console.log('✅ User state cleared');
        }
        
        console.log('🏁 Setting loading to false...');
        setLoading(false);
        console.log('🏁 Auth state change handling complete');
        console.log('🔵 ========== AUTH STATE CHANGED END ==========');
      });

      return unsubscribe;
    };

    const unsubscribePromise = initAuth();

    // Cleanup subscription
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  const signInWithGoogle = async () => {
    console.log('🚀 ========== GOOGLE SIGN-IN INITIATED ==========');
    setError(null);
    try {
      if (USE_POPUP) {
        console.log('🪟 Initiating Google sign-in with POPUP...');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Popup sign-in successful:', result.user.email);
        return result.user;
      } else {
        console.log('🔄 Initiating Google sign-in with REDIRECT...');
        console.log('📍 Current location before redirect:', window.location.href);
        await signInWithRedirect(auth, googleProvider);
        console.log('📍 Redirect initiated (this line may not be reached)');
        // The actual sign-in will complete after redirect
      }
    } catch (error) {
      console.error('❌ ========== GOOGLE SIGN-IN ERROR ==========');
      console.error('❌ Error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setError(error.message);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    console.log('🚀 ========== FACEBOOK SIGN-IN INITIATED ==========');
    setError(null);
    try {
      if (USE_POPUP) {
        console.log('🪟 Initiating Facebook sign-in with POPUP...');
        const result = await signInWithPopup(auth, facebookProvider);
        console.log('✅ Popup sign-in successful:', result.user.email);
        return result.user;
      } else {
        console.log('🔄 Initiating Facebook sign-in with REDIRECT...');
        console.log('📍 Current location before redirect:', window.location.href);
        await signInWithRedirect(auth, facebookProvider);
        console.log('📍 Redirect initiated (this line may not be reached)');
      }
    } catch (error) {
      console.error('❌ ========== FACEBOOK SIGN-IN ERROR ==========');
      console.error('❌ Error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setError(error.message);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    console.log('🚀 ========== GITHUB SIGN-IN INITIATED ==========');
    setError(null);
    try {
      if (USE_POPUP) {
        console.log('🪟 Initiating GitHub sign-in with POPUP...');
        const result = await signInWithPopup(auth, githubProvider);
        console.log('✅ Popup sign-in successful:', result.user.email);
        return result.user;
      } else {
        console.log('🔄 Initiating GitHub sign-in with REDIRECT...');
        console.log('📍 Current location before redirect:', window.location.href);
        await signInWithRedirect(auth, githubProvider);
        console.log('📍 Redirect initiated (this line may not be reached)');
      }
    } catch (error) {
      console.error('❌ ========== GITHUB SIGN-IN ERROR ==========');
      console.error('❌ Error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 ========== LOGOUT INITIATED ==========');
    setError(null);
    try {
      console.log('🚪 Signing out from Firebase...');
      await signOut(auth);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    backendUser,
    loading,
    error,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGithub,
    logout,
    isAuthenticated: !!user
  };

  console.log('📊 AuthProvider state:', {
    hasUser: !!user,
    hasBackendUser: !!backendUser,
    loading,
    isAuthenticated: !!user,
    error: error ? error.substring(0, 50) : null
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
