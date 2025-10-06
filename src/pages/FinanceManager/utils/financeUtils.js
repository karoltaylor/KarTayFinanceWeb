/**
 * Calculate statistics for a list of transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Statistics object with income and expenses
 */
export const calculateStats = (transactions) => {
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return { income, expenses };
};

/**
 * Calculate overall statistics across all wallets
 * @param {Array} wallets - Array of wallet objects
 * @returns {Object} Overall statistics
 */
export const calculateAllWalletsStats = (wallets) => {
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalTransactions = wallets.reduce((sum, w) => sum + w.transactions.length, 0);
  
  const allTransactions = wallets.flatMap(w => w.transactions);
  const totalIncome = allTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = allTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return { 
    totalBalance, 
    totalTransactions, 
    totalIncome, 
    totalExpenses 
  };
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `$${amount.toFixed(2)}`;
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
