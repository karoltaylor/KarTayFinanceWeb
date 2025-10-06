import React from 'react';
import { Wallet } from 'lucide-react';
import { calculateStats, formatCurrency } from '../../utils/financeUtils';
import styles from './WalletOverview.module.css';

export default function WalletOverview({ wallets, onSelectWallet }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Wallets Overview</h3>
      <div className={styles.grid}>
        {wallets.map(wallet => {
          const stats = calculateStats(wallet.transactions);
          const hasTransactions = wallet.transactions.length > 0;

          return (
            <div
              key={wallet.id}
              onClick={() => onSelectWallet(wallet.id)}
              className={styles.card}
            >
              <div className={styles.header}>
                <div className={styles.iconWrapper}>
                  <Wallet size={20} />
                </div>
                <div>
                  <h4 className={styles.walletName}>{wallet.name}</h4>
                  <p className={styles.transactionCount}>
                    {wallet.transactions.length} transaction{wallet.transactions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <p className={styles.balance}>
                {formatCurrency(wallet.balance)}
              </p>
              {hasTransactions && (
                <div className={styles.stats}>
                  <div>
                    <span className={styles.statLabel}>Income:</span>
                    <p className={styles.income}>
                      {formatCurrency(stats.income)}
                    </p>
                  </div>
                  <div>
                    <span className={styles.statLabel}>Expenses:</span>
                    <p className={styles.expense}>
                      {formatCurrency(stats.expenses)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
