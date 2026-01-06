/**
 * Calculate statistics for a list of transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Statistics object with income and expenses
 */
export const calculateStats = (transactions) => {
  const income = transactions
    .filter(t => t.transaction_amount > 0)
    .reduce((sum, t) => sum + t.transaction_amount, 0);
  
  const expenses = transactions
    .filter(t => t.transaction_amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.transaction_amount), 0);
  
  return { income, expenses };
};

/**
 * Calculate deposits (BUY transactions) vs income (SELL transactions)
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Statistics object with deposits and income
 */
export const calculateDepositsAndIncome = (transactions) => {
  const deposits = transactions
    .filter(t => t.transaction_type?.toUpperCase() === 'BUY')
    .reduce((sum, t) => sum + Math.abs(t.transaction_amount), 0);
  
  const income = transactions
    .filter(t => t.transaction_type?.toUpperCase() === 'SELL')
    .reduce((sum, t) => sum + t.transaction_amount, 0);
  
  return { deposits, income };
};

/**
 * Calculate overall statistics across all wallets
 * @param {Array} wallets - Array of wallet objects
 * @returns {Object} Overall statistics
 */
export const calculateAllWalletsStats = (wallets) => {
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalTransactions = wallets.reduce((sum, w) => sum + (w.totalTransactionCount || w.transactions.length), 0);
  
  const allTransactions = wallets.flatMap(w => w.transactions);
  const { deposits, income } = calculateDepositsAndIncome(allTransactions);
  
  return { 
    totalBalance, 
    totalTransactions, 
    deposits,
    income 
  };
};

/**
 * Get all unique assets from transactions across all wallets
 * @param {Array} wallets - Array of wallet objects
 * @returns {Array} Array of unique asset objects with statistics
 */
export const getAllAssets = (wallets) => {
  const allTransactions = wallets.flatMap(w => w.transactions);
  const assetMap = new Map();
  
  allTransactions.forEach(transaction => {
    const assetName = transaction.asset_name;
    const assetType = transaction.asset_type;
    
    if (!assetMap.has(assetName)) {
      assetMap.set(assetName, {
        name: assetName,
        type: assetType,
        totalDeposits: 0,
        totalIncome: 0,
        totalVolume: 0,
        transactionCount: 0,
        wallets: new Set(),
        currency: transaction.currency || 'USD', // Track currency from first transaction
        currencies: new Set() // Track all currencies for this asset
      });
    }
    
    const asset = assetMap.get(assetName);
    asset.transactionCount++;
    
    // Track all currencies used for this asset
    if (transaction.currency) {
      asset.currencies.add(transaction.currency);
    }
    
    // Add wallet to the set
    const wallet = wallets.find(w => w.transactions.includes(transaction));
    if (wallet) {
      asset.wallets.add(wallet.name);
    }
    
    if (transaction.transaction_type?.toUpperCase() === 'BUY') {
      asset.totalDeposits += Math.abs(transaction.transaction_amount);
      asset.totalVolume += transaction.volume || 0;
    } else if (transaction.transaction_type?.toUpperCase() === 'SELL') {
      asset.totalIncome += transaction.transaction_amount;
      asset.totalVolume -= transaction.volume || 0;
    }
  });
  
  return Array.from(assetMap.values()).map(asset => ({
    ...asset,
    wallets: Array.from(asset.wallets),
    currencies: Array.from(asset.currencies),
    hasMixedCurrencies: asset.currencies.size > 1
  }));
};

/**
 * Get the primary currency for a wallet based on transaction frequency
 * @param {Object} wallet - Wallet object with transactions
 * @returns {string} Primary currency code (e.g., 'PLN', 'USD')
 */
export const getWalletCurrency = (wallet) => {
  if (!wallet?.transactions?.length) return 'USD';
  
  // Count currency occurrences
  const currencyCount = {};
  wallet.transactions.forEach(t => {
    const curr = t.currency || 'USD';
    currencyCount[curr] = (currencyCount[curr] || 0) + 1;
  });
  
  // Return most common currency
  return Object.entries(currencyCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
};

/**
 * Get primary currency across all wallets
 * @param {Array} wallets - Array of wallet objects
 * @returns {string} Primary currency code
 */
export const getPrimaryCurrency = (wallets) => {
  if (!wallets?.length) return 'USD';
  
  const allTransactions = wallets.flatMap(w => w.transactions || []);
  if (!allTransactions.length) return 'USD';
  
  // Count currency occurrences
  const currencyCount = {};
  allTransactions.forEach(t => {
    const curr = t.currency || 'USD';
    currencyCount[curr] = (currencyCount[curr] || 0) + 1;
  });
  
  // Return most common currency
  return Object.entries(currencyCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
};

/**
 * Calculate balance growth over time
 * @param {Array} wallets - Array of wallet objects
 * @returns {Array} Array of balance data points over time
 */
export const calculateBalanceGrowth = (wallets) => {
  const allTransactions = wallets.flatMap(w => w.transactions);
  
  // Sort transactions by date
  const sortedTransactions = allTransactions.sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  const balanceData = [];
  let runningBalance = 0;
  
  // Group by month/year for better visualization
  const monthlyData = new Map();
  
  sortedTransactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        date: monthKey,
        balance: runningBalance,
        deposits: 0,
        income: 0
      });
    }
    
    const monthData = monthlyData.get(monthKey);
    
    if (transaction.transaction_type?.toUpperCase() === 'BUY') {
      runningBalance += Math.abs(transaction.transaction_amount);
      monthData.deposits += Math.abs(transaction.transaction_amount);
    } else if (transaction.transaction_type?.toUpperCase() === 'SELL') {
      runningBalance += transaction.transaction_amount;
      monthData.income += transaction.transaction_amount;
    }
    
    monthData.balance = runningBalance;
  });
  
  return Array.from(monthlyData.values()).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    if (currency && /^[A-Z]{3}$/.test(currency)) {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    }
  } catch (_) {
    // Fallback below
  }
  const symbolMap = { USD: '$', EUR: '€', GBP: '£', PLN: 'zł', JPY: '¥', CHF: 'CHF', CAD: 'CA$', AUD: 'A$', NZD: 'NZ$', SEK: 'kr', NOK: 'kr', DKK: 'kr' };
  const sym = symbolMap[currency] || '$';
  return `${sym}${value.toFixed(2)}`;
};

/**
 * Format date string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
