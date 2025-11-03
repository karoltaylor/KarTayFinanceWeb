import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getWallets,
  createWallet,
  deleteWallet,
  uploadTransactions,
  getTransactionsByWallet,
  getWalletTransactionErrors,
  detectTransactionCurrency,
  getWalletStats,
} from '../../services/api';
import logger from '../../services/logger';
import { calculateAllWalletsStats } from './utils/financeUtils';
import Sidebar from './components/Sidebar/Sidebar';
import WalletDetailView from './components/WalletDetailView/WalletDetailView';
import SummaryView from './components/SummaryView/SummaryView';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './FinanceManager.module.css';

export default function FinanceManager() {
  const { backendUser } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorTransactions, setErrorTransactions] = useState({});
  
  // Pagination state for transactions
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 1000,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

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
      logger.wallet('Fetching wallets');
      const response = await getWallets();
      console.log('✅ Wallets fetched:', response);
      console.log('🔍 Raw wallets array:', response.wallets);
      console.log('🔍 Wallets count from response:', response.count);
      console.log('🔍 Wallets array length:', response.wallets?.length || 0);
      
      // Backend returns { wallets: [...], count: 0 }
      const fetchedWallets = response.wallets || [];
      
      // Transform backend wallets to match frontend format (without transactions initially)
      const transformedWallets = fetchedWallets.map(wallet => {
        const walletId = wallet.id || wallet._id;
        
        return {
          id: walletId,
          name: wallet.name,
          balance: wallet.balance || 0,
          transactions: [], // Will be populated when wallet is selected
          created_at: wallet.created_at,
          updated_at: wallet.updated_at,
          totalTransactionCount: 0 // Will be populated by fetchWalletStats
        };
      });
      
      setWallets(transformedWallets);
      console.log('💼 Loaded', transformedWallets.length, 'wallet(s)');
      
      // Fetch lightweight stats for each wallet (balance and count only)
      await fetchWalletStatsForAll(transformedWallets);
      
      logger.wallet('Wallets loaded successfully', null, { 
        count: transformedWallets.length
      });
    } catch (error) {
      console.error('❌ Error fetching wallets:', error);
      logger.error('wallet', 'Failed to fetch wallets', {}, error);
      setError('Failed to load wallets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletStatsForAll = async (walletsToUpdate) => {
    console.log('📊 Fetching stats for all wallets...');
    
    // Fetch stats for each wallet in parallel
    const walletPromises = walletsToUpdate.map(async (wallet) => {
      try {
        console.log(`📊 Fetching stats for wallet: ${wallet.name} (${wallet.id})`);
        const statsResponse = await getWalletStats(wallet.id);
        
        console.log(`📊 Stats for wallet ${wallet.name}:`, statsResponse);
        
        // Update wallet with stats from API response
        return {
          ...wallet,
          balance: statsResponse?.balance || statsResponse?.total_balance || wallet.balance || 0,
          totalTransactionCount: statsResponse?.total_count || statsResponse?.transaction_count || 0,
          deposits: statsResponse?.deposits || statsResponse?.total_deposits || null
        };
      } catch (error) {
        console.error(`❌ Error fetching stats for wallet ${wallet.name}:`, error);
        logger.error('wallet', `Failed to fetch stats for wallet ${wallet.name}`, { wallet_name: wallet.name, wallet_id: wallet.id }, error);
        
        // Return wallet without stats on error
        return wallet;
      }
    });
    
    try {
      const updatedWallets = await Promise.all(walletPromises);
      setWallets(updatedWallets);
      
      const totalTransactions = updatedWallets.reduce((sum, wallet) => sum + (wallet.totalTransactionCount || 0), 0);
      const totalBalance = updatedWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
      
      console.log('📊 Wallet stats summary:', {
        wallet_count: updatedWallets.length,
        total_transactions: totalTransactions,
        total_balance: totalBalance
      });
      
      logger.wallet('Wallet stats loaded successfully', null, {
        wallet_count: updatedWallets.length,
        total_transactions: totalTransactions,
        total_balance: totalBalance
      });
    } catch (error) {
      console.error('❌ Error fetching stats for wallets:', error);
      logger.error('wallet', 'Failed to fetch stats for some wallets', {}, error);
    }
  };

  const refreshWalletTransactions = async (walletId) => {
    try {
      // Find the wallet to get its name
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) {
        console.error(`❌ Wallet not found for ID: ${walletId}`);
        return;
      }
      
      console.log(`🔄 Refreshing transactions for wallet: ${wallet.name} (${walletId})`);
      const transactionsResponse = await getTransactionsByWallet(walletId, pagination.currentPage, pagination.limit);
      
      // Debug: Log the response structure
      console.log(`🔍 Refresh response for wallet ${walletId}:`, {
        response: transactionsResponse,
        hasTransactions: !!transactionsResponse?.transactions,
        transactionCount: transactionsResponse?.transactions?.length || 0,
        sampleTransaction: transactionsResponse?.transactions?.[0]
      });
      
      // Extract transactions array from response
      const transactions = transactionsResponse?.transactions || 
                         transactionsResponse?.data?.transactions || 
                         (Array.isArray(transactionsResponse) ? transactionsResponse : []);
      
      // Debug: Check if transactions belong to this wallet
      const walletIdMismatches = transactions.filter(t => t.wallet_id !== walletId);
      if (walletIdMismatches.length > 0) {
        console.warn(`⚠️ Found ${walletIdMismatches.length} transactions with wrong wallet_id for wallet ${walletId}:`, walletIdMismatches);
      }
      
      // Normalize transaction IDs
      const normalizedTransactions = transactions.map(transaction => ({
        ...transaction,
        id: transaction.id || transaction._id
      }));
      
      // Calculate balance from transactions
      const balance = normalizedTransactions.reduce((sum, t) => sum + (t.transaction_amount || 0), 0);
      
      // Debug: Log pagination data from API
      console.log('🔍 Pagination data from API:', {
        page: transactionsResponse.page,
        limit: transactionsResponse.limit,
        total_count: transactionsResponse.total_count,
        total_pages: transactionsResponse.total_pages,
        has_next: transactionsResponse.has_next,
        has_prev: transactionsResponse.has_prev,
        fullResponse: transactionsResponse
      });
      
      // Backend now provides complete pagination data - use it directly
      console.log('🔍 Backend provides complete pagination data:', {
        total_count: transactionsResponse.total_count,
        total_pages: transactionsResponse.total_pages,
        page: transactionsResponse.page,
        has_next: transactionsResponse.has_next,
        has_prev: transactionsResponse.has_prev
      });
      
      // Update pagination state with backend data
      setPagination({
        currentPage: transactionsResponse.page || 1,
        limit: transactionsResponse.limit || 1000,
        totalCount: transactionsResponse.total_count || 0,
        totalPages: transactionsResponse.total_pages || 1,
        hasNext: transactionsResponse.has_next || false,
        hasPrev: transactionsResponse.has_prev || false
      });
      
      // Update the specific wallet with total transaction count
      setWallets(prevWallets => 
        prevWallets.map(w => 
          w.id === walletId 
            ? { 
                ...w, 
                transactions: normalizedTransactions, 
                balance,
                totalTransactionCount: transactionsResponse.total_count || normalizedTransactions.length
              }
            : w
        )
      );
      
      console.log(`✅ Refreshed wallet ${wallet.name} (${walletId}): ${normalizedTransactions.length} transactions (${transactionsResponse.total_count || 0} total)`);
      
      // Also fetch error transactions for this wallet
      try {
        console.log(`🔍 Fetching error transactions for wallet: ${walletId}`);
        const errorResponse = await getWalletTransactionErrors(walletId);
        const errorTransactions = errorResponse?.errors || [];
        
        console.log(`🔍 Found ${errorTransactions.length} error transactions for wallet ${walletId}`);
        
        // Update error transactions state
        setErrorTransactions(prev => ({
          ...prev,
          [walletId]: errorTransactions
        }));
        
        if (errorTransactions.length > 0) {
          console.log(`⚠️ Wallet ${wallet.name} has ${errorTransactions.length} error transactions`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not fetch error transactions for wallet ${walletId}:`, error);
        // Don't throw here - we still want to show the successful transactions
      }
      
    } catch (error) {
      console.error(`❌ Error refreshing transactions for wallet ${walletId}:`, error);
      logger.error('transaction', `Failed to refresh transactions for wallet ${walletId}`, { wallet_id: walletId }, error);
    }
  };

  const addWallet = async (walletName) => {
    if (!backendUser) {
      setError('User not authenticated');
      return;
    }

    const userId = localStorage.getItem('backend_user_id');
    console.log('➕ Creating wallet:', walletName, 'for user:', userId);
    logger.wallet('Creating new wallet', null, { wallet_name: walletName });
    
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
      logger.wallet('Wallet created successfully', walletId, { wallet_name: walletName });
      
      // Debug: Fetch wallets again to verify persistence
      console.log('🔄 Verifying wallet persistence by fetching wallets again...');
      try {
        const verifyResponse = await getWallets();
        console.log('🔍 Verification fetch result:', verifyResponse);
        console.log('🔍 Verification wallets count:', verifyResponse.wallets?.length || 0);
      } catch (verifyError) {
        console.error('❌ Verification fetch failed:', verifyError);
      }
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      logger.error('wallet', 'Failed to create wallet', { wallet_name: walletName }, error);
      setError('Failed to create wallet. Please try again.');
    }
  };

  const removeWallet = async (id) => {
    try {
      console.log('🗑️ Deleting wallet:', id);
      logger.wallet('Deleting wallet', id);
      await deleteWallet(id);
      console.log('✅ Wallet deleted');
      logger.wallet('Wallet deleted successfully', id);
      
      // Remove from local state
      setWallets(wallets.filter(wallet => wallet.id !== id));
      
      // Clear selection if deleted wallet was selected
      if (selectedWalletId === id) {
        setSelectedWalletId(null);
      }
    } catch (error) {
      console.error('❌ Error deleting wallet:', error);
      logger.error('wallet', 'Failed to delete wallet', { wallet_id: id }, error);
      setError('Failed to delete wallet. Please try again.');
    }
  };

  const handleFileUpload = async (walletId, file) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Front-end validation: allow only CSV/XLS/XLSX, block JSON
      const fileNameLower = (file.name || '').toLowerCase();
      const isAllowed = fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.xlsx');
      if (!isAllowed) {
        setError('Unsupported file type. Please upload a CSV, XLS, or XLSX file.');
        setLoading(false);
        return;
      }

      // Find the wallet to get its name
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      console.log('📤 Starting transaction upload for wallet:', walletId, wallet.name);
      logger.transaction('Starting transaction upload', {
        wallet_id: walletId,
        wallet_name: wallet.name,
        file_name: file.name,
        file_size: file.size
      });

      // Preflight: detect currency
      let currencyToUse = null;
      try {
        const detection = await detectTransactionCurrency(file, walletId);
        console.log('🔎 Currency detection result:', detection);
        if (detection?.needs_currency) {
          const suggested = detection?.detected_currency || '';
          const promptMsg = `Enter currency (3-letter, e.g. USD, EUR, PLN).${suggested ? ` Suggested: ${suggested}` : ''}`;
          const input = window.prompt(promptMsg, suggested || '');
          const value = (input || '').trim().toUpperCase();
          if (!/^[A-Z]{3}$/.test(value)) {
            setError('Invalid currency code. Please use a 3-letter code like USD, EUR, PLN.');
            setLoading(false);
            return;
          }
          currencyToUse = value;
        } else if (detection?.detected_currency) {
          currencyToUse = detection.detected_currency.toUpperCase();
        }
      } catch (detectErr) {
        console.warn('⚠️ Currency detection failed, proceeding without explicit currency:', detectErr);
      }
      
      // Upload transactions to backend with wallet ID and name
      const uploadResult = await uploadTransactions(file, walletId, wallet.name, currencyToUse);
      console.log('✅ Upload complete:', uploadResult);
      logger.transaction('Transaction upload completed', {
        wallet_id: walletId,
        result: uploadResult
      });
      
      // Store error transactions if any
      if (uploadResult.data?.failed_transactions && uploadResult.data.failed_transactions.length > 0) {
        setErrorTransactions(prev => ({
          ...prev,
          [walletId]: uploadResult.data.failed_transactions
        }));
        logger.warn('transaction', 'Some transactions failed to upload', {
          wallet_id: walletId,
          failed_count: uploadResult.data.failed_transactions.length
        });
      } else {
        // Clear error transactions if upload was fully successful
        setErrorTransactions(prev => {
          const newErrors = { ...prev };
          delete newErrors[walletId];
          return newErrors;
        });
      }
      
      // Fetch transactions only for the specific wallet that was updated
      console.log('📥 Fetching transactions for updated wallet:', wallet.name, walletId);
      const transactionsResponse = await getTransactionsByWallet(walletId, 1, 100);
      
      // Debug: Log the response structure
      console.log(`🔍 Upload response for wallet ${walletId}:`, {
        response: transactionsResponse,
        hasTransactions: !!transactionsResponse?.transactions,
        transactionCount: transactionsResponse?.transactions?.length || 0,
        sampleTransaction: transactionsResponse?.transactions?.[0]
      });
      
      // Extract transactions array from response
      const walletTransactions = transactionsResponse?.transactions || 
                               transactionsResponse?.data?.transactions || 
                               (Array.isArray(transactionsResponse) ? transactionsResponse : []);
      
      // Debug: Check if transactions belong to this wallet
      const walletIdMismatches = walletTransactions.filter(t => t.wallet_id !== walletId);
      if (walletIdMismatches.length > 0) {
        console.warn(`⚠️ Found ${walletIdMismatches.length} transactions with wrong wallet_id for wallet ${wallet.name}:`, walletIdMismatches);
      }
      
      // Normalize transaction IDs
      const normalizedTransactions = walletTransactions.map(transaction => ({
        ...transaction,
        id: transaction.id || transaction._id
      }));
      
      // Calculate balance from transactions
      const balance = normalizedTransactions.reduce((sum, t) => sum + (t.transaction_amount || 0), 0);
      
      console.log(`📊 Wallet ${wallet.name}: ${normalizedTransactions.length} transactions, balance: ${balance}`);
      
      // Update pagination state
      setPagination({
        currentPage: transactionsResponse.page || 1,
        limit: transactionsResponse.limit || 1000,
        totalCount: transactionsResponse.total_count || 0,
        totalPages: transactionsResponse.total_pages || 1,
        hasNext: transactionsResponse.has_next || false,
        hasPrev: transactionsResponse.has_prev || false
      });
      
      // Update only the specific wallet with its transactions (preserve total count)
      setWallets(prevWallets => 
        prevWallets.map(w => 
          w.id === walletId 
            ? { 
                ...w, 
                transactions: normalizedTransactions, 
                balance,
                totalTransactionCount: transactionsResponse.total_count || w.totalTransactionCount || normalizedTransactions.length
              }
            : w
        )
      );
      
      console.log('✅ Wallet state updated with transactions');
      logger.transaction('Wallet state updated with transactions', {
        wallet_id: walletId,
        transaction_count: normalizedTransactions.length
      });
    } catch (error) {
      console.error('❌ Error uploading transactions:', error);
      logger.error('transaction', 'Failed to upload transactions', {
        wallet_id: walletId,
        file_name: file.name
      }, error);
      setError(`Failed to upload transactions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const handlePageChange = async (newPage) => {
    if (!selectedWalletId) return;
    
    console.log(`🔄 handlePageChange called with newPage: ${newPage}, currentPage: ${pagination.currentPage}`);
    setLoading(true);
    try {
      const transactionsResponse = await getTransactionsByWallet(selectedWalletId, newPage, pagination.limit);
      
      // Extract transactions array from response
      const transactions = transactionsResponse?.transactions || 
                         transactionsResponse?.data?.transactions || 
                         (Array.isArray(transactionsResponse) ? transactionsResponse : []);
      
      // Normalize transaction IDs
      const normalizedTransactions = transactions.map(transaction => ({
        ...transaction,
        id: transaction.id || transaction._id
      }));
      
      // Calculate balance from transactions
      const balance = normalizedTransactions.reduce((sum, t) => sum + (t.transaction_amount || 0), 0);
      
      // Debug: Log pagination data from API (page change)
      console.log('🔍 Pagination data from API (page change):', {
        page: transactionsResponse.page,
        limit: transactionsResponse.limit,
        total_count: transactionsResponse.total_count,
        total_pages: transactionsResponse.total_pages,
        has_next: transactionsResponse.has_next,
        has_prev: transactionsResponse.has_prev,
        fullResponse: transactionsResponse
      });
      
      // Backend provides complete pagination data - use it directly
      console.log('🔍 Backend provides complete pagination data (page change):', {
        total_count: transactionsResponse.total_count,
        total_pages: transactionsResponse.total_pages,
        page: transactionsResponse.page,
        has_next: transactionsResponse.has_next,
        has_prev: transactionsResponse.has_prev
      });
      
      // Update pagination state with backend data
      const newPaginationState = {
        currentPage: transactionsResponse.page || newPage,
        limit: transactionsResponse.limit || 1000,
        totalCount: transactionsResponse.total_count || 0,
        totalPages: transactionsResponse.total_pages || 1,
        hasNext: transactionsResponse.has_next || false,
        hasPrev: transactionsResponse.has_prev || false
      };
      
      console.log(`📄 Setting pagination state:`, newPaginationState);
      setPagination(newPaginationState);
      
      // Update the selected wallet with new transactions (preserve total count)
      setWallets(prevWallets => 
        prevWallets.map(w => 
          w.id === selectedWalletId 
            ? { 
                ...w, 
                transactions: normalizedTransactions, 
                balance,
                totalTransactionCount: transactionsResponse.total_count || w.totalTransactionCount || normalizedTransactions.length
              }
            : w
        )
      );
      
      console.log(`📄 Page ${newPage} loaded: ${normalizedTransactions.length} transactions`);
    } catch (error) {
      console.error(`❌ Error loading page ${newPage}:`, error);
      setError(`Failed to load page ${newPage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWallet = (walletId) => {
    setSelectedWalletId(walletId);
    
    // Reset pagination when selecting a new wallet
    setPagination({
      currentPage: 1,
      limit: 1000,
      totalCount: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    });
    
    // Fetch transactions for the selected wallet if not already loaded
    if (walletId) {
      const wallet = wallets.find(w => w.id === walletId);
      // Only fetch if wallet exists and has no transactions loaded
      if (wallet && (!wallet.transactions || wallet.transactions.length === 0)) {
        // Fetch transactions directly (async but don't await - let it load in background)
        loadWalletTransactions(walletId);
      }
    }
  };

  const loadWalletTransactions = async (walletId) => {
    try {
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) {
        console.error(`❌ Wallet not found for ID: ${walletId}`);
        return;
      }
      
      console.log(`📥 Loading transactions for wallet: ${wallet.name} (${walletId})`);
      const transactionsResponse = await getTransactionsByWallet(walletId, 1, 1000);
      
      // Extract transactions array from response
      const transactions = transactionsResponse?.transactions || 
                         transactionsResponse?.data?.transactions || 
                         (Array.isArray(transactionsResponse) ? transactionsResponse : []);
      
      // Normalize transaction IDs
      const normalizedTransactions = transactions.map(transaction => ({
        ...transaction,
        id: transaction.id || transaction._id
      }));
      
      // Calculate balance from transactions
      const balance = normalizedTransactions.reduce((sum, t) => sum + (t.transaction_amount || 0), 0);
      
      // Update pagination state
      setPagination({
        currentPage: transactionsResponse.page || 1,
        limit: transactionsResponse.limit || 1000,
        totalCount: transactionsResponse.total_count || 0,
        totalPages: transactionsResponse.total_pages || 1,
        hasNext: transactionsResponse.has_next || false,
        hasPrev: transactionsResponse.has_prev || false
      });
      
      // Update the wallet with transactions
      setWallets(prevWallets => 
        prevWallets.map(w => 
          w.id === walletId 
            ? { 
                ...w, 
                transactions: normalizedTransactions, 
                balance,
                totalTransactionCount: transactionsResponse.total_count || normalizedTransactions.length
              }
            : w
        )
      );
      
      console.log(`✅ Loaded transactions for wallet ${wallet.name}: ${normalizedTransactions.length} transactions`);
    } catch (error) {
      console.error(`❌ Error loading transactions for wallet ${walletId}:`, error);
      logger.error('transaction', 'Failed to load transactions for wallet', { wallet_id: walletId }, error);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = async (newLimit) => {
    if (!selectedWalletId) return;
    
    console.log(`🔄 handleRowsPerPageChange called with newLimit: ${newLimit}`);
    setLoading(true);
    try {
      // Reset to page 1 with new limit
      const transactionsResponse = await getTransactionsByWallet(selectedWalletId, 1, newLimit);
      
      console.log(`🔍 Rows per page change API response:`, {
        requestedLimit: newLimit,
        response: transactionsResponse,
        transactionsCount: transactionsResponse?.transactions?.length,
        totalCount: transactionsResponse?.total_count,
        totalPages: transactionsResponse?.total_pages,
        hasNext: transactionsResponse?.has_next,
        hasPrev: transactionsResponse?.has_prev
      });
      
      // Extract transactions array from response
      const transactions = transactionsResponse?.transactions || 
                         transactionsResponse?.data?.transactions || 
                         (Array.isArray(transactionsResponse) ? transactionsResponse : []);
      
      // Normalize transaction IDs
      const normalizedTransactions = transactions.map(transaction => ({
        ...transaction,
        id: transaction.id || transaction._id
      }));
      
      // Calculate balance from transactions
      const balance = normalizedTransactions.reduce((sum, t) => sum + (t.transaction_amount || 0), 0);
      
      // Update pagination state with new limit and reset to page 1
      const newPaginationState = {
        currentPage: 1,
        limit: newLimit,
        totalCount: transactionsResponse.total_count || 0,
        totalPages: transactionsResponse.total_pages || 1,
        hasNext: transactionsResponse.has_next || false,
        hasPrev: transactionsResponse.has_prev || false
      };
      
      console.log(`📄 Setting new pagination state:`, newPaginationState);
      setPagination(newPaginationState);
      
      // Update the selected wallet with new transactions
      setWallets(prevWallets => 
        prevWallets.map(w => 
          w.id === selectedWalletId 
            ? { 
                ...w, 
                transactions: normalizedTransactions, 
                balance,
                totalTransactionCount: transactionsResponse.total_count || w.totalTransactionCount || normalizedTransactions.length
              }
            : w
        )
      );
      
      console.log(`📄 Rows per page changed to ${newLimit}: ${normalizedTransactions.length} transactions loaded`);
    } catch (error) {
      console.error(`❌ Error changing rows per page:`, error);
      setError(`Failed to change rows per page. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting changes from DataGrid
  const handleSortChange = async (sort) => {
    if (!selectedWalletId) return;
    
    setLoading(true);
    try {
      // TODO: Implement server-side sorting
      console.log('Sort changed:', sort);
      // For now, just refresh the current page
      await refreshWalletTransactions(selectedWalletId);
    } catch (error) {
      console.error('Error handling sort change:', error);
      setError('Failed to sort transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes from DataGrid
  const handleFilterChange = async (filters) => {
    if (!selectedWalletId) return;
    
    setLoading(true);
    try {
      // TODO: Implement server-side filtering
      console.log('Filters changed:', filters);
      // For now, just refresh the current page
      await refreshWalletTransactions(selectedWalletId);
    } catch (error) {
      console.error('Error handling filter change:', error);
      setError('Failed to filter transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  
  // Debug logging for selected wallet
  if (selectedWalletId) {
    console.log('🎯 Selected Wallet ID:', selectedWalletId);
    console.log('🎯 Found Wallet:', selectedWallet);
    console.log('🎯 All Wallet IDs:', wallets.map(w => ({ id: w.id, name: w.name, txCount: w.transactions?.length || 0 })));
  }
  
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
        onSelectWallet={handleSelectWallet}
        onAddWallet={addWallet}
        onRemoveWallet={removeWallet}
      />
      
      <main className={styles.mainContent}>
        {selectedWallet ? (
          <WalletDetailView
            wallet={selectedWallet}
            onFileUpload={handleFileUpload}
            errorTransactions={errorTransactions[selectedWalletId] || []}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            loading={loading}
          />
        ) : (
          <SummaryView
            wallets={wallets}
            stats={allStats}
            onSelectWallet={handleSelectWallet}
          />
        )}
      </main>
    </div>
  );
}
