import React from 'react';
import { Package, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/financeUtils';
import styles from './AssetList.module.css';

export default function AssetList({ assets }) {
  if (!assets || assets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Package className={styles.icon} size={24} />
          <h3 className={styles.title}>Asset Portfolio</h3>
        </div>
        <div className={styles.emptyState}>
          <p>No assets found</p>
        </div>
      </div>
    );
  }

  // Sort assets by total value (deposits + income)
  const sortedAssets = [...assets].sort((a, b) => 
    (b.totalDeposits + b.totalIncome) - (a.totalDeposits + a.totalIncome)
  );

  const getAssetTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'stock':
        return '#3b82f6';
      case 'cryptocurrency':
      case 'crypto':
        return '#f59e0b';
      case 'commodity':
        return '#10b981';
      case 'bond':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Package className={styles.icon} size={24} />
        <h3 className={styles.title}>Asset Portfolio</h3>
        <span className={styles.count}>{assets.length} assets</span>
      </div>
      
      <div className={styles.assetList}>
        {sortedAssets.map((asset) => {
          const totalValue = asset.totalDeposits + asset.totalIncome;
          const netReturn = asset.totalIncome - asset.totalDeposits;
          const returnPercentage = asset.totalDeposits > 0 
            ? ((netReturn / asset.totalDeposits) * 100) 
            : 0;
          
          return (
            <div key={asset.name} className={styles.assetCard}>
              <div className={styles.assetHeader}>
                <div className={styles.assetInfo}>
                  <h4 className={styles.assetName}>{asset.name}</h4>
                  <div className={styles.assetMeta}>
                    <span 
                      className={styles.assetType}
                      style={{ backgroundColor: getAssetTypeColor(asset.type) }}
                    >
                      {asset.type}
                    </span>
                    <span className={styles.transactionCount}>
                      {asset.transactionCount} transactions
                    </span>
                  </div>
                </div>
                <div className={styles.totalValue}>
                  {formatCurrency(totalValue)}
                </div>
              </div>
              
              <div className={styles.assetStats}>
                <div className={styles.statRow}>
                  <div className={styles.statItem}>
                    <TrendingDown className={styles.statIcon} size={16} />
                    <span className={styles.statLabel}>Deposits:</span>
                    <span className={styles.statValue}>
                      {formatCurrency(asset.totalDeposits)}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <TrendingUp className={styles.statIcon} size={16} />
                    <span className={styles.statLabel}>Income:</span>
                    <span className={`${styles.statValue} ${styles.income}`}>
                      {formatCurrency(asset.totalIncome)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.statRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Net Return:</span>
                    <span className={`${styles.statValue} ${netReturn >= 0 ? styles.positive : styles.negative}`}>
                      {formatCurrency(netReturn)}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Return %:</span>
                    <span className={`${styles.statValue} ${returnPercentage >= 0 ? styles.positive : styles.negative}`}>
                      {returnPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {asset.wallets.length > 0 && (
                  <div className={styles.wallets}>
                    <span className={styles.walletsLabel}>Wallets:</span>
                    <div className={styles.walletTags}>
                      {asset.wallets.map(wallet => (
                        <span key={wallet} className={styles.walletTag}>
                          {wallet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
