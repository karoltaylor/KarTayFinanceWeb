import React, { useState, useEffect } from 'react';
import { Package, RefreshCw, Edit3, Check, X, DollarSign } from 'lucide-react';
import { getAllAssets, formatCurrency, getPrimaryCurrency } from '../../utils/financeUtils';
import styles from './AssetsView.module.css';

// Asset types that can potentially be synced from the internet
const SYNCABLE_TYPES = ['STOCK', 'ETF', 'CRYPTO', 'MUTUAL_FUND'];

export default function AssetsView({ wallets, onSyncAsset }) {
  const [assets, setAssets] = useState([]);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [syncingAssets, setSyncingAssets] = useState(new Set());
  const primaryCurrency = getPrimaryCurrency(wallets);

  useEffect(() => {
    // Calculate assets from wallets transactions
    const calculatedAssets = getAllAssets(wallets);
    
    // Load any saved current values from localStorage
    const savedValues = JSON.parse(localStorage.getItem('assetCurrentValues') || '{}');
    
    const assetsWithValues = calculatedAssets.map(asset => ({
      ...asset,
      currentValue: savedValues[asset.name]?.value || null,
      lastUpdated: savedValues[asset.name]?.lastUpdated || null,
      canSync: SYNCABLE_TYPES.includes(asset.type?.toUpperCase())
    }));
    
    setAssets(assetsWithValues);
  }, [wallets]);

  const handleEditStart = (asset) => {
    setEditingAsset(asset.name);
    setEditValue(asset.currentValue?.toString() || '');
  };

  const handleEditSave = (assetName) => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value >= 0) {
      // Save to localStorage
      const savedValues = JSON.parse(localStorage.getItem('assetCurrentValues') || '{}');
      savedValues[assetName] = {
        value: value,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('assetCurrentValues', JSON.stringify(savedValues));
      
      // Update state
      setAssets(prev => prev.map(a => 
        a.name === assetName 
          ? { ...a, currentValue: value, lastUpdated: new Date().toISOString() }
          : a
      ));
    }
    setEditingAsset(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingAsset(null);
    setEditValue('');
  };

  const handleSync = async (asset) => {
    setSyncingAssets(prev => new Set([...prev, asset.name]));
    
    try {
      // Call parent sync handler if provided
      if (onSyncAsset) {
        const result = await onSyncAsset(asset);
        if (result?.price) {
          // Save synced price
          const savedValues = JSON.parse(localStorage.getItem('assetCurrentValues') || '{}');
          savedValues[asset.name] = {
            value: result.price,
            lastUpdated: new Date().toISOString()
          };
          localStorage.setItem('assetCurrentValues', JSON.stringify(savedValues));
          
          setAssets(prev => prev.map(a => 
            a.name === asset.name 
              ? { ...a, currentValue: result.price, lastUpdated: new Date().toISOString() }
              : a
          ));
        }
      } else {
        // Placeholder: In a real implementation, this would call an API
        console.log(`🔄 Sync requested for ${asset.name} (${asset.type})`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to sync ${asset.name}:`, error);
    } finally {
      setSyncingAssets(prev => {
        const next = new Set(prev);
        next.delete(asset.name);
        return next;
      });
    }
  };

  const calculateTotalValue = () => {
    return assets.reduce((sum, asset) => {
      if (asset.currentValue && asset.totalVolume > 0) {
        return sum + (asset.currentValue * asset.totalVolume);
      }
      return sum;
    }, 0);
  };

  const hasAssets = assets.length > 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            <Package size={28} className={styles.titleIcon} />
            My Assets
          </h2>
          <p className={styles.subtitle}>Track and manage all your investment assets</p>
        </div>
        {hasAssets && (
          <div className={styles.totalValue}>
            <span className={styles.totalLabel}>Estimated Portfolio Value</span>
            <span className={styles.totalAmount}>{formatCurrency(calculateTotalValue(), primaryCurrency)}</span>
          </div>
        )}
      </header>

      {hasAssets ? (
        <div className={styles.assetsGrid}>
          {assets.map(asset => (
            <div key={asset.name} className={styles.assetCard}>
              <div className={styles.assetHeader}>
                <div className={styles.assetInfo}>
                  <h3 className={styles.assetName}>{asset.name}</h3>
                  <span className={styles.assetType}>{asset.type || 'Unknown'}</span>
                </div>
                <div className={styles.assetActions}>
                  {asset.canSync && (
                    <button
                      className={styles.syncButton}
                      onClick={() => handleSync(asset)}
                      disabled={syncingAssets.has(asset.name)}
                      title="Sync price from internet"
                    >
                      <RefreshCw 
                        size={16} 
                        className={syncingAssets.has(asset.name) ? styles.spinning : ''} 
                      />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.assetStats}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Holdings</span>
                  <span className={styles.statValue}>{asset.totalVolume?.toFixed(4) || '0'}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Total Invested</span>
                  <span className={styles.statValue}>{formatCurrency(asset.totalDeposits, asset.currency)}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Total Sold</span>
                  <span className={styles.statValue}>{formatCurrency(asset.totalIncome, asset.currency)}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Transactions</span>
                  <span className={styles.statValue}>{asset.transactionCount}</span>
                </div>
              </div>

              <div className={styles.currentValueSection}>
                <div className={styles.currentValueHeader}>
                  <DollarSign size={16} />
                  <span>Current Unit Price ({asset.currency || 'USD'})</span>
                </div>
                
                {editingAsset === asset.name ? (
                  <div className={styles.editRow}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={styles.editInput}
                      placeholder="Enter price"
                      autoFocus
                    />
                    <button 
                      className={styles.saveButton}
                      onClick={() => handleEditSave(asset.name)}
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      className={styles.cancelButton}
                      onClick={handleEditCancel}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.valueRow}>
                    <span className={styles.currentValue}>
                      {asset.currentValue 
                        ? formatCurrency(asset.currentValue, asset.currency)
                        : '—'}
                    </span>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEditStart(asset)}
                      title="Edit value"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                )}
                
                {asset.lastUpdated && (
                  <span className={styles.lastUpdated}>
                    Updated: {new Date(asset.lastUpdated).toLocaleDateString()}
                  </span>
                )}
              </div>

              {asset.currentValue && asset.totalVolume > 0 && (
                <div className={styles.estimatedValue}>
                  <span className={styles.estimatedLabel}>Est. Value</span>
                  <span className={styles.estimatedAmount}>
                    {formatCurrency(asset.currentValue * asset.totalVolume, asset.currency)}
                  </span>
                </div>
              )}

              <div className={styles.walletsTag}>
                <span className={styles.walletsLabel}>In:</span>
                {asset.wallets.map(w => (
                  <span key={w} className={styles.walletBadge}>{w}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Package className={styles.emptyIcon} size={64} />
          <h3 className={styles.emptyTitle}>No Assets Found</h3>
          <p className={styles.emptyText}>
            Upload transactions to your wallets to see your assets here.
          </p>
        </div>
      )}
    </div>
  );
}

