import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > Your Apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key-here",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

console.log('🔥 ========== FIREBASE INITIALIZATION ==========');
console.log('🔥 Firebase Config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "your-api-key-here",
  hasAppId: !!firebaseConfig.appId && firebaseConfig.appId !== "your-app-id"
});

// Validate Firebase configuration
if (firebaseConfig.apiKey === "your-api-key-here" || !firebaseConfig.apiKey) {
  console.error('❌ Firebase API Key not configured! Check your .env file.');
}
if (firebaseConfig.projectId === "your-project-id" || !firebaseConfig.projectId) {
  console.error('❌ Firebase Project ID not configured! Check your .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

// Initialize Firebase Authentication
export const auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

// Initialize Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Optional: Configure providers for better redirect flow
// Note: Removing custom parameters to avoid redirect issues
// googleProvider.setCustomParameters({
//   prompt: 'select_account'
// });

export default app;
