import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FinanceManager from '../../FinanceManager';
import { AuthProvider } from '../../../../contexts/AuthContext';

// Mock the API
jest.mock('../../../../services/api', () => ({
  getWallets: jest.fn(),
  getTransactionsByWallet: jest.fn(),
  getWalletTransactionErrors: jest.fn(),
  createWallet: jest.fn(),
  deleteWallet: jest.fn(),
  uploadTransactions: jest.fn(),
}));

// Mock the logger
jest.mock('../../../../services/logger', () => ({
  wallet: jest.fn(),
  transaction: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const theme = createTheme();

// Mock data
const mockWallets = [
  {
    id: 'wallet-1',
    name: 'Test Wallet',
    balance: 1000,
    transactions: [],
    totalTransactionCount: 0
  }
];

const generateMockTransactions = (count, walletId = 'wallet-1') => {
  return Array.from({ length: count }, (_, index) => ({
    id: `txn-${index + 1}`,
    wallet_id: walletId,
    transaction_amount: Math.random() * 1000 - 500,
    transaction_date: new Date(2024, 0, index + 1).toISOString(),
    description: `Transaction ${index + 1}`,
    category: index % 2 === 0 ? 'Income' : 'Expense',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('FinanceManager Pagination Integration', () => {
  const { getWallets, getTransactionsByWallet, getWalletTransactionErrors } = require('../../../../services/api');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful wallet fetch
    getWallets.mockResolvedValue({
      wallets: mockWallets,
      count: 1
    });

    // Mock wallet transaction errors (empty)
    getWalletTransactionErrors.mockResolvedValue({
      errors: []
    });
  });

  describe('Large dataset handling (132+ transactions)', () => {
    it('should load all 132 transactions with high limit', async () => {
      const allTransactions = generateMockTransactions(132);
      
      // Mock API response with all transactions
      getTransactionsByWallet.mockResolvedValue({
        transactions: allTransactions,
        total_count: 132,
        total_pages: 1,
        page: 1,
        limit: 1000,
        has_next: false,
        has_prev: false
      });

      renderWithProviders(<FinanceManager />);

      // Wait for wallets to load
      await waitFor(() => {
        expect(screen.getByText('Test Wallet')).toBeInTheDocument();
      });

      // Click on wallet to load transactions
      fireEvent.click(screen.getByText('Test Wallet'));

      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText('1-132 of 132')).toBeInTheDocument();
      });

      // Verify API was called with high limit
      expect(getTransactionsByWallet).toHaveBeenCalledWith('wallet-1', 1, 1000);
    });

    it('should handle pagination for large dataset when limit is lower', async () => {
      const firstPageTransactions = generateMockTransactions(100);
      
      // Mock API response for first page
      getTransactionsByWallet.mockResolvedValue({
        transactions: firstPageTransactions,
        total_count: 132,
        total_pages: 2,
        page: 1,
        limit: 100,
        has_next: true,
        has_prev: false
      });

      renderWithProviders(<FinanceManager />);

      // Wait for wallets to load and select wallet
      await waitFor(() => {
        expect(screen.getByText('Test Wallet')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Wallet'));

      // Wait for first page to load
      await waitFor(() => {
        expect(screen.getByText('1-100 of 132')).toBeInTheDocument();
      });

      // Click next page
      const nextButton = screen.getByLabelText('Go to next page');
      fireEvent.click(nextButton);

      // Mock second page response
      const secondPageTransactions = generateMockTransactions(32);
      getTransactionsByWallet.mockResolvedValue({
        transactions: secondPageTransactions,
        total_count: 132,
        total_pages: 2,
        page: 2,
        limit: 100,
        has_next: false,
        has_prev: true
      });

      // Wait for second page to load
      await waitFor(() => {
        expect(screen.getByText('101-132 of 132')).toBeInTheDocument();
      });

      // Verify API was called for second page
      expect(getTransactionsByWallet).toHaveBeenCalledWith('wallet-1', 2, 100);
    });
  });

  describe('Rows per page changes', () => {
    it('should handle changing rows per page to show all transactions', async () => {
      const allTransactions = generateMockTransactions(132);
      
      // Initial load with 100 limit
      getTransactionsByWallet.mockResolvedValueOnce({
        transactions: allTransactions.slice(0, 100),
        total_count: 132,
        total_pages: 2,
        page: 1,
        limit: 100,
        has_next: true,
        has_prev: false
      });

      renderWithProviders(<FinanceManager />);

      // Load wallet
      await waitFor(() => {
        expect(screen.getByText('Test Wallet')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Wallet'));

      await waitFor(() => {
        expect(screen.getByText('1-100 of 132')).toBeInTheDocument();
      });

      // Change rows per page to 1000
      const rowsPerPageSelect = screen.getByDisplayValue('100');
      fireEvent.mouseDown(rowsPerPageSelect);
      
      const option1000 = screen.getByText('1000');
      fireEvent.click(option1000);

      // Mock response with all transactions
      getTransactionsByWallet.mockResolvedValue({
        transactions: allTransactions,
        total_count: 132,
        total_pages: 1,
        page: 1,
        limit: 1000,
        has_next: false,
        has_prev: false
      });

      // Wait for all transactions to load
      await waitFor(() => {
        expect(screen.getByText('1-132 of 132')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      getTransactionsByWallet.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<FinanceManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Wallet')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Wallet'));

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });
});
