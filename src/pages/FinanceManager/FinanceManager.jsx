import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getWallets, 
  createWallet, 
  deleteWallet 
} from '../../services/api';
import Sidebar from './components/Sidebar/Sidebar';
import WalletDetailView from './components/WalletDetailView/WalletDetailView';
import SummaryView from './components/SummaryView/SummaryView';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { calculateAllWalletsStats } from './utils/financeUtils';
import styles from './FinanceManager.module.css';

export default function FinanceManager() {
  const { backendUser } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallets when component mounts or backendUser changes
  useEffect(() => {
    if (backendUser) {
      fetchWallets();
    }
  }, [backendUser]);

  const fetchWallets = async () => {
    if (!backendUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📥 Fetching wallets...');
      const response = await getWallets();
      console.log('✅ Wallets fetched:', response);
      
      // Backend returns { wallets: [...], count: 0 }
      const fetchedWallets = response.wallets || [];
      
      // Transform backend wallets to match frontend format
      const transformedWallets = fetchedWallets.map(wallet => ({
        id: wallet.id || wallet._id, // Handle both id and _id
        name: wallet.name,
        balance: wallet.balance || 0,
        transactions: wallet.transactions || [],
        created_at: wallet.created_at,
        updated_at: wallet.updated_at
      }));
      
      setWallets(transformedWallets);
      console.log('💼 Loaded', transformedWallets.length, 'wallet(s)');
    } catch (error) {
      console.error('❌ Error fetching wallets:', error);
      setError('Failed to load wallets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addWallet = async (walletName) => {
    if (!backendUser) {
      setError('User not authenticated');
      return;
    }

    const userId = localStorage.getItem('backend_user_id');
    console.log('➕ Creating wallet:', walletName, 'for user:', userId);
    
    try {
      const newWallet = await createWallet({
        name: walletName
      });
      console.log('✅ Wallet created:', newWallet);
      
      // Backend returns { status: 'success', message: '...', data: {...} }
      const walletData = newWallet.data || newWallet;
      console.log('📊 Wallet data structure:', walletData);
      
      const walletId = walletData.id || walletData._id || walletData.wallet_id;
      console.log('🔑 Extracted wallet ID:', walletId);
      
      // Add to local state
      const newWalletObj = {
        id: walletId,
        name: walletData.name,
        balance: walletData.balance || 0,
        transactions: [],
        created_at: walletData.created_at,
        updated_at: walletData.updated_at
      };
      
      setWallets([...wallets, newWalletObj]);
      console.log('✅ Wallet added to UI:', newWalletObj);
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      setError('Failed to create wallet. Please try again.');
    }
  };

  const removeWallet = async (id) => {
    try {
      console.log('🗑️ Deleting wallet:', id);
      await deleteWallet(id);
      console.log('✅ Wallet deleted');
      
      // Remove from local state
      setWallets(wallets.filter(wallet => wallet.id !== id));
      
      // Clear selection if deleted wallet was selected
      if (selectedWalletId === id) {
        setSelectedWalletId(null);
      }
    } catch (error) {
      console.error('❌ Error deleting wallet:', error);
      setError('Failed to delete wallet. Please try again.');
    }
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

  // Show loading spinner while initializing
  if (loading && !wallets.length) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
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
