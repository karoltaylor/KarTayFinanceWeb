import React from 'react';
import { formatCurrency } from '../../utils/financeUtils';
import styles from './TransactionItem.module.css';

export default function TransactionItem({ transaction }) {
  const isPositive = transaction.amount >= 0;
  const amountClass = isPositive ? styles.positive : styles.negative;

  // Format date for better display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.item}>
      <div className={styles.date}>{formatDate(transaction.date)}</div>
      <div className={styles.description}>{transaction.description}</div>
      <div className={styles.category}>
        <span className={styles.categoryTag}>{transaction.category || 'Uncategorized'}</span>
      </div>
      <div className={`${styles.amount} ${amountClass}`}>
        {isPositive ? '+' : ''}
        {formatCurrency(transaction.amount)}
      </div>
    </div>
  );
}
