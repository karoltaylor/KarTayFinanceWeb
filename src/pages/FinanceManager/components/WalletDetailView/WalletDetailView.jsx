import React from 'react';
import StatsGrid from '../StatsGrid/StatsGrid';
import FileUploader from '../FileUploader/FileUploader';
import TransactionList from '../TransactionList/TransactionList';
import { calculateStats, formatCurrency } from '../../utils/financeUtils';
import { MESSAGES } from '../../constants/constants';
import styles from './WalletDetailView.module.css';

export default function WalletDetailView({ wallet, onFileUpload }) {
  const stats = calculateStats(wallet.transactions);
  const hasTransactions = wallet.transactions.length > 0;

  const statsData = [
    {
      label: 'Total Income',
      value: formatCurrency(stats.income),
      type: 'income'
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(stats.expenses),
      type: 'expense'
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{wallet.name}</h2>
        <p className={styles.balance}>{formatCurrency(wallet.balance)}</p>
      </header>

      {hasTransactions && (
        <StatsGrid stats={statsData} columns={2} />
      )}

      <FileUploader
        onFileUpload={(file) => onFileUpload(wallet.id, file)}
      />

      {hasTransactions ? (
        <TransactionList transactions={wallet.transactions} />
      ) : (
        <div className={styles.emptyState}>
          <svg 
            className={styles.emptyIcon} 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <h3 className={styles.emptyTitle}>{MESSAGES.NO_TRANSACTIONS}</h3>
          <p className={styles.emptyText}>{MESSAGES.UPLOAD_TO_START}</p>
        </div>
      )}
    </div>
  );
}
