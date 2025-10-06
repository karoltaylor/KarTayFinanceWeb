import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className={styles.container}>
      <Loader2 className={styles.spinner} size={48} />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
