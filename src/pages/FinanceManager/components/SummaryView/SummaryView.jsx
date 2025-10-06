import React from 'react';
import { Wallet } from 'lucide-react';
import StatsGrid from '../StatsGrid/StatsGrid';
import WalletOverview from '../WalletOverview/WalletOverview';
import { formatCurrency } from '../../utils/financeUtils';
import { MESSAGES } from '../../constants/constants';
import styles from './SummaryView.module.css';

export default function SummaryView({ wallets, stats, onSelectWallet }) {
  const hasWallets = wallets.length > 0;

  const statsData = [
    {
      label: 'Total Balance',
      value: formatCurrency(stats.totalBalance),
      icon: 'wallet',
      type: 'balance'
    },
    {
      label: 'Transactions',
      value: stats.totalTransactions.toString(),
      icon: 'calendar',
      type: 'info'
    },
    {
      label: 'Total Income',
      value: formatCurrency(stats.totalIncome),
      icon: 'trendingUp',
      type: 'income'
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses),
      icon: 'trendingDown',
      type: 'expense'
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>All Wallets Summary</h2>
        <p className={styles.subtitle}>Overview of all your finances</p>
      </header>

      {hasWallets ? (
        <>
          <StatsGrid stats={statsData} columns={4} />
          <WalletOverview wallets={wallets} onSelectWallet={onSelectWallet} />
        </>
      ) : (
        <div className={styles.emptyState}>
          <Wallet className={styles.emptyIcon} size={64} />
          <h3 className={styles.emptyTitle}>{MESSAGES.NO_WALLETS}</h3>
          <p className={styles.emptyText}>{MESSAGES.CREATE_FIRST_WALLET}</p>
        </div>
      )}
    </div>
  );
}
