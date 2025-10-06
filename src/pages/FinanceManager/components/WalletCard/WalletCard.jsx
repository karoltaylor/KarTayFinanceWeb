import React from 'react';
import { Wallet, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/financeUtils';
import styles from './WalletCard.module.css';

export default function WalletCard({ wallet, isSelected, onSelect, onRemove }) {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <button
      onClick={onSelect}
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Wallet size={18} />
          <span className={styles.name}>{wallet.name}</span>
        </div>
        {isSelected && (
          <button
            onClick={handleRemove}
            className={styles.removeButton}
            title="Remove wallet"
            aria-label="Remove wallet"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <p className={styles.balance}>
        {formatCurrency(wallet.balance)}
      </p>
      <p className={styles.transactionCount}>
        {wallet.transactions.length} transaction{wallet.transactions.length !== 1 ? 's' : ''}
      </p>
    </button>
  );
}
