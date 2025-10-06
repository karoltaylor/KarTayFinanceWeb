import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './AddWalletForm.module.css';

export default function AddWalletForm({ showForm, onToggleForm, onAddWallet }) {
  const [walletName, setWalletName] = useState('');

  const handleSubmit = () => {
    if (walletName.trim()) {
      onAddWallet(walletName.trim());
      setWalletName('');
    }
  };

  const handleCancel = () => {
    setWalletName('');
    onToggleForm(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => onToggleForm(true)}
        className={styles.addButton}
      >
        <Plus size={20} />
        Add Wallet
      </button>
    );
  }

  return (
    <div className={styles.form}>
      <input
        type="text"
        value={walletName}
        onChange={(e) => setWalletName(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Wallet name"
        className={styles.input}
        autoFocus
      />
      <div className={styles.buttonGroup}>
        <button
          onClick={handleSubmit}
          className={`${styles.button} ${styles.submitButton}`}
        >
          Add
        </button>
        <button
          onClick={handleCancel}
          className={`${styles.button} ${styles.cancelButton}`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
