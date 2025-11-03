import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllowedEmails } from '../../config/authorization';
import styles from './Unauthorized.module.css';

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const isDev = import.meta.env.DEV;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🔒</div>
        <h1 className={styles.title}>Access Denied</h1>
        <p className={styles.message}>
          Your account <strong>{user?.email}</strong> is not authorized to access this application.
        </p>
        
        {isDev && (
          <div className={styles.devInfo}>
            <h3>Development Information</h3>
            <p>Allowed emails:</p>
            <ul className={styles.emailList}>
              {getAllowedEmails().map(email => (
                <li key={email}>{email}</li>
              ))}
            </ul>
            <p className={styles.hint}>
              To add your email, update <code>src/config/authorization.js</code>
            </p>
          </div>
        )}

        <button onClick={logout} className={styles.logoutButton}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

