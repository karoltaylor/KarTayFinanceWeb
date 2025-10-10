import React from 'react';
import { formatCurrency } from '../../utils/financeUtils';
import styles from './TransactionItem.module.css';

export default function TransactionItem({ transaction }) {
  // Determine if amount is positive or negative
  const transactionAmount = transaction.transaction_amount || 0;
  const isPositive = transactionAmount >= 0;
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

  // Format number with specified decimals
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '-';
    return parseFloat(num).toFixed(decimals);
  };

  return (
    <div className={styles.item}>
      <div className={styles.date}>{formatDate(transaction.date)}</div>
      <div className={styles.assetName}>{transaction.asset_name || '-'}</div>
      <div className={styles.assetType}>
        <span className={styles.typeTag}>{transaction.asset_type || '-'}</span>
      </div>
      <div className={styles.transactionType}>
        <span className={`${styles.typeTag} ${styles[transaction.transaction_type?.toLowerCase()]}`}>
          {transaction.transaction_type || '-'}
        </span>
      </div>
      <div className={styles.volume}>{formatNumber(transaction.volume, 4)}</div>
      <div className={styles.itemPrice}>{formatNumber(transaction.item_price, 2)}</div>
      <div className={`${styles.transactionAmount} ${amountClass}`}>
        {isPositive ? '+' : ''}
        {formatNumber(transactionAmount, 2)}
      </div>
      <div className={styles.currency}>{transaction.currency || 'USD'}</div>
      <div className={styles.fee}>{formatNumber(transaction.fee, 2)}</div>
    </div>
  );
}
