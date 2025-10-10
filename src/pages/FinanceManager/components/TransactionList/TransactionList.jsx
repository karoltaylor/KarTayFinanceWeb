import React from 'react';
import { Calendar } from 'lucide-react';
import TransactionItem from '../TransactionItem/TransactionItem';
import styles from './TransactionList.module.css';

export default function TransactionList({ transactions }) {
  const sortedTransactions = [...transactions].reverse();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <Calendar size={24} />
        Transactions ({transactions.length})
      </h3>
      
      {/* Table Header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerDate}>Date</div>
        <div className={styles.headerDescription}>Description</div>
        <div className={styles.headerCategory}>Category</div>
        <div className={styles.headerAmount}>Amount</div>
      </div>
      
      {/* Transaction List */}
      <div className={styles.list}>
        {sortedTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
          />
        ))}
      </div>
    </div>
  );
}
