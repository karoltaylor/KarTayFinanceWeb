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
    <div
      onClick={onSelect}
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
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
        {wallet.totalTransactionCount || wallet.transactions.length} transaction{(wallet.totalTransactionCount || wallet.transactions.length) !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
