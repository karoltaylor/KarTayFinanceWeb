import React from 'react';
import StatsGrid from '../StatsGrid/StatsGrid';
import FileUploader from '../FileUploader/FileUploader';
import TanStackTableTransactions from '../TanStackTableTransactions/TanStackTableTransactions';
import TanStackTableErrors from '../TanStackTableErrors/TanStackTableErrors';
import TanStackTableUnprocessedErrors from '../TanStackTableUnprocessedErrors/TanStackTableUnprocessedErrors';
import { calculateStats, formatCurrency } from '../../utils/financeUtils';
import { MESSAGES } from '../../constants/constants';
import styles from './WalletDetailView.module.css';

export default function WalletDetailView({ 
  wallet, 
  onFileUpload, 
  errorTransactions = [], 
  pagination, 
  onPageChange, 
  onSortChange,
  onFilterChange,
  onRowsPerPageChange,
  loading = false 
}) {
  // Debug logging
  console.log('🔍 WalletDetailView - Wallet:', wallet);
  console.log('🔍 WalletDetailView - Transactions:', wallet.transactions);
  console.log('🔍 WalletDetailView - Transaction count:', wallet.transactions?.length || 0);
  console.log('🔍 WalletDetailView - Error transactions:', errorTransactions);
  console.log('🔍 WalletDetailView - Error transaction count:', errorTransactions?.length || 0);
  console.log('🔍 WalletDetailView - Pagination props:', {
    pagination,
    onPageChange: !!onPageChange,
    loading
  });
  
  const stats = calculateStats(wallet.transactions);
  const hasTransactions = wallet.transactions && wallet.transactions.length > 0;

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
        <>
          <TanStackTableTransactions 
            transactions={wallet.transactions}
            loading={loading}
            pagination={pagination}
            onPageChange={onPageChange}
            onSortChange={onSortChange}
            onFilterChange={onFilterChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </>
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

      {/* Always show error transactions table if there are any */}
      {errorTransactions.length > 0 && (
        <TanStackTableErrors 
          errors={errorTransactions} 
          walletId={wallet.id}
          walletName={wallet.name}
        />
      )}

      {/* Unprocessed Transaction Errors for Selected Wallet */}
      <TanStackTableUnprocessedErrors walletId={wallet.id} />
    </div>
  );
}
