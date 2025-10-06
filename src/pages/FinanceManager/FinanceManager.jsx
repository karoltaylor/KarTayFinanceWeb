import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import WalletDetailView from './components/WalletDetailView/WalletDetailView';
import SummaryView from './components/SummaryView/SummaryView';
import { calculateAllWalletsStats } from './utils/financeUtils';
import styles from './FinanceManager.module.css';

export default function FinanceManager() {
  const [wallets, setWallets] = useState([
    { id: 1, name: 'Personal', balance: 0, transactions: [] }
  ]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);

  const addWallet = (walletName) => {
    const newWallet = {
      id: Date.now(),
      name: walletName,
      balance: 0,
      transactions: []
    };
    setWallets([...wallets, newWallet]);
  };

  const removeWallet = (id) => {
    setWallets(wallets.filter(wallet => wallet.id !== id));
  };

  const handleFileUpload = async (walletId, file) => {
    if (!file) return;

    try {
      const text = await file.text();
      let transactions = [];

      try {
        transactions = JSON.parse(text);
      } catch {
        const lines = text.split('\n').filter(line => line.trim());
        transactions = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return {
            id: Date.now() + Math.random(),
            date: values[0] || new Date().toISOString().split('T')[0],
            description: values[1] || 'Transaction',
            amount: parseFloat(values[2]) || 0,
            category: values[3] || 'General'
          };
        });
      }

      setWallets(wallets.map(wallet => {
        if (wallet.id === walletId) {
          const newTransactions = [...wallet.transactions, ...transactions];
          const balance = newTransactions.reduce((sum, t) => sum + t.amount, 0);
          return { ...wallet, transactions: newTransactions, balance };
        }
        return wallet;
      }));
    } catch (error) {
      alert('Error loading transactions. Please check file format.');
    }
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const allStats = calculateAllWalletsStats(wallets);

  return (
    <div className={styles.container}>
      <Sidebar
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWallet={setSelectedWalletId}
        onAddWallet={addWallet}
        onRemoveWallet={removeWallet}
      />
      
      <main className={styles.mainContent}>
        {selectedWallet ? (
          <WalletDetailView
            wallet={selectedWallet}
            onFileUpload={handleFileUpload}
          />
        ) : (
          <SummaryView
            wallets={wallets}
            stats={allStats}
            onSelectWallet={setSelectedWalletId}
          />
        )}
      </main>
    </div>
  );
}
