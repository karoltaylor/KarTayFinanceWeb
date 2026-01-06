import React, { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import UserProfile from './components/UserProfile/UserProfile'
import FinanceManager from './pages/FinanceManager'
import styles from './App.module.css'

function App() {
  useEffect(() => {
    console.log('🚀 ========== APP MOUNTED ==========');
    console.log('🌍 Environment Info:', {
      hostname: window.location.hostname,
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    });
    console.log('🔧 Environment Variables:', {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      hasFirebaseApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY
    });
  }, []);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className={styles.app}>
          <header className={styles.header}>
            <UserProfile />
          </header>
          <main className={styles.main}>
            <FinanceManager />
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App