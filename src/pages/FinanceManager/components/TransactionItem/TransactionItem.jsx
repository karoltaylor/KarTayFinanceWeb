import React from 'react';
import { formatCurrency } from '../../utils/financeUtils';
import styles from './TransactionItem.module.css';

export default function TransactionItem({ transaction }) {
  const isPositive = transaction.amount >= 0;
  const amountClass = isPositive ? styles.positive : styles.negative;

  return (
    <div className={styles.item}>
      <div className={styles.details}>
        <p className={styles.description}>{transaction.description}</p>
        <div className={styles.meta}>
          <span className={styles.date}>{transaction.date}</span>
          <span className={styles.category}>{transaction.category}</span>
        </div>
      </div>
      <div className={`${styles.amount} ${amountClass}`}>
        {isPositive ? '+' : ''}
        {formatCurrency(transaction.amount)}
      </div>
    </div>
  );
}
