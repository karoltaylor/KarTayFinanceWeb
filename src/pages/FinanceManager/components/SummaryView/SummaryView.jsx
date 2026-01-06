import React from 'react';
import { Wallet } from 'lucide-react';
import StatsGrid from '../StatsGrid/StatsGrid';
import BalanceGrowthChart from '../BalanceGrowthChart/BalanceGrowthChart';
import AssetList from '../AssetList/AssetList';
import TransactionUploadPane from '../TransactionUploadPane/TransactionUploadPane';
import { formatCurrency, getAllAssets, calculateBalanceGrowth, getPrimaryCurrency } from '../../utils/financeUtils';
import { MESSAGES } from '../../constants/constants';
import styles from './SummaryView.module.css';

export default function SummaryView({ 
  wallets, 
  stats, 
  onSelectWallet,
  onFileUpload,
  onAITransformUpload,
  uploadLoading = false
}) {
  const hasWallets = wallets.length > 0;
  const primaryCurrency = getPrimaryCurrency(wallets);

  const statsData = [
    {
      label: 'Total Balance',
      value: formatCurrency(stats.totalBalance, primaryCurrency),
      icon: 'wallet',
      type: 'balance'
    },
    {
      label: 'Total Deposits',
      value: formatCurrency(stats.deposits, primaryCurrency),
      icon: 'trendingDown',
      type: 'deposit'
    },
    {
      label: 'Total Income',
      value: formatCurrency(stats.income, primaryCurrency),
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
          
          {/* Upload Pane */}
          <div className={styles.uploadSection}>
            <TransactionUploadPane
              wallets={wallets}
              onUpload={onFileUpload}
              onAITransformUpload={onAITransformUpload}
              loading={uploadLoading}
            />
          </div>
          
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
