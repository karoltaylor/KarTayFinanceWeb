import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/financeUtils';
import styles from './BalanceGrowthChart.module.css';

export default function BalanceGrowthChart({ balanceData }) {
  if (!balanceData || balanceData.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <TrendingUp className={styles.icon} size={24} />
          <h3 className={styles.title}>Balance Growth</h3>
        </div>
        <div className={styles.emptyState}>
          <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  // Find min and max values for scaling
  const balances = balanceData.map(d => d.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const range = maxBalance - minBalance || 1;

  // Format date for display
  const formatDate = (dateString) => {
    const [year, month] = dateString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TrendingUp className={styles.icon} size={24} />
        <h3 className={styles.title}>Balance Growth Over Time</h3>
      </div>
      
      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          {balanceData.map((dataPoint, index) => {
            const height = ((dataPoint.balance - minBalance) / range) * 100;
            const isLast = index === balanceData.length - 1;
            
            return (
              <div key={dataPoint.date} className={styles.barContainer}>
                <div 
                  className={styles.bar}
                  style={{ height: `${height}%` }}
                  title={`${formatDate(dataPoint.date)}: ${formatCurrency(dataPoint.balance)}`}
                />
                {isLast && (
                  <div className={styles.currentValue}>
                    {formatCurrency(dataPoint.balance)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className={styles.xAxis}>
          {balanceData.map((dataPoint, index) => {
            // Show every 3rd label to avoid crowding
            if (index % 3 === 0 || index === balanceData.length - 1) {
              return (
                <div key={dataPoint.date} className={styles.xAxisLabel}>
                  {formatDate(dataPoint.date)}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
      
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Starting Balance:</span>
          <span className={styles.statValue}>
            {formatCurrency(balanceData[0]?.balance || 0)}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Current Balance:</span>
          <span className={styles.statValue}>
            {formatCurrency(balanceData[balanceData.length - 1]?.balance || 0)}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Growth:</span>
          <span className={`${styles.statValue} ${styles.growth}`}>
            {formatCurrency((balanceData[balanceData.length - 1]?.balance || 0) - (balanceData[0]?.balance || 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
