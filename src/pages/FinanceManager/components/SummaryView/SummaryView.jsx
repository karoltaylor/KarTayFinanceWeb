import React from 'react';
import { Wallet } from 'lucide-react';
import StatsGrid from '../StatsGrid/StatsGrid';
import BalanceGrowthChart from '../BalanceGrowthChart/BalanceGrowthChart';
import AssetList from '../AssetList/AssetList';
import { formatCurrency, getAllAssets, calculateBalanceGrowth } from '../../utils/financeUtils';
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
      label: 'Total Deposits',
      value: formatCurrency(stats.deposits),
      icon: 'trendingDown',
      type: 'deposit'
    },
    {
      label: 'Total Income',
      value: formatCurrency(stats.income),
      icon: 'trendingUp',
      type: 'income'
    }
  ];

  // Calculate additional data for charts and lists
  const allAssets = hasWallets ? getAllAssets(wallets) : [];
  const balanceGrowthData = hasWallets ? calculateBalanceGrowth(wallets) : [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>All Wallets Summary</h2>
        <p className={styles.subtitle}>Overview of all your finances</p>
      </header>

      {hasWallets ? (
        <>
          <StatsGrid stats={statsData} columns={3} />
          
          <div className={styles.chartsContainer}>
            <div className={styles.chartPane}>
              <BalanceGrowthChart balanceData={balanceGrowthData} />
            </div>
            <div className={styles.listPane}>
              <AssetList assets={allAssets} />
            </div>
          </div>
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
