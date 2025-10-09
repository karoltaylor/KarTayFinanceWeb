import React, { useState } from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthButton from './components/AuthButton/AuthButton';
import styles from './Login.module.css';

export default function Login() {
  const { signInWithGoogle, signInWithFacebook, signInWithGithub, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleAuth = async (authFunction, provider) => {
    console.log(`🔐 ========== LOGIN: ${provider.toUpperCase()} BUTTON CLICKED ==========`);
    console.log('📍 Current URL:', window.location.href);
    setIsLoading(true);
    setLocalError(null);
    try {
      console.log(`🔐 Calling ${provider} sign-in function...`);
      await authFunction();
      console.log(`✅ ${provider} sign-in function completed`);
    } catch (error) {
      console.error(`❌ ${provider} sign-in failed:`, error);
      setLocalError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
      console.log(`🏁 Login handler finished for ${provider}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <DollarSign size={48} />
          </div>
          <h1 className={styles.title}>Finance Manager</h1>
          <p className={styles.subtitle}>
            Sign in to manage your wallets and track your finances
          </p>
        </div>

        {(error || localError) && (
          <div className={styles.errorMessage}>
            <AlertCircle size={20} />
            <span>{localError || error}</span>
          </div>
        )}

        <div className={styles.authButtons}>
          <AuthButton
            provider="google"
            onClick={() => handleAuth(signInWithGoogle, 'Google')}
            disabled={isLoading}
          />
          <AuthButton
            provider="facebook"
            onClick={() => handleAuth(signInWithFacebook, 'Facebook')}
            disabled={isLoading}
          />
          <AuthButton
            provider="github"
            onClick={() => handleAuth(signInWithGithub, 'GitHub')}
            disabled={isLoading}
          />
        </div>

        <div className={styles.footer}>
          <p className={styles.disclaimer}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
