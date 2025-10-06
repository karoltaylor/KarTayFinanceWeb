import React, { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import WalletList from '../WalletList/WalletList';
import AddWalletForm from '../AddWalletForm/AddWalletForm';
import styles from './Sidebar.module.css';

export default function Sidebar({ 
  wallets, 
  selectedWalletId, 
  onSelectWallet, 
  onAddWallet, 
  onRemoveWallet 
}) {
  const [showAddWallet, setShowAddWallet] = useState(false);

  const handleAddWallet = (walletName) => {
    onAddWallet(walletName);
    setShowAddWallet(false);
  };

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <DollarSign className={styles.icon} size={28} />
          Finance Manager
        </h1>
        <p className={styles.subtitle}>Manage your wallets</p>
      </header>

      <button
        onClick={() => onSelectWallet(null)}
        className={`${styles.summaryButton} ${
          selectedWalletId === null ? styles.active : ''
        }`}
      >
        <TrendingUp size={20} />
        <span>All Wallets Summary</span>
      </button>

      <div className={styles.walletSection}>
        <h2 className={styles.sectionTitle}>Your Wallets</h2>
        
        <WalletList
          wallets={wallets}
          selectedWalletId={selectedWalletId}
          onSelectWallet={onSelectWallet}
          onRemoveWallet={onRemoveWallet}
        />

        <AddWalletForm
          showForm={showAddWallet}
          onToggleForm={setShowAddWallet}
          onAddWallet={handleAddWallet}
        />
      </div>
    </aside>
  );
}
