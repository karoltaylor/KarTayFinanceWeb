import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import UserProfile from './components/UserProfile/UserProfile'
import FinanceManager from './pages/FinanceManager'
import styles from './App.module.css'

function App() {
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